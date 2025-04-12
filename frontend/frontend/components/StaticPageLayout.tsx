import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import Layout from './Layout';
import ThematicGlyph from './ThematicGlyph';
import { GlyphName } from '../types/glyph';

interface StaticPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  glyph?: GlyphName;
}

const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({
  children,
  title,
  description,
  glyph = 'sigil-of-continuance'
}) => {
  return (
    <Layout title={title} description={description}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative bg-gray-900/60 backdrop-blur-md border border-gray-800/50 rounded-2xl p-8 shadow-2xl overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-8">
              <ThematicGlyph
                glyph={glyph}
                size={80}
                className="mb-6"
              />
              <h1 className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                {title}
              </h1>
            </div>
            <div className="prose prose-invert max-w-none">
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default StaticPageLayout; 