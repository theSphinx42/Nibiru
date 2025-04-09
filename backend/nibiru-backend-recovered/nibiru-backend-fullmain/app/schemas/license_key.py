from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LicenseKeyBase(BaseModel):
    listing_id: int
    max_activations: int = 1
    expiry_date: Optional[datetime] = None
    metadata: Optional[str] = None

class LicenseKeyCreate(LicenseKeyBase):
    pass

class LicenseKeyResponse(LicenseKeyBase):
    id: int
    key: str
    transaction_id: int
    is_active: bool
    activation_date: Optional[datetime]
    last_used: Optional[datetime]
    usage_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LicenseKeyInDB(LicenseKeyResponse):
    pass 