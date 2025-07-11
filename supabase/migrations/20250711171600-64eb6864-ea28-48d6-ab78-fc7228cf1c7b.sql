-- First update any existing surveys to use valid status values
UPDATE public.surveys 
SET status = 'active' 
WHERE status NOT IN ('draft', 'pending_approval', 'active', 'declined', 'completed');

-- Add demographics to profiles (phone_number already exists)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
ADD COLUMN IF NOT EXISTS age_group TEXT CHECK (age_group IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65+'));

-- Add voice and approval fields to surveys
ALTER TABLE public.surveys 
ADD COLUMN IF NOT EXISTS is_voice_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS demographic_filters JSONB DEFAULT '{"genders": [], "age_groups": []}',
ADD COLUMN IF NOT EXISTS justification TEXT,
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS approved_by_rep UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS declined_reason TEXT;

-- Update surveys status to include new approval states
ALTER TABLE public.surveys 
DROP CONSTRAINT IF EXISTS surveys_status_check;

ALTER TABLE public.surveys 
ADD CONSTRAINT surveys_status_check 
CHECK (status IN ('draft', 'pending_approval', 'active', 'declined', 'completed'));

-- Create survey responses table for storing both web and voice responses
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.surveys(survey_id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    question_id UUID REFERENCES public.survey_questions(question_id) NOT NULL,
    response_type TEXT CHECK (response_type IN ('web', 'voice')) DEFAULT 'web',
    quantitative_value NUMERIC,
    qualitative_text TEXT,
    raw_transcript TEXT, -- for voice responses
    phone_number TEXT, -- E.164 format for voice responses
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(survey_id, user_id, question_id)
);

-- Create voice call attempts tracking
CREATE TABLE IF NOT EXISTS public.voice_call_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.surveys(survey_id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    phone_number TEXT NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'calling', 'completed', 'failed', 'declined', 'rescheduled')) DEFAULT 'scheduled',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    call_duration_seconds INTEGER,
    twilio_call_sid TEXT,
    failure_reason TEXT,
    reschedule_requested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create survey notifications table
CREATE TABLE IF NOT EXISTS public.survey_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.surveys(survey_id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    notification_type TEXT CHECK (notification_type IN ('web_banner', 'sms_pre_call', 'push_notification')) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    message_content TEXT,
    delivery_status TEXT CHECK (delivery_status IN ('sent', 'delivered', 'failed')) DEFAULT 'sent'
);

-- Enable RLS on new tables
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_call_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for survey_responses
DROP POLICY IF EXISTS "Users can view their own survey responses" ON public.survey_responses;
CREATE POLICY "Users can view their own survey responses" 
ON public.survey_responses FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own survey responses" ON public.survey_responses;
CREATE POLICY "Users can insert their own survey responses" 
ON public.survey_responses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and researchers can view all survey responses" ON public.survey_responses;
CREATE POLICY "Admins and researchers can view all survey responses" 
ON public.survey_responses FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'researcher')
    )
);

-- RLS policies for voice_call_attempts
DROP POLICY IF EXISTS "Users can view their own call attempts" ON public.voice_call_attempts;
CREATE POLICY "Users can view their own call attempts" 
ON public.voice_call_attempts FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all call attempts" ON public.voice_call_attempts;
CREATE POLICY "Admins can manage all call attempts" 
ON public.voice_call_attempts FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'researcher')
    )
);

-- RLS policies for survey_notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.survey_notifications;
CREATE POLICY "Users can view their own notifications" 
ON public.survey_notifications FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.survey_notifications;
CREATE POLICY "System can insert notifications" 
ON public.survey_notifications FOR INSERT 
WITH CHECK (true);

-- Function to get matching users for a survey based on demographics
CREATE OR REPLACE FUNCTION public.get_survey_target_users(
    survey_id_param UUID,
    location_id_param UUID
)
RETURNS TABLE(
    user_id UUID,
    phone_number TEXT,
    gender TEXT,
    age_group TEXT
)
LANGUAGE SQL
AS $$
    SELECT 
        p.id as user_id,
        p.phone_number,
        p.gender,
        p.age_group
    FROM public.profiles p
    JOIN public.surveys s ON s.survey_id = survey_id_param
    WHERE 
        p.location_id = location_id_param
        AND p.phone_number IS NOT NULL
        AND (
            (s.demographic_filters->>'genders')::jsonb = '[]'::jsonb 
            OR p.gender = ANY(
                SELECT jsonb_array_elements_text(s.demographic_filters->'genders')
            )
        )
        AND (
            (s.demographic_filters->>'age_groups')::jsonb = '[]'::jsonb
            OR p.age_group = ANY(
                SELECT jsonb_array_elements_text(s.demographic_filters->'age_groups')
            )
        );
$$;

-- Function to estimate survey duration based on question count
CREATE OR REPLACE FUNCTION public.calculate_survey_duration(survey_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
AS $$
    SELECT COALESCE(COUNT(*) * 1, 5) -- 1 minute per question, minimum 5
    FROM public.survey_questions 
    WHERE survey_id = survey_id_param;
$$;

-- Trigger to auto-update estimated duration when questions change
CREATE OR REPLACE FUNCTION public.update_survey_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.surveys 
    SET estimated_duration_minutes = public.calculate_survey_duration(COALESCE(NEW.survey_id, OLD.survey_id))
    WHERE survey_id = COALESCE(NEW.survey_id, OLD.survey_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS update_survey_duration_trigger ON public.survey_questions;
CREATE TRIGGER update_survey_duration_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.survey_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_survey_duration();