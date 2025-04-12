from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.ai_assistant_service import AIAssistantService
from app.schemas.ai_assistant import (
    SuggestionResponse,
    FAQResponse,
    UserContextResponse
)
from app.utils.rate_limit import rate_limit

router = APIRouter()

@router.get("/context", response_model=UserContextResponse)
@rate_limit(max_requests=100, window_seconds=60)
async def get_user_context(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's context for AI assistance."""
    ai_service = AIAssistantService(db)
    return await ai_service.get_user_context(current_user.id)

@router.get("/suggestions", response_model=List[SuggestionResponse])
@rate_limit(max_requests=100, window_seconds=60)
async def get_suggestions(
    current_page: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized suggestions based on user context and current page."""
    ai_service = AIAssistantService(db)
    return await ai_service.get_contextual_suggestions(
        user_id=current_user.id,
        current_page=current_page
    )

@router.get("/faq", response_model=List[FAQResponse])
@rate_limit(max_requests=100, window_seconds=60)
async def get_faq_suggestions(
    query: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get relevant FAQ suggestions based on user query and context."""
    ai_service = AIAssistantService(db)
    return await ai_service.get_faq_suggestions(
        user_id=current_user.id,
        query=query
    )

@router.post("/patterns/update")
@rate_limit(max_requests=100, window_seconds=60)
async def update_user_patterns(
    action: str,
    entity_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user behavior patterns."""
    ai_service = AIAssistantService(db)
    await ai_service.update_user_patterns(
        user_id=current_user.id,
        action=action,
        entity_type=entity_type
    )
    return {"status": "success"} 