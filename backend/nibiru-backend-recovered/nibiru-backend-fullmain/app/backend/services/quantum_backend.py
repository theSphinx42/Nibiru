from typing import Dict, List, Optional
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import json
from pathlib import Path

logger = logging.getLogger(__name__)

class BackendStatus(Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    MAINTENANCE = "maintenance"
    ERROR = "error"

@dataclass
class BackendMetrics:
    status: BackendStatus
    last_check: datetime
    queue_length: int
    average_wait_time: float
    error_rate: float
    qubit_count: int
    max_circuit_depth: int
    gate_fidelity: float

class QuantumBackendService:
    def __init__(self):
        self.backends = {
            "qiskit": {
                "name": "IBM Qiskit",
                "description": "IBM's quantum computing framework",
                "default_metrics": BackendMetrics(
                    status=BackendStatus.AVAILABLE,
                    last_check=datetime.now(),
                    queue_length=0,
                    average_wait_time=0.0,
                    error_rate=0.0,
                    qubit_count=27,
                    max_circuit_depth=1000,
                    gate_fidelity=0.99
                )
            },
            "cirq": {
                "name": "Google Cirq",
                "description": "Google's quantum computing framework",
                "default_metrics": BackendMetrics(
                    status=BackendStatus.AVAILABLE,
                    last_check=datetime.now(),
                    queue_length=0,
                    average_wait_time=0.0,
                    error_rate=0.0,
                    qubit_count=53,
                    max_circuit_depth=2000,
                    gate_fidelity=0.995
                )
            },
            "pennylane": {
                "name": "PennyLane",
                "description": "Xanadu's quantum computing framework",
                "default_metrics": BackendMetrics(
                    status=BackendStatus.AVAILABLE,
                    last_check=datetime.now(),
                    queue_length=0,
                    average_wait_time=0.0,
                    error_rate=0.0,
                    qubit_count=12,
                    max_circuit_depth=500,
                    gate_fidelity=0.98
                )
            },
            "braket": {
                "name": "Amazon Braket",
                "description": "Amazon's quantum computing service",
                "default_metrics": BackendMetrics(
                    status=BackendStatus.AVAILABLE,
                    last_check=datetime.now(),
                    queue_length=0,
                    average_wait_time=0.0,
                    error_rate=0.0,
                    qubit_count=32,
                    max_circuit_depth=1500,
                    gate_fidelity=0.99
                )
            },
            "ionq": {
                "name": "IonQ",
                "description": "IonQ's trapped-ion quantum computer",
                "default_metrics": BackendMetrics(
                    status=BackendStatus.AVAILABLE,
                    last_check=datetime.now(),
                    queue_length=0,
                    average_wait_time=0.0,
                    error_rate=0.0,
                    qubit_count=11,
                    max_circuit_depth=1000,
                    gate_fidelity=0.995
                )
            },
            "rigetti": {
                "name": "Rigetti",
                "description": "Rigetti's superconducting quantum computer",
                "default_metrics": BackendMetrics(
                    status=BackendStatus.AVAILABLE,
                    last_check=datetime.now(),
                    queue_length=0,
                    average_wait_time=0.0,
                    error_rate=0.0,
                    qubit_count=32,
                    max_circuit_depth=1000,
                    gate_fidelity=0.98
                )
            }
        }
        
        self.backend_metrics: Dict[str, BackendMetrics] = {
            backend_id: backend["default_metrics"]
            for backend_id, backend in self.backends.items()
        }
        
        self.user_preferences: Dict[str, List[str]] = {}
        self.backend_usage_logs: Dict[str, List[Dict]] = {}
        
        # Create logs directory if it doesn't exist
        self.logs_dir = Path("logs/quantum_backends")
        self.logs_dir.mkdir(parents=True, exist_ok=True)

    def get_backend_status(self, backend_id: str) -> Optional[BackendMetrics]:
        """Get current status of a quantum backend"""
        return self.backend_metrics.get(backend_id)

    def update_backend_metrics(self, backend_id: str, metrics: Dict):
        """Update metrics for a quantum backend"""
        if backend_id in self.backend_metrics:
            current = self.backend_metrics[backend_id]
            self.backend_metrics[backend_id] = BackendMetrics(
                status=metrics.get("status", current.status),
                last_check=datetime.now(),
                queue_length=metrics.get("queue_length", current.queue_length),
                average_wait_time=metrics.get("average_wait_time", current.average_wait_time),
                error_rate=metrics.get("error_rate", current.error_rate),
                qubit_count=metrics.get("qubit_count", current.qubit_count),
                max_circuit_depth=metrics.get("max_circuit_depth", current.max_circuit_depth),
                gate_fidelity=metrics.get("gate_fidelity", current.gate_fidelity)
            )
            self._log_backend_update(backend_id, metrics)

    def get_user_backend_preferences(self, user_id: str) -> List[str]:
        """Get user's preferred backend order"""
        return self.user_preferences.get(user_id, list(self.backends.keys()))

    def set_user_backend_preferences(self, user_id: str, preferences: List[str]):
        """Set user's preferred backend order"""
        # Validate preferences
        valid_backends = set(self.backends.keys())
        preferences = [p for p in preferences if p in valid_backends]
        
        # Add any missing backends to the end
        remaining = list(valid_backends - set(preferences))
        preferences.extend(remaining)
        
        self.user_preferences[user_id] = preferences
        self._log_preference_update(user_id, preferences)

    def get_available_backend(self, user_id: str, required_qubits: int = 0) -> Optional[str]:
        """Get the best available backend for a user based on preferences and requirements"""
        preferences = self.get_user_backend_preferences(user_id)
        
        for backend_id in preferences:
            metrics = self.backend_metrics.get(backend_id)
            if not metrics:
                continue
                
            if (metrics.status == BackendStatus.AVAILABLE and
                metrics.qubit_count >= required_qubits and
                metrics.error_rate < 0.1):  # Less than 10% error rate
                return backend_id
        
        return None

    def log_backend_usage(self, user_id: str, backend_id: str, job_id: str, duration: float):
        """Log backend usage for a job"""
        if user_id not in self.backend_usage_logs:
            self.backend_usage_logs[user_id] = []
        
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "backend_id": backend_id,
            "job_id": job_id,
            "duration": duration
        }
        
        self.backend_usage_logs[user_id].append(log_entry)
        self._write_usage_log(user_id, log_entry)

    def get_backend_usage_stats(self, user_id: str) -> Dict:
        """Get backend usage statistics for a user"""
        if user_id not in self.backend_usage_logs:
            return {
                "total_jobs": 0,
                "backend_usage": {},
                "average_duration": 0
            }
        
        logs = self.backend_usage_logs[user_id]
        total_jobs = len(logs)
        
        # Calculate backend usage
        backend_usage = {}
        for log in logs:
            backend_id = log["backend_id"]
            backend_usage[backend_id] = backend_usage.get(backend_id, 0) + 1
        
        # Calculate average duration
        durations = [log["duration"] for log in logs]
        avg_duration = sum(durations) / total_jobs if total_jobs > 0 else 0
        
        return {
            "total_jobs": total_jobs,
            "backend_usage": backend_usage,
            "average_duration": avg_duration
        }

    def _log_backend_update(self, backend_id: str, metrics: Dict):
        """Log backend status update"""
        log_file = self.logs_dir / "backend_updates.json"
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "backend_id": backend_id,
            "metrics": metrics
        }
        
        self._append_to_log(log_file, log_entry)

    def _log_preference_update(self, user_id: str, preferences: List[str]):
        """Log user preference update"""
        log_file = self.logs_dir / "preference_updates.json"
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "preferences": preferences
        }
        
        self._append_to_log(log_file, log_entry)

    def _write_usage_log(self, user_id: str, log_entry: Dict):
        """Write usage log to file"""
        log_file = self.logs_dir / f"usage_{user_id}.json"
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