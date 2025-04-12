from typing import Dict, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

@dataclass
class ExecutionCost:
    job_id: str
    script_id: str
    backend: str
    gas_fee: float
    backend_cost: float
    total_cost: float
    timestamp: datetime
    duration: float
    qubit_count: int
    gate_count: int

class CostAnalyticsService:
    def __init__(self):
        self.costs: Dict[str, List[ExecutionCost]] = {}
        self.backend_pricing = {
            "qiskit": {"base": 0.10, "per_qubit": 0.01, "per_gate": 0.001},
            "cirq": {"base": 0.15, "per_qubit": 0.015, "per_gate": 0.0015},
            "pennylane": {"base": 0.08, "per_qubit": 0.008, "per_gate": 0.0008},
            "braket": {"base": 0.20, "per_qubit": 0.02, "per_gate": 0.002},
            "ionq": {"base": 0.25, "per_qubit": 0.025, "per_gate": 0.0025},
            "rigetti": {"base": 0.18, "per_qubit": 0.018, "per_gate": 0.0018}
        }
        
        # Create logs directory if it doesn't exist
        self.logs_dir = Path("logs/costs")
        self.logs_dir.mkdir(parents=True, exist_ok=True)

    def record_execution_cost(self, cost: ExecutionCost):
        """Record execution cost for a job"""
        user_id = cost.job_id.split('_')[0]  # Assuming job_id format: user_id_timestamp
        if user_id not in self.costs:
            self.costs[user_id] = []
        
        self.costs[user_id].append(cost)
        self._write_cost_log(user_id, cost)

    def calculate_backend_cost(self, backend: str, qubit_count: int, gate_count: int) -> float:
        """Calculate backend execution cost based on usage"""
        if backend not in self.backend_pricing:
            return 0.0
        
        pricing = self.backend_pricing[backend]
        return (
            pricing["base"] +
            pricing["per_qubit"] * qubit_count +
            pricing["per_gate"] * gate_count
        )

    def get_cost_breakdown(self, user_id: str, time_range: Optional[timedelta] = None) -> Dict:
        """Get cost breakdown for a user"""
        if user_id not in self.costs:
            return {
                "total_cost": 0.0,
                "gas_fees": 0.0,
                "backend_costs": 0.0,
                "by_backend": {},
                "by_script": {},
                "daily_costs": []
            }
        
        costs = self.costs[user_id]
        if time_range:
            cutoff = datetime.now() - time_range
            costs = [c for c in costs if c.timestamp >= cutoff]
        
        # Calculate totals
        total_cost = sum(c.total_cost for c in costs)
        gas_fees = sum(c.gas_fee for c in costs)
        backend_costs = sum(c.backend_cost for c in costs)
        
        # Breakdown by backend
        by_backend = {}
        for cost in costs:
            if cost.backend not in by_backend:
                by_backend[cost.backend] = {
                    "total": 0.0,
                    "gas_fees": 0.0,
                    "backend_costs": 0.0,
                    "job_count": 0
                }
            by_backend[cost.backend]["total"] += cost.total_cost
            by_backend[cost.backend]["gas_fees"] += cost.gas_fee
            by_backend[cost.backend]["backend_costs"] += cost.backend_cost
            by_backend[cost.backend]["job_count"] += 1
        
        # Breakdown by script
        by_script = {}
        for cost in costs:
            if cost.script_id not in by_script:
                by_script[cost.script_id] = {
                    "total": 0.0,
                    "gas_fees": 0.0,
                    "backend_costs": 0.0,
                    "job_count": 0,
                    "avg_duration": 0.0
                }
            by_script[cost.script_id]["total"] += cost.total_cost
            by_script[cost.script_id]["gas_fees"] += cost.gas_fee
            by_script[cost.script_id]["backend_costs"] += cost.backend_cost
            by_script[cost.script_id]["job_count"] += 1
            by_script[cost.script_id]["avg_duration"] = (
                (by_script[cost.script_id]["avg_duration"] * (by_script[cost.script_id]["job_count"] - 1) +
                cost.duration) / by_script[cost.script_id]["job_count"]
            )
        
        # Daily costs
        daily_costs = []
        if costs:
            start_date = min(c.timestamp for c in costs).date()
            end_date = max(c.timestamp for c in costs).date()
            current_date = start_date
            
            while current_date <= end_date:
                day_costs = [c for c in costs if c.timestamp.date() == current_date]
                daily_costs.append({
                    "date": current_date.isoformat(),
                    "total": sum(c.total_cost for c in day_costs),
                    "gas_fees": sum(c.gas_fee for c in day_costs),
                    "backend_costs": sum(c.backend_cost for c in day_costs),
                    "job_count": len(day_costs)
                })
                current_date += timedelta(days=1)
        
        return {
            "total_cost": total_cost,
            "gas_fees": gas_fees,
            "backend_costs": backend_costs,
            "by_backend": by_backend,
            "by_script": by_script,
            "daily_costs": daily_costs
        }

    def get_cost_trends(self, user_id: str, days: int = 30) -> Dict:
        """Get cost trends over time"""
        time_range = timedelta(days=days)
        breakdown = self.get_cost_breakdown(user_id, time_range)
        
        # Calculate daily averages
        daily_costs = breakdown["daily_costs"]
        if daily_costs:
            avg_daily_cost = sum(d["total"] for d in daily_costs) / len(daily_costs)
            avg_daily_jobs = sum(d["job_count"] for d in daily_costs) / len(daily_costs)
        else:
            avg_daily_cost = 0.0
            avg_daily_jobs = 0.0
        
        # Calculate cost per job
        total_jobs = sum(d["job_count"] for d in daily_costs)
        avg_cost_per_job = breakdown["total_cost"] / total_jobs if total_jobs > 0 else 0.0
        
        return {
            "daily_averages": {
                "cost": avg_daily_cost,
                "jobs": avg_daily_jobs
            },
            "cost_per_job": avg_cost_per_job,
            "daily_costs": daily_costs
        }

    def _write_cost_log(self, user_id: str, cost: ExecutionCost):
        """Write cost log to file"""
        log_file = self.logs_dir / f"costs_{user_id}.json"
        log_entry = {
            "timestamp": cost.timestamp.isoformat(),
            "job_id": cost.job_id,
            "script_id": cost.script_id,
            "backend": cost.backend,
            "gas_fee": cost.gas_fee,
            "backend_cost": cost.backend_cost,
            "total_cost": cost.total_cost,
            "duration": cost.duration,
            "qubit_count": cost.qubit_count,
            "gate_count": cost.gate_count
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