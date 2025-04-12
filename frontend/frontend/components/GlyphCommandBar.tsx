import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlyphViewer from './GlyphViewer';
import { GlyphName } from './ThematicGlyph';

export type GlyphCommand = 'fire' | 'air' | 'water' | 'earth' | 'light' | 'dark';

interface GlyphCommandBarProps {
  onCommand: (command: GlyphCommand) => Promise<void>;
  activeCommand?: GlyphCommand | null;
  className?: string;
}

const GLYPH_COMMANDS = [
  {
    id: 'fire',
    symbol: '🜂',
    name: 'Fire',
    description: 'Send last Saphira message as a prompt to Claude',
    shortcut: 'Alt+F',
    glyph: 'sigil-of-creation' as GlyphName
  },
  {
    id: 'air',
    symbol: '🜁',
    name: 'Air',
    description: 'Summon Saphira to refine Claude\'s output',
    shortcut: 'Alt+A',
    glyph: 'quantum-seal' as GlyphName
  },
  {
    id: 'water',
    symbol: '🜃',
    name: 'Water',
    description: 'Save current message to Chronicle',
    shortcut: 'Alt+W',
    glyph: 'sigil-of-continuance' as GlyphName
  },
  {
    id: 'earth',
    symbol: '🜄',
    name: 'Earth',
    description: 'Validate message syntax/structure',
    shortcut: 'Alt+E',
    glyph: 'saphira-was-here' as GlyphName
  },
  {
    id: 'light',
    symbol: '🜇',
    name: 'Light',
    description: 'Open diff viewer between last 2 messages',
    shortcut: 'Alt+L',
    glyph: 'nibiru-symbol' as GlyphName
  },
  {
    id: 'dark',
    symbol: '🝗',
    name: 'Dark',
    description: 'Archive current thread and clear pipeline',
    shortcut: 'Alt+D',
    glyph: 'quantum-seal' as GlyphName
  }
] as const;

const GlyphCommandBar: React.FC<GlyphCommandBarProps> = ({
  onCommand,
  activeCommand,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.altKey && !isProcessing) {
        const command = GLYPH_COMMANDS.find(
          cmd => cmd.shortcut.endsWith(e.key.toUpperCase())
        );
        
        if (command) {
          e.preventDefault();
          setIsProcessing(true);
          await onCommand(command.id as GlyphCommand);
          setIsProcessing(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCommand, isProcessing]);

  const handleClick = async (command: GlyphCommand) => {
    if (!isProcessing) {
      setIsProcessing(true);
      await onCommand(command);
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {GLYPH_COMMANDS.map((command) => (
        <motion.div
          key={command.id}
          className="relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleClick(command.id as GlyphCommand)}
        >
          <GlyphViewer
            glyph={command.glyph}
            size={48}
            isAnimated={true}
            effect="glow"
            className={`cursor-pointer transition-all duration-300
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              ${activeCommand === command.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
            `}
            description={command.description}
          />
          
          {/* Tooltip */}
          <motion.div
            className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2
                     bg-gray-900 text-white text-sm rounded-lg px-3 py-2
                     opacity-0 group-hover:opacity-100 transition-opacity
                     pointer-events-none whitespace-nowrap z-50"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="font-medium flex items-center gap-2">
              <span>{command.symbol}</span>
              <span>{command.name}</span>
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {command.description}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {command.shortcut}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default GlyphCommandBar; 