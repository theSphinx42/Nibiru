from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from ..database import get_db
from ..services.aphira_service import AphiraService
from ..schemas.aphira import CodeSubmission, JobStatus, JobResults
from ..auth import get_current_user

router = APIRouter()

@router.post("/submit-code", response_model=Dict[str, Any])
async def submit_code(
    submission: CodeSubmission,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit $aphira code for compilation and execution
    """
    service = AphiraService(db)
    return await service.submit_code(submission.code, current_user["id"])

@router.get("/execution-status/{job_id}", response_model=JobStatus)
async def get_execution_status(
    job_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current status of a job
    """
    service = AphiraService(db)
    return await service.get_job_status(job_id)

@router.get("/execution-results/{job_id}", response_model=JobResults)
async def get_execution_results(
    job_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the results of a completed job
    """
    service = AphiraService(db)
    return await service.get_job_results(job_id) 