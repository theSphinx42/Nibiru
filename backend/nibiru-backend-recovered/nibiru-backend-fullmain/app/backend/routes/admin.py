from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
from datetime import datetime
from ..models.constellation import (
    Ad,
    AdCreate,
    AdUpdate,
    AdStats
)
from ..services.ad_service import AdService
from ..auth import get_current_user, require_admin
from ..models.user import User

router = APIRouter()
ad_service = AdService()

@router.post("/ads", response_model=Ad)
async def create_ad(
    ad: AdCreate,
    current_user: User = Depends(require_admin)
):
    """Create a new ad."""
    try:
        created_ad = await ad_service.create_ad(ad.dict(), current_user.id)
        if not created_ad:
            raise HTTPException(status_code=500, detail="Failed to create ad")
        return created_ad
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/ads/{ad_id}", response_model=Ad)
async def update_ad(
    ad_id: str,
    ad_update: AdUpdate,
    current_user: User = Depends(require_admin)
):
    """Update an existing ad."""
    try:
        updated_ad = await ad_service.update_ad(ad_id, ad_update.dict(exclude_unset=True), current_user.id)
        if not updated_ad:
            raise HTTPException(status_code=404, detail="Ad not found")
        return updated_ad
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/ads/{ad_id}")
async def delete_ad(
    ad_id: str,
    current_user: User = Depends(require_admin)
):
    """Delete an ad."""
    try:
        success = await ad_service.delete_ad(ad_id)
        if not success:
            raise HTTPException(status_code=404, detail="Ad not found")
        return {"message": "Ad deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ads/{ad_id}", response_model=Ad)
async def get_ad(
    ad_id: str,
    current_user: User = Depends(require_admin)
):
    """Get an ad by ID."""
    try:
        ad = await ad_service.get_ad(ad_id)
        if not ad:
            raise HTTPException(status_code=404, detail="Ad not found")
        return ad
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ads", response_model=List[Ad])
async def list_ads(
    current_user: User = Depends(require_admin)
):
    """List all ads."""
    try:
        ads = await ad_service.get_active_ads()
        return ads
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ads/{ad_id}/stats", response_model=AdStats)
async def get_ad_stats(
    ad_id: str,
    current_user: User = Depends(require_admin)
):
    """Get statistics for an ad."""
    try:
        stats = await ad_service.get_ad_stats(ad_id)
        if not stats:
            raise HTTPException(status_code=404, detail="Ad not found")
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ads/{ad_id}/impression")
async def record_impression(
    ad_id: str,
    user_id: str,
    context: Optional[dict] = None,
    current_user: User = Depends(require_admin)
):
    """Record an ad impression."""
    try:
        await ad_service.record_impression(ad_id, user_id, context)
        return {"message": "Impression recorded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ads/{ad_id}/click")
async def record_click(
    ad_id: str,
    user_id: str,
    context: Optional[dict] = None,
    current_user: User = Depends(require_admin)
):
    """Record an ad click."""
    try:
        await ad_service.record_click(ad_id, user_id, context)
        return {"message": "Click recorded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ads/{ad_id}/conversion")
async def record_conversion(
    ad_id: str,
    user_id: str,
    context: Optional[dict] = None,
    current_user: User = Depends(require_admin)
):
    """Record an ad conversion."""
    try:
        await ad_service.record_conversion(ad_id, user_id, context)
        return {"message": "Conversion recorded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 