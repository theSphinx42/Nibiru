import starfieldMap from './starfield-map.json';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Define types for our starfield configuration
export type StarfieldVariant = 'main' | 'login' | 'experimental';

interface StarfieldVariantDetails {
  component: string;
  features: string[];
  recommended: string;
  status?: string;
}

interface RouteMapping {
  pattern: string;
  variant: StarfieldVariant;
  description: string;
  glyphOverlay?: GlyphOverlayConfig;
}

export interface GlyphOverlayConfig {
  enabled: boolean;
  glyph?: string;
  size?: number;
  opacity?: number;
  effect?: 'glow' | 'orbit' | 'pulse' | 'fade';
  minUserRank?: number;
  syncWithMusic?: boolean;
  colorTheme?: 'default' | 'cosmic' | 'quantum' | 'nebula';
}

interface StarfieldConfig {
  activeVariant: StarfieldVariant;
  details: StarfieldVariantDetails;
  glyphOverlay?: GlyphOverlayConfig;
  isLoading: boolean;
}

interface StarfieldMapType {
  defaultVariant: string;
  routeMappings: RouteMapping[];
  variantDetails: {
    [key in StarfieldVariant]: StarfieldVariantDetails;
  };
  glyphOverlayDefaults: GlyphOverlayConfig;
}

// Cast the imported JSON to our defined type
const typedStarfieldMap = starfieldMap as unknown as StarfieldMapType;

// Function to determine if a route matches a pattern
const routeMatches = (route: string, pattern: string): boolean => {
  if (pattern === route) return true;
  
  // Handle patterns with wildcards (future expansion)
  if (pattern.endsWith('*')) {
    const basePattern = pattern.slice(0, -1);
    return route.startsWith(basePattern);
  }
  
  return false;
};

// Hook to get the starfield configuration based on the current route
export const useStarfieldConfig = (userRank?: number): StarfieldConfig => {
  const router = useRouter();
  const [config, setConfig] = useState<StarfieldConfig>({
    activeVariant: typedStarfieldMap.defaultVariant as StarfieldVariant,
    details: typedStarfieldMap.variantDetails[typedStarfieldMap.defaultVariant as StarfieldVariant],
    isLoading: true
  });

  useEffect(() => {
    if (!router.isReady) return;
    
    const currentPath = router.pathname;
    let matchedVariant: StarfieldVariant = typedStarfieldMap.defaultVariant as StarfieldVariant;
    let matchedGlyphOverlay: GlyphOverlayConfig | undefined;
    
    // Find the first matching route in our mappings
    const mappings = typedStarfieldMap.routeMappings;
    const match = mappings.find(mapping => routeMatches(currentPath, mapping.pattern));
    
    if (match) {
      matchedVariant = match.variant;
      
      // Check if there's a glyph overlay config for this route
      if (match.glyphOverlay) {
        const overlayConfig = { ...typedStarfieldMap.glyphOverlayDefaults, ...match.glyphOverlay };
        
        // Check if user meets rank requirements for the glyph
        if (userRank !== undefined && overlayConfig.minUserRank !== undefined) {
          overlayConfig.enabled = overlayConfig.enabled && userRank >= overlayConfig.minUserRank;
        }
        
        matchedGlyphOverlay = overlayConfig;
      }
    }
    
    setConfig({
      activeVariant: matchedVariant,
      details: typedStarfieldMap.variantDetails[matchedVariant],
      glyphOverlay: matchedGlyphOverlay,
      isLoading: false
    });
    
    console.log(`[Starfield] Active variant: ${matchedVariant} for route: ${currentPath}`);
    if (matchedGlyphOverlay?.enabled) {
      console.log(`[Starfield] Glyph overlay enabled: ${matchedGlyphOverlay.glyph}`);
    }
  }, [router.isReady, router.pathname, userRank]);

  return config;
};

// Function to get configuration for a specific variant
export const getStarfieldConfig = (userRank?: number, route?: string): StarfieldConfig => {
  // Default configuration
  let config: StarfieldConfig = {
    activeVariant: typedStarfieldMap.defaultVariant as StarfieldVariant,
    details: typedStarfieldMap.variantDetails[typedStarfieldMap.defaultVariant as StarfieldVariant],
    isLoading: false
  };
  
  if (!route) return config;
  
  // Find the matching route
  const match = typedStarfieldMap.routeMappings.find(mapping => routeMatches(route, mapping.pattern));
  
  if (match) {
    config.activeVariant = match.variant;
    config.details = typedStarfieldMap.variantDetails[match.variant];
    
    // Check if there's a glyph overlay for this route
    if (match.glyphOverlay) {
      const overlayConfig = { ...typedStarfieldMap.glyphOverlayDefaults, ...match.glyphOverlay };
      
      // Check if user meets rank requirements
      if (userRank !== undefined && overlayConfig.minUserRank !== undefined) {
        overlayConfig.enabled = overlayConfig.enabled && userRank >= overlayConfig.minUserRank;
      }
      
      config.glyphOverlay = overlayConfig;
    }
  }
  
  return config;
};

// Function to check if a variant is appropriate for a user based on their rank
export const isVariantAppropriateForRank = (variant: StarfieldVariant, rank: number | null): boolean => {
  // Logic to determine if the variant is appropriate for the user's rank
  // For example, experimental variants might only be available to higher ranks
  if (variant === 'experimental' && (!rank || rank < 5)) {
    return false;
  }
  
  return true;
}; 