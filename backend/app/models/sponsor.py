from pydantic import BaseModel, Field, validator, HttpUrl
from typing import Optional
from datetime import datetime
from enum import Enum
import re

class PaymentMethod(str, Enum):
    STRIPE = "stripe"
    CRYPTO = "crypto"
    PAYPAL = "paypal"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class SponsorDuration(int, Enum):
    WEEK = 7
    FORTNIGHT = 14
    MONTH = 30

class SponsorBase(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=50)
    link_url: HttpUrl
    logo_url: Optional[str] = None
    duration_days: SponsorDuration
    payment_method: PaymentMethod
    payment_id: Optional[str] = None
    sponsor_wallet: Optional[str] = None
    glyph_seed: Optional[str] = None

    @validator('display_name')
    def validate_display_name(cls, v):
        if not re.match(r'^[\w\s-]+$', v):
            raise ValueError('Display name can only contain letters, numbers, spaces, and hyphens')
        return v

    @validator('sponsor_wallet')
    def validate_wallet(cls, v):
        if v and not re.match(r'^0x[a-fA-F0-9]{40}$', v):
            raise ValueError('Invalid Ethereum wallet address')
        return v

class SponsorCreate(SponsorBase):
    pass

class Sponsor(SponsorBase):
    id: int
    start_date: datetime
    end_date: datetime
    status: PaymentStatus = PaymentStatus.PENDING
    is_active: bool = False

    class Config:
        orm_mode = True

    @property
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.end_date 