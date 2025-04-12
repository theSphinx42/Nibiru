from typing import Dict, Optional, List
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import json
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class QuantumScoreTier(Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"

@dataclass
class ResourceLimits:
    cpu_period: int
    cpu_quota: int
    memory: str
    memory_swap: str
    pids_limit: int
    max_execution_time: int  # in seconds
    max_concurrent_jobs: int
    cooldown_period: int  # in seconds
    max_failed_attempts: int

class SandboxSecurityService:
    def __init__(self):
        self.resource_limits = {
            QuantumScoreTier.BRONZE: ResourceLimits(
                cpu_period=100000,
                cpu_quota=25000,  # 25% CPU
                memory="256m",
                memory_swap="256m",
                pids_limit=20,
                max_execution_time=300,
                max_concurrent_jobs=1,
                cooldown_period=3600,  # 1 hour
                max_failed_attempts=3
            ),
            QuantumScoreTier.SILVER: ResourceLimits(
                cpu_period=100000,
                cpu_quota=50000,  # 50% CPU
                memory="512m",
                memory_swap="512m",
                pids_limit=50,
                max_execution_time=600,
                max_concurrent_jobs=2,
                cooldown_period=1800,  # 30 minutes
                max_failed_attempts=5
            ),
            QuantumScoreTier.GOLD: ResourceLimits(
                cpu_period=100000,
                cpu_quota=75000,  # 75% CPU
                memory="1g",
                memory_swap="1g",
                pids_limit=100,
                max_execution_time=1200,
                max_concurrent_jobs=3,
                cooldown_period=900,  # 15 minutes
                max_failed_attempts=10
            ),
            QuantumScoreTier.PLATINUM: ResourceLimits(
                cpu_period=100000,
                cpu_quota=100000,  # 100% CPU
                memory="2g",
                memory_swap="2g",
                pids_limit=200,
                max_execution_time=3600,
                max_concurrent_jobs=5,
                cooldown_period=300,  # 5 minutes
                max_failed_attempts=20
            )
        }
        self.failed_attempts: Dict[str, List[datetime]] = {}
        self.cooldowns: Dict[str, datetime] = {}
        self.execution_logs: Dict[str, List[Dict]] = {}
        self.signature_mismatches: Dict[str, List[Dict]] = {}
        
        # Create logs directory if it doesn't exist
        self.logs_dir = Path("logs/sandbox")
        self.logs_dir.mkdir(parents=True, exist_ok=True)

    def get_resource_limits(self, user_id: str, quantum_score: float) -> ResourceLimits:
        """Get resource limits based on user's quantum score"""
        if quantum_score >= 90:
            return self.resource_limits[QuantumScoreTier.PLATINUM]
        elif quantum_score >= 75:
            return self.resource_limits[QuantumScoreTier.GOLD]
        elif quantum_score >= 50:
            return self.resource_limits[QuantumScoreTier.SILVER]
        return self.resource_limits[QuantumScoreTier.BRONZE]

    def check_cooldown(self, user_id: str) -> Optional[str]:
        """Check if user is in cooldown period"""
        if user_id in self.cooldowns:
            cooldown_end = self.cooldowns[user_id]
            if datetime.now() < cooldown_end:
                remaining = (cooldown_end - datetime.now()).total_seconds()
                return f"User is in cooldown. {remaining:.1f} seconds remaining."
        return None

    def record_failed_attempt(self, user_id: str, ip_address: str, error_code: int):
        """Record a failed execution attempt"""
        now = datetime.now()
        
        # Initialize user's failed attempts if not exists
        if user_id not in self.failed_attempts:
            self.failed_attempts[user_id] = []
        
        # Add new failed attempt
        self.failed_attempts[user_id].append(now)
        
        # Clean up old attempts
        limits = self.get_resource_limits(user_id, 0)  # Default to bronze tier
        cutoff = now - timedelta(seconds=limits.cooldown_period)
        self.failed_attempts[user_id] = [
            attempt for attempt in self.failed_attempts[user_id]
            if attempt > cutoff
        ]
        
        # Check if user should be put in cooldown
        if len(self.failed_attempts[user_id]) >= limits.max_failed_attempts:
            self.cooldowns[user_id] = now + timedelta(seconds=limits.cooldown_period)
            self._log_cooldown_trigger(user_id, ip_address)
            return True
        
        return False

    def log_execution(self, user_id: str, job_id: str, metrics: Dict):
        """Log execution metrics"""
        if user_id not in self.execution_logs:
            self.execution_logs[user_id] = []
        
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "job_id": job_id,
            "metrics": metrics
        }
        
        self.execution_logs[user_id].append(log_entry)
        self._write_execution_log(user_id, log_entry)

    def log_signature_mismatch(self, user_id: str, ip_address: str, code_hash: str):
        """Log signature mismatch attempts"""
        if user_id not in self.signature_mismatches:
            self.signature_mismatches[user_id] = []
        
        mismatch_entry = {
            "timestamp": datetime.now().isoformat(),
            "ip_address": ip_address,
            "code_hash": code_hash
        }
        
        self.signature_mismatches[user_id].append(mismatch_entry)
        self._write_signature_log(user_id, mismatch_entry)

    def _log_cooldown_trigger(self, user_id: str, ip_address: str):
        """Log when a user is put in cooldown"""
        log_file = self.logs_dir / "cooldowns.json"
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "ip_address": ip_address,
            "reason": "max_failed_attempts_reached"
        }
        
        self._append_to_log(log_file, log_entry)

    def _write_execution_log(self, user_id: str, log_entry: Dict):
        """Write execution log to file"""
        log_file = self.logs_dir / f"executions_{user_id}.json"
        self._append_to_log(log_file, log_entry)

    def _write_signature_log(self, user_id: str, log_entry: Dict):
        """Write signature mismatch log to file"""
        log_file = self.logs_dir / f"signatures_{user_id}.json"
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

    def get_user_execution_stats(self, user_id: str) -> Dict:
        """Get execution statistics for a user"""
        if user_id not in self.execution_logs:
            return {
                "total_executions": 0,
                "successful_executions": 0,
                "failed_executions": 0,
                "average_duration": 0,
                "average_memory_usage": 0
            }
        
        logs = self.execution_logs[user_id]
        total = len(logs)
        successful = sum(1 for log in logs if log["metrics"].get("exit_code") == 0)
        failed = total - successful
        
        durations = [log["metrics"].get("duration", 0) for log in logs]
        memory_usage = [log["metrics"].get("memory_usage", 0) for log in logs]
        
        return {
            "total_executions": total,
            "successful_executions": successful,
            "failed_executions": failed,
            "average_duration": sum(durations) / total if total > 0 else 0,
            "average_memory_usage": sum(memory_usage) / total if total > 0 else 0
        } 