"""Base SQLAlchemy model for Nibiru."""

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

def to_dict(model_instance):
    """Convert a model instance to dictionary."""
    return {c.name: getattr(model_instance, c.name) 
            for c in model_instance.__table__.columns} 