from functools import wraps
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from typing import Dict, Tuple
import asyncio
from app.core.config import settings

class RateLimiter:
    def __init__(self):
        self.requests: Dict[str, list] = {}
        self.locks: Dict[str, asyncio.Lock] = {}

    async def acquire_lock(self, key: str) -> asyncio.Lock:
        if key not in self.locks:
            self.locks[key] = asyncio.Lock()
        return self.locks[key]

    async def is_rate_limited(self, key: str, max_requests: int, window_seconds: int) -> bool:
        lock = await self.acquire_lock(key)
        async with lock:
            now = datetime.utcnow()
            if key not in self.requests:
                self.requests[key] = []

            # Remove old requests
            self.requests[key] = [
                req_time for req_time in self.requests[key]
                if now - req_time < timedelta(seconds=window_seconds)
            ]

            # Check if rate limit exceeded
            if len(self.requests[key]) >= max_requests:
                return True

            # Add new request
            self.requests[key].append(now)
            return False

rate_limiter = RateLimiter()

def rate_limit(max_requests: int, window_seconds: int):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get client IP from request
            request = kwargs.get('request')
            if not request:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Request object not available"
                )

            client_ip = request.client.host
            key = f"{client_ip}:{func.__name__}"

            if await rate_limiter.is_rate_limited(key, max_requests, window_seconds):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded"
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator 