import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaKey, FaAd, FaArrowRight } from 'react-icons/fa';
import SpiritGlyphViewer from './GlyphViewer';

interface TierAccessPromptProps {
  tierInfo: {
    access_granted: boolean;
    tier: number;
    required_tier: number;
    message: string;
    upgrade_options?: string[];
    quantum_score?: number;
    required_score?: number;
  };
  onUpgrade?: () => void;
  onUseKey?: () => void;
  onWatchAd?: () => void;
  onClose?: () => void;
}

const TierAccessPrompt: React.FC<TierAccessPromptProps> = ({
  tierInfo,
  onUpgrade,
  onUseKey,
  onWatchAd,
  onClose
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const getTierDescription = (tier: number) => {
    switch (tier) {
      case 1:
        return "Basic Access";
      case 2:
        return "Creator Access";
      case 3:
        return "Advanced Access";
      default:
        return "Unknown Tier";
    }
  };

  const getUpgradeDescription = (option: string) => {
    switch (option) {
      case "become_creator":
        return "Become a Creator";
      case "subscribe":
        return "Subscribe";
      case "increase_quantum_score":
        return "Increase Quantum Score";
      case "request_admin_override":
        return "Request Admin Override";
      case "login":
        return "Log In";
      case "create_account":
        return "Create Account";
      default:
        return option;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div className="relative max-w-md w-full bg-gray-900 rounded-lg shadow-xl p-6">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
          >
            ×
          </button>
        )}

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <SpiritGlyphViewer
                seed={`tier-${tierInfo.required_tier}`}
                size={100}
                tier={tierInfo.required_tier as 1 | 2 | 3}
                showCaption={false}
              />
              <FaLock 
                className="absolute bottom-0 right-0 text-red-500 bg-gray-900 rounded-full p-1"
                size={24}
              />
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-100 mb-2">
            {getTierDescription(tierInfo.required_tier)} Required
          </h3>
          
          <p className="text-gray-400 mb-4">
            {tierInfo.message}
          </p>

          {/* Quantum Score Progress (if applicable) */}
          {tierInfo.quantum_score !== undefined && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Quantum Score: {tierInfo.quantum_score}</span>
                <span>Required: {tierInfo.required_score}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-indigo-600 rounded-full h-2 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (tierInfo.quantum_score! / tierInfo.required_score!) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Upgrade Options */}
          {tierInfo.upgrade_options?.map((option) => (
            <motion.button
              key={option}
              onClick={() => {
                setSelectedOption(option);
                onUpgrade?.();
              }}
              className="w-full flex items-center justify-between p-4 rounded-lg
                       bg-gray-800/50 hover:bg-gray-800 border border-gray-700
                       text-left group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-gray-200 font-medium">
                {getUpgradeDescription(option)}
              </span>
              <FaArrowRight className="text-gray-500 group-hover:text-indigo-400 
                                   transition-colors duration-200" />
            </motion.button>
          ))}

          {/* Alternative Access Options */}
          <div className="flex gap-4 pt-4">
            {onUseKey && (
              <motion.button
                onClick={onUseKey}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg
                         bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700
                         text-gray-400 hover:text-gray-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaKey />
                <span>Use Key</span>
              </motion.button>
            )}

            {onWatchAd && (
              <motion.button
                onClick={onWatchAd}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg
                         bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700
                         text-gray-400 hover:text-gray-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaAd />
                <span>Watch Ad</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TierAccessPrompt; 