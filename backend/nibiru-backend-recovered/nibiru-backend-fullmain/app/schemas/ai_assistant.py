from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.marketplace import ListingStatus, TransactionStatus

class UserInfo(BaseModel):
    id: int
    email: str
    created_at: datetime
    last_login: datetime

class ActivityLog(BaseModel):
    action: str
    entity_type: str
    timestamp: datetime

class ListingInfo(BaseModel):
    id: int
    title: str
    status: ListingStatus
    price: float

class TransactionInfo(BaseModel):
    id: int
    amount: float
    status: TransactionStatus
    created_at: datetime

class UserPatterns(BaseModel):
    frequent_actions: Dict[str, int]
    common_entities: Dict[str, int]
    time_patterns: Dict[str, int]

class UserContextResponse(BaseModel):
    user: UserInfo
    recent_activity: List[ActivityLog]
    listings: List[ListingInfo]
    recent_transactions: List[TransactionInfo]
    patterns: UserPatterns

class SuggestionResponse(BaseModel):
    type: str = Field(..., description="Type of suggestion: action, insight, or tip")
    message: str
    action: str
    priority: str = Field(..., description="Priority level: high, medium, or low")

class FAQResponse(BaseModel):
    topic: str
    relevance: str = Field(..., description="Relevance level: high or medium") 