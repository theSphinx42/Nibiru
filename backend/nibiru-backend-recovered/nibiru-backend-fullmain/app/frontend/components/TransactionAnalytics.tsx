import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface Transaction {
  id: number;
  network: string;
  token: string;
  amount: number;
  total_gas_cost: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
}

interface TransactionAnalyticsProps {
  userId: number;
}

const TransactionAnalytics: React.FC<TransactionAnalyticsProps> = ({ userId }) => {
  const { data: transactions, isLoading } = useQuery<Transaction[]>(
    ['transactions', userId],
    () => api.get(`/api/v1/payments/transactions?user_id=${userId}`).then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const analytics = useMemo(() => {
    if (!transactions) return null;

    const completedTransactions = transactions.filter(tx => tx.status === 'completed');
    const failedTransactions = transactions.filter(tx => tx.status === 'failed');
    const pendingTransactions = transactions.filter(tx => tx.status === 'pending');

    // Calculate total amounts by token
    const amountsByToken = completedTransactions.reduce((acc, tx) => {
      acc[tx.token] = (acc[tx.token] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total gas fees by network
    const gasFeesByNetwork = completedTransactions.reduce((acc, tx) => {
      acc[tx.network] = (acc[tx.network] || 0) + tx.total_gas_cost;
      return acc;
    }, {} as Record<string, number>);

    // Calculate success rate
    const successRate = (completedTransactions.length / transactions.length) * 100;

    // Calculate average transaction amount
    const avgAmount = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0) / completedTransactions.length;

    // Calculate average gas fee
    const avgGasFee = completedTransactions.reduce((sum, tx) => sum + tx.total_gas_cost, 0) / completedTransactions.length;

    return {
      totalTransactions: transactions.length,
      completedTransactions: completedTransactions.length,
      failedTransactions: failedTransactions.length,
      pendingTransactions: pendingTransactions.length,
      successRate,
      avgAmount,
      avgGasFee,
      amountsByToken,
      gasFeesByNetwork,
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

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Transaction Analytics
        </h3>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4">
          {/* Transaction Counts */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</h4>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {analytics.totalTransactions}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</h4>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {analytics.successRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Amount</h4>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(analytics.avgAmount)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Gas Fee</h4>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(analytics.avgGasFee)}
            </p>
          </div>
        </div>

        {/* Token Distribution */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Amount by Token</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(analytics.amountsByToken).map(([token, amount]) => (
              <div key={token} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{token}</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(amount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Gas Fees by Network */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Gas Fees by Network</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(analytics.gasFeesByNetwork).map(([network, fee]) => (
              <div key={network} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{network}</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(fee)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Status Distribution */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Transaction Status</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-3">
              <span className="text-sm font-medium text-green-800 dark:text-green-100">Completed</span>
              <p className="text-lg font-semibold text-green-800 dark:text-green-100">
                {analytics.completedTransactions}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-3">
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-100">Pending</span>
              <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-100">
                {analytics.pendingTransactions}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900 rounded-lg p-3">
              <span className="text-sm font-medium text-red-800 dark:text-red-100">Failed</span>
              <p className="text-lg font-semibold text-red-800 dark:text-red-100">
                {analytics.failedTransactions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionAnalytics; 