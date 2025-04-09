import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { mockMetrics } from '../utils/mockData';

interface QuantumMetric {
  label: string;
  value: number;
  color: string;
}

interface QuantumBreakdownProps {
  userId: string;
}

const QuantumBreakdown = ({ userId }: QuantumBreakdownProps) => {
  const [metrics, setMetrics] = useState<QuantumMetric[]>([
    {
      label: 'Weekly Views',
      value: mockMetrics.weekly.views,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Monthly Interactions',
      value: mockMetrics.monthly.interactions,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Quarterly Conversions',
      value: mockMetrics.quarterly.conversions,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Yearly Revenue',
      value: mockMetrics.yearly.revenue / 1000, // Convert to thousands
      color: 'from-yellow-500 to-yellow-600',
    },
  ]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">{metric.label}</span>
              <span className="text-sm font-medium text-white">
                {metric.value.toLocaleString()}
                {metric.label.includes('Revenue') && 'K'}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(metric.value / 100, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${metric.color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="text-center">
          <div className="text-sm text-gray-400">User Engagement</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {(mockMetrics.weekly.engagement * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumBreakdown; 