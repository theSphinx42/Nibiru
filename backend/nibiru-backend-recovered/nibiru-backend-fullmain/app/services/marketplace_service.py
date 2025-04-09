from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.marketplace import CodeListing, Transaction, TransactionStatus, ListingStatus, AuditLog
from app.models.invocation_key import InvocationKey, KeyStatus
from app.core.security import get_current_user
from app.core.config import settings
import stripe
from app.utils.audit import log_audit_event
from app.utils.rate_limit import rate_limit
from app.utils.ip_whitelist import check_ip_whitelist

stripe.api_key = settings.STRIPE_SECRET_KEY

class MarketplaceService:
    def __init__(self, db: Session):
        self.db = db

    @rate_limit(max_requests=100, window_seconds=60)
    async def create_listing(
        self,
        title: str,
        description: str,
        price: float,
        creator_id: int,
        metadata: Optional[Dict[str, Any]] = None
    ) -> CodeListing:
        """Create a new code listing."""
        listing = CodeListing(
            title=title,
            description=description,
            price=price,
            creator_id=creator_id,
            metadata=metadata or {}
        )
        self.db.add(listing)
        self.db.commit()
        self.db.refresh(listing)
        
        await log_audit_event(
            self.db,
            user_id=creator_id,
            action="create_listing",
            entity_type="code_listing",
            entity_id=listing.id
        )
        
        return listing

    @rate_limit(max_requests=100, window_seconds=60)
    async def update_listing(
        self,
        listing_id: int,
        creator_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        price: Optional[float] = None,
        status: Optional[ListingStatus] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> CodeListing:
        """Update an existing code listing."""
        listing = self.db.query(CodeListing).filter(
            CodeListing.id == listing_id,
            CodeListing.creator_id == creator_id
        ).first()
        
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found"
            )
        
        if title:
            listing.title = title
        if description:
            listing.description = description
        if price:
            listing.price = price
        if status:
            listing.status = status
        if metadata:
            listing.metadata.update(metadata)
        
        listing.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(listing)
        
        await log_audit_event(
            self.db,
            user_id=creator_id,
            action="update_listing",
            entity_type="code_listing",
            entity_id=listing_id
        )
        
        return listing

    @rate_limit(max_requests=50, window_seconds=60)
    async def delete_listing(self, listing_id: int, creator_id: int) -> bool:
        """Delete a code listing."""
        listing = self.db.query(CodeListing).filter(
            CodeListing.id == listing_id,
            CodeListing.creator_id == creator_id
        ).first()
        
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found"
            )
        
        listing.status = ListingStatus.DELETED
        listing.updated_at = datetime.utcnow()
        self.db.commit()
        
        await log_audit_event(
            self.db,
            user_id=creator_id,
            action="delete_listing",
            entity_type="code_listing",
            entity_id=listing_id
        )
        
        return True

    @rate_limit(max_requests=50, window_seconds=60)
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
        
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(listing.price * 100),  # Convert to cents
            currency="usd",
            metadata={
                "listing_id": listing_id,
                "buyer_id": buyer_id
            }
        )
        
        # Create transaction record
        transaction = Transaction(
            listing_id=listing_id,
            buyer_id=buyer_id,
            amount=listing.price,
            stripe_payment_intent_id=intent.id
        )
        self.db.add(transaction)
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

    @rate_limit(max_requests=50, window_seconds=60)
    async def handle_payment_success(
        self,
        payment_intent_id: str,
        transaction_id: int
    ) -> Transaction:
        """Handle successful payment and generate invocation key."""
        transaction = self.db.query(Transaction).filter(
            Transaction.id == transaction_id,
            Transaction.stripe_payment_intent_id == payment_intent_id
        ).first()
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        if transaction.status != TransactionStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction already processed"
            )
        
        # Update transaction status
        transaction.status = TransactionStatus.COMPLETED
        transaction.updated_at = datetime.utcnow()
        
        # Generate invocation key
        invocation_key = InvocationKey(
            code_listing_id=transaction.listing_id,
            issued_to_user_id=transaction.buyer_id,
            transaction_id=transaction_id,
            status=KeyStatus.ACTIVE
        )
        
        self.db.add(invocation_key)
        self.db.commit()
        
        await log_audit_event(
            self.db,
            user_id=transaction.buyer_id,
            action="payment_success",
            entity_type="transaction",
            entity_id=transaction_id
        )
        
        return transaction

    @rate_limit(max_requests=100, window_seconds=60)
    async def get_creator_dashboard(
        self,
        creator_id: int,
        listing_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get creator dashboard data."""
        query = self.db.query(CodeListing).filter(
            CodeListing.creator_id == creator_id
        )
        
        if listing_id:
            query = query.filter(CodeListing.id == listing_id)
        
        listings = query.all()
        
        dashboard_data = {
            "total_listings": len(listings),
            "active_listings": len([l for l in listings if l.status == ListingStatus.ACTIVE]),
            "total_revenue": sum(t.amount for l in listings for t in l.transactions if t.status == TransactionStatus.COMPLETED),
            "listings": []
        }
        
        for listing in listings:
            listing_data = {
                "id": listing.id,
                "title": listing.title,
                "status": listing.status,
                "price": listing.price,
                "total_sales": len([t for t in listing.transactions if t.status == TransactionStatus.COMPLETED]),
                "total_revenue": sum(t.amount for t in listing.transactions if t.status == TransactionStatus.COMPLETED),
                "active_keys": len([k for k in listing.invocation_keys if k.status == KeyStatus.ACTIVE]),
                "revoked_keys": len([k for k in listing.invocation_keys if k.status == KeyStatus.REVOKED]),
                "usage_stats": {
                    "total_invocations": sum(len(k.usage_logs) for k in listing.invocation_keys),
                    "successful_invocations": sum(
                        len([log for log in k.usage_logs if log.success])
                        for k in listing.invocation_keys
                    )
                }
            }
            dashboard_data["listings"].append(listing_data)
        
        return dashboard_data

    @rate_limit(max_requests=50, window_seconds=60)
    async def revoke_key(
        self,
        key_id: int,
        creator_id: int,
        reason: Optional[str] = None
    ) -> InvocationKey:
        """Revoke an invocation key."""
        key = self.db.query(InvocationKey).join(CodeListing).filter(
            InvocationKey.id == key_id,
            CodeListing.creator_id == creator_id
        ).first()
        
        if not key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key not found"
            )
        
        if key.status == KeyStatus.REVOKED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Key already revoked"
            )
        
        key.status = KeyStatus.REVOKED
        key.revocation_reason = reason
        key.revoked_at = datetime.utcnow()
        self.db.commit()
        
        await log_audit_event(
            self.db,
            user_id=creator_id,
            action="revoke_key",
            entity_type="invocation_key",
            entity_id=key_id,
            metadata={"reason": reason}
        )
        
        return key 