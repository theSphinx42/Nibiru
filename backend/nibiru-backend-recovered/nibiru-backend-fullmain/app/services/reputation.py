from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.reputation import (
    UserReputation,
    Contribution,
    UserBadge,
    Leaderboard,
    CommunityEngagement,
    ContributionType,
    ContributionSize
)
from app.schemas.reputation import (
    ReputationUpdate,
    ReputationStats,
    LeaderboardEntry
)
from app.core.exceptions import ResourceNotFound

class ReputationService:
    def __init__(self, db: Session):
        self.db = db

    # Point calculation constants
    POINTS = {
        ContributionSize.SMALL: (10, 50),
        ContributionSize.MEDIUM: (100, 500),
        ContributionSize.LARGE: (500, 1000)
    }

    def calculate_base_points(self, size: ContributionSize) -> float:
        """Calculate base points for a contribution based on size."""
        min_points, max_points = self.POINTS[size]
        return (min_points + max_points) / 2

    def calculate_depreciation(self, contribution: Contribution) -> float:
        """Calculate point depreciation based on age and activity."""
        years_old = (datetime.utcnow() - contribution.created_at).days / 365
        depreciation = years_old * contribution.depreciation_rate
        return max(0.0, 1.0 - depreciation)

    def update_contribution_points(self, contribution: Contribution) -> float:
        """Update contribution points based on depreciation and activity."""
        depreciation_factor = self.calculate_depreciation(contribution)
        contribution.current_points = contribution.base_points * depreciation_factor
        contribution.last_updated_at = datetime.utcnow()
        return contribution.current_points

    async def get_or_create_user_reputation(self, user_id: int) -> UserReputation:
        """Get or create user reputation record."""
        reputation = self.db.query(UserReputation).filter(
            UserReputation.user_id == user_id
        ).first()
        
        if not reputation:
            reputation = UserReputation(user_id=user_id)
            self.db.add(reputation)
            self.db.commit()
            self.db.refresh(reputation)
        
        return reputation

    async def add_contribution(
        self,
        user_id: int,
        update_data: ReputationUpdate
    ) -> Contribution:
        """Add a new contribution and update user reputation."""
        reputation = await self.get_or_create_user_reputation(user_id)
        
        # Calculate base points
        base_points = self.calculate_base_points(update_data.size)
        
        # Create contribution
        contribution = Contribution(
            user_reputation_id=reputation.id,
            contribution_type=update_data.contribution_type,
            size=update_data.size,
            base_points=base_points,
            current_points=base_points,
            metadata=update_data.metadata
        )
        
        self.db.add(contribution)
        
        # Update user reputation
        reputation.total_score += base_points
        reputation.active_score += base_points
        reputation.last_contribution_at = datetime.utcnow()
        reputation.active_streak += 1
        
        # Check for badges
        await self.check_and_award_badges(reputation)
        
        # Update leaderboards
        await self.update_leaderboards(reputation)
        
        self.db.commit()
        self.db.refresh(contribution)
        return contribution

    async def update_contribution(
        self,
        contribution_id: int,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Contribution:
        """Update an existing contribution."""
        contribution = self.db.query(Contribution).filter(
            Contribution.id == contribution_id
        ).first()
        
        if not contribution:
            raise ResourceNotFound(f"Contribution {contribution_id} not found")
        
        # Update points and metadata
        self.update_contribution_points(contribution)
        if metadata:
            contribution.metadata.update(metadata)
        
        # Update user reputation
        reputation = contribution.user_reputation
        reputation.active_score = sum(
            c.current_points for c in reputation.contributions
        )
        
        self.db.commit()
        self.db.refresh(contribution)
        return contribution

    async def add_community_engagement(
        self,
        user_id: int,
        engagement_type: str,
        points: float,
        metadata: Optional[Dict[str, Any]] = None
    ) -> CommunityEngagement:
        """Record community engagement and update reputation."""
        reputation = await self.get_or_create_user_reputation(user_id)
        
        engagement = CommunityEngagement(
            user_reputation_id=reputation.id,
            engagement_type=engagement_type,
            points_earned=points,
            metadata=metadata
        )
        
        self.db.add(engagement)
        
        # Update reputation scores
        reputation.total_score += points
        reputation.active_score += points
        
        self.db.commit()
        self.db.refresh(engagement)
        return engagement

    async def check_and_award_badges(self, reputation: UserReputation) -> List[UserBadge]:
        """Check and award badges based on user achievements."""
        new_badges = []
        
        # Check for contribution milestones
        total_contributions = len(reputation.contributions)
        if total_contributions >= 10:
            new_badges.append(UserBadge(
                user_reputation_id=reputation.id,
                badge_type="contributor",
                metadata={"count": total_contributions}
            ))
        
        # Check for active streak
        if reputation.active_streak >= 30:
            new_badges.append(UserBadge(
                user_reputation_id=reputation.id,
                badge_type="active_streak",
                metadata={"days": reputation.active_streak}
            ))
        
        # Check for high scores
        if reputation.total_score >= 1000:
            new_badges.append(UserBadge(
                user_reputation_id=reputation.id,
                badge_type="high_score",
                metadata={"score": reputation.total_score}
            ))
        
        self.db.add_all(new_badges)
        self.db.commit()
        return new_badges

    async def update_leaderboards(self, reputation: UserReputation) -> List[Leaderboard]:
        """Update leaderboards for all categories."""
        # Get all unique categories from contributions
        categories = set(c.contribution_type for c in reputation.contributions)
        
        leaderboard_entries = []
        for category in categories:
            # Calculate category score
            category_score = sum(
                c.current_points for c in reputation.contributions
                if c.contribution_type == category
            )
            
            # Get or create leaderboard entry
            entry = self.db.query(Leaderboard).filter(
                Leaderboard.user_reputation_id == reputation.id,
                Leaderboard.category == category
            ).first()
            
            if not entry:
                entry = Leaderboard(
                    user_reputation_id=reputation.id,
                    category=category,
                    score=category_score,
                    rank=0  # Will be updated in recalculate_ranks
                )
                self.db.add(entry)
            
            entry.score = category_score
            leaderboard_entries.append(entry)
        
        self.db.commit()
        await self.recalculate_ranks()
        return leaderboard_entries

    async def recalculate_ranks(self) -> None:
        """Recalculate ranks for all leaderboard entries."""
        # Get all categories
        categories = self.db.query(Leaderboard.category).distinct().all()
        
        for category, in categories:
            # Get all entries for this category, ordered by score
            entries = self.db.query(Leaderboard).filter(
                Leaderboard.category == category
            ).order_by(desc(Leaderboard.score)).all()
            
            # Update ranks
            for rank, entry in enumerate(entries, 1):
                entry.rank = rank

    async def get_leaderboard(
        self,
        category: Optional[str] = None,
        limit: int = 100
    ) -> List[LeaderboardEntry]:
        """Get leaderboard entries for a category."""
        query = self.db.query(Leaderboard)
        if category:
            query = query.filter(Leaderboard.category == category)
        
        entries = query.order_by(desc(Leaderboard.score)).limit(limit).all()
        
        return [
            LeaderboardEntry(
                user_id=entry.user_reputation.user_id,
                username=entry.user_reputation.user.username,
                score=entry.score,
                rank=entry.rank,
                category=entry.category,
                recent_contributions=[
                    {
                        "type": c.contribution_type,
                        "points": c.current_points,
                        "date": c.last_updated_at
                    }
                    for c in entry.user_reputation.contributions[-5:]
                ],
                badges=[b.badge_type for b in entry.user_reputation.badges]
            )
            for entry in entries
        ]

    async def get_user_stats(self, user_id: int) -> ReputationStats:
        """Get detailed statistics for a user."""
        reputation = await self.get_or_create_user_reputation(user_id)
        
        # Calculate average contribution size
        sizes = [c.size for c in reputation.contributions]
        avg_size = max(set(sizes), key=sizes.count) if sizes else None
        
        # Get top categories
        categories = {}
        for c in reputation.contributions:
            categories[c.contribution_type] = categories.get(c.contribution_type, 0) + 1
        top_categories = [
            {"category": cat, "count": count}
            for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True)[:3]
        ]
        
        # Get recent activity
        recent_activity = [
            {
                "type": c.contribution_type,
                "points": c.current_points,
                "date": c.last_updated_at
            }
            for c in sorted(
                reputation.contributions,
                key=lambda x: x.last_updated_at,
                reverse=True
            )[:5]
        ]
        
        # Calculate community impact
        community_impact = {
            "reviews": sum(1 for e in reputation.community_engagements if e.engagement_type == "review"),
            "answers": sum(1 for e in reputation.community_engagements if e.engagement_type == "answer"),
            "total_points": sum(e.points_earned for e in reputation.community_engagements)
        }
        
        return ReputationStats(
            total_contributions=len(reputation.contributions),
            active_contributions=sum(1 for c in reputation.contributions if c.current_points > 0),
            average_contribution_size=avg_size,
            top_categories=top_categories,
            recent_activity=recent_activity,
            badges_earned=[b.badge_type for b in reputation.badges],
            community_impact=community_impact
        ) 