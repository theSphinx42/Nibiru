import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

interface LoadingScreenProps {
  isLoading: boolean;
  text?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading,
  text = 'Loading...',
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm z-50"
        >
          <Logo
            variant="symbol"
            size={120}
            animate={true}
            className="mb-8"
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-blue-400 text-lg font-medium">{text}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 