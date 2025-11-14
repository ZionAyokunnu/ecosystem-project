import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, learningPathService } from '@ecosystem/shared';
import { NodeSurveyRenderer } from '@/src/components/surveys/NodeSurveyRenderer';
import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';

export default function UnitSurveyScreen() {
  const { nodeId, type } = useLocalSearchParams<{ nodeId: string; type: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSurveyComplete = async (surveyData: any) => {
    if (!user?.id || !nodeId) return;

    setLoading(true);
    try {
      const result = await learningPathService.completeNode(
        user.id,
        nodeId,
        surveyData
      );

      if (result.success) {
        Alert.alert(
          'Great job!', 
          `You earned ${result.insightsEarned} insights!`,
          [
            {
              text: 'Continue',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error completing survey:', error);
      Alert.alert('Error', 'Failed to save your progress');
    } finally {
      setLoading(false);
    }
  };

  if (!nodeId || !type) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-lg mb-4">Invalid survey</Text>
        <Button onPress={() => router.back()}>
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <NodeSurveyRenderer
        nodeId={nodeId}
        nodeType={type as any}
        onComplete={handleSurveyComplete}
        loading={loading}
      />
    </SafeAreaView>
  );
}
