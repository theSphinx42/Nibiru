import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';

interface SigilQRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

const SigilQRCode = ({
  value,
  size = 200,
  color = '#4F46E5',
  backgroundColor = '#1F2937',
  className = '',
}: SigilQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: color,
          light: backgroundColor,
        },
        errorCorrectionLevel: 'H',
      },
      (error) => {
        if (error) console.error('Error generating QR code:', error);
      }
    );
  }, [value, size, color, backgroundColor]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${className}`}
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="rounded-lg shadow-lg"
        />
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `radial-gradient(circle at center, transparent 60%, ${backgroundColor} 100%)`,
          }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/3 h-1/3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm" />
      </div>
    </motion.div>
  );
};

export default SigilQRCode; 