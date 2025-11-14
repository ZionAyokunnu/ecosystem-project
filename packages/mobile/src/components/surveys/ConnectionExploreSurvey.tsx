import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase } from '@ecosystem/shared';
import { TouchButton } from './TouchButton';
import { Progress } from '@/src/components/ui/Progress';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';

interface ConnectionExploreSurveyProps {
  nodeData: any;
  userState: any;
  onComplete: (data: any) => void;
}

export const ConnectionExploreSurvey: React.FC<ConnectionExploreSurveyProps> = ({
  nodeData,
  userState,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [targetIndicator, setTargetIndicator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConnectionQuestions = async () => {
      const { data: recentHistory } = await supabase
        .from('user_exploration_history')
        .select('final_indicator_id')
        .eq('user_id', userState.user_id)
        .order('created_at', { ascending: false })
        .limit(1);

      let indicator;
      if (!recentHistory || recentHistory.length === 0) {
        const { data: indicators } = await supabase
          .from('indicators')
          .select('*')
          .limit(1);
        indicator = indicators?.[0];
      } else {
        const { data } = await supabase
          .from('indicators')
          .select('*')
          .eq('id', recentHistory[0].final_indicator_id)
          .single();
        indicator = data;
      }

      setTargetIndicator(indicator);
      await generateConnectionQuestions(indicator);
      setLoading(false);
    };

    loadConnectionQuestions();
  }, [userState]);

  const generateConnectionQuestions = async (target: any) => {
    if (!target) return;

    const { data: relationships } = await supabase
      .from('indicator_relationships')
      .select('*')
      .or(`parent_indicator_id.eq.${target.id},child_indicator_id.eq.${target.id}`)
      .limit(5);

    if (!relationships) return;

    const parentIds = relationships.map(r => r.parent_indicator_id);
    const childIds = relationships.map(r => r.child_indicator_id);
    const allIds = [...new Set([...parentIds, ...childIds])];

    const { data: indicators } = await supabase
      .from('indicators')
      .select('*')
      .in('id', allIds);

    const indicatorMap = new Map(indicators?.map(i => [i.id, i]) || []);

    const questionSet = relationships.slice(0, 3).map((rel, index) => ({
      id: `connection_${index}`,
      type: 'relationship',
      parentIndicator: indicatorMap.get(rel.parent_indicator_id),
      childIndicator: indicatorMap.get(rel.child_indicator_id),
      question: `How does ${indicatorMap.get(rel.parent_indicator_id)?.name} influence ${indicatorMap.get(rel.child_indicator_id)?.name}?`,
      options: [
        { value: 5, label: 'Very Strong Positive' },
        { value: 4, label: 'Some Positive' },
        { value: 3, label: 'No Clear Impact' },
        { value: 2, label: 'Some Negative' },
        { value: 1, label: 'Very Strong Negative' }
      ]
    }));

    setQuestions(questionSet);
  };

  const handleResponse = (response: any) => {
    const questionId = questions[currentQuestion].id;
    setResponses(prev => ({ ...prev, [questionId]: response }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete({
        targetIndicator: targetIndicator.id,
        responses,
        nodeId: nodeData.id,
        insights_earned: 5
      });
    }
  };

  if (loading || questions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-lg">Loading connections...</Text>
      </View>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 to-purple-50 p-6">
      <View className="mb-4">
        <Progress value={progress} className="h-2" />
        <Text className="text-sm text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      <Card className="p-6 mb-6">
        <Text className="text-xl font-bold mb-4">
          {question.question}
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
