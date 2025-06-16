
-- Create the survey management tables
CREATE TABLE public.surveys (
  survey_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  is_compulsory BOOLEAN DEFAULT true,
  applicable_roles TEXT[] DEFAULT ARRAY['resident', 'community_rep', 'researcher', 'business'],
  created_by UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.survey_questions (
  question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(survey_id) ON DELETE CASCADE,
  parent_indicator_id UUID NOT NULL REFERENCES public.indicators(indicator_id),
  child_indicator_id UUID NOT NULL REFERENCES public.indicators(indicator_id),
  prompt TEXT NOT NULL,
  input_type TEXT DEFAULT 'slider' CHECK (input_type IN ('slider', 'select', 'file')),
  allow_file_upload BOOLEAN DEFAULT false,
  allow_additional_indicator BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT true,
  branching_condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.relationship_user_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  parent_id UUID NOT NULL REFERENCES public.indicators(indicator_id),
  child_id UUID NOT NULL REFERENCES public.indicators(indicator_id),
  domain TEXT NOT NULL,
  strength_score INTEGER NOT NULL CHECK (strength_score >= 0 AND strength_score <= 10),
  direction TEXT NOT NULL CHECK (direction IN ('A→B', 'B→A', 'Mutual', 'Unclear')),
  notes_file_url TEXT,
  additional_indicator_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Phase 2: Gamification tables
CREATE TABLE public.user_points_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('survey_completed', 'referral', 'upload', 'admin_bonus')),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('survey_starter', 'town_rep', 'community_champion', '5x_participant')),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

CREATE TABLE public.user_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  voucher_code TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_redeemed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vouchers ENABLE ROW LEVEL SECURITY;

-- Create policies for the new tables (public access for development)
CREATE POLICY "Public access to surveys" ON public.surveys FOR ALL USING (true);
CREATE POLICY "Public access to survey_questions" ON public.survey_questions FOR ALL USING (true);
CREATE POLICY "Public access to relationship_user_responses" ON public.relationship_user_responses FOR ALL USING (true);
CREATE POLICY "Public access to user_points_log" ON public.user_points_log FOR ALL USING (true);
CREATE POLICY "Public access to user_badges" ON public.user_badges FOR ALL USING (true);
CREATE POLICY "Public access to user_vouchers" ON public.user_vouchers FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_user_points_log_user_id ON public.user_points_log(user_id, created_at);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_vouchers_user_id ON public.user_vouchers(user_id, is_redeemed);
CREATE INDEX idx_relationship_responses_indicators ON public.relationship_user_responses(parent_id, child_id);

-- Seed some initial data
INSERT INTO public.surveys (title, domain, is_compulsory, applicable_roles) VALUES
('Community Health Relationships', 'Health', true, ARRAY['resident', 'community_rep']),
('Education Impact Assessment', 'Education', true, ARRAY['resident', 'educator']),
('Economic Development Survey', 'Economy', false, ARRAY['business', 'community_rep']);

-- Seed test vouchers for demonstration
INSERT INTO public.user_vouchers (user_id, voucher_code, partner_name, value, expires_at) VALUES
('00000000-0000-0000-0000-000000000001', 'COFFEE10', 'Local Café', '10% off coffee', now() + interval '30 days'),
('00000000-0000-0000-0000-000000000001', 'BOOKS15', 'Community Library', '15% off book fees', now() + interval '60 days');
