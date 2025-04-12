import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.reputation import (
    UserReputation,
    Contribution,
    MarketplaceTransaction,
    ContributionImpact
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

class TestMarketplaceTransactions:
    async def test_record_transaction(self, db: Session, user_reputation, contribution):
        """Test recording a marketplace transaction."""
        service = ReputationService(db)
        
        # Record transaction
        transaction = await service.record_marketplace_transaction(
            user_reputation.user_id,
            {
                "contribution_id": contribution.id,
                "amount": 100.0,
                "currency": "USD"
            }
        )
        
        # Verify transaction details
        assert transaction.amount == 100.0
        assert transaction.currency == "USD"
        assert transaction.contribution_id == contribution.id
        assert transaction.user_reputation_id == user_reputation.id
        
        # Verify user reputation updates
        assert user_reputation.total_sales == 1
        assert user_reputation.total_revenue == 100.0

    async def test_record_multiple_transactions(self, db: Session, user_reputation, contribution):
        """Test recording multiple transactions."""
        service = ReputationService(db)
        
        # Record multiple transactions
        transactions = [
            {"amount": 100.0, "currency": "USD"},
            {"amount": 200.0, "currency": "USD"},
            {"amount": 150.0, "currency": "USD"}
        ]
        
        for transaction_data in transactions:
            await service.record_marketplace_transaction(
                user_reputation.user_id,
                {
                    "contribution_id": contribution.id,
                    **transaction_data
                }
            )
        
        # Verify total stats
        assert user_reputation.total_sales == 3
        assert user_reputation.total_revenue == 450.0

    async def test_record_transaction_invalid_contribution(self, db: Session, user_reputation):
        """Test recording transaction with invalid contribution."""
        service = ReputationService(db)
        
        with pytest.raises(ResourceNotFound):
            await service.record_marketplace_transaction(
                user_reputation.user_id,
                {
                    "contribution_id": 999,
                    "amount": 100.0,
                    "currency": "USD"
                }
            )

class TestContributionImpact:
    async def test_record_impact(self, db: Session, user_reputation, contribution):
        """Test recording contribution impact metrics."""
        service = ReputationService(db)
        
        # Record impact
        impact = await service.record_contribution_impact(
            user_reputation.user_id,
            {
                "contribution_id": contribution.id,
                "views": 100,
                "downloads": 10,
                "interactions": 5,
                "unique_users": 3
            }
        )
        
        # Verify impact details
        assert impact.views == 100
        assert impact.downloads == 10
        assert impact.interactions == 5
        assert impact.unique_users == 3
        assert impact.contribution_id == contribution.id
        assert impact.user_reputation_id == user_reputation.id
        
        # Verify user reputation updates
        assert user_reputation.total_views == 100
        assert user_reputation.total_downloads == 10
        assert user_reputation.total_interactions == 5

    async def test_record_multiple_impact_entries(self, db: Session, user_reputation, contribution):
        """Test recording multiple impact entries."""
        service = ReputationService(db)
        
        # Record multiple impact entries
        impact_entries = [
            {"views": 100, "downloads": 10, "interactions": 5, "unique_users": 3},
            {"views": 200, "downloads": 20, "interactions": 10, "unique_users": 5},
            {"views": 150, "downloads": 15, "interactions": 8, "unique_users": 4}
        ]
        
        for impact_data in impact_entries:
            await service.record_contribution_impact(
                user_reputation.user_id,
                {
                    "contribution_id": contribution.id,
                    **impact_data
                }
            )
        
        # Verify total stats
        assert user_reputation.total_views == 450
        assert user_reputation.total_downloads == 45
        assert user_reputation.total_interactions == 23

    async def test_record_impact_invalid_contribution(self, db: Session, user_reputation):
        """Test recording impact for invalid contribution."""
        service = ReputationService(db)
        
        with pytest.raises(ResourceNotFound):
            await service.record_contribution_impact(
                user_reputation.user_id,
                {
                    "contribution_id": 999,
                    "views": 100,
                    "downloads": 10,
                    "interactions": 5,
                    "unique_users": 3
                }
            )

class TestMarketplaceStats:
    async def test_get_marketplace_stats(self, db: Session, user_reputation, contribution):
        """Test retrieving marketplace statistics."""
        service = ReputationService(db)
        
        # Record some transactions
        transactions = [
            {"amount": 100.0, "currency": "USD"},
            {"amount": 200.0, "currency": "USD"},
            {"amount": 150.0, "currency": "USD"}
        ]
        
        for transaction_data in transactions:
            await service.record_marketplace_transaction(
                user_reputation.user_id,
                {
                    "contribution_id": contribution.id,
                    **transaction_data
                }
            )
        
        # Get marketplace stats
        stats = await service.get_user_stats(user_reputation.user_id)
        
        # Verify stats
        assert stats.marketplace_stats["total_sales"] == 3
        assert stats.marketplace_stats["total_revenue"] == 450.0
        assert len(stats.marketplace_stats["top_selling_items"]) > 0

    async def test_get_impact_stats(self, db: Session, user_reputation, contribution):
        """Test retrieving impact statistics."""
        service = ReputationService(db)
        
        # Record some impact entries
        impact_entries = [
            {"views": 100, "downloads": 10, "interactions": 5, "unique_users": 3},
            {"views": 200, "downloads": 20, "interactions": 10, "unique_users": 5}
        ]
        
        for impact_data in impact_entries:
            await service.record_contribution_impact(
                user_reputation.user_id,
                {
                    "contribution_id": contribution.id,
                    **impact_data
                }
            )
        
        # Get impact stats
        stats = await service.get_user_stats(user_reputation.user_id)
        
        # Verify stats
        assert stats.impact_metrics["total_views"] == 300
        assert stats.impact_metrics["total_downloads"] == 30
        assert stats.impact_metrics["total_interactions"] == 15
        assert stats.impact_metrics["unique_users"] == 8 