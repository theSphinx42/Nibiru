from enum import Enum
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from ..database import Base

class JobStatus(str, Enum):
    PENDING = "pending"
    COMPILING = "compiling"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"

class AphiraJob(Base):
    __tablename__ = "aphira_jobs"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(String, nullable=False)
    status = Column(String, nullable=False, default=JobStatus.PENDING)
    progress = Column(Integer, default=0)
    results = Column(JSON, nullable=True)
    execution_logs = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True) 