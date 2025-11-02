
-- Create benchmarks table to store target values for indicators
CREATE TABLE public.benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_id UUID REFERENCES public.indicators(indicator_id) NOT NULL,
  target_value NUMERIC NOT NULL,
  benchmark_type TEXT NOT NULL DEFAULT 'UN_SDG',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on benchmarks table
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to benchmarks
CREATE POLICY "Allow public read access to benchmarks" 
  ON public.benchmarks 
  FOR SELECT 
  USING (true);

-- Insert some sample benchmark data
INSERT INTO public.benchmarks (indicator_id, target_value, benchmark_type, description)
SELECT 
  indicator_id,
  CASE 
    WHEN name ILIKE '%wellbeing%' OR name ILIKE '%happiness%' THEN 75
    WHEN name ILIKE '%health%' THEN 80
    WHEN name ILIKE '%education%' THEN 85
    WHEN name ILIKE '%employment%' THEN 70
    WHEN name ILIKE '%housing%' THEN 65
    ELSE 60
  END as target_value,
  'UN_SDG' as benchmark_type,
  'UN Sustainable Development Goal target' as description
FROM public.indicators
WHERE indicator_id IS NOT NULL;

-- Create story_votes table for voting on community stories
CREATE TABLE public.story_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.qualitative_stories(story_id) NOT NULL,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Enable RLS on story_votes table
ALTER TABLE public.story_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for story votes
CREATE POLICY "Anyone can view story votes" 
  ON public.story_votes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can vote on stories" 
  ON public.story_votes 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own votes" 
  ON public.story_votes 
  FOR UPDATE 
  USING (true);

-- Add vote_count column to qualitative_stories for performance
ALTER TABLE public.qualitative_stories 
ADD COLUMN vote_count INTEGER DEFAULT 0;

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_story_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vote count for the story
  UPDATE public.qualitative_stories 
  SET vote_count = (
    SELECT COUNT(CASE WHEN vote_type = 'up' THEN 1 END) - 
           COUNT(CASE WHEN vote_type = 'down' THEN 1 END)
    FROM public.story_votes 
    WHERE story_id = COALESCE(NEW.story_id, OLD.story_id)
  )
  WHERE story_id = COALESCE(NEW.story_id, OLD.story_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update vote counts
CREATE TRIGGER story_vote_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.story_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_vote_count();
