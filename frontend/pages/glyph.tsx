import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import GlyphViewer from '../components/GlyphViewer';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '../components/Toast';

interface GlyphData {
  seed: string;
  timestamp: string;
  power?: number;
  resonance?: number;
}

const GlyphPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [glyphData, setGlyphData] = useState<GlyphData>({
    seed: "0xSPIRIT-alex85",
    timestamp: new Date().toISOString(),
    power: 85,
    resonance: 92,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch user's current glyph on load
  useEffect(() => {
    const fetchGlyph = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          const response = await apiService.getUserGlyph(user.id);
          setGlyphData(current => ({
            ...current,
            seed: response.seed,
            timestamp: response.timestamp,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch glyph:', error);
        showToast('Failed to load your Spirit Glyph', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlyph();
  }, [user?.id, showToast]);

  // Generate new glyph
  const handleGenerateGlyph = async () => {
    try {
      setIsGenerating(true);
      const response = await apiService.generateGlyphSeed();
      setGlyphData(current => ({
        ...current,
        seed: response.seed,
        timestamp: response.timestamp,
      }));
      showToast('New Spirit Glyph generated!', 'success');
    } catch (error) {
      console.error('Failed to generate glyph:', error);
      showToast('Failed to generate new Spirit Glyph', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout title="Spirit Glyph">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Your Spirit Glyph
            </h1>
            <motion.button
              onClick={handleGenerateGlyph}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 
                       hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                       border border-blue-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isGenerating ? 'Generating...' : 'Generate New'}
            </motion.button>
          </div>

          <div className="flex flex-col items-center space-y-8">
            {/* Glyph Display */}
            <div className="relative p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
              <GlyphViewer
                seed={glyphData.seed}
                caption={`SpiritGlyph of ${user?.username}`}
                size={400}
                showExport
                isGenerating={isGenerating}
              />
            </div>

            {/* Glyph Stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
                <h3 className="text-lg font-medium text-gray-300 mb-2">Properties</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Seed</dt>
                    <dd className="text-blue-400 font-mono">{glyphData.seed}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Generated</dt>
                    <dd className="text-gray-300">
                      {new Date(glyphData.timestamp).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
                <h3 className="text-lg font-medium text-gray-300 mb-2">Metrics</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Power</dt>
                    <dd className="text-purple-400">{glyphData.power}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Resonance</dt>
                    <dd className="text-blue-400">{glyphData.resonance}</dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default GlyphPage; 