import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/context/LocationContext';
import { Label } from '@/components/ui/label';
import EnhancedLocationPicker from '@/components/EnhancedLocationPicker';
import { Switch } from '@/components/ui/switch';

interface SurveyQuestion {
  id: string;
  prompt: string;
  inputType: string;
  parentIndicatorId: string;
  childIndicatorId: string;
}

interface SurveyCreationFormProps {
  onSurveyCreated: (surveyId: string) => void;
  indicators: Array<{ indicator_id: string; name: string; category: string }>;
}

const SurveyCreationForm: React.FC<SurveyCreationFormProps> = ({ onSurveyCreated, indicators }) => {
  const [title, setTitle] = useState('');
  const { profile } = useAuth();
  const { user } = useAuth();
  const [domain, setDomain] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [isCompulsory, setIsCompulsory] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(false);
  const [justification, setJustification] = useState('');
  const [targetGenders, setTargetGenders] = useState<string[]>([]);
  const [targetAgeGroups, setTargetAgeGroups] = useState<string[]>([]);
  const { selectedLocation, targetLocation, setTargetLocation } = useLocation();
  const [newQuestion, setNewQuestion] = useState<Partial<SurveyQuestion>>({
    prompt: '',
    inputType: 'slider',
    parentIndicatorId: '',
    childIndicatorId: ''
  });
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { value: 'resident',      label: 'Community Resident'       },
    { value: 'community_rep', label: 'Community Representative' },
    { value: 'researcher',    label: 'Researcher'               },
    { value: 'business',      label: 'Business Owner'           }
  ];

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const ageGroupOptions = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
  const [applicableRoles, setApplicableRoles] = useState<string[]>([]);

  const [allIndicators, setAllIndicators] = useState<{ indicator_id: string; name: string; category: string }[]>([]);

  const inputTypes = [
    { value: 'slider', label: 'Slider (1-10)' },
    { value: 'radio', label: 'Multiple Choice' },
    { value: 'text', label: 'Text Response' },
    { value: 'relationship', label: 'Relationship Assessment' }
  ];

  const domains = ['Health', 'Education', 'Environment', 'Economy', 'Social', 'Infrastructure'];

  const addQuestion = () => {
    if (!newQuestion.prompt || !newQuestion.parentIndicatorId || !newQuestion.childIndicatorId) {
      toast.error('Please fill in all question fields');
      return;
    }

    const question: SurveyQuestion = {
      id: Date.now().toString(),
      prompt: newQuestion.prompt!,
      inputType: newQuestion.inputType || 'slider',
      parentIndicatorId: newQuestion.parentIndicatorId!,
      childIndicatorId: newQuestion.childIndicatorId!
    };

    setQuestions([...questions, question]);
    setNewQuestion({
      prompt: '',
      inputType: 'slider',
      parentIndicatorId: '',
      childIndicatorId: ''
    });
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  useEffect(() => {
    const loadIndicators = async () => {
      const { data, error } = await supabase
        .from('indicators')
        .select('indicator_id, name, category');
      if (error) {
        toast.error('Failed to load indicators');
      } else {
        setAllIndicators(data);
      }
    };
    loadIndicators();
  }, []);

  const createSurvey = async () => {
    if (!title || !domain || questions.length === 0) {
      toast.error('Please fill in all required fields and add at least one question');
      return;
    }

    if (!selectedLocation) {
      toast.error('Please select a target location');
      return;
    }

    setLoading(true);
    try {
      // Create survey
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .insert([{
          title,
          domain,
          description: justification,
          is_compulsory: isCompulsory,
          is_voice_enabled: isVoiceEnabled,
          justification,
          demographic_filters: {
            genders: targetGenders,
            age_groups: targetAgeGroups
          },
          status: 'pending_approval',
          applicable_roles: applicableRoles,
          target_location: selectedLocation.location_id,
          created_by: user!.id
        }])
        .select()
        .single();

      if (surveyError) throw surveyError;

      // Create questions
      const questionData = questions.map(q => ({
        survey_id: survey.survey_id,
        prompt: q.prompt,
        input_type: q.inputType,
        parent_indicator_id: q.parentIndicatorId,
        child_indicator_id: q.childIndicatorId,
        is_required: true
      }));

      const { error: questionsError } = await supabase
        .from('survey_questions')
        .insert(questionData);

      if (questionsError) throw questionsError;

      toast.success('Survey created successfully! Pending approval for community release.');
      onSurveyCreated(survey.survey_id);
      
      // Reset form
      setTitle('');
      setDomain('');
      setQuestions([]);
      setIsCompulsory(false);
      setIsVoiceEnabled(false);
      setJustification('');
      setTargetGenders([]);
      setTargetAgeGroups([]);
    } catch (error) {
      console.error('Error creating survey:', error);
      toast.error('Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  const getIndicatorName = (id: string) => {
    const indicator = indicators.find(ind => ind.indicator_id === id);
    return indicator?.name || 'Unknown';
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Survey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Survey Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter survey title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Domain</label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger>
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Existing Questions */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Questions ({questions.length})</h3>
            {questions.map((question, index) => (
              <Card key={question.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Q{index + 1}</Badge>
                      <Badge>{question.inputType}</Badge>
                    </div>
                    <p className="font-medium mb-2">{question.prompt}</p>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Indicators:</span> {getIndicatorName(question.parentIndicatorId)} ↔ {getIndicatorName(question.childIndicatorId)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add New Question */}
        <Card className="p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Add Question</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question Prompt</label>
              <Textarea
                value={newQuestion.prompt || ''}
                onChange={(e) => setNewQuestion({ ...newQuestion, prompt: e.target.value })}
                placeholder="Enter the question prompt"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Input Type</label>
                <Select 
                  value={newQuestion.inputType} 
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, inputType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {inputTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Parent Indicator</label>
                <Select
                  value={newQuestion.parentIndicatorId} 
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, parentIndicatorId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select indicator" />
                  </SelectTrigger>
                  <SelectContent>
                    {allIndicators.map(indicator => (
                      <SelectItem key={indicator.indicator_id} value={indicator.indicator_id}>
                        {indicator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Child Indicator</label>
                <Select 
                  value={newQuestion.childIndicatorId} 
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, childIndicatorId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select indicator" />
                  </SelectTrigger>
                  <SelectContent>
                    {allIndicators.map(indicator => (
                      <SelectItem key={indicator.indicator_id} value={indicator.indicator_id}>
                        {indicator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="is-compulsory" className="block text-sm font-medium mb-2">
                Is Compulsory?
              </Label>
              <Switch
                id="is-compulsory"
                checked={isCompulsory}
                onCheckedChange={setIsCompulsory}
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="is-voice-enabled" className="block text-sm font-medium mb-2">
                Enable Voice Calls?
              </Label>
              <Switch
                id="is-voice-enabled"
                checked={isVoiceEnabled}
                onCheckedChange={setIsVoiceEnabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                {isVoiceEnabled 
                  ? "Survey will be conducted via automated phone calls using Twilio" 
                  : "Survey will only be available via web interface"
                }
              </p>
            </div>

            {isVoiceEnabled && (
              <>
                <div className="mt-4">
                  <Label className="block text-sm font-medium mb-2">
                    Target Gender (Optional)
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    {genderOptions.map(gender => (
                      <div key={gender} className="flex items-center space-x-2">
                        <Switch
                          id={`gender-${gender}`}
                          checked={targetGenders.includes(gender)}
                          onCheckedChange={checked => {
                            if (checked) {
                              setTargetGenders([...targetGenders, gender]);
                            } else {
                              setTargetGenders(targetGenders.filter(g => g !== gender));
                            }
                          }}
                        />
                        <Label htmlFor={`gender-${gender}`}>{gender}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="block text-sm font-medium mb-2">
                    Target Age Groups (Optional)
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    {ageGroupOptions.map(ageGroup => (
                      <div key={ageGroup} className="flex items-center space-x-2">
                        <Switch
                          id={`age-${ageGroup}`}
                          checked={targetAgeGroups.includes(ageGroup)}
                          onCheckedChange={checked => {
                            if (checked) {
                              setTargetAgeGroups([...targetAgeGroups, ageGroup]);
                            } else {
                              setTargetAgeGroups(targetAgeGroups.filter(a => a !== ageGroup));
                            }
                          }}
                        />
                        <Label htmlFor={`age-${ageGroup}`}>{ageGroup}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="mt-4">
              <Label className="block text-sm font-medium mb-2">
                Applicable Roles
              </Label>
              <div className="flex flex-wrap gap-4">
                {roleOptions.map(role => (
                  <div key={role.value} className="flex items-center space-x-2">
                    <Switch
                      id={`role-${role.value}`}
                      checked={applicableRoles.includes(role.value)}
                      onCheckedChange={checked => {
                        if (checked) {
                          setApplicableRoles([...applicableRoles, role.value]);
                        } else {
                          setApplicableRoles(applicableRoles.filter(r => r !== role.value));
                        }
                      }}
                    />
                    <Label htmlFor={`role-${role.value}`}>
                      {role.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <label className="block mb-2 font-medium">Target Location</label>
            <EnhancedLocationPicker />

            {/* Explanation / Justification */}
            <div>
              <Label>Survey Explanation / Justification</Label>
              <Textarea
                placeholder="Why are you running this survey?"
                value={justification}
                onChange={e => setJustification(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Button onClick={addQuestion} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button 
            onClick={createSurvey} 
            disabled={loading || !title || !domain || questions.length === 0}
            className="min-w-32"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Survey
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveyCreationForm;
