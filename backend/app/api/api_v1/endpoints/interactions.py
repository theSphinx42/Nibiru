from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.auth import get_current_active_user
from app.models.user import User
from app.services.quantum_score import QuantumScoreService

router = APIRouter()
score_service = QuantumScoreService()

class InteractionEvent(BaseModel):
    listing_id: str
    event_type: str
    timestamp: Optional[datetime]

class VisualEffects(BaseModel):
    score: float
    effects: Dict[str, Dict]

@router.post("/listings/interaction", response_model=Dict)
async def record_interaction(
    event: InteractionEvent,
    current_user: Optional[User] = Depends(get_current_active_user)
) -> Dict:
    """Record a listing interaction event."""
    try:
        user_id = str(current_user.id) if current_user else None
        await score_service.record_event(
            event.listing_id,
            event.event_type,
            user_id
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to record interaction: {str(e)}"
        )

@router.get("/listings/{listing_id}/effects", response_model=VisualEffects)
async def get_listing_effects(listing_id: str) -> VisualEffects:
    """Get visual effects for a listing based on its quantum score."""
    try:
        effects = await score_service.get_visual_effects(listing_id)
        return VisualEffects(**effects)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get visual effects: {str(e)}"
        )

@router.get("/listings/top", response_model=List[Dict])
async def get_top_listings(limit: int = 10) -> List[Dict]:
    """Get top listings by quantum score."""
    try:
        return await score_service.get_top_listings(limit)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get top listings: {str(e)}"
        )

@router.get("/listings/{listing_id}/history")
async def get_listing_history(
    listing_id: str,
    event_type: Optional[str] = None,
    start_time: Optional[float] = None,
    end_time: Optional[float] = None
) -> List[Dict]:
    """Get interaction history for a listing."""
    try:
        return await score_service.get_event_history(
            listing_id,
            event_type,
            start_time,
            end_time
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get event history: {str(e)}"
        ) 