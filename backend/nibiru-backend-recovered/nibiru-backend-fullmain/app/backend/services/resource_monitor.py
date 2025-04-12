from typing import Dict, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import json
from pathlib import Path
import logging
import psutil
import asyncio
from enum import Enum

logger = logging.getLogger(__name__)

class ResourceEventType(Enum):
    CPU_PEAK = "cpu_peak"
    MEMORY_PEAK = "memory_peak"
    THROTTLING = "throttling"
    ERROR = "error"

@dataclass
class ResourceMetrics:
    cpu_percent: float
    memory_percent: float
    memory_used: int
    memory_total: int
    io_read_bytes: int
    io_write_bytes: int
    network_sent_bytes: int
    network_recv_bytes: int
    timestamp: datetime

@dataclass
class ResourceEvent:
    event_type: ResourceEventType
    job_id: str
    timestamp: datetime
    details: Dict
    metrics: ResourceMetrics

class ResourceMonitorService:
    def __init__(self):
        self.job_metrics: Dict[str, List[ResourceMetrics]] = {}
        self.job_events: Dict[str, List[ResourceEvent]] = {}
        self.monitoring_tasks: Dict[str, asyncio.Task] = {}
        
        # Resource thresholds
        self.thresholds = {
            "cpu_peak": 80.0,  # CPU usage percentage
            "memory_peak": 80.0,  # Memory usage percentage
            "io_threshold": 1024 * 1024 * 100,  # 100 MB/s
            "network_threshold": 1024 * 1024 * 50  # 50 MB/s
        }
        
        # Create logs directory if it doesn't exist
        self.logs_dir = Path("logs/resources")
        self.logs_dir.mkdir(parents=True, exist_ok=True)

    async def start_monitoring(self, job_id: str, process: psutil.Process):
        """Start monitoring resources for a job"""
        if job_id in self.monitoring_tasks:
            return
        
        self.job_metrics[job_id] = []
        self.job_events[job_id] = []
        
        task = asyncio.create_task(self._monitor_resources(job_id, process))
        self.monitoring_tasks[job_id] = task

    async def stop_monitoring(self, job_id: str):
        """Stop monitoring resources for a job"""
        if job_id in self.monitoring_tasks:
            self.monitoring_tasks[job_id].cancel()
            del self.monitoring_tasks[job_id]
            
            # Write final metrics to log
            self._write_metrics_log(job_id)
            self._write_events_log(job_id)

    async def get_job_metrics(self, job_id: str) -> Optional[Dict]:
        """Get resource metrics for a job"""
        if job_id not in self.job_metrics:
            return None
        
        metrics = self.job_metrics[job_id]
        events = self.job_events.get(job_id, [])
        
        if not metrics:
            return None
        
        # Calculate statistics
        cpu_values = [m.cpu_percent for m in metrics]
        memory_values = [m.memory_percent for m in metrics]
        
        return {
            "job_id": job_id,
            "metrics": {
                "cpu": {
                    "current": cpu_values[-1],
                    "average": sum(cpu_values) / len(cpu_values),
                    "peak": max(cpu_values),
                    "history": cpu_values
                },
                "memory": {
                    "current": memory_values[-1],
                    "average": sum(memory_values) / len(memory_values),
                    "peak": max(memory_values),
                    "history": memory_values
                },
                "io": {
                    "read_total": metrics[-1].io_read_bytes,
                    "write_total": metrics[-1].io_write_bytes
                },
                "network": {
                    "sent_total": metrics[-1].network_sent_bytes,
                    "recv_total": metrics[-1].network_recv_bytes
                }
            },
            "events": [
                {
                    "type": event.event_type.value,
                    "timestamp": event.timestamp.isoformat(),
                    "details": event.details
                }
                for event in events
            ]
        }

    async def _monitor_resources(self, job_id: str, process: psutil.Process):
        """Monitor resource usage for a job"""
        try:
            last_io = process.io_counters()
            last_net = process.net_io_counters()
            
            while True:
                try:
                    # Get current metrics
                    metrics = ResourceMetrics(
                        cpu_percent=process.cpu_percent(),
                        memory_percent=process.memory_percent(),
                        memory_used=process.memory_info().rss,
                        memory_total=psutil.virtual_memory().total,
                        io_read_bytes=process.io_counters().read_bytes - last_io.read_bytes,
                        io_write_bytes=process.io_counters().write_bytes - last_io.write_bytes,
                        network_sent_bytes=process.net_io_counters().bytes_sent - last_net.bytes_sent,
                        network_recv_bytes=process.net_io_counters().bytes_recv - last_net.bytes_recv,
                        timestamp=datetime.now()
                    )
                    
                    # Update last counters
                    last_io = process.io_counters()
                    last_net = process.net_io_counters()
                    
                    # Store metrics
                    self.job_metrics[job_id].append(metrics)
                    
                    # Check for events
                    await self._check_resource_events(job_id, metrics)
                    
                    # Sleep for 1 second
                    await asyncio.sleep(1)
                    
                except psutil.NoSuchProcess:
                    logger.error(f"Process for job {job_id} no longer exists")
                    break
                except Exception as e:
                    logger.error(f"Error monitoring resources for job {job_id}: {str(e)}")
                    break
                    
        except asyncio.CancelledError:
            logger.info(f"Resource monitoring cancelled for job {job_id}")
        except Exception as e:
            logger.error(f"Resource monitoring failed for job {job_id}: {str(e)}")

    async def _check_resource_events(self, job_id: str, metrics: ResourceMetrics):
        """Check for resource events and record them"""
        events = []
        
        # Check CPU peak
        if metrics.cpu_percent >= self.thresholds["cpu_peak"]:
            events.append(ResourceEvent(
                event_type=ResourceEventType.CPU_PEAK,
                job_id=job_id,
                timestamp=metrics.timestamp,
                details={"cpu_percent": metrics.cpu_percent},
                metrics=metrics
            ))
        
        # Check memory peak
        if metrics.memory_percent >= self.thresholds["memory_peak"]:
            events.append(ResourceEvent(
                event_type=ResourceEventType.MEMORY_PEAK,
                job_id=job_id,
                timestamp=metrics.timestamp,
                details={"memory_percent": metrics.memory_percent},
                metrics=metrics
            ))
        
        # Check I/O throttling
        if (metrics.io_read_bytes + metrics.io_write_bytes) >= self.thresholds["io_threshold"]:
            events.append(ResourceEvent(
                event_type=ResourceEventType.THROTTLING,
                job_id=job_id,
                timestamp=metrics.timestamp,
                details={
                    "io_read": metrics.io_read_bytes,
                    "io_write": metrics.io_write_bytes
                },
                metrics=metrics
            ))
        
        # Check network throttling
        if (metrics.network_sent_bytes + metrics.network_recv_bytes) >= self.thresholds["network_threshold"]:
            events.append(ResourceEvent(
                event_type=ResourceEventType.THROTTLING,
                job_id=job_id,
                timestamp=metrics.timestamp,
                details={
                    "network_sent": metrics.network_sent_bytes,
                    "network_recv": metrics.network_recv_bytes
                },
                metrics=metrics
            ))
        
        # Store events
        if events:
            if job_id not in self.job_events:
                self.job_events[job_id] = []
            self.job_events[job_id].extend(events)
            self._write_events_log(job_id)

    def _write_metrics_log(self, job_id: str):
        """Write metrics log to file"""
        if job_id not in self.job_metrics:
            return
        
        log_file = self.logs_dir / f"metrics_{job_id}.json"
        log_entries = [
            {
                "timestamp": m.timestamp.isoformat(),
                "cpu_percent": m.cpu_percent,
                "memory_percent": m.memory_percent,
                "memory_used": m.memory_used,
                "memory_total": m.memory_total,
                "io_read_bytes": m.io_read_bytes,
                "io_write_bytes": m.io_write_bytes,
                "network_sent_bytes": m.network_sent_bytes,
                "network_recv_bytes": m.network_recv_bytes
            }
            for m in self.job_metrics[job_id]
        ]
        
        self._append_to_log(log_file, log_entries)

    def _write_events_log(self, job_id: str):
        """Write events log to file"""
        if job_id not in self.job_events:
            return
        
        log_file = self.logs_dir / f"events_{job_id}.json"
        log_entries = [
            {
                "type": event.event_type.value,
                "timestamp": event.timestamp.isoformat(),
                "details": event.details
            }
            for event in self.job_events[job_id]
        ]
        
        self._append_to_log(log_file, log_entries)

    def _append_to_log(self, log_file: Path, entries: List[Dict]):
        """Append log entries to a JSON log file"""
        try:
            if log_file.exists():
                with open(log_file, 'r') as f:
                    logs = json.load(f)
            else:
                logs = []
            
            logs.extend(entries)
            
            with open(log_file, 'w') as f:
                json.dump(logs, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to write to log file {log_file}: {str(e)}") 