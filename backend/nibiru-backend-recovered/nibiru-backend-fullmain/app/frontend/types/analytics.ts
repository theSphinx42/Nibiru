export interface JobMetrics {
  job_id: string;
  script_id: string;
  backend: string;
  user_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  duration: number | null;
  retry_count: number;
  retry_reasons: string[];
  resource_usage: Record<string, number>;
  quantum_score: number;
}

export interface AnalyticsSummary {
  total_jobs: number;
  success_rate: number;
  backend_usage: Record<string, number>;
  quantum_score: {
    average: number;
    distribution: QuantumScoreDistribution;
  };
  cost_metrics: CostBreakdown;
}

export interface CostBreakdown {
  total_cost: number;
  by_backend: Record<string, {
    total: number;
    gas_fees: number;
    backend_costs: number;
  }>;
  daily_costs: Array<{
    date: string;
    gas_fees: number;
    backend_costs: number;
  }>;
}

export interface RetryStats {
  matrix: number[][];
  total_retries: number;
  retry_reasons: Record<string, number>;
}

export interface QuantumScoreDistribution {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

export interface TrendData {
  dates: string[];
  success_rates: number[];
  total_jobs: number;
  success_count: number;
  failure_count: number;
}

export interface AnalyticsData {
  trends: Record<string, TrendData>;
  heatmap: Record<string, RetryStats>;
  aggregate: AnalyticsSummary;
  costs: CostBreakdown;
}

export interface PredictiveInsights {
  failure_risk: {
    backend: string;
    risk_score: number;
    factors: string[];
  }[];
  cost_forecast: {
    weekly: number;
    monthly: number;
    confidence: number;
    factors: string[];
  };
}

export interface UserScoreCard {
  rank: number;
  total_jobs: number;
  success_rate: number;
  avg_quantum_score: number;
  medals: string[];
  glyph_affinity: Record<string, number>;
  recent_achievements: string[];
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  quantum_score: number;
  total_jobs: number;
  success_rate: number;
  rank: number;
  medals: string[];
} 