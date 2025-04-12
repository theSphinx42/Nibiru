/**
 * GlyphBackground Component
 * 
 * This component will be moved to canvas-extras/ directory in a future organization update.
 */

import { motion } from 'framer-motion';
import GlyphViewer from './GlyphViewer';
import { GlyphName, GlyphEffect } from './ThematicGlyph';
import { useEffect, useRef } from 'react';

interface GlyphBackgroundProps {
  glyph: GlyphName;
  size?: number;
  opacity?: number;
  className?: string;
  effect?: 'glow' | 'orbit' | 'pulse' | 'fade';
  description?: string;
  syncWithMusic?: boolean;
  colorTheme?: string;
  isActive?: boolean;
  userRank?: number;
}

const GlyphBackground: React.FC<GlyphBackgroundProps> = ({
  glyph,
  size = 400,
  opacity = 0.1,
  className = '',
  effect = 'fade',
  description,
  syncWithMusic = false,
  colorTheme,
  isActive = true,
  userRank
}) => {
  // Convert the effect to a valid GlyphEffect type
  const getGlyphEffect = (): GlyphEffect => {
    switch (effect) {
      case 'glow': return 'glow';
      case 'pulse': return 'pulse';
      case 'orbit': return 'particles'; // Map orbit to particles
      default: return 'none';
    }
  };

  return (
    <motion.div
      className={`absolute pointer-events-none select-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 1 }}
    >
      <GlyphViewer
        glyph={glyph}
        size={size}
        description={description}
        effect={getGlyphEffect()}
        isAnimated={effect !== 'fade'}
        colorTheme={colorTheme}
        syncWithMusic={syncWithMusic}
      />
    </motion.div>
  );
};

export default GlyphBackground; 