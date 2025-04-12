/**
 * ARCHIVED - DO NOT USE IN PRODUCTION
 * 
 * This experimental starfield variant with bold floating glyphs has been archived
 * per design directive. It is preserved for reference purposes only.
 * 
 * The main RankedStarField and StarfieldLoginBG should be used instead.
 */

import { useEffect, useRef } from 'react';

interface StarfieldExperimentalProps {
  className?: string;
}

interface CosmicObject {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  speed: number;
  type: 'star' | 'glyph';
  rotation?: number;
  glyphIndex?: number;
  vx?: number;
  vy?: number;
}

const GLYPHS = [
  '⚛', '∞', '⚡', 'Ω', '∑', '∆', 'Φ', 'Ψ', '℧', '⚔', '⚙'
];

const StarfieldExperimental_BoldFloat_ARCHIVED: React.FC<StarfieldExperimentalProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objectsRef = useRef<CosmicObject[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize cosmic objects
    const initObjects = () => {
      const objects: CosmicObject[] = [];
      
      // Stars
      for (let i = 0; i < 100; i++) {
        objects.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.7 + 0.3,
          color: '#FFFFFF',
          speed: Math.random() * 0.5 + 0.1,
          type: 'star',
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5
        });
      }
      
      // Bold Floating Glyphs - the feature that should be archived
      for (let i = 0; i < 15; i++) {
        objects.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 30 + 20,
          opacity: Math.random() * 0.8 + 0.2,
          color: getRandomColor(),
          speed: Math.random() * 0.3 + 0.1,
          type: 'glyph',
          rotation: Math.random() * Math.PI * 2,
          glyphIndex: Math.floor(Math.random() * GLYPHS.length),
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7
        });
      }

      objectsRef.current = objects;
    };

    // Get random color with a purple/blue tendency
    const getRandomColor = () => {
      const colors = [
        '#7B68EE', '#6A5ACD', '#483D8B', '#9370DB',
        '#8A2BE2', '#9400D3', '#9932CC', '#BA55D3',
        '#4169E1', '#0000FF', '#0000CD', '#00BFFF'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    // Animation function
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      objectsRef.current.forEach(obj => {
        if (obj.type === 'star') {
          // Draw stars
          ctx.fillStyle = `rgba(255, 255, 255, ${obj.opacity})`;
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Update star position with gentle drift
          if (obj.vx && obj.vy) {
            obj.x += obj.vx;
            obj.y += obj.vy;
          }
        } else if (obj.type === 'glyph') {
          // Draw bold floating glyphs
          ctx.save();
          ctx.translate(obj.x, obj.y);
          if (obj.rotation) ctx.rotate(obj.rotation);
          
          ctx.font = `bold ${obj.size}px Arial`;
          ctx.fillStyle = `rgba(${hexToRgb(obj.color)}, ${obj.opacity})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Draw the glyph character
          ctx.fillText(GLYPHS[obj.glyphIndex || 0], 0, 0);
          
          ctx.restore();
          
          // Update glyph position and rotation
          if (obj.vx && obj.vy) {
            obj.x += obj.vx;
            obj.y += obj.vy;
          }
          if (obj.rotation) obj.rotation += 0.005;
        }
        
        // Wrap around screen edges
        if (obj.x < -50) obj.x = canvas.width + 50;
        if (obj.x > canvas.width + 50) obj.x = -50;
        if (obj.y < -50) obj.y = canvas.height + 50;
        if (obj.y > canvas.height + 50) obj.y = -50;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Helper to convert hex to rgb
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    };

    // Start animation
    initObjects();
    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full -z-10 ${className}`}
    />
  );
};

export default StarfieldExperimental_BoldFloat_ARCHIVED; 