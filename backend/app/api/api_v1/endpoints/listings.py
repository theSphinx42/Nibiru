from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.listing import ListingCreate, Listing, ListingStatus, ListingCategory, ListingUpdate
from app.models.listing_template import LISTING_TEMPLATES
from app.db.session import get_db
from app.utils.storage import upload_to_s3, delete_from_s3, get_s3_url
from app.utils.glyph import generate_spirit_glyph
from datetime import datetime
import secrets

router = APIRouter()

@router.post("/create", response_model=Listing)
async def create_listing(
    db: Session = Depends(get_db),
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    tier: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new listing."""
    try:
        # Upload file to S3
        file_key = await upload_to_s3(file, f"listings/{current_user.id}")
        
        # Create listing in database
        listing = Listing(
            title=title,
            description=description,
            category=category,
            price=price,
            tier=tier,
            creator_id=current_user.id,
            file_path=get_s3_url(file_key),
            s3_file_key=file_key
        )
        
        db.add(listing)
        db.commit()
        db.refresh(listing)
        
        return listing
    except Exception as e:
        # Clean up S3 file if database operation fails
        if 'file_key' in locals():
            await delete_from_s3(file_key)
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=List[Listing])
async def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    status: Optional[ListingStatus] = None
):
    """Get all listings for the current user."""
    query = db.query(Listing).filter(Listing.creator_id == current_user.id)
    
    if status:
        query = query.filter(Listing.status == status)
        
    return query.all()

@router.get("/{listing_id}", response_model=Listing)
async def get_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Only allow access to the owner
    if listing.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this listing")
        
    return listing

@router.put("/{listing_id}", response_model=Listing)
async def update_listing(
    listing_id: str,
    listing_update: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Only allow the owner to update
    if listing.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing")
        
    # Update fields
    for field, value in listing_update.dict(exclude_unset=True).items():
        setattr(listing, field, value)
    
    listing.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(listing)
    
    return listing

@router.delete("/{listing_id}")
async def delete_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Only allow the owner to delete
    if listing.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
        
    # Delete file from S3
    if listing.s3_file_key:
        await delete_from_s3(listing.s3_file_key)
        
    # Delete from database
    db.delete(listing)
    db.commit()
    
    return {"message": "Listing deleted successfully"}

@router.post("/{listing_id}/archive")
async def archive_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Archive a listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Only allow the owner to archive
    if listing.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to archive this listing")
        
    listing.status = ListingStatus.ARCHIVED
    listing.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(listing)
    
    return listing

@router.get("/templates", response_model=List[dict])
async def get_templates():
    """Get available listing templates"""
    return list(LISTING_TEMPLATES.values())

@router.get("/", response_model=List[Listing])
async def get_listings(
    db: Session = Depends(get_db),
    category: Optional[ListingCategory] = None,
    status: Optional[ListingStatus] = None,
    creator_id: Optional[str] = None
):
    """Get all listings with optional filters"""
    query = db.query(Listing)
    
    if category:
        query = query.filter(Listing.category == category)
    if status:
        query = query.filter(Listing.status == status)
    if creator_id:
        query = query.filter(Listing.creator_id == creator_id)
        
    return query.all()

@router.put("/{listing_id}/publish")
async def publish_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Publish a listing"""
    listing = db.query(Listing).filter(
        Listing.id == listing_id,
        Listing.creator_id == str(current_user.id)
    ).first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
        
    listing.status = ListingStatus.PUBLISHED
    listing.updated_at = datetime.utcnow()
    
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return {"status": "success"}

@router.put("/{listing_id}/archive")
async def archive_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Archive a listing"""
    listing = db.query(Listing).filter(
        Listing.id == listing_id,
        Listing.creator_id == str(current_user.id)
    ).first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
        
    listing.status = ListingStatus.ARCHIVED
    listing.updated_at = datetime.utcnow()
    
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return {"status": "success"}

@router.get("/user/{user_id}", response_model=List[Listing])
async def get_user_listings(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all listings for a specific user"""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these listings"
        )
    
    listings = db.query(Listing).filter(
        Listing.creator_id == user_id,
        Listing.status != ListingStatus.ARCHIVED
    ).all()
    return listings

@router.patch("/update/{listing_id}", response_model=Listing)
async def update_listing(
    listing_id: int,
    listing_in: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing listing"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )

    update_data = listing_in.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(listing, field, value)
    
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.delete("/archive/{listing_id}", response_model=Listing)
async def archive_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Archive a listing (soft delete)"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to archive this listing"
        )

    listing.status = ListingStatus.ARCHIVED
    listing.updated_at = datetime.utcnow()
    
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.get("/category/{category}", response_model=List[Listing])
async def get_listings_by_category(
    category: str,
    db: Session = Depends(get_db)
):
    """Get all public listings in a specific category"""
    listings = db.query(Listing).filter(
        Listing.category == category,
        Listing.status == ListingStatus.PUBLISHED
    ).all()
    return listings

@router.get("/search", response_model=List[Listing])
async def search_listings(
    *,
    db: Session = Depends(get_db),
    category: str = None,
    min_score: float = None,
    max_score: float = None,
    tier: int = None
):
    """Search listings with filters"""
    query = db.query(Listing).filter(Listing.status == ListingStatus.PUBLISHED)
    
    if category:
        query = query.filter(Listing.category == category)
    if min_score is not None:
        query = query.filter(Listing.quantum_score >= min_score)
    if max_score is not None:
        query = query.filter(Listing.quantum_score <= max_score)
    if tier is not None:
        query = query.filter(Listing.tier == tier)
        
    return query.all()

@router.put("/{listing_id}/file")
async def update_listing_file(
    listing_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a listing's file."""
    # Get the listing
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Only allow the owner to update
    if listing.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing")
    
    try:
        # Delete old file from S3
        if listing.s3_file_key:
            await delete_from_s3(listing.s3_file_key)
        
        # Upload new file to S3
        file_key = await upload_to_s3(file, f"listings/{current_user.id}")
        
        # Update listing with new file info
        listing.file_path = get_s3_url(file_key)
        listing.s3_file_key = file_key
        listing.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(listing)
        
        return listing
    except Exception as e:
        # Clean up S3 file if database operation fails
        if 'file_key' in locals():
            await delete_from_s3(file_key)
        raise HTTPException(status_code=400, detail=str(e)) 