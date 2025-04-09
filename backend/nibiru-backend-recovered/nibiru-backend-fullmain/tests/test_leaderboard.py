import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.reputation import (
    UserReputation,
    Contribution,
    Badge,
    BadgeType
)
from app.services.reputation import ReputationService
from app.core.exceptions import ResourceNotFound

@pytest.fixture
def user_reputation(db: Session, test_user):
    reputation = UserReputation(user_id=test_user.id)
    db.add(reputation)
    db.commit()
    db.refresh(reputation)
    return reputation

@pytest.fixture
def other_user_reputation(db: Session, other_test_user):
    reputation = UserReputation(user_id=other_test_user.id)
    db.add(reputation)
    db.commit()
    db.refresh(reputation)
    return reputation

@pytest.fixture
def contribution(db: Session, user_reputation):
    contribution = Contribution(
        user_reputation_id=user_reputation.id,
        contribution_type="code",
        size="medium",
        base_points=300,
        current_points=300
    )
    db.add(contribution)
    db.commit()
    db.refresh(contribution)
    return contribution

class TestGlobalLeaderboard:
    async def test_leaderboard_ranking(self, db: Session, user_reputation, other_user_reputation):
        """Test global leaderboard ranking based on reputation score."""
        service = ReputationService(db)
        
        # Create contributions for both users
        for reputation in [user_reputation, other_user_reputation]:
            contribution = Contribution(
                user_reputation_id=reputation.id,
                contribution_type="code",
                size="large",
                base_points=500,
                current_points=500
            )
            db.add(contribution)
        
        db.commit()
        
        # Get leaderboard
        leaderboard = await service.get_global_leaderboard()
        
        # Verify rankings
        assert len(leaderboard) >= 2
        assert leaderboard[0]["user_id"] in [user_reputation.user_id, other_user_reputation.user_id]
        assert leaderboard[1]["user_id"] in [user_reputation.user_id, other_user_reputation.user_id]

    async def test_leaderboard_pagination(self, db: Session, user_reputation, other_user_reputation):
        """Test leaderboard pagination."""
        service = ReputationService(db)
        
        # Create multiple users with different scores
        for i in range(15):
            reputation = UserReputation(user_id=f"test_user_{i}")
            db.add(reputation)
            
            contribution = Contribution(
                user_reputation_id=reputation.id,
                contribution_type="code",
                size="large",
                base_points=1000 - i * 50,  # Decreasing points
                current_points=1000 - i * 50
            )
            db.add(contribution)
        
        db.commit()
        
        # Test first page
        page1 = await service.get_global_leaderboard(page=1, page_size=10)
        assert len(page1) == 10
        
        # Test second page
        page2 = await service.get_global_leaderboard(page=2, page_size=10)
        assert len(page2) == 5

class TestCategoryLeaderboard:
    async def test_category_ranking(self, db: Session, user_reputation, other_user_reputation):
        """Test category-specific leaderboard ranking."""
        service = ReputationService(db)
        
        # Create contributions in different categories
        categories = ["code", "documentation", "design"]
        
        for category in categories:
            for reputation in [user_reputation, other_user_reputation]:
                contribution = Contribution(
                    user_reputation_id=reputation.id,
                    contribution_type=category,
                    size="large",
                    base_points=500,
                    current_points=500
                )
                db.add(contribution)
        
        db.commit()
        
        # Get category leaderboards
        for category in categories:
            leaderboard = await service.get_category_leaderboard(category)
            assert len(leaderboard) >= 2
            assert leaderboard[0]["user_id"] in [user_reputation.user_id, other_user_reputation.user_id]

class TestTimeBasedLeaderboard:
    async def test_weekly_leaderboard(self, db: Session, user_reputation, other_user_reputation):
        """Test weekly leaderboard ranking."""
        service = ReputationService(db)
        
        # Create recent contributions
        for reputation in [user_reputation, other_user_reputation]:
            contribution = Contribution(
                user_reputation_id=reputation.id,
                contribution_type="code",
                size="large",
                base_points=500,
                current_points=500,
                created_at=datetime.utcnow() - timedelta(days=3)
            )
            db.add(contribution)
        
        db.commit()
        
        # Get weekly leaderboard
        leaderboard = await service.get_weekly_leaderboard()
        
        # Verify rankings
        assert len(leaderboard) >= 2
        assert leaderboard[0]["user_id"] in [user_reputation.user_id, other_user_reputation.user_id]

    async def test_monthly_leaderboard(self, db: Session, user_reputation, other_user_reputation):
        """Test monthly leaderboard ranking."""
        service = ReputationService(db)
        
        # Create contributions within the month
        for reputation in [user_reputation, other_user_reputation]:
            contribution = Contribution(
                user_reputation_id=reputation.id,
                contribution_type="code",
                size="large",
                base_points=500,
                current_points=500,
                created_at=datetime.utcnow() - timedelta(days=15)
            )
            db.add(contribution)
        
        db.commit()
        
        # Get monthly leaderboard
        leaderboard = await service.get_monthly_leaderboard()
        
        # Verify rankings
        assert len(leaderboard) >= 2
        assert leaderboard[0]["user_id"] in [user_reputation.user_id, other_user_reputation.user_id]

class TestUserRanking:
    async def test_get_user_rank(self, db: Session, user_reputation, other_user_reputation):
        """Test getting user's current rank."""
        service = ReputationService(db)
        
        # Create contributions with different scores
        for reputation, points in [(user_reputation, 1000), (other_user_reputation, 500)]:
            contribution = Contribution(
                user_reputation_id=reputation.id,
                contribution_type="code",
                size="large",
                base_points=points,
                current_points=points
            )
            db.add(contribution)
        
        db.commit()
        
        # Get user ranks
        user_rank = await service.get_user_rank(user_reputation.user_id)
        other_user_rank = await service.get_user_rank(other_user_reputation.user_id)
        
        # Verify ranks
        assert user_rank < other_user_rank

    async def test_get_user_rank_invalid_user(self, db: Session):
        """Test getting rank for invalid user."""
        service = ReputationService(db)
        
        with pytest.raises(ResourceNotFound):
            await service.get_user_rank("invalid_user_id")

class TestLeaderboardMetrics:
    async def test_leaderboard_with_badges(self, db: Session, user_reputation, other_user_reputation):
        """Test leaderboard includes badge information."""
        service = ReputationService(db)
        
        # Create contributions and badges
        for reputation in [user_reputation, other_user_reputation]:
            contribution = Contribution(
                user_reputation_id=reputation.id,
                contribution_type="code",
                size="large",
                base_points=500,
                current_points=500
            )
            db.add(contribution)
            
            badge = Badge(
                user_reputation_id=reputation.id,
                type=BadgeType.PIONEER,
                awarded_at=datetime.utcnow()
            )
            db.add(badge)
        
        db.commit()
        
        # Get leaderboard
        leaderboard = await service.get_global_leaderboard()
        
        # Verify badge information
        for entry in leaderboard:
            assert "badges" in entry
            assert len(entry["badges"]) > 0

    async def test_leaderboard_with_impact(self, db: Session, user_reputation, other_user_reputation):
        """Test leaderboard includes impact metrics."""
        service = ReputationService(db)
        
        # Create contributions and record impact
        for reputation in [user_reputation, other_user_reputation]:
            contribution = Contribution(
                user_reputation_id=reputation.id,
                contribution_type="code",
                size="large",
                base_points=500,
                current_points=500
            )
            db.add(contribution)
            
            await service.record_contribution_impact(
                reputation.user_id,
                {
                    "contribution_id": contribution.id,
                    "views": 1000,
                    "downloads": 100,
                    "interactions": 50,
                    "unique_users": 200
                }
            )
        
        db.commit()
        
        # Get leaderboard
        leaderboard = await service.get_global_leaderboard()
        
        # Verify impact metrics
        for entry in leaderboard:
            assert "total_views" in entry
            assert "total_downloads" in entry
            assert "total_interactions" in entry 