from typing import List, Optional, Dict
from datetime import datetime, timedelta
import asyncpg
import logging
from ..models.advertising import ContributorRank, AdvertiserRank, AdSlot, MonthlyRankings

logger = logging.getLogger(__name__)

class AdvertisingRankService:
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
                CREATE TABLE IF NOT EXISTS contributor_ranks (
                    user_id TEXT PRIMARY KEY,
                    total_score FLOAT NOT NULL DEFAULT 0,
                    monthly_score FLOAT NOT NULL DEFAULT 0,
                    tier_1_rank INTEGER NOT NULL DEFAULT 1,
                    items_created INTEGER NOT NULL DEFAULT 0,
                    avg_item_rating FLOAT NOT NULL DEFAULT 0,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS advertiser_ranks (
                    user_id TEXT PRIMARY KEY,
                    paid_amount FLOAT NOT NULL DEFAULT 0,
                    tier_3_level INTEGER NOT NULL DEFAULT 1,
                    monthly_impressions INTEGER NOT NULL DEFAULT 0,
                    monthly_clicks INTEGER NOT NULL DEFAULT 0,
                    monthly_conversions INTEGER NOT NULL DEFAULT 0,
                    rank_position INTEGER,
                    galatea_access BOOLEAN NOT NULL DEFAULT false,
                    galatea_tag TEXT,
                    galatea_projects_count INTEGER NOT NULL DEFAULT 0,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS galatea_projects (
                    id SERIAL PRIMARY KEY,
                    creator_id TEXT NOT NULL REFERENCES advertiser_ranks(user_id),
                    title TEXT NOT NULL,
                    description TEXT,
                    tech_stack TEXT[],
                    status TEXT NOT NULL DEFAULT 'active',
                    showcase_video_url TEXT,
                    project_website TEXT,
                    development_stage TEXT NOT NULL DEFAULT 'concept',
                    target_completion_date TIMESTAMP,
                    investment_goal FLOAT,
                    current_investment FLOAT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT creator_must_be_galatea CHECK (
                        EXISTS (
                            SELECT 1 FROM advertiser_ranks 
                            WHERE user_id = creator_id 
                            AND galatea_access = true
                        )
                    )
                );

                CREATE TABLE IF NOT EXISTS galatea_project_updates (
                    id SERIAL PRIMARY KEY,
                    project_id INTEGER REFERENCES galatea_projects(id) ON DELETE CASCADE,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    media_urls TEXT[],
                    update_type TEXT NOT NULL,
                    milestone_reached BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS galatea_project_media (
                    id SERIAL PRIMARY KEY,
                    project_id INTEGER REFERENCES galatea_projects(id) ON DELETE CASCADE,
                    media_type TEXT NOT NULL,
                    url TEXT NOT NULL,
                    title TEXT,
                    description TEXT,
                    thumbnail_url TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    featured BOOLEAN DEFAULT false
                );

                CREATE TABLE IF NOT EXISTS ad_slots (
                    position INTEGER PRIMARY KEY,
                    price FLOAT NOT NULL,
                    is_contributor_slot BOOLEAN NOT NULL,
                    holder_id TEXT NOT NULL,
                    expires_at TIMESTAMP NOT NULL
                );

                CREATE TABLE IF NOT EXISTS monthly_rankings (
                    month TEXT PRIMARY KEY,
                    top_contributor_score FLOAT NOT NULL,
                    base_slot_price FLOAT NOT NULL,
                    total_slots INTEGER NOT NULL,
                    available_slots INTEGER NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_contributor_score ON contributor_ranks(monthly_score DESC);
                CREATE INDEX IF NOT EXISTS idx_advertiser_paid ON advertiser_ranks(paid_amount DESC);
            ''')

    async def update_contributor_rank(self, user_id: str, contribution_data: Dict):
        """Update a contributor's ranking based on their activity."""
        try:
            # Calculate score based on various factors
            score = (
                contribution_data.get('items_rating', 0) * 10 +
                contribution_data.get('items_downloads', 0) * 5 +
                contribution_data.get('items_created', 0) * 20 +
                contribution_data.get('helpful_votes', 0) * 2
            )

            async with self.pool.acquire() as conn:
                await conn.execute('''
                    INSERT INTO contributor_ranks 
                    (user_id, total_score, monthly_score, tier_1_rank, items_created, avg_item_rating, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id) DO UPDATE SET
                        total_score = contributor_ranks.total_score + $2,
                        monthly_score = $3,
                        tier_1_rank = $4,
                        items_created = $5,
                        avg_item_rating = $6,
                        updated_at = CURRENT_TIMESTAMP
                ''', user_id, score, score, 
                    contribution_data.get('tier_1_rank', 1),
                    contribution_data.get('items_created', 0),
                    contribution_data.get('avg_item_rating', 0))

        except Exception as e:
            logger.error(f"Error updating contributor rank: {str(e)}")

    async def update_advertiser_rank(self, user_id: str, amount: float):
        """Update an advertiser's ranking based on payment, tracking long-term support."""
        try:
            async with self.pool.acquire() as conn:
                # Get current advertiser data to check cumulative status
                current_data = await conn.fetchrow('''
                    SELECT paid_amount, tier_3_level, galatea_access FROM advertiser_ranks
                    WHERE user_id = $1
                ''', user_id)

                # Calculate new cumulative amount
                cumulative_amount = amount
                if current_data:
                    cumulative_amount += current_data['paid_amount']

                # Calculate tier 3 level based on cumulative payment history
                tier_level = 1
                if cumulative_amount >= 100000:  # Whale tier - 100k+
                    tier_level = 6
                elif cumulative_amount >= 25000:  # Major supporter - 25k+
                    tier_level = 5
                elif cumulative_amount >= 10000:  # Significant supporter - 10k+
                    tier_level = 4
                elif cumulative_amount >= 1000:   # Established supporter - 1k+
                    tier_level = 3
                elif cumulative_amount >= 300:    # Growing supporter - $300+
                    tier_level = 2
                elif cumulative_amount >= 50:     # Entry supporter - $50+
                    tier_level = 1

                # Ensure tier level never decreases from previous
                if current_data and current_data['tier_3_level'] > tier_level:
                    tier_level = current_data['tier_3_level']

                # Grant Galatea access for tier 3 and above
                galatea_access = tier_level >= 3
                
                # Generate unique Galatea tag if newly qualified
                galatea_tag = None
                if galatea_access and (not current_data or not current_data['galatea_access']):
                    galatea_tag = f"GALATEA_{user_id[:8].upper()}"

                await conn.execute('''
                    INSERT INTO advertiser_ranks 
                    (user_id, paid_amount, tier_3_level, galatea_access, galatea_tag, updated_at)
                    VALUES ($1, $2, $3, $4, COALESCE($5, galatea_tag), CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id) DO UPDATE SET
                        paid_amount = advertiser_ranks.paid_amount + $2,
                        tier_3_level = $3,
                        galatea_access = $4,
                        galatea_tag = COALESCE($5, advertiser_ranks.galatea_tag),
                        updated_at = CURRENT_TIMESTAMP
                ''', user_id, amount, tier_level, galatea_access, galatea_tag)

        except Exception as e:
            logger.error(f"Error updating advertiser rank: {str(e)}")

    async def recalculate_monthly_rankings(self):
        """Recalculate all rankings and slot prices for the current month."""
        try:
            async with self.pool.acquire() as conn:
                # Get top contributor
                top_contributor = await conn.fetchrow('''
                    SELECT * FROM contributor_ranks
                    ORDER BY monthly_score DESC
                    LIMIT 1
                ''')

                if not top_contributor:
                    return

                # Set base price just below top contributor's score
                base_price = top_contributor['monthly_score'] - 1

                # Update monthly rankings
                current_month = datetime.now().strftime('%Y-%m')
                await conn.execute('''
                    INSERT INTO monthly_rankings 
                    (month, top_contributor_score, base_slot_price, total_slots, available_slots, updated_at)
                    VALUES ($1, $2, $3, 12, 12, CURRENT_TIMESTAMP)
                    ON CONFLICT (month) DO UPDATE SET
                        top_contributor_score = $2,
                        base_slot_price = $3,
                        updated_at = CURRENT_TIMESTAMP
                ''', current_month, top_contributor['monthly_score'], base_price)

                # Reset ad slots
                await conn.execute('DELETE FROM ad_slots')

                # Create new slots with decreasing prices
                for i in range(12):  # 12 total slots
                    price = base_price - i
                    await conn.execute('''
                        INSERT INTO ad_slots (position, price, is_contributor_slot, holder_id, expires_at)
                        VALUES ($1, $2, false, '', CURRENT_TIMESTAMP + INTERVAL '1 month')
                    ''', i + 1, price)

                # Assign top contributor to first slot
                await conn.execute('''
                    UPDATE ad_slots 
                    SET holder_id = $1, is_contributor_slot = true
                    WHERE position = 1
                ''', top_contributor['user_id'])

        except Exception as e:
            logger.error(f"Error recalculating monthly rankings: {str(e)}")

    async def get_available_slots(self) -> List[AdSlot]:
        """Get all available advertising slots."""
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch('''
                    SELECT * FROM ad_slots
                    WHERE holder_id = ''
                    AND expires_at > CURRENT_TIMESTAMP
                    ORDER BY position ASC
                ''')
                return [AdSlot(**dict(row)) for row in rows]
        except Exception as e:
            logger.error(f"Error getting available slots: {str(e)}")
            return []

    async def purchase_slot(self, user_id: str, position: int, amount: float) -> bool:
        """Attempt to purchase an advertising slot."""
        try:
            async with self.pool.acquire() as conn:
                # Check if slot is available and price is met
                slot = await conn.fetchrow('''
                    SELECT * FROM ad_slots
                    WHERE position = $1
                    AND holder_id = ''
                    AND price <= $2
                    AND expires_at > CURRENT_TIMESTAMP
                ''', position, amount)

                if not slot:
                    return False

                # Purchase the slot
                await conn.execute('''
                    UPDATE ad_slots
                    SET holder_id = $1, is_contributor_slot = false
                    WHERE position = $2
                ''', user_id, position)

                # Update advertiser's paid amount
                await self.update_advertiser_rank(user_id, amount)
                return True

        except Exception as e:
            logger.error(f"Error purchasing slot: {str(e)}")
            return False

    async def get_advertiser_dashboard_stats(self, user_id: str) -> Optional[Dict]:
        """Get advertiser's dashboard statistics including detailed Galatea status."""
        try:
            async with self.pool.acquire() as conn:
                stats = await conn.fetchrow('''
                    SELECT 
                        paid_amount,
                        tier_3_level,
                        monthly_impressions,
                        monthly_clicks,
                        monthly_conversions,
                        galatea_access,
                        galatea_tag,
                        galatea_projects_count,
                        (SELECT position FROM ad_slots WHERE holder_id = $1 AND expires_at > CURRENT_TIMESTAMP) as current_position,
                        (SELECT COUNT(*) FROM advertiser_ranks WHERE paid_amount > (SELECT paid_amount FROM advertiser_ranks WHERE user_id = $1)) + 1 as lifetime_rank,
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'id', p.id,
                                    'title', p.title,
                                    'status', p.status,
                                    'development_stage', p.development_stage,
                                    'showcase_video_url', p.showcase_video_url,
                                    'current_investment', p.current_investment,
                                    'investment_goal', p.investment_goal,
                                    'created_at', p.created_at,
                                    'latest_update', (
                                        SELECT row_to_json(pu.*)
                                        FROM galatea_project_updates pu
                                        WHERE pu.project_id = p.id
                                        ORDER BY pu.created_at DESC
                                        LIMIT 1
                                    ),
                                    'media_count', (
                                        SELECT COUNT(*)
                                        FROM galatea_project_media pm
                                        WHERE pm.project_id = p.id
                                    )
                                )
                            )
                            FROM galatea_projects p
                            WHERE p.creator_id = $1
                            ORDER BY p.created_at DESC
                        ) as galatea_projects
                    FROM advertiser_ranks
                    WHERE user_id = $1
                ''', user_id)

                if not stats:
                    return None

                return {
                    'cumulative_investment': stats['paid_amount'],
                    'tier_level': stats['tier_3_level'],
                    'current_position': stats['current_position'],
                    'lifetime_rank': stats['lifetime_rank'],
                    'monthly_stats': {
                        'impressions': stats['monthly_impressions'],
                        'clicks': stats['monthly_clicks'],
                        'conversions': stats['monthly_conversions']
                    },
                    'galatea_status': {
                        'has_access': stats['galatea_access'],
                        'tag': stats['galatea_tag'],
                        'projects_count': stats['galatea_projects_count'],
                        'projects': stats['galatea_projects'] or []
                    },
                    'next_tier_threshold': self._get_next_tier_threshold(stats['paid_amount'])
                }

        except Exception as e:
            logger.error(f"Error getting advertiser stats: {str(e)}")
            return None

    def _get_next_tier_threshold(self, current_amount: float) -> Optional[float]:
        """Calculate the amount needed for next tier upgrade."""
        thresholds = [50, 300, 1000, 10000, 25000, 100000]
        for threshold in thresholds:
            if current_amount < threshold:
                return threshold - current_amount
        return None  # Already at max tier

    async def create_galatea_project(self, user_id: str, project_data: Dict) -> Optional[Dict]:
        """Create a new Galatea project for qualified advertisers."""
        try:
            async with self.pool.acquire() as conn:
                # Verify Galatea access
                advertiser = await conn.fetchrow('''
                    SELECT galatea_access, galatea_projects_count 
                    FROM advertiser_ranks 
                    WHERE user_id = $1 AND galatea_access = true
                ''', user_id)

                if not advertiser:
                    return None

                # Create the project with enhanced fields
                project = await conn.fetchrow('''
                    INSERT INTO galatea_projects 
                    (creator_id, title, description, tech_stack, status, 
                     showcase_video_url, project_website, development_stage,
                     target_completion_date, investment_goal)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING *
                ''', 
                    user_id,
                    project_data['title'],
                    project_data.get('description', ''),
                    project_data.get('tech_stack', []),
                    project_data.get('status', 'active'),
                    project_data.get('showcase_video_url'),
                    project_data.get('project_website'),
                    project_data.get('development_stage', 'concept'),
                    project_data.get('target_completion_date'),
                    project_data.get('investment_goal')
                )

                # Update project count
                await conn.execute('''
                    UPDATE advertiser_ranks 
                    SET galatea_projects_count = galatea_projects_count + 1
                    WHERE user_id = $1
                ''', user_id)

                return dict(project)

        except Exception as e:
            logger.error(f"Error creating Galatea project: {str(e)}")
            return None

    async def add_project_update(self, project_id: int, update_data: Dict) -> Optional[Dict]:
        """Add a development update to a Galatea project."""
        try:
            async with self.pool.acquire() as conn:
                update = await conn.fetchrow('''
                    INSERT INTO galatea_project_updates
                    (project_id, title, content, media_urls, update_type, milestone_reached)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                ''',
                    project_id,
                    update_data['title'],
                    update_data['content'],
                    update_data.get('media_urls', []),
                    update_data['update_type'],
                    update_data.get('milestone_reached', False)
                )
                return dict(update)
        except Exception as e:
            logger.error(f"Error adding project update: {str(e)}")
            return None

    async def add_project_media(self, project_id: int, media_data: Dict) -> Optional[Dict]:
        """Add media content to a Galatea project."""
        try:
            async with self.pool.acquire() as conn:
                media = await conn.fetchrow('''
                    INSERT INTO galatea_project_media
                    (project_id, media_type, url, title, description, thumbnail_url, featured)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *
                ''',
                    project_id,
                    media_data['media_type'],
                    media_data['url'],
                    media_data.get('title'),
                    media_data.get('description'),
                    media_data.get('thumbnail_url'),
                    media_data.get('featured', False)
                )
                return dict(media)
        except Exception as e:
            logger.error(f"Error adding project media: {str(e)}")
            return None

    async def get_project_details(self, project_id: int) -> Optional[Dict]:
        """Get comprehensive details of a Galatea project including updates and media."""
        try:
            async with self.pool.acquire() as conn:
                project = await conn.fetchrow('''
                    SELECT 
                        p.*,
                        json_agg(DISTINCT pm.*) FILTER (WHERE pm.id IS NOT NULL) as media_content,
                        json_agg(DISTINCT pu.*) FILTER (WHERE pu.id IS NOT NULL) as updates,
                        (SELECT row_to_json(ar.*) FROM advertiser_ranks ar WHERE ar.user_id = p.creator_id) as creator_info
                    FROM galatea_projects p
                    LEFT JOIN galatea_project_media pm ON p.id = pm.project_id
                    LEFT JOIN galatea_project_updates pu ON p.id = pu.project_id
                    WHERE p.id = $1
                    GROUP BY p.id
                ''', project_id)

                if not project:
                    return None

                return dict(project)

        except Exception as e:
            logger.error(f"Error getting project details: {str(e)}")
            return None 