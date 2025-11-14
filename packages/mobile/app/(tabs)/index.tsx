import React, { useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useEcosystem, useUser } from '@ecosystem/shared';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';

export default function HomeScreen() {
  const { user, profile, loading: authLoading } = useAuth();
  const { indicators, loading: ecoLoading } = useEcosystem();
  const { userProfile, isOnboardingComplete } = useUser();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
      return;
    }

    if (user && profile && !profile.has_completed_onboarding) {
      router.replace('/onboarding');
      return;
    }
  }, [user, authLoading, profile]);

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="text-lg mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-bold mb-6">Learning Path</Text>
        
        <Card className="p-6 mb-6">
          <Text className="text-xl font-semibold mb-2">Welcome back!</Text>
          <Text className="text-muted-foreground mb-4">
            {profile?.first_name || 'User'}
          </Text>
          <Text className="text-sm text-muted-foreground mb-2">
            Indicators loaded: {indicators.length}
          </Text>
          <Text className="text-sm text-muted-foreground">
            Loading data: {ecoLoading ? 'Yes' : 'No'}
          </Text>
        </Card>

        <Card className="p-6 mb-4">
          <Text className="text-lg font-semibold mb-2">Your Progress</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Insights:</Text>
              <Text className="font-semibold">{profile?.insights || 0}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Streak:</Text>
              <Text className="font-semibold">{profile?.streak || 0} days</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Hearts:</Text>
              <Text className="font-semibold">{profile?.hearts || 5}</Text>
            </View>
          </View>
        </Card>

        <Button 
          onPress={() => {
            // TODO: Navigate to actual learning path when built
            console.log('Learning path coming soon!');
          }}
          className="mb-4"
        >
          Start Learning
        </Button>

        <Button 
          variant="outline"
          onPress={() => router.push('/(tabs)/profile')}
        >
          View Profile
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
