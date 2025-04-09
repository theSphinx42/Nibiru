import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvocationKey, KeyStatus, KeyMetrics } from '../types/invocation';
import { InvocationService } from '../services/invocationService';
import { CodexCard } from '../components/CodexCard';
import { StatsWidget } from '../components/StatsWidget';
import { useToast } from '../hooks/useToast';

type SortOption = 'newest' | 'oldest' | 'most_used' | 'expiring_soon';

export const CodexVault: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [keys, setKeys] = useState<InvocationKey[]>([]);
  const [metrics, setMetrics] = useState<KeyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<KeyStatus | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const invocationService = InvocationService.getInstance();

  useEffect(() => {
    fetchKeys();
    fetchMetrics();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await invocationService.getUserKeys();
      setKeys(response);
    } catch (error) {
      showToast('Error fetching keys', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await invocationService.getListingMetrics(0); // Replace with actual listing ID
      setMetrics(response);
    } catch (error) {
      showToast('Error fetching metrics', 'error');
    }
  };

  const handleRedeem = async (keyHash: string) => {
    try {
      await invocationService.redeemKey({ key_hash: keyHash });
      showToast('Key redeemed successfully', 'success');
      fetchKeys();
    } catch (error) {
      showToast('Error redeeming key', 'error');
    }
  };

  const handleRevoke = async (keyHash: string) => {
    try {
      await invocationService.revokeKey(keyHash);
      showToast('Key revoked successfully', 'success');
      fetchKeys();
    } catch (error) {
      showToast('Error revoking key', 'error');
    }
  };

  const filteredAndSortedKeys = keys
    .filter(key => statusFilter === 'all' || key.status === statusFilter)
    .sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_used':
          return (b.uses_remaining || 0) - (a.uses_remaining || 0);
        case 'expiring_soon':
          if (!a.expiration && !b.expiration) return 0;
          if (!a.expiration) return 1;
          if (!b.expiration) return -1;
          return new Date(a.expiration).getTime() - new Date(b.expiration).getTime();
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Codex Vault
      </h1>

      {metrics && <StatsWidget metrics={metrics} />}

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as KeyStatus | 'all')}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Statuses</option>
            {Object.values(KeyStatus).map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_used">Most Used</option>
            <option value="expiring_soon">Expiring Soon</option>
          </select>
        </div>

        <button
          onClick={() => navigate('/admin/create-key')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New Key
        </button>
      </div>
      
      {filteredAndSortedKeys.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No keys found matching your criteria.
          </p>
          <a
            href="/marketplace"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Browse Marketplace
          </a>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedKeys.map((key) => (
            <CodexCard
              key={key.key_hash}
              key={key}
              onRedeem={handleRedeem}
              onRevoke={handleRevoke}
              showAdminControls={key.code_listing.creator_id === 'current-user-id'} // Replace with actual user ID check
            />
          ))}
        </div>
      )}
    </div>
  );
}; 