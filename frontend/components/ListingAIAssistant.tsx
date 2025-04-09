import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaLightbulb, FaTimes, FaCheck } from 'react-icons/fa';
import SpiritGlyphViewer from './GlyphViewer';
import { formatPrice } from '../utils/format';

interface Suggestion {
  tags: string[];
  category: string;
  glyphTier: 1 | 2 | 3;
  suggestedPrice: number;
  sampleName?: string;
  sampleBlurb?: string;
  confidence: number;
}

interface ListingAIAssistantProps {
  description: string;
  template?: string;
  onApplySuggestion: (suggestion: Partial<Suggestion>) => void;
  onDismiss?: () => void;
  className?: string;
}

const ListingAIAssistant: React.FC<ListingAIAssistantProps> = ({
  description,
  template,
  onApplySuggestion,
  onDismiss,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const generateSuggestions = async () => {
      if (!description || description.length < 10) return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/listings/suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description,
            template,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestion(data);
        }
      } catch (error) {
        console.error('Error generating suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(generateSuggestions, 1000);
    return () => clearTimeout(debounceTimer);
  }, [description, template]);

  const handleApply = (key: keyof Suggestion) => {
    if (!suggestion) return;
    onApplySuggestion({ [key]: suggestion[key] });
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || (!suggestion && !isLoading)) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-4 right-4 w-80 bg-gray-900 rounded-lg shadow-xl 
                   border border-gray-700 overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50">
          <div className="flex items-center gap-2">
            <FaRobot className="text-indigo-400" />
            <span className="font-medium text-gray-200">Nibiru Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMinimized(!minimized)}
              className="text-gray-400 hover:text-gray-300"
            >
              {minimized ? '+' : '-'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-300"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {!minimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
                  </div>
                ) : suggestion ? (
                  <>
                    {/* Confidence Indicator */}
                    <div className="flex items-center gap-2 mb-4">
                      <FaLightbulb className="text-yellow-500" />
                      <div className="flex-1 h-2 bg-gray-800 rounded-full">
                        <div
                          className="h-2 bg-yellow-500 rounded-full transition-all duration-500"
                          style={{ width: `${suggestion.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">
                        {suggestion.confidence}%
                      </span>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-3">
                      {suggestion.sampleName && (
                        <SuggestionItem
                          label="Name"
                          value={suggestion.sampleName}
                          onApply={() => handleApply('sampleName')}
                        />
                      )}
                      
                      <SuggestionItem
                        label="Tags"
                        value={suggestion.tags.join(', ')}
                        onApply={() => handleApply('tags')}
                      />
                      
                      <SuggestionItem
                        label="Category"
                        value={suggestion.category}
                        onApply={() => handleApply('category')}
                      />
                      
                      <SuggestionItem
                        label="Glyph Tier"
                        value={`Tier ${suggestion.glyphTier}`}
                        onApply={() => handleApply('glyphTier')}
                      >
                        <SpiritGlyphViewer
                          seed={`tier-${suggestion.glyphTier}`}
                          size={24}
                          tier={suggestion.glyphTier}
                          showCaption={false}
                        />
                      </SuggestionItem>
                      
                      <SuggestionItem
                        label="Price"
                        value={formatPrice(suggestion.suggestedPrice)}
                        onApply={() => handleApply('suggestedPrice')}
                      />

                      {suggestion.sampleBlurb && (
                        <SuggestionItem
                          label="Blurb"
                          value={suggestion.sampleBlurb}
                          onApply={() => handleApply('sampleBlurb')}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-center">
                    Add more details to get suggestions
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

interface SuggestionItemProps {
  label: string;
  value: string;
  onApply: () => void;
  children?: React.ReactNode;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  label,
  value,
  onApply,
  children
}) => (
  <div className="flex items-start justify-between gap-4 p-2 rounded-lg
                  bg-gray-800/30 hover:bg-gray-800/50 group">
    <div className="flex-1 min-w-0">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-sm text-gray-200 truncate flex items-center gap-2">
        {children}
        {value}
      </div>
    </div>
    <motion.button
      onClick={onApply}
      className="opacity-0 group-hover:opacity-100 text-indigo-400
                hover:text-indigo-300 transition-opacity"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaCheck />
    </motion.button>
  </div>
);

export default ListingAIAssistant; 