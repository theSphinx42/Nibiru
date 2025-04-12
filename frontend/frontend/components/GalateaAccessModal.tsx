import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiStar, FiUnlock, FiZap } from 'react-icons/fi';
import { GalateaAccessTier, GalateaPrice } from '../types/galatea';
import { galateaService } from '../services/galatea';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ThematicGlyph from './ThematicGlyph';

interface GalateaAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccessGranted?: () => void;
}

export const GalateaAccessModal: React.FC<GalateaAccessModalProps> = ({
  isOpen,
  onClose,
  onAccessGranted
}) => {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<GalateaAccessTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!selectedTier || !user) return;

    setIsProcessing(true);
    try {
      const result = await galateaService.purchaseAccess(user.id, selectedTier);
      
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        onAccessGranted?.();
      } else {
        toast.error(result.error || 'Failed to initiate purchase');
      }
    } catch (error) {
      toast.error('Failed to process request');
    } finally {
      setIsProcessing(false);
    }
  };

  const tiers = [
    {
      id: GalateaAccessTier.TRIAL,
      title: 'Trial Vision',
      price: GalateaPrice.TRIAL_VISION,
      description: 'Test your vision with a single Galatea listing',
      icon: <FiStar className="w-6 h-6 text-amber-400" />,
      glowColor: 'from-amber-500/20 to-transparent'
    },
    {
      id: GalateaAccessTier.FORGE,
      title: 'Forge Unlocked',
      price: GalateaPrice.FORGE_UNLOCK,
      description: 'Permanent access to the Galatea forge',
      icon: <FiUnlock className="w-6 h-6 text-teal-400" />,
      glowColor: 'from-teal-500/20 to-transparent'
    },
    {
      id: GalateaAccessTier.CREATOR_PASS,
      title: 'Creator Pass',
      price: GalateaPrice.CREATOR_PASS_MONTHLY,
      description: 'Unlimited listings & mythic perks',
      icon: <FiZap className="w-6 h-6 text-indigo-400" />,
      glowColor: 'from-indigo-500/20 to-transparent',
      isSubscription: true
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-gray-900/90 rounded-xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Header with mythic glow */}
            <div className="relative px-6 pt-12 pb-8 text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent" />
              <ThematicGlyph
                glyph="galatea-sigil"
                size={80}
                className="mx-auto mb-6"
                effect="pulse"
              />
              <h2 className="text-3xl font-bold text-white mb-4">
                Sell Your Vision. Join Galatea.
              </h2>
              <p className="text-lg text-gray-300 max-w-xl mx-auto">
                Galatea is your forge — a place for creators to share visionary ideas, 
                prototypes, and mythic work-in-progress projects.
              </p>
            </div>

            {/* Tier selection */}
            <div className="px-6 pb-6">
              <div className="grid gap-4">
                {tiers.map((tier) => (
                  <motion.button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedTier === tier.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${tier.glowColor} opacity-20 rounded-lg`} />
                    <div className="relative flex items-center">
                      <div className="mr-4">
                        <div className="p-2 bg-gray-700/50 rounded-lg">
                          {tier.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {tier.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {tier.description}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-xl font-bold text-white">
                          ${tier.price}
                        </div>
                        {tier.isSubscription && (
                          <div className="text-sm text-gray-400">/month</div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action footer */}
            <div className="px-6 pb-6 text-center">
              <button
                onClick={handlePurchase}
                disabled={!selectedTier || isProcessing}
                className={`w-full max-w-md px-6 py-3 rounded-lg text-white font-medium transition-all ${
                  !selectedTier
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mr-2"
                    >
                      ◈
                    </motion.span>
                    Processing...
                  </span>
                ) : (
                  'Unlock Access'
                )}
              </button>

              <p className="mt-4 text-sm text-gray-400">
                By joining, you agree to our Creator Guidelines and Vision Standards
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 