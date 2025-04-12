import React, { useState } from 'react';
import ThematicGlyph from './ThematicGlyph';
import { GlyphTier, GlyphRank, GlyphEffect } from '@/types/glyph';

export const GlyphDevTools: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<GlyphTier>(GlyphTier.TIER_1);
  const [selectedRank, setSelectedRank] = useState<GlyphRank>(GlyphRank.BASIC);
  const [selectedEffect, setSelectedEffect] = useState<GlyphEffect>('none');

  const tiers = Object.values(GlyphTier);
  const ranks = Object.values(GlyphRank);
  const effects: GlyphEffect[] = [
    'none',
    'glow',
    'pulse',
    'rotate',
    'particles',
    'quantum',
    'entangled',
    'interference',
    'tunneling'
  ];

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Glyph Development Tools</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tier</label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as GlyphTier)}
            className="w-full bg-gray-700 text-white rounded p-2"
          >
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Rank</label>
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value as GlyphRank)}
            className="w-full bg-gray-700 text-white rounded p-2"
          >
            {ranks.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Effect</label>
          <select
            value={selectedEffect}
            onChange={(e) => setSelectedEffect(e.target.value as GlyphEffect)}
            className="w-full bg-gray-700 text-white rounded p-2"
          >
            {effects.map((effect) => (
              <option key={effect} value={effect}>
                {effect}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Preview current selection */}
        <div className="p-4 bg-gray-700 rounded-lg flex flex-col items-center">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Current Selection</h3>
          <ThematicGlyph
            tier={selectedTier}
            rank={selectedRank}
            effect={selectedEffect}
            size={64}
          />
        </div>

        {/* Quick presets */}
        <div className="p-4 bg-gray-700 rounded-lg flex flex-col items-center">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Tier 1 Basic</h3>
          <ThematicGlyph
            tier={GlyphTier.TIER_1}
            rank={GlyphRank.BASIC}
            effect="pulse"
            size={64}
          />
        </div>

        <div className="p-4 bg-gray-700 rounded-lg flex flex-col items-center">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Tier 2 Enhanced</h3>
          <ThematicGlyph
            tier={GlyphTier.TIER_2}
            rank={GlyphRank.ENHANCED}
            effect="glow"
            size={64}
          />
        </div>

        <div className="p-4 bg-gray-700 rounded-lg flex flex-col items-center">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Tier 3 Premium</h3>
          <ThematicGlyph
            tier={GlyphTier.TIER_3}
            rank={GlyphRank.PREMIUM}
            effect="pulse"
            size={64}
          />
        </div>
      </div>

      {/* Visual Test Deck */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-white mb-4">Visual Test Deck</h3>
        <div className="grid grid-cols-4 gap-4">
          {tiers.map((tier) => (
            ranks.map((rank) => (
              <div key={`${tier}-${rank}`} className="p-4 bg-gray-700 rounded-lg flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-2">{tier} - {rank}</p>
                <ThematicGlyph
                  tier={tier}
                  rank={rank}
                  effect={selectedEffect}
                  size={48}
                />
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
  );
}; 