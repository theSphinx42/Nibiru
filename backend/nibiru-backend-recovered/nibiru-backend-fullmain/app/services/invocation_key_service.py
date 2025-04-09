import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict
from sqlalchemy.orm import Session
from app.models.invocation_key import InvocationKey, KeyStatus
from app.models.code_listing import CodeListing
from app.models.user import User
from app.services.saphira_service import SaphiraService
from app.core.settings import settings

class InvocationKeyService:
    def __init__(self, db: Session):
        self.db = db
        self.saphira_service = SaphiraService()

    def generate_key_hash(self) -> str:
        """Generate a unique key hash using UUID and timestamp."""
        unique_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        combined = f"{unique_id}:{timestamp}"
        return hashlib.sha256(combined.encode()).hexdigest()

    def create_invocation_key(
        self,
        code_listing: CodeListing,
        user: User,
        usage_limit: Optional[int] = None,
        expiration_days: Optional[int] = None,
        metadata: Optional[Dict] = None
    ) -> InvocationKey:
        """Create a new invocation key for a code listing."""
        # Generate key hash
        key_hash = self.generate_key_hash()
        
        # Generate glyph hash using SaphiraService
        glyph_hash = self.saphira_service.generate_spirit_glyph(code_listing.content)
        
        # Calculate expiration if specified
        expiration = None
        if expiration_days:
            expiration = datetime.utcnow() + timedelta(days=expiration_days)
        
        # Create the invocation key
        invocation_key = InvocationKey(
            key_hash=key_hash,
            glyph_hash=glyph_hash,
            code_listing_id=code_listing.id,
            issued_to_user_id=user.id,
            expiration=expiration,
            usage_limit=usage_limit,
            uses_remaining=usage_limit,
            metadata=metadata,
            status=KeyStatus.PENDING
        )
        
        self.db.add(invocation_key)
        self.db.commit()
        self.db.refresh(invocation_key)
        
        return invocation_key

    def validate_key(self, key_hash: str) -> Optional[InvocationKey]:
        """Validate an invocation key and return it if valid."""
        key = self.db.query(InvocationKey).filter(InvocationKey.key_hash == key_hash).first()
        if not key:
            return None
            
        # Check if key is expired
        if key.expiration and key.expiration < datetime.utcnow():
            key.status = KeyStatus.EXPIRED
            self.db.commit()
            return None
            
        # Check if key is revoked
        if key.status == KeyStatus.REVOKED:
            return None
            
        # Check usage limit
        if key.usage_limit and key.uses_remaining <= 0:
            key.status = KeyStatus.EXPIRED
            self.db.commit()
            return None
            
        return key

    def activate_key(self, key_hash: str) -> Optional[InvocationKey]:
        """Activate an invocation key."""
        key = self.validate_key(key_hash)
        if not key:
            return None
            
        key.status = KeyStatus.ACTIVE
        key.activation_date = datetime.utcnow()
        self.db.commit()
        self.db.refresh(key)
        
        return key

    def use_key(self, key_hash: str) -> Optional[InvocationKey]:
        """Record usage of an invocation key."""
        key = self.validate_key(key_hash)
        if not key:
            return None
            
        key.last_used = datetime.utcnow()
        if key.uses_remaining is not None:
            key.uses_remaining -= 1
            if key.uses_remaining <= 0:
                key.status = KeyStatus.EXPIRED
                
        self.db.commit()
        self.db.refresh(key)
        
        return key

    def revoke_key(self, key_hash: str) -> Optional[InvocationKey]:
        """Revoke an invocation key."""
        key = self.db.query(InvocationKey).filter(InvocationKey.key_hash == key_hash).first()
        if not key:
            return None
            
        key.status = KeyStatus.REVOKED
        self.db.commit()
        self.db.refresh(key)
        
        return key

    def get_user_keys(self, user_id: int) -> list[InvocationKey]:
        """Get all invocation keys for a user."""
        return self.db.query(InvocationKey).filter(
            InvocationKey.issued_to_user_id == user_id
        ).all()

    def get_listing_keys(self, listing_id: int) -> list[InvocationKey]:
        """Get all invocation keys for a code listing."""
        return self.db.query(InvocationKey).filter(
            InvocationKey.code_listing_id == listing_id
        ).all() 