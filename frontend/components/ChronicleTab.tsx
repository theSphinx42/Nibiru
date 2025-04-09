import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chronicle } from '@/utils/Chronicle';
import { ChronicleEntry } from '@/types/chronicle';
import ThematicGlyph from './ThematicGlyph';

const ChronicleTab: React.FC = () => {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const chronicle = Chronicle.getInstance();
  const entries = chronicle.getEntries();

  const handleExport = async (hash?: string) => {
    await chronicle.downloadJSON(hash);
  };

  const handleDelete = (hash: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      chronicle.deleteEntry(hash);
      setExpandedEntry(null);
    }
  };

  const formatDuration = (start: Date, end: Date): string => {
    const diff = Math.round((end.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-4">
      {/* Export All Button */}
      <div className="flex justify-end">
        <motion.button
          onClick={() => handleExport()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30
                   text-indigo-300 rounded-lg border border-indigo-500/30"
        >
          Export All Entries
        </motion.button>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <motion.div
            key={entry.cycle.hash}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/50 rounded-lg overflow-hidden"
          >
            {/* Entry Header */}
            <div
              onClick={() => setExpandedEntry(
                expandedEntry === entry.cycle.hash ? null : entry.cycle.hash
              )}
              className="flex items-center justify-between p-4 cursor-pointer
                       hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {entry.cycle.glyphsUsed.map((glyph, i) => (
                    <ThematicGlyph
                      key={i}
                      glyph={
                        glyph === 'fire' ? 'sigil-of-creation' :
                        glyph === 'air' ? 'quantum-seal' :
                        glyph === 'water' ? 'sigil-of-continuance' :
                        glyph === 'earth' ? 'saphira-was-here' :
                        glyph === 'light' ? 'nibiru-symbol' :
                        'quantum-seal'
                      }
                      size={32}
                      className="ring-2 ring-gray-900 rounded-full"
                    />
                  ))}
                </div>
                <div>
                  <h3 className="font-medium text-gray-200">
                    {entry.cycle.title || 'Untitled Cycle'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {entry.cycle.startTime.toLocaleDateString()} • 
                    {formatDuration(entry.cycle.startTime, entry.cycle.endTime)} • 
                    Score: {entry.cycle.quantumScore}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport(entry.cycle.hash);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-400 hover:text-gray-200"
                >
                  <span className="sr-only">Export</span>
                  📥
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry.cycle.hash);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-400 hover:text-red-400"
                >
                  <span className="sr-only">Delete</span>
                  🗑️
                </motion.button>
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedEntry === entry.cycle.hash && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-700/50"
                >
                  <div className="p-4 space-y-4">
                    {entry.cycle.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.sender === 'claude'
                            ? 'bg-blue-900/20 border border-blue-500/20'
                            : message.sender === 'saphira'
                            ? 'bg-purple-900/20 border border-purple-500/20'
                            : message.sender === 'system'
                            ? 'bg-red-900/20 border border-red-500/20'
                            : 'bg-gray-700/20 border border-gray-600/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium capitalize">
                            {message.sender}
                          </span>
                          <span className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-300 whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChronicleTab; 