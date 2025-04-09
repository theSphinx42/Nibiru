import { motion } from 'framer-motion';

const SkeletonCard = () => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
      {/* Image Skeleton */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-700/50 animate-pulse" />
      
      <div className="p-6">
        {/* Title Skeleton */}
        <div className="h-7 bg-gray-700/50 rounded-md animate-pulse mb-2" />
        
        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-700/50 rounded-md animate-pulse w-full" />
          <div className="h-4 bg-gray-700/50 rounded-md animate-pulse w-3/4" />
        </div>
        
        {/* Stats Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-700/50 rounded-full animate-pulse" />
            <div className="w-12 h-4 bg-gray-700/50 rounded-md animate-pulse" />
          </div>
          <div className="w-16 h-6 bg-gray-700/50 rounded-md animate-pulse" />
        </div>
        
        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-2">
          <div className="w-16 h-6 bg-gray-700/50 rounded-full animate-pulse" />
          <div className="w-20 h-6 bg-gray-700/50 rounded-full animate-pulse" />
          <div className="w-14 h-6 bg-gray-700/50 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard; 