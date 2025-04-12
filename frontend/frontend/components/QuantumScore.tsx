import { motion } from 'framer-motion';

interface QuantumScoreProps {
  score?: number;
}

const QuantumScore = ({ score = 0 }: QuantumScoreProps) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group"
    >
      <div className="px-4 py-2 bg-blue-500/20 rounded-lg flex items-center space-x-2">
        <span className="text-sm text-gray-400">Quantum Score:</span>
        <motion.span
          initial={{ color: '#60A5FA' }}
          animate={{ color: '#93C5FD' }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          className="font-bold text-blue-400"
        >
          {(score || 0).toLocaleString()}
        </motion.span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-300 whitespace-nowrap">
          Your quantum influence level
        </div>
      </div>
    </motion.div>
  );
};

export default QuantumScore; 