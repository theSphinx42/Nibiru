import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ThematicGlyph, { GlyphEffect, GlyphRank } from './ThematicGlyph';
import { GlyphName } from '../types/glyph';

interface GlyphViewerProps {
  glyph: GlyphName;
  size?: number;
  effect?: GlyphEffect;
  isAnimated?: boolean;
  className?: string;
  animateOnHover?: boolean;
  animateOnClick?: boolean;
  onClick?: () => void;
  rank?: GlyphRank;
  dashboardMode?: boolean;
}

const GlyphViewer: React.FC<GlyphViewerProps> = ({
  glyph,
  size = 64,
  effect = 'none',
  isAnimated = false,
  className = '',
  animateOnHover = false,
  animateOnClick = false,
  onClick,
  rank = 'basic',
  dashboardMode = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const currentEffect: GlyphEffect = 
    (animateOnClick && isClicked) ? 'quantum' :
    (animateOnHover && isHovered) ? 'glow' : 
    effect;

  const handleClick = (e: React.MouseEvent) => {
    if (animateOnClick) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 2000);
    }
    
    // Make sure we call the parent onClick handler if provided
    if (onClick) {
      e.stopPropagation(); // Prevent event bubbling when onClick is provided
      onClick();
    }
  };

  return (
    <motion.div
      className={`glyph-viewer relative ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={animateOnHover ? { scale: 1.05 } : {}}
      whileTap={animateOnClick ? { scale: 0.95 } : {}}
    >
      <ThematicGlyph
        glyph={glyph}
        effect={currentEffect}
        size={size}
        rank={rank}
        dashboardMode={dashboardMode}
      />
    </motion.div>
  );
};

export default GlyphViewer; 