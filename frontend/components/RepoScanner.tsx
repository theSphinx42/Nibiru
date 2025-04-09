import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FaGithub, FaUpload, FaFolder } from 'react-icons/fa';
import SpiritGlyphViewer from './GlyphViewer';

interface RepoScannerProps {
  onScanComplete?: (analysis: any) => void;
  onCreateListings?: (suggestions: any[]) => void;
}

const RepoScanner: React.FC<RepoScannerProps> = ({
  onScanComplete,
  onCreateListings,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [invocationKeys, setInvocationKeys] = useState<Record<number, string>>({});
  const [glyphTiers, setGlyphTiers] = useState<Record<number, number>>({});

  // Handle GitHub URL input
  const handleGitHubScan = async (url: string) => {
    try {
      setIsScanning(true);
      const response = await fetch('/api/scan/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: url })
      });
      
      const data = await response.json();
      setAnalysis(data);
      onScanComplete?.(data);
    } catch (error) {
      console.error('Failed to scan GitHub repo:', error);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsScanning(true);
      const response = await fetch('/api/scan/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setAnalysis(data);
      onScanComplete?.(data);
    } catch (error) {
      console.error('Failed to scan uploaded repo:', error);
    } finally {
      setIsScanning(false);
    }
  }, [onScanComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] }
  });

  // Toggle suggestion selection
  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  // Update invocation key for a suggestion
  const updateInvocationKey = (index: number, key: string) => {
    setInvocationKeys(prev => ({
      ...prev,
      [index]: key
    }));
  };

  // Update glyph tier for a suggestion
  const updateGlyphTier = (index: number, tier: number) => {
    setGlyphTiers(prev => ({
      ...prev,
      [index]: tier
    }));
  };

  // Create selected listings
  const handleCreateListings = async () => {
    if (!analysis) return;

    const selectedListings = Array.from(selectedSuggestions).map(index => {
      const suggestion = analysis.listing_suggestions[index];
      return {
        ...suggestion,
        invocation_key: invocationKeys[index] || null,
        glyph_tier: glyphTiers[index] || suggestion.glyph_tier
      };
    });

    onCreateListings?.(selectedListings);
  };

  return (
    <div className="space-y-8">
      {/* Scan Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GitHub URL Input */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <FaGithub className="text-2xl text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-200">GitHub Repository</h3>
          </div>
          <input
            type="text"
            placeholder="Enter repository URL"
            className="w-full px-4 py-2 bg-gray-700 rounded-md text-gray-200 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleGitHubScan((e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        {/* File Upload Zone */}
        <div {...getRootProps()} className="p-6 bg-gray-800 rounded-lg cursor-pointer">
          <input {...getInputProps()} />
          <div className="flex items-center space-x-2 mb-4">
            <FaUpload className="text-2xl text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-200">Upload ZIP</h3>
          </div>
          <div className="text-gray-400 text-center">
            {isDragActive ? (
              <p>Drop the ZIP file here</p>
            ) : (
              <p>Drag & drop a ZIP file or click to select</p>
            )}
          </div>
        </div>

        {/* Local Path Input */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <FaFolder className="text-2xl text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-200">Local Path</h3>
          </div>
          <input
            type="text"
            placeholder="Enter local repository path"
            className="w-full px-4 py-2 bg-gray-700 rounded-md text-gray-200 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                // Handle local path scan
              }
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {isScanning && (
        <div className="flex justify-center items-center py-12">
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            {/* Repository Overview */}
            <div className="p-6 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-200 mb-4">Repository Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400">Total Files</p>
                  <p className="text-2xl font-bold text-gray-200">{analysis.total_files}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Lines</p>
                  <p className="text-2xl font-bold text-gray-200">{analysis.total_lines}</p>
                </div>
                <div>
                  <p className="text-gray-400">Package Groups</p>
                  <p className="text-2xl font-bold text-gray-200">{analysis.package_groups.length}</p>
                </div>
                <div>
                  <p className="text-gray-400">Suggestions</p>
                  <p className="text-2xl font-bold text-gray-200">{analysis.listing_suggestions.length}</p>
                </div>
              </div>
            </div>

            {/* Listing Suggestions */}
            <div className="space-y-4">
              {analysis.listing_suggestions.map((suggestion: any, index: number) => (
                <motion.div
                  key={index}
                  className={`p-6 bg-gray-800 rounded-lg cursor-pointer ${
                    selectedSuggestions.has(index) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => toggleSuggestion(index)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-200">{suggestion.title}</h4>
                      <p className="text-gray-400 mt-2">{suggestion.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {suggestion.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-6">
                      <SpiritGlyphViewer
                        seed={`${suggestion.title}-${index}`}
                        size={100}
                        tier={suggestion.glyph_tier}
                      />
                    </div>
                  </div>

                  {selectedSuggestions.has(index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Invocation Key Input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Invocation Key (Optional)
                          </label>
                          <input
                            type="text"
                            value={invocationKeys[index] || ''}
                            onChange={(e) => updateInvocationKey(index, e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 rounded-md text-gray-200 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter invocation key"
                          />
                        </div>

                        {/* Glyph Tier Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Glyph Tier (Optional)
                          </label>
                          <select
                            value={glyphTiers[index] || suggestion.glyph_tier}
                            onChange={(e) => updateGlyphTier(index, Number(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-700 rounded-md text-gray-200 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={1}>Tier 1</option>
                            <option value={2}>Tier 2</option>
                            <option value={3}>Tier 3</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Create Listings Button */}
            {selectedSuggestions.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <button
                  onClick={handleCreateListings}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Create {selectedSuggestions.size} Listing{selectedSuggestions.size > 1 ? 's' : ''}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RepoScanner; 