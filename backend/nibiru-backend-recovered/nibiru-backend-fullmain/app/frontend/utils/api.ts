import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface UserProfile {
  publicName: string;
  avatarUrl: string;
  quantumScore: number;
  sigilUrl: string;
  bio?: string;
  isPublic: boolean;
  showQuantumScore: boolean;
  showAffinity: boolean;
  showNetwork: boolean;
  customTheme?: any;
}

export interface VerificationResponse {
  status: 'success' | 'failed' | 'expired';
  message: string;
  userData?: {
    userId: string;
    internalName: string;
    publicName: string;
    avatarUrl: string;
    verificationExpiresAt: string;
  };
}

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await api.get(`/profile`);
  return response.data;
};

export const generateQRCode = async (): Promise<{ qrCodeUrl: string }> => {
  const response = await api.post('/profile/qr-code');
  return {
    qrCodeUrl: response.data.qr_code_url
  };
};

export const initiateVerification = async (userId: string): Promise<{ qrCodeUrl: string }> => {
  const response = await api.post('/profile/qr-codes/initiate-verification', {
    internal_id: userId,
    public_name: localStorage.getItem('public_name')
  });
  return {
    qrCodeUrl: response.data.qr_code_url
  };
};

export const verifyQRCode = async (
  internalId: string,
  publicName: string,
  verificationToken: string
): Promise<VerificationResponse> => {
  try {
    const response = await api.post('/profile/qr-codes/verify', {
      internal_id: internalId,
      public_name: publicName,
      verification_token: verificationToken
    });

    return {
      status: 'success',
      message: 'Verification successful',
      userData: response.data
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return {
          status: 'expired',
          message: 'QR code has expired or is invalid'
        };
      }
      return {
        status: 'failed',
        message: error.response?.data?.detail || 'Verification failed'
      };
    }
    return {
      status: 'failed',
      message: 'An unexpected error occurred'
    };
  }
};

export const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

export const uploadAvatar = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}; 