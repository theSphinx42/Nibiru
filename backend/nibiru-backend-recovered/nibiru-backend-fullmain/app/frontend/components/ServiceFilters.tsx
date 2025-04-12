import React from 'react';
import { ServiceType } from '../types/remote_services';

interface ServiceFiltersProps {
  selectedType: ServiceType | null;
  onTypeChange: (type: ServiceType | null) => void;
  sortBy: 'price' | 'rating' | 'popularity';
  onSortChange: (sort: 'price' | 'rating' | 'popularity') => void;
}

export const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  selectedType,
  onTypeChange,
  sortBy,
  onSortChange
}) => {
  const serviceTypes = [
    { value: ServiceType.AI_TRAINING, label: 'AI Training', icon: '🤖' },
    { value: ServiceType.THREE_D_PRINTING, label: '3D Printing', icon: '🖨️' },
    { value: ServiceType.DEVELOPMENT_TOOLS, label: 'Development Tools', icon: '🛠️' }
  ];

  const sortOptions = [
    { value: 'price', label: 'Price: Low to High' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Service Type
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => onTypeChange(null)}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
              selectedType === null
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All Services
          </button>
          {serviceTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                selectedType === type.value
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sort By
        </h3>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value as typeof sortBy)}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                sortBy === option.value
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 