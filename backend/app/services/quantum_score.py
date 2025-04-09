from typing import Dict, List, Optional
import redis
import json
from datetime import datetime, timedelta

class QuantumScoreService:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)
        
        # Event weights for score calculation
        self.EVENT_WEIGHTS = {
            'view': 1,
            'purchase': 50,
            'favorite': 5,
            'share': 3,
            'download': 10,
            'review': 15
        }
        
        # Visual effect thresholds
        self.VISUAL_EFFECTS = {
            'glow': {
                'threshold': 100,
                'strength': lambda score: min(score / 200, 1.5)
            },
            'sparkle': {
                'threshold': 250,
                'strength': lambda score: min((score - 250) / 300, 1.0)
            },
            'aura': {
                'threshold': 500,
                'strength': lambda score: min((score - 500) / 500, 1.0)
            },
            'mythic': {
                'threshold': 1000,
                'level': lambda score: min(int((score - 1000) / 500), 5)
            }
        }

    async def record_event(self, listing_id: str, event_type: str, user_id: Optional[str] = None) -> None:
        """Record an interaction event for a listing."""
        timestamp = datetime.utcnow().timestamp()
        
        # Store event in time series
        event_key = f"listing:{listing_id}:events"
        event_data = json.dumps({
            'type': event_type,
            'timestamp': timestamp,
            'user_id': user_id
        })
        
        # Use Redis pipeline for atomic operations
        pipe = self.redis.pipeline()
        
        # Add event to time series
        pipe.zadd(event_key, {event_data: timestamp})
        
        # Increment event counter
        pipe.hincrby(f"listing:{listing_id}:counts", event_type, 1)
        
        # Update last interaction timestamp
        pipe.hset(f"listing:{listing_id}:meta", "last_interaction", timestamp)
        
        # Execute pipeline
        pipe.execute()
        
        # Recalculate score asynchronously
        await self.calculate_score(listing_id)

    async def calculate_score(self, listing_id: str) -> float:
        """Calculate quantum score based on weighted events and time decay."""
        # Get event counts
        counts = self.redis.hgetall(f"listing:{listing_id}:counts")
        if not counts:
            return 0.0
            
        # Calculate base score from event weights
        base_score = sum(
            int(count) * self.EVENT_WEIGHTS.get(event_type, 1)
            for event_type, count in counts.items()
        )
        
        # Apply time decay (90% retention per month)
        last_interaction = float(self.redis.hget(f"listing:{listing_id}:meta", "last_interaction") or 0)
        if last_interaction:
            months_since = (datetime.utcnow().timestamp() - last_interaction) / (30 * 24 * 3600)
            time_multiplier = 0.9 ** months_since
            base_score *= time_multiplier
        
        # Store calculated score
        self.redis.hset(f"listing:{listing_id}:meta", "quantum_score", base_score)
        
        return base_score

    async def get_visual_effects(self, listing_id: str) -> Dict:
        """Get visual effects based on quantum score."""
        score = float(self.redis.hget(f"listing:{listing_id}:meta", "quantum_score") or 0)
        
        effects = {
            'score': score,
            'effects': {}
        }
        
        for effect, config in self.VISUAL_EFFECTS.items():
            if score >= config['threshold']:
                if effect == 'mythic':
                    effects['effects'][effect] = {
                        'enabled': True,
                        'level': config['level'](score)
                    }
                else:
                    effects['effects'][effect] = {
                        'enabled': True,
                        'strength': config['strength'](score)
                    }
            else:
                effects['effects'][effect] = {
                    'enabled': False
                }
        
        return effects

    async def get_top_listings(self, limit: int = 10) -> List[Dict]:
        """Get top listings by quantum score."""
        # Scan all listing meta keys
        listings = []
        pattern = "listing:*:meta"
        
        for key in self.redis.scan_iter(match=pattern):
            listing_id = key.split(":")[1]
            score = float(self.redis.hget(key, "quantum_score") or 0)
            listings.append({
                'listing_id': listing_id,
                'score': score
            })
        
        # Sort by score and return top N
        return sorted(listings, key=lambda x: x['score'], reverse=True)[:limit]

    async def get_event_history(
        self, 
        listing_id: str, 
        event_type: Optional[str] = None,
        start_time: Optional[float] = None,
        end_time: Optional[float] = None
    ) -> List[Dict]:
        """Get event history for a listing with optional filters."""
        event_key = f"listing:{listing_id}:events"
        
        # Get time range
        if not start_time:
            start_time = 0
        if not end_time:
            end_time = datetime.utcnow().timestamp()
        
        # Get events within time range
        events = self.redis.zrangebyscore(
            event_key,
            start_time,
            end_time,
            withscores=True
        )
        
        # Parse and filter events
        result = []
        for event_data, timestamp in events:
            event = json.loads(event_data)
            if not event_type or event['type'] == event_type:
                event['timestamp'] = timestamp
                result.append(event)
        
        return result 