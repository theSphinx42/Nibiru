from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime
from app.models.invocation_key import KeyStatus

class InvocationKeyBase(BaseModel):
    code_listing_id: int
    usage_limit: Optional[int] = None
    expiration_days: Optional[int] = None
    metadata: Optional[Dict] = None

class InvocationKeyCreate(InvocationKeyBase):
    pass

class InvocationKeyResponse(InvocationKeyBase):
    id: int
    key_hash: str
    glyph_hash: str
    issued_to_user_id: int
    status: KeyStatus
    expiration: Optional[datetime]
    uses_remaining: Optional[int]
    last_used: Optional[datetime]
    activation_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InvocationKeyRedeem(BaseModel):
    key_hash: str
    glyph_hash: Optional[str] = None

class InvocationKeyActivate(BaseModel):
    key_hash: str

class KeyUsageLogBase(BaseModel):
    key_id: int
    usage_type: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_fingerprint: Optional[str] = None
    success: bool = True
    error_message: Optional[str] = None

class KeyUsageLogCreate(KeyUsageLogBase):
    pass

class KeyUsageLogResponse(KeyUsageLogBase):
    id: int
    timestamp: datetime
    aphira_validation_result: Optional[Dict] = None
    aphira_glyph_hash: Optional[str] = None
    aphira_compilation_metrics: Optional[Dict] = None

    class Config:
        from_attributes = True 