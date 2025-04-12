from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from ..models.aphira import JobStatus

class CodeSubmission(BaseModel):
    code: str = Field(..., description="The $aphira code to compile and execute")

class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class JobResults(BaseModel):
    job_id: str
    status: JobStatus
    results: Optional[Dict[str, Any]] = None
    logs: Optional[List[str]] = None
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None 