
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/context/UserContext';
import { useEcosystem } from '@/context/EcosystemContext';
import { Indicator } from '@/types';

interface OnboardingStep {
  step: number;
  title: string;
  completed: boolean;
}

const OnboardingSurvey: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, setOnboardingComplete } = useUser();
  const { indicators } = useEcosystem();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  const steps: OnboardingStep[] = [
    { step: 1, title: 'Community Role', completed: false },
    { step: 2, title: 'Location & Domain', completed: false },
    { step: 3, title: 'Indicator Relationships', completed: false },
    { step: 4, title: 'Complete', completed: false }
  ];

  const domains = ['Health', 'Education', 'Economy', 'Environment', 'Safety', 'Housing', 'Transportation', 'Culture'];
  const roles = ['Resident', 'Community Representative', 'Business Owner', 'Healthcare Worker', 'Educator', 'Government Official'];

  const getIndicatorsByDomain = (domain: string): Indicator[] => {
    return indicators.filter(ind => ind.category.toLowerCase().includes(domain.toLowerCase()));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      setOnboardingComplete(true);
      navigate('/');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateResponse = (key: string, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold">What is your role in the community?</Label>
        <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
        <div className="grid grid-cols-2 gap-3">
          {roles.map(role => (
            <div key={role} className="flex items-center space-x-2">
              <Checkbox
                id={role}
                checked={responses.roles?.includes(role) || false}
                onCheckedChange={(checked) => {
                  const currentRoles = responses.roles || [];
                  if (checked) {
                    updateResponse('roles', [...currentRoles, role]);
                  } else {
                    updateResponse('roles', currentRoles.filter((r: string) => r !== role));
                  }
                }}
              />
              <Label htmlFor={role}>{role}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="town">What town or city do you primarily focus on?</Label>
        <Input
          id="town"
          value={responses.town || ''}
          onChange={(e) => updateResponse('town', e.target.value)}
          placeholder="Enter your town/city"
          className="mt-2"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold">Which domain do you feel most confident in?</Label>
        <p className="text-sm text-gray-600 mb-4">This will help us customize your experience</p>
        <div className="grid grid-cols-2 gap-3">
          {domains.map(domain => (
            <Button
              key={domain}
              variant={responses.confidenceDomain === domain ? "default" : "outline"}
              onClick={() => updateResponse('confidenceDomain', domain)}
              className="justify-start"
            >
              {domain}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const selectedDomain = responses.confidenceDomain;
    const domainIndicators = selectedDomain ? getIndicatorsByDomain(selectedDomain).slice(0, 3) : [];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Understanding {selectedDomain} Relationships
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Help us understand how you see these indicators relating to each other in your community.
          </p>
        </div>

        {domainIndicators.map((indicator, index) => {
          const otherIndicators = domainIndicators.filter((_, i) => i !== index);
          
          return (
            <Card key={indicator.indicator_id} className="p-4">
              <h4 className="font-medium mb-3">{indicator.name}</h4>
              
              {otherIndicators.map(otherIndicator => (
                <div key={`${indicator.indicator_id}-${otherIndicator.indicator_id}`} className="mb-4 p-3 bg-gray-50 rounded">
                  <Label className="text-sm font-medium">
                    How strongly does "{indicator.name}" influence "{otherIndicator.name}"?
                  </Label>
                  <div className="mt-2">
                    <Slider
                      value={[responses[`${indicator.indicator_id}-${otherIndicator.indicator_id}`] || 5]}
                      onValueChange={(value) => 
                        updateResponse(`${indicator.indicator_id}-${otherIndicator.indicator_id}`, value[0])
                      }
                      max={10}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>No influence</span>
                      <span>Strong influence</span>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          );
        })}
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold">Onboarding Complete!</h2>
      <p className="text-gray-600">
        Thank you for sharing your insights. Your responses will help improve our understanding 
        of community wellbeing relationships.
      </p>
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">What's Next?</h3>
        <ul className="text-sm text-left space-y-1">
          <li>• Explore the interactive sunburst chart</li>
          <li>• Share your community stories</li>
          <li>• Research specific indicators</li>
          <li>• Run simulations to see potential impacts</li>
        </ul>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return responses.roles?.length > 0 && responses.town;
      case 2:
        return responses.confidenceDomain;
      case 3:
        return true; // Allow proceeding even without all responses
      case 4:
        return true;
      default:
        return false;
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to Community Wellbeing</h1>
          <Progress value={progress} className="mb-4" />
          <p className="text-gray-600">Step {currentStep} of 4: {steps[currentStep - 1]?.title}</p>
        </div>

        <Card>
          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === 4 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSurvey;
