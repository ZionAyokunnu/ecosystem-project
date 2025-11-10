import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MobileSurveyLayout } from './MobileSurveyLayout';
import { TouchButton } from './TouchButton';
import { AnswerFeedback } from './AnswerFeedback';

interface DomainDrillSurveyProps {
  nodeData: any;
  userState: any;
  onComplete: (data: any) => void;
  onStart?: () => Promise<boolean>;
}

export const DomainDrillSurvey: React.FC<DomainDrillSurveyProps> = ({
  nodeData,
  userState,
  onComplete,
  onStart
}) => {
  const [availableDomains, setAvailableDomains] = useState<any[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [domainPath, setDomainPath] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = 3;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const mascotMessages = [
    "Choose what interests you most! 🎯",
    "Great choice! Let's go deeper 🔍",
    "Perfect! You're really exploring! 🌟"
  ];

  useEffect(() => {
    const loadAvailableDomains = async () => {
      // Get domains with cooldown check
      const { data: rootDomains } = await supabase
        .from('domains')
        .select('*')
        .eq('level', 1)
        .order('name');

      setAvailableDomains(rootDomains || []);
      setLoading(false);
    };

    loadAvailableDomains();
  }, [userState]);

  const handleDomainSelect = async (domain: any) => {
    setSelectedDomain(domain);
    setShowFeedback(true);
    
    setTimeout(async () => {
      if (domain.level === 3 && domain.indicator_id) {
        const completionData = {
          selectedDomain: domain.id,
          selectedIndicator: domain.indicator_id,
          domainPath: [...domainPath, domain],
          nodeId: nodeData.id,
          insights_earned: 5
        };

        onComplete(completionData);
        return;
      }

      const { data: children } = await supabase
        .from('domains')
        .select('*')
        .eq('parent_id', domain.id)
        .order('name');

      if (children && children.length > 0) {
        setDomainPath([...domainPath, domain]);
        setAvailableDomains(children);
        setSelectedDomain(null);
        setCurrentStep(currentStep + 1);
        setShowFeedback(false);
      }
    }, 1500);
  };

  const handleBack = async () => {
    const newPath = domainPath.slice(0, -1);
    setDomainPath(newPath);
    setCurrentStep(Math.max(0, currentStep - 1));

    if (newPath.length === 0) {
      const { data: rootDomains } = await supabase
        .from('domains')
        .select('*')
        .eq('level', 1)
        .order('name');
      setAvailableDomains(rootDomains || []);
    } else {
      const parent = newPath[newPath.length - 1];
      const { data: children } = await supabase
        .from('domains')
        .select('*')
        .eq('parent_id', parent.id)
        .order('name');
      setAvailableDomains(children || []);
    }
  };

  if (loading) {
    return (
      <MobileSurveyLayout 
        progress={0} 
        totalQuestions={3} 
        currentQuestion={1}
        showMascot={false}
      >
        <div className="text-center py-12">
          <div className="text-6xl animate-spin mb-4">🎯</div>
          <p className="text-lg text-gray-600">Loading domains...</p>
        </div>
      </MobileSurveyLayout>
    );
  }

  return (
    <>
      <MobileSurveyLayout
        progress={progress}
        totalQuestions={totalSteps}
        currentQuestion={currentStep + 1}
        mascotMessage={mascotMessages[currentStep] || mascotMessages[0]}
        onBack={domainPath.length > 0 ? handleBack : undefined}
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {currentStep === 0 ? '🌍' : currentStep === 1 ? '🔍' : '📍'}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {domainPath.length === 0 
              ? "What would you like to explore today?"
              : `Which aspect of ${domainPath[domainPath.length - 1].name} interests you?`
            }
          </h1>
          <p className="text-gray-600 text-lg">
            Choose an area to dive deeper into your community
          </p>
        </div>

        {domainPath.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Your path:</div>
            <div className="flex flex-wrap gap-2">
              {domainPath.map((d) => (
                <span
                  key={d.id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {availableDomains.map((domain, index) => (
            <TouchButton
              key={domain.id}
              onClick={() => handleDomainSelect(domain)}
              variant="option"
              className="p-6 text-left min-h-[80px]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">
                  {domain.level === 1 ? '🌍' : domain.level === 2 ? '🔍' : '📍'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{domain.name}</h3>
                  <p className="text-sm text-gray-500">
                    Level {domain.level}
                    {domain.level === 3 && ' • Final Choice'}
                  </p>
                </div>
              </div>
            </TouchButton>
          ))}
        </div>
      </MobileSurveyLayout>

      <AnswerFeedback
        show={showFeedback}
        type="good"
        message="Great choice! 🌟"
        onComplete={() => setShowFeedback(false)}
      />
    </>
  );
};