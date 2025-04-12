import React from 'react';
import { motion } from 'framer-motion';
import { GlyphTier } from '@/types/glyph';
import { useGlyphAnimation } from '@/hooks/useGlyphAnimation';

interface BuyerGlyphProps {
  glyphData: {
    id: string;
    tier: GlyphTier;
    visual_properties: {
      color: string;
      pattern: string;
      animation_speed: number;
      glow_intensity: number;
    };
  };
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const BuyerGlyph: React.FC<BuyerGlyphProps> = ({
  glyphData,
  size = 64,
  className = '',
  onClick
}) => {
  const { 
    id, 
    tier,
    visual_properties: {
      color,
      pattern,
      animation_speed,
      glow_intensity
    }
  } = glyphData;

  const { animationControls, glowVariants } = useGlyphAnimation({
    speed: animation_speed,
    intensity: glow_intensity
  });

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      animate={animationControls}
      variants={glowVariants}
      whileHover="hover"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
      >
        {/* Base glow effect */}
        <defs>
          <filter id={`glow-${id}`}>
            <feGaussianBlur
              stdDeviation={glow_intensity}
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Pattern based on the pattern type */}
        <g filter={`url(#glow-${id})`}>
          {pattern === 'circular' ? (
            <circle
              cx="50"
              cy="50"
              r="40"
              fill={color}
              className="transition-all duration-300"
            />
          ) : (
            <path
              d="M50 10 L90 50 L50 90 L10 50 Z"
              fill={color}
              className="transition-all duration-300"
            />
          )}
        </g>

        {/* Tier indicator */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-bold fill-white"
        >
          T3
        </text>
      </svg>
    </motion.div>
  );
}; 