
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Lightbulb, Users, Target, BookOpen } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SurveyRenderer from '@/components/SurveyRenderer';
import { awardPoints } from '@/services/gamificationApi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Domain {
  parent_id: string | null;
  level: number;
  domain_id: string;
  name: string;
  indicator_id: string | null;
}

const OnboardingSurvey = () => {
  const { setOnboardingComplete } = useUser();
  const { user } = useAuth(); // Use useAuth instead of userProfile
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<any>({});
  const [currentDomains, setCurrentDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [domainPath, setDomainPath] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Load root domains (level 1) on component mount
  useEffect(() => {
    const fetchRootDomains = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 OnboardingSurvey: Fetching root domains (level 1)...');
        
        const { data, error } = await supabase
          .from('domains')
          .select('*')
          .eq('level', 1)
          .order('name');
          
        if (error) throw error;
        
        console.log('✅ OnboardingSurvey: Root domains fetched:', data);
        setCurrentDomains(data || []);
        setDomainPath([]);
      } catch (error) {
        console.error('❌ OnboardingSurvey: Error fetching root domains:', error);
        toast.error('Failed to load domains');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRootDomains();
  }, []);

  const handleDomainSelect = (domain: Domain) => {
    console.log('🎯 OnboardingSurvey: Domain selected:', domain);
    setSelectedDomain(domain);
  };

  const handleNext = async () => {
    if (steps[currentStep].type === 'domain') {
      if (!selectedDomain) {
        toast.error('Please select a domain to continue');
        return;
      }

      setIsLoading(true);
      try {
        console.log('🔄 OnboardingSurvey: Processing domain selection:', selectedDomain);
        console.log('📊 OnboardingSurvey: Current domain level:', selectedDomain.level);

        // Check if this is a level 3 domain (leaf with indicator_id)
        if (selectedDomain.level === 3 && selectedDomain.indicator_id) {
          console.log('🎯 OnboardingSurvey: Reached level 3 domain with indicator_id:', selectedDomain.indicator_id);
          
          // Add to path and save final domain
          const finalPath = [...domainPath, selectedDomain];
          setDomainPath(finalPath);
          setResponses({ ...responses, domain: selectedDomain.domain_id, domainPath: finalPath });
          console.log('✅ OnboardingSurvey: Final domain saved, moving to survey step');
          setCurrentStep(currentStep + 1);
          return;
        }

        // Fetch children for levels 1 and 2
        console.log('🔍 OnboardingSurvey: Fetching children for domain:', selectedDomain.domain_id);
        
        const { data: children, error } = await supabase
          .from('domains')
          .select('*')
          .eq('parent_id', selectedDomain.domain_id)
          .order('name');

        if (error) throw error;

        console.log('📝 OnboardingSurvey: Children found:', children);

        if (children && children.length > 0) {
          // Has children - show them and update path
          const newPath = [...domainPath, selectedDomain];
          console.log('🗂️ OnboardingSurvey: Updated domain path:', newPath);
          
          setDomainPath(newPath);
          setCurrentDomains(children);
          setSelectedDomain(null); // Reset selection for next level
        } else {
          // No children but not level 3 - this shouldn't happen with proper data
          console.log('⚠️ OnboardingSurvey: No children found for non-level-3 domain');
          toast.error('Domain structure incomplete. Please contact support.');
        }
      } catch (error) {
        console.error('❌ OnboardingSurvey: Error processing domain selection:', error);
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
      if (domainPath.length > 0) {
        // We're in a subdomain level - go back to parent level
        try {
          setIsLoading(true);
          const currentParent = domainPath[domainPath.length - 1];
          const newPath = domainPath.slice(0, -1);
          
          console.log('⬅️ OnboardingSurvey: Going back from path:', domainPath);
          console.log('🎯 OnboardingSurvey: New path will be:', newPath);
          console.log('📍 OnboardingSurvey: Current parent:', currentParent);

          if (newPath.length === 0) {
            // Going back to root level
            console.log('🏠 OnboardingSurvey: Returning to root level');
            
            const { data: rootDomains, error } = await supabase
              .from('domains')
              .select('*')
              .eq('level', 1)
              .order('name');

            if (error) throw error;
            
            setCurrentDomains(rootDomains || []);
            setDomainPath([]);
            setSelectedDomain(null);
          } else {
            // Going back to parent level
            const grandParent = newPath[newPath.length - 1];
            console.log('👴 OnboardingSurvey: Grandparent domain:', grandParent);
            
            const { data: siblings, error } = await supabase
              .from('domains')
              .select('*')
              .eq('parent_id', grandParent.domain_id)
              .order('name');

            if (error) throw error;
            
            setCurrentDomains(siblings || []);
            setDomainPath(newPath);
            setSelectedDomain(currentParent);
          }
        } catch (error) {
          console.error('❌ OnboardingSurvey: Error navigating back:', error);
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

  const handleBreadcrumbNavigation = async (domainId: string) => {
    console.log('🍞 OnboardingSurvey: Breadcrumb navigation to domain:', domainId);
    
    // Find the domain in the current path
    const targetIndex = domainPath.findIndex(d => d.domain_id === domainId);
    
    if (targetIndex === -1) {
      // Navigate to root
      const { data: rootDomains, error } = await supabase
        .from('domains')
        .select('*')
        .eq('level', 1)
        .order('name');

      if (!error && rootDomains) {
        setCurrentDomains(rootDomains);
        setDomainPath([]);
        setSelectedDomain(null);
      }
    } else {
      // Navigate to specific level
      const newPath = domainPath.slice(0, targetIndex + 1);
      const targetDomain = domainPath[targetIndex];
      
      const { data: children, error } = await supabase
        .from('domains')
        .select('*')
        .eq('parent_id', targetDomain.domain_id)
        .order('name');

      if (!error && children) {
        setCurrentDomains(children);
        setDomainPath(newPath);
        setSelectedDomain(null);
      }
    }
  };

  const handleComplete = async () => {
    try {
      console.log('🏁 OnboardingSurvey: Starting completion process');
      console.log('👤 OnboardingSurvey: User from useAuth:', user);
      
      const userId = user?.id;
      if (!userId) {
        console.error('❌ OnboardingSurvey: No valid user ID from useAuth');
        throw new Error('No valid user ID');
      }

      console.log('✅ OnboardingSurvey: Valid user ID found:', userId);
      console.log('🎯 OnboardingSurvey: Awarding points...');

      await awardPoints(userId, 'survey_completed', 50, { survey_type: 'onboarding' });

      console.log('✅ OnboardingSurvey: Points awarded successfully');
      console.log('📝 OnboardingSurvey: Setting onboarding complete...');

      setOnboardingComplete(true);
      
      console.log('✅ OnboardingSurvey: Onboarding marked complete');
      console.log('🚀 OnboardingSurvey: Navigating to overview...');

      toast.success('Onboarding completed! You earned 50 points.');
      navigate('/overview');
    } catch (err) {
      console.error('💥 OnboardingSurvey: Error in completion process:', err);
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
              
              {/* Domain Breadcrumbs */}
              {domainPath.length > 0 && (
                <div className="mt-4">
                  <Breadcrumbs 
                    items={[
                      { id: 'root', name: 'All Domains' },
                      ...domainPath.map(d => ({ id: d.domain_id, name: d.name }))
                    ]}
                    onNavigate={handleBreadcrumbNavigation}
                    depth={domainPath.length}
                  />
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {currentDomains.map((domain, index) => (
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
                    <div className="text-xs text-gray-500 mt-1">
                      Level {domain.level}
                      {domain.level === 3 && domain.indicator_id && ' • Final Selection'}
                    </div>
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
                console.log('📋 OnboardingSurvey: Survey completed with responses:', surveyResponses);
                setResponses({ ...responses, surveyResponses });
                handleComplete();
              }}
              domainId={responses.domain}
              domainPath={responses.domainPath || []}
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
              disabled={currentStep === 0 && domainPath.length === 0}
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
