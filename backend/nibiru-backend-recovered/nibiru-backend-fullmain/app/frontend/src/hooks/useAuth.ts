import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'creator';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/v1/auth/me');
        setState({
          user: response.data,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          error: 'Authentication failed',
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/v1/auth/login', { email, password });
      setState({
        user: response.data,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        error: 'Login failed',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
      setState({
        user: null,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        error: 'Logout failed',
      });
      return false;
    }
  };

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
  };
}; 