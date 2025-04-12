from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class ContributorRank(BaseModel):
    user_id: str
    total_score: float
    monthly_score: float
    tier_1_rank: int  # Personal glyph rank
    items_created: int
    avg_item_rating: float
    updated_at: datetime

class AdvertiserRank(BaseModel):
    user_id: str
    paid_amount: float
    tier_3_level: int  # 1-5 based on payment tier
    monthly_impressions: int
    monthly_clicks: int
    monthly_conversions: int
    rank_position: Optional[int]  # Position in the advertising bar
    updated_at: datetime

class AdSlot(BaseModel):
    position: int
    price: float  # Dynamically set based on top contributor
    is_contributor_slot: bool  # True if held by contributor, False if paid
    holder_id: str
    expires_at: datetime

class MonthlyRankings(BaseModel):
    month: str  # Format: YYYY-MM
    top_contributor_score: float
    base_slot_price: float  # Set to top_contributor_score - 1
    total_slots: int
    available_slots: int
    updated_at: datetime 