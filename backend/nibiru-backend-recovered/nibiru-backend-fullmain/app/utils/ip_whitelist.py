from functools import wraps
from fastapi import HTTPException, status, Request
from typing import List
from app.core.config import settings

def check_ip_whitelist(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request = kwargs.get('request')
        if not request:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Request object not available"
            )

        client_ip = request.client.host
        whitelisted_ips = settings.WHITELISTED_IPS

        if client_ip not in whitelisted_ips:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="IP not whitelisted for this operation"
            )

        return await func(*args, **kwargs)
    return wrapper 