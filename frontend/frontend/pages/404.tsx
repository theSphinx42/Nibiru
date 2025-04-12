import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import ThematicGlyph from '../components/ThematicGlyph';

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        className="text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ThematicGlyph
          glyph="saphira-was-here"
          size={200}
          effect="glow"
          description="Looks like you've wandered into uncharted territory"
        />

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-200">Page Not Found</h1>
          <p className="text-gray-400 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to another dimension.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <motion.button
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-300 hover:text-gray-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Go Back
          </motion.button>
          <motion.button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Return Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound; 