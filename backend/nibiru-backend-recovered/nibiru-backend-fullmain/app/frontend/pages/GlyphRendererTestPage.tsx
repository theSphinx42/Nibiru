import React, { useState } from 'react';
import { GlyphRenderer } from '../components/GlyphRenderer';

const TEST_HASHES = [
  'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z',
  '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
  'abcdefghijklmnopqrstuvwxyz1234567890',
  '1234567890abcdefghijklmnopqrstuvwxyz',
];

export const GlyphRendererTestPage: React.FC = () => {
  const [selectedHash, setSelectedHash] = useState(TEST_HASHES[0]);
  const [salt, setSalt] = useState('');
  const [creatorSignature, setCreatorSignature] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [size, setSize] = useState(200);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        GlyphRenderer Test Page
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Test Hash
            </label>
            <select
              value={selectedHash}
              onChange={(e) => setSelectedHash(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {TEST_HASHES.map((hash) => (
                <option key={hash} value={hash}>
                  {hash.slice(0, 16)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Salt (Optional)
            </label>
            <input
              type="text"
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter salt value"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Creator Signature (Optional)
            </label>
            <input
              type="text"
              value={creatorSignature}
              onChange={(e) => setCreatorSignature(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter creator signature"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Size
            </label>
            <input
              type="range"
              min="100"
              max="400"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {size}px
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="darkMode"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="darkMode"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Dark Mode
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Glyph Preview
            </h2>
            <div className="flex justify-center">
              <GlyphRenderer
                hash={selectedHash}
                size={size}
                darkMode={darkMode}
                salt={salt || undefined}
                creatorSignature={creatorSignature || undefined}
                showControls={true}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hash Information
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Base Hash:</span>
                <code className="ml-2 text-gray-900 dark:text-white">
                  {selectedHash}
                </code>
              </div>
              {salt && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Salt:</span>
                  <code className="ml-2 text-gray-900 dark:text-white">
                    {salt}
                  </code>
                </div>
              )}
              {creatorSignature && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Creator Signature:
                  </span>
                  <code className="ml-2 text-gray-900 dark:text-white">
                    {creatorSignature}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 