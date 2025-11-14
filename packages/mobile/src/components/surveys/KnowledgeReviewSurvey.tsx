import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase } from '@ecosystem/shared';
import { TouchButton } from './TouchButton';
import { Progress } from '@/src/components/ui/Progress';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';

interface KnowledgeReviewSurveyProps {
  nodeData: any;
  userState: any;
  onComplete: (data: any) => void;
}

export const KnowledgeReviewSurvey: React.FC<KnowledgeReviewSurveyProps> = ({
  nodeData,
  userState,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviewQuestions = async () => {
      const { data: recentHistory } = await supabase
        .from('user_exploration_history')
        .select('final_indicator_id')
        .eq('user_id', userState.user_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!recentHistory || recentHistory.length === 0) {
        setLoading(false);
        return;
      }

      const indicatorIds = [...new Set(recentHistory.map(h => h.final_indicator_id))];
      const { data: indicators } = await supabase
        .from('indicators')
        .select('*')
        .in('id', indicatorIds);

      const reviewQuestions = indicators?.map((indicator, index) => ({
        id: `review_${index}`,
        type: 'recall',
        indicator,
        question: `Can you recall what you learned about ${indicator.name}?`,
        options: [
          { value: 3, label: 'I remember clearly and can explain' },
          { value: 2, label: 'I remember some key points' },
          { value: 1, label: 'I need to review this topic' }
        ]
      })) || [];

      setQuestions(reviewQuestions);
      setLoading(false);
    };

    loadReviewQuestions();
  }, [userState]);

  const handleResponse = (response: any) => {
    const questionId = questions[currentQuestion].id;
    setResponses(prev => ({ ...prev, [questionId]: response }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete({
        responses,
        nodeId: nodeData.id,
        insights_earned: 6,
        review_type: 'weekly_knowledge'
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-lg">Loading review...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-6xl mb-4">📚</Text>
        <Text className="text-2xl font-bold mb-2">Nothing to review yet</Text>
        <Text className="text-muted-foreground">Complete more activities this week!</Text>
      </View>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <View className="flex-1 bg-gradient-to-b from-yellow-50 to-orange-50 p-6">
      <View className="mb-4">
        <Progress value={progress} className="h-2" />
        <Text className="text-sm text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      <Card className="p-6 mb-6">
        <Text className="text-6xl mb-4 text-center">📚</Text>
        <Text className="text-xl font-bold mb-4">
          {question.question}
        </Text>
        <Text className="text-muted-foreground">
          Reflect on what you've learned this week
        </Text>
      </Card>

      <View className="gap-3">
        {question.options.map((option: any) => (
          <TouchButton
            key={option.value}
            onPress={() => handleResponse(option)}
          >
            {option.label}
          </TouchButton>
        ))}
      </View>
    </View>
  );
};
