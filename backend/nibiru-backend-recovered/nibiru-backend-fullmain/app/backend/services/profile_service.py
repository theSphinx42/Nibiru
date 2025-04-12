from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import qrcode
import io
import base64
import logging
import asyncpg
import json
import os
import aioredis
from ..models.user import User, ProfileSettings, QRCodeData, ProfileUpdate
from ..services.sigil_service import SigilService
from ..services.sigil_image_service import SigilImageService
from ..config import settings

logger = logging.getLogger(__name__)

class ProfileService:
    def __init__(self):
        self.pool = None
        self.redis = None
        self.sigil_service = SigilService()
        self.sigil_image_service = SigilImageService()

    async def connect(self):
        """Initialize database and Redis connections."""
        if not self.pool:
            self.pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL,
                min_size=1,
                max_size=10
            )
            await self._create_tables()
        
        if not self.redis:
            self.redis = await aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )

    async def _create_tables(self):
        """Create necessary database tables if they don't exist."""
        async with self.pool.acquire() as conn:
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS user_profiles (
                    user_id TEXT PRIMARY KEY REFERENCES users(id),
                    public_name TEXT NOT NULL UNIQUE,
                    bio TEXT,
                    avatar_url TEXT,
                    qr_code_url TEXT,
                    last_qr_generation TIMESTAMP,
                    is_public BOOLEAN DEFAULT true,
                    show_quantum_score BOOLEAN DEFAULT true,
                    show_affinity BOOLEAN DEFAULT true,
                    show_network BOOLEAN DEFAULT true,
                    custom_theme JSONB,
                    notification_preferences JSONB DEFAULT '{}',
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS user_qr_codes (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT REFERENCES users(id),
                    internal_id TEXT NOT NULL,
                    public_name TEXT NOT NULL,
                    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    is_active BOOLEAN DEFAULT true,
                    last_used TIMESTAMP,
                    use_count INTEGER DEFAULT 0,
                    sigil_data JSONB,
                    verification_token TEXT,
                    verification_expires_at TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_user_profiles_public_name ON user_profiles(public_name);
                CREATE INDEX IF NOT EXISTS idx_user_qr_codes_user_id ON user_qr_codes(user_id);
                CREATE INDEX IF NOT EXISTS idx_user_qr_codes_internal_id ON user_qr_codes(internal_id);
                CREATE INDEX IF NOT EXISTS idx_user_qr_codes_verification_token ON user_qr_codes(verification_token);
            ''')

    async def _get_cached_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get profile from Redis cache."""
        try:
            cached = await self.redis.get(f"profile:{user_id}")
            return json.loads(cached) if cached else None
        except Exception as e:
            logger.error(f"Error getting cached profile: {str(e)}")
            return None

    async def _cache_profile(self, user_id: str, profile_data: Dict[str, Any]):
        """Cache profile data in Redis."""
        try:
            await self.redis.setex(
                f"profile:{user_id}",
                300,  # 5 minutes TTL
                json.dumps(profile_data)
            )
        except Exception as e:
            logger.error(f"Error caching profile: {str(e)}")

    async def _invalidate_profile_cache(self, user_id: str):
        """Invalidate profile cache."""
        try:
            await self.redis.delete(f"profile:{user_id}")
        except Exception as e:
            logger.error(f"Error invalidating profile cache: {str(e)}")

    async def get_profile(self, user_id: str) -> Optional[ProfileSettings]:
        """Get user profile settings with additional metrics."""
        try:
            # Try to get from cache first
            cached_profile = await self._get_cached_profile(user_id)
            if cached_profile:
                return ProfileSettings(**cached_profile)

            async with self.pool.acquire() as conn:
                # Get profile data
                row = await conn.fetchrow('''
                    SELECT p.*, u.quantum_score, u.internal_name
                    FROM user_profiles p
                    JOIN users u ON u.id = p.user_id
                    WHERE p.user_id = $1
                ''', user_id)
                
                if not row:
                    return None

                # Get current sigil data
                sigil_data = await self.sigil_service.generate_user_sigil(User(**dict(row)))
                
                # Create profile settings with additional data
                profile_data = dict(row)
                profile_data['quantum_score'] = row['quantum_score']
                profile_data['sigil_url'] = f"/api/v1/profile/sigil/{user_id}" if sigil_data else None
                
                profile = ProfileSettings(**profile_data)
                
                # Cache the profile
                await self._cache_profile(user_id, profile_data)
                
                return profile
        except Exception as e:
            logger.error(f"Error getting profile: {str(e)}")
            return None

    async def get_sigil_image(self, user_id: str, animated: bool = False) -> Optional[bytes]:
        """Get the sigil image for a user."""
        try:
            # Try to get from cache first
            cache_key = f"sigil:{user_id}:{'animated' if animated else 'static'}"
            cached_sigil = await self.redis.get(cache_key)
            if cached_sigil:
                return base64.b64decode(cached_sigil)

            async with self.pool.acquire() as conn:
                # Get user data
                row = await conn.fetchrow('''
                    SELECT u.*, p.quantum_score
                    FROM users u
                    JOIN user_profiles p ON p.user_id = u.id
                    WHERE u.id = $1
                ''', user_id)
                
                if not row:
                    return None

                # Generate sigil data
                sigil_data = await self.sigil_service.generate_user_sigil(User(**dict(row)))
                if not sigil_data:
                    return None

                # Get user metrics
                affinity = await self.sigil_service.analytics_service.get_user_affinity(user_id)
                quantum_score = row['quantum_score']
                network_metrics = await self.sigil_service.analytics_service.get_user_network(user_id)

                # Generate sigil image
                sigil_image = self.sigil_image_service.generate_sigil_image(
                    sigil_data,
                    affinity,
                    quantum_score,
                    network_metrics,
                    animated=animated
                )

                if sigil_image:
                    # Cache the sigil image with appropriate TTL
                    ttl = 300  # 5 minutes for static, 1 hour for animated
                    if animated:
                        ttl = 3600
                    
                    await self.redis.setex(
                        cache_key,
                        ttl,
                        base64.b64encode(sigil_image).decode()
                    )
                
                return sigil_image
                
        except Exception as e:
            logger.error(f"Error getting sigil image: {str(e)}")
            return None

    async def update_profile(
        self,
        user_id: str,
        update: ProfileUpdate,
        current_profile: ProfileSettings
    ) -> Optional[ProfileSettings]:
        """Update user profile settings."""
        try:
            async with self.pool.acquire() as conn:
                # Check for duplicate public name if being updated
                if update.public_name and update.public_name != current_profile.public_name:
                    existing = await conn.fetchrow('''
                        SELECT user_id FROM user_profiles 
                        WHERE public_name = $1 AND user_id != $2
                    ''', update.public_name, user_id)
                    if existing:
                        raise ValueError("Public name already taken")

                # Build update query
                update_fields = []
                values = []
                for field, value in update.dict(exclude_unset=True).items():
                    if value is not None:
                        update_fields.append(f"{field} = ${len(values) + 1}")
                        values.append(value)
                
                if not update_fields:
                    return current_profile
                
                # Add last_updated
                update_fields.append("last_updated = CURRENT_TIMESTAMP")
                
                query = f'''
                    UPDATE user_profiles 
                    SET {', '.join(update_fields)}
                    WHERE user_id = ${len(values) + 1}
                    RETURNING *
                '''
                values.append(user_id)
                
                row = await conn.fetchrow(query, *values)
                if row:
                    updated_profile = ProfileSettings(**dict(row))
                    # Invalidate caches
                    await self._invalidate_profile_cache(user_id)
                    await self.redis.delete(f"sigil:{user_id}")
                    return updated_profile
                return None
        except Exception as e:
            logger.error(f"Error updating profile: {str(e)}")
            raise

    async def generate_qr_code(
        self,
        user_id: str,
        internal_name: str,
        public_name: str
    ) -> Optional[QRCodeData]:
        """Generate a new QR code for the user with integrated sigil."""
        try:
            # Get user data
            async with self.pool.acquire() as conn:
                user_data = await conn.fetchrow('''
                    SELECT * FROM users WHERE id = $1
                ''', user_id)
                if not user_data:
                    return None
                user = User(**dict(user_data))

            # Generate sigil
            sigil_data = await self.sigil_service.generate_user_sigil(user)
            if not sigil_data:
                return None

            # Generate verification token
            verification_token = self._generate_verification_token()
            verification_expires = datetime.utcnow() + timedelta(hours=24)

            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            
            # Create QR data with sigil
            qr_data = {
                "internal_id": internal_name,
                "public_name": public_name,
                "sigil": sigil_data["sigil"],
                "verification_token": verification_token,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            qr.add_data(str(qr_data))
            qr.make(fit=True)
            
            # Create QR image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            qr_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            # Store QR code data
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow('''
                    INSERT INTO user_qr_codes (
                        user_id, internal_id, public_name, generated_at,
                        sigil_data, verification_token, verification_expires_at
                    ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6)
                    RETURNING *
                ''', user_id, internal_name, public_name, json.dumps(sigil_data),
                    verification_token, verification_expires)
                
                qr_code = QRCodeData(**dict(row)) if row else None
                
                if qr_code:
                    # Update profile with QR code URL
                    await conn.execute('''
                        UPDATE user_profiles 
                        SET qr_code_url = $1, last_qr_generation = CURRENT_TIMESTAMP
                        WHERE user_id = $2
                    ''', f"data:image/png;base64,{qr_base64}", user_id)
                
                return qr_code
                
        except Exception as e:
            logger.error(f"Error generating QR code: {str(e)}")
            return None

    def _generate_verification_token(self) -> str:
        """Generate a secure verification token."""
        return base64.b64encode(os.urandom(32)).decode()

    async def verify_qr_code(
        self,
        internal_id: str,
        public_name: str,
        verification_token: str
    ) -> Optional[Dict[str, Any]]:
        """Verify a QR code and return user data if valid."""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow('''
                    SELECT u.id, u.internal_name, p.public_name, p.avatar_url,
                           qr.sigil_data, qr.verification_expires_at
                    FROM user_qr_codes qr
                    JOIN users u ON u.id = qr.user_id
                    JOIN user_profiles p ON p.user_id = u.id
                    WHERE qr.internal_id = $1 
                    AND qr.is_active = true
                    AND qr.verification_token = $2
                    AND qr.verification_expires_at > CURRENT_TIMESTAMP
                    AND (qr.expires_at IS NULL OR qr.expires_at > CURRENT_TIMESTAMP)
                ''', internal_id, verification_token)
                
                if row and row['public_name'] == public_name:
                    # Record usage
                    await self.record_qr_usage(internal_id)
                    
                    # Get current user metrics for sigil verification
                    user = User(**dict(row))
                    affinity = await self.sigil_service.analytics_service.get_user_affinity(user.id)
                    quantum_score = await self.sigil_service.analytics_service.get_user_quantum_score(user.id)
                    network_metrics = await self.sigil_service.analytics_service.get_user_network(user.id)

                    # Verify sigil
                    sigil_valid = self.sigil_service.verify_sigil(
                        row['sigil_data'],
                        user,
                        affinity,
                        quantum_score,
                        network_metrics
                    )

                    if not sigil_valid:
                        return None

                    return {
                        "user_id": row['id'],
                        "internal_name": row['internal_name'],
                        "public_name": row['public_name'],
                        "avatar_url": row['avatar_url'],
                        "verification_expires_at": row['verification_expires_at']
                    }
                return None
        except Exception as e:
            logger.error(f"Error validating QR code: {str(e)}")
            return None

    async def initiate_verification(
        self,
        internal_id: str,
        public_name: str
    ) -> Optional[Dict[str, Any]]:
        """Initiate a verification process for a QR code."""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow('''
                    SELECT * FROM user_qr_codes
                    WHERE internal_id = $1 AND public_name = $2
                    AND is_active = true
                    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                ''', internal_id, public_name)

                if not row:
                    return None

                # Generate new verification token
                verification_token = self._generate_verification_token()
                verification_expires = datetime.utcnow() + timedelta(minutes=15)

                # Update QR code with new verification token
                await conn.execute('''
                    UPDATE user_qr_codes
                    SET verification_token = $1,
                        verification_expires_at = $2
                    WHERE id = $3
                ''', verification_token, verification_expires, row['id'])

                return {
                    "verification_token": verification_token,
                    "expires_at": verification_expires
                }

        except Exception as e:
            logger.error(f"Error initiating verification: {str(e)}")
            return None

    async def get_user_qr_codes(self, user_id: str) -> List[QRCodeData]:
        """Get all QR codes for a user."""
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch('''
                    SELECT * FROM user_qr_codes 
                    WHERE user_id = $1 
                    ORDER BY generated_at DESC
                ''', user_id)
                return [QRCodeData(**dict(row)) for row in rows]
        except Exception as e:
            logger.error(f"Error getting user QR codes: {str(e)}")
            return []

    async def deactivate_qr_code(self, qr_id: int, user_id: str) -> bool:
        """Deactivate a QR code."""
        try:
            async with self.pool.acquire() as conn:
                await conn.execute('''
                    UPDATE user_qr_codes 
                    SET is_active = false 
                    WHERE id = $1 AND user_id = $2
                ''', qr_id, user_id)
                return True
        except Exception as e:
            logger.error(f"Error deactivating QR code: {str(e)}")
            return False

    async def record_qr_usage(self, internal_id: str) -> bool:
        """Record usage of a QR code."""
        try:
            async with self.pool.acquire() as conn:
                await conn.execute('''
                    UPDATE user_qr_codes 
                    SET last_used = CURRENT_TIMESTAMP,
                        use_count = use_count + 1
                    WHERE internal_id = $1 AND is_active = true
                ''', internal_id)
                return True
        except Exception as e:
            logger.error(f"Error recording QR usage: {str(e)}")
            return False

    async def validate_qr_code(
        self,
        internal_id: str,
        public_name: str
    ) -> Optional[Dict[str, Any]]:
        """Validate a QR code and return user data if valid."""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow('''
                    SELECT u.id, u.internal_name, p.public_name, p.avatar_url
                    FROM user_qr_codes qr
                    JOIN users u ON u.id = qr.user_id
                    JOIN user_profiles p ON p.user_id = u.id
                    WHERE qr.internal_id = $1 
                    AND qr.is_active = true
                    AND (qr.expires_at IS NULL OR qr.expires_at > CURRENT_TIMESTAMP)
                ''', internal_id)
                
                if row and row['public_name'] == public_name:
                    # Record usage
                    await self.record_qr_usage(internal_id)
                    return dict(row)
                return None
        except Exception as e:
            logger.error(f"Error validating QR code: {str(e)}")
            return None 