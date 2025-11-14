import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase, indicatorQuestionsService } from '@ecosystem/shared';
import type { IndicatorQuestion } from '@ecosystem/shared';
import { TouchButton } from './TouchButton';
import { Progress } from '@/src/components/ui/Progress';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';
import { Input } from '@/src/components/ui/Input';

interface LocalMeasurementSurveyProps {
  nodeData: any;
  userState: any;
  onComplete: (data: any) => void;
}

export const LocalMeasurementSurvey: React.FC<LocalMeasurementSurveyProps> = ({
  nodeData,
  userState,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<IndicatorQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [targetIndicatorId, setTargetIndicatorId] = useState<string>('');
  const [textResponse, setTextResponse] = useState('');

  useEffect(() => {
    loadLocalMeasurementSurvey();
  }, [userState]);

  const loadLocalMeasurementSurvey = async () => {
    try {
      let indicatorId = '';
      
      const { data: recentHistory } = await supabase
        .from('user_exploration_history')
        .select('final_indicator_id')
        .eq('user_id', userState.user_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentHistory && recentHistory.length > 0) {
        indicatorId = recentHistory[0].final_indicator_id;
      } else {
        const { data: indicatorWithQuestions } = await supabase
          .from('indicator_questions')
          .select('indicator_id')
          .eq('is_active', true)
          .limit(1);
        
        if (indicatorWithQuestions && indicatorWithQuestions.length > 0) {
          indicatorId = indicatorWithQuestions[0].indicator_id;
        }
      }

      if (!indicatorId) {
        setLoading(false);
        return;
      }

      setTargetIndicatorId(indicatorId);

      const unansweredQuestions = await indicatorQuestionsService.getUnansweredQuestions(
        userState.user_id,
        indicatorId,
        userState.location_id
      );

      if (unansweredQuestions.length === 0) {
        const allQuestions = await indicatorQuestionsService.getQuestionsForIndicator(indicatorId);
        setQuestions(allQuestions.slice(0, 3));
      } else {
        setQuestions(unansweredQuestions.slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading local measurement survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response: any) => {
    const question = questions[currentQuestion];
    setResponses(prev => ({ ...prev, [question.id]: response }));

    await indicatorQuestionsService.submitQuestionResponse(
      userState.user_id,
      question.id,
      targetIndicatorId,
      userState.location_id,
      response,
      nodeData.id
    );

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTextResponse('');
    } else {
      onComplete({
        targetIndicator: targetIndicatorId,
        responses,
        nodeId: nodeData.id,
        insights_earned: 8
      });
    }
  };

  if (loading || questions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-lg">Loading questions...</Text>
      </View>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <View className="flex-1 bg-gradient-to-b from-green-50 to-blue-50 p-6">
      <View className="mb-4">
        <Progress value={progress} className="h-2" />
        <Text className="text-sm text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      <Card className="p-6 mb-6">
        <Text className="text-xl font-bold mb-4">
          {question.question_text}
        </Text>
      </Card>

      <View className="gap-3">
        {question.question_type === 'scale' && 
          question.response_config.scale_options?.map((option: any) => (
            <TouchButton
              key={option.value}
              onPress={() => handleResponse({ value: option.value, label: option.label })}
            >
              {option.label}
            </TouchButton>
          ))
        }
        
        {question.question_type === 'text' && (
          <View>
            <Input
              value={textResponse}
              onChangeText={setTextResponse}
              placeholder="Type your answer here..."
              multiline
              numberOfLines={4}
              className="mb-4"
            />
            <TouchButton
              variant="primary"
              onPress={() => handleResponse({ text: textResponse })}
              disabled={!textResponse.trim()}
            >
              Continue
            </TouchButton>
          </View>
        )}
      </View>
    </View>
  );
};
