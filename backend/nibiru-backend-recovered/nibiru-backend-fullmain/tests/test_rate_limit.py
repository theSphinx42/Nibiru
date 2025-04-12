import pytest
from datetime import datetime, timedelta
from fastapi import Request, HTTPException
from app.core.rate_limit import RateLimiter, RATE_LIMITS
from app.models.user import User
from app.core.redis import redis_client

@pytest.fixture
def rate_limiter():
    return RateLimiter(redis_client)

@pytest.fixture
def mock_request():
    class MockRequest:
        def __init__(self, client_host="127.0.0.1"):
            self.client = type('Client', (), {'host': client_host})()
    return MockRequest()

@pytest.fixture
def test_user():
    return User(id=1, username="test_user")

class TestRateLimiter:
    async def test_check_rate_limit_new_user(self, rate_limiter, mock_request, test_user):
        """Test rate limit check for a new user."""
        # First request should pass
        assert await rate_limiter.check_rate_limit(
            mock_request,
            test_user,
            **RATE_LIMITS["contribution"]
        ) is True

        # Check remaining requests
        remaining = await rate_limiter.get_remaining_requests(
            mock_request,
            test_user,
            **RATE_LIMITS["contribution"]
        )
        assert remaining == RATE_LIMITS["contribution"]["limit"] - 1

    async def test_check_rate_limit_exceeded(self, rate_limiter, mock_request, test_user):
        """Test rate limit exceeded scenario."""
        limit = RATE_LIMITS["contribution"]["limit"]
        
        # Make requests up to the limit
        for _ in range(limit):
            await rate_limiter.check_rate_limit(
                mock_request,
                test_user,
                **RATE_LIMITS["contribution"]
            )
        
        # Next request should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await rate_limiter.check_rate_limit(
                mock_request,
                test_user,
                **RATE_LIMITS["contribution"]
            )
        assert exc_info.value.status_code == 429
        assert "Too many requests" in str(exc_info.value.detail)

    async def test_get_remaining_requests(self, rate_limiter, mock_request, test_user):
        """Test remaining requests calculation."""
        limit = RATE_LIMITS["contribution"]["limit"]
        
        # Initial remaining requests should equal limit
        remaining = await rate_limiter.get_remaining_requests(
            mock_request,
            test_user,
            **RATE_LIMITS["contribution"]
        )
        assert remaining == limit
        
        # Make some requests
        for i in range(3):
            await rate_limiter.check_rate_limit(
                mock_request,
                test_user,
                **RATE_LIMITS["contribution"]
            )
            remaining = await rate_limiter.get_remaining_requests(
                mock_request,
                test_user,
                **RATE_LIMITS["contribution"]
            )
            assert remaining == limit - (i + 1)

    async def test_different_endpoints(self, rate_limiter, mock_request, test_user):
        """Test rate limits for different endpoints."""
        # Make requests to different endpoints
        await rate_limiter.check_rate_limit(
            mock_request,
            test_user,
            **RATE_LIMITS["contribution"]
        )
        await rate_limiter.check_rate_limit(
            mock_request,
            test_user,
            **RATE_LIMITS["leaderboard"]
        )
        
        # Check remaining requests for each endpoint
        contribution_remaining = await rate_limiter.get_remaining_requests(
            mock_request,
            test_user,
            **RATE_LIMITS["contribution"]
        )
        leaderboard_remaining = await rate_limiter.get_remaining_requests(
            mock_request,
            test_user,
            **RATE_LIMITS["leaderboard"]
        )
        
        assert contribution_remaining == RATE_LIMITS["contribution"]["limit"] - 1
        assert leaderboard_remaining == RATE_LIMITS["leaderboard"]["limit"] - 1

    async def test_ip_based_rate_limit(self, rate_limiter, mock_request):
        """Test rate limiting based on IP address."""
        # First request should pass
        assert await rate_limiter.check_rate_limit(
            mock_request,
            **RATE_LIMITS["contribution"]
        ) is True
        
        # Check remaining requests
        remaining = await rate_limiter.get_remaining_requests(
            mock_request,
            **RATE_LIMITS["contribution"]
        )
        assert remaining == RATE_LIMITS["contribution"]["limit"] - 1

    async def test_rate_limit_window(self, rate_limiter, mock_request, test_user):
        """Test rate limit window expiration."""
        # Make some requests
        for _ in range(3):
            await rate_limiter.check_rate_limit(
                mock_request,
                test_user,
                **RATE_LIMITS["contribution"]
            )
        
        # Check remaining requests
        remaining = await rate_limiter.get_remaining_requests(
            mock_request,
            test_user,
            **RATE_LIMITS["contribution"]
        )
        assert remaining == RATE_LIMITS["contribution"]["limit"] - 3
        
        # Wait for window to expire (simulated)
        await redis_client.delete(f"rate_limit:user:{test_user.id}")
        
        # Check remaining requests after window expiration
        remaining = await rate_limiter.get_remaining_requests(
            mock_request,
            test_user,
            **RATE_LIMITS["contribution"]
        )
        assert remaining == RATE_LIMITS["contribution"]["limit"] 