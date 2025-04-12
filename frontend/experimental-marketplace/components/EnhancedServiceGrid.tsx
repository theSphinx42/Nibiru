import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedServiceCard from './EnhancedServiceCard';

export type GridLayout = 'standard' | 'compact' | 'featured';

interface EnhancedServiceGridProps {
  services: any[];
  isLoading?: boolean;
  error?: string | null;
  layout?: GridLayout;
  showTags?: boolean;
  showPricingTiers?: boolean;
  itemsPerRow?: number;
  onItemClick?: (serviceId: string) => void;
  emptyMessage?: string;
  featuredItem?: string; // ID of item to be featured at the top
}

export const EnhancedServiceGrid: React.FC<EnhancedServiceGridProps> = ({
  services,
  isLoading = false,
  error = null,
  layout = 'standard',
  showTags = true,
  showPricingTiers = false,
  itemsPerRow = 3,
  onItemClick,
  emptyMessage = 'No services found',
  featuredItem
}) => {
  if (error) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden bg-gray-800/30 animate-pulse">
            <div className="h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  // Determine featured service if specified
  const featuredService = featuredItem 
    ? services.find(service => service.id === featuredItem)
    : null;

  // Remove featured service from main list if present
  const mainServices = featuredService
    ? services.filter(service => service.id !== featuredItem)
    : services;

  // Determine grid columns based on layout and itemsPerRow
  let gridColumns = '';
  if (layout === 'compact') {
    switch(itemsPerRow) {
      case 2:
        gridColumns = 'grid-cols-1 sm:grid-cols-2';
        break;
      case 4:
        gridColumns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
        break;
      default: // 3 is default
        gridColumns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  } else {
    switch(itemsPerRow) {
      case 2:
        gridColumns = 'grid-cols-1 md:grid-cols-2';
        break;
      case 4:
        gridColumns = 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4';
        break;
      default: // 3 is default
        gridColumns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  }

  // Define gap size based on layout
  const gapSize = layout === 'compact' ? 'gap-4' : 'gap-6';

  return (
    <div className="w-full">
      {/* Featured Item */}
      {featuredService && (
        <div className="mb-8">
          <EnhancedServiceCard
            service={featuredService}
            layout="featured"
            showTags={showTags}
            showPricingTiers={showPricingTiers}
            onClick={() => onItemClick && onItemClick(featuredService.id)}
          />
        </div>
      )}
      
      {/* Main Grid */}
      <div className={`grid ${gridColumns} ${gapSize}`}>
        <AnimatePresence>
          {mainServices.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EnhancedServiceCard
                service={service}
                layout={layout}
                showTags={showTags}
                showPricingTiers={showPricingTiers}
                onClick={() => onItemClick && onItemClick(service.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedServiceGrid; 