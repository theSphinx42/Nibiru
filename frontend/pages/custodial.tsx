import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import GlyphBackground from '../components/canvas-extras/GlyphBackground';
import ThematicGlyph from '../components/ThematicGlyph';

const CustodialProtocol = () => {
  return (
    <Layout>
      <div className="relative min-h-screen">
        {/* Background Glyph */}
        <GlyphBackground
          glyph="sigil-of-continuance"
          size={600}
          opacity={0.05}
          className="fixed top-1/2 right-0 transform -translate-y-1/2 translate-x-1/4"
          effect="orbit"
        />

        <div className="max-w-4xl mx-auto px-4 py-16 relative">
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-8">
                <ThematicGlyph
                  glyph="sigil-of-continuance"
                  size={120}
                  effect="glow"
                  description="The Sigil of Continuance - Symbol of the Custodial Protocol"
                />
              </div>
              <h1 className="text-4xl font-bold text-gray-200">
                The Nibiru Custodial Protocol
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Ensuring the preservation and continuity of digital creations through
                decentralized custodianship.
              </p>
            </div>

            {/* Content Sections */}
            <div className="prose prose-invert max-w-none">
              <section className="space-y-6">
                <h2>Overview</h2>
                <p>
                  The Nibiru Custodial Protocol is a groundbreaking system designed to
                  protect and preserve digital assets when their original creators become
                  inactive. Through a carefully designed set of rules and mechanisms,
                  we ensure that valuable creations remain accessible and maintained.
                </p>
              </section>

              <section className="space-y-6">
                <h2>How It Works</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                    <h3>Custodianship Criteria</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Creator inactivity period exceeds threshold</li>
                      <li>Asset maintains active usage or value</li>
                      <li>Community nomination and voting</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                    <h3>Custodian Responsibilities</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Maintain and update the asset</li>
                      <li>Preserve original creator attribution</li>
                      <li>Handle support and community engagement</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2>Recovery Process</h2>
                <p>
                  Original creators can reclaim their assets through our recovery process:
                </p>
                <ol className="list-decimal list-inside space-y-4">
                  <li>Submit identity verification</li>
                  <li>Provide proof of original ownership</li>
                  <li>Complete recovery request form</li>
                  <li>Undergo community review period</li>
                  <li>Regain control upon approval</li>
                </ol>
              </section>

              <section className="space-y-6">
                <h2>Benefits</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h3>For Creators</h3>
                    <ul className="mt-4 space-y-2">
                      <li>Peace of mind for asset continuity</li>
                      <li>Maintained revenue streams</li>
                      <li>Preserved attribution</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h3>For Users</h3>
                    <ul className="mt-4 space-y-2">
                      <li>Uninterrupted access</li>
                      <li>Continued support</li>
                      <li>Regular updates</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h3>For Community</h3>
                    <ul className="mt-4 space-y-2">
                      <li>Preserved knowledge base</li>
                      <li>Active participation</li>
                      <li>Sustainable ecosystem</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            {/* Call to Action */}
            <div className="text-center space-y-6">
              <p className="text-xl text-gray-300">
                Join us in preserving the future of digital creation.
              </p>
              <motion.button
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg text-lg
                         hover:bg-indigo-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More About Custodianship
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CustodialProtocol; 