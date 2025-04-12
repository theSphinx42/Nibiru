import { motion } from 'framer-motion';

interface UserGlyphProps {
  userId: string;
  status: 'new' | 'active' | 'senior' | 'legendary';
  size?: 'sm' | 'md' | 'lg';
}

export const UserGlyph = ({ userId, status, size = 'md' }: UserGlyphProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const statusColors = {
    new: 'from-green-400 to-emerald-500',
    active: 'from-blue-400 to-indigo-500',
    senior: 'from-purple-400 to-violet-500',
    legendary: 'from-yellow-400 to-amber-500'
  };

  return (
    <motion.div
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className={`relative ${sizeClasses[size]}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${statusColors[status]} rounded-full opacity-20`} />
      <div className={`absolute inset-1 bg-gradient-to-br ${statusColors[status]} rounded-full opacity-40`} />
      <div className={`absolute inset-2 bg-gradient-to-br ${statusColors[status]} rounded-full opacity-60`} />
      <div className={`absolute inset-3 bg-gradient-to-br ${statusColors[status]} rounded-full opacity-80`} />
    </motion.div>
  );
}; 