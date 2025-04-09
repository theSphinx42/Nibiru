from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.listing import ListingVisibility

class ListingBase(BaseModel):
    title: str
    description: str
    price: float = Field(gt=0)
    visibility: ListingVisibility = ListingVisibility.PUBLIC
    category: str
    tags: Optional[str] = None
    version: str = "1.0.0"

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    visibility: Optional[ListingVisibility] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    version: Optional[str] = None
    is_active: Optional[bool] = None

class ListingResponse(ListingBase):
    id: int
    owner_id: int
    s3_file_key: str
    is_active: bool
    download_count: int
    rating: float
    review_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ListingInDB(ListingResponse):
    pass 