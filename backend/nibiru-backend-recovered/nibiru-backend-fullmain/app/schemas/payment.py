from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.payment import TransactionStatus

class NetworkStatus(BaseModel):
    network: str
    name: str
    gas_price: float
    block_number: int
    is_synced: bool
    supported_tokens: List[str]

class GasEstimate(BaseModel):
    gas_estimate: int
    gas_price: int
    total_gas_cost: float
    network: str
    token: str

class CryptoTransactionBase(BaseModel):
    network: str
    token: str
    amount: float
    from_address: str

class CryptoTransactionCreate(CryptoTransactionBase):
    pass

class CryptoTransactionResponse(CryptoTransactionBase):
    id: int
    user_id: int
    to_address: str
    gas_estimate: int
    gas_price: int
    tx_hash: Optional[str] = None
    status: TransactionStatus
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        orm_mode = True 