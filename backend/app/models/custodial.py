from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum

class CustodialStatus(str, Enum):
    ACTIVE = "active"  # Normal listing
    ELIGIBLE = "eligible"  # Meets criteria for custodianship
    CUSTODIAL = "custodial"  # Under Nibiru custodianship
    RECOVERY_REQUESTED = "recovery_requested"  # Original creator requested recovery

class CustodialCriteria(BaseModel):
    inactivity_threshold_days: int = Field(180, ge=30)  # 6 months default
    quantum_score_threshold: float = Field(75.0, ge=0.0, le=100.0)
    min_sales_count: int = Field(5, ge=1)
    min_active_users: int = Field(10, ge=1)

class CustodialMetadata(BaseModel):
    status: CustodialStatus
    original_owner_id: str
    custodial_since: Optional[datetime]
    last_owner_activity: datetime
    recovery_requested_at: Optional[datetime]
    quantum_score: float
    total_sales: int
    active_users: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "custodial",
                "original_owner_id": "user123",
                "custodial_since": "2024-04-05T00:00:00Z",
                "last_owner_activity": "2023-10-05T00:00:00Z",
                "recovery_requested_at": None,
                "quantum_score": 85.5,
                "total_sales": 12,
                "active_users": 25
            }
        }

class CustodialAsset(BaseModel):
    listing_id: str
    metadata: CustodialMetadata
    universal_access: bool = True
    base_price: float = 1.0  # Default $1 price
    has_sigil: bool = True  # Sigil of Continuance badge
    donation_allocation: dict = Field(
        default={
            "maintenance": 0.4,  # 40% to platform maintenance
            "sustainability": 0.4,  # 40% to platform sustainability
            "charitable": 0.2  # 20% to charitable causes
        }
    )
    custodial_message: str = Field(
        default="This creation now lives under the protection of NIBIRU. It is held in trust for the future. Its light endures."
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "listing_id": "listing123",
                "metadata": {
                    "status": "custodial",
                    "original_owner_id": "user123",
                    "custodial_since": "2024-04-05T00:00:00Z",
                    "last_owner_activity": "2023-10-05T00:00:00Z",
                    "recovery_requested_at": None,
                    "quantum_score": 85.5,
                    "total_sales": 12,
                    "active_users": 25
                },
                "universal_access": True,
                "base_price": 1.0,
                "has_sigil": True,
                "donation_allocation": {
                    "maintenance": 0.4,
                    "sustainability": 0.4,
                    "charitable": 0.2
                },
                "custodial_message": "This creation now lives under the protection of NIBIRU. It is held in trust for the future. Its light endures."
            }
        } 