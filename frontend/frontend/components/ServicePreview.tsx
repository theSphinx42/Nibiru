import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceForm } from '../types';
import { formatPrice } from '../utils/format';

interface ServicePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: ServiceForm;
}

const ServicePreview = ({ isOpen, onClose, data }: ServicePreviewProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Preview Header */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
            <h3 className="text-xl font-bold">Service Preview</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Preview Content */}
          <div className="p-6 space-y-6">
            {/* Service Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
              {data.thumbnailUrl ? (
                <img
                  src={data.thumbnailUrl}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Service Title */}
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {data.title || 'Untitled Service'}
            </h2>

            {/* Price and Category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-green-400">
                  {formatPrice(data.price)}
                </span>
                <span className="text-gray-400">USD</span>
              </div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                {data.category || 'Uncategorized'}
              </span>
            </div>

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300">
                {data.description || 'No description provided'}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {data.tags.length === 0 && (
                <span className="text-sm text-gray-500">No tags added</span>
              )}
            </div>

            {/* Sample Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">0</div>
                <div className="text-sm text-gray-400">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">0</div>
                <div className="text-sm text-gray-400">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">New</div>
                <div className="text-sm text-gray-400">Status</div>
              </div>
            </div>
          </div>

          {/* Preview Footer */}
          <div className="border-t border-gray-700 p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Close Preview
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ServicePreview; 