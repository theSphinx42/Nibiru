import axios from 'axios';
import { UserStats, Badge, Activity } from '../types/reputation';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
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
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const reputationApi = {
  // Get user stats
  getUserStats: async (userId: number): Promise<UserStats> => {
    const response = await api.get(`/api/v1/reputation/stats?user_id=${userId}`);
    return response.data;
  },

  // Get user badges
  getUserBadges: async (userId: number): Promise<Badge[]> => {
    const response = await api.get(`/api/v1/reputation/users/${userId}/badges`);
    return response.data;
  },

  // Get recent activity
  getRecentActivity: async (userId: number): Promise<Activity[]> => {
    const response = await api.get(`/api/v1/reputation/users/${userId}/activity`);
    return response.data;
  },

  // Record marketplace transaction
  recordTransaction: async (userId: number, transaction: {
    contribution_id: number;
    amount: number;
    currency: string;
  }): Promise<void> => {
    await api.post(`/api/v1/reputation/marketplace/transactions`, {
      user_id: userId,
      ...transaction,
    });
  },

  // Record contribution impact
  recordImpact: async (userId: number, impact: {
    contribution_id: number;
    views: number;
    downloads: number;
    interactions: number;
    unique_users: number;
  }): Promise<void> => {
    await api.post(`/api/v1/reputation/impact`, {
      user_id: userId,
      ...impact,
    });
  },

  // Update contribution
  updateContribution: async (
    contributionId: number,
    metadata: Record<string, any>
  ): Promise<void> => {
    await api.put(`/api/v1/reputation/contributions/${contributionId}`, {
      metadata,
    });
  },

  // Add community engagement
  addEngagement: async (userId: number, engagement: {
    type: string;
    points: number;
    metadata?: Record<string, any>;
  }): Promise<void> => {
    await api.post(`/api/v1/reputation/engagement`, {
      user_id: userId,
      ...engagement,
    });
  },
};

export { api }; 