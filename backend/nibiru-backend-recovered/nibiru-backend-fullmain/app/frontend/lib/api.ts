import axios from 'axios';
import { Service, ServiceListing, ServiceTransaction, ServiceUsageLog, ServiceStatistics } from '../types/remote_services';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Service endpoints
export const servicesApi = {
  list: async (params?: {
    service_type?: string;
    status?: string;
    search?: string;
    sort_by?: string;
  }) => {
    const response = await api.get<Service[]>('/services', { params });
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  create: async (data: Partial<Service>) => {
    const response = await api.post<Service>('/services', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Service>) => {
    const response = await api.put<Service>(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/services/${id}`);
  }
};

// Listing endpoints
export const listingsApi = {
  list: async (params?: {
    service_id?: number;
    creator_id?: number;
    status?: string;
  }) => {
    const response = await api.get<ServiceListing[]>('/listings', { params });
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<ServiceListing>(`/listings/${id}`);
    return response.data;
  },

  create: async (data: Partial<ServiceListing>) => {
    const response = await api.post<ServiceListing>('/listings', data);
    return response.data;
  },

  update: async (id: number, data: Partial<ServiceListing>) => {
    const response = await api.put<ServiceListing>(`/listings/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/listings/${id}`);
  }
};

// Transaction endpoints
export const transactionsApi = {
  create: async (data: Partial<ServiceTransaction>) => {
    const response = await api.post<ServiceTransaction>('/transactions', data);
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<ServiceTransaction>(`/transactions/${id}`);
    return response.data;
  },

  list: async (params?: {
    listing_id?: number;
    buyer_id?: number;
    status?: string;
  }) => {
    const response = await api.get<ServiceTransaction[]>('/transactions', { params });
    return response.data;
  }
};

// Usage endpoints
export const usageApi = {
  start: async (data: Partial<ServiceUsageLog>) => {
    const response = await api.post<ServiceUsageLog>('/usage/start', data);
    return response.data;
  },

  end: async (id: number, metrics: Record<string, any>) => {
    const response = await api.post<ServiceUsageLog>(`/usage/${id}/end`, { metrics });
    return response.data;
  },

  getStatistics: async (params?: {
    service_id?: number;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get<ServiceStatistics>('/usage/statistics', { params });
    return response.data;
  }
};

// Resource endpoints
export const resourcesApi = {
  checkAvailability: async (params: {
    service_id: number;
    resource_type: string;
    required_capacity: Record<string, number>;
  }) => {
    const response = await api.get('/resources/availability', { params });
    return response.data;
  },

  updateAvailability: async (id: number, data: Record<string, any>) => {
    const response = await api.patch(`/resources/${id}/availability`, data);
    return response.data;
  }
};

export { api }; 