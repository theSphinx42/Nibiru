"""Glyph models for the Nibiru platform."""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .base import Base

class GlyphTier(str, enum.Enum):
    BASIC = "basic"
    ENHANCED = "enhanced"
    PREMIUM = "premium"
    MYTHIC = "mythic"

class GlyphRank(str, enum.Enum):
    NOVICE = "novice"
    ADEPT = "adept"
    MASTER = "master"
    MYTHIC = "mythic"

class GlyphEffect(str, enum.Enum):
    QUANTUM_RESONANCE = "quantum_resonance"
    REALITY_ANCHOR = "reality_anchor"
    DIMENSIONAL_SEAL = "dimensional_seal"
    VOID_ECHO = "void_echo"
    COSMIC_HARMONY = "cosmic_harmony"

class QuantumState(str, enum.Enum):
    STABLE = "stable"
    ENTANGLED = "entangled"
    SUPERPOSITION = "superposition"
    COHERENT = "coherent"
    QUANTUM_LOCKED = "quantum_locked"

class BaseGlyph(Base):
    """Base class for all glyphs."""
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    tier = Column(Integer, nullable=False)
    rank = Column(SQLEnum(GlyphRank), nullable=False)
    effect = Column(SQLEnum(GlyphEffect), nullable=False)
    quantum_state = Column(SQLEnum(QuantumState), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    def __repr__(self):
        return f"<{self.__class__.__name__}(id={self.id}, tier={self.tier}, rank={self.rank})>"

class UserGlyph(BaseGlyph):
    """Personal glyph associated with a user's identity."""
    __tablename__ = "user_glyphs"

    resonance_score = Column(Integer, default=0)
    achievement_points = Column(Integer, default=0)
    user = relationship("User", back_populates="personal_glyph")

class ItemGlyph(BaseGlyph):
    """Glyph associated with marketplace items."""
    __tablename__ = "item_glyphs"

    item_id = Column(String, nullable=False)
    complexity_score = Column(Integer, default=0)
    innovation_rating = Column(Integer, default=0)

class BusinessGlyph(BaseGlyph):
    """Glyph for business/advertiser accounts."""
    __tablename__ = "business_glyphs"

    influence_score = Column(Integer, default=0)
    trust_rating = Column(Integer, default=0)
    monthly_resonance = Column(Integer, default=0) 