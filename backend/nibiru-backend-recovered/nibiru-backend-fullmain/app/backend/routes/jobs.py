from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List
from ..services.resource_monitor import ResourceMonitorService
from ..auth import get_current_user
from ..models.user import User

router = APIRouter()
resource_monitor = ResourceMonitorService()

@router.get("/{job_id}/metrics")
async def get_job_metrics(
    job_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict:
    """Get resource metrics for a job"""
    try:
        metrics = await resource_monitor.get_job_metrics(job_id)
        if not metrics:
            raise HTTPException(status_code=404, detail="Job metrics not found")
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{job_id}/monitor")
async def start_monitoring(
    job_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict:
    """Start monitoring resources for a job"""
    try:
        # Get the process for the job
        process = await get_job_process(job_id)  # You'll need to implement this
        if not process:
            raise HTTPException(status_code=404, detail="Job process not found")
        
        await resource_monitor.start_monitoring(job_id, process)
        return {"status": "monitoring_started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{job_id}/monitor")
async def stop_monitoring(
    job_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict:
    """Stop monitoring resources for a job"""
    try:
        await resource_monitor.stop_monitoring(job_id)
        return {"status": "monitoring_stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 