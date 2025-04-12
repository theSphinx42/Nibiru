from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
from app.core.auth import get_current_active_user, get_admin_user
from app.models.user import User
from app.models.custodial import CustodialStatus, CustodialMetadata
from app.services.custodian import CustodianService

router = APIRouter()
custodian_service = CustodianService()

@router.post("/check", response_model=List[str])
async def check_listings_for_custodianship(
    background_tasks: BackgroundTasks,
    admin: User = Depends(get_admin_user)
) -> List[str]:
    """
    Trigger a check for listings that meet custodianship criteria.
    Returns list of listing IDs that were converted.
    Admin only endpoint.
    """
    try:
        # Run check in background
        background_tasks.add_task(custodian_service.check_listings_for_custodianship)
        return []
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initiate custodianship check: {str(e)}"
        )

@router.post("/{listing_id}/request-recovery")
async def request_listing_recovery(
    listing_id: str,
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """Request recovery of a custodial listing by original owner."""
    try:
        success = await custodian_service.request_recovery(
            listing_id=listing_id,
            user_id=current_user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=400,
                detail="Invalid recovery request"
            )
            
        return {
            "message": "Recovery request submitted successfully",
            "listing_id": listing_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to request recovery: {str(e)}"
        )

@router.post("/{listing_id}/approve-recovery")
async def approve_listing_recovery(
    listing_id: str,
    admin: User = Depends(get_admin_user)
) -> dict:
    """Approve a recovery request and return listing to original owner."""
    try:
        success = await custodian_service.approve_recovery(listing_id)
        
        if not success:
            raise HTTPException(
                status_code=400,
                detail="Invalid recovery approval request"
            )
            
        return {
            "message": "Recovery approved successfully",
            "listing_id": listing_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to approve recovery: {str(e)}"
        )

@router.get("/{listing_id}/status")
async def get_custodial_status(
    listing_id: str,
    current_user: User = Depends(get_current_active_user)
) -> CustodialMetadata:
    """Get custodial status of a listing."""
    try:
        listing = await custodian_service._get_listing(listing_id)
        
        if not listing or not hasattr(listing, 'custodial_metadata'):
            raise HTTPException(
                status_code=404,
                detail="Listing not found or not under custodianship"
            )
            
        return listing.custodial_metadata
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get custodial status: {str(e)}"
        ) 