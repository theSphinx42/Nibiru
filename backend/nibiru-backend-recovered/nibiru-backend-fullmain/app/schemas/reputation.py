from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.reputation import ContributionType, ContributionSize, BadgeType

class ContributionBase(BaseModel):
    contribution_type: ContributionType
    size: ContributionSize
    base_points: float
    metadata: Optional[Dict[str, Any]] = None

class ContributionCreate(ContributionBase):
    user_reputation_id: int

class Contribution(ContributionBase):
    id: int
    user_reputation_id: int
    current_points: float
    depreciation_rate: float
    last_updated_at: datetime
    created_at: datetime

    class Config:
        orm_mode = True

class UserBadgeBase(BaseModel):
    badge_type: BadgeType
    metadata: Optional[Dict[str, Any]] = None
    is_featured: bool = False

class UserBadgeCreate(UserBadgeBase):
    user_reputation_id: int

class UserBadge(UserBadgeBase):
    id: int
    user_reputation_id: int
    earned_at: datetime

    class Config:
        orm_mode = True

class MarketplaceTransactionBase(BaseModel):
    amount: float
    currency: str
    metadata: Optional[Dict[str, Any]] = None

class MarketplaceTransactionCreate(MarketplaceTransactionBase):
    user_reputation_id: int
    contribution_id: int

class MarketplaceTransaction(MarketplaceTransactionBase):
    id: int
    user_reputation_id: int
    contribution_id: int
    transaction_date: datetime

    class Config:
        orm_mode = True

class ContributionImpactBase(BaseModel):
    views: int = 0
    downloads: int = 0
    interactions: int = 0
    unique_users: int = 0
    metadata: Optional[Dict[str, Any]] = None

class ContributionImpactCreate(ContributionImpactBase):
    user_reputation_id: int
    contribution_id: int

class ContributionImpact(ContributionImpactBase):
    id: int
    user_reputation_id: int
    contribution_id: int
    date: datetime

    class Config:
        orm_mode = True

class LeaderboardBase(BaseModel):
    category: str
    score: float
    rank: int

class LeaderboardCreate(LeaderboardBase):
    user_reputation_id: int

class Leaderboard(LeaderboardBase):
    id: int
    user_reputation_id: int
    updated_at: datetime

    class Config:
        orm_mode = True

class CommunityEngagementBase(BaseModel):
    engagement_type: str
    points_earned: float
    metadata: Optional[Dict[str, Any]] = None

class CommunityEngagementCreate(CommunityEngagementBase):
    user_reputation_id: int

class CommunityEngagement(CommunityEngagementBase):
    id: int
    user_reputation_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class UserReputationBase(BaseModel):
    total_score: float = 0.0
    active_score: float = 0.0
    active_streak: int = 0
    total_sales: int = 0
    total_revenue: float = 0.0
    marketplace_rank: Optional[int] = None
    total_views: int = 0
    total_downloads: int = 0
    total_interactions: int = 0

class UserReputationCreate(UserReputationBase):
    user_id: int

class UserReputation(UserReputationBase):
    id: int
    user_id: int
    last_contribution_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    contributions: List[Contribution] = []
    badges: List[UserBadge] = []
    leaderboard_entries: List[Leaderboard] = []
    community_engagements: List[CommunityEngagement] = []
    marketplace_transactions: List[MarketplaceTransaction] = []
    impact_metrics: List[ContributionImpact] = []

    class Config:
        orm_mode = True

class ReputationStats(BaseModel):
    total_contributions: int
    active_contributions: int
    average_contribution_size: ContributionSize
    top_categories: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
    badges_earned: List[BadgeType]
    community_impact: Dict[str, float]
    
    # Marketplace Stats
    marketplace_stats: Dict[str, Any] = Field(default_factory=lambda: {
        "total_sales": 0,
        "total_revenue": 0.0,
        "rank": None,
        "top_selling_items": []
    })
    
    # Impact Metrics
    impact_metrics: Dict[str, Any] = Field(default_factory=lambda: {
        "total_views": 0,
        "total_downloads": 0,
        "total_interactions": 0,
        "unique_users": 0
    })
    
    # Time-based Stats
    time_stats: Dict[str, Any] = Field(default_factory=lambda: {
        "daily": {"contributions": 0, "engagement": 0},
        "weekly": {"contributions": 0, "engagement": 0},
        "monthly": {"contributions": 0, "engagement": 0},
        "yearly": {"contributions": 0, "engagement": 0}
    })

class LeaderboardEntry(BaseModel):
    user_id: int
    username: str
    score: float
    rank: int
    category: str
    recent_contributions: List[Dict[str, Any]]
    badges: List[BadgeType]
    marketplace_stats: Optional[Dict[str, Any]] = None
    impact_metrics: Optional[Dict[str, Any]] = None

class ReputationUpdate(BaseModel):
    contribution_type: ContributionType
    size: ContributionSize
    points: float
    metadata: Optional[Dict[str, Any]] = None
    impact_metrics: Optional[ContributionImpactBase] = None 