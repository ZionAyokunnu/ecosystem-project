
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

// Note: surveys, survey_questions, and survey_responses tables no longer exist
// They have been replaced by the learning nodes system

export const getSurveys = async (): Promise<Survey[]> => {
  console.warn('getSurveys is deprecated. Surveys system has been replaced by learning nodes.');
  return [];
};

export const getSurveyQuestions = async (surveyId: string): Promise<SurveyQuestion[]> => {
  console.warn('getSurveyQuestions is deprecated. Surveys system has been replaced by learning nodes.');
  return [];
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
  console.warn('submitSurveyAnswer is deprecated. Surveys system has been replaced by learning nodes.');
  throw new Error('Survey responses functionality has been replaced by learning nodes system');
};

export const getSurveyResponses = async (surveyId: string): Promise<SurveyResponse[]> => {
  console.warn('getSurveyResponses is deprecated. Surveys system has been replaced by learning nodes.');
  return [];
};

export const getSurveysForApproval = async (locationId: string): Promise<any[]> => {
  console.warn('getSurveysForApproval is deprecated. Surveys system has been replaced by learning nodes.');
  return [];
};

export const approveSurvey = async (surveyId: string, repId: string): Promise<void> => {
  console.warn('approveSurvey is deprecated. Surveys system has been replaced by learning nodes.');
  throw new Error('Survey approval functionality has been replaced by learning nodes system');
};

export const declineSurvey = async (surveyId: string, repId: string, reason: string): Promise<void> => {
  console.warn('declineSurvey is deprecated. Surveys system has been replaced by learning nodes.');
  throw new Error('Survey decline functionality has been replaced by learning nodes system');
};
