from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.listing import InvocationKey, LicenseTier
from app.services.invocation import InvocationService

router = APIRouter()
invocation_service = InvocationService()

class KeyRequest(BaseModel):
    listing_id: str
    license_tier: LicenseTier
    max_invocations: Optional[int]
    expiry_days: Optional[int]

class InvocationRequest(BaseModel):
    key_id: str
    listing_id: str
    path_type: str

@router.post("/keys/generate", response_model=InvocationKey)
async def generate_key(
    request: KeyRequest,
    current_user: User = Depends(get_current_active_user)
) -> InvocationKey:
    """Generate a new invocation key for a listing."""
    try:
        # TODO: Verify user owns listing or has permission to generate keys
        
        key = await invocation_service.generate_key(
            listing_id=request.listing_id,
            user_id=str(current_user.id),
            license_tier=request.license_tier,
            max_invocations=request.max_invocations,
            expiry_days=request.expiry_days
        )
        
        return key
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate key: {str(e)}"
        )

@router.get("/keys/{key_id}", response_model=Dict)
async def get_key_info(
    key_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """Get information about an invocation key."""
    try:
        key_info = await invocation_service.get_key_info(key_id)
        if not key_info:
            raise HTTPException(
                status_code=404,
                detail="Key not found"
            )
            
        # TODO: Verify user owns key or listing
        
        return key_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get key info: {str(e)}"
        )

@router.post("/invoke", response_model=Dict)
async def invoke_listing(
    request: InvocationRequest,
    client_request: Request,
    current_user: Optional[User] = Depends(get_current_active_user)
) -> Dict:
    """Invoke a listing with a key."""
    try:
        # Get client IP
        client_ip = client_request.client.host
        
        # Validate key
        is_valid = await invocation_service.validate_key(
            key_id=request.key_id,
            listing_id=request.listing_id,
            user_id=str(current_user.id) if current_user else "anonymous",
            ip_address=client_ip
        )
        
        if not is_valid:
            raise HTTPException(
                status_code=403,
                detail="Invalid or expired key"
            )
        
        # Get payload path
        payload_path = await invocation_service.get_payload_path(
            listing_id=request.listing_id,
            key_id=request.key_id,
            path_type=request.path_type
        )
        
        if not payload_path:
            raise HTTPException(
                status_code=404,
                detail="Payload not found"
            )
        
        # Return payload path (will be handled by middleware for security)
        return {
            "status": "success",
            "payload_path": payload_path
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to invoke listing: {str(e)}"
        ) 