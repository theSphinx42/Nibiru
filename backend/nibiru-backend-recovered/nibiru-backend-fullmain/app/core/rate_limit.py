from typing import Optional
from fastapi import HTTPException, Request
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.redis import redis_client

class RateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def check_rate_limit(
        self,
        request: Request,
        user: Optional[User] = None,
        limit: int = 100,
        window: int = 60
    ) -> bool:
        """Check if the request is within rate limits."""
        # Get client IP
        client_ip = request.client.host
        
        # Create unique key for the rate limit
        if user:
            key = f"rate_limit:user:{user.id}"
        else:
            key = f"rate_limit:ip:{client_ip}"
        
        # Get current count
        current = await self.redis.get(key)
        if current is None:
            # First request in window
            await self.redis.setex(key, window, 1)
            return True
        
        current_count = int(current)
        if current_count >= limit:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )
        
        # Increment counter
        await self.redis.incr(key)
        return True

    async def get_remaining_requests(
        self,
        request: Request,
        user: Optional[User] = None,
        limit: int = 100,
        window: int = 60
    ) -> int:
        """Get remaining requests for the current window."""
        if user:
            key = f"rate_limit:user:{user.id}"
        else:
            key = f"rate_limit:ip:{request.client.host}"
        
        current = await self.redis.get(key)
        if current is None:
            return limit
        
        return max(0, limit - int(current))

# Rate limit configurations
RATE_LIMITS = {
    "contribution": {
        "limit": 10,  # 10 contributions per minute
        "window": 60
    },
    "leaderboard": {
        "limit": 30,  # 30 requests per minute
        "window": 60
    },
    "stats": {
        "limit": 60,  # 60 requests per minute
        "window": 60
    },
    "engagement": {
        "limit": 20,  # 20 engagements per minute
        "window": 60
    }
}

# Create rate limiter instance
rate_limiter = RateLimiter(redis_client) 