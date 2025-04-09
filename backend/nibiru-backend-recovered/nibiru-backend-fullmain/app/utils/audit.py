from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.marketplace import AuditLog
from app.core.config import settings

async def log_audit_event(
    db: Session,
    user_id: int,
    action: str,
    entity_type: str,
    entity_id: int,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> AuditLog:
    """Log an audit event for tracking sensitive operations."""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        ip_address=ip_address,
        user_agent=user_agent,
        metadata=metadata or {}
    )
    
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    
    return audit_log

async def get_audit_logs(
    db: Session,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0
) -> list[AuditLog]:
    """Retrieve audit logs with optional filtering."""
    query = db.query(AuditLog)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if action:
        query = query.filter(AuditLog.action == action)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    if start_date:
        query = query.filter(AuditLog.created_at >= start_date)
    if end_date:
        query = query.filter(AuditLog.created_at <= end_date)
    
    query = query.order_by(AuditLog.created_at.desc())
    query = query.offset(offset).limit(limit)
    
    return query.all()

async def export_audit_logs(
    db: Session,
    start_date: datetime,
    end_date: datetime,
    format: str = "csv"
) -> str:
    """Export audit logs to a specified format."""
    logs = await get_audit_logs(
        db,
        start_date=start_date,
        end_date=end_date,
        limit=10000  # Adjust based on your needs
    )
    
    if format == "csv":
        import csv
        from io import StringIO
        
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            "timestamp",
            "user_id",
            "action",
            "entity_type",
            "entity_id",
            "ip_address",
            "user_agent"
        ])
        
        # Write data
        for log in logs:
            writer.writerow([
                log.created_at.isoformat(),
                log.user_id,
                log.action,
                log.entity_type,
                log.entity_id,
                log.ip_address,
                log.user_agent
            ])
        
        return output.getvalue()
    
    elif format == "json":
        import json
        
        return json.dumps([
            {
                "timestamp": log.created_at.isoformat(),
                "user_id": log.user_id,
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "ip_address": log.ip_address,
                "user_agent": log.user_agent,
                "metadata": log.metadata
            }
            for log in logs
        ], indent=2)
    
    else:
        raise ValueError(f"Unsupported export format: {format}") 