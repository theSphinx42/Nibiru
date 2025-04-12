from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base
import enum

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class CryptoTransaction(Base):
    __tablename__ = "crypto_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    network = Column(String, nullable=False)  # polygon, base, ronin
    token = Column(String, nullable=False)  # USDC, DAI
    amount = Column(Numeric(precision=18, scale=6), nullable=False)
    from_address = Column(String, nullable=False)
    to_address = Column(String, nullable=False)
    gas_estimate = Column(Integer, nullable=False)
    gas_price = Column(Integer, nullable=False)
    tx_hash = Column(String, unique=True, nullable=True)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="crypto_transactions") 