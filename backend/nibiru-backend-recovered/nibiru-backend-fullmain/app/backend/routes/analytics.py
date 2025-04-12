from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, List, Optional
from datetime import timedelta
from ..services.analytics_service import AnalyticsService
from ..auth import get_current_user
from ..models.user import User

router = APIRouter()
analytics_service = AnalyticsService()

@router.get("/trends")
async def get_success_failure_trends(
    time_range: int = Query(30, description="Time range in days"),
    group_by: str = Query("backend", description="Group by: backend, script, or user"),
    current_user: User = Depends(get_current_user)
) -> Dict:
    """Get success/failure trends over time"""
    try:
        return analytics_service.get_success_failure_trends(
            time_range=timedelta(days=time_range),
            group_by=group_by
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/retry-heatmap")
async def get_retry_heatmap(
    time_range: int = Query(30, description="Time range in days"),
    dimension: str = Query("backend", description="Dimension: backend or script"),
    current_user: User = Depends(get_current_user)
) -> Dict:
    """Get retry heatmap data"""
    try:
        return analytics_service.get_retry_heatmap(
            time_range=timedelta(days=time_range),
            dimension=dimension
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/aggregate")
async def get_aggregate_metrics(
    time_range: int = Query(30, description="Time range in days"),
    current_user: User = Depends(get_current_user)
) -> Dict:
    """Get aggregate metrics"""
    try:
        return analytics_service.get_aggregate_metrics(
            time_range=timedelta(days=time_range)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/costs")
async def get_cost_analytics(
    time_range: int = Query(30, description="Time range in days"),
    current_user: User = Depends(get_current_user)
) -> Dict:
    """Get cost analytics"""
    try:
        return analytics_service.cost_analytics.get_cost_breakdown(
            current_user.id,
            time_range=timedelta(days=time_range)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 