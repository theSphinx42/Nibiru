from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.marketplace import CodeListing, ListingStatus
from app.schemas.marketplace import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
    TransactionResponse,
    DashboardResponse
)
from app.services.marketplace_service import MarketplaceService
from app.utils.rate_limit import rate_limit
from app.utils.ip_whitelist import check_ip_whitelist

router = APIRouter()

@router.post("/listings", response_model=ListingResponse)
@rate_limit(max_requests=50, window_seconds=60)
async def create_listing(
    listing: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new code listing."""
    marketplace_service = MarketplaceService(db)
    return await marketplace_service.create_listing(
        title=listing.title,
        description=listing.description,
        price=listing.price,
        creator_id=current_user.id,
        metadata=listing.metadata
    )

@router.put("/listings/{listing_id}", response_model=ListingResponse)
@rate_limit(max_requests=50, window_seconds=60)
async def update_listing(
    listing_id: int,
    listing: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing code listing."""
    marketplace_service = MarketplaceService(db)
    return await marketplace_service.update_listing(
        listing_id=listing_id,
        creator_id=current_user.id,
        title=listing.title,
        description=listing.description,
        price=listing.price,
        status=listing.status,
        metadata=listing.metadata
    )

@router.delete("/listings/{listing_id}")
@rate_limit(max_requests=50, window_seconds=60)
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a code listing."""
    marketplace_service = MarketplaceService(db)
    return await marketplace_service.delete_listing(
        listing_id=listing_id,
        creator_id=current_user.id
    )

@router.get("/listings", response_model=List[ListingResponse])
@rate_limit(max_requests=100, window_seconds=60)
async def get_listings(
    status: Optional[ListingStatus] = None,
    db: Session = Depends(get_db)
):
    """Get all active code listings."""
    query = db.query(CodeListing)
    if status:
        query = query.filter(CodeListing.status == status)
    return query.all()

@router.get("/listings/{listing_id}", response_model=ListingResponse)
@rate_limit(max_requests=100, window_seconds=60)
async def get_listing(
    listing_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific code listing."""
    listing = db.query(CodeListing).filter(CodeListing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    return listing

@router.post("/listings/{listing_id}/purchase")
@rate_limit(max_requests=50, window_seconds=60)
async def create_purchase_intent(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a purchase intent for a listing."""
    marketplace_service = MarketplaceService(db)
    return await marketplace_service.create_purchase_intent(
        listing_id=listing_id,
        buyer_id=current_user.id
    )

@router.post("/transactions/{transaction_id}/confirm")
@rate_limit(max_requests=50, window_seconds=60)
@check_ip_whitelist
async def confirm_payment(
    transaction_id: int,
    payment_intent_id: str,
    db: Session = Depends(get_db)
):
    """Confirm a successful payment and generate invocation key."""
    marketplace_service = MarketplaceService(db)
    return await marketplace_service.handle_payment_success(
        payment_intent_id=payment_intent_id,
        transaction_id=transaction_id
    )

@router.get("/creator/dashboard", response_model=DashboardResponse)
@rate_limit(max_requests=100, window_seconds=60)
async def get_creator_dashboard(
    listing_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get creator dashboard data."""
    marketplace_service = MarketplaceService(db)
    return await marketplace_service.get_creator_dashboard(
        creator_id=current_user.id,
        listing_id=listing_id
    )

@router.post("/keys/{key_id}/revoke")
@rate_limit(max_requests=50, window_seconds=60)
async def revoke_key(
    key_id: int,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke an invocation key."""
    marketplace_service = MarketplaceService(db)
    return await marketplace_service.revoke_key(
        key_id=key_id,
        creator_id=current_user.id,
        reason=reason
    ) 