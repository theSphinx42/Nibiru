from fastapi import HTTPException
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

class ProfileService:
    # ... existing code ...

    async def update_profile(self, user_id: str, profile_data: dict) -> dict:
        """Update user profile with validation and error handling."""
        try:
            # Validate required fields
            if 'public_name' in profile_data and not profile_data['public_name']:
                raise ValueError("Display name cannot be empty")

            # Validate URLs if present
            url_fields = ['website', 'twitter', 'github', 'avatar_url']
            for field in url_fields:
                if field in profile_data and profile_data[field]:
                    if not self._is_valid_url(profile_data[field]):
                        raise ValueError(f"Invalid {field.replace('_', ' ')} URL")

            # Map client fields to database fields
            field_mapping = {
                'public_name': 'public_name',
                'bio': 'bio',
                'website': 'website',
                'twitter': 'twitter',
                'github': 'github',
                'avatar_url': 'avatar_url',
                'background_url': 'background_url',
                'is_public': 'is_public',
                'show_quantum_score': 'show_quantum_score',
                'show_affinity': 'show_affinity',
                'show_network': 'show_network',
                'custom_theme': 'custom_theme',
                'notification_preferences': 'notification_preferences'
            }

            # Build update query
            update_fields = []
            values = [user_id]  # First parameter is always user_id
            param_count = 2

            for client_field, db_field in field_mapping.items():
                if client_field in profile_data and profile_data[client_field] is not None:
                    update_fields.append(f"{db_field} = ${param_count}")
                    values.append(profile_data[client_field])
                    param_count += 1

            if not update_fields:
                return await self.get_profile(user_id)

            query = f"""
                UPDATE user_profiles 
                SET {', '.join(update_fields)},
                    last_updated = CURRENT_TIMESTAMP
                WHERE user_id = $1
                RETURNING *
            """

            async with self.pool.acquire() as conn:
                # Check for duplicate public name if being updated
                if 'public_name' in profile_data:
                    existing = await conn.fetchrow('''
                        SELECT user_id FROM user_profiles 
                        WHERE public_name = $1 AND user_id != $2
                    ''', profile_data['public_name'], user_id)
                    if existing:
                        raise ValueError("Display name already taken")

                # Perform update
                row = await conn.fetchrow(query, *values)
                if not row:
                    raise ValueError("Profile not found")

                # Invalidate cache
                await self._invalidate_profile_cache(user_id)

                # Return updated profile
                return await self.get_profile(user_id)

        except ValueError as e:
            logger.error(f"Validation error in update_profile: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error updating profile: {str(e)}")
            raise

    def _is_valid_url(self, url: str) -> bool:
        """Validate URL format."""
        if not url:
            return True
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False

    # ... existing code ...