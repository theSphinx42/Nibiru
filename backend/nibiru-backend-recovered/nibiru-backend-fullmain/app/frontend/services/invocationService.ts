import { apiClient } from './apiClient';
import type {
  InvocationKey,
  KeyUsageLog,
  KeyMetrics,
  InvocationKeyCreateRequest,
  InvocationKeyRedeemRequest,
  InvocationKeyActivateRequest
} from '../types/invocation';

export class InvocationService {
  private static instance: InvocationService;
  private readonly baseUrl = '/api/v1/invocation-keys';

  private constructor() {}

  static getInstance(): InvocationService {
    if (!InvocationService.instance) {
      InvocationService.instance = new InvocationService();
    }
    return InvocationService.instance;
  }

  async getUserKeys(): Promise<InvocationKey[]> {
    const response = await apiClient.get<InvocationKey[]>(`${this.baseUrl}/my-keys`);
    return response.data;
  }

  async getListingKeys(listingId: number): Promise<InvocationKey[]> {
    const response = await apiClient.get<InvocationKey[]>(`${this.baseUrl}/listing/${listingId}`);
    return response.data;
  }

  async createKey(data: InvocationKeyCreateRequest): Promise<InvocationKey> {
    const response = await apiClient.post<InvocationKey>(this.baseUrl, data);
    return response.data;
  }

  async redeemKey(data: InvocationKeyRedeemRequest): Promise<InvocationKey> {
    const response = await apiClient.post<InvocationKey>(`${this.baseUrl}/redeem`, data);
    return response.data;
  }

  async activateKey(data: InvocationKeyActivateRequest): Promise<InvocationKey> {
    const response = await apiClient.post<InvocationKey>(`${this.baseUrl}/activate`, data);
    return response.data;
  }

  async revokeKey(keyHash: string): Promise<InvocationKey> {
    const response = await apiClient.post<InvocationKey>(`${this.baseUrl}/revoke`, { key_hash: keyHash });
    return response.data;
  }

  async getKeyUsageLogs(keyId: number): Promise<KeyUsageLog[]> {
    const response = await apiClient.get<KeyUsageLog[]>(`${this.baseUrl}/${keyId}/usage-logs`);
    return response.data;
  }

  async getListingMetrics(listingId: number): Promise<KeyMetrics> {
    const response = await apiClient.get<KeyMetrics>(`${this.baseUrl}/listing/${listingId}/metrics`);
    return response.data;
  }
} 