import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = 'Loading...' }: LoadingStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[200px]"
    >
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
    </motion.div>
  );
};

export default LoadingState; 