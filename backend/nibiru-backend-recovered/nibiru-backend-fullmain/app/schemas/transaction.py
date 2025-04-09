from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.transaction import TransactionStatus

class TransactionBase(BaseModel):
    listing_id: int
    amount: float
    currency: str = "usd"
    metadata: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    stripe_payment_intent_id: str
    buyer_id: int
    seller_id: int
    status: TransactionStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TransactionInDB(TransactionResponse):
    pass 