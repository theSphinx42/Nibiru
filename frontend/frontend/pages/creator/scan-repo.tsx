import { useState } from 'react';
import { useRouter } from 'next/router';
import RepoScanner from '../../components/RepoScanner';
import { motion } from 'framer-motion';

const ScanRepoPage = () => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleScanComplete = (analysis: any) => {
    console.log('Scan complete:', analysis);
  };

  const handleCreateListings = async (suggestions: any[]) => {
    try {
      setIsCreating(true);
      
      // Create listings in parallel
      await Promise.all(suggestions.map(async (suggestion) => {
        const response = await fetch('/api/listings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...suggestion,
            // If no invocation key is provided, use glyph tier as fallback validation
            validation: suggestion.invocation_key 
              ? { type: 'key', key: suggestion.invocation_key }
              : { type: 'glyph_tier', tier: suggestion.glyph_tier }
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create listing');
        }
      }));
      
      // Navigate to dashboard after successful creation
      router.push('/creator/dashboard');
    } catch (error) {
      console.error('Failed to create listings:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-200 mb-2">
          Scan Repository
        </h1>
        <p className="text-gray-400">
          Upload or link to a GitHub repository to automatically generate listing suggestions.
        </p>
      </motion.div>

      <RepoScanner
        onScanComplete={handleScanComplete}
        onCreateListings={handleCreateListings}
      />

      {/* Loading Overlay */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <motion.div
            className="bg-gray-800 rounded-lg p-8 flex flex-col items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 border-4 border-blue-500 rounded-full mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-200">Creating listings...</p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ScanRepoPage; 