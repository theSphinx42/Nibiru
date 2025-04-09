import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.reputation import (
    UserReputation,
    Contribution,
    UserBadge,
    Leaderboard,
    CommunityEngagement,
    ContributionType,
    ContributionSize,
    BadgeType
)
from app.schemas.reputation import ReputationUpdate, ContributionImpactBase
from app.services.reputation import ReputationService
from app.core.exceptions import ResourceNotFound

@pytest.fixture
def reputation_service(db: Session):
    return ReputationService(db)

@pytest.fixture
def user_reputation(db: Session, test_user):
    reputation = UserReputation(user_id=test_user.id)
    db.add(reputation)
    db.commit()
    db.refresh(reputation)
    return reputation

class TestPointsCalculation:
    def test_calculate_base_points(self, reputation_service):
        """Test base points calculation for different contribution sizes."""
        # Test small contributions
        small_points = reputation_service.calculate_base_points(ContributionSize.SMALL)
        assert 10 <= small_points <= 50
        
        # Test medium contributions
        medium_points = reputation_service.calculate_base_points(ContributionSize.MEDIUM)
        assert 100 <= medium_points <= 500
        
        # Test large contributions
        large_points = reputation_service.calculate_base_points(ContributionSize.LARGE)
        assert 500 <= large_points <= 1000

    def test_depreciation_calculation(self, reputation_service, db: Session):
        """Test point depreciation based on age."""
        # Create a contribution
        contribution = Contribution(
            user_reputation_id=1,
            contribution_type=ContributionType.CODE,
            size=ContributionSize.MEDIUM,
            base_points=300,
            current_points=300,
            created_at=datetime.utcnow() - timedelta(days=365)  # 1 year old
        )
        
        # Calculate depreciation
        depreciation_factor = reputation_service.calculate_depreciation(contribution)
        assert 0.9 <= depreciation_factor <= 1.0  # 10% depreciation per year
        
        # Update points
        current_points = reputation_service.update_contribution_points(contribution)
        assert current_points == contribution.base_points * depreciation_factor

class TestContributionManagement:
    async def test_add_contribution(self, reputation_service, user_reputation):
        """Test adding a new contribution."""
        update_data = ReputationUpdate(
            contribution_type=ContributionType.CODE,
            size=ContributionSize.MEDIUM,
            points=300,
            metadata={"description": "Test contribution"}
        )
        
        contribution = await reputation_service.add_contribution(
            user_reputation.user_id,
            update_data
        )
        
        assert contribution.contribution_type == ContributionType.CODE
        assert contribution.size == ContributionSize.MEDIUM
        assert contribution.base_points > 0
        assert contribution.current_points > 0
        assert user_reputation.total_score > 0
        assert user_reputation.active_score > 0

    async def test_update_contribution(self, reputation_service, user_reputation):
        """Test updating an existing contribution."""
        # First add a contribution
        update_data = ReputationUpdate(
            contribution_type=ContributionType.CODE,
            size=ContributionSize.MEDIUM,
            points=300
        )
        contribution = await reputation_service.add_contribution(
            user_reputation.user_id,
            update_data
        )
        
        # Update the contribution
        new_metadata = {"description": "Updated contribution"}
        updated = await reputation_service.update_contribution(
            contribution.id,
            new_metadata
        )
        
        assert updated.metadata == new_metadata
        assert updated.current_points < updated.base_points  # Should be depreciated

class TestBadgeSystem:
    async def test_badge_awarding(self, reputation_service, user_reputation):
        """Test badge awarding for different achievements."""
        # Add multiple contributions to trigger badges
        for _ in range(10):
            update_data = ReputationUpdate(
                contribution_type=ContributionType.CODE,
                size=ContributionSize.SMALL,
                points=50
            )
            await reputation_service.add_contribution(
                user_reputation.user_id,
                update_data
            )
        
        # Check for contributor badge
        badges = await reputation_service.check_and_award_badges(user_reputation)
        assert any(b.badge_type == BadgeType.CONTRIBUTOR for b in badges)
        
        # Add more contributions for master badge
        for _ in range(40):
            update_data = ReputationUpdate(
                contribution_type=ContributionType.CODE,
                size=ContributionSize.SMALL,
                points=50
            )
            await reputation_service.add_contribution(
                user_reputation.user_id,
                update_data
            )
        
        badges = await reputation_service.check_and_award_badges(user_reputation)
        assert any(b.badge_type == BadgeType.MASTER for b in badges)

class TestLeaderboard:
    async def test_leaderboard_updates(self, reputation_service, user_reputation):
        """Test leaderboard updates and ranking."""
        # Add contributions in different categories
        categories = [ContributionType.CODE, ContributionType.DESIGN]
        for category in categories:
            update_data = ReputationUpdate(
                contribution_type=category,
                size=ContributionSize.MEDIUM,
                points=300
            )
            await reputation_service.add_contribution(
                user_reputation.user_id,
                update_data
            )
        
        # Update leaderboards
        entries = await reputation_service.update_leaderboards(user_reputation)
        assert len(entries) == len(categories)
        
        # Check leaderboard entries
        for entry in entries:
            assert entry.score > 0
            assert entry.rank > 0
            assert entry.category in [c.value for c in categories]

class TestCommunityEngagement:
    async def test_community_engagement(self, reputation_service, user_reputation):
        """Test community engagement tracking."""
        engagement = await reputation_service.add_community_engagement(
            user_reputation.user_id,
            "review",
            25.0,
            {"reviewed_item": "test_item"}
        )
        
        assert engagement.engagement_type == "review"
        assert engagement.points_earned == 25.0
        assert user_reputation.total_score >= 25.0
        assert user_reputation.active_score >= 25.0

class TestMarketplaceIntegration:
    async def test_marketplace_transaction(self, reputation_service, user_reputation):
        """Test marketplace transaction recording."""
        transaction = await reputation_service.record_marketplace_transaction(
            user_reputation.user_id,
            {
                "contribution_id": 1,
                "amount": 100.0,
                "currency": "USD"
            }
        )
        
        assert transaction.amount == 100.0
        assert transaction.currency == "USD"
        assert user_reputation.total_sales == 1
        assert user_reputation.total_revenue == 100.0

class TestImpactMetrics:
    async def test_contribution_impact(self, reputation_service, user_reputation):
        """Test contribution impact tracking."""
        # First add a contribution
        update_data = ReputationUpdate(
            contribution_type=ContributionType.CODE,
            size=ContributionSize.MEDIUM,
            points=300
        )
        contribution = await reputation_service.add_contribution(
            user_reputation.user_id,
            update_data
        )
        
        # Record impact
        impact_data = ContributionImpactBase(
            views=100,
            downloads=10,
            interactions=5,
            unique_users=3
        )
        impact = await reputation_service.record_contribution_impact(
            user_reputation.user_id,
            {
                "contribution_id": contribution.id,
                **impact_data.dict()
            }
        )
        
        assert impact.views == 100
        assert impact.downloads == 10
        assert impact.interactions == 5
        assert impact.unique_users == 3
        assert user_reputation.total_views == 100
        assert user_reputation.total_downloads == 10
        assert user_reputation.total_interactions == 5

class TestErrorHandling:
    async def test_update_nonexistent_contribution(self, reputation_service):
        """Test error handling for updating nonexistent contribution."""
        with pytest.raises(ResourceNotFound):
            await reputation_service.update_contribution(999, {"description": "test"})

    async def test_invalid_contribution_type(self, reputation_service, user_reputation):
        """Test error handling for invalid contribution type."""
        with pytest.raises(ValueError):
            update_data = ReputationUpdate(
                contribution_type="invalid_type",
                size=ContributionSize.MEDIUM,
                points=300
            )
            await reputation_service.add_contribution(
                user_reputation.user_id,
                update_data
            ) 