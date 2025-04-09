import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface GlyphData {
  seed: string;
  timestamp: string;
  power?: number;
  resonance?: number;
}

interface CachedGlyph extends GlyphData {
  userId: string;
  lastFetched: string;
}

interface GlyphContextType {
  cachedGlyph: CachedGlyph | null;
  setCachedGlyph: (glyph: CachedGlyph) => void;
  clearCache: () => void;
}

const CACHE_KEY = 'nibiru_glyph_cache';

const GlyphContext = createContext<GlyphContextType | undefined>(undefined);

export function GlyphProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cachedGlyph, setCachedGlyph] = useState<CachedGlyph | null>(null);

  // Load cache from localStorage on mount
  useEffect(() => {
    const loadCache = () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as CachedGlyph;
        // Only load cache if it belongs to current user
        if (parsed.userId === user?.id) {
          setCachedGlyph(parsed);
        }
      }
    };

    if (user?.id) {
      loadCache();
    }
  }, [user?.id]);

  // Update localStorage when cache changes
  const updateCache = (glyph: CachedGlyph) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(glyph));
    setCachedGlyph(glyph);
  };

  // Clear cache
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setCachedGlyph(null);
  };

  return (
    <GlyphContext.Provider
      value={{
        cachedGlyph,
        setCachedGlyph: updateCache,
        clearCache,
      }}
    >
      {children}
    </GlyphContext.Provider>
  );
}

export const useGlyph = () => {
  const context = useContext(GlyphContext);
  if (context === undefined) {
    throw new Error('useGlyph must be used within a GlyphProvider');
  }
  return context;
}; 