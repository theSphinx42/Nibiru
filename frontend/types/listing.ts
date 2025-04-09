export enum ListingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  TESTING = 'testing'
}

export enum ListingCategory {
  MODEL = 'model',
  DATASET = 'dataset',
  PLUGIN = 'plugin',
  TEMPLATE = 'template',
  OTHER = 'other'
}

export interface Template {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  defaults: {
    title_format: string;
    description: string;
    glyph_tier: number;
    category: string;
    suggested_price: {
      basic: number;
      pro: number;
      enterprise: number;
    };
  };
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  price: number;
  tier: number;
  creator_id: string;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  downloads: number;
  quantum_score: number;
  file_path: string;
  s3_file_key: string;
  glyph_id?: string;
  invocation_enabled?: boolean;
  is_visible?: boolean;
  thumbnail_url?: string;
  rating?: number;
  reviews?: number;
  tags?: string[];
  is_beer?: boolean;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ListingFormData {
  title: string;
  description: string;
  glyph_tier: number;
  category: string;
  pricing: {
    basic: number;
    pro: number;
    enterprise: number;
  };
  template_id?: string;
}

export interface ListingCreate {
  title: string;
  description: string;
  category: ListingCategory;
  price: number;
  tier: number;
  file: File;
}

export interface ListingUpdate {
  title?: string;
  description?: string;
  category?: ListingCategory;
  price?: number;
  tier?: number;
  status?: ListingStatus;
  glyph_id?: string;
  invocation_enabled?: boolean;
  is_visible?: boolean;
} 