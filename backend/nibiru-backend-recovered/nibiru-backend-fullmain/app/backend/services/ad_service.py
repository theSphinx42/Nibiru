from typing import List, Optional, Dict, Any
from datetime import datetime, time
import redis
import json
import logging
import uuid
from ..models.constellation import (
    Ad,
    AdType,
    UserAdResponse,
    AdTargeting,
    TimeTargeting,
    UserBehavior
)
from ..config import settings
from .ad_db_service import AdDBService

logger = logging.getLogger(__name__)

class AdService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=0,
            decode_responses=True
        )
        self.cache_ttl = 300  # 5 minutes
        self.db_service = AdDBService()

    async def initialize(self):
        """Initialize the service."""
        await self.db_service.connect()

    async def get_user_ads(
        self,
        user_id: str,
        quantum_score: int,
        affinity: str,
        is_premium: bool,
        user_context: Dict[str, Any] = None
    ) -> UserAdResponse:
        """Get personalized ads for a user with caching."""
        try:
            # Check if user has ad-free access
            if is_premium:
                return UserAdResponse(
                    ads=[],
                    is_ad_free=True,
                    last_updated=datetime.utcnow()
                )

            # Try to get from cache first
            cache_key = f"user_ads:{user_id}"
            cached_data = await self.redis_client.get(cache_key)
            
            if cached_data:
                return UserAdResponse.parse_raw(cached_data)

            # Get fresh ad data
            ads = await self._get_personalized_ads(
                user_id,
                quantum_score,
                affinity,
                user_context
            )
            
            # Create response
            response = UserAdResponse(
                ads=ads,
                is_ad_free=False,
                last_updated=datetime.utcnow()
            )
            
            # Cache the response
            await self.redis_client.setex(
                cache_key,
                self.cache_ttl,
                response.json()
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error getting user ads: {str(e)}")
            return UserAdResponse(
                ads=[],
                is_ad_free=False,
                last_updated=datetime.utcnow()
            )

    async def _get_personalized_ads(
        self,
        user_id: str,
        quantum_score: int,
        affinity: str,
        user_context: Dict[str, Any] = None
    ) -> List[Ad]:
        """Get personalized ads based on user metrics and context."""
        try:
            # Get all active ads from database
            ads = await self.db_service.get_active_ads()
            
            # Filter and sort ads based on user metrics and context
            personalized_ads = []
            for ad in ads:
                if await self._is_ad_relevant(
                    ad,
                    quantum_score,
                    affinity,
                    user_context
                ):
                    personalized_ads.append(ad)
            
            # Sort by priority and limit to top 5
            personalized_ads.sort(key=lambda x: x.priority, reverse=True)
            return personalized_ads[:5]
            
        except Exception as e:
            logger.error(f"Error getting personalized ads: {str(e)}")
            return []

    async def _is_ad_relevant(
        self,
        ad: Ad,
        quantum_score: int,
        affinity: str,
        user_context: Dict[str, Any] = None
    ) -> bool:
        """Check if an ad is relevant for the user with enhanced targeting."""
        try:
            targeting = ad.targeting
            
            # Check quantum score range
            if targeting.min_quantum_score and quantum_score < targeting.min_quantum_score:
                return False
            if targeting.max_quantum_score and quantum_score > targeting.max_quantum_score:
                return False
                
            # Check affinity match
            if targeting.target_affinity and targeting.target_affinity != affinity:
                return False
            if targeting.exclude_affinities and affinity in targeting.exclude_affinities:
                return False
                
            # Check time targeting
            if targeting.time_targeting:
                if not self._is_time_relevant(targeting.time_targeting):
                    return False
            
            # Check user behaviors
            if user_context and user_context.get('behaviors'):
                if targeting.target_behaviors:
                    if not any(
                        behavior in user_context['behaviors']
                        for behavior in targeting.target_behaviors
                    ):
                        return False
                if targeting.exclude_behaviors:
                    if any(
                        behavior in user_context['behaviors']
                        for behavior in targeting.exclude_behaviors
                    ):
                        return False
            
            # Check network metrics
            if user_context and user_context.get('network'):
                network = user_context['network']
                if targeting.min_network_size and network.get('total_size', 0) < targeting.min_network_size:
                    return False
                if targeting.min_mentor_count and network.get('mentor_count', 0) < targeting.min_mentor_count:
                    return False
                if targeting.min_peer_count and network.get('peer_count', 0) < targeting.min_peer_count:
                    return False
                if targeting.min_rival_count and network.get('rival_count', 0) < targeting.min_rival_count:
                    return False
            
            # Check custom rules
            if targeting.custom_rules:
                if not self._evaluate_custom_rules(targeting.custom_rules, user_context):
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking ad relevance: {str(e)}")
            return False

    def _is_time_relevant(self, time_targeting: TimeTargeting) -> bool:
        """Check if the current time matches the targeting criteria."""
        try:
            now = datetime.utcnow()
            current_time = now.time()
            
            # Check time range
            if time_targeting.start_time and current_time < time_targeting.start_time:
                return False
            if time_targeting.end_time and current_time > time_targeting.end_time:
                return False
            
            # Check days of week
            if time_targeting.days_of_week and now.weekday() not in time_targeting.days_of_week:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking time relevance: {str(e)}")
            return False

    def _evaluate_custom_rules(
        self,
        rules: Dict[str, Any],
        user_context: Dict[str, Any]
    ) -> bool:
        """Evaluate custom targeting rules."""
        try:
            for rule_key, rule_value in rules.items():
                if rule_key not in user_context:
                    return False
                if user_context[rule_key] != rule_value:
                    return False
            return True
        except Exception as e:
            logger.error(f"Error evaluating custom rules: {str(e)}")
            return False

    async def create_ad(self, ad_data: dict, user_id: str) -> Optional[Ad]:
        """Create a new ad."""
        try:
            # Generate unique ID
            ad_data['id'] = str(uuid.uuid4())
            
            # Create ad in database
            ad = await self.db_service.create_ad(ad_data, user_id)
            
            # Invalidate relevant caches
            await self._invalidate_relevant_caches(ad)
            
            return ad
        except Exception as e:
            logger.error(f"Error creating ad: {str(e)}")
            return None

    async def update_ad(self, ad_id: str, ad_data: dict, user_id: str) -> Optional[Ad]:
        """Update an existing ad."""
        try:
            # Update ad in database
            ad = await self.db_service.update_ad(ad_id, ad_data, user_id)
            
            # Invalidate relevant caches
            await self._invalidate_relevant_caches(ad)
            
            return ad
        except Exception as e:
            logger.error(f"Error updating ad: {str(e)}")
            return None

    async def delete_ad(self, ad_id: str) -> bool:
        """Delete an ad."""
        try:
            # Get ad before deletion for cache invalidation
            ad = await self.db_service.get_ad(ad_id)
            if not ad:
                return False
            
            # Delete ad from database
            success = await self.db_service.delete_ad(ad_id)
            
            if success:
                # Invalidate relevant caches
                await self._invalidate_relevant_caches(ad)
            
            return success
        except Exception as e:
            logger.error(f"Error deleting ad: {str(e)}")
            return False

    async def record_impression(self, ad_id: str, user_id: str, context: Dict[str, Any] = None):
        """Record an ad impression."""
        try:
            await self.db_service.record_impression(ad_id, user_id, context)
        except Exception as e:
            logger.error(f"Error recording impression: {str(e)}")

    async def record_click(self, ad_id: str, user_id: str, context: Dict[str, Any] = None):
        """Record an ad click."""
        try:
            await self.db_service.record_click(ad_id, user_id, context)
        except Exception as e:
            logger.error(f"Error recording click: {str(e)}")

    async def record_conversion(self, ad_id: str, user_id: str, context: Dict[str, Any] = None):
        """Record an ad conversion."""
        try:
            await self.db_service.record_conversion(ad_id, user_id, context)
        except Exception as e:
            logger.error(f"Error recording conversion: {str(e)}")

    async def get_ad_stats(self, ad_id: str) -> Optional[AdStats]:
        """Get statistics for an ad."""
        try:
            return await self.db_service.get_ad_stats(ad_id)
        except Exception as e:
            logger.error(f"Error getting ad stats: {str(e)}")
            return None

    async def _invalidate_relevant_caches(self, ad: Ad):
        """Invalidate caches that might be affected by ad changes."""
        try:
            # Invalidate user-specific caches
            if ad.targeting.target_affinity:
                pattern = f"user_ads:*"
                keys = await self.redis_client.keys(pattern)
                if keys:
                    await self.redis_client.delete(*keys)
        except Exception as e:
            logger.error(f"Error invalidating caches: {str(e)}") 