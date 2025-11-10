export interface Domain {
  id: string;
  name: string;
  parent_id?: string;
  level: number;
  indicator_id?: string;
  description?: string;
  created_at: string;
}

export interface UserDomainProgress {
  user_id: string;
  domain_id: string;
  completion_count: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  last_completed_at?: string;
  cooldown_until?: string;
}

export interface UserExplorationHistory {
  id: string;
  user_id: string;
  parent_indicator_id: string;
  child_indicator_id: string;
  final_indicator_id: string;
  strength_rating: number;
  created_at: string;
}

export interface IndicatorRelationship {
  parent_indicator_id: string;
  child_indicator_id: string;
  correlation_coefficient: number;
  sample_size: number;
  calculated_at: string;
}
