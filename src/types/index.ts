
export interface Indicator {
  indicator_id: string;
  name: string;
  current_value: number;
  category: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  location_id: string;
  name: string;
  type: 'country' | 'region' | 'city' | 'ward';
  parent_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IndicatorValue {
  indicator_id: string;
  location_id: string;
  year: number;
  value: number;
  created_at?: string;
  updated_at?: string;
}

export interface Relationship {
  relationship_id: string;
  parent_id: string;
  child_id: string;
  influence_weight: number;
  influence_score: number;
  child_to_parent_weight: number;
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

export interface QualitativeStory {
  story_id: string;
  parent_id: string;
  child_id: string;
  story_text: string;
  author: string;
  location: string | null;
  created_at: string;
  photo?: string | null;
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
  influence_score: number;
  influence_weight: number;
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

export interface LocationPath {
  location_id: string;
  name: string;
  type: string;
  depth: number;
}

export interface LocationContext {
  selectedLocation: Location | null;
  targetLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  setTargetLocation: (location: Location | null) => void;
}
