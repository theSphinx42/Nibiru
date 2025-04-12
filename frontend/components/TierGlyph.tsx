import React from 'react';
import ThematicGlyph from './ThematicGlyph';
import { GlyphTier, GlyphRank, GlyphEffect } from '@/types/glyph';

interface TierGlyphProps {
  tier: 1 | 2 | 3;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const getTierDefaults = (tier: 1 | 2 | 3): {
  glyphTier: GlyphTier;
  rank: GlyphRank;
  effect: GlyphEffect;
} => {
  switch (tier) {
    case 3:
      return {
        glyphTier: GlyphTier.TIER_3,
        rank: GlyphRank.PREMIUM,
        effect: 'quantum'
      };
    case 2:
      return {
        glyphTier: GlyphTier.TIER_2,
        rank: GlyphRank.ENHANCED,
        effect: 'glow'
      };
    default:
      return {
        glyphTier: GlyphTier.TIER_1,
        rank: GlyphRank.BASIC,
        effect: 'pulse'
      };
  }
};

export const TierGlyph: React.FC<TierGlyphProps> = ({
  tier,
  size = 48,
  className = '',
  onClick
}) => {
  const { glyphTier, rank, effect } = getTierDefaults(tier);

  return (
    <ThematicGlyph
      tier={glyphTier}
      rank={rank}
      effect={effect}
      size={size}
      className={className}
      onClick={onClick}
      properties={{
        color: tier === 3 ? '#FFD700' : tier === 2 ? '#C0C0C0' : '#CD7F32',
        secondaryColor: tier === 3 ? '#FFA500' : tier === 2 ? '#A0A0A0' : '#8B4513',
        complexity: tier === 3 ? 8 : tier === 2 ? 6 : 4,
        animationSpeed: tier === 3 ? 1.5 : tier === 2 ? 1.0 : 0.5,
        glowIntensity: tier === 3 ? 1.0 : tier === 2 ? 0.7 : 0.4,
        pattern: tier === 3 ? 'crystalline' : tier === 2 ? 'spiral' : 'radial'
      }}
    />
  );
}; 