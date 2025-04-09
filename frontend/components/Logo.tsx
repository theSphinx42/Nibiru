import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LogoProps {
  variant?: 'full' | 'symbol';
  size?: number;
  className?: string;
  animate?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 200,
  className = '',
  animate = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Use the symbol as fallback if full logo fails to load
  const imagePath = imageError && variant === 'full'
    ? '/images/nibiru-symbol.png'
    : variant === 'full'
    ? '/images/nibiru-logo-full.png'
    : '/images/nibiru-symbol.png';

  const baseClassName = 'relative inline-block rounded-full overflow-hidden';
  const combinedClassName = `${baseClassName} ${className}`.trim();

  const imageProps = {
    src: imagePath,
    alt: "Nibiru",
    width: size,
    height: size,
    priority: true,
    className: "object-contain rounded-full",
    onError: () => setImageError(true),
    quality: 100, // Ensure highest quality
  };

  if (animate) {
    return (
      <motion.div
        className={combinedClassName}
        style={{ width: size, height: size }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          filter: [
            'drop-shadow(0 0 20px rgba(88, 101, 242, 0.3))',
            'drop-shadow(0 0 30px rgba(88, 101, 242, 0.5))',
            'drop-shadow(0 0 20px rgba(88, 101, 242, 0.3))',
          ]
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          filter: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <Image {...imageProps} />
      </motion.div>
    );
  }

  return (
    <div className={combinedClassName} style={{ width: size, height: size }}>
      <Image {...imageProps} />
    </div>
  );
}; 