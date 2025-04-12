import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.marketplace import CodeListing, Transaction, TransactionStatus, ListingStatus, AuditLog
from app.models.invocation_key import InvocationKey, KeyStatus
from app.models.user import User
from app.services.marketplace_service import MarketplaceService
from app.schemas.marketplace import ListingCreate, ListingUpdate
from app.utils.audit import get_audit_logs, export_audit_logs
from app.core.config import settings
import stripe
from unittest.mock import patch, MagicMock

# Test data
TEST_USER = {
    "id": 1,
    "email": "test@example.com",
    "is_active": True
}

TEST_LISTING = {
    "title": "Test Code Listing",
    "description": "A test code listing",
    "price": 10.0,
    "metadata": {"tags": ["test", "code"]}
}

@pytest.fixture
def db_session():
    # Create a test database session
    # This should be replaced with your actual test database setup
    pass

@pytest.fixture
def marketplace_service(db_session):
    return MarketplaceService(db_session)

@pytest.fixture
def test_user(db_session):
    return User(**TEST_USER)

@pytest.fixture
def test_listing(db_session, test_user):
    listing = CodeListing(
        **TEST_LISTING,
        creator_id=test_user.id
    )
    db_session.add(listing)
    db_session.commit()
    return listing

# Listing Management Tests
class TestListingManagement:
    async def test_create_listing_valid_data(self, marketplace_service, test_user):
        listing_data = ListingCreate(**TEST_LISTING)
        listing = await marketplace_service.create_listing(
            title=listing_data.title,
            description=listing_data.description,
            price=listing_data.price,
            creator_id=test_user.id,
            metadata=listing_data.metadata
        )
        
        assert listing.title == TEST_LISTING["title"]
        assert listing.price == TEST_LISTING["price"]
        assert listing.status == ListingStatus.DRAFT
        assert listing.creator_id == test_user.id
        
        # Verify audit log
        audit_logs = await get_audit_logs(
            db_session,
            action="create_listing",
            entity_type="code_listing",
            entity_id=listing.id
        )
        assert len(audit_logs) == 1
        assert audit_logs[0].user_id == test_user.id

    async def test_create_listing_invalid_price(self, marketplace_service, test_user):
        with pytest.raises(HTTPException) as exc_info:
            await marketplace_service.create_listing(
                title="Invalid Listing",
                description="Test",
                price=-10.0,  # Invalid negative price
                creator_id=test_user.id
            )
        assert exc_info.value.status_code == 422

    async def test_update_listing(self, marketplace_service, test_user, test_listing):
        update_data = ListingUpdate(
            title="Updated Title",
            price=15.0,
            status=ListingStatus.ACTIVE
        )
        
        updated_listing = await marketplace_service.update_listing(
            listing_id=test_listing.id,
            creator_id=test_user.id,
            title=update_data.title,
            price=update_data.price,
            status=update_data.status
        )
        
        assert updated_listing.title == "Updated Title"
        assert updated_listing.price == 15.0
        assert updated_listing.status == ListingStatus.ACTIVE
        
        # Verify audit log
        audit_logs = await get_audit_logs(
            db_session,
            action="update_listing",
            entity_type="code_listing",
            entity_id=test_listing.id
        )
        assert len(audit_logs) == 1

    async def test_delete_listing(self, marketplace_service, test_user, test_listing):
        result = await marketplace_service.delete_listing(
            listing_id=test_listing.id,
            creator_id=test_user.id
        )
        
        assert result is True
        deleted_listing = db_session.query(CodeListing).filter(
            CodeListing.id == test_listing.id
        ).first()
        assert deleted_listing.status == ListingStatus.DELETED

# Transaction Processing Tests
class TestTransactionProcessing:
    @patch('stripe.PaymentIntent.create')
    async def test_create_purchase_intent(self, mock_stripe, marketplace_service, test_user, test_listing):
        # Mock Stripe response
        mock_stripe.return_value = {
            'id': 'pi_test123',
            'client_secret': 'secret_test123'
        }
        
        result = await marketplace_service.create_purchase_intent(
            listing_id=test_listing.id,
            buyer_id=test_user.id
        )
        
        assert 'client_secret' in result
        assert 'transaction_id' in result
        
        # Verify transaction was created
        transaction = db_session.query(Transaction).filter(
            Transaction.id == result['transaction_id']
        ).first()
        assert transaction.status == TransactionStatus.PENDING
        assert transaction.stripe_payment_intent_id == 'pi_test123'

    @patch('stripe.PaymentIntent.retrieve')
    async def test_handle_payment_success(self, mock_stripe, marketplace_service, test_user, test_listing):
        # Create a pending transaction
        transaction = Transaction(
            listing_id=test_listing.id,
            buyer_id=test_user.id,
            amount=test_listing.price,
            stripe_payment_intent_id='pi_test123'
        )
        db_session.add(transaction)
        db_session.commit()
        
        # Mock successful payment
        mock_stripe.return_value = {
            'id': 'pi_test123',
            'status': 'succeeded'
        }
        
        result = await marketplace_service.handle_payment_success(
            payment_intent_id='pi_test123',
            transaction_id=transaction.id
        )
        
        assert result.status == TransactionStatus.COMPLETED
        
        # Verify key was generated
        key = db_session.query(InvocationKey).filter(
            InvocationKey.transaction_id == transaction.id
        ).first()
        assert key is not None
        assert key.status == KeyStatus.ACTIVE

    async def test_handle_payment_failure(self, marketplace_service, test_user, test_listing):
        # Create a pending transaction
        transaction = Transaction(
            listing_id=test_listing.id,
            buyer_id=test_user.id,
            amount=test_listing.price,
            stripe_payment_intent_id='pi_test123'
        )
        db_session.add(transaction)
        db_session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            await marketplace_service.handle_payment_success(
                payment_intent_id='invalid_id',
                transaction_id=transaction.id
            )
        assert exc_info.value.status_code == 404

# Creator Dashboard Tests
class TestCreatorDashboard:
    async def test_get_creator_dashboard(self, marketplace_service, test_user, test_listing):
        # Create some transactions and keys
        transaction = Transaction(
            listing_id=test_listing.id,
            buyer_id=test_user.id,
            amount=test_listing.price,
            status=TransactionStatus.COMPLETED
        )
        db_session.add(transaction)
        db_session.commit()
        
        key = InvocationKey(
            code_listing_id=test_listing.id,
            issued_to_user_id=test_user.id,
            transaction_id=transaction.id,
            status=KeyStatus.ACTIVE
        )
        db_session.add(key)
        db_session.commit()
        
        dashboard = await marketplace_service.get_creator_dashboard(
            creator_id=test_user.id
        )
        
        assert dashboard['total_listings'] == 1
        assert dashboard['total_revenue'] == test_listing.price
        assert len(dashboard['listings']) == 1
        
        listing_stats = dashboard['listings'][0]
        assert listing_stats['total_sales'] == 1
        assert listing_stats['active_keys'] == 1

    async def test_revoke_key(self, marketplace_service, test_user, test_listing):
        # Create a transaction and key
        transaction = Transaction(
            listing_id=test_listing.id,
            buyer_id=test_user.id,
            amount=test_listing.price,
            status=TransactionStatus.COMPLETED
        )
        db_session.add(transaction)
        db_session.commit()
        
        key = InvocationKey(
            code_listing_id=test_listing.id,
            issued_to_user_id=test_user.id,
            transaction_id=transaction.id,
            status=KeyStatus.ACTIVE
        )
        db_session.add(key)
        db_session.commit()
        
        revoked_key = await marketplace_service.revoke_key(
            key_id=key.id,
            creator_id=test_user.id,
            reason="Test revocation"
        )
        
        assert revoked_key.status == KeyStatus.REVOKED
        assert revoked_key.revocation_reason == "Test revocation"

# Audit System Tests
class TestAuditSystem:
    async def test_audit_logging(self, marketplace_service, test_user, test_listing):
        # Perform some actions
        await marketplace_service.update_listing(
            listing_id=test_listing.id,
            creator_id=test_user.id,
            title="Updated Title"
        )
        
        # Check audit logs
        logs = await get_audit_logs(
            db_session,
            user_id=test_user.id,
            action="update_listing"
        )
        assert len(logs) == 1
        assert logs[0].entity_id == test_listing.id

    async def test_export_audit_logs(self, marketplace_service, test_user, test_listing):
        # Perform some actions
        await marketplace_service.update_listing(
            listing_id=test_listing.id,
            creator_id=test_user.id,
            title="Updated Title"
        )
        
        # Export logs
        start_date = datetime.utcnow() - timedelta(days=1)
        end_date = datetime.utcnow()
        
        csv_export = await export_audit_logs(
            db_session,
            start_date=start_date,
            end_date=end_date,
            format="csv"
        )
        assert "timestamp" in csv_export
        assert "user_id" in csv_export
        
        json_export = await export_audit_logs(
            db_session,
            start_date=start_date,
            end_date=end_date,
            format="json"
        )
        assert "timestamp" in json_export
        assert "user_id" in json_export

# Security Tests
class TestSecurity:
    async def test_rate_limiting(self, marketplace_service, test_user):
        # Make multiple requests quickly
        for _ in range(settings.DEFAULT_RATE_LIMIT + 1):
            with pytest.raises(HTTPException) as exc_info:
                await marketplace_service.create_listing(
                    title="Test",
                    description="Test",
                    price=10.0,
                    creator_id=test_user.id
                )
            if exc_info.value.status_code == 429:
                break
        else:
            pytest.fail("Rate limiting did not trigger")

    async def test_ip_whitelist(self, marketplace_service, test_user, test_listing):
        # Mock request with non-whitelisted IP
        with patch('app.utils.ip_whitelist.check_ip_whitelist') as mock_check:
            mock_check.return_value = False
            with pytest.raises(HTTPException) as exc_info:
                await marketplace_service.handle_payment_success(
                    payment_intent_id='test123',
                    transaction_id=1
                )
            assert exc_info.value.status_code == 403

    async def test_unauthorized_access(self, marketplace_service, test_user, test_listing):
        # Try to update listing as different user
        other_user = User(id=2, email="other@example.com")
        with pytest.raises(HTTPException) as exc_info:
            await marketplace_service.update_listing(
                listing_id=test_listing.id,
                creator_id=other_user.id,
                title="Unauthorized Update"
            )
        assert exc_info.value.status_code == 404 