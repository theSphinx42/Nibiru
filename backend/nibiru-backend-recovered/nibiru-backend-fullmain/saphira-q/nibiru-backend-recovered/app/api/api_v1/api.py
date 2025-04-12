from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, users, listings, transactions, license_keys

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(listings.router, prefix="/listings", tags=["listings"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(license_keys.router, prefix="/license-keys", tags=["license-keys"]) 