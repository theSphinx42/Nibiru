from typing import Optional, Dict, Any
import asyncio
import uuid
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models.aphira import AphiraJob, JobStatus
from ..utils.sphinx import SphinxCompiler
from ..utils.quantum import QuantumExecutor
from ..utils.sandbox import SandboxEnvironment

class AphiraService:
    def __init__(self, db: Session):
        self.db = db
        self.compiler = SphinxCompiler()
        self.quantum_executor = QuantumExecutor()
        self.sandbox = SandboxEnvironment()

    async def submit_code(self, code: str, user_id: int) -> Dict[str, Any]:
        """
        Submit $aphira code for compilation and execution
        """
        try:
            # Generate unique job ID
            job_id = str(uuid.uuid4())
            
            # Create job record
            job = AphiraJob(
                id=job_id,
                user_id=user_id,
                code=code,
                status=JobStatus.PENDING,
                created_at=datetime.utcnow()
            )
            self.db.add(job)
            self.db.commit()

            # Start compilation and execution in background
            asyncio.create_task(self._process_job(job_id))

            return {
                "job_id": job_id,
                "status": JobStatus.PENDING,
                "message": "Job submitted successfully"
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """
        Get the current status of a job
        """
        job = self.db.query(AphiraJob).filter(AphiraJob.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        return {
            "job_id": job_id,
            "status": job.status,
            "progress": job.progress,
            "error_message": job.error_message,
            "created_at": job.created_at,
            "updated_at": job.updated_at
        }

    async def get_job_results(self, job_id: str) -> Dict[str, Any]:
        """
        Get the results of a completed job
        """
        job = self.db.query(AphiraJob).filter(AphiraJob.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        if job.status not in [JobStatus.COMPLETED, JobStatus.FAILED]:
            raise HTTPException(status_code=400, detail="Job not completed")

        return {
            "job_id": job_id,
            "status": job.status,
            "results": job.results,
            "logs": job.execution_logs,
            "error_message": job.error_message,
            "completed_at": job.completed_at
        }

    async def _process_job(self, job_id: str):
        """
        Process a job in the background
        """
        job = self.db.query(AphiraJob).filter(AphiraJob.id == job_id).first()
        if not job:
            return

        try:
            # Update status to compiling
            job.status = JobStatus.COMPILING
            job.progress = 0
            self.db.commit()

            # Compile code in sandbox
            with self.sandbox.create_environment():
                compiled_code = await self.compiler.compile(job.code)
                job.progress = 50
                self.db.commit()

                # Execute on quantum backend
                results = await self.quantum_executor.execute(compiled_code)
                
                # Update job with results
                job.status = JobStatus.COMPLETED
                job.progress = 100
                job.results = results
                job.completed_at = datetime.utcnow()
                self.db.commit()

        except Exception as e:
            # Update job with error
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            self.db.commit() 