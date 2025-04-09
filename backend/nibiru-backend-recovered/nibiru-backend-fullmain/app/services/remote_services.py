from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.remote_services import (
    RemoteService,
    ServiceResource,
    ServiceListing,
    ServiceTransaction,
    ServiceUsageLog,
    ServiceType,
    ServiceStatus
)
from app.schemas.remote_services import (
    RemoteServiceCreate,
    ServiceListingCreate,
    ServiceTransactionCreate,
    ServiceUsageLogCreate
)
from app.core.stripe import create_payment_intent
from app.core.exceptions import ResourceNotFound, InsufficientFunds, ServiceUnavailable
import json

class RemoteServicesService:
    def __init__(self, db: Session):
        self.db = db

    async def create_service(self, service_data: RemoteServiceCreate) -> RemoteService:
        """Create a new remote service."""
        service = RemoteService(**service_data.dict())
        self.db.add(service)
        self.db.commit()
        self.db.refresh(service)
        return service

    async def get_service(self, service_id: int) -> RemoteService:
        """Get a remote service by ID."""
        service = self.db.query(RemoteService).filter(RemoteService.id == service_id).first()
        if not service:
            raise ResourceNotFound(f"Service with ID {service_id} not found")
        return service

    async def list_services(
        self,
        service_type: Optional[ServiceType] = None,
        status: Optional[ServiceStatus] = None
    ) -> List[RemoteService]:
        """List remote services with optional filtering."""
        query = self.db.query(RemoteService)
        if service_type:
            query = query.filter(RemoteService.service_type == service_type)
        if status:
            query = query.filter(RemoteService.status == status)
        return query.all()

    async def create_listing(self, listing_data: ServiceListingCreate) -> ServiceListing:
        """Create a new service listing."""
        # Verify service exists and is active
        service = await self.get_service(listing_data.service_id)
        if service.status != ServiceStatus.ACTIVE:
            raise ServiceUnavailable(f"Service {service.name} is not available")

        listing = ServiceListing(**listing_data.dict())
        self.db.add(listing)
        self.db.commit()
        self.db.refresh(listing)
        return listing

    async def get_listing(self, listing_id: int) -> ServiceListing:
        """Get a service listing by ID."""
        listing = self.db.query(ServiceListing).filter(ServiceListing.id == listing_id).first()
        if not listing:
            raise ResourceNotFound(f"Listing with ID {listing_id} not found")
        return listing

    async def list_listings(
        self,
        service_id: Optional[int] = None,
        creator_id: Optional[int] = None,
        status: Optional[ServiceStatus] = None
    ) -> List[ServiceListing]:
        """List service listings with optional filtering."""
        query = self.db.query(ServiceListing)
        if service_id:
            query = query.filter(ServiceListing.service_id == service_id)
        if creator_id:
            query = query.filter(ServiceListing.creator_id == creator_id)
        if status:
            query = query.filter(ServiceListing.status == status)
        return query.all()

    async def initiate_transaction(
        self,
        transaction_data: ServiceTransactionCreate
    ) -> ServiceTransaction:
        """Initiate a service transaction."""
        listing = await self.get_listing(transaction_data.listing_id)
        if listing.status != ServiceStatus.ACTIVE:
            raise ServiceUnavailable(f"Listing {listing.title} is not available")

        # Create Stripe payment intent
        payment_intent = await create_payment_intent(
            amount=transaction_data.amount,
            currency="usd",
            metadata={
                "listing_id": listing.id,
                "service_id": listing.service_id
            }
        )

        transaction = ServiceTransaction(
            **transaction_data.dict(),
            stripe_payment_intent_id=payment_intent.id
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    async def start_service_usage(
        self,
        usage_data: ServiceUsageLogCreate
    ) -> ServiceUsageLog:
        """Start tracking service usage."""
        # Verify transaction exists and is paid
        transaction = self.db.query(ServiceTransaction).filter(
            ServiceTransaction.id == usage_data.transaction_id
        ).first()
        if not transaction or transaction.status != "completed":
            raise ServiceUnavailable("Transaction not completed")

        usage_log = ServiceUsageLog(**usage_data.dict())
        self.db.add(usage_log)
        self.db.commit()
        self.db.refresh(usage_log)
        return usage_log

    async def end_service_usage(
        self,
        usage_id: int,
        usage_metrics: Dict[str, Any]
    ) -> ServiceUsageLog:
        """End service usage and update metrics."""
        usage_log = self.db.query(ServiceUsageLog).filter(
            ServiceUsageLog.id == usage_id
        ).first()
        if not usage_log:
            raise ResourceNotFound(f"Usage log with ID {usage_id} not found")

        usage_log.usage_end = datetime.utcnow()
        usage_log.usage_metrics = usage_metrics
        usage_log.status = "completed"

        self.db.commit()
        self.db.refresh(usage_log)
        return usage_log

    async def get_usage_statistics(
        self,
        user_id: int,
        service_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get usage statistics for a user."""
        query = self.db.query(ServiceUsageLog).filter(
            ServiceUsageLog.user_id == user_id
        )
        if service_id:
            query = query.filter(ServiceUsageLog.service_id == service_id)
        if start_date:
            query = query.filter(ServiceUsageLog.usage_start >= start_date)
        if end_date:
            query = query.filter(ServiceUsageLog.usage_start <= end_date)

        usage_logs = query.all()
        
        # Calculate statistics
        total_hours = sum(
            (log.usage_end - log.usage_start).total_seconds() / 3600
            for log in usage_logs
            if log.usage_end
        )
        
        total_cost = sum(
            log.transaction.amount
            for log in usage_logs
        )

        return {
            "total_usage_hours": total_hours,
            "total_cost": total_cost,
            "usage_count": len(usage_logs),
            "services_used": len(set(log.service_id for log in usage_logs))
        }

    async def check_resource_availability(
        self,
        service_id: int,
        resource_type: str,
        required_capacity: Dict[str, Any]
    ) -> bool:
        """Check if a resource has sufficient capacity."""
        resources = self.db.query(ServiceResource).filter(
            ServiceResource.service_id == service_id,
            ServiceResource.resource_type == resource_type
        ).all()

        for resource in resources:
            if all(
                resource.capacity[key] >= required_capacity[key]
                for key in required_capacity
            ):
                return True
        return False

    async def update_resource_availability(
        self,
        resource_id: int,
        new_availability: Dict[str, Any]
    ) -> ServiceResource:
        """Update resource availability status."""
        resource = self.db.query(ServiceResource).filter(
            ServiceResource.id == resource_id
        ).first()
        if not resource:
            raise ResourceNotFound(f"Resource with ID {resource_id} not found")

        resource.availability = new_availability
        self.db.commit()
        self.db.refresh(resource)
        return resource 