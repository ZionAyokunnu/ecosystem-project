-- Fix search_path for new functions created in previous migration
DROP FUNCTION IF EXISTS get_node_for_day(INTEGER);
DROP FUNCTION IF EXISTS update_quest_progress(UUID, TEXT, INTEGER, DATE);
DROP FUNCTION IF EXISTS increment_insights(UUID, INTEGER);

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION get_node_for_day(day INTEGER)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  node_id UUID;
BEGIN
  SELECT id INTO node_id
  FROM learning_nodes
  WHERE sequence_day = day
  LIMIT 1;
  
  RETURN node_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_quest_progress(
  p_user_id UUID,
  p_quest_type TEXT,
  p_increment INTEGER,
  p_date DATE
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION increment_insights(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total INTEGER;
BEGIN
  UPDATE profiles 
  SET insights = COALESCE(insights, 0) + p_amount
  WHERE id = p_user_id
  RETURNING insights INTO new_total;
  
  RETURN new_total;
END;
$$;