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
  type: 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward';
  parent_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LocationWithEngagement extends Location {
  survey_responses: number;
  story_count: number;
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
  created_at?: string;
  updated_at?: string;
  child_to_parent_weight?: number;
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
  depth: number;
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

export interface CommunityStory {
  id: string;
  indicator_id: string;
  location_id: string;
  title: string;
  body: string;
  created_at: string;
  votes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'resident' | 'community_rep' | 'admin' | 'researcher' | 'business';
  location_id: string;
  phoneNumber?: string;
  gender?: string;
  ageGroup?: string;
  hasCompletedOnboarding: boolean;
}

export interface Survey {
  id?: string;
  survey_id: string;
  title: string;
  domain: string;
  description?: string;
  is_compulsory: boolean;
  is_voice_enabled?: boolean;
  justification?: string;
  demographic_filters?: {
    genders: string[];
    age_groups: string[];
  };
  estimated_duration_minutes?: number;
  approved_by_rep?: string;
  approved_at?: string;
  declined_reason?: string;
  applicable_roles: string[];
  created_by: string;
  target_location?: string;
  status: 'active' | 'archived' | 'pending_approval' | 'draft' | 'declined' | 'completed';
  created_at?: string;
  updated_at?: string;
  
  // Legacy/computed fields for compatibility
  participantCount?: number;
  estimatedTime?: string;
  category?: string;
}

export interface SurveyQuestion {
  question_id: string;
  survey_id: string;
  parent_indicator_id: string;
  child_indicator_id: string;
  prompt: string;
  input_type: 'slider' | 'select' | 'file';
  allow_file_upload: boolean;
  allow_additional_indicator: boolean;
  is_required: boolean;
  branching_condition?: string;
  created_at?: string;
}

export interface RelationshipUserResponse {
  response_id: string;
  user_id: string;
  parent_id: string;
  child_id: string;
  domain: string;
  strength_score: number;
  direction: 'A→B' | 'B→A' | 'Mutual' | 'Unclear';
  notes_file_url?: string;
  additional_indicator_ids?: string[];
  created_at: string;
}

export interface SimulationModalState {
  isOpen: boolean;
  targetIndicatorId?: string;
}
