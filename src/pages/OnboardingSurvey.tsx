
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Lightbulb, Users, Target, BookOpen } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import SurveyRenderer from '@/components/SurveyRenderer';
import { awardPoints } from '@/services/gamificationApi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface Domain {
  parent_id: string | null;
  level: number;
  domain_id: string;
  name: string;
}

const OnboardingSurvey = () => {
  const { userProfile, setOnboardingComplete } = useUser();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<any>({});
  const [rootDomains, setRootDomains] = useState<Domain[]>([]);
  const [childDomains, setChildDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load root domains (level 1)
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('domains')
          .select('*')
          .eq('level', 1)
          .order('name');
        if (error) throw error;
        setRootDomains(data || []);
      } catch (error) {
        console.error('Error fetching domains:', error);
        toast.error('Failed to load domains');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDomains();
  }, []);

  const steps = [
    { 
      title: 'Welcome to Community Insights', 
      type: 'intro', 
      content: 'Help us understand how different aspects of community wellbeing connect and influence each other.',
      icon: Lightbulb
    },
    { 
      title: 'Your Role', 
      type: 'role', 
      content: 'What best describes your role in the community?',
      icon: Users
    },
    { 
      title: 'Your Expertise', 
      type: 'domain', 
      content: 'Which domain do you feel most confident discussing?',
      icon: Target
    },
    { 
      title: 'Community Relationships', 
      type: 'survey', 
      content: 'Help us understand how you perceive relationships between community indicators.',
      icon: BookOpen
    }
  ];

  const roles = [
    { value: 'resident', label: 'Community Resident', description: 'I live in this community' },
    { value: 'community_rep', label: 'Community Representative', description: 'I represent community interests' },
    { value: 'researcher', label: 'Researcher', description: 'I study community wellbeing' },
    { value: 'business', label: 'Business Owner', description: 'I run a business in this area' }
  ];

  const handleDomainSelect = (domain: Domain) => {
    setSelectedDomain(domain);
    setChildDomains([]); // Clear any previous children
  };

  const handleNext = async () => {
    if (steps[currentStep].type === 'domain') {
      if (!selectedDomain) {
        toast.error('Please select a domain to continue');
        return;
      }

      setIsLoading(true);
      try {
        // Fetch children of selected domain
        const { data, error } = await supabase
          .from('domains')
          .select('*')
          .eq('parent_id', selectedDomain.domain_id)
          .order('name');

        if (error) throw error;

        if (data && data.length > 0) {
          // Has children - show them
          setChildDomains(data);
          setSelectedDomain(null); // Reset selection for next level
        } else {
          // No children - this is a leaf domain
          setResponses({ ...responses, domain: selectedDomain.domain_id });
          setCurrentStep(currentStep + 1);
        }
      } catch (error) {
        console.error('Error fetching child domains:', error);
        toast.error('Failed to load subdomains');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = async () => {
    if (steps[currentStep].type === 'domain') {
      if (childDomains.length > 0) {
        // We're in a subdomain level - go back to parent level
        try {
          setIsLoading(true);
          
          // Get the parent of the first child (they all have same parent)
          const parentId = childDomains[0].parent_id;
          
          if (parentId) {
            // Fetch parent domain
            const { data: parentData, error: parentError } = await supabase
              .from('domains')
              .select('*')
              .eq('domain_id', parentId)
              .single();

            if (parentError) throw parentError;

            // Fetch siblings of parent
            const { data: siblingsData, error: siblingsError } = await supabase
              .from('domains')
              .select('*')
              .eq('parent_id', parentData.parent_id || null)
              .order('name');

            if (siblingsError) throw siblingsError;

            setSelectedDomain(parentData);
            setChildDomains(siblingsData || []);
          } else {
            // Parent is root level
            setSelectedDomain(null);
            setChildDomains([]);
          }
        } catch (error) {
          console.error('Error navigating to parent domain:', error);
          toast.error('Failed to navigate back');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Go back to previous step
        setCurrentStep(currentStep - 1);
      }
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const userId = userProfile?.id;
      if (!userId) throw new Error('No valid user ID');

      await awardPoints(userId, 'survey_completed', 50, { survey_type: 'onboarding' });

      setOnboardingComplete(true);
      toast.success('Onboarding completed! You earned 50 points.');
      navigate('/overview');
    } catch (err) {
      console.error(err);
      toast.error('Error completing onboarding.');
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];
    const StepIcon = step.icon;
    
    switch (step.type) {
      case 'intro':
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-100 rounded-full">
                <StepIcon className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">{step.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">{step.content}</p>
          </div>
        );

      case 'role':
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <StepIcon className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{step.title}</h2>
              <p className="text-lg text-gray-600">{step.content}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {roles.map((role, index) => (
                <Button
                  key={role.value}
                  variant={responses.role === role.value ? 'default' : 'outline'}
                  onClick={() => setResponses({ ...responses, role: role.value })}
                  className={`p-6 h-auto text-left transition-all duration-200 hover:scale-105 ${
                    responses.role === role.value ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div>
                    <div className="font-semibold text-base mb-1">{role.label}</div>
                    <div className="text-sm opacity-80">{role.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'domain':
        const options = childDomains.length > 0 ? childDomains : rootDomains;
        const isSubdomain = childDomains.length > 0;
        
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 rounded-full">
                  <StepIcon className="w-12 h-12 text-purple-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{step.title}</h2>
              <p className="text-lg text-gray-600">{step.content}</p>
              
              {isSubdomain && selectedDomain && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Exploring:</strong> {selectedDomain.name}
                  </p>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {options.map((domain, index) => (
                  <Button
                    key={domain.domain_id}
                    variant={selectedDomain?.domain_id === domain.domain_id ? 'default' : 'outline'}
                    onClick={() => handleDomainSelect(domain)}
                    className={`p-4 h-auto text-left transition-all duration-200 hover:scale-105 ${
                      selectedDomain?.domain_id === domain.domain_id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="font-medium">{domain.name}</div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      case 'survey':
        if (!responses.domain) {
          return (
            <div className="text-center text-red-500 animate-fade-in">
              <p>Error: No domain selected. Please go back and select a valid domain.</p>
            </div>
          );
        }
        
        return (
          <div className="animate-fade-in">
            <SurveyRenderer
              onComplete={(surveyResponses) => {
                setResponses({ ...responses, surveyResponses });
                handleComplete();
              }}
              domainId={responses.domain}
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
        return !!responses.role;
      case 'domain': 
        return !!selectedDomain;
      case 'survey': 
        return false; // handled inside SurveyRenderer
      default: 
        return false;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-600">{currentStep + 1} of {steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main content */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8 md:p-12">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {steps[currentStep].type !== 'survey' && (
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentStep === 0 && childDomains.length === 0}
              className="transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!canProceed() || isLoading}
              className="transition-all duration-200 hover:scale-105"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingSurvey;
