import React from 'react';

interface GlyphBadgeProps {
  hash: string;
}

export const GlyphBadge: React.FC<GlyphBadgeProps> = ({ hash }) => {
  // Take first 8 characters of hash for display
  const shortHash = hash.slice(0, 8);

  return (
    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
      <span className="font-mono">{shortHash}</span>
      <span className="ml-1 text-purple-500 dark:text-purple-400">...</span>
    </div>
  );
}; 