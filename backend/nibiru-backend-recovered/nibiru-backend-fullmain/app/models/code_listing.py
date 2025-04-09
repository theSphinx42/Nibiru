from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Enum, JSON, Text
from sqlalchemy.orm import relationship
import enum
from .base import Base, TimestampMixin

class ListingVisibility(enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    ENCRYPTED = "encrypted"

class CodeListing(Base, TimestampMixin):
    __tablename__ = "code_listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    visibility = Column(Enum(ListingVisibility), default=ListingVisibility.PUBLIC)
    s3_file_key = Column(String, nullable=False)
    category = Column(String, nullable=False)
    tags = Column(String)  # Stored as comma-separated values
    is_active = Column(Boolean, default=True)
    version = Column(String, default="1.0.0")
    download_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    
    # $aphira Integration Fields
    aphira_validation_status = Column(String, default="pending")  # pending, validated, failed
    aphira_validation_result = Column(JSON, nullable=True)
    aphira_glyphs = Column(JSON, nullable=True)  # Store generated glyphs
    aphira_compiler_hooks = Column(JSON, nullable=True)  # Store compiler hook configurations
    aphira_metadata = Column(JSON, nullable=True)  # Additional $aphira-specific metadata
    
    # Code Analysis Fields
    language = Column(String, nullable=False)
    framework = Column(String, nullable=True)
    dependencies = Column(JSON, nullable=True)  # List of dependencies
    complexity_score = Column(Float, nullable=True)
    security_score = Column(Float, nullable=True)
    documentation_score = Column(Float, nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="listings")
    transactions = relationship("Transaction", back_populates="listing")
    invocation_keys = relationship("InvocationKey", back_populates="listing")
    reviews = relationship("Review", back_populates="listing") 