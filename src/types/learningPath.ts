export interface LearningNode {
  id: string;
  sequence_day: number;
  node_type: 'domain_drill' | 'connection_explore' | 'local_measure' | 'knowledge_review';
  week_number: number;
  day_in_week: number;
  title: string;
  description?: string;
  estimated_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  unlock_requirements?: any;
  created_at: string;
}

export interface UserNodeProgress {
  id: string;
  user_id: string;
  node_id: string;
  status: 'locked' | 'available' | 'current' | 'completed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  insights_earned: number;
  completion_data?: any;
  hearts_spent: number;
  is_practice_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPathState {
  user_id: string;
  current_day: number;
  furthest_unlocked_day: number;
  total_days_completed: number;
  current_streak: number;
  longest_streak: number;
  preferred_domains: string[];
  exploration_domains: string[];
  last_session_date: string;
  created_at: string;
  updated_at: string;
}

export interface LocalMeasurement {
  id: string;
  user_id: string;
  node_id: string;
  indicator_id: string;
  location_id?: string;
  current_state_rating: number;
  trend_direction: number;
  personal_confidence: number;
  community_confidence?: number;
  qualitative_notes?: string;
  improvement_suggestions?: string;
  response_time_seconds?: number;
  created_at: string;
}

export interface UserIndicatorHistory {
  id: string;
  user_id: string;
  indicator_id: string;
  usage_day: number;
  usage_type: 'domain_focus' | 'connection_parent' | 'connection_child' | 'measurement_target';
  domain_context?: string;
  cooldown_until_day: number;
  created_at: string;
}

export interface UserDomainProgress {
  id: string;
  user_id: string;
  domain_id: string;
  domain_level: number;
  times_explored: number;
  last_explored_day?: number;
  proficiency_score: number;
  confidence_level: number;
  created_at: string;
  updated_at: string;
}

export interface DailyQuest {
  id: string;
  quest_type: 'complete_nodes' | 'explore_domain' | 'consistency_streak' | 'measurement_quality' | 'connection_discovery';
  title: string;
  description: string;
  target_value: number;
  insights_reward: number;
  badge_reward?: string;
  is_daily: boolean;
  is_weekly: boolean;
  created_at: string;
}

export interface UserDailyQuest {
  id: string;
  user_id: string;
  quest_id: string;
  assigned_date: string;
  current_progress: number;
  target_progress: number;
  completed_at?: string;
  insights_earned: number;
  created_at: string;
}

export interface LearningAchievement {
  id: string;
  achievement_type: 'streak_master' | 'domain_explorer' | 'connection_expert' | 'local_champion' | 'consistency_king';
  title: string;
  description: string;
  icon_name?: string;
  unlock_condition: any;
  insights_reward: number;
  badge_granted?: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress_data?: any;
}
