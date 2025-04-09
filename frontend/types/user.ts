export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  role: UserRole;
  quantumScore: number;
  spiritGlyphTier: number;
  profileImage?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  github?: string;
  createdAt: string;
  updatedAt: string;
  
  // Stats
  services_published?: number;
  total_downloads?: number;
  average_rating?: number;
  weekly_stats?: {
    views: number;
    interactions: number;
  };
  monthly_stats?: {
    views: number;
    interactions: number;
  };
  quarterly_conversions?: number;
  yearly_revenue?: number;
  user_engagement?: number;
  
  // Social fields
  followers?: string[]; // Array of user IDs who follow this user
  following?: string[]; // Array of user IDs this user follows
  followerCount?: number; // Number of followers
  
  // Monetization fields
  stripeCustomerId?: string;
  hasPaidOnboardingFee: boolean;
  isNewsletterSubscriber: boolean;
  unlockedPremiumAccess: {
    [key: string]: boolean;
  };
  
  // Seller fields (if role is SELLER)
  sellerProfile?: {
    bio?: string;
    website?: string;
    stripeConnectId?: string;
    totalSales: number;
    salesCount: number;
    averageRating: number;
  };
}

export interface UserSession {
  isAuthenticated: boolean;
  user: User | null;
}

export interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  amount: number;
  platformFee: number;
  sellerPayout: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
} 