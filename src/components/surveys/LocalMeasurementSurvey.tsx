import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { indicatorQuestionsService, IndicatorQuestion } from '@/services/indicatorQuestionsService';
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
  const [questions, setQuestions] = useState<IndicatorQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [targetIndicatorId, setTargetIndicatorId] = useState<string>('');
  const [sessionId] = useState(() => crypto.randomUUID());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const mascotMessages = [
    "Tell us about your local area! 🏠",
    "Your answers help your community! 💪", 
    "Almost there! You're doing great! 🌟",
    "Last question - you're amazing! ✨"
  ];

  useEffect(() => {
    loadLocalMeasurementSurvey();
  }, [userState]);

  const loadLocalMeasurementSurvey = async () => {
    try {
      let indicatorId = '';
      
      // Try to get from recent exploration history first
      const { data: recentHistory } = await supabase
        .from('user_exploration_history')
        .select('final_indicator_id')
        .eq('user_id', userState.user_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentHistory && recentHistory.length > 0) {
        indicatorId = recentHistory[0].final_indicator_id;
        console.log('Using indicator from exploration history:', indicatorId);
      } else {
        console.warn('No recent exploration history found, using fallback indicator');
        
        // Fallback: Use any indicator that has questions
        const { data: indicatorWithQuestions } = await supabase
          .from('indicator_questions' as any)
          .select('indicator_id')
          .eq('is_active', true)
          .limit(1);
        
        if (indicatorWithQuestions && indicatorWithQuestions.length > 0) {
          indicatorId = (indicatorWithQuestions as any)[0].indicator_id;
          console.log('Using fallback indicator:', indicatorId);
        }
      }

      if (!indicatorId) {
        console.error('No indicator found for local measurement');
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
    const responseTime = Math.round((Date.now() - questionStartTime) / 1000);
    
    setResponses(prev => ({ ...prev, [question.id]: response }));

    await indicatorQuestionsService.submitQuestionResponse(
      userState.user_id,
      question.id,
      targetIndicatorId,
      userState.location_id,
      response,
      {
        nodeId: nodeData.id,
        responseTimeSeconds: responseTime,
        sessionId: sessionId
      }
    );

    setShowFeedback(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setQuestionStartTime(Date.now());
        setShowFeedback(false);
      } else {
        completeLocalMeasurement();
      }
    }, 1500);
  };

  const completeLocalMeasurement = async () => {
    try {
      await indicatorQuestionsService.updateLocalMeasurementSummary(
        userState.user_id,
        targetIndicatorId,
        userState.location_id,
        nodeData.id
      );

      const completionData = {
        responses,
        nodeId: nodeData.id,
        insights_earned: 4,
        measurement_type: 'local_assessment',
        questions_answered: questions.length,
        target_indicator: targetIndicatorId
      };
      
      onComplete(completionData);
    } catch (error) {
      console.error('Error completing local measurement:', error);
    }
  };

  const renderQuestionInput = (question: IndicatorQuestion) => {
    switch (question.question_type) {
      case 'rating_emoji':
        return renderRatingEmoji(question);
      case 'simple_choice':
        return renderSimpleChoice(question);
      case 'yes_no':
        return renderYesNo(question);
      case 'count_estimate':
        return renderCountEstimate(question);
      case 'text_short':
        return renderTextShort(question);
      default:
        return <div>Unsupported question type</div>;
    }
  };

  const renderRatingEmoji = (question: IndicatorQuestion) => {
    const options = question.response_config.options || [];
    return (
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        {options.map((option: any, index: number) => (
          <TouchButton
            key={index}
            onClick={() => handleResponse({ value: option.value, emoji: option.emoji })}
            className="p-6 flex flex-col items-center gap-2"
          >
            <span className="text-4xl">{option.emoji}</span>
            <span className="text-sm">{option.label}</span>
          </TouchButton>
        ))}
      </div>
    );
  };

  const renderSimpleChoice = (question: IndicatorQuestion) => {
    const options = question.response_config.options || [];
    return (
      <div className="space-y-3">
        {options.map((option: string, index: number) => (
          <TouchButton
            key={index}
            onClick={() => handleResponse({ choice: option, index })}
            className="w-full p-4 text-left"
          >
            {option}
          </TouchButton>
        ))}
      </div>
    );
  };

  const renderYesNo = (question: IndicatorQuestion) => {
    const config = question.response_config;
    return (
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        <TouchButton
          onClick={() => handleResponse({ answer: true })}
          className="p-6 bg-green-50 border-green-200 text-green-800"
        >
          <div className="text-2xl mb-2">✅</div>
          <div>{config.true_label || 'Yes'}</div>
        </TouchButton>
        <TouchButton
          onClick={() => handleResponse({ answer: false })}
          className="p-6 bg-red-50 border-red-200 text-red-800"
        >
          <div className="text-2xl mb-2">❌</div>
          <div>{config.false_label || 'No'}</div>
        </TouchButton>
      </div>
    );
  };

  const renderCountEstimate = (question: IndicatorQuestion) => {
    return renderSimpleChoice(question);
  };

  const renderTextShort = (question: IndicatorQuestion) => {
    const [textValue, setTextValue] = useState('');
    const config = question.response_config;
    
    return (
      <div className="space-y-4">
        <textarea
          placeholder={config.placeholder || "Type your answer..."}
          className="w-full p-4 border-2 border-gray-200 rounded-2xl resize-none h-24 focus:border-blue-400 focus:outline-none text-lg"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          maxLength={config.max_words * 10 || 150}
        />
        <div className="grid grid-cols-2 gap-4">
          <TouchButton
            onClick={() => handleResponse({ text: '' })}
            variant="secondary"
          >
            Skip
          </TouchButton>
          <TouchButton
            onClick={() => handleResponse({ text: textValue })}
            variant="primary"
            disabled={textValue.trim().length === 0}
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
          <p className="text-lg text-gray-600">Loading questions about your area...</p>
        </div>
      </MobileSurveyLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <MobileSurveyLayout 
        progress={100} 
        totalQuestions={1} 
        currentQuestion={1}
        showMascot={false}
      >
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">All done!</h2>
          <p className="text-gray-600">You've answered all available questions for this area.</p>
          <TouchButton
            onClick={() => onComplete({ insights_earned: 2 })}
            className="mt-6"
          >
            Continue Learning
          </TouchButton>
        </div>
      </MobileSurveyLayout>
    );
  }

  const question = questions[currentQuestion];

  return (
    <>
      <MobileSurveyLayout
        progress={progress}
        totalQuestions={questions.length}
        currentQuestion={currentQuestion + 1}
        mascotMessage={mascotMessages[Math.min(currentQuestion, mascotMessages.length - 1)]}
      >
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📍</div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              {question.question_text}
            </h1>
            <p className="text-gray-600">
              Help us understand your local area
            </p>
          </div>

          {renderQuestionInput(question)}
        </div>
      </MobileSurveyLayout>

      <AnswerFeedback
        show={showFeedback}
        type="good"
        message="Great answer! 🌟"
        onComplete={() => setShowFeedback(false)}
      />
    </>
  );
};
