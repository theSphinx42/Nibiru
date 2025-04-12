import { Service, SpiritGlyph } from '../types';
import { User, UserRole } from '../types/user';

export const mockUser: User = {
  id: 'mock-user-123',
  email: 'user@example.com',
  username: 'mockuser',
  displayName: 'Mock User',
  role: 'USER' as UserRole,
  quantumScore: 75,
  spiritGlyphTier: 1,
  profileImage: 'https://api.dicebear.com/7.x/personas/svg?seed=mock',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  services_published: 0,
  total_downloads: 0,
  average_rating: 0,
  weekly_stats: {
    views: 0,
    interactions: 0
  },
  monthly_stats: {
    views: 0,
    interactions: 0
  },
  followers: [],
  following: [],
  followerCount: 0,
  hasPaidOnboardingFee: true,
  isNewsletterSubscriber: false,
  unlockedPremiumAccess: {
    galatea: false
  }
};

export const mockServices = [
  {
    id: 1,
    title: "Nibiru DevControl",
    description: "Advanced development toolkit for Nibiru platform integration. Includes quantum-aware debugging, glyph manipulation APIs, and automated deployment tools.",
    price: 299.99,
    rating: 4.9,
    downloads: 1247,
    category: "Developer Tools",
    tags: ["development", "quantum", "api", "tools"],
    thumbnailUrl: "/images/devcontrol-preview.png",
    image: "/images/devcontrol-preview.png",
    quantumTier: 3,
    tier: "premium",
    features: [
      "Quantum-aware debugging interface",
      "Glyph manipulation API access",
      "Automated deployment tools",
      "Advanced metrics and analytics",
      "Priority support channel access"
    ],
    authorId: "nibiru-core",
    file_path: "devcontrol/v1.0.0/release.zip",
    quantum_score: 95,
    s3_file_key: "devcontrol-v1.0.0"
  },
  {
    id: '1',
    title: 'Quantum Pattern Analysis',
    description: 'Advanced pattern recognition using quantum algorithms',
    price: 299,
    rating: 4.8,
    downloads: 1234,
    category: 'Analysis',
    tags: ['quantum', 'pattern', 'analysis'],
    thumbnailUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=quantum',
    reviewCount: 56,
    authorId: '1',
    author: mockUser,
    createdAt: '2023-12-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Neural Network Optimizer',
    description: 'Optimize neural networks with quantum-inspired algorithms',
    price: 199,
    rating: 4.6,
    downloads: 856,
    category: 'Optimization',
    tags: ['neural', 'network', 'optimization'],
    thumbnailUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=neural',
    reviewCount: 42,
    authorId: '1',
    author: mockUser,
    createdAt: '2023-11-15',
    updatedAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'Quantum Data Encryption',
    description: 'Secure data encryption using quantum principles',
    price: 399,
    rating: 4.9,
    downloads: 2341,
    category: 'Security',
    tags: ['encryption', 'security', 'quantum'],
    thumbnailUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=encryption',
    reviewCount: 88,
    authorId: '2',
    author: {...mockUser, id: '2', username: 'Sarah Chen'},
    createdAt: '2023-10-20',
    updatedAt: '2024-02-05'
  },
  {
    id: '4',
    title: 'Consciousness Mapper',
    description: 'Map and analyze consciousness patterns',
    price: 499,
    rating: 4.7,
    downloads: 567,
    category: 'Analysis',
    tags: ['consciousness', 'mapping', 'analysis'],
    thumbnailUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=consciousness',
    reviewCount: 34,
    authorId: '1',
    author: mockUser,
    createdAt: '2024-01-05',
    updatedAt: '2024-02-12'
  },
  {
    id: '5',
    title: 'Quantum State Optimizer',
    description: 'Optimize quantum states for maximum efficiency',
    price: 299,
    rating: 4.5,
    downloads: 789,
    category: 'Optimization',
    tags: ['quantum', 'optimization', 'state'],
    thumbnailUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=state',
    reviewCount: 45,
    authorId: '3',
    author: {...mockUser, id: '3', username: 'Miguel Patel'},
    createdAt: '2023-12-15',
    updatedAt: '2024-01-30'
  },
  {
    id: '6',
    title: 'Beer4',
    description: '4th beer!',
    price: 1,
    rating: 4.2,
    downloads: 42,
    category: 'Tools & Utilities',
    tags: ['beer', 'testing', 'beverage'],
    thumbnailUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=beer4',
    reviewCount: 12,
    authorId: '1',
    author: mockUser,
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15'
  },
  {
    id: '7',
    title: 'Beer5',
    description: 'More beer',
    price: 1.00,
    rating: 4.3,
    downloads: 56,
    category: 'Tools & Utilities',
    tags: ['beer', 'testing', 'beverage'],
    thumbnailUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=beer5',
    reviewCount: 15,
    authorId: '1',
    author: mockUser,
    createdAt: '2024-03-20',
    updatedAt: '2024-03-20'
  },
  {
    id: '8',
    title: 'Beer',
    description: 'Beer6',
    price: 0.00,
    rating: 4.0,
    downloads: 78,
    category: 'Tools & Utilities',
    tags: ['beer', 'active', 'free'],
    thumbnailUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=beer6',
    reviewCount: 22,
    authorId: '1',
    author: mockUser,
    createdAt: '2024-03-25',
    updatedAt: '2024-03-25'
  },
  {
    id: '9',
    title: 'Beer7',
    description: 'another beer, we ride!',
    price: 1.00,
    rating: 4.8,
    downloads: 124,
    category: 'Education',
    tags: ['beer', 'active', 'beverage', 'premium'],
    thumbnailUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=beer7',
    reviewCount: 32,
    authorId: '1',
    author: mockUser,
    createdAt: '2024-04-01',
    updatedAt: '2024-04-01'
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