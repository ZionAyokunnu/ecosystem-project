
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import SurveyRenderer from '@/components/SurveyRenderer';
import { awardPoints } from '@/services/gamificationApi';
import { toast } from 'sonner';

const OnboardingSurvey = () => {
  const { userProfile, setOnboardingComplete } = useUser();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<any>({});

  const steps = [
    {
      title: 'Welcome to Community Insights',
      type: 'intro',
      content: 'Help us understand how different aspects of community wellbeing connect and influence each other.'
    },
    {
      title: 'Your Role',
      type: 'role',
      content: 'What best describes your role in the community?'
    },
    {
      title: 'Your Expertise',
      type: 'domain',
      content: 'Which domain do you feel most confident discussing?'
    },
    {
      title: 'Community Relationships',
      type: 'survey',
      content: 'Help us understand how you perceive relationships between community indicators.'
    }
  ];

  const domains = ['Health', 'Education', 'Economy', 'Environment', 'Social'];
  const roles = ['resident', 'community_rep', 'researcher', 'business'];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Award points for completing onboarding
      const userId = userProfile?.name || 'demo-user';
      await awardPoints(userId, 'survey_completed', 50, { survey_type: 'onboarding' });
      
      setOnboardingComplete(true);
      toast.success('Onboarding completed! You earned 50 points.');
      navigate('/overview');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Error completing onboarding');
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step.type) {
      case 'intro':
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
            <p className="text-lg text-gray-600">{step.content}</p>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What you'll do:</h3>
              <ul className="text-blue-800 space-y-2 text-left">
                <li>• Share your community role and expertise</li>
                <li>• Provide insights on indicator relationships</li>
                <li>• Help build a comprehensive community model</li>
                <li>• Earn points and badges for participation</li>
              </ul>
            </div>
          </div>
        );

      case 'role':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">{step.title}</h2>
            <p className="text-gray-600 text-center">{step.content}</p>
            <div className="grid grid-cols-2 gap-4">
              {roles.map((role) => (
                <Button
                  key={role}
                  variant={responses.role === role ? "default" : "outline"}
                  className="p-6 h-auto"
                  onClick={() => setResponses({...responses, role})}
                >
                  <div className="text-center">
                    <div className="font-semibold capitalize">
                      {role.replace('_', ' ')}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'domain':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">{step.title}</h2>
            <p className="text-gray-600 text-center">{step.content}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {domains.map((domain) => (
                <Button
                  key={domain}
                  variant={responses.domain === domain ? "default" : "outline"}
                  className="p-6 h-auto"
                  onClick={() => setResponses({...responses, domain})}
                >
                  <div className="text-center">
                    <div className="font-semibold">{domain}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'survey':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">{step.title}</h2>
            <SurveyRenderer 
              onComplete={(surveyResponses) => {
                setResponses({...responses, surveyResponses});
                handleComplete();
              }}
              domain={responses.domain || 'Health'}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].type) {
      case 'intro':
        return true;
      case 'role':
        return responses.role;
      case 'domain':
        return responses.domain;
      case 'survey':
        return false; // Handled by SurveyRenderer
      default:
        return false;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600 mt-2 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {steps[currentStep].type !== 'survey' && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || currentStep === steps.length - 1}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingSurvey;
