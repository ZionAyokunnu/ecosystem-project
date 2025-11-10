import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MobileSurveyLayout } from './MobileSurveyLayout';
import { TouchButton } from './TouchButton';
import { AnswerFeedback } from './AnswerFeedback';

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
  const [showFeedback, setShowFeedback] = useState(false);

  const progress = surveyQuestions.length > 0 ? ((currentQuestion + 1) / surveyQuestions.length) * 100 : 0;

  const mascotMessages = [
    "Rate honestly based on your experience! 🏠",
    "You're helping your community! 💪",
    "Almost there! Your input matters! 🌟",
    "Last one - you're doing amazing! ✨"
  ];

  useEffect(() => {
    const loadLocalMeasurementSurvey = async () => {
      // Get recent exploration history
      const { data: recentIndicator } = await supabase
        .from('user_exploration_history')
        .select('final_indicator_id')
        .eq('user_id', userState.user_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!recentIndicator || recentIndicator.length === 0) {
        setLoading(false);
        return;
      }

      await generateDefaultMeasurementQuestions(recentIndicator[0].final_indicator_id);
      setLoading(false);
    };

    loadLocalMeasurementSurvey();
  }, [userState]);

  const generateDefaultMeasurementQuestions = async (indicatorId: string) => {
    const { data: indicator } = await supabase
      .from('indicators')
      .select('name')
      .eq('id', indicatorId)
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
    setResponses(prev => ({ ...prev, [questionId]: response }));
    setShowFeedback(true);

    setTimeout(() => {
      if (currentQuestion < surveyQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowFeedback(false);
      } else {
        const completionData = {
          responses: { ...responses, [questionId]: response },
          nodeId: nodeData.id,
          insights_earned: 4,
          measurement_type: 'local_assessment'
        };
        onComplete(completionData);
      }
    }, 1500);
  };

  const renderRatingScale = (question: any) => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between text-sm text-gray-500 px-4">
          <span>{question.scale_labels[0]}</span>
          <span>{question.scale_labels[question.scale_labels.length - 1]}</span>
        </div>
        
        <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto">
          {Array.from({ length: question.scale_max }, (_, i) => (
            <TouchButton
              key={i + 1}
              onClick={() => handleResponse(i + 1)}
              className="w-16 h-16 rounded-full border-4 border-blue-200 hover:border-blue-400 flex items-center justify-center text-xl font-bold relative overflow-visible"
            >
              <span className="relative z-10">{i + 1}</span>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                {question.scale_labels[i]}
              </div>
            </TouchButton>
          ))}
        </div>
      </div>
    );
  };

  const renderTextInput = (question: any) => {
    return (
      <div className="space-y-6">
        <textarea
          placeholder="Share your thoughts... (Optional)"
          className="w-full p-4 border-2 border-gray-200 rounded-2xl resize-none h-32 focus:border-blue-400 focus:outline-none text-lg"
          onChange={(e) => setResponses(prev => ({ 
            ...prev, 
            [question.question_id]: e.target.value 
          }))}
          value={responses[question.question_id] || ''}
        />
        <div className="grid grid-cols-2 gap-4">
          <TouchButton
            onClick={() => handleResponse('')}
            variant="secondary"
          >
            Skip
          </TouchButton>
          <TouchButton
            onClick={() => handleResponse(responses[question.question_id] || '')}
            variant="primary"
          >
            Continue
          </TouchButton>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <MobileSurveyLayout 
        progress={0} 
        totalQuestions={4} 
        currentQuestion={1}
        showMascot={false}
      >
        <div className="text-center py-12">
          <div className="text-6xl animate-spin mb-4">📍</div>
          <p className="text-lg text-gray-600">Loading survey...</p>
        </div>
      </MobileSurveyLayout>
    );
  }

  if (surveyQuestions.length === 0) {
    return (
      <MobileSurveyLayout 
        progress={0} 
        totalQuestions={4} 
        currentQuestion={1}
        showMascot={false}
      >
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📍</div>
          <h2 className="text-2xl font-bold mb-2">No measurement available</h2>
          <p className="text-gray-600">Complete some exploration first!</p>
        </div>
      </MobileSurveyLayout>
    );
  }

  const question = surveyQuestions[currentQuestion];

  return (
    <>
      <MobileSurveyLayout
        progress={progress}
        totalQuestions={surveyQuestions.length}
        currentQuestion={currentQuestion + 1}
        mascotMessage={mascotMessages[Math.min(currentQuestion, mascotMessages.length - 1)]}
      >
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📍</div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              {question.prompt}
            </h1>
            <p className="text-gray-600">
              Based on your experience in your local area
            </p>
          </div>

          {question.input_type === 'rating_scale' ? renderRatingScale(question) : renderTextInput(question)}
        </div>
      </MobileSurveyLayout>

      <AnswerFeedback
        show={showFeedback}
        type="good"
        message={question.input_type === 'text' ? "Thanks for sharing! 💭" : "Perfect rating! ⭐"}
        onComplete={() => setShowFeedback(false)}
      />
    </>
  );
};