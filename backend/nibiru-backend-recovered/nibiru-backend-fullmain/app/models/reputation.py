from enum import Enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Enum as SQLEnum, func
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.db.base_class import Base

class ContributionType(str, Enum):
    CODE = "code"
    DESIGN = "design"
    AI_MODEL = "ai_model"
    THREE_D_MODEL = "3d_model"
    REVIEW = "review"
    COMMENT = "comment"
    ANSWER = "answer"

class ContributionSize(str, Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"

class BadgeType(str, Enum):
    # Contribution Milestones
    PIONEER = "pioneer"  # First contribution
    CONTRIBUTOR = "contributor"  # 10+ contributions
    MASTER = "master"  # 50+ contributions
    GRANDMASTER = "grandmaster"  # 100+ contributions
    
    # Activity Streaks
    ACTIVE_STREAK_7 = "active_streak_7"  # 7 days
    ACTIVE_STREAK_30 = "active_streak_30"  # 30 days
    ACTIVE_STREAK_90 = "active_streak_90"  # 90 days
    
    # Score Milestones
    HIGH_SCORE_1000 = "high_score_1000"  # 1000+ points
    HIGH_SCORE_5000 = "high_score_5000"  # 5000+ points
    HIGH_SCORE_10000 = "high_score_10000"  # 10000+ points
    
    # Community Impact
    HELPER = "helper"  # 10+ helpful answers
    MENTOR = "mentor"  # 50+ helpful answers
    EXPERT = "expert"  # 100+ helpful answers
    
    # Marketplace Success
    SELLER = "seller"  # First sale
    TOP_SELLER = "top_seller"  # 10+ sales
    MARKETPLACE_LEADER = "marketplace_leader"  # 50+ sales
    
    # Special Achievements
    INNOVATOR = "innovator"  # Unique contribution type
    COLLABORATOR = "collaborator"  # Multiple contributions in same category
    TRENDING = "trending"  # Contribution in top 10 of category

class UserReputation(Base):
    __tablename__ = "user_reputation"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    total_score = Column(Float, default=0.0)
    active_score = Column(Float, default=0.0)
    last_contribution_at = Column(DateTime)
    active_streak = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Marketplace Stats
    total_sales = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)
    marketplace_rank = Column(Integer)
    
    # Impact Metrics
    total_views = Column(Integer, default=0)
    total_downloads = Column(Integer, default=0)
    total_interactions = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="reputation")
    contributions = relationship("Contribution", back_populates="user_reputation")
    badges = relationship("UserBadge", back_populates="user_reputation")
    marketplace_transactions = relationship("MarketplaceTransaction", back_populates="user_reputation")
    impact_metrics = relationship("ContributionImpact", back_populates="user_reputation")

class Contribution(Base):
    __tablename__ = "contributions"

    id = Column(Integer, primary_key=True, index=True)
    user_reputation_id = Column(Integer, ForeignKey("user_reputation.id"))
    contribution_type = Column(SQLEnum(ContributionType), nullable=False)
    size = Column(SQLEnum(ContributionSize), nullable=False)
    base_points = Column(Float, nullable=False)
    current_points = Column(Float, nullable=False)
    depreciation_rate = Column(Float, default=0.1)  # 10% per year
    last_updated_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)  # Additional contribution data
    
    # Impact Tracking
    views = Column(Integer, default=0)
    downloads = Column(Integer, default=0)
    interactions = Column(Integer, default=0)
    last_interaction_at = Column(DateTime)

    # Relationships
    user_reputation = relationship("UserReputation", back_populates="contributions")
    impact_metrics = relationship("ContributionImpact", back_populates="contribution")

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_reputation_id = Column(Integer, ForeignKey("user_reputation.id"))
    badge_type = Column(SQLEnum(BadgeType), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)  # Badge-specific data
    is_featured = Column(Boolean, default=False)  # For profile display

    # Relationships
    user_reputation = relationship("UserReputation", back_populates="badges")

class MarketplaceTransaction(Base):
    __tablename__ = "marketplace_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_reputation_id = Column(Integer, ForeignKey("user_reputation.id"))
    contribution_id = Column(Integer, ForeignKey("contributions.id"))
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)

    # Relationships
    user_reputation = relationship("UserReputation", back_populates="marketplace_transactions")
    contribution = relationship("Contribution")

class ContributionImpact(Base):
    __tablename__ = "contribution_impact"

    id = Column(Integer, primary_key=True, index=True)
    user_reputation_id = Column(Integer, ForeignKey("user_reputation.id"))
    contribution_id = Column(Integer, ForeignKey("contributions.id"))
    date = Column(DateTime, default=datetime.utcnow)
    views = Column(Integer, default=0)
    downloads = Column(Integer, default=0)
    interactions = Column(Integer, default=0)
    unique_users = Column(Integer, default=0)
    metadata = Column(JSON)

    # Relationships
    user_reputation = relationship("UserReputation", back_populates="impact_metrics")
    contribution = relationship("Contribution", back_populates="impact_metrics")

class Leaderboard(Base):
    __tablename__ = "leaderboards"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    user_reputation_id = Column(Integer, ForeignKey("user_reputation.id"))
    score = Column(Float, nullable=False)
    rank = Column(Integer, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user_reputation = relationship("UserReputation")

class CommunityEngagement(Base):
    __tablename__ = "community_engagement"

    id = Column(Integer, primary_key=True, index=True)
    user_reputation_id = Column(Integer, ForeignKey("user_reputation.id"))
    engagement_type = Column(String, nullable=False)  # review, comment, answer
    points_earned = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)  # Engagement-specific data

    # Relationships
    user_reputation = relationship("UserReputation") 