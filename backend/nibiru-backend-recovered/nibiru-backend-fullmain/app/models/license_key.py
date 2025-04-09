from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, TimestampMixin

class LicenseKey(Base, TimestampMixin):
    __tablename__ = "license_keys"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    activation_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    last_used = Column(DateTime, nullable=True)
    usage_count = Column(Integer, default=0)
    max_activations = Column(Integer, default=1)
    metadata = Column(String)  # JSON string for additional license data

    # Relationships
    listing = relationship("Listing", back_populates="license_keys")
    transaction = relationship("Transaction", back_populates="license_key") 