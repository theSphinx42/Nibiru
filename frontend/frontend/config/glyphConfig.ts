// Glyph = singular tier token for a specific aspect
// Sigil = ceremonial composition of multiple glyphs

// Token rendering modes
export type RenderMode = 'svg' | 'canvas' | 'threejs';

// Base visual styles
export type ColorMode = 'monochrome' | 'duotone' | 'rgb' | 'hsv' | 'complementary';

// Configuration for glyph tiers
export interface TierConfig {
  pointCount: number;
  particleCount: number;
  glowStrength: string;
  radius: number;
  animationDuration: number;
  complexity: number;
  symmetryMax: number;
  glowOpacity: number;
}

// Legacy tier config used by existing components - don't remove
export const TIER_CONFIG: Record<number, Omit<TierConfig, 'radius'>> = {
  1: { // Full Experience
    pointCount: 12,
    particleCount: 24,
    glowStrength: "4",
    animationDuration: 0.5,
    complexity: 1.0,
    symmetryMax: 8,
    glowOpacity: 0.5
  },
  2: { // Simplified
    pointCount: 6,
    particleCount: 12,
    glowStrength: "3",
    animationDuration: 0.3,
    complexity: 0.8,
    symmetryMax: 6,
    glowOpacity: 0.4
  },
  3: { // Minimal
    pointCount: 4,
    particleCount: 6,
    glowStrength: "2",
    animationDuration: 0.2,
    complexity: 0.6,
    symmetryMax: 4,
    glowOpacity: 0.3
  }
};

// Tier levels determine complexity and features
export enum GlyphTier {
  BASIC = 0,    // Entry level user glyph
  STANDARD = 1, // Standard user representation
  ENHANCED = 2, // Enhanced with more details
  PREMIUM = 3,  // Premium membership
  MYTHIC = 4    // Special achievements/permissions
}

// Sigil tiers are more advanced than regular glyphs
export enum SigilTier {
  INITIATE = 0,    // Basic sigil (2 glyphs composite)
  ADEPT = 1,       // Intermediate (3 glyphs composite)
  MASTER = 2,      // Advanced (4 glyphs composite)
  ASCENDANT = 3,   // Expert level (5+ glyphs composite)
  TRANSCENDENT = 4 // Maximum complexity (ceremonial and rare)
}

// Base metadata for token rendering
export interface GlyphMetadata {
  seed: string;
  tier: number;
  colorMode: ColorMode;
  symmetry: number;
  pointCount: number;
  hexHash: string;
  timestamp: number;
}

// Extended metadata for sigil composition
export interface SigilMetadata extends GlyphMetadata {
  sourceGlyphs: string[]; // IDs of component glyphs
  ceremony: string;       // Type of composition ceremony
  validators: string[];   // Validation authorities
  unlocks: string[];      // Features or areas this sigil grants access to
}

// Default color schemes
export const COLOR_SCHEMES = {
  basic: {
    primary: '#4a6fa5',
    secondary: '#2c3e50',
    accent: '#16a085'
  },
  enhanced: {
    primary: '#9b59b6',
    secondary: '#2980b9',
    accent: '#27ae60'
  },
  premium: {
    primary: '#f1c40f',
    secondary: '#e67e22',
    accent: '#9b59b6'
  },
  mythic: {
    primary: '#d35400',
    secondary: '#c0392b',
    accent: '#f39c12'
  }
};

// Utility to generate a hex hash from a seed
export const generateHexHash = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(8, '0');
};

// Utility to format export filenames
export const formatGlyphFilename = (
  seed: string,
  format: 'svg' | 'png',
  prefix = 'glyph'
): string => {
  const hexHash = generateHexHash(seed);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${seed.toLowerCase()}-${hexHash}-${timestamp}.${format}`;
};

// Format filename for sigil compositions
export const formatSigilFilename = (
  seed: string,
  ceremony: string,
  format: 'svg' | 'png'
): string => {
  const hexHash = generateHexHash(seed);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `sigil-${ceremony}-${seed.toLowerCase()}-${hexHash}-${timestamp}.${format}`;
};

// Create metadata for a glyph
export const createGlyphMetadata = (
  seed: string,
  tier: number,
  colorMode: ColorMode,
  symmetry: number,
  pointCount: number
): GlyphMetadata => ({
  seed,
  tier,
  colorMode,
  symmetry,
  pointCount,
  hexHash: generateHexHash(seed),
  timestamp: new Date().getTime()
});

// Create metadata for a ceremonial sigil composition
export const createSigilMetadata = (
  seed: string,
  tier: number,
  sourceGlyphs: string[],
  ceremony: string,
  validators: string[],
  unlocks: string[]
): SigilMetadata => ({
  ...createGlyphMetadata(seed, tier, 'rgb', 6, 12),
  sourceGlyphs,
  ceremony,
  validators,
  unlocks
}); 