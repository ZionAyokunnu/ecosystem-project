export interface Indicator {
  indicator_id: string;
  name: string;
  current_value: number;
  category: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Relationship {
  relationship_id: string;
  parent_id: string;
  child_id: string;
  influence_weight: number;
  correlation_score: number;
  created_at?: string;
  updated_at?: string;
}

export interface HistoricalTrend {
  trend_id: string;
  indicator_id: string;
  year: number;
  value: number;
  created_at?: string;
}

export interface SimulationProfile {
  simulation_id: string;
  name: string;
  description: string | null;
  user_id: string | null;
  created_at?: string;
}

export interface SimulationChange {
  change_id: string;
  simulation_id: string;
  indicator_id: string;
  previous_value: number;
  new_value: number;
  created_at?: string;
}

export interface SunburstNode {
  id: string;
  name: string;
  value: number;
  color: string;
  category?: string;
  parentIds?: string[];
}

export interface SunburstLink {
  parent_id: string;
  child_id: string;
  weight: number;
  correlation?: number;
}

export interface PredictionResult {
  indicator_id: string;
  years: number[];
  values: number[];
  summary: string;
}

export interface SimulationResult {
  changes: SimulationChange[];
  positiveDrivers: { indicator_id: string; name: string; value: number }[];
  negativeDrivers: { indicator_id: string; name: string; value: number }[];
  impact: string;
}

export interface UserSettings {
  maxDrillDepth: number;
  topDriversCount: number;
  showPercentileDrivers: boolean;
  percentileThreshold: number;
}
