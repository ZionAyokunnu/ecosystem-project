-- 1. Core Path Structure Tables
CREATE TABLE learning_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_day INTEGER NOT NULL UNIQUE,
  node_type TEXT CHECK (node_type IN ('domain_drill', 'connection_explore', 'local_measure', 'knowledge_review')) NOT NULL,
  week_number INTEGER GENERATED ALWAYS AS ((sequence_day - 1) / 7 + 1) STORED,
  day_in_week INTEGER GENERATED ALWAYS AS ((sequence_day - 1) % 7 + 1) STORED,
  title TEXT NOT NULL,
  description TEXT,
  estimated_minutes INTEGER DEFAULT 3,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  unlock_requirements JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_node_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  node_id UUID REFERENCES learning_nodes(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('locked', 'available', 'current', 'completed', 'skipped')) DEFAULT 'locked',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  insights_earned INTEGER DEFAULT 0,
  completion_data JSONB,
  hearts_spent INTEGER DEFAULT 0,
  is_practice_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, node_id)
);

CREATE TABLE user_path_state (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_day INTEGER NOT NULL DEFAULT 1,
  furthest_unlocked_day INTEGER NOT NULL DEFAULT 1,
  total_days_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  preferred_domains TEXT[] DEFAULT '{}',
  exploration_domains TEXT[] DEFAULT '{}',
  last_session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Domain & Indicator Management Tables
CREATE TABLE user_indicator_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  indicator_id UUID REFERENCES indicators(indicator_id) ON DELETE CASCADE,
  usage_day INTEGER NOT NULL,
  usage_type TEXT CHECK (usage_type IN ('domain_focus', 'connection_parent', 'connection_child', 'measurement_target')) NOT NULL,
  domain_context TEXT,
  cooldown_until_day INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, indicator_id, usage_day, usage_type)
);

CREATE TABLE user_domain_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  domain_id TEXT,
  domain_level INTEGER NOT NULL,
  times_explored INTEGER DEFAULT 0,
  last_explored_day INTEGER,
  proficiency_score FLOAT DEFAULT 0.0,
  confidence_level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, domain_id)
);

-- 3. Local Measurement System
CREATE TABLE local_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  node_id UUID REFERENCES learning_nodes(id) ON DELETE CASCADE,
  indicator_id UUID REFERENCES indicators(indicator_id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(location_id),
  current_state_rating INTEGER CHECK (current_state_rating BETWEEN 1 AND 5) NOT NULL,
  trend_direction INTEGER CHECK (trend_direction BETWEEN 1 AND 5) NOT NULL,
  personal_confidence INTEGER CHECK (personal_confidence BETWEEN 1 AND 5) NOT NULL,
  community_confidence INTEGER CHECK (community_confidence BETWEEN 1 AND 5),
  qualitative_notes TEXT,
  improvement_suggestions TEXT,
  response_time_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Enhanced Survey Integration
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS node_id UUID REFERENCES learning_nodes(id);
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS learning_context JSONB;
ALTER TABLE relationship_user_responses ADD COLUMN IF NOT EXISTS node_id UUID REFERENCES learning_nodes(id);
ALTER TABLE relationship_user_responses ADD COLUMN IF NOT EXISTS confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 5);

-- 5. Gamification Tables
CREATE TABLE daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_type TEXT CHECK (quest_type IN ('complete_nodes', 'explore_domain', 'consistency_streak', 'measurement_quality', 'connection_discovery')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  insights_reward INTEGER DEFAULT 5,
  badge_reward TEXT,
  is_daily BOOLEAN DEFAULT TRUE,
  is_weekly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES daily_quests(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER NOT NULL,
  completed_at TIMESTAMP,
  insights_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, quest_id, assigned_date)
);

CREATE TABLE learning_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_type TEXT CHECK (achievement_type IN ('streak_master', 'domain_explorer', 'connection_expert', 'local_champion', 'consistency_king')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT,
  unlock_condition JSONB NOT NULL,
  insights_reward INTEGER DEFAULT 10,
  badge_granted TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES learning_achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress_data JSONB,
  UNIQUE(user_id, achievement_id)
);

-- 6. Content Generation Tables  
CREATE TABLE path_content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type TEXT CHECK (node_type IN ('domain_drill', 'connection_explore', 'local_measure', 'knowledge_review')) NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  title_template TEXT NOT NULL,
  description_template TEXT NOT NULL,
  content_rules JSONB NOT NULL,
  prerequisites JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_learning_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  prefers_deep_dive BOOLEAN DEFAULT FALSE,
  prefers_variety BOOLEAN DEFAULT TRUE,
  challenge_level TEXT CHECK (challenge_level IN ('comfortable', 'moderate', 'challenging')) DEFAULT 'moderate',
  likes_quantitative BOOLEAN DEFAULT TRUE,
  likes_qualitative BOOLEAN DEFAULT TRUE,
  prefers_local_focus BOOLEAN DEFAULT TRUE,
  enjoys_comparisons BOOLEAN DEFAULT FALSE,
  optimal_session_length INTEGER DEFAULT 5,
  prefers_daily_consistency BOOLEAN DEFAULT TRUE,
  weekend_activity_level TEXT CHECK (weekend_activity_level IN ('none', 'light', 'normal')) DEFAULT 'normal',
  avg_session_length_minutes FLOAT,
  consistency_pattern JSONB,
  difficulty_progression_rate FLOAT DEFAULT 0.1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create Indexes for Performance
CREATE INDEX idx_learning_nodes_sequence ON learning_nodes(sequence_day);
CREATE INDEX idx_learning_nodes_type ON learning_nodes(node_type);
CREATE INDEX idx_user_node_progress_user ON user_node_progress(user_id);
CREATE INDEX idx_user_node_progress_status ON user_node_progress(user_id, status);
CREATE INDEX idx_user_indicator_history_user ON user_indicator_history(user_id);
CREATE INDEX idx_user_indicator_history_cooldown ON user_indicator_history(user_id, cooldown_until_day);
CREATE INDEX idx_local_measurements_user ON local_measurements(user_id);
CREATE INDEX idx_user_path_state_current ON user_path_state(current_day);

-- 8. Enable RLS on all new tables
ALTER TABLE learning_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_node_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_path_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_indicator_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_domain_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_preferences ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies
-- Learning nodes - public read
CREATE POLICY "Anyone can view learning nodes" ON learning_nodes FOR SELECT USING (true);

-- User progress - users can manage their own
CREATE POLICY "Users manage own progress" ON user_node_progress FOR ALL USING (auth.uid() = user_id);

-- User path state - users manage own
CREATE POLICY "Users manage own path state" ON user_path_state FOR ALL USING (auth.uid() = user_id);

-- User indicator history - users manage own
CREATE POLICY "Users manage own indicator history" ON user_indicator_history FOR ALL USING (auth.uid() = user_id);

-- User domain progress - users manage own
CREATE POLICY "Users manage own domain progress" ON user_domain_progress FOR ALL USING (auth.uid() = user_id);

-- Local measurements - users manage own
CREATE POLICY "Users manage own measurements" ON local_measurements FOR ALL USING (auth.uid() = user_id);

-- Daily quests - public read
CREATE POLICY "Anyone can view daily quests" ON daily_quests FOR SELECT USING (true);

-- User daily quests - users manage own
CREATE POLICY "Users manage own daily quests" ON user_daily_quests FOR ALL USING (auth.uid() = user_id);

-- Learning achievements - public read
CREATE POLICY "Anyone can view achievements" ON learning_achievements FOR SELECT USING (true);

-- User achievements - users can view own, system can insert
CREATE POLICY "Users view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can award achievements" ON user_achievements FOR INSERT WITH CHECK (true);

-- Content templates - public read
CREATE POLICY "Anyone can view templates" ON path_content_templates FOR SELECT USING (true);

-- User learning preferences - users manage own
CREATE POLICY "Users manage own preferences" ON user_learning_preferences FOR ALL USING (auth.uid() = user_id);

-- 10. Helper Database Functions
CREATE OR REPLACE FUNCTION get_node_for_day(day INTEGER)
RETURNS UUID AS $$
DECLARE
  node_id UUID;
BEGIN
  SELECT id INTO node_id
  FROM learning_nodes
  WHERE sequence_day = day
  LIMIT 1;
  
  RETURN node_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_quest_progress(
  p_user_id UUID,
  p_quest_type TEXT,
  p_increment INTEGER,
  p_date DATE
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_daily_quests (user_id, quest_id, assigned_date, current_progress, target_progress)
  SELECT 
    p_user_id,
    dq.id,
    p_date,
    p_increment,
    dq.target_value
  FROM daily_quests dq
  WHERE dq.quest_type = p_quest_type
    AND dq.is_daily = true
  ON CONFLICT (user_id, quest_id, assigned_date) 
  DO UPDATE SET 
    current_progress = user_daily_quests.current_progress + p_increment,
    completed_at = CASE 
      WHEN user_daily_quests.current_progress + p_increment >= user_daily_quests.target_progress 
      THEN NOW() 
      ELSE user_daily_quests.completed_at 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_insights(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_total INTEGER;
BEGIN
  UPDATE profiles 
  SET insights = COALESCE(insights, 0) + p_amount
  WHERE id = p_user_id
  RETURNING insights INTO new_total;
  
  RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;