import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionExploreSurveyProps {
  nodeData: any;
  userState: any;
  onComplete: (data: any) => void;
  onStart?: () => Promise<boolean>;
}

export const ConnectionExploreSurvey: React.FC<ConnectionExploreSurveyProps> = ({
  nodeData,
  userState,
  onComplete,
  onStart
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [targetIndicator, setTargetIndicator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConnectionQuestions = async () => {
      const { data: lastDomainUsage } = await supabase
        .from('user_indicator_history')
        .select('indicator_id, domain_context')
        .eq('user_id', userState.user_id)
        .eq('usage_type', 'domain_focus')
        .order('created_at', { ascending: false })
        .limit(1);

      let indicator;
      if (!lastDomainUsage || lastDomainUsage.length === 0) {
        const { data: indicators } = await supabase
          .from('indicators')
          .select('*')
          .limit(1);
        indicator = indicators?.[0];
      } else {
        const { data } = await supabase
          .from('indicators')
          .select('*')
          .eq('indicator_id', lastDomainUsage[0].indicator_id)
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
      .from('relationships')
      .select('*')
      .or(`parent_id.eq.${target.indicator_id},child_id.eq.${target.indicator_id}`)
      .limit(5);

    if (!relationships) return;

    const parentIds = relationships.map(r => r.parent_id);
    const childIds = relationships.map(r => r.child_id);
    const allIds = [...new Set([...parentIds, ...childIds])];

    const { data: indicators } = await supabase
      .from('indicators')
      .select('*')
      .in('indicator_id', allIds);

    const indicatorMap = new Map(indicators?.map(i => [i.indicator_id, i]) || []);

    const questionSet = relationships.map((rel, index) => ({
      id: `connection_${index}`,
      type: 'relationship',
      parentIndicator: indicatorMap.get(rel.parent_id),
      childIndicator: indicatorMap.get(rel.child_id),
      relationshipId: rel.relationship_id,
      question: `How does ${indicatorMap.get(rel.parent_id)?.name} influence ${indicatorMap.get(rel.child_id)?.name} in your community?`,
      options: [
        { value: 5, label: 'Very Strong Positive Impact', color: 'hsl(var(--chart-1))' },
        { value: 4, label: 'Some Positive Impact', color: 'hsl(var(--chart-2))' },
        { value: 3, label: 'No Clear Impact', color: 'hsl(var(--muted))' },
        { value: 2, label: 'Some Negative Impact', color: 'hsl(var(--chart-3))' },
        { value: 1, label: 'Very Strong Negative Impact', color: 'hsl(var(--destructive))' }
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
      const completionData = {
        targetIndicator: targetIndicator.indicator_id,
        responses,
        nodeId: nodeData.id,
        insights_earned: 5
      };
      onComplete(completionData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary/10 to-secondary/5">
        <div className="animate-spin text-4xl">🔗</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary/10 to-secondary/5">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No connections available</h2>
          <p className="text-muted-foreground">Try exploring more domains first!</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/10 to-secondary/5 p-6">
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
              className="bg-secondary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-card rounded-3xl shadow-xl p-8 mb-8 border border-border">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔗</div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {question.question}
            </h1>
            <p className="text-muted-foreground">
              Based on your experience in the community
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
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-4"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="font-medium text-foreground">
                    {option.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
