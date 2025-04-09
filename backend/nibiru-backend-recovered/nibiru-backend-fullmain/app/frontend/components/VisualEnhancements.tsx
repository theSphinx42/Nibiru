import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserScoreCard } from '../types/analytics';

interface VisualEnhancementsProps {
  scoreCard: UserScoreCard;
  children: React.ReactNode;
}

const VisualEnhancements: React.FC<VisualEnhancementsProps> = ({ scoreCard, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create constellation background effect
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars
    const stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    // Animation loop
    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        const pulse = Math.sin(Date.now() * star.pulseSpeed + star.pulseOffset) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * (1 + pulse * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + pulse * 0.2})`;
        ctx.fill();
      });

      // Draw connections between nearby stars
      stars.forEach((star1, i) => {
        stars.slice(i + 1).forEach(star2 => {
          const dx = star1.x - star2.x;
          const dy = star1.y - star2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(star1.x, star1.y);
            ctx.lineTo(star2.x, star2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        });
      });

      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
      container.removeChild(canvas);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* SpiritGlyph Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-9xl text-gray-100 dark:text-gray-800 opacity-10">
          {scoreCard.spirit_glyph}
        </div>
      </div>

      {/* Glyph Pulse Effect */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content with Rank Animation */}
      <div className="relative">
        <AnimatePresence>
          <motion.div
            key={scoreCard.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Glyph Affinity Indicators */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {Object.entries(scoreCard.glyph_affinity).map(([glyph, affinity]) => (
          <motion.div
            key={glyph}
            className="text-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {glyph}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VisualEnhancements; 