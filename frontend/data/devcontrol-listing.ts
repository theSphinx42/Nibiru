import { MarketplaceListing } from '../services/api';

export const devControlListing: MarketplaceListing = {
  id: 'devcontrol-core',
  title: 'DevControl',
  description: `The ultimate quantum development environment for the Nibiru ecosystem. 
  Featuring advanced glyph integration, real-time quantum compilation, and seamless 
  deployment to the quantum realm.`,
  price: 0, // Free tier available
  rating: 5.0,
  downloads: 0,
  category: 'Development Tools',
  tags: ['quantum', 'development', 'tools', 'glyph-enabled'],
  image: '/images/glyphs/quantum-seal-enhanced.png', // High-tier glyph
  tier: 'mythic',
  creator_id: 'nibiru-admin',
  quantum_score: 999, // Maximum quantum score
  file_path: '/packages/devcontrol-core.zip',
  s3_file_key: 'devcontrol/core/v1.0.0',
  features: [
    'Real-time quantum compilation',
    'Advanced glyph integration',
    'Automated quantum optimization',
    'Multi-dimensional debugging',
    'Quantum state visualization',
    'Glyph-enhanced code analysis'
  ],
  tiers: [
    {
      name: 'Community',
      price: 0,
      features: [
        'Basic quantum development tools',
        'Community support',
        'Standard glyph integration'
      ]
    },
    {
      name: 'Professional',
      price: 49,
      features: [
        'Advanced quantum debugging',
        'Priority support',
        'Enhanced glyph capabilities',
        'Custom quantum backends'
      ]
    },
    {
      name: 'Enterprise',
      price: 199,
      features: [
        'Full quantum optimization suite',
        'Dedicated support team',
        'Custom glyph development',
        'Private quantum infrastructure'
      ]
    }
  ]
};

export const adminProfile = {
  id: 'nibiru-admin',
  displayName: 'Nibiru Guardian',
  role: 'ADMIN',
  tier: 'mythic',
  glyphTier: 3,
  quantumScore: 999,
  contributions: 9999,
  isVerified: true
};

export default devControlListing; 