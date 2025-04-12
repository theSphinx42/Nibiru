from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.invocation_key import InvocationKey, KeyStatus
from app.models.user import User
from app.schemas.invocation_key import (
    InvocationKeyCreate,
    InvocationKeyResponse,
    InvocationKeyRedeem,
    InvocationKeyActivate
)
from app.services.invocation_key_service import InvocationKeyService
from app.core.security import get_current_user
from app.services.saphira_service import SaphiraService

router = APIRouter()

@router.post("/", response_model=InvocationKeyResponse)
async def create_invocation_key(
    key_data: InvocationKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new invocation key for a code listing."""
    key_service = InvocationKeyService(db)
    
    # Create the key
    invocation_key = key_service.create_invocation_key(
        code_listing=key_data.code_listing,
        user=current_user,
        usage_limit=key_data.usage_limit,
        expiration_days=key_data.expiration_days,
        metadata=key_data.metadata
    )
    
    return invocation_key

@router.post("/redeem", response_model=InvocationKeyResponse)
async def redeem_invocation_key(
    redeem_data: InvocationKeyRedeem,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Redeem an invocation key to access code content."""
    key_service = InvocationKeyService(db)
    
    # Validate and use the key
    key = key_service.use_key(redeem_data.key_hash)
    if not key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invocation key"
        )
    
    # Verify glyph hash if provided
    if redeem_data.glyph_hash:
        saphira_service = SaphiraService()
        if not saphira_service.validate_spirit_glyph(
            redeem_data.glyph_hash,
            key.code_listing.content
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid glyph hash"
            )
    
    return key

@router.post("/activate", response_model=InvocationKeyResponse)
async def activate_invocation_key(
    activate_data: InvocationKeyActivate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activate an invocation key."""
    key_service = InvocationKeyService(db)
    
    key = key_service.activate_key(activate_data.key_hash)
    if not key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invocation key"
        )
    
    return key

@router.post("/revoke", response_model=InvocationKeyResponse)
async def revoke_invocation_key(
    key_hash: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke an invocation key."""
    key_service = InvocationKeyService(db)
    
    key = key_service.revoke_key(key_hash)
    if not key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invocation key not found"
        )
    
    return key

@router.get("/my-keys", response_model=List[InvocationKeyResponse])
async def get_my_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all invocation keys for the current user."""
    key_service = InvocationKeyService(db)
    return key_service.get_user_keys(current_user.id)

@router.get("/listing/{listing_id}", response_model=List[InvocationKeyResponse])
async def get_listing_keys(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all invocation keys for a specific listing."""
    key_service = InvocationKeyService(db)
    return key_service.get_listing_keys(listing_id) 