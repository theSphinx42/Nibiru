export enum ServiceType {
  AI_TRAINING = 'ai_training',
  THREE_D_PRINTING = 'three_d_printing',
  DEVELOPMENT_TOOLS = 'development_tools'
}

export enum ServiceStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DELETED = 'deleted'
}

export interface ServicePricing {
  hourly_rate: number;
  minimum_hours: number;
  maximum_hours: number;
  currency?: string;
}

export interface ServiceMetadata {
  capabilities: string[];
  requirements: string[];
  supported_formats: string[];
  [key: string]: any;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  service_type: ServiceType;
  status: ServiceStatus;
  pricing: ServicePricing;
  metadata: ServiceMetadata;
  created_at: string;
  updated_at: string;
}

export interface ServiceListing {
  id: number;
  service_id: number;
  creator_id: number;
  title: string;
  description: string;
  status: ServiceStatus;
  pricing: ServicePricing;
  metadata: ServiceMetadata;
  created_at: string;
  updated_at: string;
}

export interface ServiceTransaction {
  id: number;
  listing_id: number;
  buyer_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceUsageLog {
  id: number;
  service_id: number;
  user_id: number;
  transaction_id: number;
  usage_start: string;
  usage_end?: string;
  status: 'active' | 'completed' | 'cancelled';
  usage_metrics: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ServiceStatistics {
  total_usage_hours: number;
  total_cost: number;
  usage_count: number;
  services_used: number;
}

export interface ServiceResource {
  id: number;
  service_id: number;
  resource_type: string;
  capacity: Record<string, number>;
  availability: Record<string, any>;
  created_at: string;
  updated_at: string;
} 