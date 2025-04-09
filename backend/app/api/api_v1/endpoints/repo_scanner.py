from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Optional, List
from pydantic import BaseModel

from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.repo_scanner import RepoAnalysis, RepoSource
from app.services.repo_scanner import RepoScanner

router = APIRouter()
scanner = RepoScanner()

class ScanGitHubRequest(BaseModel):
    repo_url: str

@router.post("/scan/github", response_model=RepoAnalysis)
async def scan_github_repository(
    request: ScanGitHubRequest,
    current_user: User = Depends(get_current_active_user)
) -> RepoAnalysis:
    """Scan a GitHub repository and generate listing suggestions."""
    try:
        return await scanner.scan_github_repo(request.repo_url)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to scan repository: {str(e)}"
        )

@router.post("/scan/upload", response_model=RepoAnalysis)
async def scan_uploaded_repository(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
) -> RepoAnalysis:
    """Scan an uploaded repository (zip file) and generate listing suggestions."""
    if not file.filename.endswith('.zip'):
        raise HTTPException(
            status_code=400,
            detail="Only ZIP files are supported"
        )
        
    try:
        # Create temporary directory for the upload
        import tempfile
        import os
        import zipfile
        import shutil
        
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_path = os.path.join(temp_dir, file.filename)
            
            # Save uploaded file
            with open(zip_path, 'wb') as f:
                shutil.copyfileobj(file.file, f)
                
            # Extract zip
            extract_path = os.path.join(temp_dir, 'repo')
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_path)
                
            # Scan the extracted repository
            return await scanner.scan_local_repo(extract_path)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process repository: {str(e)}"
        )
    finally:
        file.file.close()

@router.post("/scan/local", response_model=RepoAnalysis)
async def scan_local_repository(
    path: str,
    current_user: User = Depends(get_current_active_user)
) -> RepoAnalysis:
    """Scan a local repository path and generate listing suggestions."""
    if not os.path.exists(path):
        raise HTTPException(
            status_code=404,
            detail="Repository path not found"
        )
        
    try:
        return await scanner.scan_local_repo(path)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to scan repository: {str(e)}"
        ) 