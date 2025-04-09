from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks
from typing import List, Dict, Optional
import json
import redis
from datetime import datetime, timedelta
import asyncio
from functools import lru_cache
from ..services.analytics_service import AnalyticsService
from ..services.ad_service import AdService
from ..models.user import User
from ..models.constellation import (
    UserConstellationData,
    LeaderboardUser,
    NetworkNode,
    UserNetwork,
    ConstellationTheme,
    EventType,
    NetworkTier,
    QuantumMilestoneEvent,
    FirstAchievementEvent,
    NetworkPath,
    AchievementBadge,
    Ad,
    UserAdResponse
)
from ..auth import get_current_user
from ..config import settings

router = APIRouter()
analytics_service = AnalyticsService()
ad_service = AdService()

# Redis connection for pub/sub and caching
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=0,
    decode_responses=True
)

# Cache TTLs (in seconds)
CACHE_TTL = {
    "leaderboard": 300,  # 5 minutes
    "network_map": 600,  # 10 minutes
    "achievements": 3600,  # 1 hour
    "user_metrics": 300,  # 5 minutes
}

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

@router.get("/user-constellation-data")
async def get_user_constellation_data(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get user's constellation data including quantum score, rank, and affinity."""
    try:
        # Get user metrics from analytics service
        user_metrics = await analytics_service.get_user_metrics(user_id)
        
        # Calculate streak
        streak_days = await analytics_service.get_user_streak(user_id)
        
        # Get user's affinity
        affinity = await analytics_service.get_user_affinity(user_id)
        
        return {
            "name": current_user.name,
            "quantum_score": user_metrics.quantum_score,
            "rank": user_metrics.rank,
            "total_users": await analytics_service.get_total_users(),
            "affinity": affinity,
            "streak_days": streak_days
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/network-travel-map/{user_id}")
async def get_network_travel_map(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get network travel map for micro-ship visualization."""
    try:
        # Try to get from cache first
        cache_key = f"network_map:{user_id}"
        cached_data = await redis_client.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        
        # Generate new map if not in cache
        travel_map = await analytics_service.get_network_travel_map(user_id)
        
        # Cache the result
        await redis_client.setex(
            cache_key,
            CACHE_TTL["network_map"],
            json.dumps(travel_map)
        )
        
        return travel_map
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/achievement-badges/{user_id}")
async def get_achievement_badges(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get user's achievement badges."""
    try:
        # Try to get from cache first
        cache_key = f"achievements:{user_id}"
        cached_data = await redis_client.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        
        # Get badges if not in cache
        badges = await analytics_service.get_achievement_badges(user_id)
        
        # Cache the result
        await redis_client.setex(
            cache_key,
            CACHE_TTL["achievements"],
            json.dumps([badge.dict() for badge in badges])
        )
        
        return badges
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leaderboard-constellation")
async def get_leaderboard_constellation(
    background_tasks: BackgroundTasks
):
    """Get top 100 users for constellation map overlay with caching."""
    try:
        # Try to get from cache first
        cache_key = "leaderboard:top100"
        cached_data = await redis_client.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        
        # Get fresh leaderboard data
        leaderboard = await analytics_service.get_leaderboard(limit=100)
        
        # Check for black hole access
        total_users = await analytics_service.get_total_users()
        has_black_hole_access = total_users >= 10000
        
        result = {
            "users": [
                {
                    "id": user.id,
                    "name": user.name,
                    "rank": user.rank,
                    "quantum_score": user.quantum_score,
                    "affinity": user.affinity
                }
                for user in leaderboard
            ],
            "has_black_hole_access": has_black_hole_access,
            "last_updated": datetime.utcnow().isoformat()
        }
        
        # Cache the result
        await redis_client.setex(
            cache_key,
            CACHE_TTL["leaderboard"],
            json.dumps(result)
        )
        
        # Schedule background task to check for new top 100 entries
        background_tasks.add_task(
            check_new_top100_entries,
            leaderboard
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-network-nodes")
async def get_user_network_nodes(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get user's network connections for micro-ship pathing."""
    try:
        connections = await analytics_service.get_user_connections(user_id)
        
        return {
            "nodes": [
                {
                    "id": conn.user_id,
                    "name": conn.name,
                    "relationship": conn.relationship_type,
                    "quantum_score": conn.quantum_score,
                    "affinity": conn.affinity
                }
                for conn in connections
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    background_tasks: BackgroundTasks
):
    """WebSocket endpoint for real-time constellation events with enhanced event handling."""
    await manager.connect(websocket, user_id)
    
    try:
        # Subscribe to Redis channels
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(f"user:{user_id}:events")
        await pubsub.subscribe("global:events")
        
        # Schedule background tasks for event monitoring
        background_tasks.add_task(
            monitor_user_events,
            user_id,
            websocket
        )
        
        while True:
            message = await websocket.receive_text()
            # Handle incoming messages if needed
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    finally:
        await pubsub.unsubscribe()

@router.get("/user-network-analysis")
async def get_user_network_analysis(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed network analysis for a user."""
    try:
        network = await analytics_service.get_user_network(user_id)
        
        # Calculate network metrics
        mentor_count = sum(1 for node in network.nodes if node.relationship == NetworkTier.MENTOR)
        peer_count = sum(1 for node in network.nodes if node.relationship == NetworkTier.PEER)
        rival_count = sum(1 for node in network.nodes if node.relationship == NetworkTier.RIVAL)
        
        # Calculate average degrees of separation
        avg_degrees = sum(node.degrees_of_separation for node in network.nodes) / len(network.nodes)
        
        # Calculate network impact factor
        impact_factor = analytics_service.calculate_network_impact(network)
        
        return UserNetwork(
            nodes=network.nodes,
            mentor_count=mentor_count,
            peer_count=peer_count,
            rival_count=rival_count,
            average_degrees_of_separation=avg_degrees,
            network_impact_factor=impact_factor
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/constellation-theme/{user_id}")
async def get_constellation_theme(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get complete constellation theme for a user including visual and mythic elements."""
    try:
        # Get theme data from analytics service
        theme_data = await analytics_service.get_constellation_theme(user_id)
        
        # Add additional metadata
        theme_data.update({
            "generated_at": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "version": "1.0"
        })
        
        return theme_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-ads/{user_id}", response_model=UserAdResponse)
async def get_user_ads(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get personalized ads for a user."""
    try:
        # Get user metrics
        user_metrics = await analytics_service.get_user_metrics(user_id)
        affinity = await analytics_service.get_user_affinity(user_id)
        
        # Check if user has premium subscription
        is_premium = await current_user.is_premium()
        
        # Get personalized ads
        ad_response = await ad_service.get_user_ads(
            user_id=user_id,
            quantum_score=user_metrics["quantum_score"],
            affinity=affinity,
            is_premium=is_premium
        )
        
        return ad_response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Event publishing functions
async def publish_user_event(user_id: str, event_type: EventType, data: dict):
    """Publish a user-specific event."""
    event = {
        "type": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "data": data
    }
    await redis_client.publish(f"user:{user_id}:events", json.dumps(event))
    
    # If it's a significant event, also broadcast to global channel
    if event_type in [
        EventType.RANK_UP,
        EventType.NEW_GLYPH,
        EventType.QUANTUM_MILESTONE,
        EventType.FIRST_LEADERBOARD
    ]:
        await redis_client.publish("global:events", json.dumps(event))

async def publish_quantum_milestone(user_id: str, milestone: int, quantum_score: int, rank: int):
    """Publish a quantum score milestone event."""
    await publish_user_event(
        user_id,
        EventType.QUANTUM_MILESTONE,
        {
            "milestone": milestone,
            "quantum_score": quantum_score,
            "rank_at_milestone": rank
        }
    )

async def publish_first_achievement(user_id: str, achievement_type: str, details: dict):
    """Publish a first achievement event."""
    await publish_user_event(
        user_id,
        EventType(achievement_type),
        {
            "timestamp": datetime.utcnow().isoformat(),
            "details": details
        }
    )

async def publish_streak_event(user_id: str, streak_days: int):
    """Publish a streak event."""
    await publish_user_event(
        user_id,
        EventType.STREAK_UPDATE,
        {
            "streak_days": streak_days,
            "milestone": streak_days % 7 == 0  # Weekly milestone
        }
    )

async def publish_rank_up_event(user_id: str, old_rank: int, new_rank: int):
    """Publish a rank up event."""
    await publish_user_event(
        user_id,
        EventType.RANK_UP,
        {
            "old_rank": old_rank,
            "new_rank": new_rank,
            "improvement": old_rank - new_rank
        }
    )

async def publish_glyph_event(user_id: str, glyph_name: str):
    """Publish a new glyph earned event."""
    await publish_user_event(
        user_id,
        EventType.NEW_GLYPH,
        {
            "glyph_name": glyph_name,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

async def check_new_top100_entries(previous_leaderboard: List[LeaderboardUser]):
    """Background task to check for new top 100 entries."""
    try:
        current_leaderboard = await analytics_service.get_leaderboard(limit=100)
        
        # Find new entries
        previous_ids = {user.id for user in previous_leaderboard}
        new_entries = [
            user for user in current_leaderboard
            if user.id not in previous_ids
        ]
        
        # Publish events for new entries
        for user in new_entries:
            await publish_user_event(
                user.id,
                EventType.FIRST_LEADERBOARD,
                {
                    "rank": user.rank,
                    "quantum_score": user.quantum_score,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
    except Exception as e:
        logger.error(f"Error checking new top 100 entries: {str(e)}")

async def monitor_user_events(user_id: str, websocket: WebSocket):
    """Background task to monitor and process user events."""
    try:
        while True:
            # Check for quantum milestones
            milestone = await analytics_service.check_quantum_milestones(user_id)
            if milestone:
                await websocket.send_json({
                    "type": "quantum_milestone",
                    "data": milestone.dict()
                })
            
            # Check for network impact milestones
            network_milestone = await analytics_service.check_network_impact_milestones(user_id)
            if network_milestone:
                await websocket.send_json({
                    "type": "network_milestone",
                    "data": network_milestone.dict()
                })
            
            # Check for first achievements
            achievements = await analytics_service.check_first_achievements(user_id)
            for achievement in achievements:
                await websocket.send_json({
                    "type": "achievement",
                    "data": achievement.dict()
                })
            
            # Wait before next check
            await asyncio.sleep(60)  # Check every minute
            
    except Exception as e:
        logger.error(f"Error monitoring user events: {str(e)}") 