import { useState, useEffect } from 'react';

export interface GlyphEffects {
  score: number;
  effects: {
    glow?: {
      enabled: boolean;
      strength: number;
    };
    sparkle?: {
      enabled: boolean;
      strength: number;
    };
    aura?: {
      enabled: boolean;
      strength: number;
    };
    mythic?: {
      enabled: boolean;
      level: number;
    };
  };
}

export const useGlyphEffects = (listingId: string) => {
  const [effects, setEffects] = useState<GlyphEffects | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEffects = async () => {
      if (!listingId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/listings/${listingId}/effects`);
        if (!response.ok) {
          throw new Error('Failed to fetch effects');
        }

        const data = await response.json();
        setEffects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching glyph effects:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEffects();

    // Set up polling for effect updates (every 30 seconds)
    const pollInterval = setInterval(fetchEffects, 30000);

    return () => clearInterval(pollInterval);
  }, [listingId]);

  const recordInteraction = async (eventType: string) => {
    try {
      await fetch('/api/listings/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listingId,
          event_type: eventType,
        }),
      });
    } catch (err) {
      console.error('Error recording interaction:', err);
    }
  };

  return {
    effects,
    isLoading,
    error,
    recordInteraction,
  };
}; 