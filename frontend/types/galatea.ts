import { User } from './user';

export enum GalateaAccessTier {
  TRIAL = 'TRIAL',
  FORGE = 'FORGE',
  CREATOR_PASS = 'CREATOR_PASS'
}

export enum GalateaPrice {
  TRIAL_VISION = 20,
  FORGE_UNLOCK = 50,
  CREATOR_PASS_MONTHLY = 42
}

export interface GalateaAccess {
  userId: string;
  tier: GalateaAccessTier;
  enabled: boolean;
  trialItemId?: string;          // ID of the trial listing if using Trial Vision
  forgeUnlocked?: boolean;       // True if $50 one-time fee paid
  creatorPassExpires?: string;   // ISO timestamp for subscription expiry
  createdAt: string;
  updatedAt: string;
}

export interface GalateaListing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: 'draft' | 'published' | 'archived';
  isGalatea: true;              // Always true for Galatea listings
  galateaTier: number;          // For future tier expansions
  hasSigil: boolean;            // Custom sigil/glyph
  linkedDiscountEligible?: boolean;
  activationDate: string;       // When listing was activated
  lastUpdated: string;         // Last content update
  subscriberCount: number;     // Number of buyers
  quantumScore: number;       // Marketplace ranking score
  devUpdates: GalateaUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface GalateaUpdate {
  id: string;
  listingId: string;
  title: string;
  content: string;
  mediaUrls?: string[];
  isPublic: boolean;        // Some updates can be public teasers
  published: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalateaSubscription {
  userId: string;
  listingId: string;
  receiveNotifications: boolean;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
}

// Extended user profile for Galatea
export interface GalateaCreatorProfile extends User {
  isGalateaCreator: boolean;
  galateaAccess?: GalateaAccess;
  galateaStats?: {
    totalListings: number;
    activeSubscribers: number;
    totalRevenue: number;
    averageRating: number;
  };
} 