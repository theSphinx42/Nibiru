import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

interface NetworkStatus {
  network: string;
  name: string;
  gas_price: number;
  block_number: number;
  is_synced: boolean;
  supported_tokens: string[];
}

const NetworkStatus: React.FC = () => {
  const { data: networks, isLoading } = useQuery<NetworkStatus[]>(
    ['networks'],
    () => api.get('/api/v1/payments/networks').then(res => res.data),
    {
      refetchInterval: 15000, // Refresh every 15 seconds
    }
  );

  const getStatusColor = (isSynced: boolean) => {
    return isSynced
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Network Status
        </h3>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
          {networks?.map((network) => (
            <div
              key={network.network}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {network.name}
                </h4>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    network.is_synced
                  )}`}
                >
                  {network.is_synced ? 'Up' : 'Down'}
                </span>
              </div>
              
              <div className="mt-2 space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Gas Price: {network.gas_price} Gwei
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Block: {network.block_number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Supported Tokens: {network.supported_tokens.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus; 