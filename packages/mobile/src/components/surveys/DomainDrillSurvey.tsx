import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase, learningPathService } from '@ecosystem/shared';
import { TouchButton } from './TouchButton';
import { AnswerFeedback } from './AnswerFeedback';
import { Progress } from '@/src/components/ui/Progress';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';

interface DomainDrillSurveyProps {
  nodeData: any;
  userState: any;
  onComplete: (data: any) => void;
}

export const DomainDrillSurvey: React.FC<DomainDrillSurveyProps> = ({
  nodeData,
  userState,
  onComplete
}) => {
  const [availableDomains, setAvailableDomains] = useState<any[]>([]);
  const [domainPath, setDomainPath] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = 3;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    const loadAvailableDomains = async () => {
      if (userState.selected_domain === 'altruism') {
        const { data: level1Domains } = await supabase
          .from('domains')
          .select('*')
          .eq('level', 1)
          .ilike('name', '%Community%Culture%Relationships%');
        
        if (level1Domains && level1Domains.length > 0) {
          const { data: children } = await supabase
            .from('domains')
            .select('*')
            .eq('parent_id', level1Domains[0].id)
            .order('name');
          
          if (children && children.length > 0) {
            setAvailableDomains(children);
            setDomainPath([level1Domains[0]]);
            setCurrentStep(1);
          }
        }
      } else {
        const { data: rootDomains } = await supabase
          .from('domains')
          .select('*')
          .eq('level', 1)
          .order('name');

        setAvailableDomains(rootDomains || []);
      }
      setLoading(false);
    };

    loadAvailableDomains();
  }, [userState]);

  const handleDomainSelect = async (domain: any) => {
    setShowFeedback(true);
    
    setTimeout(async () => {
      setShowFeedback(false);
      
      if (domain.level === 3 && domain.indicator_id) {
        const completionData = {
          selectedDomain: domain.id,
          selectedIndicator: domain.indicator_id,
          domainPath: [...domainPath, domain],
          nodeId: nodeData.id,
          insights_earned: 5
        };

        await learningPathService.recordIndicatorExploration(
          userState.user_id,
          nodeData.id,
          domain.indicator_id,
          [...domainPath, domain].map((d: any) => d.name),
          userState.current_day
        );

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
        setCurrentStep(currentStep + 1);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-lg">Loading domains...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 to-green-50 p-6">
      <View className="mb-4">
        <Progress value={progress} className="h-2" />
        <Text className="text-sm text-muted-foreground mt-2">
          Step {currentStep + 1} of {totalSteps}
        </Text>
      </View>

      <Card className="p-6 mb-6">
        <Text className="text-2xl font-bold mb-4">
          Choose what interests you!
        </Text>
        <Text className="text-muted-foreground">
          {currentStep === 0 && "Pick a broad area you'd like to explore"}
          {currentStep === 1 && "Let's narrow it down further"}
          {currentStep === 2 && "Almost there! Pick your specific focus"}
        </Text>
      </Card>

      <View className="gap-4">
        {availableDomains.map((domain) => (
          <TouchButton
            key={domain.id}
            onPress={() => handleDomainSelect(domain)}
          >
            {domain.name}
          </TouchButton>
        ))}
      </View>

      <AnswerFeedback
        show={showFeedback}
        type="good"
        message="Great choice!"
        onComplete={() => {}}
      />
    </View>
  );
};
