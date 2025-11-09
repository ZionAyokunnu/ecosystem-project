-- Extend profiles table for personalization
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation_sector TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobility_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS time_availability TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_type TEXT DEFAULT 'mascot';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_data TEXT;

-- Create community actions table
CREATE TABLE IF NOT EXISTS community_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  indicator_id TEXT,
  target_demographic JSONB,
  location_type TEXT,
  time_requirement TEXT,
  difficulty_level INTEGER,
  impact_potential INTEGER,
  action_template TEXT,
  dynamic_fields JSONB,
  insights_reward INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create local context table
CREATE TABLE IF NOT EXISTS local_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID,
  context_type TEXT,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  contact_info JSONB,
  operating_hours JSONB,
  relevant_indicators TEXT[],
  current_status TEXT,
  tags TEXT[],
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_source TEXT
);

-- Track user completion of community actions
CREATE TABLE IF NOT EXISTS user_community_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action_id UUID REFERENCES community_actions(id),
  recommended_date DATE,
  completed_date DATE,
  completion_notes TEXT,
  impact_rating INTEGER,
  insights_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_actions_indicator ON community_actions(indicator_id);
CREATE INDEX IF NOT EXISTS idx_local_context_location ON local_context(location_id);
CREATE INDEX IF NOT EXISTS idx_local_context_indicators ON local_context USING GIN (relevant_indicators);
CREATE INDEX IF NOT EXISTS idx_user_community_actions_user ON user_community_actions(user_id);

-- Enable RLS
ALTER TABLE community_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_community_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view community actions" ON community_actions FOR SELECT USING (true);
CREATE POLICY "Anyone can view local context" ON local_context FOR SELECT USING (true);
CREATE POLICY "Users manage own community actions" ON user_community_actions FOR ALL USING (auth.uid() = user_id);