
import { supabase } from '@/integrations/supabase/client';
import { Survey, SurveyQuestion, RelationshipUserResponse } from '@/types';

export const getSurveys = async (): Promise<Survey[]> => {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('status', 'active');

  if (error) throw error;
  return data as Survey[];
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
