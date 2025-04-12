import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpiritGlyphViewer from './GlyphViewer';
import { generateAdvertiserSeed } from '../utils/glyphUtils';
import { calculateEvolution } from '../utils/glyphEvolution';

const MAX_RETRIES = 2;
const RETRY_DELAY = 2000; // 2 seconds

interface AdvertiserGlyphProps {
  advertiserId: string;
  advertiserName?: string;
  logo?: string | null;
  size?: number;
  showGlyphWatermark?: boolean;
  showGlow?: boolean;
  className?: string;
  metrics?: {
    prominence?: number; // 0-1 scale for visual importance
    tier?: number; // quantum tier if applicable
    activity?: number; // recent activity level 0-1
  };
}

export const AdvertiserGlyph: React.FC<AdvertiserGlyphProps> = ({
  advertiserId,
  advertiserName,
  logo,
  size = 64,
  showGlyphWatermark = true,
  showGlow = true,
  className = '',
  metrics = {},
}) => {
  const [logoError, setLogoError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(!!logo);
  const seed = generateAdvertiserSeed(advertiserId, advertiserName);

  // Calculate evolution parameters based on metrics
  const evolution = calculateEvolution({
    price: 0, // Not price-based for advertisers
    downloads: 0,
    rating: 5, // Default to max rating for advertisers
    quantumTier: metrics.tier || 0,
  });

  // Enhance evolution based on advertiser-specific metrics
  const enhancedEvolution = {
    ...evolution,
    glowStrength: evolution.glowStrength * (1 + (metrics.prominence || 0) * 0.5),
    glowOpacity: evolution.glowOpacity * (1 + (metrics.activity || 0) * 0.3),
    saturationBoost: evolution.saturationBoost * (1 + (metrics.prominence || 0) * 0.2),
  };

  // Handle logo loading with retries
  useEffect(() => {
    if (!logo) {
      setIsLoading(false);
      return;
    }

    const loadImage = () => {
      setIsLoading(true);
      const img = new Image();
      
      img.onload = () => {
        setIsLoaded(true);
        setLogoError(false);
        setIsLoading(false);
        setRetryCount(0);
      };
      
      img.onerror = () => {
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadImage();
          }, RETRY_DELAY);
        } else {
          setLogoError(true);
          setIsLoaded(false);
          setIsLoading(false);
        }
      };
      
      img.src = logo;
    };

    loadImage();
  }, [logo, retryCount]);

  const shouldShowGlyph = !logo || logoError;

  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          // Loading state
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm"
          >
            <motion.div
              className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        ) : shouldShowGlyph ? (
          // Fallback to Tier 3 SpiritGlyph
          <motion.div
            key="glyph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <SpiritGlyphViewer
              seed={seed}
              tier={3}
              size={size}
              evolution={enhancedEvolution}
              useTransition={true}
              colorMode="auto"
            />
          </motion.div>
        ) : (
          // Custom logo with optional glyph watermark and glow
          <motion.div
            key="logo"
            className="relative w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {showGlow && (
              <motion.div
                className="absolute inset-0 z-0"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(88, 101, 242, 0.2)',
                    '0 0 20px rgba(88, 101, 242, 0.3)',
                    '0 0 10px rgba(88, 101, 242, 0.2)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}

            {/* Logo */}
            <motion.img
              src={logo!}
              alt={advertiserName || 'Advertiser logo'}
              className="relative z-10 w-full h-full object-contain"
              animate={{
                filter: showGlow ? [
                  'drop-shadow(0 0 8px rgba(88, 101, 242, 0.3))',
                  'drop-shadow(0 0 12px rgba(88, 101, 242, 0.4))',
                  'drop-shadow(0 0 8px rgba(88, 101, 242, 0.3))',
                ] : 'none',
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Watermark Glyph */}
            {showGlyphWatermark && isLoaded && (
              <div className="absolute inset-0 z-20 opacity-10 mix-blend-overlay pointer-events-none">
                <SpiritGlyphViewer
                  seed={seed}
                  tier={3}
                  size={size}
                  evolution={enhancedEvolution}
                  useTransition={false}
                  colorMode="auto"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvertiserGlyph; 