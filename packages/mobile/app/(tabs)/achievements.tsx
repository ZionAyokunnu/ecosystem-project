import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';

export default function AchievementsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-bold mb-6">Achievements</Text>
        
        <Card className="p-6">
          <Text className="text-muted-foreground text-center">
            Your achievements will appear here as you complete learning activities.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
