import React from 'react';
import { KeyMetrics } from '../types/invocation';

interface StatsWidgetProps {
  metrics: KeyMetrics;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ metrics }) => {
  const {
    total_keys,
    active_keys,
    expired_keys,
    revoked_keys,
    total_redemptions,
    glyph_match_failures,
    average_uses_per_key
  } = metrics;

  const glyphMatchRate = total_redemptions > 0
    ? ((total_redemptions - glyph_match_failures) / total_redemptions) * 100
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Key Statistics
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Keys
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {total_keys}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Active Keys
          </p>
          <p className="mt-1 text-2xl font-semibold text-green-700 dark:text-green-300">
            {active_keys}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Total Redemptions
          </p>
          <p className="mt-1 text-2xl font-semibold text-blue-700 dark:text-blue-300">
            {total_redemptions}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
            Glyph Match Rate
          </p>
          <p className="mt-1 text-2xl font-semibold text-purple-700 dark:text-purple-300">
            {glyphMatchRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Average Uses per Key
          </p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {average_uses_per_key.toFixed(1)}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Inactive Keys
          </p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {expired_keys + revoked_keys}
          </p>
        </div>
      </div>
    </div>
  );
}; 