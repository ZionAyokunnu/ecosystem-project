
-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  phone_number TEXT,
  profile_photo TEXT,
  role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'community_rep', 'researcher', 'admin')),
  location_id UUID REFERENCES public.locations(location_id),
  has_completed_onboarding BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create survey control table for managing survey logic
CREATE TABLE public.survey_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(survey_id),
  target_roles TEXT[] NOT NULL,
  target_locations UUID[],
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create flagged responses table for moderation
CREATE TABLE public.flagged_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  response_id UUID NOT NULL REFERENCES public.relationship_user_responses(response_id),
  flag_reason TEXT NOT NULL,
  rep_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin inputs table for manual data edits
CREATE TABLE public.admin_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID NOT NULL REFERENCES public.indicators(indicator_id),
  value NUMERIC NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('current_value', 'historical_trend')),
  rationale TEXT,
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create researcher credits table
CREATE TABLE public.researcher_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id UUID NOT NULL REFERENCES public.profiles(id),
  credits INTEGER NOT NULL DEFAULT 0,
  action_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create rep tasks table
CREATE TABLE public.rep_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL REFERENCES public.profiles(id),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researcher_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rep_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables (initially public for development)
CREATE POLICY "Public access to profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Public access to survey_control" ON public.survey_control FOR ALL USING (true);
CREATE POLICY "Public access to flagged_responses" ON public.flagged_responses FOR ALL USING (true);
CREATE POLICY "Public access to admin_inputs" ON public.admin_inputs FOR ALL USING (true);
CREATE POLICY "Public access to researcher_credits" ON public.researcher_credits FOR ALL USING (true);
CREATE POLICY "Public access to rep_tasks" ON public.rep_tasks FOR ALL USING (true);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, role, has_completed_onboarding)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    'resident',
    false
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_location ON public.profiles(location_id);
CREATE INDEX idx_survey_control_active ON public.survey_control(is_active, target_roles);
CREATE INDEX idx_flagged_responses_status ON public.flagged_responses(status, rep_id);
