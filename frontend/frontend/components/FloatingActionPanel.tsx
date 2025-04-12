import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useRouter } from 'next/router';
import ThematicGlyph from './ThematicGlyph';

interface FloatingActionPanelProps {
  className?: string;
}

const FloatingActionPanel: React.FC<FloatingActionPanelProps> = ({ className = '' }) => {
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={`fixed right-8 top-24 z-[1000] ${className}`}
    >
      <motion.div
        className={`bg-gray-800/90 backdrop-blur-md rounded-xl border border-indigo-500/30
                   shadow-lg overflow-hidden transition-all duration-300
                   ${isMinimized ? 'w-12' : 'w-64'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: isDragging ? 1 : 1.02 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-indigo-600/20 border-b border-indigo-500/30">
          <div className="flex items-center space-x-2">
            <ThematicGlyph glyph="sigil-of-creation" size={20} effect="glow" />
            {!isMinimized && (
              <span className="text-sm font-medium text-gray-200">Actions</span>
            )}
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isMinimized ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4">
            <motion.button
              onClick={() => router.push('/dashboard/create')}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg 
                       hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl
                       flex items-center justify-center space-x-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ThematicGlyph 
                glyph="sigil-of-creation" 
                size={24} 
                effect="glow"
                className="group-hover:animate-spin-slow" 
              />
              <span className="text-lg">Create New Item</span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FloatingActionPanel; 