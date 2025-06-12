
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { Indicator } from '@/types';

interface SurveyQuestion {
  question_id: string;
  parent_indicator_id: string;
  child_indicator_id: string;
  prompt: string;
  input_type: string;
  parent_indicator: { name: string };
  child_indicator: { name: string };
}

interface SurveyRendererProps {
  onComplete: (responses: any[]) => void;
  domain?: string;
}

const SurveyRenderer: React.FC<SurveyRendererProps> = ({ onComplete, domain = 'Health' }) => {
  const { userProfile } = useUser();
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [currentResponse, setCurrentResponse] = useState({
    direction: '',
    strength: [5],
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveyQuestions();
  }, [domain]);

  const fetchSurveyQuestions = async () => {
    try {
      setLoading(true);
      
      // First get the survey for this domain
      const { data: surveys } = await supabase
        .from('surveys')
        .select('survey_id')
        .eq('domain', domain)
        .eq('status', 'active')
        .limit(1);

      if (!surveys || surveys.length === 0) {
        // Create a default survey with sample questions
        await createDefaultSurvey();
        return;
      }

      const surveyId = surveys[0].survey_id;

      // Get questions with indicator names
      const { data: questionsData, error } = await supabase
        .from('survey_questions')
        .select(`
          *,
          parent_indicator:indicators!parent_indicator_id(name),
          child_indicator:indicators!child_indicator_id(name)
        `)
        .eq('survey_id', surveyId)
        .limit(5); // Limit to 5 questions for onboarding

      if (error) throw error;

      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Error fetching survey questions:', error);
      // Create fallback questions
      createDefaultSurvey();
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSurvey = async () => {
    // Create sample questions for demonstration
    const sampleQuestions = [
      {
        question_id: '1',
        parent_indicator_id: 'sample1',
        child_indicator_id: 'sample2',
        prompt: 'How do you think community safety affects children\'s education?',
        input_type: 'slider',
        parent_indicator: { name: 'Community Safety' },
        child_indicator: { name: 'Children\'s Education' }
      },
      {
        question_id: '2',
        parent_indicator_id: 'sample3',
        child_indicator_id: 'sample4',
        prompt: 'What relationship do you see between local employment and mental health?',
        input_type: 'slider',
        parent_indicator: { name: 'Local Employment' },
        child_indicator: { name: 'Mental Health' }
      }
    ];

    setQuestions(sampleQuestions as SurveyQuestion[]);
    setLoading(false);
  };

  const handleResponseSubmit = async () => {
    const question = questions[currentQuestionIndex];
    const userId = userProfile?.name || userProfile?.id;
    
    const response = {
      user_id: userId,
      parent_id: question.parent_indicator_id,
      child_id: question.child_indicator_id,
      domain: domain,
      strength_score: currentResponse.strength[0],
      direction: currentResponse.direction,
      notes_file_url: currentResponse.notes || null,
      additional_indicator_ids: []
    };

    // Save to database
    try {
      const { error } = await supabase
        .from('relationship_user_responses')
        .insert([response]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving response:', error);
    }

    // Add to local responses
    const newResponses = [...responses, response];
    setResponses(newResponses);

    // Reset current response
    setCurrentResponse({
      direction: '',
      strength: [5],
      notes: ''
    });

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(newResponses);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No survey questions available for this domain.</p>
          <Button onClick={() => onComplete([])} className="mt-4">
            Skip Survey
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.parent_indicator.name} → {currentQuestion.child_indicator.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700">{currentQuestion.prompt}</p>

          {/* Direction Selection */}
          <div>
            <Label className="text-base font-medium">
              What direction do you see this relationship?
            </Label>
            <RadioGroup
              value={currentResponse.direction}
              onValueChange={(value) => 
                setCurrentResponse({...currentResponse, direction: value})
              }
              className="mt-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A→B" id="a-to-b" />
                <Label htmlFor="a-to-b">
                  {currentQuestion.parent_indicator.name} influences {currentQuestion.child_indicator.name}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B→A" id="b-to-a" />
                <Label htmlFor="b-to-a">
                  {currentQuestion.child_indicator.name} influences {currentQuestion.parent_indicator.name}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Mutual" id="mutual" />
                <Label htmlFor="mutual">They influence each other equally</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Unclear" id="unclear" />
                <Label htmlFor="unclear">The relationship is unclear to me</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Strength Selection */}
          <div>
            <Label className="text-base font-medium">
              How strong is this relationship? ({currentResponse.strength[0]}/10)
            </Label>
            <div className="mt-3">
              <Slider
                value={currentResponse.strength}
                onValueChange={(value) => 
                  setCurrentResponse({...currentResponse, strength: value})
                }
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>No relationship</span>
                <span>Very strong</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <Button
              onClick={handleResponseSubmit}
              disabled={!currentResponse.direction}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Complete Survey' : 'Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyRenderer;
