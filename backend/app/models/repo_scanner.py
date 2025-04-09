from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum

class RepoSource(str, Enum):
    GITHUB = "github"
    LOCAL = "local"
    ZIP = "zip"

class PackageGroup(BaseModel):
    name: str
    path: str
    files: List[str]
    description: str
    suggested_tier: int = Field(1, ge=1, le=3)
    suggested_tags: List[str]
    type: str  # e.g., "source", "tests", "docs", "models"
    complexity_score: float = Field(0.0, ge=0.0, le=1.0)

class ListingSuggestion(BaseModel):
    title: str
    description: str
    glyph_tier: int = Field(1, ge=1, le=3)
    tags: List[str]
    category: str
    package_groups: List[PackageGroup]
    pricing_suggestion: Dict[str, float]
    quantum_score_estimate: float = Field(0.0, ge=0.0, le=100.0)

class RepoAnalysis(BaseModel):
    repo_url: Optional[str]
    repo_path: str
    source: RepoSource
    total_files: int
    total_lines: int
    language_breakdown: Dict[str, float]  # percentage of each language
    package_groups: List[PackageGroup]
    listing_suggestions: List[ListingSuggestion]
    analysis_timestamp: str
    scan_duration_ms: int 