import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Transaction {
  id: number;
  network: string;
  token: string;
  amount: number;
  total_gas_cost: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
}

interface TransactionAnalyticsChartsProps {
  userId: number;
}

const TransactionAnalyticsCharts: React.FC<TransactionAnalyticsChartsProps> = ({ userId }) => {
  const { data: transactions, isLoading } = useQuery<Transaction[]>(
    ['transactions', userId],
    () => api.get(`/api/v1/payments/transactions?user_id=${userId}`).then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const analytics = useMemo(() => {
    if (!transactions) return null;

    // Group transactions by month
    const monthlyData = transactions.reduce((acc, tx) => {
      const date = new Date(tx.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          count: 0,
          total: 0,
          gas: 0,
        };
      }
      
      acc[monthKey].count++;
      acc[monthKey].total += tx.amount;
      acc[monthKey].gas += tx.total_gas_cost;
      
      return acc;
    }, {} as Record<string, { count: number; total: number; gas: number }>);

    // Group transactions by network
    const networkData = transactions.reduce((acc, tx) => {
      if (!acc[tx.network]) {
        acc[tx.network] = {
          count: 0,
          total: 0,
          gas: 0,
        };
      }
      
      acc[tx.network].count++;
      acc[tx.network].total += tx.amount;
      acc[tx.network].gas += tx.total_gas_cost;
      
      return acc;
    }, {} as Record<string, { count: number; total: number; gas: number }>);

    // Group transactions by token
    const tokenData = transactions.reduce((acc, tx) => {
      if (!acc[tx.token]) {
        acc[tx.token] = 0;
      }
      acc[tx.token] += tx.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      monthlyData,
      networkData,
      tokenData,
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Prepare data for charts
  const monthlyLabels = Object.keys(analytics.monthlyData).sort();
  const monthlyCounts = monthlyLabels.map(month => analytics.monthlyData[month].count);
  const monthlyTotals = monthlyLabels.map(month => analytics.monthlyData[month].total);
  const monthlyGas = monthlyLabels.map(month => analytics.monthlyData[month].gas);

  const networkLabels = Object.keys(analytics.networkData);
  const networkCounts = networkLabels.map(network => analytics.networkData[network].count);
  const networkTotals = networkLabels.map(network => analytics.networkData[network].total);

  const tokenLabels = Object.keys(analytics.tokenData);
  const tokenValues = tokenLabels.map(token => analytics.tokenData[token]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Transaction Analytics
        </h3>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Monthly Transaction Volume */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                Monthly Transaction Volume
              </h4>
              <Line
                data={{
                  labels: monthlyLabels,
                  datasets: [
                    {
                      label: 'Transaction Count',
                      data: monthlyCounts,
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.5)',
                      tension: 0.1,
                    },
                    {
                      label: 'Total Amount',
                      data: monthlyTotals,
                      borderColor: 'rgb(16, 185, 129)',
                      backgroundColor: 'rgba(16, 185, 129, 0.5)',
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>

            {/* Network Usage */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                Network Usage
              </h4>
              <Bar
                data={{
                  labels: networkLabels,
                  datasets: [
                    {
                      label: 'Transaction Count',
                      data: networkCounts,
                      backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    },
                    {
                      label: 'Total Amount',
                      data: networkTotals,
                      backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>

            {/* Token Distribution */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                Token Distribution
              </h4>
              <Pie
                data={{
                  labels: tokenLabels,
                  datasets: [
                    {
                      data: tokenValues,
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.5)',
                        'rgba(16, 185, 129, 0.5)',
                        'rgba(245, 158, 11, 0.5)',
                        'rgba(239, 68, 68, 0.5)',
                        'rgba(139, 92, 246, 0.5)',
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                    },
                  },
                }}
              />
            </div>

            {/* Gas Costs Over Time */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                Gas Costs Over Time
              </h4>
              <Line
                data={{
                  labels: monthlyLabels,
                  datasets: [
                    {
                      label: 'Gas Costs',
                      data: monthlyGas,
                      borderColor: 'rgb(245, 158, 11)',
                      backgroundColor: 'rgba(245, 158, 11, 0.5)',
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => formatCurrency(value as number),
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionAnalyticsCharts; 