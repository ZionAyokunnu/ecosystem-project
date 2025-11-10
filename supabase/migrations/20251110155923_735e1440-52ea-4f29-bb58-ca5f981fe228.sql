
-- STEP 2: Fix domain tree - assign indicators to level 3 domains
UPDATE new_domains 
SET indicator_id = (
  SELECT ni.id 
  FROM new_indicators ni 
  WHERE ni.name ILIKE '%' || new_domains.name || '%'
  LIMIT 1
)
WHERE level = 3 AND indicator_id IS NULL;

-- STEP 3: Initialize user domain progression (unlock first leaf for each user)
TRUNCATE user_domain_progress;

INSERT INTO user_domain_progress (user_id, domain_id, is_unlocked, unlocked_at)
SELECT 
  p.id as user_id,
  (SELECT d.id FROM new_domains d WHERE d.level = 3 AND d.indicator_id IS NOT NULL ORDER BY d.name LIMIT 1) as domain_id,
  true,
  NOW()
FROM profiles p 
WHERE p.has_completed_onboarding = true;
