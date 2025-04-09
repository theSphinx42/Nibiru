from sqlalchemy import Column, Integer, String, Boolean, Float
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    stripe_customer_id = Column(String, unique=True)
    balance = Column(Float, default=0.0)

    # Relationships
    listings = relationship("Listing", back_populates="owner")
    purchases = relationship("Transaction", back_populates="buyer")
    sales = relationship("Transaction", back_populates="seller") 