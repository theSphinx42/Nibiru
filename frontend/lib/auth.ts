import { apiService } from '../utils/api';
import { User } from '../types';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_TOKEN_KEY = 'nibiru_token';

export const auth = {
  async login(email: string, password: string) {
    try {
      const response = await apiService.login(email, password);
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      throw new AuthError('Invalid credentials');
    }
  },

  async logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.href = '/login';
  },

  async getUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;
      
      const user = await apiService.getCurrentUser();
      return user;
    } catch (error) {
      this.logout();
      return null;
    }
  },

  setToken(token: string) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export default auth; 