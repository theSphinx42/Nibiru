import { motion } from 'framer-motion';
import { FaShieldAlt, FaHandHoldingHeart } from 'react-icons/fa';
import SpiritGlyphViewer from './GlyphViewer';
import { ColorMode, EvolutionParams } from '../types/glyph';

interface CustodialBadgeProps {
  metadata: {
    status: 'active' | 'eligible' | 'custodial' | 'recovery_requested';
    custodial_since?: string;
    quantum_score: number;
    donation_allocation?: {
      maintenance: number;
      sustainability: number;
      charitable: number;
    };
  };
  className?: string;
  showDetails?: boolean;
}

const custodialEvolution: EvolutionParams = {
  complexity: 1.5,
  glowStrength: 2.5,
  glowOpacity: 0.8,
  particleCount: 3,
  mythicLevel: 1,
  auraEnabled: true,
  hueRotation: 0,
  saturationBoost: 1.3,
  shimmerEnabled: true
};

const CustodialBadge: React.FC<CustodialBadgeProps> = ({
  metadata,
  className = '',
  showDetails = false
}) => {
  const isCustodial = metadata.status === 'custodial';
  const isRecoveryRequested = metadata.status === 'recovery_requested';

  return (
    <motion.div
      className={`relative group ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sigil of Continuance with Enhanced Effects */}
      <div className="relative">
        {/* Ripple Effect Rings */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-indigo-400/20"
            animate={{
              scale: [1, 1.5, 1.8],
              opacity: [0.5, 0.2, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-indigo-400/20"
            animate={{
              scale: [1, 1.3, 1.6],
              opacity: [0.5, 0.3, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5
            }}
          />
        </div>

        {/* Light Bloom Effect */}
        <motion.div
          className="absolute inset-0 bg-indigo-400/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <SpiritGlyphViewer
          seed="nibiru-custodial"
          size={60}
          tier={3}
          colorMode="auto"
          evolution={custodialEvolution}
        />

        {/* Rotating Shield with Glow */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="relative">
            <FaShieldAlt className="text-indigo-400 text-2xl filter drop-shadow-lg" />
            <motion.div
              className="absolute inset-0 text-indigo-400/40 text-2xl blur-sm"
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <FaShieldAlt />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Hover Details */}
      {showDetails && (
        <motion.div
          className="absolute left-1/2 bottom-full mb-2 w-80 transform -translate-x-1/2
                   bg-gray-800 rounded-lg p-4 shadow-xl opacity-0 group-hover:opacity-100
                   border border-indigo-500/30 text-sm"
          initial={false}
          transition={{ duration: 0.2 }}
        >
          <div className="text-center mb-2">
            <span className="text-indigo-400 font-semibold flex items-center justify-center gap-2">
              <FaShieldAlt />
              Sigil of Continuance
            </span>
          </div>
          
          <p className="text-gray-300 italic text-center mb-3 px-4">
            "This creation now lives under the protection of NIBIRU. It is held in trust for the future. Its light endures."
          </p>

          {isCustodial && metadata.custodial_since && (
            <div className="text-gray-400 text-xs text-center">
              Under NIBIRU's protection since{' '}
              {new Date(metadata.custodial_since).toLocaleDateString()}
            </div>
          )}

          {isRecoveryRequested && (
            <div className="text-yellow-400 text-xs mt-2 text-center">
              Recovery request pending
            </div>
          )}

          {metadata.donation_allocation && (
            <div className="mt-4 border-t border-indigo-500/30 pt-3">
              <div className="flex items-center justify-center gap-2 mb-2 text-indigo-400">
                <FaHandHoldingHeart />
                <span>Donation Distribution</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-gray-400">Maintenance</div>
                  <div className="text-indigo-400">{metadata.donation_allocation.maintenance * 100}%</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Sustainability</div>
                  <div className="text-indigo-400">{metadata.donation_allocation.sustainability * 100}%</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Charitable</div>
                  <div className="text-indigo-400">{metadata.donation_allocation.charitable * 100}%</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-between text-xs">
            <span className="text-gray-400">Quantum Score</span>
            <span className="text-indigo-400">{metadata.quantum_score}</span>
          </div>

          {/* Tooltip Arrow */}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full
                        w-0 h-0 border-8 border-transparent border-t-gray-800" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustodialBadge; 