export const sampleUser = {
  id: '1',
  username: 'Alex Mercer',
  email: 'alex.mercer@quantum.io',
  quantumScore: 1280,
  bio: 'Quantum consciousness explorer and digital architect',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  createdAt: '2024-01-01',
  stats: {
    servicesPublished: 12,
    totalDownloads: 1458,
    averageRating: 4.8,
    quantumResonance: 89
  }
};

export const sampleServices = [
  {
    id: '1',
    title: 'Quantum Pattern Analyzer',
    description: 'Advanced tool for analyzing quantum patterns in consciousness data streams.',
    price: 299.99,
    category: 'Analysis',
    tags: ['quantum', 'analysis', 'patterns'],
    author: sampleUser,
    downloads: 256,
    rating: 4.9,
    thumbnailUrl: '/images/services/quantum-analyzer.jpg'
  },
  {
    id: '2',
    title: 'Consciousness Stream Decoder',
    description: 'Real-time decoder for consciousness data streams with quantum encryption.',
    price: 199.99,
    category: 'Tools',
    tags: ['decoder', 'streams', 'real-time'],
    author: sampleUser,
    downloads: 189,
    rating: 4.7,
    thumbnailUrl: '/images/services/stream-decoder.jpg'
  },
  // Add more sample services...
];

export const sampleGlyphs = [
  {
    id: '1',
    pattern: `
      M150 150 
      L75 75 
      L150 0 
      L225 75 
      Z
      M150 150 
      L75 225 
      L150 300 
      L225 225 
      Z
    `,
    resonance: 89.4,
    timestamp: '2024-03-05T12:00:00Z',
    metadata: {
      complexity: 0.78,
      harmony: 0.92,
      stability: 0.85
    }
  },
  // Add more sample glyphs...
];

export const sampleMetrics = {
  daily: {
    downloads: 127,
    views: 342,
    revenue: 899.99,
    quantumGrowth: 15
  },
  weekly: {
    topService: 'Quantum Pattern Analyzer',
    totalEarnings: 2499.99,
    newSubscribers: 45,
    averageResonance: 87.5
  }
}; 