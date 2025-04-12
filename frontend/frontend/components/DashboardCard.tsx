import { motion } from 'framer-motion';
import GlyphViewer from './GlyphViewer';

interface DashboardCardProps {
  title: string;
  value: string | number;
  type: 'quantum' | 'glyph' | 'listings' | 'network';
  status?: 'new' | 'active' | 'senior' | 'legendary';
  className?: string;
  seed?: string;
}

export const DashboardCard = ({ 
  title, 
  value, 
  type, 
  status = 'active', 
  className = '',
  seed = '0xSPIRIT-default',
}: DashboardCardProps) => {
  const renderGlyph = () => {
    // Use GlyphViewer for all types, with different seeds and tiers
    const glyphSeed = type === 'quantum' ? 
      `0xQUANTUM-${seed}` : 
      type === 'listings' ? 
        `0xLISTING-${seed}` : 
        `0xSPIRIT-${seed}`;

    return (
      <GlyphViewer
        seed={glyphSeed}
        size={80}
        tier={2}
        isGenerating={false}
      />
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`aspect-square p-6 rounded-full bg-nibiru-card backdrop-blur-sm border border-nibiru-accent/10 flex flex-col items-center justify-center ${className}`}
    >
      <h3 className="text-lg font-medium text-nibiru-text-secondary mb-2 text-center">{title}</h3>
      <div className="flex flex-col items-center gap-4">
        <span className="text-4xl font-bold text-white">{value}</span>
        <div className="w-20 h-20">{renderGlyph()}</div>
      </div>
    </motion.div>
  );
}; 