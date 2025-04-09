from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.remote_services import ServiceType, ResourceType, ServiceStatus

class ServiceResourceBase(BaseModel):
    name: str
    resource_type: ResourceType
    capacity: Dict[str, Any]
    availability: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class ServiceResourceCreate(ServiceResourceBase):
    service_id: int

class ServiceResource(ServiceResourceBase):
    id: int
    service_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class RemoteServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    service_type: ServiceType
    status: ServiceStatus = ServiceStatus.ACTIVE
    pricing_model: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class RemoteServiceCreate(RemoteServiceBase):
    pass

class RemoteService(RemoteServiceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    resources: List[ServiceResource] = []

    class Config:
        orm_mode = True

class ServiceListingBase(BaseModel):
    service_id: int
    title: str
    description: Optional[str] = None
    price: float
    status: ServiceStatus = ServiceStatus.ACTIVE
    metadata: Optional[Dict[str, Any]] = None

class ServiceListingCreate(ServiceListingBase):
    creator_id: int

class ServiceListing(ServiceListingBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime
    service: RemoteService

    class Config:
        orm_mode = True

class ServiceTransactionBase(BaseModel):
    listing_id: int
    amount: float
    status: str
    stripe_payment_intent_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ServiceTransactionCreate(ServiceTransactionBase):
    buyer_id: int

class ServiceTransaction(ServiceTransactionBase):
    id: int
    buyer_id: int
    created_at: datetime
    updated_at: datetime
    listing: ServiceListing

    class Config:
        orm_mode = True

class ServiceUsageLogBase(BaseModel):
    service_id: int
    resource_id: int
    transaction_id: int
    usage_start: datetime
    usage_end: Optional[datetime] = None
    usage_metrics: Dict[str, Any]
    status: str
    metadata: Optional[Dict[str, Any]] = None

class ServiceUsageLogCreate(ServiceUsageLogBase):
    user_id: int

class ServiceUsageLog(ServiceUsageLogBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    service: RemoteService
    resource: ServiceResource
    transaction: ServiceTransaction

    class Config:
        orm_mode = True

# Pricing models for different service types
class AITrainingPricing(BaseModel):
    gpu_type: str
    price_per_hour: float
    minimum_hours: int = 1
    maximum_hours: Optional[int] = None
    storage_included: bool = True
    storage_limit_gb: Optional[int] = None

class ThreeDPrintingPricing(BaseModel):
    material_type: str
    price_per_gram: float
    minimum_quantity: float
    maximum_quantity: Optional[float] = None
    setup_fee: float = 0.0
    post_processing_options: Optional[List[str]] = None

class DevelopmentToolPricing(BaseModel):
    tool_name: str
    price_per_hour: float
    minimum_hours: int = 1
    maximum_hours: Optional[int] = None
    included_features: List[str]
    additional_features: Optional[Dict[str, float]] = None

# Service-specific metadata models
class AITrainingMetadata(BaseModel):
    gpu_specs: Dict[str, Any]
    available_frameworks: List[str]
    pre_installed_tools: List[str]
    storage_options: List[Dict[str, Any]]

class ThreeDPrintingMetadata(BaseModel):
    printer_specs: Dict[str, Any]
    available_materials: List[Dict[str, Any]]
    print_volume: Dict[str, float]
    resolution_options: List[Dict[str, Any]]

class DevelopmentToolMetadata(BaseModel):
    tool_version: str
    available_templates: List[str]
    resource_requirements: Dict[str, Any]
    collaboration_features: List[str] 