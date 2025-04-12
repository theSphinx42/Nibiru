import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { glyphImages, FALLBACK_GLYPH } from '../lib/glyphs';

// Glyph = singular tier token (user, item, or system level)
export type GlyphTier = 'user' | 'item' | 'system';

// The rank of the glyph within its tier
export type GlyphRank = 'basic' | 'enhanced' | 'premium' | 'mythic';

// Visual effects that can be applied to glyphs or sigils
export type GlyphEffect = 'none' | 'glow' | 'pulse' | 'particles' | 'quantum' | 'entangled' | 'interference' | 'tunneling';

export type QuantumState = 'superposition' | 'entangled' | 'collapsed' | 'interference' | 'tunneling';

export type EntanglementPattern = 'paired' | 'chain' | 'cluster';

// Support for direct glyph paths from the glyphs.ts library
export type GlyphName = keyof typeof glyphImages;

/**
 * ThematicGlyph Component
 * 
 * Renders either:
 * - A Glyph: Single-tier visual representation (user level, item level, or system level)
 * - A Sigil: Ceremonial composition of multiple glyphs, used for validation and special access
 * 
 * When isComposite=true, the component acts as a Sigil (combined ceremonial symbol)
 * Otherwise, it acts as a basic Glyph (singular tier token)
 * 
 * Supports both new and legacy prop patterns:
 * - New: tier, rank, effect props
 * - Legacy: glyph prop (directly uses glyphImages)
 */
export interface ThematicGlyphProps {
  // New prop pattern
  tier?: GlyphTier;
  rank?: GlyphRank;
  effect?: GlyphEffect;
  isComposite?: boolean; // When true, this is a Sigil (composition of multiple glyphs)
  
  // Legacy prop pattern
  glyph?: GlyphName;
  
  // Common props
  size?: number;
  className?: string;
  isGalatea?: boolean;
  userScore?: number;
  entangledWith?: string;
  quantumState?: QuantumState;
  entanglementPattern?: EntanglementPattern;
  onStateChange?: (newState: QuantumState) => void;
  muted?: boolean;
  description?: string;
  dashboardMode?: boolean; // Add this new prop to enable super slow animations for dashboard
  isAnimated?: boolean;
}

// Sound effects for quantum transitions
const SOUND_EFFECTS = {
  superposition: '/sounds/quantum/superposition.mp3',
  entangled: '/sounds/quantum/entangle.mp3',
  interference: '/sounds/quantum/interference.mp3',
  tunneling: '/sounds/quantum/tunnel.mp3',
  rankUp: '/sounds/quantum/rankup.mp3'
};

// Types of sound effects available
type SoundEffectType = 'superposition' | 'entangled' | 'interference' | 'tunneling' | 'rankUp';

// Enhanced quantum animation variants
const quantumVariants = {
  superposition: {
    scale: [1, 1.1, 0.9, 1.1, 1],
    rotate: [0, 180, 360, 180, 0],
    opacity: [0.7, 1, 0.5, 1, 0.7],
    filter: [
      'hue-rotate(0deg) blur(0px) brightness(1)',
      'hue-rotate(180deg) blur(2px) brightness(1.5)',
      'hue-rotate(360deg) blur(4px) brightness(0.8)',
      'hue-rotate(180deg) blur(2px) brightness(1.5)',
      'hue-rotate(0deg) blur(0px) brightness(1)'
    ],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  },
  interference: {
    scale: [1, 1.2, 0.8, 1],
    rotate: [0, 45, -45, 0],
    opacity: [1, 0.5, 0.5, 1],
    filter: [
      'hue-rotate(0deg) blur(0px) contrast(1)',
      'hue-rotate(90deg) blur(3px) contrast(1.5)',
      'hue-rotate(270deg) blur(3px) contrast(1.5)',
      'hue-rotate(360deg) blur(0px) contrast(1)'
    ],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  tunneling: {
    scale: [1, 0.1, 0.1, 1],
    x: [0, 100, -100, 0],
    opacity: [1, 0.2, 0.2, 1],
    filter: [
      'blur(0px) brightness(1)',
      'blur(10px) brightness(2)',
      'blur(10px) brightness(2)',
      'blur(0px) brightness(1)'
    ],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear"
    }
  },
  entangled: {
    scale: 1.05,
    rotate: 0,
    opacity: 1,
    filter: 'hue-rotate(0deg) brightness(1.2)',
    transition: {
      duration: 1.2
    }
  },
  collapsed: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    filter: 'none',
    transition: {
      duration: 0.8
    }
  }
};

// Add dashboard-specific ultra-slow variants
const dashboardVariants = {
  superposition: {
    scale: [1, 1.05, 0.95, 1.05, 1],
    rotate: [0, 90, 180, 270, 360],
    opacity: [0.7, 0.8, 0.7, 0.8, 0.7],
    filter: [
      'hue-rotate(0deg) blur(0px) brightness(1)',
      'hue-rotate(90deg) blur(1px) brightness(1.2)',
      'hue-rotate(180deg) blur(2px) brightness(1.1)',
      'hue-rotate(270deg) blur(1px) brightness(1.2)',
      'hue-rotate(360deg) blur(0px) brightness(1)'
    ],
    transition: {
      duration: 60, // Ultra slow - 60 seconds per rotation
      repeat: Infinity,
      ease: "linear"
    }
  },
  interference: {
    scale: [1, 1.1, 0.9, 1],
    rotate: [0, 15, -15, 0],
    opacity: [0.9, 0.7, 0.8, 0.9],
    filter: [
      'hue-rotate(0deg) blur(0px) contrast(1)',
      'hue-rotate(45deg) blur(1px) contrast(1.2)',
      'hue-rotate(90deg) blur(1px) contrast(1.2)',
      'hue-rotate(180deg) blur(0px) contrast(1)'
    ],
    transition: {
      duration: 30, // Ultra slow
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  tunneling: {
    scale: [1, 0.98, 0.98, 1],
    x: [0, 5, -5, 0],
    opacity: [1, 0.8, 0.8, 1],
    filter: [
      'blur(0px) brightness(1)',
      'blur(1px) brightness(1.1)',
      'blur(1px) brightness(1.1)',
      'blur(0px) brightness(1)'
    ],
    transition: {
      duration: 20, // Ultra slow
      repeat: Infinity,
      ease: "linear"
    }
  },
  entangled: {
    scale: 1.02,
    rotate: 0,
    opacity: 0.9,
    filter: 'hue-rotate(0deg) brightness(1.1)',
    transition: {
      duration: 2.4 // Ultra slow
    }
  },
  collapsed: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    filter: 'none',
    transition: {
      duration: 1.6 // Ultra slow
    }
  }
};

const rankTransitionEffects = {
  basic: {
    particles: 5,
    color: '#4A5568',
    speed: 1
  },
  enhanced: {
    particles: 10,
    color: '#4299E1',
    speed: 1.5
  },
  premium: {
    particles: 15,
    color: '#9F7AEA',
    speed: 2
  },
  mythic: {
    particles: 20,
    color: '#F6AD55',
    speed: 2.5
  }
};

// Enhanced particle system
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

const ThematicGlyph: React.FC<ThematicGlyphProps> = ({
  tier = 'system',
  rank = 'basic',
  size = 24,
  effect = 'none',
  className = '',
  isGalatea = false,
  userScore,
  entangledWith,
  quantumState = 'collapsed',
  entanglementPattern = 'paired',
  onStateChange,
  muted = false,
  isComposite = false,
  glyph, // Legacy prop
  description,
  dashboardMode = false, // New prop with default false
  isAnimated = true
}) => {
  const [currentRank, setCurrentRank] = useState(rank);
  const [transitioning, setTransitioning] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevRankRef = useRef(rank);
  
  // Create refs for audio elements
  const superpositionAudioRef = useRef<HTMLAudioElement>(null);
  const entangledAudioRef = useRef<HTMLAudioElement>(null);
  const interferenceAudioRef = useRef<HTMLAudioElement>(null);
  const tunnelingAudioRef = useRef<HTMLAudioElement>(null);
  const rankUpAudioRef = useRef<HTMLAudioElement>(null);
  
  const particleSystemRef = useRef<number>();

  // Sound effect system
  const playSound = (type: SoundEffectType) => {
    if (muted) return;
    
    let audioRef: React.RefObject<HTMLAudioElement> | null = null;
    
    switch (type) {
      case 'superposition':
        audioRef = superpositionAudioRef;
        break;
      case 'entangled':
        audioRef = entangledAudioRef;
        break;
      case 'interference':
        audioRef = interferenceAudioRef;
        break;
      case 'tunneling':
        audioRef = tunnelingAudioRef;
        break;
      case 'rankUp':
        audioRef = rankUpAudioRef;
        break;
    }
    
    if (audioRef?.current) {
      audioRef.current.src = SOUND_EFFECTS[type];
      audioRef.current.play().catch(() => {}); // Ignore autoplay restrictions
    }
  };

  // Enhanced particle system
  const createParticle = (effects: typeof rankTransitionEffects.basic): Particle => ({
    id: Math.random(),
    x: Math.random() * size,
    y: Math.random() * size,
    vx: (Math.random() - 0.5) * effects.speed * 2,
    vy: (Math.random() - 0.5) * effects.speed * 2,
    size: Math.random() * 3 + 1,
    color: effects.color,
    life: 1,
    maxLife: 1 + Math.random()
  });

  const updateParticles = () => {
    setParticles(prevParticles => 
      prevParticles
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.01,
          size: p.size * 0.99
        }))
        .filter(p => p.life > 0)
    );
  };

  // Enhanced entanglement system
  useEffect(() => {
    if (entangledWith && effect === 'entangled') {
      const entangledElements = entanglementPattern === 'paired' 
        ? [document.getElementById(entangledWith)]
        : document.querySelectorAll(`[data-entanglement-group="${entangledWith}"]`);

      const observers = Array.from(entangledElements).map(element => {
        if (!element) return null;

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
              const newState = element.getAttribute('data-state') as QuantumState;
              onStateChange?.(newState);
              if (newState === 'superposition' || newState === 'entangled' || 
                  newState === 'interference' || newState === 'tunneling') {
                playSound(newState);
              }
            }
          });
        });

        observer.observe(element, { attributes: true });
        return observer;
      });

      return () => observers.forEach(obs => obs?.disconnect());
    }
  }, [entangledWith, effect, entanglementPattern]);

  // Particle animation loop
  useEffect(() => {
    if (transitioning) {
      const animate = () => {
        updateParticles();
        particleSystemRef.current = requestAnimationFrame(animate);
      };
      particleSystemRef.current = requestAnimationFrame(animate);

      return () => {
        if (particleSystemRef.current) {
          cancelAnimationFrame(particleSystemRef.current);
        }
      };
    }
  }, [transitioning]);

  // Handle quantum state changes
  useEffect(() => {
    if (quantumState) {
      if (quantumState === 'superposition' || quantumState === 'entangled' || 
          quantumState === 'interference' || quantumState === 'tunneling') {
        playSound(quantumState);
      }
    }
  }, [quantumState]);

  // Handle rank transitions
  useEffect(() => {
    if (rank !== prevRankRef.current) {
      setTransitioning(true);
      const effects = rankTransitionEffects[rank];
      const newParticles = Array.from(
        { length: effects.particles }, 
        () => createParticle(effects)
      );
      setParticles(newParticles);
      playSound('rankUp');
      
      setTimeout(() => {
        setCurrentRank(rank);
        setTransitioning(false);
        prevRankRef.current = rank;
      }, 4000);
    }
  }, [rank]);

  // Quantum superposition effect
  const getSuperpositionStyle = () => {
    if (effect !== 'quantum') return '';
    return `
      @keyframes superposition {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
        50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
      }
    `;
  };

  // Get the appropriate image path based on props
  const getImagePath = () => {
    // If a direct glyph name is provided (legacy approach), use it
    if (glyph && typeof glyph === 'string' && glyph in glyphImages) {
      return glyphImages[glyph as keyof typeof glyphImages];
    }

    // Otherwise, derive the path from tier and rank
    const tierName = isComposite ? 'sigil' : tier;
    let glyphKey: keyof typeof glyphImages;

    if (isGalatea) {
      glyphKey = 'quantum-seal';
    } else if (tierName === 'system') {
      glyphKey = 'quantum-seal';
    } else if (tierName === 'user') {
      // Map user tiers to glyph images
      switch (rank) {
        case 'mythic': glyphKey = 'wayfinder'; break;
        case 'premium': glyphKey = 'triune'; break;
        case 'enhanced': glyphKey = 'sphinx'; break;
        default: glyphKey = 'nibiru-symbol';
      }
    } else if (tierName === 'item') {
      // Map item tiers to glyph images
      switch (rank) {
        case 'mythic': glyphKey = 'sigil-of-creation'; break;
        case 'premium': glyphKey = 'sigil-of-continuance'; break;
        case 'enhanced': glyphKey = 'seidr'; break;
        default: glyphKey = 'aegis';
      }
    } else if (tierName === 'sigil') {
      // Sigils use the more elaborate glyphs
      glyphKey = 'quantum-seal';
    } else {
      // Default fallback
      glyphKey = 'nibiru-symbol';
    }

    return glyphImages[glyphKey];
  };

  const getUserRank = (score?: number): GlyphRank => {
    if (!score) return 'basic';
    if (score >= 1000) return 'mythic';
    if (score >= 500) return 'premium';
    if (score >= 100) return 'enhanced';
    return 'basic';
  };

  const getEffectStyles = (tier: GlyphTier, effectType: GlyphEffect, isGalatea: boolean) => {
    if (isGalatea) return 'filter drop-shadow(0 0 8px rgba(251, 146, 60, 0.6)) animate-pulse';
    
    const baseEffects = getBaseEffect(effectType);
    const tierEffects = getTierEffects(tier);
    const quantumEffects = getQuantumEffects();
    
    return `${baseEffects} ${tierEffects} ${quantumEffects}`;
  };

  const getBaseEffect = (effectType: GlyphEffect): string => {
    switch (effectType) {
      case 'quantum':
        return 'animate-quantum';
      case 'entangled':
        return 'animate-entangled';
      case 'particles':
        return 'animate-particles';
      case 'glow':
        return 'filter drop-shadow(0 0 4px currentColor)';
      case 'pulse':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  const getTierEffects = (tier: GlyphTier): string => {
    switch (tier) {
      case 'user':
        return `animate-user-${getUserRank(userScore)}`;
      case 'item':
        return transitioning ? 'animate-rank-transition' : '';
      case 'system':
        return 'filter saturate(0.8)';
      default:
        return '';
    }
  };

  const getQuantumEffects = (): string => {
    switch (quantumState) {
      case 'superposition':
        return 'animate-superposition';
      case 'entangled':
        return 'animate-entangled';
      default:
        return '';
    }
  };

  // Determine if we should use motion effects
  const useMotion = effect !== 'none' && isAnimated;
  
  // Get the variant key based on quantum state or effect
  const getVariantKey = () => {
    if (effect === 'quantum') {
      return quantumState;
    } else if (['interference', 'tunneling', 'entangled'].includes(effect as string)) {
      return effect;
    }
    return 'collapsed';
  };
  
  // Only use animation variants if motion is enabled
  const variants = useMotion 
    ? (dashboardMode ? dashboardVariants : quantumVariants) 
    : undefined;
  
  // Only animate if motion is enabled
  const animationState = useMotion ? getVariantKey() : undefined;
  
  // Create separate animations for pulse and glow effects
  const animationProps = useMotion && (effect === 'pulse' || effect === 'glow') ? {
    animate: effect === 'pulse' 
      ? { 
          scale: [1, 1.05, 1],
          opacity: [0.9, 1, 0.9]
        }
      : {
          filter: [
            'brightness(1)', 
            'brightness(1.2)',
            'brightness(1)'
          ]
        },
    transition: { 
      duration: dashboardMode ? 3 : 1.5, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }
  } : {};

  return (
    <div className="relative">
      <audio ref={superpositionAudioRef} className="hidden" />
      <audio ref={entangledAudioRef} className="hidden" />
      <audio ref={interferenceAudioRef} className="hidden" />
      <audio ref={tunnelingAudioRef} className="hidden" />
      <audio ref={rankUpAudioRef} className="hidden" />
      <style>{getSuperpositionStyle()}</style>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${tier}-${currentRank}-${quantumState}-${glyph}`}
          variants={variants}
          animate={effect === 'pulse' || effect === 'glow' ? undefined : animationState}
          {...animationProps}
          className={`relative ${className}`}
          data-state={quantumState}
          data-entanglement-group={entangledWith}
          id={entangledWith ? `entangled-${entangledWith}` : undefined}
          style={{ width: size, height: size }}
        >
          <Image
            src={getImagePath()}
            alt={description || `${tier} glyph`}
            width={size}
            height={size}
            className={getEffectStyles(tier, effect, isGalatea)}
            loading="eager"
            priority={true}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_GLYPH;
            }}
          />
          {transitioning && particles.length > 0 && (
            <div 
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                background: particles.map(p => 
                  `radial-gradient(circle at ${p.x}px ${p.y}px, ${p.color} 0%, transparent ${p.size * 10}px)`
                ).join(', ')
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ThematicGlyph; 