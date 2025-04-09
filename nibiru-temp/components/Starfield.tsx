import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  px?: number;
  py?: number;
}

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStars = () => {
      const stars: Star[] = [];
      for (let i = 0; i < 1000; i++) {
        stars.push({
          x: Math.random() * 2000 - 1000,
          y: Math.random() * 2000 - 1000,
          z: Math.random() * 2000,
        });
      }
      starsRef.current = stars;
    };

    const moveStars = () => {
      const stars = starsRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.fillStyle = 'rgb(17, 24, 39)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.z -= 10;
        if (star.z <= 0) {
          star.z = 2000;
          star.x = Math.random() * 2000 - 1000;
          star.y = Math.random() * 2000 - 1000;
        }

        const x = (star.x / star.z) * 500 + centerX;
        const y = (star.y / star.z) * 500 + centerY;
        const size = (1 - star.z / 2000) * 3;

        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
          const opacity = 1 - star.z / 2000;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          if (star.px !== undefined && star.py !== undefined) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
            ctx.moveTo(star.px, star.py);
            ctx.lineTo(x, y);
            ctx.stroke();
          }

          star.px = x;
          star.py = y;
        }
      });

      frameRef.current = requestAnimationFrame(moveStars);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initStars();
    moveStars();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

export default Starfield; 