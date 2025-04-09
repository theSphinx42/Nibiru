import { User, Service, SpiritGlyph } from '../types';

export const mockUser = {
  id: '1',
  username: 'Alex Mercer',
  email: 'alex.mercer@quantum.io',
  quantumScore: 85,
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

export const mockServices = [
  {
    id: 1,
    title: 'Quantum Pattern Analysis',
    description: 'Advanced pattern recognition using quantum algorithms',
    price: 299,
    rating: 4.8,
    downloads: 1234,
    category: 'Analysis',
    tags: ['quantum', 'pattern', 'analysis'],
    image: 'https://api.dicebear.com/7.x/identicon/svg?seed=quantum'
  },
  {
    id: 2,
    title: 'Neural Network Optimizer',
    description: 'Optimize neural networks with quantum-inspired algorithms',
    price: 199,
    rating: 4.6,
    downloads: 856,
    category: 'Optimization',
    tags: ['neural', 'network', 'optimization'],
    image: 'https://api.dicebear.com/7.x/identicon/svg?seed=neural'
  },
  {
    id: 3,
    title: 'Quantum Data Encryption',
    description: 'Secure data encryption using quantum principles',
    price: 399,
    rating: 4.9,
    downloads: 2341,
    category: 'Security',
    tags: ['encryption', 'security', 'quantum'],
    image: 'https://api.dicebear.com/7.x/identicon/svg?seed=encryption'
  },
  {
    id: 4,
    title: 'Consciousness Mapper',
    description: 'Map and analyze consciousness patterns',
    price: 499,
    rating: 4.7,
    downloads: 567,
    category: 'Analysis',
    tags: ['consciousness', 'mapping', 'analysis'],
    image: 'https://api.dicebear.com/7.x/identicon/svg?seed=consciousness'
  },
  {
    id: 5,
    title: 'Quantum State Optimizer',
    description: 'Optimize quantum states for maximum efficiency',
    price: 299,
    rating: 4.5,
    downloads: 789,
    category: 'Optimization',
    tags: ['quantum', 'optimization', 'state'],
    image: 'https://api.dicebear.com/7.x/identicon/svg?seed=state'
  }
];

export const mockGlyph = {
  pattern: 'quantum-spiral',
  color: '#60A5FA',
  resonance: 0.89,
  complexity: 0.76
};

export const mockMetrics = {
  weekly: {
    views: 245,
    engagement: 0.78,
    interactions: 89
  },
  monthly: {
    views: 982,
    engagement: 0.82,
    interactions: 367
  },
  quarterly: {
    views: 2890,
    engagement: 0.85,
    conversions: 156
  },
  yearly: {
    revenue: 45600,
    growth: 0.23
  }
}; 