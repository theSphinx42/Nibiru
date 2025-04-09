import { useState } from 'react';
import { motion } from 'framer-motion';
import SpiritGlyphViewer from './GlyphViewer';
import { generateAdvertiserSeed } from '../utils/glyphUtils';

interface AdvertiserLogoProps {
  advertiserId: string;
  advertiserName?: string;
  logo?: string | null;
  size?: number;
  showGlyphSheen?: boolean;
  wrapWithGlow?: boolean;
  className?: string;
}

const AdvertiserLogo: React.FC<AdvertiserLogoProps> = ({
  advertiserId,
  advertiserName,
  logo,
  size = 64,
  showGlyphSheen = true,
  wrapWithGlow = false,
  className = '',
}) => {
  const [logoError, setLogoError] = useState(false);
  const seed = generateAdvertiserSeed(advertiserId, advertiserName);
  const shouldShowGlyph = !logo || logoError;

  // Glow effect wrapper
  const GlowWrapper = wrapWithGlow ? motion.div : 'div';
  const glowProps = wrapWithGlow ? {
    animate: {
      boxShadow: [
        '0 0 10px rgba(88, 101, 242, 0.2)',
        '0 0 20px rgba(88, 101, 242, 0.3)',
        '0 0 10px rgba(88, 101, 242, 0.2)',
      ],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  } : {};

  return (
    <GlowWrapper
      className={`relative flex items-center justify-center rounded-lg overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      {...glowProps}
    >
      {shouldShowGlyph ? (
        // Fallback to SpiritGlyph
        <SpiritGlyphViewer
          seed={seed}
          tier={3}
          colorMode="auto"
          size={size}
          useTransition={true}
          isGenerating={showGlyphSheen}
        />
      ) : (
        // Custom logo with optional glyph watermark
        <div className="relative w-full h-full">
          <motion.img
            src={logo}
            alt={advertiserName || 'Advertiser logo'}
            className="w-full h-full object-contain"
            onError={() => setLogoError(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          {wrapWithGlow && (
            <div className="absolute inset-0 pointer-events-none">
              <SpiritGlyphViewer
                seed={seed}
                tier={3}
                colorMode="auto"
                size={size}
                useTransition={false}
                isGenerating={false}
                className="opacity-10"
              />
            </div>
          )}
        </div>
      )}
    </GlowWrapper>
  );
};

export default AdvertiserLogo; 