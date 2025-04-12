import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { formatPrice, formatNumber } from '../../utils/format';
import { FiDownload, FiStar, FiShield, FiTag } from 'react-icons/fi';
import Image from 'next/image';
import ItemGlyph from '../../components/ItemGlyph';

interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
}

interface EnhancedServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string;
    short_description?: string;
    price?: number;
    pricing?: {
      model: string;
      base_price: number;
      suggested_tiers?: PricingTier[];
    };
    category: string;
    downloads: number;
    rating?: number;
    quantumTier?: number;
    logo?: string;
    tags?: string[];
    assets?: {
      glyph?: {
        id: string;
        path: string;
        meaning: string;
        resonance: number;
      };
      visuals?: {
        logo?: string;
        banner?: string;
        theme?: {
          colors: {
            primary: string;
            secondary: string;
            accent: string;
            background: string;
          };
        };
      };
    };
  };
  className?: string;
  onClick?: () => void;
  layout?: 'compact' | 'standard' | 'featured';
  showTags?: boolean;
  showPricingTiers?: boolean;
}

const EnhancedServiceCard: React.FC<EnhancedServiceCardProps> = ({
  service,
  className = '',
  onClick,
  layout = 'standard',
  showTags = true,
  showPricingTiers = false
}) => {
  const router = useRouter();
  const isBeer = service.category.toLowerCase() === 'beer';
  const isQuantum = service.category.toLowerCase() === 'quantum' || 
                    (service.tags && service.tags.includes('quantum'));
  
  // Map quantum tier to complexity for the glyph
  const getComplexity = () => {
    if (!service.quantumTier) return 0.5; // Default
    return Math.min(0.85, 0.4 + (service.quantumTier / 10)); // Range from 0.4 to 0.85
  };
  
  // Get resonance value if available
  const getResonance = () => {
    if (service.assets?.glyph?.resonance) {
      return service.assets.glyph.resonance;
    }
    return service.quantumTier ? service.quantumTier / 10 : 0.5;
  };
  
  // Generate colors based on service properties
  const getGlyphColors = () => {
    // Custom colors from assets if available
    if (service.assets?.visuals?.theme?.colors) {
      const colors = service.assets.visuals.theme.colors;
      return {
        primary: colors.primary,
        secondary: colors.accent || colors.secondary
      };
    }
    
    // Beer gets amber/gold colors
    if (isBeer) {
      return {
        primary: '#f59e0b', // Amber
        secondary: '#fbbf24' // Light amber
      };
    }
    
    // Quantum gets purples
    if (isQuantum) {
      return {
        primary: '#8b5cf6', // Purple
        secondary: '#c4b5fd' // Light purple
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

  // Get the price to display
  const getDisplayPrice = () => {
    if (service.pricing?.model === 'pay-what-you-want') {
      return 'Pay What You Want';
    } else if (service.pricing?.model === 'free') {
      return 'Free';
    } else if (service.pricing?.suggested_tiers && service.pricing.suggested_tiers.length > 0) {
      const lowestTier = service.pricing.suggested_tiers.reduce(
        (min, tier) => (tier.price < min.price ? tier : min),
        service.pricing.suggested_tiers[0]
      );
      return lowestTier.price === 0 ? 'Free' : `From ${formatPrice(lowestTier.price)}`;
    } else if (service.price !== undefined) {
      return formatPrice(service.price);
    } else if (service.pricing?.base_price !== undefined) {
      return formatPrice(service.pricing.base_price);
    }
    
    return 'Price unavailable';
  };

  // Define card styling based on service properties
  let cardStyle = 'bg-gray-900/30 border-gray-800/50 hover:bg-indigo-900/20';
  let categoryBadgeStyle = 'bg-indigo-900/60 text-indigo-200';
  
  if (isBeer) {
    cardStyle = 'bg-amber-950/30 border-amber-900/50 hover:bg-amber-950/40';
    categoryBadgeStyle = 'bg-amber-900/60 text-amber-200';
  } else if (isQuantum) {
    cardStyle = 'bg-purple-950/30 border-purple-900/50 hover:bg-purple-900/20';
    categoryBadgeStyle = 'bg-purple-900/60 text-purple-200';
  }
    
  // Get colors for the glyph
  const glyphColors = getGlyphColors();
  
  // For featured layout
  if (layout === 'featured') {
    return (
      <motion.div
        className={`rounded-lg overflow-hidden shadow-xl border ${cardStyle} transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/30 cursor-pointer group ${className}`}
        onClick={handleCardClick}
        whileHover={{ y: -5 }}
      >
        <div className="relative">
          {/* Banner image if available */}
          <div className="h-40 bg-gradient-to-r from-gray-900 to-indigo-900 relative overflow-hidden">
            {service.assets?.visuals?.banner && (
              <Image
                src={service.assets.visuals.banner}
                alt={service.name}
                fill
                className="object-cover opacity-70"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
            
            {/* Logo or glyph */}
            <div className="absolute bottom-0 right-0 p-4">
              <div className="w-20 h-20 relative">
                {service.assets?.visuals?.logo ? (
                  <Image
                    src={service.assets.visuals.logo}
                    alt={service.name}
                    width={80}
                    height={80}
                    className="rounded-lg shadow-lg"
                  />
                ) : (
                  <ItemGlyph
                    itemId={service.id}
                    itemName={service.name}
                    complexity={getComplexity()}
                    color={glyphColors.primary}
                    secondaryColor={glyphColors.secondary}
                    size={80}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col space-y-4">
            <div>
              <span className={`inline-block px-2.5 py-1 text-xs rounded-full ${categoryBadgeStyle} mb-2`}>
                {service.category}
              </span>
              <h3 className="text-2xl font-semibold text-gray-100 group-hover:text-indigo-300 transition-colors">
                {service.name}
              </h3>
              <p className="text-gray-400 mt-2">
                {service.short_description || service.description}
              </p>
            </div>
            
            {/* Tags */}
            {showTags && service.tags && service.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {service.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full">
                    {tag}
                  </span>
                ))}
                {service.tags.length > 4 && (
                  <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full">
                    +{service.tags.length - 4} more
                  </span>
                )}
              </div>
            )}
            
            {/* Pricing tiers preview */}
            {showPricingTiers && service.pricing?.suggested_tiers && service.pricing.suggested_tiers.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Pricing Options:</h4>
                <div className="space-y-1">
                  {service.pricing.suggested_tiers.slice(0, 2).map(tier => (
                    <div key={tier.name} className="flex justify-between text-sm">
                      <span className="text-gray-400">{tier.name}</span>
                      <span className="font-medium text-gray-200">
                        {tier.price === 0 ? 'Free' : formatPrice(tier.price)}
                      </span>
                    </div>
                  ))}
                  {service.pricing.suggested_tiers.length > 2 && (
                    <div className="text-xs text-gray-500 text-right mt-1">
                      +{service.pricing.suggested_tiers.length - 2} more options
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-gray-400 pt-4 border-t border-gray-800/50">
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
                
                {service.assets?.glyph?.resonance && (
                  <div className="flex items-center">
                    <FiShield className="mr-1 text-sm text-violet-400" />
                    <span>{(service.assets.glyph.resonance * 10).toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              <div className="font-semibold text-white">
                {getDisplayPrice()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // For compact layout
  if (layout === 'compact') {
    return (
      <motion.div
        className={`rounded-lg overflow-hidden shadow-md border ${cardStyle} transition-all duration-300 hover:shadow-xl hover:border-indigo-500/30 cursor-pointer group ${className}`}
        onClick={handleCardClick}
        whileHover={{ y: -3 }}
      >
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${categoryBadgeStyle} mb-1`}>
                {service.category}
              </span>
              <h3 className="text-base font-medium text-gray-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                {service.name}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                {service.short_description || service.description}
              </p>
            </div>
            
            <div className="ml-3">
              <div className="relative w-10 h-10 overflow-hidden">
                <ItemGlyph
                  itemId={service.id}
                  itemName={service.name}
                  complexity={getComplexity()}
                  color={glyphColors.primary}
                  secondaryColor={glyphColors.secondary}
                  size={40}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-gray-400 mt-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <FiDownload className="mr-0.5 text-xs" />
                <span>{formatNumber(service.downloads)}</span>
              </div>
              
              {service.rating && (
                <div className="flex items-center">
                  <FiStar className="mr-0.5 text-xs text-amber-400" />
                  <span>{service.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            <div className="font-medium text-white text-xs">
              {getDisplayPrice()}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Standard layout (default)
  return (
    <motion.div
      className={`rounded-lg overflow-hidden shadow-xl border ${cardStyle} transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/30 cursor-pointer group ${className}`}
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
            <p className="text-gray-400 line-clamp-2 mt-1">
              {service.short_description || service.description}
            </p>
          </div>
          
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

        {/* Tags */}
        {showTags && service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {service.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-gray-800 text-gray-300 rounded-full">
                {tag}
              </span>
            ))}
            {service.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-gray-800 text-gray-300 rounded-full">
                +{service.tags.length - 3}
              </span>
            )}
          </div>
        )}

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
            
            {service.assets?.glyph?.resonance && (
              <div className="flex items-center">
                <FiShield className="mr-1 text-sm text-violet-400" />
                <span>{(service.assets.glyph.resonance * 10).toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="font-semibold text-white">
            {getDisplayPrice()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedServiceCard; 