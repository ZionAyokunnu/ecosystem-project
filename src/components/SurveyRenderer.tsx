import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, ArrowLeft, Plus, Target, TrendingUp, TrendingDown, Minus, ArrowUpDown, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import ResponseRateBadge from './ResponseRateBadge';

interface SurveyQuestion {
  question_id: string;
  parent_indicator_id: string;
  child_indicator_id: string;
  prompt: string;
  input_type: string;
  parent_indicator: { name: string };
  child_indicator: { name: string };
}

interface Domain {
  domain_id: string;
  name: string;
  level: number;
  parent_id: string | null;
}

interface SurveyRendererProps {
  onComplete: (responses: any[]) => void;
  domainId?: string;
  domainPath?: Domain[];
}

const SurveyRenderer: React.FC<SurveyRendererProps> = ({ onComplete, domainId, domainPath = [] }) => {
  const { user } = useAuth();
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
      console.error("🚨 SurveyRenderer: domainId is missing — survey cannot load.");
      return;
    }
    if (!user?.id) {
      console.error("🚨 SurveyRenderer: user ID is missing — survey cannot load.");
      toast.error('Please log in to complete the survey');
      return;
    }
    console.log("🎯 SurveyRenderer: Starting with domainId:", domainId);
    console.log("👤 SurveyRenderer: User ID:", user.id);
    console.log("🗂️ SurveyRenderer: Domain path:", domainPath);
    fetchSurveyQuestions();
  }, [domainId, user]);

  const fetchSurveyQuestions = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching survey questions for domain:", domainId);

      // First, get relationship pairs for this domain from relationship_domains table
      const { data: relationshipPairs, error: relError } = await supabase
        .from('relationship_domains')
        .select(`
          relationship_id,
          relationships!inner(
            relationship_id,
            parent_id,
            child_id,
            parent_indicator:indicators!parent_id(indicator_id, name),
            child_indicator:indicators!child_id(indicator_id, name)
          )
        `)
        .eq('domain_id', domainId);

      if (relError) {
        console.error("❌ Error fetching relationship pairs:", relError);
        throw relError;
      }

      console.log("📊 Relationship pairs found:", relationshipPairs);

      if (!relationshipPairs || relationshipPairs.length === 0) {
        console.log("⚠️ No relationship pairs found for domain:", domainId);
        toast.error('No survey questions available for this domain.');
        setQuestions([]);
        setLoading(false);
        return;
      }

      // Check if a survey exists for this domain
      let surveyId;
      const { data: existingSurveys } = await supabase
        .from('surveys')
        .select('survey_id')
        .eq('domain', domainId)
        .eq('status', 'active')
        .limit(1);

      if (existingSurveys && existingSurveys.length > 0) {
        surveyId = existingSurveys[0].survey_id;
        console.log("✅ Using existing survey:", surveyId);
      } else {
        // Create new survey
        const domainName = domainPath.length > 0 ? domainPath[domainPath.length - 1].name : 'Unknown Domain';
        const { data: newSurvey, error: surveyError } = await supabase
          .from('surveys')
          .insert([{ 
            domain: domainId, 
            status: 'active', 
            title: `${domainName} Relationship Survey`
          }])
          .select()
          .single();
        
        if (surveyError) {
          console.error("❌ Error creating survey:", surveyError);
          throw surveyError;
        }

        surveyId = newSurvey.survey_id;
        console.log("🆕 Created new survey:", surveyId);
      }

      // Get existing questions for this survey
      const { data: existingQuestions, error: questionsError } = await supabase
        .from('survey_questions')
        .select(`
          *,
          parent_indicator:indicators!parent_indicator_id(name),
          child_indicator:indicators!child_indicator_id(name)
        `)
        .eq('survey_id', surveyId);

      if (questionsError) {
        console.error("❌ Error fetching questions:", questionsError);
        throw questionsError;
      }

      console.log("📝 Existing questions:", existingQuestions);

      // If no questions exist, create them from relationship pairs
      if (!existingQuestions || existingQuestions.length === 0) {
        console.log("🏗️ Creating questions from relationship pairs...");
        
        const newQuestions = relationshipPairs.map(pair => ({
          survey_id: surveyId,
          parent_indicator_id: pair.relationships.parent_id,
          child_indicator_id: pair.relationships.child_id,
          prompt: `How do these community factors relate to each other?`,
          input_type: 'relationship',
        }));

        const { data: insertedQuestions, error: insertError } = await supabase
          .from('survey_questions')
          .insert(newQuestions)
          .select(`
            *,
            parent_indicator:indicators!parent_indicator_id(name),
            child_indicator:indicators!child_indicator_id(name)
          `);
        
        if (insertError) {
          console.error("❌ Error inserting questions:", insertError);
          throw insertError;
        }

        console.log("✅ Created questions:", insertedQuestions);
        setQuestions(insertedQuestions || []);
      } else {
        console.log("✅ Using existing questions:", existingQuestions);
        setQuestions(existingQuestions || []);
      }
    } catch (error) {
      console.error("💥 SurveyRenderer: failed to load questions", error);
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
      label: 'Both influence each other', 
      icon: ArrowUpDown,
      description: 'Both factors influence each other equally'
    },
    { 
      value: 'Unclear', 
      label: 'Relationship unclear', 
      icon: HelpCircle,
      description: 'The relationship is not clear or may not exist'
    }
  ];

  const handleNext = async () => {
    if (!currentResponse.direction) {
      toast.error('Please select a relationship direction');
      return;
    }

    if (!user?.id) {
      console.error("🚨 No user ID available for submission");
      toast.error('Please log in to submit responses');
      return;
    }

    console.log("➡️ Moving to next question. Current response:", currentResponse);
    console.log("👤 User ID for submission:", user.id);

    const response = {
      ...currentResponse,
      question_id: questions[currentQuestionIndex].question_id,
      parent_id: questions[currentQuestionIndex].parent_indicator_id,
      child_id: questions[currentQuestionIndex].child_indicator_id,
      user_id: user.id, // Using user.id from useAuth instead of userProfile.id
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
      console.log("🏁 Submitting all responses:", newResponses);
      try {
        for (const resp of newResponses) {
          console.log("📤 Submitting response:", {
            user_id: resp.user_id,
            parent_id: resp.parent_id,
            child_id: resp.child_id,
            domain: resp.domain,
            direction: resp.direction,
            strength_score: resp.strength_score,
            notes_file_url: resp.notes || null,
            additional_indicator_ids: resp.additionalOptions
          });

          const { error } = await supabase
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
          
          if (error) {
            console.error("❌ Error submitting response:", error);
            throw error;
          }
        }
        console.log("✅ All responses submitted successfully");
        onComplete(newResponses);
      } catch (error) {
        console.error('💥 Error submitting responses:', error);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
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

  if (!user?.id) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Please log in to complete the survey.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Domain Context */}
      {domainPath.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-20 p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Survey Domain</h3>
          <div className="text-lg font-semibold text-gray-700">
            {domainPath.map(d => d.name).join(' → ')}
          </div>
        </div>
      )}

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
        <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Relationship Assessment</CardTitle>
            <ResponseRateBadge 
              parentId={currentQuestion.parent_indicator_id}
              childId={currentQuestion.child_indicator_id}
              className="bg-white/20 text-white"
            />
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Indicators */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500">
              <h3 className="font-semibold text-gray-900 mb-2">Factor A</h3>
              <p className="text-gray-700">{currentQuestion.parent_indicator?.name || 'Unknown Indicator'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500">
              <h3 className="font-semibold text-gray-900 mb-2">Factor B</h3>
              <p className="text-gray-700">{currentQuestion.child_indicator?.name || 'Unknown Indicator'}</p>
            </div>
          </div>

          {/* Direction Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How do these factors relate?</h3>
            <RadioGroup 
              value={currentResponse.direction} 
              onValueChange={(value) => setCurrentResponse({...currentResponse, direction: value})}
            >
              <div className="grid gap-3">
                {directions.map((dir) => {
                  const IconComponent = dir.icon;
                  return (
                    <div key={dir.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={dir.value} id={dir.value} />
                      <Label htmlFor={dir.value} className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-3">
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
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
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
