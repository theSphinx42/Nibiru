import axios, { AxiosError } from 'axios';
import { mockServices, mockUser, mockMetrics } from '../utils/mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Default headers
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// API response validation
const isValidMarketplaceListing = (data: any): data is MarketplaceListing => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'number' &&
    typeof data.title === 'string' &&
    typeof data.description === 'string' &&
    (typeof data.price === 'number' || typeof data.price === 'string')
  );
};

// Enhanced error handling
const handleApiError = (error: unknown, fallbackData: any = null) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    console.error(
      'API Error:',
      axiosError.response?.status,
      axiosError.response?.data || axiosError.message
    );
  } else {
    console.error('Unexpected error:', error);
  }
  
  if (process.env.NODE_ENV === 'development' && fallbackData) {
    console.warn('Using fallback data in development mode');
    return fallbackData;
  }
  throw error;
};

// API instance with timeout and retry logic
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: defaultHeaders,
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for data validation
api.interceptors.response.use(
  (response) => {
    // Validate marketplace listings
    if (response.config.url?.includes('/marketplace')) {
      const listings = response.data;
      if (Array.isArray(listings) && listings.every(isValidMarketplaceListing)) {
        return response;
      }
      throw new Error('Invalid marketplace data format');
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface MarketplaceListing {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  downloads: number;
  category: string;
  tags: string[];
  image: string;
  logo?: string;
  quantumTier?: number;
}

export interface UserStats {
  id: string;
  username: string;
  email: string;
  quantumScore: number;
  bio: string;
  avatar: string;
  createdAt: string;
  stats: {
    servicesPublished: number;
    totalDownloads: number;
    averageRating: number;
    quantumResonance: number;
  };
}

export interface Metrics {
  weekly: {
    views: number;
    engagement: number;
    interactions: number;
  };
  monthly: {
    views: number;
    engagement: number;
    interactions: number;
  };
  quarterly: {
    views: number;
    engagement: number;
    conversions: number;
  };
  yearly: {
    revenue: number;
    growth: number;
  };
}

interface GlyphResponse {
  seed: string;
  timestamp: string;
  user_id?: string;
}

// Enhanced API Functions
export const getMarketplaceListings = async (): Promise<MarketplaceListing[]> => {
  try {
    // First try to get from API
    const response = await api.get('/marketplace');
    
    // If successful, return the data
    if (response.data && Array.isArray(response.data)) {
      console.log('Using real API data for marketplace listings');
      return response.data;
    }
    
    throw new Error('No marketplace data from API');
  } catch (error) {
    console.log('Using fallback mock data for marketplace listings');
    
    // Start with non-beer items from mockServices
    let allListings: MarketplaceListing[] = mockServices
      .filter(service => !service.title.toLowerCase().includes('beer'))
      .map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        rating: service.rating,
        downloads: service.downloads,
        category: service.category,
        tags: service.tags,
        image: service.thumbnailUrl, // Map thumbnailUrl to image
        // Add required fields to prevent TypeError in detail page
        tier: service.tier || 'premium',
        file_path: service.file_path || 'file.zip',
        creator_id: service.authorId || 'user-123',
        quantum_score: service.quantum_score || 85,
        s3_file_key: service.s3_file_key || 'mock-file-key'
      }));
    
    // Create a map to track unique beer listings by title
    const beerMap = new Map();
    
    try {
      // Try to get user listings from localStorage
      const userListingsStr = localStorage.getItem('user_listings');
      const currentUser = localStorage.getItem('user');
      
      if (userListingsStr && currentUser) {
        const userListings = JSON.parse(userListingsStr);
        const userData = JSON.parse(currentUser);
        const currentUserEmail = userData.email;
        
        // Filter out any items that might have leaked from other user accounts
        // Only include items without an owner email, or with matching email
        const filteredListings = Array.isArray(userListings) ? 
          userListings.filter(item => 
            !item.owner_email || item.owner_email === currentUserEmail
          ) : [];
        
        // Process user-created beers
        filteredListings.forEach((item, index) => {
          if (item.title && item.title.toLowerCase().includes('beer')) {
            // Use the same consistent glyph generation logic
            const titleHash = item.title.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const glyphIndex = titleHash % 12;
            const glyphName = ['quantum-seal', 'sigil-of-creation', 'sigil-of-continuance', 
                            'saphira-was-here', 'nibiru-symbol', 'aegis', 'lion', 
                            'sharkskin', 'seidr', 'sphinx', 'triune', 'wayfinder'][glyphIndex];
            const glyphPath = `/images/glyphs/${glyphName}.png`;
            
            // Add owner email to track item ownership
            const listing = {
              id: item.id || `user-${index + 100}`,
              title: item.title,
              description: item.description || 'User created item',
              price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
              rating: item.rating || 4.0,
              downloads: item.downloads || 0,
              category: item.category || 'Tools & Utilities',
              tags: item.tags || ['user-created'],
              image: glyphPath,
              quantumTier: item.quantumTier || 1,
              owner_email: currentUserEmail,
              // Add required fields
              tier: item.tier || 'premium',
              file_path: item.file_path || 'beer.zip',
              creator_id: item.creator_id || userData.id || 'user-123',
              quantum_score: item.quantum_score || userData.quantumScore || 85,
              s3_file_key: item.s3_file_key || 'mock-file-key'
            };
            
            // Add to the beer map
            beerMap.set(item.title.toLowerCase(), listing);
          }
        });
      }
    } catch (err) {
      console.error('Error parsing user listings from localStorage', err);
    }
    
    // Add a few mock beers only if the user doesn't have any beers yet
    if (beerMap.size === 0) {
      // Only add 2 generic beers for new users
      const genericBeers = [
        {
          id: 'beer1',
          title: 'Premium Beer',
          description: 'A refreshing generic beer',
          price: 1.00,
          rating: 4.2,
          downloads: 0,
          category: 'Tools & Utilities',
          tags: ['beer', 'beverage'],
          image: '/images/glyphs/quantum-seal.png',
          tier: 'premium',
          file_path: 'beer.zip',
          creator_id: 'system',
          quantum_score: 42,
          s3_file_key: 'mock-file-key'
        },
        {
          id: 'beer2',
          title: 'Free Beer Sample',
          description: 'Try our free beer sample',
          price: 0.00,
          rating: 3.8,
          downloads: 0,
          category: 'Tools & Utilities',
          tags: ['beer', 'free', 'sample'],
          image: '/images/glyphs/sigil-of-creation.png',
          tier: 'basic',
          file_path: 'beer.zip',
          creator_id: 'system',
          quantum_score: 42,
          s3_file_key: 'mock-file-key'
        }
      ];
      
      // Add the generic beers to the beer map
      genericBeers.forEach(beer => {
        beerMap.set(beer.title.toLowerCase(), beer);
      });
    }
    
    // Add all unique beers from the map to the listings
    const uniqueBeers = Array.from(beerMap.values());
    allListings = [...allListings, ...uniqueBeers];
    
    // Log count for debugging
    console.log(`Total listings: ${allListings.length}, Beer listings: ${uniqueBeers.length}`);
    
    return allListings;
  }
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const response = await api.get(`/dashboard/user/${userId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, mockUser);
  }
};

export const getMetrics = async (userId: string): Promise<Metrics> => {
  try {
    const response = await api.get(`/dashboard/metrics/${userId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, mockMetrics);
  }
};

// Enhanced glyph service
export const apiService = {
  generateGlyphSeed: async (): Promise<GlyphResponse> => {
    try {
      const response = await api.post<GlyphResponse>('/glyph/generate');
      return response.data;
    } catch (error) {
      return handleApiError(error, {
        seed: `fallback-${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    }
  },

  getUserGlyph: async (userId: string): Promise<GlyphResponse> => {
    try {
      const response = await api.get<GlyphResponse>(`/glyph/user/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, {
        seed: `fallback-${userId}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user_id: userId,
      });
    }
  },
};

export default api; 