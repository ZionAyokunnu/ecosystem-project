import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import SurveyRenderer from '@/components/SurveyRenderer';
import { awardPoints } from '@/services/gamificationApi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@radix-ui/react-progress';

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

  // Load root domains (level 1)
  useEffect(() => {
    const fetchDomains = async () => {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('level', 1)
        .order('name');
      if (error) console.error(error);
      else setRootDomains(data || []);
    };
    fetchDomains();
  }, []);

  const steps = [
    { title: 'Welcome to Community Insights', type: 'intro', content: 'Help us understand how different aspects of community wellbeing connect and influence each other.' },
    { title: 'Your Role', type: 'role', content: 'What best describes your role in the community?' },
    { title: 'Your Expertise', type: 'domain', content: 'Which domain do you feel most confident discussing?' },
    { title: 'Community Relationships', type: 'survey', content: 'Help us understand how you perceive relationships between community indicators.' }
  ];

  const roles = ['resident', 'community_rep', 'researcher', 'business'];

  // const handleDomainSelect = async (domain: Domain) => {
  //   setSelectedDomain(domain);

  //   const { data, error } = await supabase
  //     .from('domains')
  //     .select('*')
  //     .eq('parent_id', domain.domain_id);

  //   if (error) {
  //     console.error('Error fetching child domains:', error);
  //     return;
  //   }

  //   if (data && data.length > 0) {
  //     setChildDomains(data);
  //   } else {
  //     // No children — final domain
  //     // setResponses({ ...responses, domain: domain.domain_id });
  //     setChildDomains([]);
  //     // setCurrentStep(currentStep + 1);
  //   }
  // };

  const handleDomainSelect = (domain: Domain) => {
  setSelectedDomain(domain);
  // Do NOT fetch children yet.
};


  // const handleNext = () => {
  //   if (currentStep < steps.length - 1) {
  //     setCurrentStep(currentStep + 1);
  //   }
  // };

  // const handleNext = () => {
  // if (steps[currentStep].type === 'domain') {
  //   if (childDomains.length === 0 && selectedDomain) {
  //     // Final domain picked → store it
  //     setResponses({ ...responses, domain: selectedDomain.domain_id });
  //   }
  // }
  
//   const handleNext = async () => {
//   if (steps[currentStep].type === 'domain') {
//     if (!selectedDomain) return;

//     // Fetch children when Next is pressed
//     const { data, error } = await supabase
//       .from('domains')
//       .select('*')
//       .eq('parent_id', selectedDomain.domain_id);

//     if (error) {
//       console.error(error);
//       return;
//     }

//     if (data && data.length > 0) {
//       // If children found: drill in
//       setChildDomains(data);
//     } else {
//       // If no children: store final and step to survey
//       setResponses({ ...responses, domain: selectedDomain.domain_id });
//       setChildDomains([]); // not strictly needed
//       setCurrentStep(currentStep + 1);
//       return; // skip normal step increment below
//     }
//   }

//   if (currentStep < steps.length - 1) {
//     setCurrentStep(currentStep + 1);
//   }
// };


const handleNext = async () => {
  if (steps[currentStep].type === 'domain') {
    if (!selectedDomain) return;

    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('parent_id', selectedDomain.domain_id);

    if (error) {
      console.error(error);
      return;
    }

    if (data && data.length > 0) {
      setChildDomains(data);
    } else {
      setResponses({ ...responses, domain: selectedDomain.domain_id });
      setChildDomains([]);
      setCurrentStep(currentStep + 1);
      return;
    }
  }

  if (currentStep < steps.length - 1) {
    setCurrentStep(currentStep + 1);
  }
};

    const handlePrevious = async () => {
      if (steps[currentStep].type === 'domain') {
        if (selectedDomain && selectedDomain.parent_id) {
          // Go up one domain level
          const { data, error } = await supabase
            .from('domains')
            .select('*')
            .eq('domain_id', selectedDomain.parent_id)
            .single();
          if (error) {
            console.error('Error fetching parent domain:', error);
            return;
          }

          // Fetch siblings of that parent
          const { data: siblings, error: siblingsError } = await supabase
            .from('domains')
            .select('*')
            .eq('parent_id', data.parent_id || null);

          if (siblingsError) {
            console.error('Error fetching sibling domains:', siblingsError);
            return;
          }

          setSelectedDomain(data);
          setChildDomains(siblings || []);
        } else {
          // If no parent, then we are at root: so go back to previous step (e.g. role)
          setSelectedDomain(null);
          setChildDomains([]);
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
    switch (step.type) {
      case 'intro':
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <p>{step.content}</p>
          </div>
        );

      case 'role':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">{step.title}</h2>
            <p className="text-center">{step.content}</p>
            <div className="grid grid-cols-2 gap-4">
              {roles.map((role) => (
                <Button
                  key={role}
                  variant={responses.role === role ? 'default' : 'outline'}
                  onClick={() => setResponses({ ...responses, role })}
                >
                  {role.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'domain':
        const options = childDomains.length > 0 ? childDomains : rootDomains;
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">{step.title}</h2>
            <p className="text-center">{step.content}</p>

            {selectedDomain && childDomains.length > 0 && (
              <p className="text-sm text-center text-gray-500">
                Subdomains of: <strong>{selectedDomain.name}</strong>
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((domain) => (
                <Button
                  key={domain.domain_id}
                  variant="outline"
                  onClick={() => handleDomainSelect(domain)}
                >
                  {domain.name}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'survey':
        if (!responses.domain) {
          return <div className="text-center text-red-500">Error: No domain selected. Please go back and select a valid domain.</div>;
        }
        return (
          <SurveyRenderer
            onComplete={(surveyResponses) => {
              setResponses({ ...responses, surveyResponses });
              handleComplete();
            }}
            domainId={responses.domain}
          />
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].type) {
      case 'intro': return true;
      case 'role': return !!responses.role;
      case 'domain': // handled by domain select drill
            // Only enable Next if user has picked a leaf domain
      return selectedDomain && childDomains.length === 0;
      case 'survey': return false; // handled inside SurveyRenderer
      default: return false;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <Progress value={progress} className="w-full mb-4" />
        <Card>
          <CardContent className="p-8">{renderStep()}</CardContent>
        </Card>

        {steps[currentStep].type !== 'survey' && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <Button onClick={handleNext} disabled={!canProceed() || currentStep === steps.length - 1}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingSurvey;