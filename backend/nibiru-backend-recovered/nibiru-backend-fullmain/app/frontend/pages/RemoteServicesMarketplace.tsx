import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ServiceType, ServiceStatus } from '../types/remote_services';
import { ServiceCard } from '../components/ServiceCard';
import { ServiceFilters } from '../components/ServiceFilters';
import { ServiceSearch } from '../components/ServiceSearch';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { api } from '../lib/api';

interface Service {
  id: number;
  name: string;
  description: string;
  service_type: ServiceType;
  status: ServiceStatus;
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
}

export const RemoteServicesMarketplace: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'popularity'>('price');

  const { data: services, isLoading, error } = useQuery<Service[]>({
    queryKey: ['services', selectedType, searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedType) params.append('service_type', selectedType);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort_by', sortBy);
      
      const response = await api.get(`/api/v1/services?${params}`);
      return response.data;
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load services" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Remote Services Marketplace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <ServiceFilters
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
        
        <div className="md:col-span-3">
          <ServiceSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search services..."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {services?.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={() => {/* Handle service selection */}}
              />
            ))}
          </div>
          
          {services?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No services found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 