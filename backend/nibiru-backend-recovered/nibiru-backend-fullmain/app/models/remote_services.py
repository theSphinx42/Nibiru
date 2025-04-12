from enum import Enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class ServiceType(str, Enum):
    AI_TRAINING = "ai_training"
    THREE_D_PRINTING = "3d_printing"
    DEVELOPMENT_TOOL = "development_tool"

class ResourceType(str, Enum):
    GPU = "gpu"
    STORAGE = "storage"
    COMPUTE = "compute"
    PRINTER = "printer"
    MATERIAL = "material"
    SOFTWARE = "software"

class ServiceStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    MAINTENANCE = "maintenance"
    DEPRECATED = "deprecated"

class RemoteService(Base):
    __tablename__ = "remote_services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    service_type = Column(SQLEnum(ServiceType), nullable=False)
    status = Column(SQLEnum(ServiceStatus), default=ServiceStatus.ACTIVE)
    pricing_model = Column(JSON, nullable=False)  # Stores pricing tiers and rules
    metadata = Column(JSON)  # Additional service-specific data
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    resources = relationship("ServiceResource", back_populates="service")
    listings = relationship("ServiceListing", back_populates="service")
    usage_logs = relationship("ServiceUsageLog", back_populates="service")

class ServiceResource(Base):
    __tablename__ = "service_resources"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("remote_services.id"))
    name = Column(String, nullable=False)
    resource_type = Column(SQLEnum(ResourceType), nullable=False)
    capacity = Column(JSON, nullable=False)  # Resource capacity (e.g., GPU memory, storage space)
    availability = Column(JSON, nullable=False)  # Current availability status
    metadata = Column(JSON)  # Resource-specific data
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service = relationship("RemoteService", back_populates="resources")
    usage_logs = relationship("ServiceUsageLog", back_populates="resource")

class ServiceListing(Base):
    __tablename__ = "service_listings"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("remote_services.id"))
    creator_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    status = Column(SQLEnum(ServiceStatus), default=ServiceStatus.ACTIVE)
    metadata = Column(JSON)  # Listing-specific data (e.g., GPU specs, print settings)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service = relationship("RemoteService", back_populates="listings")
    creator = relationship("User")
    transactions = relationship("ServiceTransaction", back_populates="listing")

class ServiceTransaction(Base):
    __tablename__ = "service_transactions"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("service_listings.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    stripe_payment_intent_id = Column(String)
    metadata = Column(JSON)  # Transaction-specific data
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    listing = relationship("ServiceListing", back_populates="transactions")
    buyer = relationship("User")
    usage_logs = relationship("ServiceUsageLog", back_populates="transaction")

class ServiceUsageLog(Base):
    __tablename__ = "service_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("remote_services.id"))
    resource_id = Column(Integer, ForeignKey("service_resources.id"))
    transaction_id = Column(Integer, ForeignKey("service_transactions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    usage_start = Column(DateTime, nullable=False)
    usage_end = Column(DateTime)
    usage_metrics = Column(JSON, nullable=False)  # Usage statistics (e.g., GPU hours, print time)
    status = Column(String, nullable=False)
    metadata = Column(JSON)  # Additional usage data
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service = relationship("RemoteService", back_populates="usage_logs")
    resource = relationship("ServiceResource", back_populates="usage_logs")
    transaction = relationship("ServiceTransaction", back_populates="usage_logs")
    user = relationship("User") 