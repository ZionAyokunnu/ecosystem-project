
-- STEP 5: Drop all redundant tables
DROP TABLE IF EXISTS user_learning_preferences CASCADE;
DROP TABLE IF EXISTS path_content_templates CASCADE;
DROP TABLE IF EXISTS user_path_state CASCADE;
DROP TABLE IF EXISTS user_indicator_history CASCADE;
DROP TABLE IF EXISTS path_progress CASCADE;
DROP TABLE IF EXISTS relationship_domains CASCADE;
DROP TABLE IF EXISTS placement_results CASCADE;

-- Drop survey-related tables (replaced by simplified learning_nodes)
DROP TABLE IF EXISTS survey_control CASCADE;
DROP TABLE IF EXISTS survey_questions CASCADE;
DROP TABLE IF EXISTS survey_responses CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS survey_notifications CASCADE;
