import React from 'react';
import { format } from 'date-fns';
import { KeyStatus } from '../types/invocation';
import { GlyphBadge } from './GlyphBadge';
import { StatusBadge } from './StatusBadge';
import { GlyphRenderer } from './GlyphRenderer';

interface CodexCardProps {
  key: InvocationKey;
  onRedeem: (keyHash: string) => void;
  onRevoke?: (keyHash: string) => void;
  showAdminControls?: boolean;
  darkMode?: boolean;
}

export const CodexCard: React.FC<CodexCardProps> = ({
  key: invocationKey,
  onRedeem,
  onRevoke,
  showAdminControls = false,
  darkMode = false
}) => {
  const {
    key_hash,
    glyph_hash,
    status,
    expiration,
    uses_remaining,
    last_used,
    code_listing
  } = invocationKey;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {code_listing.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {code_listing.description}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-6 flex flex-col items-center">
        <GlyphRenderer
          hash={glyph_hash}
          size={120}
          darkMode={darkMode}
          className="mb-4"
        />
        <GlyphBadge hash={glyph_hash} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
        {expiration && (
          <div>
            Expires: {format(new Date(expiration), 'PPP')}
          </div>
        )}
        {last_used && (
          <div>
            Last used: {format(new Date(last_used), 'PPP')}
          </div>
        )}
        {uses_remaining !== null && (
          <div>
            Uses remaining: {uses_remaining}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => onRedeem(key_hash)}
          disabled={status !== KeyStatus.ACTIVE}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Redeem Key
        </button>

        {showAdminControls && onRevoke && (
          <button
            onClick={() => onRevoke(key_hash)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Revoke Key
          </button>
        )}
      </div>
    </div>
  );
}; 