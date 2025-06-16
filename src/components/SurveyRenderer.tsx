
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { ArrowRight, ArrowLeft, Plus, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

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
  domainId?: string;
}

const SurveyRenderer: React.FC<SurveyRendererProps> = ({ onComplete, domainId }) => {
  const { userProfile } = useUser();
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [currentResponse, setCurrentResponse] = useState({
    direction: '',
    strength: [5],
    notes: '',
    additionalOptions: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [newOptionText, setNewOptionText] = useState('');

  useEffect(() => {
    if (!domainId) {
      console.error("SurveyRenderer: domainId is missing — survey cannot load.");
      return;
    }
    fetchSurveyQuestions();
  }, [domainId]);

  const fetchSurveyQuestions = async () => {
    try {
      setLoading(true);

      // Check if a survey exists for this domain ID
      const { data: surveys } = await supabase
        .from('surveys')
        .select('survey_id')
        .eq('domain', domainId)
        .eq('status', 'active')
        .limit(1);

      if (!surveys || surveys.length === 0) {
        // Create survey if none exists
        const { data: newSurvey, error: surveyError } = await supabase
          .from('surveys')
          .insert([{ domain: domainId, status: 'active', title: `Survey for ${domainId}` }])
          .select()
          .single();
        
        if (surveyError) throw surveyError;

        const newSurveyId = newSurvey.survey_id;

        // Get relationship pairs for this domain
        const { data: pairs, error: relError } = await supabase
          .from('relationship_domains')
          .select('relationship_id, relationships(parent_id, child_id)')
          .eq('domain_id', domainId);

        if (relError) throw relError;

        const newQuestions = pairs.map(p => ({
          survey_id: newSurveyId,
          parent_indicator_id: p.relationships.parent_id,
          child_indicator_id: p.relationships.child_id,
          prompt: `How do these community aspects relate to each other?`,
          input_type: 'relationship',
        }));

        const { data: insertedQuestions, error: insertError } = await supabase
          .from('survey_questions')
          .insert(newQuestions)
          .select('*, parent_indicator:indicators!parent_indicator_id(name), child_indicator:indicators!child_indicator_id(name)');
        
        if (insertError) throw insertError;
        setQuestions(insertedQuestions || []);
      } else {
        // Survey exists, fetch its questions
        const surveyId = surveys[0].survey_id;
        const { data: allQuestions, error: qErr } = await supabase
          .from('survey_questions')
          .select('*, parent_indicator:indicators!parent_indicator_id(name), child_indicator:indicators!child_indicator_id(name)')
          .eq('survey_id', surveyId);
        
        if (qErr) throw qErr;
        setQuestions(allQuestions || []);
      }
    } catch (error) {
      console.error("SurveyRenderer: failed to load questions", error);
      toast.error('Failed to load survey questions');
    } finally {
      setLoading(false);
    }
  };

  const directions = [
    { 
      value: 'A→B', 
      label: 'A influences B', 
      icon: TrendingUp,
      description: 'The first factor causes changes in the second'
    },
    { 
      value: 'B→A', 
      label: 'B influences A', 
      icon: TrendingDown,
      description: 'The second factor causes changes in the first'
    },
    { 
      value: 'Mutual', 
      label: 'Mutual influence', 
      icon: Target,
      description: 'Both factors influence each other'
    },
    { 
      value: 'Unclear', 
      label: 'Relationship unclear', 
      icon: Minus,
      description: 'The relationship is not clear or may not exist'
    }
  ];

  const handleNext = async () => {
    if (!currentResponse.direction) {
      toast.error('Please select a relationship direction');
      return;
    }

    const response = {
      ...currentResponse,
      question_id: questions[currentQuestionIndex].question_id,
      parent_id: questions[currentQuestionIndex].parent_indicator_id,
      child_id: questions[currentQuestionIndex].child_indicator_id,
      user_id: userProfile?.id,
      domain: domainId,
      strength_score: currentResponse.strength[0],
      created_at: new Date().toISOString()
    };

    const newResponses = [...responses, response];
    setResponses(newResponses);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentResponse({
        direction: '',
        strength: [5],
        notes: '',
        additionalOptions: []
      });
      setNewOptionText('');
    } else {
      // Submit all responses
      try {
        for (const resp of newResponses) {
          await supabase
            .from('relationship_user_responses')
            .insert([{
              user_id: resp.user_id,
              parent_id: resp.parent_id,
              child_id: resp.child_id,
              domain: resp.domain,
              direction: resp.direction,
              strength_score: resp.strength_score,
              notes_file_url: resp.notes || null,
              additional_indicator_ids: resp.additionalOptions
            }]);
        }
        onComplete(newResponses);
      } catch (error) {
        console.error('Error submitting responses:', error);
        toast.error('Failed to submit responses');
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevResponse = responses[currentQuestionIndex - 1];
      if (prevResponse) {
        setCurrentResponse({
          direction: prevResponse.direction,
          strength: [prevResponse.strength_score],
          notes: prevResponse.notes || '',
          additionalOptions: prevResponse.additionalOptions || []
        });
      }
    }
  };

  const addNewOption = () => {
    if (newOptionText.trim()) {
      setCurrentResponse({
        ...currentResponse,
        additionalOptions: [...currentResponse.additionalOptions, newOptionText.trim()]
      });
      setNewOptionText('');
    }
  };

  const removeOption = (index: number) => {
    const newOptions = currentResponse.additionalOptions.filter((_, i) => i !== index);
    setCurrentResponse({
      ...currentResponse,
      additionalOptions: newOptions
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading survey questions...</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No survey questions available for this domain.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Question Card */}
      <Card className="shadow-lg animate-fade-in">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-xl">Relationship Assessment</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Indicators */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-900 mb-2">Factor A</h3>
              <p className="text-blue-700">{currentQuestion.parent_indicator?.name || 'Unknown Indicator'}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h3 className="font-semibold text-green-900 mb-2">Factor B</h3>
              <p className="text-green-700">{currentQuestion.child_indicator?.name || 'Unknown Indicator'}</p>
            </div>
          </div>

          {/* Direction Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How do these factors relate?</h3>
            <RadioGroup 
              value={currentResponse.direction} 
              onValueChange={(value) => setCurrentResponse({...currentResponse, direction: value})}
            >
              <div className="grid md:grid-cols-2 gap-4">
                {directions.map((dir) => {
                  const IconComponent = dir.icon;
                  return (
                    <div key={dir.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={dir.value} id={dir.value} />
                      <Label htmlFor={dir.value} className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium">{dir.label}</div>
                            <div className="text-sm text-gray-600">{dir.description}</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Strength Selection */}
          {currentResponse.direction && currentResponse.direction !== 'Unclear' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold">How strong is this relationship?</h3>
              <div className="space-y-4">
                <Slider
                  value={currentResponse.strength}
                  onValueChange={(value) => setCurrentResponse({...currentResponse, strength: value})}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Weak (1)</span>
                  <span className="font-medium">Strength: {currentResponse.strength[0]}</span>
                  <span>Strong (10)</span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional factors to consider (optional)</h3>
            
            {currentResponse.additionalOptions.length > 0 && (
              <div className="space-y-2">
                {currentResponse.additionalOptions.map((option, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">{option}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-2">
              <input
                type="text"
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                placeholder="Add another factor..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addNewOption()}
              />
              <Button onClick={addNewOption} disabled={!newOptionText.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional notes (optional)</h3>
            <Textarea
              value={currentResponse.notes}
              onChange={(e) => setCurrentResponse({...currentResponse, notes: e.target.value})}
              placeholder="Share any additional thoughts about this relationship..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!currentResponse.direction}
          className="transition-all duration-200 hover:scale-105"
        >
          {currentQuestionIndex === questions.length - 1 ? 'Complete Survey' : 'Next Question'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SurveyRenderer;
