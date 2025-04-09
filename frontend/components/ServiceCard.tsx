import React from 'react';
import { motion } from 'framer-motion';
import { Service } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdvertiserGlyph from './AdvertiserGlyph';
import { calculateEvolution } from '../utils/glyphEvolution';
import { formatPrice, formatNumber } from '../utils/format';
import { FiDownload, FiStar } from 'react-icons/fi';
import Image from 'next/image';
import ItemGlyph from './ItemGlyph';

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    downloads: number;
    rating?: number;
    quantumTier?: number;
    logo?: string;
  };
  className?: string;
  onClick?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  className = '',
  onClick
}) => {
  const router = useRouter();
  const isBeer = service.category.toLowerCase() === 'beer';
  
  // Map quantum tier to complexity for the glyph
  const getComplexity = () => {
    if (!service.quantumTier) return 0.5; // Default
    return Math.min(0.85, 0.4 + (service.quantumTier / 10)); // Range from 0.4 to 0.85
  };
  
  // Generate colors based on service properties
  const getGlyphColors = () => {
    // Beer gets amber/gold colors
    if (isBeer) {
      return {
        primary: '#f59e0b', // Amber
        secondary: '#fbbf24' // Light amber
      };
    }
    
    // Otherwise base on category
    const categoryHash = service.category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use different color palettes based on hash
    const colorOptions = [
      { primary: '#6366f1', secondary: '#a5b4fc' }, // Indigo
      { primary: '#8b5cf6', secondary: '#c4b5fd' }, // Violet
      { primary: '#ec4899', secondary: '#f9a8d4' }, // Pink
      { primary: '#14b8a6', secondary: '#5eead4' }, // Teal
      { primary: '#06b6d4', secondary: '#67e8f9' }, // Cyan
    ];
    
    return colorOptions[categoryHash % colorOptions.length];
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/listings/${service.id}`);
    }
  };

  // Define card styling based on service properties
  const cardStyle = isBeer
    ? 'bg-amber-950/30 border-amber-900/50 hover:bg-amber-950/40'
    : 'bg-gray-900/30 border-gray-800/50 hover:bg-indigo-900/20';

  const categoryBadgeStyle = isBeer
    ? 'bg-amber-900/60 text-amber-200'
    : 'bg-indigo-900/60 text-indigo-200';
    
  // Get colors for the glyph
  const glyphColors = getGlyphColors();

  return (
    <motion.div
      className={`rounded-lg overflow-hidden shadow-xl border ${cardStyle} transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/30 cursor-pointer group`}
      onClick={handleCardClick}
      whileHover={{ y: -5 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <span className={`inline-block px-2.5 py-1 text-xs rounded-full ${categoryBadgeStyle} mb-2`}>
              {service.category}
            </span>
            <h3 className="text-xl font-semibold text-gray-100 group-hover:text-indigo-300 transition-colors">
              {service.name}
            </h3>
            <p className="text-gray-400 line-clamp-2 mt-1">{service.description}</p>
          </div>
          
          {/* Replace ThematicGlyph with ItemGlyph */}
          <div className="ml-4">
            <div className="relative w-16 h-16 overflow-hidden">
              <ItemGlyph
                itemId={service.id}
                itemName={service.name}
                complexity={getComplexity()}
                color={glyphColors.primary}
                secondaryColor={glyphColors.secondary}
                size={64}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-gray-400 mt-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <FiDownload className="mr-1 text-sm" />
              <span>{formatNumber(service.downloads)}</span>
            </div>
            
            {service.rating && (
              <div className="flex items-center">
                <FiStar className="mr-1 text-sm text-amber-400" />
                <span>{service.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="font-semibold text-white">
            {formatPrice(service.price)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard; 