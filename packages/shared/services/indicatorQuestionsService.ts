import { supabase } from '../integrations/supabase/client';

export interface IndicatorQuestion {
  id: string;
  indicator_id: string;
  location_type: 'town' | 'city' | 'region' | 'universal';
  question_text: string;
  question_type: 'rating_emoji' | 'simple_choice' | 'yes_no' | 'count_estimate' | 'text_short';
  question_order: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  age_range: '11+' | '16+' | '18+';
  response_config: any;
  is_active: boolean;
  created_at: string;
}

export interface UserQuestionResponse {
  id: string;
  user_id: string;
  node_id?: string;
  question_id: string;
  location_id: string;
  indicator_id: string;
  response_value: any;
  response_time_seconds?: number;
  confidence_emoji?: string;
  session_id?: string;
  device_type: string;
  created_at: string;
}

export class IndicatorQuestionsService {
  
  async getQuestionsForIndicator(
    indicatorId: string,
    locationType: string = 'town',
    ageRange: string = '11+',
    difficultyLevel?: string
  ): Promise<IndicatorQuestion[]> {
    console.log('Fetching questions for:', { indicatorId, locationType, ageRange, difficultyLevel });
    
    let query = supabase
      .from('indicator_questions' as any)
      .select('*')
      .eq('indicator_id', indicatorId)
      .eq('location_type', locationType)
      .eq('age_range', ageRange)
      .eq('is_active', true)
      .order('question_order');

    if (difficultyLevel) {
      query = query.eq('difficulty_level', difficultyLevel);
    }

    const { data, error } = await query;
    
    console.log('Questions result:', { count: (data as any)?.length, error });
    
    if (error) {
      console.error('Database error fetching questions:', error);
      throw error;
    }
    return (data as any) || [];
  }

  async getUserQuestionProgress(
    userId: string,
    indicatorId: string,
    locationId: string
  ): Promise<{
    questions: IndicatorQuestion[];
    responses: UserQuestionResponse[];
    completionRate: number;
  }> {
    const questions = await this.getQuestionsForIndicator(indicatorId);
    
    const { data: responses, error } = await supabase
      .from('user_question_responses' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('indicator_id', indicatorId)
      .eq('location_id', locationId);

    if (error) throw error;

    const completionRate = questions.length > 0 
      ? ((responses as any)?.length || 0) / questions.length * 100 
      : 0;

    return {
      questions,
      responses: (responses as any) || [],
      completionRate
    };
  }

  async submitQuestionResponse(
    userId: string,
    questionId: string,
    indicatorId: string,
    locationId: string,
    responseValue: any,
    options: {
      nodeId?: string;
      confidenceEmoji?: string;
      responseTimeSeconds?: number;
      sessionId?: string;
    } = {}
  ): Promise<{ success: boolean; responseId?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_question_responses' as any)
        .upsert({
          user_id: userId,
          question_id: questionId,
          indicator_id: indicatorId,
          location_id: locationId,
          response_value: responseValue,
          response_time_seconds: options.responseTimeSeconds,
          confidence_emoji: options.confidenceEmoji,
          node_id: options.nodeId,
          session_id: options.sessionId,
          device_type: 'web'
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, responseId: (data as any).id };
    } catch (error) {
      console.error('Error submitting question response:', error);
      return { success: false };
    }
  }

  async updateLocalMeasurementSummary(
    userId: string,
    indicatorId: string,
    locationId: string,
    nodeId?: string
  ): Promise<void> {
    try {
      const { data: responses } = await supabase
        .from('user_question_responses' as any)
        .select('response_value, response_time_seconds, confidence_emoji')
        .eq('user_id', userId)
        .eq('indicator_id', indicatorId)
        .eq('location_id', locationId);

      const { count: totalQuestions } = await supabase
        .from('indicator_questions' as any)
        .select('*', { count: 'exact', head: true })
        .eq('indicator_id', indicatorId)
        .eq('is_active', true);

      if (!responses || !totalQuestions) return;

      const questionsAnswered = (responses as any).length;
      const completionPercentage = (questionsAnswered / totalQuestions) * 100;
      
      const emojiResponses = (responses as any).filter((r: any) => r.confidence_emoji);
      const emojiSummary = this.calculateEmojiSummary(emojiResponses);
      
      const responseTimes = (responses as any)
        .filter((r: any) => r.response_time_seconds)
        .map((r: any) => r.response_time_seconds);
      const avgResponseTime = responseTimes.length > 0 
        ? Math.round(responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length)
        : null;

      await supabase
        .from('local_measurements')
        .upsert({
          user_id: userId,
          indicator_id: indicatorId,
          location_id: locationId,
          node_id: nodeId,
          questions_answered: questionsAnswered,
          total_questions: totalQuestions,
          completion_percentage: completionPercentage,
          emoji_summary: emojiSummary,
          average_response_time: avgResponseTime,
          last_response_date: new Date().toISOString(),
          current_state_rating: 3,
          trend_direction: 3,
          personal_confidence: 3
        });
        
    } catch (error) {
      console.error('Error updating local measurement summary:', error);
    }
  }

  private calculateEmojiSummary(responses: any[]): string {
    if (responses.length === 0) return '😐';
    
    const emojiCounts = responses.reduce((acc, r) => {
      acc[r.confidence_emoji] = (acc[r.confidence_emoji] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(emojiCounts).reduce((a, b) => 
      emojiCounts[a] > emojiCounts[b] ? a : b
    );
  }

  async getUnansweredQuestions(
    userId: string,
    indicatorId: string,
    locationId: string
  ): Promise<IndicatorQuestion[]> {
    const { questions, responses } = await this.getUserQuestionProgress(
      userId, 
      indicatorId, 
      locationId
    );

    const answeredQuestionIds = new Set(responses.map(r => r.question_id));
    
    return questions.filter(q => !answeredQuestionIds.has(q.id));
  }
}

export const indicatorQuestionsService = new IndicatorQuestionsService();
