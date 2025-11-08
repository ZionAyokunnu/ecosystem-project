import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { EcosystemPicker, type EcosystemDomain } from '@/components/onboarding/EcosystemPicker';
import { KnowledgeCheck } from '@/components/onboarding/KnowledgeCheck';
import { GoalSetting } from '@/components/onboarding/GoalSetting';
import { NotificationSetup } from '@/components/onboarding/NotificationSetup';
import { WelcomeToPath } from '@/components/onboarding/WelcomeToPath';
import { completeOnboarding } from '@/services/onboardingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type OnboardingStep = 'welcome' | 'domain' | 'knowledge' | 'goals' | 'notifications' | 'complete';

interface OnboardingData {
  domain: EcosystemDomain | null;
  knowledgeScore: number;
  unlockedUnit: number;
  dailyGoal: number;
  notificationsEnabled: boolean;
  notificationTime: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [data, setData] = useState<OnboardingData>({
    domain: null,
    knowledgeScore: 0,
    unlockedUnit: 1,
    dailyGoal: 3,
    notificationsEnabled: false,
    notificationTime: '19:00'
  });

  const handleWelcomeContinue = () => {
    setCurrentStep('domain');
  };

  const handleDomainSelect = (domain: EcosystemDomain) => {
    setData(prev => ({ ...prev, domain }));
    setCurrentStep('knowledge');
  };

  const handleKnowledgeComplete = (score: number, unlockedUnit: number) => {
    setData(prev => ({ ...prev, knowledgeScore: score, unlockedUnit }));
    setCurrentStep('goals');
  };

  const handleGoalSelect = (goal: { surveys: number }) => {
    setData(prev => ({ ...prev, dailyGoal: goal.surveys }));
    setCurrentStep('notifications');
  };

  const handleNotificationComplete = (enabled: boolean, time: string) => {
    setData(prev => ({ 
      ...prev, 
      notificationsEnabled: enabled, 
      notificationTime: time 
    }));
    setCurrentStep('complete');
  };

  const handleNotificationSkip = () => {
    setCurrentStep('complete');
  };

  const handleOnboardingComplete = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to complete onboarding');
        navigate('/auth');
        return;
      }

      // Save onboarding data to backend
      await completeOnboarding(user.id, data);
      
      toast.success('Welcome to your ecosystem journey!');
      
      // Navigate to unit survey with onboarding flag
      navigate('/unit-survey?onboarding=true');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Determine level based on unlocked unit
  const getLevel = () => {
    if (data.unlockedUnit >= 3) return 'Advanced';
    return 'Beginner';
  };

  return (
    <div className="min-h-screen">
      {/* Progress bar - hide on welcome and complete */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <OnboardingProgress currentStep={currentStep} />
      )}

      {/* Step content */}
      {currentStep === 'welcome' && (
        <WelcomeScreen onContinue={handleWelcomeContinue} />
      )}

      {currentStep === 'domain' && (
        <EcosystemPicker onSelect={handleDomainSelect} />
      )}

      {currentStep === 'knowledge' && data.domain && (
        <KnowledgeCheck 
          selectedDomain={data.domain} 
          onComplete={handleKnowledgeComplete} 
        />
      )}

      {currentStep === 'goals' && (
        <GoalSetting onSelect={handleGoalSelect} />
      )}

      {currentStep === 'notifications' && (
        <NotificationSetup 
          onComplete={handleNotificationComplete}
          onSkip={handleNotificationSkip}
        />
      )}

      {currentStep === 'complete' && data.domain && (
        <WelcomeToPath 
          domain={data.domain.title}
          level={getLevel()}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
};

export default Onboarding;