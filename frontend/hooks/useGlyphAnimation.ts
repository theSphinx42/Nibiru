import { useEffect, useState } from 'react';
import { GlyphVisualProperties, GlyphAnimationProps } from '@/types/glyph';

export const useGlyphAnimation = (
  properties: GlyphVisualProperties
): GlyphAnimationProps => {
  const [glowIntensity, setGlowIntensity] = useState(properties.glowIntensity);
  const [rotationAngle, setRotationAngle] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      setRotationAngle(prev => (prev + properties.animationSpeed) % 360);
      setGlowIntensity(prev => 
        Math.sin(Date.now() / 1000) * 0.2 + properties.glowIntensity
      );
      
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [properties]);

  return {
    glowIntensity,
    rotationAngle,
  };
}; 