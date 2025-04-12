from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.marketplace import CodeListing, Transaction, TransactionStatus, ListingStatus, AuditLog
from app.models.invocation_key import InvocationKey, KeyStatus
from app.models.glyph import ItemGlyph, GlyphTier
from app.core.security import get_current_user
from app.core.config import settings
import stripe
from app.utils.audit import log_audit_event
from app.utils.rate_limit import rate_limit
from app.utils.glyph_generator import generate_buyer_glyph

stripe.api_key = settings.STRIPE_SECRET_KEY

class MarketplaceService:
    def __init__(self, db: Session):
        self.db = db

    async def create_listing(
        self,
        title: str,
        description: str,
        price: float,
        creator_id: int,
        is_digital: bool = True,
        edition_limit: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> CodeListing:
        """Create a new code listing."""
        listing = CodeListing(
            title=title,
            description=description,
            price=price,
            creator_id=creator_id,
            is_digital=is_digital,
            edition_limit=edition_limit,
            metadata=metadata or {},
            last_interaction=datetime.utcnow()
        )
        self.db.add(listing)
        self.db.commit()
        self.db.refresh(listing)
        
        # Generate Tier 2 glyph for the listing
        item_glyph = ItemGlyph(
            item_id=str(listing.id),
            tier=GlyphTier.ENHANCED,
            complexity_score=85,  # Base score for Tier 2
            innovation_rating=75  # Base innovation rating
        )
        self.db.add(item_glyph)
        self.db.commit()
        
        await log_audit_event(
            self.db,
            user_id=creator_id,
            action="create_listing",
            entity_type="code_listing",
            entity_id=listing.id
        )
        
        return listing

    async def archive_inactive_listings(self):
        """Archive listings with no interactions in the last 6 months."""
        cutoff_date = datetime.utcnow() - timedelta(days=180)
        
        inactive_listings = self.db.query(CodeListing).filter(
            CodeListing.status == ListingStatus.ACTIVE,
            CodeListing.last_interaction < cutoff_date,
            CodeListing.total_views == 0,
            CodeListing.total_saves == 0,
            CodeListing.total_purchases == 0
        ).all()
        
        for listing in inactive_listings:
            listing.status = ListingStatus.ARCHIVED
            await log_audit_event(
                self.db,
                user_id=listing.creator_id,
                action="archive_listing",
                entity_type="code_listing",
                entity_id=listing.id,
                metadata={"reason": "inactive_6_months"}
            )
        
        self.db.commit()

    async def create_purchase_intent(
        self,
        listing_id: int,
        buyer_id: int
    ) -> Dict[str, Any]:
        """Create a Stripe payment intent for a listing purchase."""
        listing = self.db.query(CodeListing).filter(
            CodeListing.id == listing_id,
            CodeListing.status == ListingStatus.ACTIVE
        ).first()
        
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found or not active"
            )
        
        # Check edition limit if not a digital item
        if not listing.is_digital and listing.edition_limit:
            current_purchases = self.db.query(Transaction).filter(
                Transaction.listing_id == listing_id,
                Transaction.status == TransactionStatus.COMPLETED
            ).count()
            
            if current_purchases >= listing.edition_limit:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Edition limit reached"
                )
        
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(listing.price * 100),  # Convert to cents
            currency="usd",
            metadata={
                "listing_id": listing_id,
                "buyer_id": buyer_id,
                "is_digital": listing.is_digital
            }
        )
        
        # Create transaction record
        transaction = Transaction(
            listing_id=listing_id,
            buyer_id=buyer_id,
            amount=listing.price,
            stripe_payment_intent_id=intent.id,
            metadata={
                "is_digital": listing.is_digital,
                "edition_number": None  # Will be set on completion
            }
        )
        self.db.add(transaction)
        self.db.commit()
        
        # Update last interaction time
        listing.last_interaction = datetime.utcnow()
        self.db.commit()
        
        await log_audit_event(
            self.db,
            user_id=buyer_id,
            action="create_purchase_intent",
            entity_type="transaction",
            entity_id=transaction.id
        )
        
        return {
            "client_secret": intent.client_secret,
            "transaction_id": transaction.id
        }

    async def handle_payment_success(self, payment_intent_id: str) -> dict:
        """Handle successful payment and create buyer's copy with glyph."""
        async with self.db.transaction() as txn:
            # Get payment intent and associated listing
            payment_intent = await self.stripe.PaymentIntent.retrieve(payment_intent_id)
            listing_id = payment_intent.metadata.get('listing_id')
            buyer_id = payment_intent.metadata.get('buyer_id')
            
            if not listing_id or not buyer_id:
                raise ValueError("Missing listing or buyer information")
            
            # Get listing details
            listing = await self.db.fetch_one(
                "SELECT * FROM listings WHERE id = $1",
                listing_id
            )
            
            if not listing:
                raise ValueError("Listing not found")
            
            # Generate buyer's glyph
            buyer_glyph = generate_buyer_glyph(
                listing_id=listing_id,
                buyer_id=buyer_id,
                transaction_id=payment_intent_id
            )
            
            # Create transaction record
            transaction_id = await self.db.fetch_val("""
                INSERT INTO transactions (
                    listing_id, buyer_id, payment_intent_id, 
                    amount, status, buyer_glyph_data
                )
                VALUES ($1, $2, $3, $4, 'completed', $5)
                RETURNING id
            """, listing_id, buyer_id, payment_intent_id,
                payment_intent.amount, buyer_glyph.dict()
            )
            
            # Update listing edition count if not infinite
            if not listing['infinite_editions']:
                await self.db.execute("""
                    UPDATE listings 
                    SET editions_sold = editions_sold + 1
                    WHERE id = $1
                """, listing_id)
            
            # Create buyer's copy record
            await self.db.execute("""
                INSERT INTO item_copies (
                    item_id, owner_id, transaction_id,
                    glyph_id, glyph_tier, visual_properties
                )
                VALUES ($1, $2, $3, $4, $5, $6)
            """, listing['item_id'], buyer_id, transaction_id,
                buyer_glyph.id, buyer_glyph.tier, buyer_glyph.visual_properties
            )
            
            return {
                "transaction_id": transaction_id,
                "glyph": buyer_glyph.dict()
            } 