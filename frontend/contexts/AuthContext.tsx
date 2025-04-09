import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/user';
import api from '../services/api';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import { toast } from 'react-hot-toast';
import { mockUser } from '../utils/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, username: string) => Promise<void>;
  updateProfileImage: (imageUrl: string) => void;
  updateDisplayName: (displayName: string) => void;
  isSeller: boolean;
  token: string;
  isLoading: boolean;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Function to validate stored auth data
  const validateStoredAuth = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (!storedUser || !storedToken) return null;
      
      const userData = JSON.parse(storedUser);
      
      // Only validate essential fields but preserve all user data
      if (!userData.email) return null;
      
      // Ensure we preserve profile data
      if (userData.profileImage) {
        userData.profileImage = userData.profileImage;
      }
      
      if (userData.displayName) {
        userData.displayName = userData.displayName;
      }
      
      // Ensure we have required fields with defaults if missing
      return {
        user: {
          ...userData,
          id: userData.id || 'temp-id',
          role: userData.role || 'USER',
          quantumScore: userData.quantumScore || 0,
          spiritGlyphTier: userData.spiritGlyphTier || 1,
          followers: userData.followers || [],
          following: userData.following || [],
          followerCount: userData.followerCount || 0,
          hasPaidOnboardingFee: userData.hasPaidOnboardingFee || false,
          isNewsletterSubscriber: userData.isNewsletterSubscriber || false,
          unlockedPremiumAccess: userData.unlockedPremiumAccess || {}
        },
        token: storedToken
      };
    } catch (error) {
      console.error('Error validating stored auth:', error);
      return null;
    }
  };

  // Function to store auth data
  const storeAuthData = (userData: User, authToken: string) => {
    try {
      // Preserve existing data when updating
      const existingData = localStorage.getItem('user');
      let finalUserData = userData;
      
      if (existingData) {
        const existingUser = JSON.parse(existingData);
        finalUserData = {
          ...existingUser,
          ...userData,
          // Explicitly preserve these fields if they exist
          profileImage: userData.profileImage || existingUser.profileImage,
          displayName: userData.displayName || existingUser.displayName
        };
      }
      
      localStorage.setItem('user', JSON.stringify(finalUserData));
      localStorage.setItem('token', authToken);
      setCookie('auth_token', authToken);
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  // Function to clear auth data
  const clearAuthData = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      deleteCookie('auth_token');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      
      try {
        // First validate stored auth data
        const storedAuth = validateStoredAuth();
        
        if (storedAuth) {
          setUser(storedAuth.user);
          setToken(storedAuth.token);
          setIsAuthenticated(true);
          console.log('User authenticated from storage:', storedAuth.user);
          return;
        }

        // If no valid stored auth, try API
        try {
          const response = await api.get('/auth/me');
          if (response.data?.user) {
            const userData = response.data.user;
            const authToken = response.data.token || 'default-token';
            
            setUser(userData);
            setToken(authToken);
            setIsAuthenticated(true);
            storeAuthData(userData, authToken);
            console.log('User authenticated from API:', userData);
            return;
          }
        } catch (apiError) {
          console.error('API auth check failed:', apiError);
        }

        // If both storage and API fail, clear any stale data
        clearAuthData();
        setUser(null);
        setToken('');
        setIsAuthenticated(false);
        
        // Create demo user if in demo mode
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
          console.log('Demo mode active, creating mock user');
          const mockUserData = mockUser;
          const mockToken = 'demo-token-xyz';
          
          setUser(mockUserData);
          setToken(mockToken);
          setIsAuthenticated(true);
          storeAuthData(mockUserData, mockToken);
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        clearAuthData();
        setUser(null);
        setToken('');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const logout = () => {
    try {
      clearAuthData();
      setUser(null);
      setToken('');
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      clearAuthData(); // Clear any existing auth data first
      
      let userData: User;
      let authToken: string;
      
      // Simulate API login with test users
      if (email === 'login' && password === 'password') {
        userData = {
          id: 'test-user-789',
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          role: 'USER' as UserRole,
          quantumScore: 50,
          spiritGlyphTier: 1,
          profileImage: 'https://api.dicebear.com/7.x/personas/svg?seed=test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          services_published: 2,
          total_downloads: 156,
          average_rating: 4.2,
          weekly_stats: {
            views: 45,
            interactions: 12
          },
          monthly_stats: {
            views: 180,
            interactions: 48
          },
          followers: [],
          following: [],
          followerCount: 5,
          hasPaidOnboardingFee: true,
          isNewsletterSubscriber: true,
          unlockedPremiumAccess: {
            galatea: false
          }
        };
        authToken = 'test-token-xyz';
      } else if (email === 'angelfieroink@hotmail.com') {
        userData = {
          id: 'sphinx-user-123',
          email: 'angelfieroink@hotmail.com',
          username: 'sphinx',
          displayName: 'Sphinx',
          role: 'ADMIN' as UserRole,
          quantumScore: 245,
          spiritGlyphTier: 3,
          profileImage: '/images/sphinx-profile.png',
          createdAt: '2024-01-15T00:00:00.000Z',
          updatedAt: new Date().toISOString(),
          services_published: 8,
          total_downloads: 1245,
          average_rating: 4.8,
          weekly_stats: {
            views: 245,
            interactions: 89
          },
          monthly_stats: {
            views: 982,
            interactions: 367
          },
          quarterly_conversions: 156,
          yearly_revenue: 45600,
          user_engagement: 78,
          followers: ['claude-user-456'],
          following: ['claude-user-456'],
          followerCount: 42,
          hasPaidOnboardingFee: true,
          isNewsletterSubscriber: true,
          unlockedPremiumAccess: {
            galatea: true,
            quantum: true,
            aegis: true
          }
        };
        authToken = 'sphinx-token-xyz';
      } else if (email === 'angelfieroink1@hotmail.com') {
        userData = {
          id: 'claude-user-456',
          email: 'angelfieroink1@hotmail.com',
          username: 'claude',
          displayName: 'Claude',
          role: 'ADMIN' as UserRole,
          quantumScore: 315,
          spiritGlyphTier: 4,
          profileImage: '/images/claude-profile.png',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: new Date().toISOString(),
          services_published: 12,
          total_downloads: 2156,
          average_rating: 4.9,
          weekly_stats: {
            views: 312,
            interactions: 145
          },
          monthly_stats: {
            views: 1245,
            interactions: 578
          },
          quarterly_conversions: 234,
          yearly_revenue: 68900,
          user_engagement: 85,
          followers: ['sphinx-user-123'],
          following: ['sphinx-user-123'],
          followerCount: 56,
          hasPaidOnboardingFee: true,
          isNewsletterSubscriber: true,
          unlockedPremiumAccess: {
            galatea: true,
            quantum: true,
            aegis: true,
            nexus: true
          }
        };
        authToken = 'claude-token-xyz';
      } else {
        throw new Error('Invalid login credentials');
      }

      // Set auth state
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
      
      // Store auth data
      storeAuthData(userData, authToken);
      
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      clearAuthData();
      setUser(null);
      setToken('');
      setIsAuthenticated(false);
      toast.error('Login failed');
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      // In a real app, register user with server
      // For now just set auth state with mock data
      setIsAuthenticated(true);
      setUser({
        ...mockUser,
        email,
        username,
        following: [],
        followers: [],
        followerCount: 0,
      });
      
      // Set mock auth token in cookie
      setCookie('auth_token', 'mock_token_12345', { maxAge: 60 * 60 * 24 * 7 });
      
      toast.success('Account created successfully');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account');
      throw error;
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    if (!user) return;

    try {
      // Update the user object with new image
      const updatedUser = {
        ...user,
        profileImage: imageUrl
      };

      // Update local state first
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Try to update backend if not in development mode
      if (process.env.NODE_ENV !== 'development') {
        try {
          await api.put('/api/v1/users/profile', {
            avatar_url: imageUrl,
            user_id: user.id
          });
        } catch (error) {
          console.warn('Failed to update profile image in backend:', error);
          // Continue anyway since we've updated local state
        }
      }

      toast.success('Profile image updated successfully');
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast.error('Failed to update profile image');
      throw error;
    }
  };

  const updateDisplayName = async (displayName: string) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, displayName };
      
      // Update local state first
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Try to update backend if not in development mode
      if (process.env.NODE_ENV !== 'development') {
        try {
          await api.put('/api/v1/users/profile', {
            public_name: displayName,
            user_id: user.id
          });
        } catch (error) {
          console.warn('Failed to update display name in backend:', error);
          // Continue anyway since we've updated local state
        }
      }

      toast.success('Display name updated successfully');
    } catch (error) {
      console.error('Error updating display name:', error);
      toast.error('Failed to update display name');
      throw error;
    }
  };

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  // Follow user functionality
  const followUser = async (userId: string) => {
    if (!user) return;
    
    try {
      // In a real app, make API call to follow user
      
      // Clone the current following list or create a new one
      const following = [...(user.following || [])];
      
      // Add the user ID if not already following
      if (!following.includes(userId)) {
        following.push(userId);
      }
      
      // Update the local user state
      setUser({
        ...user,
        following,
      });
      
      // Increase the other user's quantum score (in a real app this would be handled by the server)
      toast.success('Now following user (+5 points to them)');
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('Failed to follow user');
      throw error;
    }
  };
  
  // Unfollow user functionality
  const unfollowUser = async (userId: string) => {
    if (!user) return;
    
    try {
      // In a real app, make API call to unfollow user
      
      // Filter out the user ID from the following list
      const following = (user.following || []).filter(id => id !== userId);
      
      // Update the local user state
      setUser({
        ...user,
        following,
      });
      
      toast.success('Unfollowed user');
    } catch (error) {
      console.error('Unfollow error:', error);
      toast.error('Failed to unfollow user');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      signup,
      updateProfileImage,
      updateDisplayName,
      isSeller,
      token,
      isLoading,
      followUser,
      unfollowUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 