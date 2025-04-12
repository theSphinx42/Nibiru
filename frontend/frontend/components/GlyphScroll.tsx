import { motion } from 'framer-motion';
import Image from 'next/image';

interface Glyph {
  name: string;
  path: string;
  description: string;
}

const GLYPHS: Glyph[] = [
  {
    name: 'aegis',
    path: '/images/glyphs/aegis.png',
    description: 'The Aegis - A symbol of divine protection and wisdom'
  },
  {
    name: 'sigil-of-continuance',
    path: '/images/glyphs/sigil-of-continuance.png',
    description: 'The Sigil of Continuance - Representing eternal flow and persistence'
  },
  {
    name: 'saphira',
    path: '/images/glyphs/saphira.png',
    description: 'The Saphira Glyph - Core symbol of quantum resonance'
  },
  {
    name: 'sharkskin',
    path: '/images/glyphs/sharkskin.png',
    description: 'The Sharkskin Pattern - Symbolizing adaptability and resilience'
  },
  {
    name: 'seidr',
    path: '/images/glyphs/seidr.png',
    description: 'The Seidr Weave - A pattern of mystical interconnections'
  },
  {
    name: 'sphinx',
    path: '/images/glyphs/sphinx.png',
    description: 'The Sphinx Riddle - Embodying mystery and wisdom'
  },
  {
    name: 'triune',
    path: '/images/glyphs/triune.png',
    description: 'The Triune Symbol - Representing the three pillars of creation'
  },
  {
    name: 'wayfinder',
    path: '/images/glyphs/wayfinder.png',
    description: 'The Wayfinder - Guiding through quantum realms'
  }
];

interface GlyphScrollProps {
  className?: string;
  glyphSize?: number;
  showTooltips?: boolean;
  animate?: boolean;
}

const GlyphScroll: React.FC<GlyphScrollProps> = ({
  className = '',
  glyphSize = 40,
  showTooltips = true,
  animate = true
}) => {
  return (
    <div className={`flex items-center justify-center gap-8 ${className}`}>
      {GLYPHS.map((glyph, index) => (
        <motion.div
          key={glyph.name}
          className="relative group"
          initial={animate ? { opacity: 0, y: 10 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
          }}
          whileHover={{ scale: 1.1 }}
        >
          <motion.div
            className="relative"
            animate={animate ? {
              rotate: [0, 360],
            } : false}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Image
              src={glyph.path}
              alt={`${glyph.name} - ${glyph.description}`}
              width={glyphSize}
              height={glyphSize}
              className="transition-all duration-300 filter grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100"
            />
          </motion.div>

          {showTooltips && (
            <motion.div
              className="absolute left-1/2 -bottom-8 transform -translate-x-1/2 px-2 py-1 bg-gray-900/90 
                       text-gray-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100
                       border border-gray-700/50 backdrop-blur-sm"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 0, y: -5 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-medium">{glyph.name}</div>
              <div className="text-gray-400 text-[10px]">{glyph.description}</div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default GlyphScroll; 