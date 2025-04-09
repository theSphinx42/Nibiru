from fastapi import HTTPException, Depends, status
from typing import Optional
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.listing import Listing
from app.db.session import get_db
from sqlalchemy.orm import Session

async def check_tier_access(
    listing_id: str,
    user: Optional[User] = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> bool:
    """
    Check if a user has sufficient tier access for a listing.
    Returns True if access is granted, raises HTTPException if denied.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )

    # Always allow access to Tier 1 listings
    if listing.glyph_tier == 1:
        return True

    # Must be logged in for Tier 2+
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": "Authentication required for this content",
                "required_tier": listing.glyph_tier,
                "upgrade_options": ["login", "create_account"]
            }
        )

    # Tier 2 Access Rules
    if listing.glyph_tier == 2:
        if user.is_creator or user.subscription_status == "active":
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Creator status or paid account required",
                "required_tier": 2,
                "current_tier": 1,
                "upgrade_options": ["become_creator", "subscribe"]
            }
        )

    # Tier 3 Access Rules
    if listing.glyph_tier == 3:
        if user.is_admin:
            return True
        if user.quantum_score >= 75:  # Threshold for Tier 3
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Advanced access required",
                "required_tier": 3,
                "current_tier": 2 if user.is_creator else 1,
                "quantum_score": user.quantum_score,
                "required_score": 75,
                "upgrade_options": ["increase_quantum_score", "request_admin_override"]
            }
        )

    return True

def simulate_tier_check(
    required_tier: int,
    user_tier: int,
    quantum_score: Optional[float] = None
) -> dict:
    """
    Simulate tier check for frontend testing without making actual DB calls.
    Returns access status and relevant messages/options.
    """
    if required_tier == 1:
        return {
            "access_granted": True,
            "tier": 1,
            "message": "Public access granted"
        }

    if not user_tier:
        return {
            "access_granted": False,
            "tier": 0,
            "required_tier": required_tier,
            "message": "Authentication required",
            "upgrade_options": ["login", "create_account"]
        }

    if required_tier == 2 and user_tier < 2:
        return {
            "access_granted": False,
            "tier": user_tier,
            "required_tier": 2,
            "message": "Creator status or paid account required",
            "upgrade_options": ["become_creator", "subscribe"]
        }

    if required_tier == 3:
        if user_tier < 3 and (quantum_score is None or quantum_score < 75):
            return {
                "access_granted": False,
                "tier": user_tier,
                "required_tier": 3,
                "quantum_score": quantum_score,
                "required_score": 75,
                "message": "Advanced access required",
                "upgrade_options": ["increase_quantum_score", "request_admin_override"]
            }

    return {
        "access_granted": True,
        "tier": user_tier,
        "message": "Access granted"
    } 