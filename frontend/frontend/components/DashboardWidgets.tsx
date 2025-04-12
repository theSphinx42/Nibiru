import React from 'react';
import { motion } from 'framer-motion';
import { mockUser, mockMetrics, mockGlyph, mockServices } from '@/utils/mockData';
import SpiritGlyphViewer from './SpiritGlyphViewer';

const DashboardWidgets: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {/* Quantum Score Widget */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">Quantum Score</h3>
        <div className="text-4xl font-bold text-blue-400">
          {mockUser.quantumScore}
        </div>
        <div className="mt-2 text-green-400 text-sm">
          +15 this week
        </div>
      </motion.div>

      {/* Network Connections */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">Network</h3>
        <div className="text-4xl font-bold text-purple-400">
          {mockUser.quantumScore}
        </div>
        <div className="mt-2 text-gray-400 text-sm">
          Quantum Score
        </div>
      </motion.div>

      {/* Active Listings */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">Services</h3>
        <div className="text-4xl font-bold text-green-400">
          {mockServices.length}
        </div>
        <div className="mt-2 text-gray-400 text-sm">
          Total Services
        </div>
      </motion.div>

      {/* Spirit Glyph Preview */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-2 lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">Spirit Glyph</h3>
        <img
          src="/images/quantum-placeholder-2.png"
          alt="Spirit Glyph"
          className="w-full h-32 object-cover rounded-lg shadow-md"
        />
      </motion.div>

      {/* Weekly Metrics */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">Weekly Metrics</h3>
        <div className="space-y-4">
          {Object.entries(mockMetrics.weekly).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="font-bold">
                {value as number}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <ul className="list-disc pl-5">
          <li>Created a new service</li>
          <li>Updated your profile</li>
          <li>Received a new connection</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default DashboardWidgets; 