import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@ecosystem/shared';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';

export default function WalletScreen() {
  const { profile } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-bold mb-6">Wallet</Text>
        
        <Card className="p-6 mb-4">
          <Text className="text-lg font-semibold mb-4">Your Insights</Text>
          <Text className="text-4xl font-bold text-primary text-center">
            {profile?.insights || 0}
          </Text>
        </Card>

        <Card className="p-6">
          <Text className="text-lg font-semibold mb-2">Earn More</Text>
          <Text className="text-muted-foreground">
            Complete learning activities to earn insights and unlock rewards!
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
