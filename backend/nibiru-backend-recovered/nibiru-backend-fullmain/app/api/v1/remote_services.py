from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.remote_services import ServiceType, ServiceStatus
from app.schemas.remote_services import (
    RemoteServiceCreate,
    RemoteServiceResponse,
    ServiceListingCreate,
    ServiceListingResponse,
    ServiceTransactionCreate,
    ServiceTransactionResponse,
    ServiceUsageLogCreate,
    ServiceUsageLogResponse,
    ServiceStatisticsResponse
)
from app.services.remote_services import RemoteServicesService
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/services", response_model=RemoteServiceResponse)
async def create_service(
    service_data: RemoteServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new remote service."""
    service = RemoteServicesService(db)
    return await service.create_service(service_data)

@router.get("/services", response_model=List[RemoteServiceResponse])
async def list_services(
    service_type: Optional[ServiceType] = None,
    status: Optional[ServiceStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List remote services with optional filtering."""
    service = RemoteServicesService(db)
    return await service.list_services(service_type, status)

@router.get("/services/{service_id}", response_model=RemoteServiceResponse)
async def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a remote service by ID."""
    service = RemoteServicesService(db)
    return await service.get_service(service_id)

@router.post("/listings", response_model=ServiceListingResponse)
async def create_listing(
    listing_data: ServiceListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new service listing."""
    service = RemoteServicesService(db)
    return await service.create_listing(listing_data)

@router.get("/listings", response_model=List[ServiceListingResponse])
async def list_listings(
    service_id: Optional[int] = None,
    creator_id: Optional[int] = None,
    status: Optional[ServiceStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List service listings with optional filtering."""
    service = RemoteServicesService(db)
    return await service.list_listings(service_id, creator_id, status)

@router.get("/listings/{listing_id}", response_model=ServiceListingResponse)
async def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a service listing by ID."""
    service = RemoteServicesService(db)
    return await service.get_listing(listing_id)

@router.post("/transactions", response_model=ServiceTransactionResponse)
async def create_transaction(
    transaction_data: ServiceTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new service transaction."""
    service = RemoteServicesService(db)
    return await service.initiate_transaction(transaction_data)

@router.post("/usage/start", response_model=ServiceUsageLogResponse)
async def start_usage(
    usage_data: ServiceUsageLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start tracking service usage."""
    service = RemoteServicesService(db)
    return await service.start_service_usage(usage_data)

@router.post("/usage/{usage_id}/end", response_model=ServiceUsageLogResponse)
async def end_usage(
    usage_id: int,
    usage_metrics: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """End service usage and update metrics."""
    service = RemoteServicesService(db)
    return await service.end_service_usage(usage_id, usage_metrics)

@router.get("/usage/statistics", response_model=ServiceStatisticsResponse)
async def get_usage_statistics(
    service_id: Optional[int] = None,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get usage statistics for the current user."""
    service = RemoteServicesService(db)
    return await service.get_usage_statistics(
        current_user.id,
        service_id,
        start_date,
        end_date
    )

@router.get("/resources/availability")
async def check_resource_availability(
    service_id: int,
    resource_type: str,
    required_capacity: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if a resource has sufficient capacity."""
    service = RemoteServicesService(db)
    is_available = await service.check_resource_availability(
        service_id,
        resource_type,
        required_capacity
    )
    return {"available": is_available}

@router.patch("/resources/{resource_id}/availability")
async def update_resource_availability(
    resource_id: int,
    new_availability: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update resource availability status."""
    service = RemoteServicesService(db)
    return await service.update_resource_availability(
        resource_id,
        new_availability
    ) 