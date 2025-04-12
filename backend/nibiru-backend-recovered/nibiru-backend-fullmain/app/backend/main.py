from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import profile, constellation, admin
from .config import settings

app = FastAPI(
    title="Nibiru API",
    description="Backend API for the Nibiru platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(profile.router, prefix="/api/v1", tags=["profile"])
app.include_router(constellation.router, prefix="/api/v1", tags=["constellation"])
app.include_router(admin.router, prefix="/api/v1", tags=["admin"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Nibiru API"} 