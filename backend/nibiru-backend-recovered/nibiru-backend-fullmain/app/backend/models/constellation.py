from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Set
from datetime import datetime, time
from enum import Enum

class EventType(str, Enum):
    STREAK_UPDATE = "streak_update"
    RANK_UP = "rank_up"
    NEW_GLYPH = "new_glyph"
    QUANTUM_MILESTONE = "quantum_milestone"
    FIRST_VALIDATION = "first_validation"
    FIRST_PROOFSTATS = "first_proofstats"
    FIRST_LEADERBOARD = "first_leaderboard"

class NetworkTier(str, Enum):
    MENTOR = "mentor"
    PEER = "peer"
    RIVAL = "rival"

class UserConstellationData(BaseModel):
    name: str
    quantum_score: int
    rank: int
    total_users: int
    affinity: str
    streak_days: int
    network_tier: Optional[NetworkTier] = None
    degrees_of_separation: Optional[int] = None
    network_impact: Optional[float] = None

class LeaderboardUser(BaseModel):
    id: str
    name: str
    rank: int
    quantum_score: int
    affinity: str
    first_appearance: Optional[datetime] = None

class LeaderboardConstellation(BaseModel):
    users: List[LeaderboardUser]
    has_black_hole_access: bool

class NetworkNode(BaseModel):
    id: str
    name: str
    relationship: NetworkTier
    quantum_score: int
    affinity: str
    degrees_of_separation: int
    connection_strength: float

class UserNetwork(BaseModel):
    nodes: List[NetworkNode]
    mentor_count: int
    peer_count: int
    rival_count: int
    average_degrees_of_separation: float
    network_impact_factor: float

class ConstellationTheme(BaseModel):
    color_aura: str  # Hex color code
    sigil_shape: str
    constellation_name: str
    myth_tag: str
    description: str

class ConstellationEvent(BaseModel):
    type: EventType
    timestamp: datetime
    data: Dict

class StreakEvent(BaseModel):
    streak_days: int
    milestone: bool

class RankUpEvent(BaseModel):
    old_rank: int
    new_rank: int
    improvement: int

class GlyphEvent(BaseModel):
    glyph_name: str
    timestamp: datetime

class QuantumMilestoneEvent(BaseModel):
    milestone: int
    quantum_score: int
    rank_at_milestone: int

class FirstAchievementEvent(BaseModel):
    achievement_type: str
    timestamp: datetime
    details: Dict

class AdType(str, Enum):
    PRODUCT = "product"
    SERVICE = "service"
    TOOL = "tool"
    RESOURCE = "resource"

class UserBehavior(str, Enum):
    SCRIPT_VALIDATION = "script_validation"
    PROOFSTATS_EXPORT = "proofstats_export"
    LEADERBOARD_ENTRY = "leaderboard_entry"
    NETWORK_GROWTH = "network_growth"
    STREAK_MAINTENANCE = "streak_maintenance"
    AFFINITY_CHANGE = "affinity_change"

class TimeTargeting(BaseModel):
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: str = "UTC"
    days_of_week: Optional[Set[int]] = None  # 0-6 for Monday-Sunday

class AdTargeting(BaseModel):
    min_quantum_score: Optional[int] = 0
    max_quantum_score: Optional[int] = None
    target_affinity: Optional[str] = None
    target_behaviors: Optional[List[UserBehavior]] = None
    time_targeting: Optional[TimeTargeting] = None
    min_streak_days: Optional[int] = 0
    min_network_size: Optional[int] = 0
    min_mentor_count: Optional[int] = 0
    min_peer_count: Optional[int] = 0
    min_rival_count: Optional[int] = 0
    exclude_affinities: Optional[List[str]] = None
    exclude_behaviors: Optional[List[UserBehavior]] = None
    custom_rules: Optional[Dict[str, Any]] = None

class AdMetrics(BaseModel):
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    last_impression: Optional[datetime] = None
    last_click: Optional[datetime] = None
    last_conversion: Optional[datetime] = None
    performance_score: float = 0.0
    engagement_rate: float = 0.0

class Ad(BaseModel):
    id: str
    type: AdType
    name: str
    description: str
    logo_url: str
    link: str
    targeting: AdTargeting
    start_date: datetime
    end_date: Optional[datetime] = None
    is_active: bool = True
    priority: int = 0
    metrics: AdMetrics = Field(default_factory=AdMetrics)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    last_modified_by: str

class AdCreate(BaseModel):
    type: AdType
    name: str
    description: str
    logo_url: str
    link: str
    targeting: AdTargeting
    start_date: datetime
    end_date: Optional[datetime] = None
    priority: int = 0

class AdUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    link: Optional[str] = None
    targeting: Optional[AdTargeting] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None

class AdStats(BaseModel):
    total_impressions: int
    total_clicks: int
    total_conversions: int
    average_engagement_rate: float
    performance_by_affinity: Dict[str, float]
    performance_by_behavior: Dict[str, float]
    top_performing_times: List[Dict[str, Any]]
    conversion_rate: float

class UserAdResponse(BaseModel):
    ads: List[Ad]
    is_ad_free: bool
    last_updated: datetime 