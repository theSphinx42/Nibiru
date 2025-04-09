export interface User {
  id: string;
  username: string;
  email: string;
  quantumScore: number;
  bio?: string;
  website?: string;
  twitter?: string;
  github?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  thumbnailUrl?: string;
  downloads: number;
  rating: number;
  reviewCount: number;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceForm {
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  thumbnailUrl?: string;
}

export interface SpiritGlyph {
  id: string;
  pattern: string;
  resonance: number;
  timestamp: string;
  userId: string;
  metadata?: {
    complexity: number;
    harmony: number;
    stability: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export type ApiResponse<T> = {
  data: T;
  message?: string;
  status: number;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 