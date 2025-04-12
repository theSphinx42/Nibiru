import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface BridgeStatus {
  from_network: string;
  to_network: string;
  is_active: boolean;
  daily_limit: number;
  total_locked: number;
}

interface GasEstimate {
  gas_estimate: number;
  gas_price: number;
  total_gas_cost: number;
  from_network: string;
  to_network: string;
  token: string;
}

interface CrossChainTransferProps {
  userId: number;
}

const CrossChainTransfer: React.FC<CrossChainTransferProps> = ({ userId }) => {
  const [fromNetwork, setFromNetwork] = useState<string>('');
  const [toNetwork, setToNetwork] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);

  // Fetch supported bridges
  const { data: bridges, isLoading: isLoadingBridges } = useQuery<BridgeStatus[]>(
    ['bridges'],
    () => api.get('/api/v1/payments/bridges').then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Get available networks based on selected from network
  const availableNetworks = bridges
    ?.filter(bridge => bridge.from_network === fromNetwork && bridge.is_active)
    .map(bridge => bridge.to_network) || [];

  // Get available tokens based on selected networks
  const availableTokens = ['USDC', 'USDT', 'WETH']; // This should come from your backend

  // Estimate gas fee
  const estimateGasMutation = useMutation(
    async () => {
      if (!fromNetwork || !toNetwork || !token || !amount || !walletAddress) {
        throw new Error('Missing required fields');
      }

      const response = await api.post('/api/v1/payments/estimate-cross-chain-gas', {
        from_network: fromNetwork,
        to_network: toNetwork,
        token,
        amount: parseFloat(amount),
        from_address: walletAddress,
      });

      return response.data;
    },
    {
      onSuccess: (data) => {
        setGasEstimate(data);
      },
    }
  );

  // Create cross-chain transaction
  const createTransactionMutation = useMutation(
    async () => {
      if (!fromNetwork || !toNetwork || !token || !amount || !walletAddress) {
        throw new Error('Missing required fields');
      }

      const response = await api.post('/api/v1/payments/cross-chain', {
        from_network: fromNetwork,
        to_network: toNetwork,
        token,
        amount: parseFloat(amount),
        from_address: walletAddress,
        user_id: userId,
      });

      return response.data;
    }
  );

  // Handle amount change
  useEffect(() => {
    if (fromNetwork && toNetwork && token && amount && walletAddress) {
      estimateGasMutation.mutate();
    }
  }, [fromNetwork, toNetwork, token, amount, walletAddress]);

  if (isLoadingBridges) {
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
          Cross-Chain Transfer
        </h3>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* From Network */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                From Network
              </label>
              <select
                value={fromNetwork}
                onChange={(e) => setFromNetwork(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Select Network</option>
                {bridges?.map((bridge) => (
                  <option key={bridge.from_network} value={bridge.from_network}>
                    {bridge.from_network.charAt(0).toUpperCase() + bridge.from_network.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* To Network */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                To Network
              </label>
              <select
                value={toNetwork}
                onChange={(e) => setToNetwork(e.target.value)}
                disabled={!fromNetwork}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
              >
                <option value="">Select Network</option>
                {availableNetworks.map((network) => (
                  <option key={network} value={network}>
                    {network.charAt(0).toUpperCase() + network.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Token
              </label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={!fromNetwork || !toNetwork}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
              >
                <option value="">Select Token</option>
                {availableTokens.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!token}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
                placeholder="0.00"
                min="0"
                step="0.000001"
              />
            </div>

            {/* Wallet Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="0x..."
              />
            </div>

            {/* Gas Estimate */}
            {gasEstimate && (
              <div className="sm:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Estimated Gas Fee
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Gas Estimate</span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {gasEstimate.gas_estimate}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Gas Price</span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(gasEstimate.gas_price)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Cost</span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(gasEstimate.total_gas_cost)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bridge Status */}
            {fromNetwork && toNetwork && (
              <div className="sm:col-span-2">
                {bridges?.map((bridge) => (
                  bridge.from_network === fromNetwork && bridge.to_network === toNetwork && (
                    <div key={`${bridge.from_network}-${bridge.to_network}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Bridge Status
                        </h4>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bridge.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        }`}>
                          {bridge.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Daily Limit</span>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(bridge.daily_limit)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Total Locked</span>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(bridge.total_locked)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <button
                onClick={() => createTransactionMutation.mutate()}
                disabled={!fromNetwork || !toNetwork || !token || !amount || !walletAddress || !gasEstimate}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createTransactionMutation.isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Transfer'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossChainTransfer; 