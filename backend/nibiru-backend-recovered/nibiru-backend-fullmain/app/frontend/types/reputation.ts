export enum BadgeType {
  // Contribution Milestones
  PIONEER = 'pioneer',
  CONTRIBUTOR = 'contributor',
  MASTER = 'master',
  GRANDMASTER = 'grandmaster',
  
  // Activity Streaks
  ACTIVE_STREAK_7 = 'active_streak_7',
  ACTIVE_STREAK_30 = 'active_streak_30',
  ACTIVE_STREAK_90 = 'active_streak_90',
  
  // Score Milestones
  HIGH_SCORE_1000 = 'high_score_1000',
  HIGH_SCORE_5000 = 'high_score_5000',
  HIGH_SCORE_10000 = 'high_score_10000',
  
  // Community Impact
  HELPER = 'helper',
  MENTOR = 'mentor',
  EXPERT = 'expert',
  
  // Marketplace Success
  SELLER = 'seller',
  TOP_SELLER = 'top_seller',
  MARKETPLACE_LEADER = 'marketplace_leader',
  
  // Special Achievements
  INNOVATOR = 'innovator',
  COLLABORATOR = 'collaborator',
  TRENDING = 'trending',
}

export enum ContributionType {
  CODE = 'code',
  DESIGN = 'design',
  AI_MODEL = 'ai_model',
  THREE_D_MODEL = '3d_model',
  REVIEW = 'review',
  COMMENT = 'comment',
  ANSWER = 'answer',
}

export enum ContributionSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export interface MarketplaceStats {
  total_sales: number;
  total_revenue: number;
  rank: number | null;
  top_selling_items: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export interface ImpactMetrics {
  total_views: number;
  total_downloads: number;
  total_interactions: number;
  unique_users: number;
}

export interface TimeStats {
  daily: { contributions: number; engagement: number };
  weekly: { contributions: number; engagement: number };
  monthly: { contributions: number; engagement: number };
  yearly: { contributions: number; engagement: number };
}

export interface Badge {
  id: number;
  badge_type: BadgeType;
  earned_at: string;
  metadata: Record<string, any>;
  is_featured: boolean;
}

export interface Activity {
  id: number;
  type: 'contribution' | 'engagement' | 'transaction';
  description: string;
  created_at: string;
  points?: number;
  metadata?: Record<string, any>;
}

export interface UserStats {
  marketplace_stats: MarketplaceStats;
  impact_metrics: ImpactMetrics;
  time_stats: TimeStats;
  badges: Badge[];
  recent_activity: Activity[];
} 