import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeReviewSurveyProps {
  nodeData: any;
  userState: any;
  onComplete: (data: any) => void;
  onStart?: () => Promise<boolean>;
}

export const KnowledgeReviewSurvey: React.FC<KnowledgeReviewSurveyProps> = ({
  nodeData,
  userState,
  onComplete,
  onStart
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviewQuestions = async () => {
      // Get indicators explored in the last 7 days
      const { data: recentHistory } = await supabase
        .from('user_indicator_history')
        .select('indicator_id, domain_context')
        .eq('user_id', userState.user_id)
        .gte('usage_day', userState.current_day - 7)
        .limit(5);

      if (!recentHistory || recentHistory.length === 0) {
        setLoading(false);
        return;
      }

      const indicatorIds = [...new Set(recentHistory.map(h => h.indicator_id))];
      const { data: indicators } = await supabase
        .from('indicators')
        .select('*')
        .in('indicator_id', indicatorIds);

      const reviewQuestions = indicators?.map((indicator, index) => ({
        id: `review_${index}`,
        type: 'recall',
        indicator,
        question: `Can you recall: What did you learn about ${indicator.name}?`,
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
      const completionData = {
        responses,
        nodeId: nodeData.id,
        insights_earned: 6,
        review_type: 'weekly_knowledge'
      };
      onComplete(completionData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-muted/20">
        <div className="animate-spin text-4xl">📚</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-muted/20">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Nothing to review yet</h2>
          <p className="text-muted-foreground">Complete more activities this week!</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-muted/20 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-card rounded-3xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {question.question}
            </h1>
            <p className="text-muted-foreground">
              Reflect on what you've learned this week
            </p>
          </div>

          <div className="space-y-4">
            {question.options.map((option: any, index: number) => (
              <button
                key={option.value}
                onClick={() => handleResponse(option)}
                className="w-full p-4 rounded-2xl border-2 border-border hover:border-primary transition-all duration-200 text-left hover:shadow-md bg-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="font-medium text-foreground">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
