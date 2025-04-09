import Image from 'next/image';
import { motion } from 'framer-motion';
import ThematicGlyph from './ThematicGlyph';

const MarketplaceHero: React.FC = () => {
  return (
    <div className="relative py-16 bg-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/backgrounds/marketplace-pattern.jpg"
          alt="Marketplace pattern"
          fill
          className="object-cover opacity-20"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <ThematicGlyph
            glyph="quantum-seal"
            size={100}
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Quantum-Secured Digital Marketplace
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Discover unique digital artifacts protected by quantum-grade security.
            Each piece is authenticated and preserved for generations to come.
          </p>
          
          {/* Featured Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                image: '/images/categories/digital-art.jpg',
                title: 'Digital Art',
                description: 'Unique pieces from digital artists'
              },
              {
                image: '/images/categories/collectibles.jpg',
                title: 'Collectibles',
                description: 'Rare digital collectibles'
              },
              {
                image: '/images/categories/experiences.jpg',
                title: 'Experiences',
                description: 'Interactive digital experiences'
              }
            ].map((category, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-400">{category.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketplaceHero; 