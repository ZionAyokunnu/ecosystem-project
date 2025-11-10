-- Create optimized leaderboard function
CREATE OR REPLACE FUNCTION get_leaderboard_data(p_location_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  first_name TEXT,
  total_points BIGINT,
  survey_count BIGINT,
  badge_count BIGINT,
  current_streak INT,
  league_tier TEXT,
  rank_position BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      p.id, 
      p.first_name, 
      COALESCE(p.insights, 0) * 10 as points,
      (SELECT COUNT(*) FROM relationship_user_responses WHERE user_id = p.id) as surveys,
      (SELECT COUNT(*) FROM user_badges WHERE user_id = p.id) as badges,
      COALESCE(p.streak, 0) as current_streak
    FROM profiles p
    WHERE (p_location_id IS NULL OR p.location_id = p_location_id)
  )
  SELECT 
    us.id, 
    us.first_name, 
    us.points, 
    us.surveys, 
    us.badges, 
    us.current_streak,
    CASE 
      WHEN us.points >= 1000 THEN 'Diamond'
      WHEN us.points >= 500 THEN 'Gold'
      WHEN us.points >= 250 THEN 'Silver'
      ELSE 'Bronze'
    END as league,
    RANK() OVER (ORDER BY us.points DESC) as position
  FROM user_stats us
  ORDER BY us.points DESC;
END;
$$ LANGUAGE plpgsql;

-- Create story reactions table
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES qualitative_stories(story_id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'helpful', 'inspiring')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id, reaction_type)
);

-- Enable RLS on story_reactions
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view reactions
CREATE POLICY "Anyone can view story reactions" ON story_reactions
  FOR SELECT USING (true);

-- Allow authenticated users to add reactions
CREATE POLICY "Authenticated users can add reactions" ON story_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own reactions
CREATE POLICY "Users can delete own reactions" ON story_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_story_reactions_story_id ON story_reactions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_reactions_user_id ON story_reactions(user_id);