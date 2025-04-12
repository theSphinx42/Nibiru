import { GlyphColors } from '../types/glyph';

interface ServiceMetrics {
  price: number;
  downloads: number;
  rating: number;
  quantumTier?: number;
}

interface EvolutionParams {
  complexity: number;
  glowStrength: number;
  glowOpacity: number;
  particleCount: number;
  hueRotation: number;
  saturationBoost: number;
  shimmerEnabled: boolean;
  auraEnabled: boolean;
  mythicLevel: number;
}

// Price tiers for visual enhancement
const PRICE_TIERS = [
  { threshold: 0, multiplier: 1 },
  { threshold: 50, multiplier: 1.2 },
  { threshold: 100, multiplier: 1.4 },
  { threshold: 250, multiplier: 1.6 },
  { threshold: 500, multiplier: 1.8 },
  { threshold: 1000, multiplier: 2 }
];

// Download tiers for complexity
const DOWNLOAD_TIERS = [
  { threshold: 0, multiplier: 1 },
  { threshold: 100, multiplier: 1.25 },
  { threshold: 500, multiplier: 1.5 },
  { threshold: 1000, multiplier: 1.75 },
  { threshold: 5000, multiplier: 2 },
  { threshold: 10000, multiplier: 2.5 }
];

// Calculate price tier multiplier
const getPriceMultiplier = (price: number): number => {
  const tier = PRICE_TIERS.reverse().find(t => price >= t.threshold);
  return tier?.multiplier || 1;
};

// Calculate download tier multiplier
const getDownloadMultiplier = (downloads: number): number => {
  const tier = DOWNLOAD_TIERS.reverse().find(t => downloads >= t.threshold);
  return tier?.multiplier || 1;
};

// Calculate rating-based effects
const getRatingEffects = (rating: number) => ({
  shimmerEnabled: rating >= 4.5,
  auraEnabled: rating >= 4.8,
  saturationBoost: Math.max(0, (rating - 4) * 0.2) // 0-20% boost
});

// Calculate quantum tier effects
const getQuantumEffects = (quantumTier: number = 0) => ({
  mythicLevel: Math.min(1, quantumTier / 10), // 0-100% mythic
  hueRotation: quantumTier * 15 // 0-150 degrees
});

// Calculate evolution parameters based on service metrics
export const calculateEvolution = (metrics: ServiceMetrics): EvolutionParams => {
  const priceMultiplier = getPriceMultiplier(metrics.price);
  const downloadMultiplier = getDownloadMultiplier(metrics.downloads);
  const ratingEffects = getRatingEffects(metrics.rating);
  const quantumEffects = getQuantumEffects(metrics.quantumTier);

  return {
    // Base complexity affected by downloads
    complexity: 0.5 + (downloadMultiplier * 0.5),
    
    // Glow strength affected by price and rating
    glowStrength: 2 + (priceMultiplier * 2),
    
    // Glow opacity affected by price and quantum tier
    glowOpacity: 0.3 + (priceMultiplier * 0.2) + (quantumEffects.mythicLevel * 0.2),
    
    // Particle count affected by downloads and rating
    particleCount: Math.floor(12 * downloadMultiplier * (1 + ratingEffects.saturationBoost)),
    
    // Color modifications
    hueRotation: quantumEffects.hueRotation,
    saturationBoost: ratingEffects.saturationBoost,
    
    // Special effects
    shimmerEnabled: ratingEffects.shimmerEnabled,
    auraEnabled: ratingEffects.auraEnabled,
    mythicLevel: quantumEffects.mythicLevel
  };
};

// Apply evolution parameters to colors
export const evolveColors = (
  baseColors: GlyphColors,
  evolution: EvolutionParams
): GlyphColors => {
  const evolveColor = (color: string) => {
    const hsl = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!hsl) return color;

    const [_, h, s, l] = hsl.map(Number);
    const newHue = (h + evolution.hueRotation) % 360;
    const newSat = Math.min(100, s * (1 + evolution.saturationBoost));
    const newLight = Math.min(100, l * (1 + evolution.mythicLevel * 0.2));

    return `hsl(${newHue}, ${newSat}%, ${newLight}%)`;
  };

  return {
    primary: evolveColor(baseColors.primary),
    secondary: evolveColor(baseColors.secondary),
    glow: evolveColor(baseColors.glow),
    accent: evolveColor(baseColors.accent)
  };
}; 