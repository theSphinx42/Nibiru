import React from 'react';
import { ServiceType } from '../types/remote_services';
import { formatCurrency } from '../utils/format';

interface ServiceCardProps {
  service: {
    id: number;
    name: string;
    description: string;
    service_type: ServiceType;
    status: string;
    pricing: {
      hourly_rate: number;
      minimum_hours: number;
      maximum_hours: number;
    };
    metadata: {
      capabilities: string[];
      requirements: string[];
      supported_formats: string[];
    };
  };
  onSelect: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => {
  const getServiceTypeIcon = (type: ServiceType) => {
    switch (type) {
      case ServiceType.AI_TRAINING:
        return '🤖';
      case ServiceType.THREE_D_PRINTING:
        return '🖨️';
      case ServiceType.DEVELOPMENT_TOOLS:
        return '🛠️';
      default:
        return '📦';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{getServiceTypeIcon(service.service_type)}</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {service.name}
            </h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-sm ${
            service.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
          }`}>
            {service.status}
          </span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {service.description}
        </p>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Pricing
          </h4>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(service.pricing.hourly_rate)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">/hour</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Min: {service.pricing.minimum_hours}h, Max: {service.pricing.maximum_hours}h
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Capabilities
          </h4>
          <div className="flex flex-wrap gap-2">
            {service.metadata.capabilities.slice(0, 3).map((capability, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-sm"
              >
                {capability}
              </span>
            ))}
            {service.metadata.capabilities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full text-sm">
                +{service.metadata.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onSelect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}; 