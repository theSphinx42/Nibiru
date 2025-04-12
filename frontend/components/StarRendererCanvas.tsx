import React, { useRef, useEffect } from 'react';

interface StarRendererCanvasProps {
  width: number;
  height: number;
  starCount: number;
  glowIntensity: number;
  animationSpeed: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  opacity: number;
}

/**
 * StarRendererCanvas
 * 
 * A canvas-based star renderer that creates an animated or static starfield
 * with adjustable parameters.
 */
const StarRendererCanvas: React.FC<StarRendererCanvasProps> = ({
  width,
  height,
  starCount,
  glowIntensity,
  animationSpeed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  // Initialize stars
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    
    const stars: Star[] = [];
    const colors = ['#FFFFFF', '#E0E0FF', '#FFFFD0', '#FFE8D0'];
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * 1000,
        size: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.5
      });
    }
    
    starsRef.current = stars;
  }, [width, height, starCount]);

  // Helper function to check if a value is a valid finite number
  const isValidNumber = (value: number): boolean => {
    return typeof value === 'number' && isFinite(value) && !isNaN(value);
  };

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Move coordinate system to center for perspective
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      for (const star of starsRef.current) {
        // Calculate perspective
        const scale = 1000 / Math.max(1000 - star.z, 1); // Prevent division by zero
        const x = star.x * scale;
        const y = star.y * scale;
        const size = star.size * scale;
        
        // Skip rendering if any values are invalid
        if (!isValidNumber(x) || !isValidNumber(y) || !isValidNumber(size)) {
          continue;
        }
        
        // Draw star
        ctx.globalAlpha = Math.min(Math.max(star.opacity * (1 - star.z / 1000), 0), 1);
        ctx.fillStyle = star.color;
        
        // Add glow effect based on intensity
        if (glowIntensity > 0 && size > 0) {
          try {
            const glowRadius = size * (1 + glowIntensity * 3);
            
            // Only create gradient if all values are valid
            if (isValidNumber(x) && isValidNumber(y) && isValidNumber(glowRadius)) {
              const glow = ctx.createRadialGradient(
                x, y, 0,
                x, y, glowRadius
              );
              
              glow.addColorStop(0, star.color);
              glow.addColorStop(0.1, `${star.color}80`);
              glow.addColorStop(1, 'transparent');
              
              ctx.fillStyle = glow;
              ctx.fillRect(
                x - glowRadius,
                y - glowRadius,
                glowRadius * 2,
                glowRadius * 2
              );
            } else {
              // Fallback for invalid values
              ctx.fillStyle = star.color;
              ctx.beginPath();
              ctx.arc(x, y, size, 0, Math.PI * 2);
              ctx.fill();
            }
          } catch (error) {
            // Fallback if gradient creation fails
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Draw the star itself without glow
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Only move stars if animation is enabled
        if (animationSpeed > 0) {
          // Move star closer (z-axis)
          star.z -= animationSpeed;
          
          // Reset star if it passes the screen
          if (star.z < 0) {
            star.z = 1000;
            star.x = Math.random() * canvas.width - canvas.width / 2;
            star.y = Math.random() * canvas.height - canvas.height / 2;
          }
        }
      }
      
      ctx.restore();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, glowIntensity, animationSpeed]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default StarRendererCanvas; 