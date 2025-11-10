
-- STEP 4: Complete table replacement
-- Drop old table constraints first
ALTER TABLE qualitative_stories DROP CONSTRAINT IF EXISTS qualitative_stories_parent_id_fkey;
ALTER TABLE qualitative_stories DROP CONSTRAINT IF EXISTS qualitative_stories_child_id_fkey;
ALTER TABLE relationship_user_responses DROP CONSTRAINT IF EXISTS relationship_user_responses_parent_id_fkey;
ALTER TABLE relationship_user_responses DROP CONSTRAINT IF EXISTS relationship_user_responses_child_id_fkey;

-- Rename new tables to final names
ALTER TABLE new_indicators RENAME TO indicators_final;
ALTER TABLE new_domains RENAME TO domains_final; 
ALTER TABLE new_indicator_relationships RENAME TO indicator_relationships_final;
ALTER TABLE new_learning_nodes RENAME TO learning_nodes_final;
ALTER TABLE new_user_node_progress RENAME TO user_node_progress_final;

-- Drop old tables
DROP TABLE IF EXISTS indicators CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS learning_nodes CASCADE;
DROP TABLE IF EXISTS user_node_progress CASCADE;

-- Rename final tables to correct names
ALTER TABLE indicators_final RENAME TO indicators;
ALTER TABLE domains_final RENAME TO domains;
ALTER TABLE indicator_relationships_final RENAME TO indicator_relationships;
ALTER TABLE learning_nodes_final RENAME TO learning_nodes;
ALTER TABLE user_node_progress_final RENAME TO user_node_progress;

-- Re-add foreign key constraints
ALTER TABLE qualitative_stories 
ADD CONSTRAINT qualitative_stories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES indicators(id);
ALTER TABLE qualitative_stories 
ADD CONSTRAINT qualitative_stories_child_id_fkey FOREIGN KEY (child_id) REFERENCES indicators(id);
