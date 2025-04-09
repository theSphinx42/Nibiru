from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from pathlib import Path
import re

router = APIRouter()

class SuggestionRequest(BaseModel):
    description: str
    template: Optional[str] = None

class Suggestion(BaseModel):
    tags: List[str]
    category: str
    glyphTier: int
    suggestedPrice: float
    sampleName: Optional[str]
    sampleBlurb: Optional[str]
    confidence: float

# Load template data
TEMPLATES_PATH = Path(__file__).parent.parent.parent.parent / "data" / "templates.json"
try:
    with open(TEMPLATES_PATH) as f:
        TEMPLATES = json.load(f)
except FileNotFoundError:
    TEMPLATES = {}

def analyze_complexity(text: str) -> float:
    """Analyze text complexity to determine glyph tier."""
    # Simple heuristics for complexity analysis
    words = text.split()
    avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
    technical_terms = len(re.findall(r'\b(quantum|algorithm|neural|optimization|compiler)\b', text.lower()))
    
    complexity = (avg_word_length * 0.3) + (technical_terms * 0.7)
    return min(max(complexity / 10, 0), 1)  # Normalize to 0-1

def suggest_tier(complexity: float) -> int:
    """Suggest glyph tier based on complexity."""
    if complexity > 0.8:
        return 3
    elif complexity > 0.4:
        return 2
    return 1

def extract_tags(text: str) -> List[str]:
    """Extract relevant tags from text."""
    common_tags = {
        'quantum': ['quantum', 'qubit', 'superposition'],
        'ai': ['ai', 'ml', 'neural', 'model'],
        'optimization': ['optimization', 'solver', 'algorithm'],
        'tooling': ['tool', 'plugin', 'extension'],
        'data': ['data', 'processing', 'analysis'],
        'security': ['security', 'encryption', 'privacy']
    }
    
    found_tags = set()
    text_lower = text.lower()
    
    for category, keywords in common_tags.items():
        if any(keyword in text_lower for keyword in keywords):
            found_tags.add(category)
    
    return list(found_tags)

def suggest_price(tier: int, template: Optional[str]) -> float:
    """Suggest price based on tier and template."""
    base_prices = {
        1: 29.99,
        2: 99.99,
        3: 299.99
    }
    
    template_multipliers = {
        'ai_model': 1.5,
        'toolchain': 1.2,
        'quantum_codec': 1.3,
        'glyph_generator': 0.8,
        'data_processing': 1.1,
        'saphira_script': 0.9
    }
    
    base_price = base_prices[tier]
    if template and template in template_multipliers:
        return round(base_price * template_multipliers[template], 2)
    return base_price

@router.post("/listings/suggest", response_model=Suggestion)
async def generate_suggestions(request: SuggestionRequest):
    """Generate AI-powered suggestions for a listing."""
    try:
        # Analyze text complexity
        complexity = analyze_complexity(request.description)
        
        # Determine tier
        tier = suggest_tier(complexity)
        
        # Extract tags
        tags = extract_tags(request.description)
        
        # Get template-specific data
        template_data = TEMPLATES.get(request.template, {}) if request.template else {}
        
        # Generate suggestion
        suggestion = Suggestion(
            tags=tags,
            category=template_data.get('category', 'Quantum Application'),
            glyphTier=tier,
            suggestedPrice=suggest_price(tier, request.template),
            sampleName=template_data.get('name_template', '').replace(
                '{type}', template_data.get('type', 'Quantum')
            ) if request.template else None,
            sampleBlurb=template_data.get('blurb_template', '') if request.template else None,
            confidence=min(
                (len(tags) * 0.2) + (complexity * 0.5) + (0.3 if request.template else 0),
                1.0
            ) * 100
        )
        
        return suggestion
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate suggestions: {str(e)}"
        ) 