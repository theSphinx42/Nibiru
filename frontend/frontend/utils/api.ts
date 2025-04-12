import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { ApiError, ApiResponse } from '../types';
import { ApiErrorHandler } from './errorHandling';
import auth from '../lib/auth';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  quantumScore: number;
  reputation: number;
  createdAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  author: User;
  tags: string[];
  glyphScore: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  thumbnailUrl?: string;
  downloads: number;
  rating: number;
  reviewCount: number;
}

export interface SpiritGlyph {
  id: string;
  pattern: number[][];
  resonance: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Client
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = auth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(ApiErrorHandler.handle(error));
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      auth.logout();
      return Promise.reject(ApiErrorHandler.handle(error, 'Session expired. Please login again.'));
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      return Promise.reject(ApiErrorHandler.handle(error, 'You do not have permission to perform this action.'));
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      return Promise.reject(ApiErrorHandler.handle(error, 'The requested resource was not found.'));
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      return Promise.reject(ApiErrorHandler.handle(error, 'Invalid data provided.'));
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      return Promise.reject(ApiErrorHandler.handle(error, 'Too many requests. Please try again later.'));
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(ApiErrorHandler.handle(error, 'Network error. Please check your connection.'));
    }

    return Promise.reject(ApiErrorHandler.handle(error));
  }
);

// API Service
export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  },

  register: async (email: string, password: string, username: string) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        username,
      });
      return response.data;
    } catch (error) {
      throw new Error('Registration failed');
    }
  },

  logout: async () => {
    try {
      auth.logout();
      return { success: true };
    } catch (error) {
      throw new Error('Logout failed');
    }
  },

  // User
  getCurrentUser: async () => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.patch<User>('/users/me', data);
    return response.data;
  },

  // Services
  getServices: async (page = 1, limit = 10, filters?: Record<string, any>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    const response = await api.get<Service[]>(`/services?${params}`);
    return response.data;
  },

  getService: async (id: string) => {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  createService: async (data: Partial<Service>) => {
    const response = await api.post<Service>('/services', data);
    return response.data;
  },

  // Spirit Glyphs
  getGlyphs: async (userId: string) => {
    const response = await api.get<SpiritGlyph[]>(`/glyphs/${userId}`);
    return response.data;
  },

  analyzeGlyph: async (pattern: number[][]) => {
    const response = await api.post<SpiritGlyph>('/glyphs/analyze', { pattern });
    return response.data;
  },

  // Quantum Score
  getQuantumScore: async (userId: string) => {
    const response = await api.get<number>(`/quantum-score/${userId}`);
    return response.data;
  },

  // Wrap all API calls with error handling
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await api.get<ApiResponse<T>>(url);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await api.post<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await api.put<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await api.delete<ApiResponse<T>>(url);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};

export default api; 