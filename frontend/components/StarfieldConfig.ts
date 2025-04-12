/**
 * Starfield Configuration
 * 
 * This file contains configuration for the different starfield variants used in Nibiru.
 */

export type StarfieldVariant = 'main' | 'login' | 'experimental';

export interface StarfieldConfig {
  variant: StarfieldVariant;
  params?: {
    [key: string]: any;
  };
}

interface StarfieldConfigOptions {
  [key: string]: StarfieldConfig;
}

/**
 * Predefined starfield configurations for different use cases
 */
export const STARFIELD_CONFIGS: StarfieldConfigOptions = {
  // Main Dynamic Starfield (Ranked Dashboard, /profile)
  MAIN_HYPERSPACE: {
    variant: 'main',
    params: {
      mode: 'ranked',
      features: {
        shootingStars: true,
        coloredTwinkles: true,
        supernovaBursts: true,
        finlineGlyphs: true,
        boldFloatingGlyphs: false
      }
    }
  },
  
  // Login Background (Login/Access Pages)
  LOGIN_FALLING: {
    variant: 'login',
    params: {
      density: 200,
      speed: 0.3,
      features: {
        trails: false,
        rotation: false,
        bursts: false
      }
    }
  },
  
  // Experimental variant - archived
  EXPERIMENTAL_BOLD_GLYPH: {
    variant: 'experimental',
    params: {
      features: {
        boldFloatingGlyphs: true
      }
    }
  }
};

/**
 * Gets the appropriate starfield config based on user level or route
 * @param userRank User's rank in the system
 * @param route Current route path
 * @returns The starfield configuration to use
 */
export function getStarfieldConfig(userRank?: number, route?: string): StarfieldConfig {
  // Login/auth pages
  if (route?.includes('/login') || route?.includes('/auth')) {
    return STARFIELD_CONFIGS.LOGIN_FALLING;
  }
  
  // Default to main hyperspace variant for most pages
  return STARFIELD_CONFIGS.MAIN_HYPERSPACE;
}

/**
 * Fallback configuration in case of animation failures
 */
export const FALLBACK_STARFIELD: StarfieldConfig = {
  variant: 'main',
  params: {
    mode: 'ranked',
    features: {
      shootingStars: false,
      coloredTwinkles: false,
      supernovaBursts: false,
      finlineGlyphs: false,
      boldFloatingGlyphs: false
    }
  }
}; 