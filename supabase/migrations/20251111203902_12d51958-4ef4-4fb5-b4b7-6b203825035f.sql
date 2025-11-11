-- Find indicator and populate questions for: Number and Quality of Schools
DO $$
DECLARE
  target_indicator_id uuid;
  indicator_name_found text;
BEGIN
  -- Find the indicator using ILIKE pattern matching
  SELECT id, name INTO target_indicator_id, indicator_name_found
  FROM indicators 
  WHERE LOWER(name) ILIKE '%school%'
  LIMIT 1;
  
  -- Check if indicator was found
  IF target_indicator_id IS NULL THEN
    RAISE EXCEPTION 'No matching indicator found for schools';
  END IF;
  
  -- Report what we found
  RAISE NOTICE 'Found indicator: % (ID: %)', indicator_name_found, target_indicator_id;
  
  -- Insert all 8 questions (converted to 11-year-old friendly)
  INSERT INTO indicator_questions (
    indicator_id, 
    question_text, 
    question_type, 
    question_order, 
    response_config,
    age_range,
    difficulty_level
  ) VALUES
  
  -- Q1: School count
  (target_indicator_id, 
   'How many schools are in your town?', 
   'simple_choice', 
   1, 
   '{"options": ["1-5 schools", "6-10 schools", "11-20 schools", "More than 20 schools", "I don''t know"]}',
   '11+',
   'easy'),
   
  -- Q2: Teacher adequacy
  (target_indicator_id,
   'Do your schools have enough teachers for all the students?',
   'yes_no',
   2,
   '{"true_label": "Yes, enough teachers", "false_label": "No, need more teachers"}',
   '11+',
   'easy'),
   
  -- Q3: Change over time
  (target_indicator_id,
   'Are there more schools in your town now than before?',
   'simple_choice',
   3,
   '{"options": ["Many fewer now", "A few fewer now", "About the same", "A few more now", "Many more now"]}',
   '11+',
   'easy'),
   
  -- Q4: Quality comparison
  (target_indicator_id,
   'How good are your schools compared to schools in other towns?',
   'rating_emoji',
   4,
   '{"options": [{"value":1,"emoji":"😟","label":"Much worse"}, {"value":2,"emoji":"😐","label":"A bit worse"}, {"value":3,"emoji":"😊","label":"About the same"}, {"value":4,"emoji":"😍","label":"Much better"}]}',
   '11+',
   'easy'),
   
  -- Q5: School facilities
  (target_indicator_id,
   'What cool things do your schools have?',
   'simple_choice',
   5,
   '{"options": ["Just basic classrooms", "Computers and library", "Sports fields and gym", "Science labs and arts rooms", "Everything - amazing facilities!"]}',
   '11+',
   'easy'),
   
  -- Q6: Parent/student perception
  (target_indicator_id,
   'Do kids and parents think the schools are good?',
   'rating_emoji',
   6,
   '{"options": [{"value":1,"emoji":"😟","label":"Most think they''re bad"}, {"value":2,"emoji":"😐","label":"Mixed opinions"}, {"value":3,"emoji":"😊","label":"Most think they''re good"}, {"value":4,"emoji":"😍","label":"Everyone loves them"}]}',
   '11+',
   'easy'),
   
  -- Q7: Academic performance
  (target_indicator_id,
   'Do kids from your schools do well on their tests?',
   'rating_emoji',
   7,
   '{"options": [{"value":1,"emoji":"😟","label":"Not very well"}, {"value":2,"emoji":"😐","label":"Okay results"}, {"value":3,"emoji":"😊","label":"Pretty good"}, {"value":4,"emoji":"😍","label":"Really amazing"}]}',
   '11+',
   'easy'),
   
  -- Q8: School type differences
  (target_indicator_id,
   'Are the high schools different from the elementary schools in your town?',
   'simple_choice',
   8,
   '{"options": ["Very different", "Somewhat different", "Pretty similar", "Almost the same", "I don''t know"]}',
   '11+',
   'easy');
   
  RAISE NOTICE 'Successfully added 8 questions for indicator: %', indicator_name_found;
END $$;