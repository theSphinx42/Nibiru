import { GlyphTier, GlyphVisualProperties } from '@/types/glyph';

interface PatternPoint {
  x: number;
  y: number;
  rotation: number;
}

export const generateGlyphPattern = (
  tier: GlyphTier,
  properties: GlyphVisualProperties,
  seed: number = Math.random()
): PatternPoint[] => {
  const points: PatternPoint[] = [];
  const complexity = tier === GlyphTier.TIER_3 ? 8 : 
                    tier === GlyphTier.TIER_2 ? 6 : 4;
  
  // Use seed to generate consistent random values
  const rng = (index: number) => {
    return Math.abs(Math.sin(seed + index)) % 1;
  };

  // Generate pattern points based on tier and properties
  for (let i = 0; i < complexity; i++) {
    const angle = (360 / complexity) * i;
    const radius = 40 + rng(i) * 20;
    const rotation = rng(i + complexity) * 360;

    points.push({
      x: Math.cos((angle * Math.PI) / 180) * radius,
      y: Math.sin((angle * Math.PI) / 180) * radius,
      rotation,
    });
  }

  return points;
};

export const getGlyphDefaults = (tier: GlyphTier): GlyphVisualProperties => {
  switch (tier) {
    case GlyphTier.TIER_3:
      return {
        color: '#FFD700',
        pattern: 'quantum',
        animation_speed: 0.5,
        glow_intensity: 0.8
      };
    case GlyphTier.TIER_2:
      return {
        color: '#C0C0C0',
        pattern: 'standard',
        animation_speed: 0.3,
        glow_intensity: 0.5
      };
    case GlyphTier.TIER_1:
    default:
      return {
        color: '#CD7F32',
        pattern: 'basic',
        animation_speed: 0.2,
        glow_intensity: 0.3
      };
  }
}; 