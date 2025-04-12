from typing import Optional, List, Dict
import redis
import json
from datetime import datetime, timedelta
from pathlib import Path
import shutil
import os
import hashlib
from fastapi import HTTPException

from app.models.listing import InvocationKey, InvocationEvent, LicenseTier
from app.core.config import settings

class InvocationService:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)
        self.secure_storage = Path(settings.SECURE_STORAGE_PATH)
        
    async def generate_key(
        self,
        listing_id: str,
        user_id: str,
        license_tier: LicenseTier,
        max_invocations: Optional[int] = None,
        expiry_days: Optional[int] = None
    ) -> InvocationKey:
        """Generate a new invocation key."""
        key = InvocationKey(
            listing_id=listing_id,
            user_id=user_id,
            license_tier=license_tier,
            max_invocations=max_invocations,
            expires_at=datetime.utcnow() + timedelta(days=expiry_days) if expiry_days else None
        )
        
        # Store key in Redis
        await self._store_key(key)
        
        return key
    
    async def validate_key(
        self,
        key_id: str,
        listing_id: str,
        user_id: str,
        ip_address: str
    ) -> bool:
        """Validate an invocation key and record the attempt."""
        key_data = await self._get_key(key_id)
        if not key_data:
            return False
            
        key = InvocationKey(**key_data)
        
        # Check if key matches listing and is active
        if not (key.listing_id == listing_id and key.is_active):
            return False
            
        # Check expiration
        if key.expires_at and datetime.utcnow() > key.expires_at:
            key.is_active = False
            await self._store_key(key)
            return False
            
        # Check invocation limit
        if key.max_invocations and key.current_invocations >= key.max_invocations:
            key.is_active = False
            await self._store_key(key)
            return False
            
        # Record invocation
        key.current_invocations += 1
        await self._store_key(key)
        
        # Record event
        event = InvocationEvent(
            key_id=key_id,
            listing_id=listing_id,
            user_id=user_id,
            ip_address=ip_address,
            glyph_seed=self._generate_glyph_seed(key_id, ip_address),
            success=True
        )
        await self._store_event(event)
        
        return True
    
    async def get_payload_path(
        self,
        listing_id: str,
        key_id: str,
        path_type: str
    ) -> Optional[str]:
        """Get secure path to runtime payload."""
        key_data = await self._get_key(key_id)
        if not key_data:
            return None
            
        # Validate key and get listing data
        # TODO: Get listing data from database
        listing_path = self.secure_storage / listing_id
        if not listing_path.exists():
            return None
            
        # Map path type to actual file
        path_map = {
            'runtime': 'runtime.py',
            'module': 'module.py',
            'script': 'script.py'
        }
        
        if path_type not in path_map:
            return None
            
        file_path = listing_path / path_map[path_type]
        if not file_path.exists():
            return None
            
        return str(file_path)
    
    async def get_key_info(self, key_id: str) -> Optional[Dict]:
        """Get information about an invocation key."""
        key_data = await self._get_key(key_id)
        if not key_data:
            return None
            
        key = InvocationKey(**key_data)
        events = await self._get_key_events(key_id)
        
        return {
            "key": key.dict(),
            "events": [event.dict() for event in events],
            "usage": {
                "total": key.current_invocations,
                "remaining": (key.max_invocations - key.current_invocations) 
                           if key.max_invocations else None,
                "expires_in": (key.expires_at - datetime.utcnow()).days 
                            if key.expires_at else None
            }
        }
    
    async def _store_key(self, key: InvocationKey) -> None:
        """Store key data in Redis."""
        key_data = json.dumps(key.dict())
        self.redis.set(f"invocation_key:{key.key_id}", key_data)
    
    async def _get_key(self, key_id: str) -> Optional[Dict]:
        """Retrieve key data from Redis."""
        key_data = self.redis.get(f"invocation_key:{key_id}")
        if not key_data:
            return None
        return json.loads(key_data)
    
    async def _store_event(self, event: InvocationEvent) -> None:
        """Store invocation event in Redis."""
        event_data = json.dumps(event.dict())
        
        # Store in time series
        self.redis.zadd(
            f"invocation_events:{event.key_id}",
            {event_data: event.timestamp.timestamp()}
        )
        
        # Store in listing events
        self.redis.zadd(
            f"listing_events:{event.listing_id}",
            {event_data: event.timestamp.timestamp()}
        )
    
    async def _get_key_events(self, key_id: str) -> List[InvocationEvent]:
        """Get all events for a key."""
        events_data = self.redis.zrange(
            f"invocation_events:{key_id}",
            0,
            -1,
            withscores=True
        )
        
        return [
            InvocationEvent(**json.loads(event_data))
            for event_data, _ in events_data
        ]
    
    def _generate_glyph_seed(self, key_id: str, ip_address: str) -> str:
        """Generate a unique glyph seed for this invocation."""
        timestamp = datetime.utcnow().isoformat()
        data = f"{key_id}:{ip_address}:{timestamp}"
        return hashlib.sha256(data.encode()).hexdigest()[:16] 