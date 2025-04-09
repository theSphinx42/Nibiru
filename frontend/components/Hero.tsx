import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ThematicGlyph from './ThematicGlyph';

const Hero: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/backgrounds/hero-bg.jpg"
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
      >
        <ThematicGlyph
          glyph="sigil-of-creation"
          size={120}
          className="mx-auto mb-8"
        />
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Create, Preserve, Transform
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200">
          Join the digital renaissance where creation meets preservation.
          Discover the power of quantum-secured digital artifacts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/marketplace"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Explore Marketplace
          </Link>
          <Link
            href="/create"
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Start Creating
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero; 