export enum KeyStatus {
  PENDING = "pending",
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
  SUSPENDED = "suspended"
}

export interface InvocationKey {
  id: number;
  key_hash: string;
  glyph_hash: string;
  code_listing_id: number;
  issued_to_user_id: number;
  status: KeyStatus;
  expiration: string | null;
  uses_remaining: number | null;
  last_used: string | null;
  activation_date: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any> | null;
  code_listing: {
    id: number;
    title: string;
    description: string;
    category: string;
    version: string;
  };
}

export interface KeyUsageLog {
  id: number;
  key_id: number;
  usage_type: string;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
  device_fingerprint: string | null;
  success: boolean;
  error_message: string | null;
  aphira_validation_result: Record<string, any> | null;
  aphira_glyph_hash: string | null;
  aphira_compilation_metrics: Record<string, any> | null;
}

export interface KeyMetrics {
  total_keys: number;
  active_keys: number;
  expired_keys: number;
  revoked_keys: number;
  total_redemptions: number;
  glyph_match_failures: number;
  average_uses_per_key: number;
}

export interface InvocationKeyCreateRequest {
  code_listing_id: number;
  usage_limit?: number;
  expiration_days?: number;
  metadata?: Record<string, any>;
}

export interface InvocationKeyRedeemRequest {
  key_hash: string;
  glyph_hash?: string;
}

export interface InvocationKeyActivateRequest {
  key_hash: string;
} 