import { GalateaAccessTier, GalateaPrice, GalateaAccess, GalateaListing, GalateaUpdate } from '../types/galatea';
import { api } from './api';

class GalateaService {
  // Check if a user has Galatea access
  async checkAccess(userId: string): Promise<GalateaAccess | null> {
    try {
      const response = await api.get(`/api/galatea/access/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to check Galatea access:', error);
      return null;
    }
  }

  // Purchase Galatea access
  async purchaseAccess(userId: string, tier: GalateaAccessTier): Promise<{
    success: boolean;
    checkoutUrl?: string;
    error?: string;
  }> {
    try {
      const price = this.getPriceForTier(tier);
      const response = await api.post('/api/galatea/purchase', {
        userId,
        tier,
        price
      });

      return {
        success: true,
        checkoutUrl: response.data.checkoutUrl
      };
    } catch (error) {
      console.error('Failed to purchase Galatea access:', error);
      return {
        success: false,
        error: 'Failed to initiate purchase'
      };
    }
  }

  // Get price for a specific tier
  private getPriceForTier(tier: GalateaAccessTier): number {
    switch (tier) {
      case GalateaAccessTier.TRIAL:
        return GalateaPrice.TRIAL_VISION;
      case GalateaAccessTier.FORGE:
        return GalateaPrice.FORGE_UNLOCK;
      case GalateaAccessTier.CREATOR_PASS:
        return GalateaPrice.CREATOR_PASS_MONTHLY;
      default:
        throw new Error('Invalid Galatea tier');
    }
  }

  // Create a new Galatea listing
  async createListing(listing: Partial<GalateaListing>): Promise<{
    success: boolean;
    listing?: GalateaListing;
    error?: string;
  }> {
    try {
      // First check if user has appropriate access
      const access = await this.checkAccess(listing.sellerId!);
      if (!access || !access.enabled) {
        return {
          success: false,
          error: 'No Galatea access. Please purchase access first.'
        };
      }

      // If using trial access, check if already used
      if (access.tier === GalateaAccessTier.TRIAL && access.trialItemId) {
        return {
          success: false,
          error: 'Trial access already used. Please upgrade to create more listings.'
        };
      }

      const response = await api.post('/api/galatea/listings', {
        ...listing,
        isGalatea: true,
        hasSigil: true,
        activationDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        subscriberCount: 0,
        quantumScore: 0,
        devUpdates: []
      });

      // If this is a trial listing, update the access record
      if (access.tier === GalateaAccessTier.TRIAL) {
        await api.patch(`/api/galatea/access/${listing.sellerId}`, {
          trialItemId: response.data.id
        });
      }

      return {
        success: true,
        listing: response.data
      };
    } catch (error) {
      console.error('Failed to create Galatea listing:', error);
      return {
        success: false,
        error: 'Failed to create listing'
      };
    }
  }

  // Add a dev update to a listing
  async addDevUpdate(listingId: string, update: Partial<GalateaUpdate>): Promise<{
    success: boolean;
    update?: GalateaUpdate;
    error?: string;
  }> {
    try {
      const response = await api.post(`/api/galatea/listings/${listingId}/updates`, {
        ...update,
        published: new Date().toISOString()
      });

      // Notify subscribers if update is not public
      if (!update.isPublic) {
        await this.notifySubscribers(listingId, response.data.id);
      }

      return {
        success: true,
        update: response.data
      };
    } catch (error) {
      console.error('Failed to add dev update:', error);
      return {
        success: false,
        error: 'Failed to add update'
      };
    }
  }

  // Notify subscribers of new content
  private async notifySubscribers(listingId: string, updateId: string): Promise<void> {
    try {
      await api.post(`/api/galatea/listings/${listingId}/notify`, {
        updateId
      });
    } catch (error) {
      console.error('Failed to notify subscribers:', error);
    }
  }

  // Check subscription status
  async checkSubscription(userId: string, listingId: string): Promise<boolean> {
    try {
      const response = await api.get(`/api/galatea/subscriptions/${userId}/${listingId}`);
      return response.data.active;
    } catch (error) {
      console.error('Failed to check subscription:', error);
      return false;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(
    userId: string,
    listingId: string,
    receiveNotifications: boolean
  ): Promise<boolean> {
    try {
      await api.patch(`/api/galatea/subscriptions/${userId}/${listingId}`, {
        receiveNotifications
      });
      return true;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }

  // Get creator stats
  async getCreatorStats(userId: string): Promise<{
    totalListings: number;
    activeSubscribers: number;
    totalRevenue: number;
    averageRating: number;
  } | null> {
    try {
      const response = await api.get(`/api/galatea/creators/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to get creator stats:', error);
      return null;
    }
  }
}

export const galateaService = new GalateaService(); 