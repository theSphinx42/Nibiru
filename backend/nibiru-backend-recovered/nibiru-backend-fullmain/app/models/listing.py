from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from .base import Base, TimestampMixin

class ListingVisibility(enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    ENCRYPTED = "encrypted"

class Listing(Base, TimestampMixin):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
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

    # Relationships
    owner = relationship("User", back_populates="listings")
    transactions = relationship("Transaction", back_populates="listing")
    license_keys = relationship("LicenseKey", back_populates="listing") 