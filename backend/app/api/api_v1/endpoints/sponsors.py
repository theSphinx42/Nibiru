from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.auth import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.models.sponsor import SponsorCreate, Sponsor, PaymentStatus, PaymentMethod
from app.db.session import get_db
from app.utils.glyph import generate_spirit_glyph
from app.utils.storage import upload_file, validate_image
from app.utils.stripe import create_payment_intent
from datetime import datetime, timedelta
import secrets

router = APIRouter()

PRICING = {
    7: 5000,  # $50.00
    14: 10000,  # $100.00
    30: 15000,  # $150.00
}

@router.post("/create", response_model=Sponsor)
async def create_sponsor(
    *,
    db: Session = Depends(get_db),
    sponsor_in: SponsorCreate,
    logo: Optional[UploadFile] = File(None)
):
    """Create a new sponsor"""
    try:
        # Validate and upload logo if provided
        logo_url = None
        if logo:
            if not validate_image(logo):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid image format. Only PNG and SVG are allowed."
                )
            logo_url = await upload_file(logo, prefix="sponsor-logos")

        # Generate glyph seed if no logo
        glyph_seed = None
        if not logo_url:
            glyph_seed = generate_spirit_glyph(sponsor_in.display_name)

        # Calculate dates
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=sponsor_in.duration_days)

        # Create sponsor record
        sponsor = Sponsor(
            **sponsor_in.dict(),
            logo_url=logo_url,
            glyph_seed=glyph_seed,
            start_date=start_date,
            end_date=end_date
        )

        # Handle payment
        if sponsor_in.payment_method == PaymentMethod.STRIPE:
            amount = PRICING.get(sponsor_in.duration_days)
            if not amount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid duration"
                )
            
            payment_intent = await create_payment_intent(amount)
            sponsor.payment_id = payment_intent.id
        
        db.add(sponsor)
        db.commit()
        db.refresh(sponsor)
        return sponsor

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create sponsor: {str(e)}"
        )

@router.get("/active", response_model=List[Sponsor])
async def get_active_sponsors(
    db: Session = Depends(get_db)
):
    """Get all active sponsors"""
    now = datetime.utcnow()
    sponsors = db.query(Sponsor).filter(
        Sponsor.status == PaymentStatus.COMPLETED,
        Sponsor.is_active == True,
        Sponsor.start_date <= now,
        Sponsor.end_date > now
    ).all()
    return sponsors

@router.post("/{sponsor_id}/confirm", response_model=Sponsor)
async def confirm_payment(
    sponsor_id: int,
    db: Session = Depends(get_db)
):
    """Confirm sponsor payment and activate"""
    sponsor = db.query(Sponsor).filter(Sponsor.id == sponsor_id).first()
    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found"
        )

    sponsor.status = PaymentStatus.COMPLETED
    sponsor.is_active = True
    
    db.add(sponsor)
    db.commit()
    db.refresh(sponsor)
    return sponsor

@router.delete("/{sponsor_id}")
async def delete_sponsor(
    sponsor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a sponsor (admin only)"""
    sponsor = db.query(Sponsor).filter(Sponsor.id == sponsor_id).first()
    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found"
        )

    db.delete(sponsor)
    db.commit()
    return {"status": "success"} 