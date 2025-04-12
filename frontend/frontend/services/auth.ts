import axios from 'axios';
import { LoginCredentials, AuthResponse } from '../types/auth';

const API_URL = 'http://localhost:8000';
const TOKEN_KEY = 'nibiru_token';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.access_token) {
        localStorage.setItem(TOKEN_KEY, response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      throw new Error('Login failed');
    }
  },
  
  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  },
  
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
  }
}; 