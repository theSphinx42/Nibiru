from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import Base, TimestampMixin

class KeyStatus(enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    SUSPENDED = "suspended"

class InvocationKey(Base, TimestampMixin):
    __tablename__ = "invocation_keys"

    id = Column(Integer, primary_key=True, index=True)
    key_hash = Column(String, unique=True, nullable=False, index=True)
    glyph_hash = Column(String, nullable=False)
    code_listing_id = Column(Integer, ForeignKey("code_listings.id"), nullable=False)
    issued_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expiration = Column(DateTime, nullable=True)
    usage_limit = Column(Integer, nullable=True)
    uses_remaining = Column(Integer, nullable=True)
    status = Column(Enum(KeyStatus), default=KeyStatus.PENDING)
    
    # Additional metadata
    metadata = Column(JSON, nullable=True)
    last_used = Column(DateTime, nullable=True)
    activation_date = Column(DateTime, nullable=True)
    
    # $aphira Integration Fields
    aphira_validation_token = Column(String, nullable=True)
    aphira_compiler_config = Column(JSON, nullable=True)
    aphira_runtime_limits = Column(JSON, nullable=True)
    
    # Relationships
    code_listing = relationship("CodeListing", back_populates="invocation_keys")
    issued_to = relationship("User", back_populates="invocation_keys")
    usage_logs = relationship("KeyUsageLog", back_populates="key") 