/**
 * GlyphBackground Component - Starfield Overlay Layer
 * 
 * This component provides a glyph-based overlay that can be mounted on top of
 * the starfield background. It's designed to be lightweight and non-interfering
 * with the main starfield animations.
 */

import { motion } from 'framer-motion';
import GlyphViewer from '../../GlyphViewer';
import { GlyphName, GlyphEffect } from '../../ThematicGlyph';
import { useEffect, useRef, useState } from 'react';

export interface GlyphLayerProps {
  glyph?: GlyphName;
  size?: number;
  opacity?: number;
  className?: string;
  effect?: 'glow' | 'orbit' | 'pulse' | 'fade';
  description?: string;
  userRank?: number;
  isActive?: boolean;
  syncWithMusic?: boolean;
  colorTheme?: 'default' | 'cosmic' | 'quantum' | 'nebula';
}

/**
 * GlyphBackground component - provides a visual glyph overlay for the starfield
 */
const GlyphBackground: React.FC<GlyphLayerProps> = ({
  glyph = 'sigil-of-creation',
  size = 400,
  opacity = 0.1,
  className = '',
  effect = 'fade',
  description,
  userRank,
  isActive = true,
  syncWithMusic = false,
  colorTheme = 'default'
}) => {
  const [pulseOpacity, setPulseOpacity] = useState(opacity);

  // Effect for music sync breathing animation
  useEffect(() => {
    if (!syncWithMusic || !isActive) return;
    
    let animationFrame: number;
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      // Slow breathing effect - 4 second cycle
      const pulse = Math.sin(elapsed / 4000 * Math.PI) * 0.3 + 0.7;
      setPulseOpacity(opacity * pulse);
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [syncWithMusic, isActive, opacity]);

  // Convert the effect to a valid GlyphEffect type
  const getGlyphEffect = (): GlyphEffect => {
    switch (effect) {
      case 'glow': return 'glow';
      case 'pulse': return 'pulse';
      case 'orbit': return 'particles'; // Map orbit to particles
      default: return 'none';
    }
  };

  // Apply color theme based on selected theme
  const getThemeColors = () => {
    switch (colorTheme) {
      case 'cosmic':
        return 'from-purple-500/30 to-indigo-700/20';
      case 'quantum':
        return 'from-emerald-500/30 to-cyan-700/20';
      case 'nebula':
        return 'from-pink-500/30 to-purple-700/20';
      default:
        return 'from-blue-500/30 to-indigo-700/20';
    }
  };

  // Skip rendering if not active
  if (!isActive) return null;

  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none select-none ${className} 
                 flex items-center justify-center overflow-hidden bg-gradient-radial ${getThemeColors()}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: syncWithMusic ? pulseOpacity : opacity }}
      transition={{ duration: 1 }}
    >
      <GlyphViewer
        glyph={glyph}
        size={size}
        description={description}
        effect={getGlyphEffect()}
        isAnimated={effect !== 'fade'}
      />
    </motion.div>
  );
};

export default GlyphBackground; 