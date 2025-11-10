-- Cleanup
DROP TABLE IF EXISTS user_domain_progress CASCADE;
DROP TABLE IF EXISTS user_exploration_history CASCADE;
DROP TABLE IF EXISTS new_user_node_progress CASCADE;
DROP TABLE IF EXISTS new_learning_nodes CASCADE;
DROP TABLE IF EXISTS new_indicator_relationships CASCADE;
DROP TABLE IF EXISTS new_domains CASCADE;
DROP TABLE IF EXISTS new_indicators CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS preferred_domains;
ALTER TABLE profiles DROP COLUMN IF EXISTS exploration_preferences;
DROP FUNCTION IF EXISTS unlock_next_domains(UUID, UUID);
DROP FUNCTION IF EXISTS get_recent_exploration_indicators(UUID, INTEGER);

-- Create all tables
CREATE TABLE new_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('rating_scale', 'percentage', 'multiple_choice', 'checkbox', 'text')),
  scale_config JSONB NOT NULL DEFAULT '{"min": 1, "max": 5, "labels": ["Very Poor", "Poor", "Fair", "Good", "Excellent"]}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE new_domains (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, parent_id UUID REFERENCES new_domains(id), level INTEGER NOT NULL, indicator_id UUID REFERENCES new_indicators(id), description TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE new_indicator_relationships (parent_indicator_id UUID REFERENCES new_indicators(id), child_indicator_id UUID REFERENCES new_indicators(id), correlation_coefficient DECIMAL(5,4) DEFAULT 0, sample_size INTEGER DEFAULT 0, calculated_at TIMESTAMPTZ DEFAULT NOW(), PRIMARY KEY (parent_indicator_id, child_indicator_id));
CREATE TABLE user_domain_progress (user_id UUID REFERENCES profiles(id), domain_id UUID REFERENCES new_domains(id), completion_count INTEGER DEFAULT 0, is_unlocked BOOLEAN DEFAULT false, unlocked_at TIMESTAMPTZ, last_completed_at TIMESTAMPTZ, cooldown_until TIMESTAMPTZ, PRIMARY KEY (user_id, domain_id));
CREATE TABLE user_exploration_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES profiles(id), day_completed INTEGER NOT NULL, node_type TEXT NOT NULL, domain_path UUID[] NOT NULL, final_indicator_id UUID NOT NULL REFERENCES new_indicators(id), created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(user_id, day_completed));
CREATE TABLE new_learning_nodes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), day_number INTEGER UNIQUE NOT NULL, node_type TEXT NOT NULL CHECK (node_type IN ('domain_drill', 'connection_explore', 'local_measure', 'knowledge_review')), title TEXT NOT NULL, description TEXT, estimated_minutes INTEGER DEFAULT 3, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE new_user_node_progress (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES profiles(id), node_id UUID REFERENCES new_learning_nodes(id), status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'current', 'completed')), started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, insights_earned INTEGER DEFAULT 0, response_data JSONB, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(user_id, node_id));
ALTER TABLE profiles ADD COLUMN preferred_domains TEXT[] DEFAULT '{}', ADD COLUMN exploration_preferences JSONB DEFAULT '{"cooldown_weeks": 3}';

-- Always append row number to ensure uniqueness
INSERT INTO new_indicators (id, code, name, description, category, measurement_type, scale_config)
SELECT indicator_id, 'IND_' || COALESCE(code::text, 'NULL') || '_' || row_number, name, description, category, 'rating_scale',
  jsonb_build_object('min', 1, 'max', 5, 'labels', ARRAY['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'])
FROM (SELECT *, ROW_NUMBER() OVER (ORDER BY created_at) as row_number FROM indicators) sub;

INSERT INTO new_domains (id, name, parent_id, level, indicator_id, description) SELECT domain_id, name, parent_id, level, indicator_id, "Description" FROM domains;
INSERT INTO new_indicator_relationships (parent_indicator_id, child_indicator_id, correlation_coefficient) SELECT parent_id, child_id, COALESCE(influence_score, 0.1) FROM relationships;

-- FIXED: Use $$ instead of single quotes
DO $$
BEGIN
  FOR i IN 1..365 LOOP
    INSERT INTO new_learning_nodes (day_number, node_type, title, description)
    VALUES (
      i,
      CASE (i % 4) WHEN 1 THEN 'domain_drill' WHEN 2 THEN 'local_measure' WHEN 3 THEN 'connection_explore' WHEN 0 THEN 'knowledge_review' END,
      CASE WHEN i = 1 THEN 'Explore Your Community' WHEN i = 2 THEN 'Rate Local Conditions' WHEN i = 3 THEN 'Discover Connections' WHEN i = 4 THEN 'Reflect & Review' ELSE 'Day ' || i || ' Activity' END,
      CASE WHEN i = 1 THEN 'Choose an area that interests you most' WHEN i = 2 THEN 'Share your experience of local conditions' WHEN i = 3 THEN 'Help us understand how community factors connect' WHEN i = 4 THEN 'Review what you have learned about your area' ELSE 'Continue your community learning journey' END
    );
  END LOOP;
END $$;

INSERT INTO user_domain_progress (user_id, domain_id, is_unlocked, unlocked_at)
SELECT DISTINCT p.id, (SELECT d.domain_id FROM domains d WHERE d.level = 3 AND d.indicator_id IS NOT NULL ORDER BY d.name LIMIT 1), true, NOW()
FROM profiles p WHERE p.has_completed_onboarding = true;

CREATE FUNCTION unlock_next_domains(p_user_id UUID, completed_domain_id UUID) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE parent_domain_id UUID; all_siblings_completed BOOLEAN; next_sibling_id UUID;
BEGIN
  UPDATE user_domain_progress SET completion_count = completion_count + 1, last_completed_at = NOW(), cooldown_until = NOW() + INTERVAL '3 weeks' WHERE user_id = p_user_id AND domain_id = completed_domain_id;
  SELECT INTO next_sibling_id d2.id FROM new_domains d1 JOIN new_domains d2 ON d1.parent_id = d2.parent_id WHERE d1.id = completed_domain_id AND d2.id != completed_domain_id AND d2.indicator_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM user_domain_progress udp WHERE udp.user_id = p_user_id AND udp.domain_id = d2.id) ORDER BY d2.name LIMIT 1;
  IF next_sibling_id IS NOT NULL THEN INSERT INTO user_domain_progress (user_id, domain_id, is_unlocked, unlocked_at) VALUES (p_user_id, next_sibling_id, true, NOW()); RETURN; END IF;
  SELECT d1.parent_id INTO parent_domain_id FROM new_domains d1 WHERE d1.id = completed_domain_id;
  SELECT NOT EXISTS (SELECT 1 FROM new_domains d WHERE d.parent_id = parent_domain_id AND d.indicator_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM user_domain_progress udp WHERE udp.user_id = p_user_id AND udp.domain_id = d.id AND udp.completion_count > 0)) INTO all_siblings_completed;
  IF all_siblings_completed THEN
    SELECT INTO next_sibling_id d2.id FROM new_domains d1 JOIN new_domains d2 ON d1.parent_id = d2.parent_id WHERE d1.id = parent_domain_id AND d2.id != parent_domain_id AND d2.level = (SELECT level FROM new_domains WHERE id = parent_domain_id) ORDER BY d2.name LIMIT 1;
    IF next_sibling_id IS NOT NULL THEN INSERT INTO user_domain_progress (user_id, domain_id, is_unlocked, unlocked_at) SELECT p_user_id, d.id, true, NOW() FROM new_domains d WHERE d.parent_id = next_sibling_id AND d.indicator_id IS NOT NULL ORDER BY d.name LIMIT 1; END IF;
  END IF;
END; $$;

CREATE FUNCTION get_recent_exploration_indicators(p_user_id UUID, days_back INTEGER DEFAULT 14) RETURNS UUID[] LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN ARRAY(SELECT DISTINCT ueh.final_indicator_id FROM user_exploration_history ueh WHERE ueh.user_id = p_user_id AND ueh.created_at >= NOW() - (days_back || ' days')::INTERVAL ORDER BY ueh.final_indicator_id); END; $$;

CREATE INDEX idx_new_domains_parent_level ON new_domains(parent_id, level);
CREATE INDEX idx_new_domains_indicator ON new_domains(indicator_id) WHERE indicator_id IS NOT NULL;
CREATE INDEX idx_user_domain_progress_user_unlocked ON user_domain_progress(user_id, is_unlocked);
CREATE INDEX idx_user_exploration_history_user_recent ON user_exploration_history(user_id, created_at DESC);
CREATE INDEX idx_new_indicator_relationships_parent ON new_indicator_relationships(parent_indicator_id);
CREATE INDEX idx_new_user_node_progress_user_status ON new_user_node_progress(user_id, status);

ALTER TABLE user_domain_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exploration_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_user_node_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_indicator_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_learning_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own domain progress" ON user_domain_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own exploration history" ON user_exploration_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own node progress" ON new_user_node_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view indicators" ON new_indicators FOR SELECT USING (true);
CREATE POLICY "Anyone can view domains" ON new_domains FOR SELECT USING (true);
CREATE POLICY "Anyone can view relationships" ON new_indicator_relationships FOR SELECT USING (true);
CREATE POLICY "Anyone can view learning nodes" ON new_learning_nodes FOR SELECT USING (true);