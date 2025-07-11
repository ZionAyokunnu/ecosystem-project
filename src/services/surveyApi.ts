
import { supabase } from '@/integrations/supabase/client';
import { Survey, SurveyQuestion, RelationshipUserResponse } from '@/types';

export interface SurveyResponse {
  id: string;
  survey_id: string;
  user_id: string;
  question_id: string;
  response_type: 'web' | 'voice';
  quantitative_value?: number;
  qualitative_text?: string;
  raw_transcript?: string;
  phone_number?: string;
  created_at: string;
}

export const getSurveys = async (): Promise<Survey[]> => {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('status', 'active');

  if (error) throw error;
  return data as any[];
};

export const getSurveyQuestions = async (surveyId: string): Promise<SurveyQuestion[]> => {
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('survey_id', surveyId);

  if (error) throw error;
  return data as SurveyQuestion[];
};

export const submitSurveyResponse = async (response: Omit<RelationshipUserResponse, 'response_id' | 'created_at'>): Promise<void> => {
  const { error } = await supabase
    .from('relationship_user_responses')
    .insert([response]);

  if (error) throw error;
};

export const getRelationshipResponses = async (parentId?: string, childId?: string): Promise<RelationshipUserResponse[]> => {
  let query = supabase.from('relationship_user_responses').select('*');
  
  if (parentId) query = query.eq('parent_id', parentId);
  if (childId) query = query.eq('child_id', childId);
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as RelationshipUserResponse[];
};

export const submitSurveyAnswer = async (response: Omit<SurveyResponse, 'id' | 'created_at'>): Promise<void> => {
  const { error } = await supabase
    .from('survey_responses')
    .insert([response]);

  if (error) throw error;
};

export const getSurveyResponses = async (surveyId: string): Promise<SurveyResponse[]> => {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('survey_id', surveyId);

  if (error) throw error;
  return data as SurveyResponse[];
};

export const getSurveysForApproval = async (locationId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('status', 'pending_approval')
    .eq('target_location', locationId);

  if (error) throw error;
  return data as any[];
};

export const approveSurvey = async (surveyId: string, repId: string): Promise<void> => {
  const { error } = await supabase
    .from('surveys')
    .update({
      status: 'active',
      approved_by_rep: repId,
      approved_at: new Date().toISOString()
    })
    .eq('survey_id', surveyId);

  if (error) throw error;
};

export const declineSurvey = async (surveyId: string, repId: string, reason: string): Promise<void> => {
  const { error } = await supabase
    .from('surveys')
    .update({
      status: 'declined',
      approved_by_rep: repId,
      declined_reason: reason
    })
    .eq('survey_id', surveyId);

  if (error) throw error;
};
