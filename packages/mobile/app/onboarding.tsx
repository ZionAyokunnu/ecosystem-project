import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@ecosystem/shared';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';

export default function OnboardingScreen() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const completeOnboarding = async () => {
    setLoading(true);
    
    const { error } = await updateProfile({
      has_completed_onboarding: true,
    });

    if (error) {
      Alert.alert('Error', 'Failed to complete onboarding');
    } else {
      router.replace('/(tabs)');
    }
    
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="flex-1 justify-center py-12">
          <Card className="p-6">
            <Text className="text-3xl font-bold text-center mb-4">
              Welcome to Ecosystem!
            </Text>
            <Text className="text-muted-foreground text-center mb-8">
              Let's get you started on your learning journey.
            </Text>

            <View className="gap-4 mb-8">
              <Text className="text-lg font-semibold">
                🎯 Complete learning activities
              </Text>
              <Text className="text-lg font-semibold">
                📊 Track your progress
              </Text>
              <Text className="text-lg font-semibold">
                🏆 Earn achievements
              </Text>
              <Text className="text-lg font-semibold">
                💎 Collect insights
              </Text>
            </View>

            <Button
              onPress={completeOnboarding}
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Get Started'}
            </Button>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
