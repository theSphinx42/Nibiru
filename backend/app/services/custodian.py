from datetime import datetime, timedelta
from typing import List, Optional, Dict
from app.models.custodial import (
    CustodialStatus,
    CustodialCriteria,
    CustodialMetadata,
    CustodialAsset
)
from app.models.listing import Listing
from app.core.config import NIBIRU_SYSTEM_ID
from app.core.email import send_email_template
from app.core.notifications import create_notification
from enum import Enum

class RecoveryStep(str, Enum):
    REQUESTED = "requested"
    EMAIL_VERIFIED = "email_verified"
    GLYPH_CONFIRMED = "glyph_confirmed"
    COMPLETED = "completed"

class CustodianService:
    def __init__(self):
        self.criteria = CustodialCriteria()
    
    async def check_listings_for_custodianship(self) -> List[str]:
        """
        Periodic check for listings that meet custodianship criteria.
        Returns list of listing IDs that were converted to custodial status.
        """
        converted_listings = []
        
        # Get all active listings
        active_listings = await self._get_active_listings()
        
        for listing in active_listings:
            if await self._should_convert_to_custodial(listing):
                await self._convert_to_custodial(listing)
                converted_listings.append(listing.id)
                
        return converted_listings
    
    async def _should_convert_to_custodial(self, listing: Listing) -> bool:
        """Check if a listing meets criteria for custodianship."""
        # Skip if already custodial or in recovery
        if hasattr(listing, 'custodial_metadata'):
            if listing.custodial_metadata.status in [
                CustodialStatus.CUSTODIAL,
                CustodialStatus.RECOVERY_REQUESTED
            ]:
                return False
        
        # Get last activity timestamp
        last_activity = await self._get_last_owner_activity(listing)
        days_inactive = (datetime.utcnow() - last_activity).days
        
        # Get listing metrics
        quantum_score = await self._get_quantum_score(listing)
        sales_count = await self._get_sales_count(listing)
        active_users = await self._get_active_users_count(listing)
        
        # Check against criteria
        meets_criteria = (
            days_inactive >= self.criteria.inactivity_threshold_days and
            (quantum_score >= self.criteria.quantum_score_threshold or
             sales_count >= self.criteria.min_sales_count or
             active_users >= self.criteria.min_active_users)
        )
        
        if meets_criteria:
            # Update status to eligible if not already
            if not hasattr(listing, 'custodial_metadata'):
                await self._mark_as_eligible(listing, last_activity)
            return True
            
        return False
    
    async def _convert_to_custodial(self, listing: Listing):
        """Convert a listing to custodial status."""
        # Create custodial metadata
        metadata = CustodialMetadata(
            status=CustodialStatus.CUSTODIAL,
            original_owner_id=listing.owner_id,
            custodial_since=datetime.utcnow(),
            last_owner_activity=await self._get_last_owner_activity(listing),
            recovery_requested_at=None,
            quantum_score=await self._get_quantum_score(listing),
            total_sales=await self._get_sales_count(listing),
            active_users=await self._get_active_users_count(listing)
        )
        
        # Create custodial asset
        custodial_asset = CustodialAsset(
            listing_id=listing.id,
            metadata=metadata,
            universal_access=True,
            base_price=1.0,
            has_sigil=True
        )
        
        # Update listing
        await self._update_listing(listing.id, {
            'owner_id': NIBIRU_SYSTEM_ID,
            'custodial_metadata': metadata.dict(),
            'universal_access': True,
            'base_price': custodial_asset.base_price,
            'has_sigil': True,
            'donation_allocation': custodial_asset.donation_allocation,
            'custodial_message': custodial_asset.custodial_message
        })
        
        # Set up donation handling
        await self._setup_donation_handling(listing.id)
        
        # Notify original owner
        await self._notify_owner_of_custodianship(listing)
    
    async def _setup_donation_handling(self, listing_id: str):
        """Configure donation handling for custodial listing."""
        # TODO: Implement donation routing system
        pass
    
    async def request_recovery(self, listing_id: str, user_id: str) -> bool:
        """Initiate the recovery process (Step 1)."""
        listing = await self._get_listing(listing_id)
        
        if not listing or not hasattr(listing, 'custodial_metadata'):
            return False
            
        metadata = listing.custodial_metadata
        
        if (metadata.status != CustodialStatus.CUSTODIAL or
            metadata.original_owner_id != user_id):
            return False
            
        # Update metadata with recovery step tracking
        metadata.status = CustodialStatus.RECOVERY_REQUESTED
        metadata.recovery_requested_at = datetime.utcnow()
        metadata.recovery_step = RecoveryStep.REQUESTED
        
        await self._update_listing(listing_id, {
            'custodial_metadata': metadata.dict()
        })
        
        # Send verification email
        await self._send_recovery_verification_email(listing, user_id)
        
        # Create notification
        await self._notify_recovery_status_change(listing, RecoveryStep.REQUESTED)
        
        return True

    async def verify_recovery_email(self, listing_id: str, token: str) -> bool:
        """Verify email confirmation (Step 2)."""
        listing = await self._get_listing(listing_id)
        
        if not self._validate_recovery_token(token, listing):
            return False
            
        metadata = listing.custodial_metadata
        metadata.recovery_step = RecoveryStep.EMAIL_VERIFIED
        
        await self._update_listing(listing_id, {
            'custodial_metadata': metadata.dict()
        })
        
        # Create notification
        await self._notify_recovery_status_change(listing, RecoveryStep.EMAIL_VERIFIED)
        
        return True

    async def confirm_recovery_glyph(self, listing_id: str, glyph_signature: str) -> bool:
        """Confirm ownership via glyph signature (Step 3)."""
        listing = await self._get_listing(listing_id)
        
        if not self._validate_glyph_signature(glyph_signature, listing):
            return False
            
        metadata = listing.custodial_metadata
        metadata.recovery_step = RecoveryStep.GLYPH_CONFIRMED
        
        await self._update_listing(listing_id, {
            'custodial_metadata': metadata.dict()
        })
        
        # Create notification
        await self._notify_recovery_status_change(listing, RecoveryStep.GLYPH_CONFIRMED)
        
        return True

    async def approve_recovery(self, listing_id: str) -> bool:
        """Complete recovery process and return listing."""
        listing = await self._get_listing(listing_id)
        
        if not listing or not hasattr(listing, 'custodial_metadata'):
            return False
            
        metadata = listing.custodial_metadata
        
        if (metadata.status != CustodialStatus.RECOVERY_REQUESTED or
            metadata.recovery_step != RecoveryStep.GLYPH_CONFIRMED):
            return False
            
        # Preserve donation settings
        custodial_donation_data = {
            'custodial_period_start': metadata.custodial_since,
            'custodial_period_end': datetime.utcnow(),
            'donation_allocation': listing.donation_allocation
        }
        
        # Return to original owner
        await self._update_listing(listing_id, {
            'owner_id': metadata.original_owner_id,
            'custodial_metadata': None,
            'universal_access': False,
            'has_sigil': False,
            'custodial_donation_history': custodial_donation_data
        })
        
        # Send completion notification
        await self._notify_recovery_status_change(listing, RecoveryStep.COMPLETED)
        
        return True

    async def get_donation_stats(self, listing_id: str) -> dict:
        """Get donation statistics for a custodial listing."""
        # TODO: Implement donation statistics tracking
        pass
    
    # Database interaction methods (to be implemented)
    async def _get_active_listings(self) -> List[Listing]:
        """Get all active listings from database."""
        # TODO: Implement database query
        pass
    
    async def _get_listing(self, listing_id: str) -> Optional[Listing]:
        """Get listing by ID from database."""
        # TODO: Implement database query
        pass
    
    async def _update_listing(self, listing_id: str, updates: dict):
        """Update listing in database."""
        # TODO: Implement database update
        pass
    
    async def _get_last_owner_activity(self, listing: Listing) -> datetime:
        """Get timestamp of last owner activity."""
        # TODO: Implement activity check
        pass
    
    async def _get_quantum_score(self, listing: Listing) -> float:
        """Get current quantum score for listing."""
        # TODO: Implement score calculation
        pass
    
    async def _get_sales_count(self, listing: Listing) -> int:
        """Get total sales count for listing."""
        # TODO: Implement sales query
        pass
    
    async def _get_active_users_count(self, listing: Listing) -> int:
        """Get count of active users for listing."""
        # TODO: Implement user count query
        pass
    
    async def _mark_as_eligible(self, listing: Listing, last_activity: datetime):
        """Mark listing as eligible for custodianship."""
        metadata = CustodialMetadata(
            status=CustodialStatus.ELIGIBLE,
            original_owner_id=listing.owner_id,
            custodial_since=None,
            last_owner_activity=last_activity,
            recovery_requested_at=None,
            quantum_score=await self._get_quantum_score(listing),
            total_sales=await self._get_sales_count(listing),
            active_users=await self._get_active_users_count(listing)
        )
        
        await self._update_listing(listing.id, {
            'custodial_metadata': metadata.dict()
        })
    
    async def _notify_owner_of_custodianship(self, listing: Listing):
        """Send notification when listing enters custodianship."""
        # Email notification
        await send_email_template(
            template="custodial_status",
            to_email=listing.owner.email,
            context={
                "listing_name": listing.name,
                "custodial_date": datetime.utcnow().strftime("%Y-%m-%d"),
                "recovery_link": f"/recover/{listing.id}"
            }
        )
        
        # In-app notification
        await create_notification(
            user_id=listing.owner_id,
            type="custodial_status",
            title="Listing Now Under NIBIRU Protection",
            message=f"Your listing '{listing.name}' is now under NIBIRU's protection.",
            metadata={
                "listing_id": listing.id,
                "status": "custodial",
                "action_url": f"/recover/{listing.id}"
            }
        )

    async def _notify_recovery_status_change(self, listing: Listing, step: RecoveryStep):
        """Send notification for recovery status changes."""
        messages = {
            RecoveryStep.REQUESTED: "Recovery process initiated",
            RecoveryStep.EMAIL_VERIFIED: "Email verification completed",
            RecoveryStep.GLYPH_CONFIRMED: "Glyph signature confirmed",
            RecoveryStep.COMPLETED: "Recovery process completed"
        }
        
        # Email notification
        await send_email_template(
            template="recovery_status",
            to_email=listing.owner.email,
            context={
                "listing_name": listing.name,
                "status": step,
                "message": messages[step],
                "next_step": self._get_next_recovery_step_instructions(step)
            }
        )
        
        # In-app notification with badge flicker effect
        await create_notification(
            user_id=listing.owner_id,
            type="recovery_status",
            title=f"Recovery Status Update: {messages[step]}",
            message=self._get_next_recovery_step_instructions(step),
            metadata={
                "listing_id": listing.id,
                "recovery_step": step,
                "animate_badge": True
            }
        )

    def _get_next_recovery_step_instructions(self, current_step: RecoveryStep) -> str:
        """Get instructions for the next recovery step."""
        instructions = {
            RecoveryStep.REQUESTED: "Please check your email to verify your identity.",
            RecoveryStep.EMAIL_VERIFIED: "Please sign with your Spirit Glyph to confirm ownership.",
            RecoveryStep.GLYPH_CONFIRMED: "Recovery approved! Your listing will be returned shortly.",
            RecoveryStep.COMPLETED: "Recovery process completed successfully."
        }
        return instructions[current_step]

    # Notification Methods
    async def _send_recovery_verification_email(self, listing: Listing, user_id: str):
        """Send recovery verification email to the original owner."""
        # TODO: Implement email sending logic
        pass

    async def _validate_recovery_token(self, token: str, listing: Listing) -> bool:
        """Validate the recovery token."""
        # TODO: Implement token validation logic
        return False

    async def _validate_glyph_signature(self, glyph_signature: str, listing: Listing) -> bool:
        """Validate the glyph signature."""
        # TODO: Implement glyph signature validation logic
        return False 