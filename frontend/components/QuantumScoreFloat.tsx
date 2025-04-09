import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface QuantumScoreFloatProps {
  score: number;
}

const QuantumScoreFloat = ({ score }: QuantumScoreFloatProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setPosition(prev => ({
        x: prev.x,
        y: window.scrollY + 100
      }));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-24 right-8 z-50"
      drag
      dragConstraints={{
        top: 0,
        right: 0,
        bottom: window.innerHeight - 100,
        left: -window.innerWidth + 200
      }}
      style={{
        y: position.y
      }}
    >
      <motion.div
        className="group relative cursor-pointer"
        whileHover={{ scale: 1.05 }}
      >
        <div className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl border border-blue-500/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-3 h-3 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div>
              <div className="text-sm text-gray-400">Quantum Score</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {score}
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-300 whitespace-nowrap">
            Drag to reposition • Click to minimize
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 rounded-full text-gray-400 hover:text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  );
};

export default QuantumScoreFloat; 