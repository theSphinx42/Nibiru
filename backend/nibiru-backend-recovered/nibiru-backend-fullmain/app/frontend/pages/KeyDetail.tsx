import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { InvocationKey, KeyUsageLog, KeyStatus } from '../types/invocation';
import { InvocationService } from '../services/invocationService';
import { GlyphBadge } from '../components/GlyphBadge';
import { StatusBadge } from '../components/StatusBadge';
import { GlyphRenderer } from '../components/GlyphRenderer';
import { useToast } from '../hooks/useToast';

export const KeyDetail: React.FC = () => {
  const { keyId } = useParams<{ keyId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [key, setKey] = useState<InvocationKey | null>(null);
  const [usageLogs, setUsageLogs] = useState<KeyUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const invocationService = InvocationService.getInstance();

  useEffect(() => {
    if (keyId) {
      fetchKeyDetails();
      fetchUsageLogs();
    }
    // Check system dark mode preference
    setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [keyId]);

  const fetchKeyDetails = async () => {
    try {
      const response = await invocationService.getUserKeys();
      const foundKey = response.find(k => k.id === parseInt(keyId!));
      if (foundKey) {
        setKey(foundKey);
      } else {
        showToast('Key not found', 'error');
        navigate('/codex');
      }
    } catch (error) {
      showToast('Error fetching key details', 'error');
      navigate('/codex');
    }
  };

  const fetchUsageLogs = async () => {
    if (!keyId) return;
    try {
      const logs = await invocationService.getKeyUsageLogs(parseInt(keyId));
      setUsageLogs(logs);
    } catch (error) {
      showToast('Error fetching usage logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!key) return;
    try {
      await invocationService.revokeKey(key.key_hash);
      showToast('Key revoked successfully', 'success');
      fetchKeyDetails();
    } catch (error) {
      showToast('Error revoking key', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!key) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/codex')}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ← Back to Codex Vault
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {key.code_listing.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {key.code_listing.description}
            </p>
          </div>
          <StatusBadge status={key.status} />
        </div>

        <div className="mt-6 flex flex-col items-center">
          <GlyphRenderer
            hash={key.glyph_hash}
            size={200}
            darkMode={darkMode}
            className="mb-4"
          />
          <GlyphBadge hash={key.glyph_hash} />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Key Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Uses Remaining
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {key.uses_remaining !== null ? key.uses_remaining : 'Unlimited'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Expiration
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {key.expiration ? format(new Date(key.expiration), 'PPP') : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Used
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {key.last_used ? format(new Date(key.last_used), 'PPP') : 'Never'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Usage History
            </h2>
            <div className="space-y-4">
              {usageLogs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No usage history available
                </p>
              ) : (
                usageLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {format(new Date(log.timestamp), 'PPP')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {log.usage_type}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.success
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/codex')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Back to Vault
          </button>

          {key.status === KeyStatus.ACTIVE && (
            <button
              onClick={handleRevoke}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Revoke Key
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 