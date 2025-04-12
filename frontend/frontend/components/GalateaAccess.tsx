import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiUnlock, FiZap, FiCheck, FiLoader } from 'react-icons/fi';
import { GalateaAccessTier, GalateaPrice } from '../types/galatea';
import { galateaService } from '../services/galatea';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ThematicGlyph from './ThematicGlyph';

interface GalateaAccessProps {
  onClose?: () => void;
}

export const GalateaAccess: React.FC<GalateaAccessProps> = ({ onClose }) => {
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
      description: 'Perfect for creators with a single prototype or vision to share',
      icon: <FiStar className="w-6 h-6 text-purple-400" />,
      features: [
        'Post one Galatea-style listing',
        'Basic dev update tools',
        'No monthly fees',
        'Upgrade anytime'
      ]
    },
    {
      id: GalateaAccessTier.FORGE,
      title: 'Forge Unlocked',
      price: GalateaPrice.FORGE_UNLOCK,
      description: 'Permanent access to list your visionary projects',
      icon: <FiUnlock className="w-6 h-6 text-teal-400" />,
      features: [
        'Unlimited Galatea listings',
        'Galatea Creator badge',
        'One-time activation fee',
        'Full dev update suite'
      ]
    },
    {
      id: GalateaAccessTier.CREATOR_PASS,
      title: 'Galatea Creator Pass',
      price: GalateaPrice.CREATOR_PASS_MONTHLY,
      description: 'Premium features for dedicated visionary builders',
      icon: <FiZap className="w-6 h-6 text-amber-400" />,
      features: [
        'All Forge features',
        'Bonus mythic glyphs',
        'Featured listing slots',
        'Higher Quantum Score multiplier'
      ],
      isSubscription: true
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <ThematicGlyph glyph="galatea-sigil" size={64} className="mx-auto mb-6" effect="glow" />
        <h1 className="text-3xl font-bold text-white mb-4">
          Unlock Your Creative Vision
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Join the Galatea creator community and share your visionary projects with the world.
          Choose the tier that best supports your creative journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {tiers.map((tier) => (
          <motion.div
            key={tier.id}
            className={`relative bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border-2 transition-colors ${
              selectedTier === tier.id
                ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => setSelectedTier(tier.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute -top-3 -right-3">
              {selectedTier === tier.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-indigo-500 rounded-full p-1"
                >
                  <FiCheck className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>

            <div className="flex items-start mb-4">
              <div className="p-3 bg-gray-700/50 rounded-lg mr-4">
                {tier.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{tier.title}</h3>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline mb-1">
                <span className="text-2xl font-bold text-white">${tier.price}</span>
                {tier.isSubscription && (
                  <span className="text-gray-400 text-sm ml-1">/month</span>
                )}
              </div>
              {!tier.isSubscription && (
                <span className="text-sm text-gray-400">One-time payment</span>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-300">
                  <FiCheck className="w-4 h-4 text-teal-400 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handlePurchase}
          disabled={!selectedTier || isProcessing}
          className={`px-8 py-3 rounded-lg text-white font-medium flex items-center justify-center mx-auto ${
            !selectedTier
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isProcessing ? (
            <>
              <FiLoader className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <FiUnlock className="mr-2" />
              {selectedTier
                ? `Unlock ${tiers.find(t => t.id === selectedTier)?.title}`
                : 'Select a Tier'}
            </>
          )}
        </button>

        <p className="mt-4 text-sm text-gray-400">
          By purchasing, you agree to our Terms of Service and Creator Guidelines
        </p>
      </div>
    </div>
  );
}; 