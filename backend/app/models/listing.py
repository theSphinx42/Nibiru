from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class ListingStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
    TESTING = "testing"

class ListingTier(int, Enum):
    BASIC = 1
    ADVANCED = 2
    MYTHIC = 3

class ListingCategory(str, Enum):
    SCRIPT = "script"
    MODEL = "model"
    DATASET = "dataset"
    TEMPLATE = "template"
    PLUGIN = "plugin"
    OTHER = "other"

class InvocationType(str, Enum):
    RUN_ONLY = "run_only"  # Execute in sandbox only
    EMBED_ALLOWED = "embed_allowed"  # Can be embedded in other applications
    DOWNLOADABLE = "downloadable"  # Full source access

class LicenseTier(str, Enum):
    PERSONAL = "personal"  # Single user
    TEAM = "team"  # Up to 10 users
    ENTERPRISE = "enterprise"  # Unlimited users
    ACADEMIC = "academic"  # Educational use

class InvocationKey(BaseModel):
    key_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    listing_id: str
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime]
    max_invocations: Optional[int]
    current_invocations: int = 0
    license_tier: LicenseTier
    is_active: bool = True

class InvocationEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    key_id: str
    listing_id: str
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: str
    glyph_seed: str
    success: bool
    error_message: Optional[str]

class ListingBase(BaseModel):
    title: str
    description: str
    category: ListingCategory
    price: float = Field(ge=0)  # Greater than or equal to 0
    tier: ListingTier = ListingTier.BASIC
    glyph_id: Optional[str] = None
    invocation_enabled: bool = False
    is_visible: bool = True

    # Invocation settings
    invocable: bool = False
    invocation_type: Optional[InvocationType]
    license_tier: Optional[LicenseTier]
    key_required: bool = True
    max_invocations_per_key: Optional[int]
    key_expiry_days: Optional[int]
    
    # Runtime payload paths (relative to secure storage)
    runtime_path: Optional[str]
    module_path: Optional[str]
    script_path: Optional[str]

    @validator('pricing')
    def validate_pricing(cls, v):
        required_tiers = {'basic', 'pro', 'enterprise'}
        if not all(tier in v for tier in required_tiers):
            raise ValueError('Pricing must include basic, pro, and enterprise tiers')
        if not all(isinstance(price, (int, float)) and price >= 0 for price in v.values()):
            raise ValueError('All prices must be non-negative numbers')
        return v

class ListingCreate(ListingBase):
    pass

class ListingUpdate(ListingBase):
    status: Optional[ListingStatus] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ListingCategory] = None
    price: Optional[float] = None
    tier: Optional[ListingTier] = None
    glyph_id: Optional[str] = None
    invocation_enabled: Optional[bool] = None
    is_visible: Optional[bool] = None

class Listing(ListingBase):
    id: str = Field(default_factory=lambda: f"lst_{datetime.now().timestamp()}")
    creator_id: str
    status: ListingStatus = ListingStatus.DRAFT
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    downloads: int = 0
    quantum_score: float = 0.0
    file_path: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "lst_1234567890",
                "title": "Advanced AI Model",
                "description": "A powerful AI model for image generation",
                "category": "model",
                "price": 29.99,
                "tier": 2,
                "creator_id": "usr_1234567890",
                "status": "active",
                "created_at": "2024-04-06T00:00:00Z",
                "updated_at": "2024-04-06T00:00:00Z",
                "downloads": 42,
                "quantum_score": 85.5,
                "glyph_id": "gly_1234567890",
                "invocation_enabled": True,
                "is_visible": True,
                "file_path": "/storage/listings/lst_1234567890/model.zip"
            }
        }

class ListingInDB(Listing):
    pass 