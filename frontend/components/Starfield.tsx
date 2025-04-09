import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  twinkle: boolean;
  twinkleSpeed: number;
  opacity: number;
}

interface Supernova {
  x: number;
  y: number;
  size: number;
  opacity: number;
  colors: string[];
  growthRate: number;
  maxSize: number;
}

interface CosmicEffect {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  opacity: number;
  length: number;
}

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    // Star colors
    const starColors = [
      '#FFFFFF', // white
      '#FFE4B5', // moccasin
      '#87CEEB', // skyblue
      '#E6E6FA', // lavender
      '#FFA07A', // lightsalmon
    ];

    // Supernova color sets
    const novaColorSets = [
      ['#4299E1', '#3182CE', '#2B6CB0'], // Blue
      ['#9F7AEA', '#805AD5', '#6B46C1'], // Purple
      ['#F687B3', '#D53F8C', '#B83280'], // Pink
    ];

    // Create stars
    const stars: Star[] = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1000,
      size: Math.random() * 2 + 0.5,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      twinkle: Math.random() > 0.7,
      twinkleSpeed: Math.random() * 0.05 + 0.02,
      opacity: Math.random()
    }));

    // Create supernovas array
    const supernovas: Supernova[] = [];

    // Create a new supernova
    const createSupernova = () => {
      const colorSet = novaColorSets[Math.floor(Math.random() * novaColorSets.length)];
      supernovas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0,
        opacity: 1,
        colors: colorSet,
        growthRate: Math.random() * 0.5 + 0.2,
        maxSize: Math.random() * 100 + 50
      });
    };

    // Create cosmic effects (swooshes)
    const cosmicEffects: CosmicEffect[] = [];
    const createCosmicEffect = () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      cosmicEffects.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        color: `hsla(${Math.random() * 60 + 200}, 100%, 70%, 0.1)`,
        opacity: 0.1,
        length: Math.random() * 100 + 50
      });
    };

    // Animation loop
    let lastSupernovaTime = 0;
    let lastEffectTime = 0;
    
    const animate = (timestamp: number) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create new effects periodically
      if (timestamp - lastSupernovaTime > 5000) { // Every 5 seconds
        createSupernova();
        lastSupernovaTime = timestamp;
      }
      if (timestamp - lastEffectTime > 2000) { // Every 2 seconds
        createCosmicEffect();
        lastEffectTime = timestamp;
      }

      // Update and draw stars
      stars.forEach(star => {
        star.z -= 0.1;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }

        const x = (star.x - canvas.width / 2) * (1000 / star.z) + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * (1000 / star.z) + canvas.height / 2;

        if (star.twinkle) {
          star.opacity = Math.sin(timestamp * star.twinkleSpeed) * 0.5 + 0.5;
        }

        // Draw star glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 2);
        gradient.addColorStop(0, star.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.arc(x, y, star.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw star core
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw supernovas
      for (let i = supernovas.length - 1; i >= 0; i--) {
        const nova = supernovas[i];
        nova.size += nova.growthRate;
        nova.opacity -= 0.005;

        if (nova.opacity <= 0 || nova.size >= nova.maxSize) {
          supernovas.splice(i, 1);
          continue;
        }

        // Draw multiple rings with different colors
        nova.colors.forEach((color, index) => {
          const ringSize = nova.size * (1 - index * 0.2);
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = nova.opacity;
          ctx.arc(nova.x, nova.y, ringSize, 0, Math.PI * 2);
          ctx.stroke();
        });
        
        ctx.globalAlpha = 1;
      }

      // Update and draw cosmic effects
      for (let i = cosmicEffects.length - 1; i >= 0; i--) {
        const effect = cosmicEffects[i];
        effect.x += effect.dx;
        effect.y += effect.dy;
        effect.opacity -= 0.001;

        if (effect.opacity <= 0 || 
            effect.x < 0 || effect.x > canvas.width || 
            effect.y < 0 || effect.y > canvas.height) {
          cosmicEffects.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 2;
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(effect.x - effect.dx * effect.length, 
                  effect.y - effect.dy * effect.length);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-background">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          background: 'linear-gradient(to bottom, #0B1121, #000000)'
        }}
      />
    </div>
  );
};

export default Starfield; 