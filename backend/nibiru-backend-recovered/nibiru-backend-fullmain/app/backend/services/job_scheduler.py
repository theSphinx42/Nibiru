from typing import Dict, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import json
from pathlib import Path
import logging
import asyncio
from enum import Enum

logger = logging.getLogger(__name__)

class BatchStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class JobBatch:
    batch_id: str
    user_id: str
    script_id: str
    jobs: List[Dict]
    status: BatchStatus
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    delay_between_jobs: int  # seconds
    backend_balancing: bool
    error_message: Optional[str]

class JobSchedulerService:
    def __init__(self):
        self.batches: Dict[str, JobBatch] = {}
        self.scheduled_tasks: Dict[str, asyncio.Task] = {}
        
        # Create logs directory if it doesn't exist
        self.logs_dir = Path("logs/scheduler")
        self.logs_dir.mkdir(parents=True, exist_ok=True)

    async def create_batch(
        self,
        user_id: str,
        script_id: str,
        jobs: List[Dict],
        delay_between_jobs: int = 0,
        backend_balancing: bool = False
    ) -> JobBatch:
        """Create a new job batch"""
        batch_id = f"{user_id}_{datetime.now().timestamp()}"
        
        batch = JobBatch(
            batch_id=batch_id,
            user_id=user_id,
            script_id=script_id,
            jobs=jobs,
            status=BatchStatus.PENDING,
            created_at=datetime.now(),
            started_at=None,
            completed_at=None,
            delay_between_jobs=delay_between_jobs,
            backend_balancing=backend_balancing,
            error_message=None
        )
        
        self.batches[batch_id] = batch
        self._write_batch_log(batch)
        
        # Schedule the batch execution
        task = asyncio.create_task(self._execute_batch(batch))
        self.scheduled_tasks[batch_id] = task
        
        return batch

    async def cancel_batch(self, batch_id: str) -> bool:
        """Cancel a running batch"""
        if batch_id not in self.batches:
            return False
        
        batch = self.batches[batch_id]
        if batch.status not in [BatchStatus.PENDING, BatchStatus.RUNNING]:
            return False
        
        # Cancel the scheduled task
        if batch_id in self.scheduled_tasks:
            self.scheduled_tasks[batch_id].cancel()
            del self.scheduled_tasks[batch_id]
        
        # Update batch status
        batch.status = BatchStatus.CANCELLED
        batch.completed_at = datetime.now()
        batch.error_message = "Batch cancelled by user"
        
        self._write_batch_log(batch)
        return True

    async def retry_batch(self, batch_id: str) -> Optional[JobBatch]:
        """Retry a failed batch"""
        if batch_id not in self.batches:
            return None
        
        batch = self.batches[batch_id]
        if batch.status != BatchStatus.FAILED:
            return None
        
        # Create a new batch with the same parameters
        new_batch = await self.create_batch(
            user_id=batch.user_id,
            script_id=batch.script_id,
            jobs=batch.jobs,
            delay_between_jobs=batch.delay_between_jobs,
            backend_balancing=batch.backend_balancing
        )
        
        return new_batch

    async def get_batch_status(self, batch_id: str) -> Optional[Dict]:
        """Get detailed status of a batch"""
        if batch_id not in self.batches:
            return None
        
        batch = self.batches[batch_id]
        
        # Count job statuses
        job_statuses = {}
        for job in batch.jobs:
            status = job.get("status", "unknown")
            job_statuses[status] = job_statuses.get(status, 0) + 1
        
        return {
            "batch_id": batch.batch_id,
            "status": batch.status.value,
            "created_at": batch.created_at.isoformat(),
            "started_at": batch.started_at.isoformat() if batch.started_at else None,
            "completed_at": batch.completed_at.isoformat() if batch.completed_at else None,
            "total_jobs": len(batch.jobs),
            "job_statuses": job_statuses,
            "error_message": batch.error_message,
            "delay_between_jobs": batch.delay_between_jobs,
            "backend_balancing": batch.backend_balancing
        }

    async def _execute_batch(self, batch: JobBatch):
        """Execute a batch of jobs"""
        try:
            batch.status = BatchStatus.RUNNING
            batch.started_at = datetime.now()
            self._write_batch_log(batch)
            
            for i, job in enumerate(batch.jobs):
                if batch.status != BatchStatus.RUNNING:
                    break
                
                # Add delay between jobs if specified
                if i > 0 and batch.delay_between_jobs > 0:
                    await asyncio.sleep(batch.delay_between_jobs)
                
                # Execute job
                try:
                    # TODO: Implement actual job execution
                    # This is a placeholder for the actual job execution logic
                    await self._execute_job(job)
                except Exception as e:
                    logger.error(f"Error executing job in batch {batch.batch_id}: {str(e)}")
                    job["status"] = "failed"
                    job["error"] = str(e)
                    continue
            
            # Update batch status
            if batch.status == BatchStatus.RUNNING:
                batch.status = BatchStatus.COMPLETED
                batch.completed_at = datetime.now()
            
            self._write_batch_log(batch)
            
        except asyncio.CancelledError:
            batch.status = BatchStatus.CANCELLED
            batch.completed_at = datetime.now()
            batch.error_message = "Batch execution cancelled"
            self._write_batch_log(batch)
        except Exception as e:
            batch.status = BatchStatus.FAILED
            batch.completed_at = datetime.now()
            batch.error_message = str(e)
            self._write_batch_log(batch)
            logger.error(f"Error executing batch {batch.batch_id}: {str(e)}")

    async def _execute_job(self, job: Dict):
        """Execute a single job"""
        # TODO: Implement actual job execution
        # This is a placeholder for the actual job execution logic
        await asyncio.sleep(1)  # Simulate job execution
        job["status"] = "completed"

    def _write_batch_log(self, batch: JobBatch):
        """Write batch log to file"""
        log_file = self.logs_dir / f"batches_{batch.user_id}.json"
        log_entry = {
            "batch_id": batch.batch_id,
            "user_id": batch.user_id,
            "script_id": batch.script_id,
            "status": batch.status.value,
            "created_at": batch.created_at.isoformat(),
            "started_at": batch.started_at.isoformat() if batch.started_at else None,
            "completed_at": batch.completed_at.isoformat() if batch.completed_at else None,
            "delay_between_jobs": batch.delay_between_jobs,
            "backend_balancing": batch.backend_balancing,
            "error_message": batch.error_message,
            "jobs": batch.jobs
        }
        
        self._append_to_log(log_file, log_entry)

    def _append_to_log(self, log_file: Path, entry: Dict):
        """Append a log entry to a JSON log file"""
        try:
            if log_file.exists():
                with open(log_file, 'r') as f:
                    logs = json.load(f)
            else:
                logs = []
            
            logs.append(entry)
            
            with open(log_file, 'w') as f:
                json.dump(logs, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to write to log file {log_file}: {str(e)}") 