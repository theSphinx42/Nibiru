from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.marketplace import ListingStatus, TransactionStatus
from app.models.invocation_key import KeyStatus

class ListingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=1000)
    price: float = Field(..., gt=0)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    price: Optional[float] = Field(None, gt=0)
    status: Optional[ListingStatus] = None
    metadata: Optional[Dict[str, Any]] = None

class ListingResponse(ListingBase):
    id: int
    creator_id: int
    status: ListingStatus
    created_at: datetime
    updated_at: datetime
    is_featured: bool = False

    class Config:
        orm_mode = True

class TransactionResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    amount: float
    currency: str = "usd"
    status: TransactionStatus
    stripe_payment_intent_id: str
    created_at: datetime
    updated_at: datetime
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        orm_mode = True

class UsageStats(BaseModel):
    total_invocations: int
    successful_invocations: int

class ListingStats(BaseModel):
    id: int
    title: str
    status: ListingStatus
    price: float
    total_sales: int
    total_revenue: float
    active_keys: int
    revoked_keys: int
    usage_stats: UsageStats

class DashboardResponse(BaseModel):
    total_listings: int
    active_listings: int
    total_revenue: float
    listings: List[ListingStats]

class KeyRevokeRequest(BaseModel):
    reason: Optional[str] = Field(None, max_length=500) 