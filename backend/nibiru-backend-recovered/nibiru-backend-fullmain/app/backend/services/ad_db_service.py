from typing import List, Optional, Dict, Any
from datetime import datetime, time
import asyncpg
import logging
from ..models.constellation import (
    Ad,
    AdCreate,
    AdUpdate,
    AdStats,
    AdTargeting,
    TimeTargeting,
    UserBehavior
)
from ..config import settings

logger = logging.getLogger(__name__)

class AdDBService:
    def __init__(self):
        self.pool = None

    async def connect(self):
        """Initialize database connection pool."""
        if not self.pool:
            self.pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL,
                min_size=1,
                max_size=10
            )
            await self._create_tables()

    async def _create_tables(self):
        """Create necessary database tables if they don't exist."""
        async with self.pool.acquire() as conn:
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS ads (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    logo_url TEXT NOT NULL,
                    link TEXT NOT NULL,
                    targeting JSONB NOT NULL,
                    start_date TIMESTAMP NOT NULL,
                    end_date TIMESTAMP,
                    is_active BOOLEAN DEFAULT true,
                    priority INTEGER DEFAULT 0,
                    metrics JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by TEXT NOT NULL,
                    last_modified_by TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS ad_impressions (
                    id SERIAL PRIMARY KEY,
                    ad_id TEXT REFERENCES ads(id),
                    user_id TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    context JSONB
                );

                CREATE TABLE IF NOT EXISTS ad_clicks (
                    id SERIAL PRIMARY KEY,
                    ad_id TEXT REFERENCES ads(id),
                    user_id TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    context JSONB
                );

                CREATE TABLE IF NOT EXISTS ad_conversions (
                    id SERIAL PRIMARY KEY,
                    ad_id TEXT REFERENCES ads(id),
                    user_id TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    context JSONB
                );

                CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(is_active);
                CREATE INDEX IF NOT EXISTS idx_ads_dates ON ads(start_date, end_date);
                CREATE INDEX IF NOT EXISTS idx_ads_priority ON ads(priority);
                CREATE INDEX IF NOT EXISTS idx_impressions_ad ON ad_impressions(ad_id);
                CREATE INDEX IF NOT EXISTS idx_clicks_ad ON ad_clicks(ad_id);
                CREATE INDEX IF NOT EXISTS idx_conversions_ad ON ad_conversions(ad_id);
            ''')

    async def create_ad(self, ad: AdCreate, user_id: str) -> Optional[Ad]:
        """Create a new ad in the database."""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow('''
                    INSERT INTO ads (
                        id, type, name, description, logo_url, link,
                        targeting, start_date, end_date, priority,
                        created_by, last_modified_by
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
                    ) RETURNING *
                ''', 
                ad.id, ad.type, ad.name, ad.description, ad.logo_url,
                ad.link, ad.targeting.dict(), ad.start_date, ad.end_date,
                ad.priority, user_id, user_id
                )
                return Ad(**dict(row)) if row else None
        except Exception as e:
            logger.error(f"Error creating ad: {str(e)}")
            return None

    async def update_ad(self, ad_id: str, update: AdUpdate, user_id: str) -> Optional[Ad]:
        """Update an existing ad."""
        try:
            async with self.pool.acquire() as conn:
                # Build update query dynamically
                update_fields = []
                values = []
                for field, value in update.dict(exclude_unset=True).items():
                    if value is not None:
                        update_fields.append(f"{field} = ${len(values) + 1}")
                        values.append(value)
                
                if not update_fields:
                    return await self.get_ad(ad_id)
                
                # Add last_modified_by and updated_at
                update_fields.append("last_modified_by = $" + str(len(values) + 1))
                update_fields.append("updated_at = CURRENT_TIMESTAMP")
                values.append(user_id)
                
                query = f'''
                    UPDATE ads 
                    SET {', '.join(update_fields)}
                    WHERE id = ${len(values) + 1}
                    RETURNING *
                '''
                values.append(ad_id)
                
                row = await conn.fetchrow(query, *values)
                return Ad(**dict(row)) if row else None
        except Exception as e:
            logger.error(f"Error updating ad: {str(e)}")
            return None

    async def get_ad(self, ad_id: str) -> Optional[Ad]:
        """Get an ad by ID."""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow('SELECT * FROM ads WHERE id = $1', ad_id)
                return Ad(**dict(row)) if row else None
        except Exception as e:
            logger.error(f"Error getting ad: {str(e)}")
            return None

    async def get_active_ads(self) -> List[Ad]:
        """Get all active ads."""
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch('''
                    SELECT * FROM ads 
                    WHERE is_active = true 
                    AND (end_date IS NULL OR end_date > CURRENT_TIMESTAMP)
                    AND start_date <= CURRENT_TIMESTAMP
                    ORDER BY priority DESC
                ''')
                return [Ad(**dict(row)) for row in rows]
        except Exception as e:
            logger.error(f"Error getting active ads: {str(e)}")
            return []

    async def record_impression(self, ad_id: str, user_id: str, context: Dict[str, Any] = None):
        """Record an ad impression."""
        try:
            async with self.pool.acquire() as conn:
                await conn.execute('''
                    INSERT INTO ad_impressions (ad_id, user_id, context)
                    VALUES ($1, $2, $3)
                ''', ad_id, user_id, context)
                
                # Update ad metrics
                await conn.execute('''
                    UPDATE ads 
                    SET metrics = jsonb_set(
                        metrics,
                        '{impressions}',
                        (COALESCE((metrics->>'impressions')::int, 0) + 1)::text::jsonb
                    )
                    WHERE id = $1
                ''', ad_id)
        except Exception as e:
            logger.error(f"Error recording impression: {str(e)}")

    async def record_click(self, ad_id: str, user_id: str, context: Dict[str, Any] = None):
        """Record an ad click."""
        try:
            async with self.pool.acquire() as conn:
                await conn.execute('''
                    INSERT INTO ad_clicks (ad_id, user_id, context)
                    VALUES ($1, $2, $3)
                ''', ad_id, user_id, context)
                
                # Update ad metrics
                await conn.execute('''
                    UPDATE ads 
                    SET metrics = jsonb_set(
                        metrics,
                        '{clicks}',
                        (COALESCE((metrics->>'clicks')::int, 0) + 1)::text::jsonb
                    )
                    WHERE id = $1
                ''', ad_id)
        except Exception as e:
            logger.error(f"Error recording click: {str(e)}")

    async def record_conversion(self, ad_id: str, user_id: str, context: Dict[str, Any] = None):
        """Record an ad conversion."""
        try:
            async with self.pool.acquire() as conn:
                await conn.execute('''
                    INSERT INTO ad_conversions (ad_id, user_id, context)
                    VALUES ($1, $2, $3)
                ''', ad_id, user_id, context)
                
                # Update ad metrics
                await conn.execute('''
                    UPDATE ads 
                    SET metrics = jsonb_set(
                        metrics,
                        '{conversions}',
                        (COALESCE((metrics->>'conversions')::int, 0) + 1)::text::jsonb
                    )
                    WHERE id = $1
                ''', ad_id)
        except Exception as e:
            logger.error(f"Error recording conversion: {str(e)}")

    async def get_ad_stats(self, ad_id: str) -> Optional[AdStats]:
        """Get statistics for an ad."""
        try:
            async with self.pool.acquire() as conn:
                # Get basic metrics
                metrics = await conn.fetchrow('''
                    SELECT metrics FROM ads WHERE id = $1
                ''', ad_id)
                
                if not metrics:
                    return None
                
                metrics = metrics['metrics']
                
                # Get performance by affinity
                affinity_stats = await conn.fetch('''
                    SELECT 
                        (context->>'affinity') as affinity,
                        COUNT(*) as count
                    FROM ad_impressions
                    WHERE ad_id = $1
                    GROUP BY context->>'affinity'
                ''', ad_id)
                
                # Get performance by behavior
                behavior_stats = await conn.fetch('''
                    SELECT 
                        (context->>'behavior') as behavior,
                        COUNT(*) as count
                    FROM ad_impressions
                    WHERE ad_id = $1
                    GROUP BY context->>'behavior'
                ''', ad_id)
                
                # Get top performing times
                time_stats = await conn.fetch('''
                    SELECT 
                        EXTRACT(HOUR FROM timestamp) as hour,
                        COUNT(*) as count
                    FROM ad_impressions
                    WHERE ad_id = $1
                    GROUP BY EXTRACT(HOUR FROM timestamp)
                    ORDER BY count DESC
                    LIMIT 5
                ''', ad_id)
                
                return AdStats(
                    total_impressions=metrics.get('impressions', 0),
                    total_clicks=metrics.get('clicks', 0),
                    total_conversions=metrics.get('conversions', 0),
                    average_engagement_rate=metrics.get('engagement_rate', 0.0),
                    performance_by_affinity={
                        row['affinity']: row['count']
                        for row in affinity_stats
                    },
                    performance_by_behavior={
                        row['behavior']: row['count']
                        for row in behavior_stats
                    },
                    top_performing_times=[
                        {'hour': row['hour'], 'count': row['count']}
                        for row in time_stats
                    ],
                    conversion_rate=(
                        metrics.get('conversions', 0) / metrics.get('impressions', 1)
                        if metrics.get('impressions', 0) > 0 else 0.0
                    )
                )
        except Exception as e:
            logger.error(f"Error getting ad stats: {str(e)}")
            return None 