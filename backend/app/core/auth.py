from fastapi import Depends, HTTPException
from app.models.user import User

async def get_current_active_user() -> User:
    # TODO: Implement actual authentication
    return User(username="test", email="test@example.com") 