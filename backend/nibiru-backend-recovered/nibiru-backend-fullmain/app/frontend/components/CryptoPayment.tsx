import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface NetworkStatus {
  network: string;
  name: string;
  gas_price: number;
  block_number: number;
  is_synced: boolean;
  supported_tokens: string[];
}

interface GasEstimate {
  gas_estimate: number;
  gas_price: number;
  total_gas_cost: number;
  network: string;
  token: string;
}

interface CryptoPaymentProps {
  amount: number;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('polygon');
  const [selectedToken, setSelectedToken] = useState<string>('USDC');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);

  // Fetch supported networks
  const { data: networks, isLoading: networksLoading } = useQuery<NetworkStatus[]>(
    ['networks'],
    () => api.get('/api/v1/payments/networks').then(res => res.data)
  );

  // Fetch gas estimate
  const { data: estimate, isLoading: estimateLoading } = useQuery<GasEstimate>(
    ['gasEstimate', selectedNetwork, selectedToken, walletAddress],
    () => api.post('/api/v1/payments/estimate-gas', {
      network: selectedNetwork,
      token: selectedToken,
      amount,
      from_address: walletAddress,
    }).then(res => res.data),
    {
      enabled: !!walletAddress,
    }
  );

  // Create transaction mutation
  const createTransaction = useMutation(
    (data: {
      network: string;
      token: string;
      amount: number;
      from_address: string;
    }) => api.post('/api/v1/payments/transactions', data),
    {
      onSuccess: (response) => {
        onSuccess?.(response.data.tx_hash);
      },
      onError: (error: any) => {
        onError?.(error.response?.data?.detail || 'Transaction failed');
      },
    }
  );

  // Process transaction mutation
  const processTransaction = useMutation(
    (data: { transaction_id: number; private_key: string }) =>
      api.post(`/api/v1/payments/transactions/${data.transaction_id}/process`, {
        private_key: data.private_key,
      }),
    {
      onSuccess: (response) => {
        onSuccess?.(response.data.tx_hash);
      },
      onError: (error: any) => {
        onError?.(error.response?.data?.detail || 'Transaction processing failed');
      },
    }
  );

  useEffect(() => {
    if (estimate) {
      setGasEstimate(estimate);
    }
  }, [estimate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create transaction
      const createResponse = await createTransaction.mutateAsync({
        network: selectedNetwork,
        token: selectedToken,
        amount,
        from_address: walletAddress,
      });

      // Process transaction (in a real app, you would get the private key securely)
      await processTransaction.mutateAsync({
        transaction_id: createResponse.data.id,
        private_key: 'user_private_key', // This should be handled securely
      });
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  if (networksLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Crypto Payment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Network Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Network
          </label>
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            {networks?.map((network) => (
              <option key={network.network} value={network.network}>
                {network.name}
              </option>
            ))}
          </select>
        </div>

        {/* Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Token
          </label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            {networks
              ?.find((n) => n.network === selectedNetwork)
              ?.supported_tokens.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
          </select>
        </div>

        {/* Wallet Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        {/* Amount Display */}
        <div className="text-center text-xl font-semibold">
          {formatCurrency(amount)} USD
        </div>

        {/* Gas Estimate */}
        {gasEstimate && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Gas Fee
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>Gas Price: {gasEstimate.gas_price} Gwei</div>
              <div>Total Cost: {formatCurrency(gasEstimate.total_gas_cost)}</div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={createTransaction.isLoading || processTransaction.isLoading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createTransaction.isLoading || processTransaction.isLoading
            ? 'Processing...'
            : 'Pay with Crypto'}
        </button>
      </form>

      {/* Error Message */}
      {(createTransaction.error || processTransaction.error) && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
          {createTransaction.error?.message || processTransaction.error?.message}
        </div>
      )}
    </div>
  );
};

export default CryptoPayment; 