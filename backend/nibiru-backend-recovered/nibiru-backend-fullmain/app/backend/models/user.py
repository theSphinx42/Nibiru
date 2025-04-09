from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import re

class ProfileSettings(BaseModel):
    """User profile settings with enhanced customization options."""
    user_id: str
    public_name: str = Field(..., min_length=3, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None
    background_url: Optional[str] = None
    theme_color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    quantum_score: Optional[float] = None
    sigil_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

    @validator('public_name')
    def validate_public_name(cls, v):
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Public name can only contain letters, numbers, underscores, and hyphens')
        return v

class QRCodeData(BaseModel):
    """Data model for QR codes with enhanced security."""
    user_id: str
    internal_id: str
    public_name: str
    qr_code_url: str
    sigil_data: Optional[str] = None
    verification_token: Optional[str] = None
    verification_expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used_at: Optional[datetime] = None
    usage_count: int = 0
    is_active: bool = True

class ProfileUpdate(BaseModel):
    """Model for updating user profile settings."""
    public_name: Optional[str] = Field(None, min_length=3, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None
    background_url: Optional[str] = None
    theme_color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")

    @validator('public_name')
    def validate_public_name(cls, v):
        if v is not None and not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Public name can only contain letters, numbers, underscores, and hyphens')
        return v

class User(BaseModel):
    """Base user model with core attributes."""
    id: str
    internal_name: str
    email: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    quantum_score: Optional[float] = None 