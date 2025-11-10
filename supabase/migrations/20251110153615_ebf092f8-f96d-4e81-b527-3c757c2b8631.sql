-- Cleanup any partially created new tables from previous attempt
DROP TABLE IF EXISTS user_domain_progress CASCADE;
DROP TABLE IF EXISTS user_exploration_history CASCADE;
DROP TABLE IF EXISTS new_user_node_progress CASCADE;
DROP TABLE IF EXISTS new_learning_nodes CASCADE;
DROP TABLE IF EXISTS new_indicator_relationships CASCADE;
DROP TABLE IF EXISTS new_domains CASCADE;
DROP TABLE IF EXISTS new_indicators CASCADE;

-- Remove added columns from profiles if they exist
ALTER TABLE profiles DROP COLUMN IF EXISTS preferred_domains;
ALTER TABLE profiles DROP COLUMN IF EXISTS exploration_preferences;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS unlock_next_domains(UUID, UUID);
DROP FUNCTION IF EXISTS get_recent_exploration_indicators(UUID, INTEGER);