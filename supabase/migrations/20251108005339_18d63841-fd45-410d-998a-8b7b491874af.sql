-- Add new columns to profiles table for onboarding data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS hearts INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_session TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS insights INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS selected_domain TEXT,
ADD COLUMN IF NOT EXISTS knowledge_level INTEGER DEFAULT 0;

-- Create placement_results table
CREATE TABLE IF NOT EXISTS public.placement_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  confidence_score INTEGER DEFAULT 0,
  concept_score INTEGER DEFAULT 0,
  understanding_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  unlocked_to_unit INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on placement_results
ALTER TABLE public.placement_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own placement results
CREATE POLICY "Users can view their own placement results"
ON public.placement_results
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own placement results
CREATE POLICY "Users can insert their own placement results"
ON public.placement_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  time_hour INTEGER DEFAULT 19,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own notification settings
CREATE POLICY "Users can manage their own notification settings"
ON public.notification_settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create path_progress table for learning path tracking
CREATE TABLE IF NOT EXISTS public.path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('locked', 'available', 'current', 'completed')) DEFAULT 'locked',
  completed_at TIMESTAMPTZ,
  insights_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, unit_id)
);

-- Enable RLS on path_progress
ALTER TABLE public.path_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own path progress
CREATE POLICY "Users can view their own path progress"
ON public.path_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own path progress
CREATE POLICY "Users can update their own path progress"
ON public.path_progress
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);