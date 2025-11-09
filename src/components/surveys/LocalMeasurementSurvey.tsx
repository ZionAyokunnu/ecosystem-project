import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocalMeasurementSurveyProps {
  nodeData: any;
  userState: any;
  onComplete: (data: any) => void;
  onStart?: () => Promise<boolean>;
}

export const LocalMeasurementSurvey: React.FC<LocalMeasurementSurveyProps> = ({
  nodeData,
  userState,
  onComplete,
  onStart
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [surveyQuestions, setSurveyQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocalMeasurementSurvey = async () => {
      const { data: recentIndicator } = await supabase
        .from('user_indicator_history')
        .select('indicator_id')
        .eq('user_id', userState.user_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!recentIndicator || recentIndicator.length === 0) {
        setLoading(false);
        return;
      }

      await generateDefaultMeasurementQuestions(recentIndicator[0].indicator_id);
      setLoading(false);
    };

    loadLocalMeasurementSurvey();
  }, [userState]);

  const generateDefaultMeasurementQuestions = async (indicatorId: string) => {
    const { data: indicator } = await supabase
      .from('indicators')
      .select('name')
      .eq('indicator_id', indicatorId)
      .single();

    const defaultQuestions = [
      {
        question_id: 'current_state',
        prompt: `How would you rate the current state of ${indicator?.name} in your area?`,
        input_type: 'rating_scale',
        scale_min: 1,
        scale_max: 5,
        scale_labels: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']
      },
      {
        question_id: 'trend',
        prompt: `Over the past year, has ${indicator?.name} been getting better or worse?`,
        input_type: 'rating_scale',
        scale_min: 1,
        scale_max: 5,
        scale_labels: ['Much Worse', 'Worse', 'Same', 'Better', 'Much Better']
      },
      {
        question_id: 'confidence',
        prompt: 'How confident are you in your assessment?',
        input_type: 'rating_scale',
        scale_min: 1,
        scale_max: 5,
        scale_labels: ['Not Confident', 'Slightly Confident', 'Moderately Confident', 'Very Confident', 'Extremely Confident']
      },
      {
        question_id: 'observations',
        prompt: `Any specific observations about ${indicator?.name} in your area?`,
        input_type: 'text',
        is_required: false
      }
    ];

    setSurveyQuestions(defaultQuestions);
  };

  const handleResponse = (response: any) => {
    const questionId = surveyQuestions[currentQuestion].question_id;
    const updatedResponses = { ...responses, [questionId]: response };
    setResponses(updatedResponses);

    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const completionData = {
        responses: updatedResponses,
        nodeId: nodeData.id,
        insights_earned: 4,
        measurement_type: 'local_assessment'
      };
      onComplete(completionData);
    }
  };

  const renderQuestionInput = (question: any) => {
    switch (question.input_type) {
      case 'rating_scale':
        return (
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-4">
              <span>{question.scale_labels[0]}</span>
              <span>{question.scale_labels[question.scale_labels.length - 1]}</span>
            </div>
            <div className="flex justify-center gap-4">
              {Array.from({ length: question.scale_max }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handleResponse(i + 1)}
                  className="w-16 h-16 rounded-full border-4 border-primary/20 hover:border-primary transition-all duration-200 flex items-center justify-center font-bold text-xl hover:scale-110 hover:shadow-lg bg-card"
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="text-center text-xs text-muted-foreground space-y-1">
              {question.scale_labels.map((label: string, index: number) => (
                <div key={index}>{index + 1}: {label}</div>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <textarea
              placeholder="Share your thoughts... (Optional)"
              className="w-full p-4 border-2 border-border rounded-2xl resize-none h-32 focus:border-primary focus:outline-none bg-background text-foreground"
              onChange={(e) => setResponses(prev => ({
                ...prev,
                [question.question_id]: e.target.value
              }))}
              value={responses[question.question_id] || ''}
            />
            <div className="flex gap-4">
              <button
                onClick={() => handleResponse('')}
                className="flex-1 p-3 border-2 border-border rounded-xl text-muted-foreground hover:bg-muted"
              >
                Skip
              </button>
              <button
                onClick={() => handleResponse(responses[question.question_id] || '')}
                className="flex-1 p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
              >
                Continue
              </button>
            </div>
          </div>
        );

      default:
        return <div>Unsupported question type: {question.input_type}</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-accent/10 to-accent/5">
        <div className="animate-spin text-4xl">📍</div>
      </div>
    );
  }

  if (surveyQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-accent/10 to-accent/5">
        <div className="text-center">
          <div className="text-6xl mb-4">📍</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No measurement available</h2>
          <p className="text-muted-foreground">Complete some exploration first!</p>
        </div>
      </div>
    );
  }

  const question = surveyQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 to-accent/5 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestion + 1} of {surveyQuestions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-accent h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-card rounded-3xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📍</div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {question.prompt}
            </h1>
            <p className="text-muted-foreground">
              Based on your experience in your local area
            </p>
          </div>

          {renderQuestionInput(question)}
        </div>
      </div>
    </div>
  );
};
