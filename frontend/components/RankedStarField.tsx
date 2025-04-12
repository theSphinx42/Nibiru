import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1280;
const HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 720;

interface RankedStarFieldProps {
  rank?: number;
  mode?: 'animated' | 'static' | 'ranked';
  className?: string;
}

// Default ranks will be used if none is provided
const DEFAULT_RANKS = {
  minimal: 1,
  standard: 5,
  advanced: 12,
  expert: 25,
  master: 50
};

// Dynamic import of the Star Renderer component to avoid SSR issues
const StarRendererCanvas = dynamic(() => import('./StarRendererCanvas'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />
});

/**
 * RankedStarField - The primary starfield component that adapts based on user rank
 * 
 * This component handles different display modes and renders the appropriate 
 * star field density based on user rank.
 */
const RankedStarField: React.FC<RankedStarFieldProps> = ({
  rank = 1,
  mode = 'ranked',
  className = ''
}) => {
  const [starCount, setStarCount] = useState(100);
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Determine star count based on rank or mode
    if (mode === 'ranked') {
      // Logarithmic scale for star count based on rank
      let calculatedStars = Math.min(200 + Math.floor(Math.log(rank + 1) * 100), 1200);
      
      // Ensure reasonable limits
      calculatedStars = Math.max(calculatedStars, 100);
      setStarCount(calculatedStars);
      
      // Also adjust glow intensity with rank
      setGlowIntensity(Math.min(0.5 + (rank / 100), 0.9));
    } else if (mode === 'static') {
      setStarCount(150);
      setGlowIntensity(0.7);
    } else {
      setStarCount(300);
      setGlowIntensity(0.8);
    }
  }, [rank, mode]);

  return (
    <div className={`fixed inset-0 z-0 overflow-hidden ${className}`}>
      <StarRendererCanvas 
        width={WIDTH}
        height={HEIGHT}
        starCount={starCount}
        glowIntensity={glowIntensity}
        animationSpeed={mode === 'static' ? 0 : 0.5}
      />
    </div>
  );
};

export default RankedStarField; 