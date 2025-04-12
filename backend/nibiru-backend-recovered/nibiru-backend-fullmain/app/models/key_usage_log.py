from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import Base, TimestampMixin

class UsageType(enum.Enum):
    ACTIVATION = "activation"
    COMPILATION = "compilation"
    EXECUTION = "execution"
    VALIDATION = "validation"

class KeyUsageLog(Base, TimestampMixin):
    __tablename__ = "key_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    key_id = Column(Integer, ForeignKey("invocation_keys.id"), nullable=False)
    usage_type = Column(Enum(UsageType), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    device_fingerprint = Column(String, nullable=True)
    success = Column(Boolean, default=True)
    error_message = Column(String, nullable=True)
    
    # $aphira Integration Fields
    aphira_validation_result = Column(JSON, nullable=True)
    aphira_glyph_hash = Column(String, nullable=True)
    aphira_compilation_metrics = Column(JSON, nullable=True)
    
    # Relationships
    key = relationship("InvocationKey", back_populates="usage_logs") 