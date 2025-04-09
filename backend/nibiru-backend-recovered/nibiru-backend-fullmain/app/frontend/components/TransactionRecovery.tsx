import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { validatePrivateKey } from '../utils/validators';

interface Transaction {
  id: number;
  network: string;
  token: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error_message: string | null;
  created_at: string;
  retry_count: number;
  last_retry_at: string | null;
  gas_price: number;
  gas_estimate: number;
  total_gas_cost: number;
}

interface NetworkHealth {
  network: string;
  is_synced: boolean;
  current_gas_price: number;
  block_number: number;
  block_timestamp: number;
  congestion_level: number;
  recommendation: string;
  pending_transactions: number;
  block_propagation_time: number;
  gas_price_history: Array<{
    timestamp: number;
    price: number;
  }>;
  optimal_retry_time: string;
}

interface TransactionRecoveryProps {
  userId: number;
}

type SortField = 'created_at' | 'amount' | 'retry_count' | 'error_message' | 'gas_price' | 'total_gas_cost';
type SortOrder = 'asc' | 'desc';

interface FilterOptions {
  status: string;
  network: string;
  token: string;
  dateRange: {
    start: string;
    end: string;
  };
}

const TransactionRecovery: React.FC<TransactionRecoveryProps> = ({ userId }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [privateKeyError, setPrivateKeyError] = useState<string>('');
  const [customGasPrice, setCustomGasPrice] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'failed',
    network: '',
    token: '',
    dateRange: {
      start: '',
      end: '',
    },
  });

  // Fetch failed transactions
  const { data: failedTransactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>(
    ['failed-transactions', userId],
    () => api.get(`/api/v1/payments/transactions?user_id=${userId}&status=failed`).then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch network health
  const { data: networkHealth, isLoading: isLoadingHealth } = useQuery<NetworkHealth[]>(
    ['network-health'],
    () => api.get('/api/v1/payments/networks/health').then(res => res.data),
    {
      refetchInterval: 15000, // Refresh every 15 seconds
    }
  );

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    if (!failedTransactions) return [];

    let filtered = [...failedTransactions];

    // Apply network filter
    if (filters.network) {
      filtered = filtered.filter(tx => tx.network === filters.network);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(tx => tx.status === filters.status);
    }

    // Apply token filter
    if (filters.token) {
      filtered = filtered.filter(tx => tx.token === filters.token);
    }

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.created_at);
        return txDate >= startDate && txDate <= endDate;
      });
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.id.toString().includes(query) ||
        tx.network.toLowerCase().includes(query) ||
        tx.token.toLowerCase().includes(query) ||
        (tx.error_message?.toLowerCase().includes(query) ?? false)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : 1;
      }
      return aValue > bValue ? -1 : 1;
    });

    return filtered;
  }, [failedTransactions, filters, searchQuery, sortField, sortOrder]);

  // Recover failed transactions
  const recoverTransactionsMutation = useMutation(
    async () => {
      if (!privateKey) {
        throw new Error('Private key is required');
      }

      const response = await api.post('/api/v1/payments/recover', {
        user_id: userId,
        private_key: privateKey,
        gas_price: customGasPrice ? parseFloat(customGasPrice) : undefined,
      });

      return response.data;
    }
  );

  // Retry single transaction
  const retryTransactionMutation = useMutation(
    async (transactionId: number) => {
      if (!privateKey) {
        throw new Error('Private key is required');
      }

      const response = await api.post(`/api/v1/payments/transactions/${transactionId}/retry`, {
        private_key: privateKey,
        gas_price: customGasPrice ? parseFloat(customGasPrice) : undefined,
      });

      return response.data;
    }
  );

  // Handle private key validation
  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrivateKey(value);
    
    if (value && !validatePrivateKey(value)) {
      setPrivateKeyError('Invalid private key format');
    } else {
      setPrivateKeyError('');
    }
  };

  // Toggle sort order
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (isLoadingTransactions || isLoadingHealth) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Transaction Recovery
        </h3>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          {/* Network Health */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Network Health
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {networkHealth?.map((health) => (
                <div
                  key={health.network}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {health.network.charAt(0).toUpperCase() + health.network.slice(1)}
                    </span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      health.is_synced
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    }`}>
                      {health.is_synced ? 'Synced' : 'Syncing'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Gas Price</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(health.current_gas_price)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Pending Transactions</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {health.pending_transactions}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Block Propagation</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {health.block_propagation_time}ms
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Congestion</span>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${health.congestion_level * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {Math.round(health.congestion_level * 100)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Optimal Retry Time</span>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {health.optimal_retry_time}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Recommendation</span>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {health.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Network
                </label>
                <select
                  value={filters.network}
                  onChange={(e) => setFilters({ ...filters, network: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">All Networks</option>
                  {networkHealth?.map((health) => (
                    <option key={health.network} value={health.network}>
                      {health.network.charAt(0).toUpperCase() + health.network.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort By
                </label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="created_at">Date</option>
                  <option value="amount">Amount</option>
                  <option value="retry_count">Retry Count</option>
                  <option value="error_message">Error</option>
                  <option value="gas_price">Gas Price</option>
                  <option value="total_gas_cost">Total Gas Cost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Search transactions..."
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Failed Transactions */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Failed Transactions
            </h4>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Transaction #{transaction.id}
                      </span>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Retries: {transaction.retry_count}
                      </span>
                      <button
                        onClick={() => retryTransactionMutation.mutate(transaction.id)}
                        disabled={!privateKey || retryTransactionMutation.isLoading || privateKeyError}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {retryTransactionMutation.isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          'Retry'
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Network</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.network}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(transaction.amount)} {transaction.token}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Gas Cost</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(transaction.total_gas_cost)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Error</span>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {transaction.error_message || 'Unknown error'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recovery Actions */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Recovery Actions
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Private Key
                </label>
                <input
                  type="password"
                  value={privateKey}
                  onChange={handlePrivateKeyChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                    privateKeyError ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your private key"
                />
                {privateKeyError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {privateKeyError}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Custom Gas Price (Optional)
                </label>
                <input
                  type="number"
                  value={customGasPrice}
                  onChange={(e) => setCustomGasPrice(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter custom gas price"
                />
              </div>
              <button
                onClick={() => recoverTransactionsMutation.mutate()}
                disabled={!privateKey || recoverTransactionsMutation.isLoading || privateKeyError}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {recoverTransactionsMutation.isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Recover All Failed Transactions'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionRecovery; 