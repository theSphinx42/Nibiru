from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body, Response
from typing import Optional, List, Dict, Any
from ..models.user import ProfileSettings, ProfileUpdate, QRCodeData
from ..services.profile_service import ProfileService
from ..auth import get_current_user
from ..models.user import User
from ..config import settings
import logging
import aiofiles
import os
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()
profile_service = ProfileService()

@router.on_event("startup")
async def startup_event():
    """Initialize profile service on startup."""
    await profile_service.connect()

@router.get("/profile", response_model=ProfileSettings)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's profile."""
    profile = await profile_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("/profile/sigil/{user_id}")
async def get_sigil_image(
    user_id: str,
    animated: bool = False
):
    """Get the sigil image for a user."""
    sigil_image = await profile_service.get_sigil_image(user_id, animated=animated)
    if not sigil_image:
        raise HTTPException(status_code=404, detail="Sigil not found")
    
    media_type = "image/gif" if animated else "image/png"
    return Response(content=sigil_image, media_type=media_type)

@router.put("/profile", response_model=ProfileSettings)
async def update_profile(
    update: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update the current user's profile."""
    current_profile = await profile_service.get_profile(current_user.id)
    if not current_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    updated_profile = await profile_service.update_profile(
        current_user.id,
        update,
        current_profile
    )
    if not updated_profile:
        raise HTTPException(status_code=400, detail="Failed to update profile")
    return updated_profile

@router.post("/profile/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a new avatar for the current user."""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create avatars directory if it doesn't exist
    avatars_dir = os.path.join(settings.MEDIA_ROOT, "avatars")
    os.makedirs(avatars_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"avatar_{current_user.id}_{timestamp}{os.path.splitext(file.filename)[1]}"
    filepath = os.path.join(avatars_dir, filename)
    
    # Save file
    async with aiofiles.open(filepath, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # Update profile with new avatar URL
    avatar_url = f"/media/avatars/{filename}"
    update = ProfileUpdate(avatar_url=avatar_url)
    current_profile = await profile_service.get_profile(current_user.id)
    
    updated_profile = await profile_service.update_profile(
        current_user.id,
        update,
        current_profile
    )
    if not updated_profile:
        raise HTTPException(status_code=400, detail="Failed to update avatar")
    
    return {"avatar_url": avatar_url}

@router.post("/profile/background")
async def upload_background(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a new background image for the current user."""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create backgrounds directory if it doesn't exist
    backgrounds_dir = os.path.join(settings.MEDIA_ROOT, "backgrounds")
    os.makedirs(backgrounds_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"background_{current_user.id}_{timestamp}{os.path.splitext(file.filename)[1]}"
    filepath = os.path.join(backgrounds_dir, filename)
    
    # Save file
    async with aiofiles.open(filepath, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # Update profile with new background URL
    background_url = f"/media/backgrounds/{filename}"
    update = ProfileUpdate(background_url=background_url)
    current_profile = await profile_service.get_profile(current_user.id)
    
    updated_profile = await profile_service.update_profile(
        current_user.id,
        update,
        current_profile
    )
    if not updated_profile:
        raise HTTPException(status_code=400, detail="Failed to update background")
    
    return {"background_url": background_url}

@router.post("/profile/qr-code", response_model=QRCodeData)
async def generate_qr_code(current_user: User = Depends(get_current_user)):
    """Generate a new QR code for the current user."""
    qr_code = await profile_service.generate_qr_code(current_user.id)
    if not qr_code:
        raise HTTPException(status_code=400, detail="Failed to generate QR code")
    return qr_code

@router.get("/profile/qr-codes", response_model=List[QRCodeData])
async def get_qr_codes(current_user: User = Depends(get_current_user)):
    """Get all QR codes for the current user."""
    return await profile_service.get_user_qr_codes(current_user.id)

@router.delete("/profile/qr-codes/{qr_id}")
async def deactivate_qr_code(
    qr_id: int,
    current_user: User = Depends(get_current_user)
):
    """Deactivate a QR code."""
    success = await profile_service.deactivate_qr_code(qr_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="QR code not found")
    return {"message": "QR code deactivated successfully"}

@router.post("/profile/qr/verify/{verification_token}")
async def verify_qr_code(
    verification_token: str,
    current_user: User = Depends(get_current_user)
):
    """Verify a QR code."""
    result = await profile_service.verify_qr_code(
        current_user.id,
        verification_token
    )
    if not result:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    return {"status": "verified"}

@router.post("/profile/qr-codes/initiate-verification")
async def initiate_verification(
    internal_id: str = Body(...),
    public_name: str = Body(...)
):
    """Initiate a verification process for a QR code."""
    verification_data = await profile_service.initiate_verification(
        internal_id,
        public_name
    )
    if not verification_data:
        raise HTTPException(status_code=404, detail="Invalid QR code")
    return verification_data 