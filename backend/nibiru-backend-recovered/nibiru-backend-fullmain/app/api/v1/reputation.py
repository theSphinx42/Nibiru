from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.core.rate_limit import rate_limiter, RATE_LIMITS
from app.models.user import User
from app.models.reputation import ContributionType, ContributionSize, BadgeType
from app.schemas.reputation import (
    ReputationUpdate,
    ReputationStats,
    LeaderboardEntry,
    UserReputation,
    MarketplaceTransaction,
    ContributionImpact
)
from app.services.reputation import ReputationService

router = APIRouter()

@router.post("/contributions", response_model=UserReputation)
async def add_contribution(
    request: Request,
    update_data: ReputationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new contribution and update user reputation."""
    # Check rate limit
    await rate_limiter.check_rate_limit(
        request,
        current_user,
        **RATE_LIMITS["contribution"]
    )
    
    service = ReputationService(db)
    await service.add_contribution(current_user.id, update_data)
    return await service.get_or_create_user_reputation(current_user.id)

@router.put("/contributions/{contribution_id}", response_model=UserReputation)
async def update_contribution(
    request: Request,
    contribution_id: int,
    metadata: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing contribution."""
    # Check rate limit
    await rate_limiter.check_rate_limit(
        request,
        current_user,
        **RATE_LIMITS["contribution"]
    )
    
    service = ReputationService(db)
    await service.update_contribution(contribution_id, metadata)
    return await service.get_or_create_user_reputation(current_user.id)

@router.post("/engagement", response_model=UserReputation)
async def add_community_engagement(
    request: Request,
    engagement_type: str,
    points: float,
    metadata: Optional[dict] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record community engagement and update reputation."""
    # Check rate limit
    await rate_limiter.check_rate_limit(
        request,
        current_user,
        **RATE_LIMITS["engagement"]
    )
    
    service = ReputationService(db)
    await service.add_community_engagement(
        current_user.id,
        engagement_type,
        points,
        metadata
    )
    return await service.get_or_create_user_reputation(current_user.id)

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    request: Request,
    category: Optional[str] = None,
    limit: int = Query(100, le=100),
    db: Session = Depends(get_db)
):
    """Get leaderboard entries for a category."""
    # Check rate limit
    await rate_limiter.check_rate_limit(
        request,
        **RATE_LIMITS["leaderboard"]
    )
    
    service = ReputationService(db)
    return await service.get_leaderboard(category, limit)

@router.get("/stats", response_model=ReputationStats)
async def get_user_stats(
    request: Request,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed statistics for a user."""
    # Check rate limit
    await rate_limiter.check_rate_limit(
        request,
        current_user,
        **RATE_LIMITS["stats"]
    )
    
    service = ReputationService(db)
    target_user_id = user_id or current_user.id
    return await service.get_user_stats(target_user_id)

@router.get("/users/{user_id}/reputation", response_model=UserReputation)
async def get_user_reputation(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user reputation details."""
    # Check rate limit
    await rate_limiter.check_rate_limit(
        request,
        **RATE_LIMITS["stats"]
    )
    
    service = ReputationService(db)
    reputation = await service.get_or_create_user_reputation(user_id)
    return reputation

@router.post("/marketplace/transactions", response_model=UserReputation)
async def record_marketplace_transaction(
    request: Request,
    transaction: MarketplaceTransaction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a marketplace transaction and update reputation."""
    # Check rate limit
    await rate_limiter.check_rate_limit(
        request,
        current_user,
        **RATE_LIMITS["contribution"]
    )
    
    service = ReputationService(db)
    await service.record_marketplace_transaction(current_user.id, transaction)
    return await service.get_or_create_user_reputation(current_user.id)

@router.post("/impact", response_model=UserReputation)
async def record_contribution_impact(
    request: Request,
    impact: ContributionImpact,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record impact metrics for a contribution."""
    # Check rate limit
    await rate_limiter.check_rate_limit(
        request,
        current_user,
        **RATE_LIMITS["engagement"]
    )
    
    service = ReputationService(db)
    await service.record_contribution_impact(current_user.id, impact)
    return await service.get_or_create_user_reputation(current_user.id)

@router.get("/categories", response_model=List[str])
async def get_contribution_categories():
    """Get all available contribution categories."""
    return [category.value for category in ContributionType]

@router.get("/sizes", response_model=List[str])
async def get_contribution_sizes():
    """Get all available contribution sizes."""
    return [size.value for size in ContributionSize]

@router.get("/badges", response_model=List[str])
async def get_badge_types():
    """Get all available badge types."""
    return [badge.value for badge in BadgeType] 