import { useState, useCallback } from 'react';

interface TierCheckResponse {
  access_granted: boolean;
  tier: number;
  required_tier: number;
  message: string;
  upgrade_options?: string[];
  quantum_score?: number;
  required_score?: number;
}

interface UseTierAccessOptions {
  onUpgrade?: () => void;
  onUseKey?: () => void;
  onWatchAd?: () => void;
}

export const useTierAccess = (options: UseTierAccessOptions = {}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [tierInfo, setTierInfo] = useState<TierCheckResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkAccess = useCallback(async (listingId: string) => {
    try {
      setIsChecking(true);
      const response = await fetch(`/api/listings/${listingId}/check-access`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: TierCheckResponse = await response.json();

      setTierInfo(data);
      
      if (!data.access_granted) {
        setShowPrompt(true);
      }

      return data.access_granted;
    } catch (error) {
      console.error('Error checking tier access:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleUpgrade = useCallback(async () => {
    setShowPrompt(false);
    options.onUpgrade?.();
  }, [options.onUpgrade]);

  const handleUseKey = useCallback(async () => {
    try {
      if (!tierInfo) return;

      const response = await fetch(`/api/listings/${tierInfo.tier}/use-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setShowPrompt(false);
        options.onUseKey?.();
      }
    } catch (error) {
      console.error('Error using invocation key:', error);
    }
  }, [tierInfo, options.onUseKey]);

  const handleWatchAd = useCallback(async () => {
    try {
      if (!tierInfo) return;

      const response = await fetch(`/api/listings/${tierInfo.tier}/watch-ad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setShowPrompt(false);
        options.onWatchAd?.();
      }
    } catch (error) {
      console.error('Error processing ad watch:', error);
    }
  }, [tierInfo, options.onWatchAd]);

  const closePrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  return {
    checkAccess,
    showPrompt,
    tierInfo,
    isChecking,
    handleUpgrade,
    handleUseKey,
    handleWatchAd,
    closePrompt,
  };
};

export type { TierCheckResponse }; 