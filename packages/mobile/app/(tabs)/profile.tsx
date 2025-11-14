import React from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@ecosystem/shared';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';

export default function ProfileScreen() {
  const { profile, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-bold mb-6">Profile</Text>
        
        <Card className="p-6 mb-4">
          <Text className="text-2xl font-bold mb-2">{profile?.first_name || 'User'}</Text>
          <Text className="text-muted-foreground mb-4">{profile?.email}</Text>
          
          <View className="gap-3 mt-4">
            <View className="flex-row justify-between border-b border-border pb-3">
              <Text className="text-muted-foreground">Role:</Text>
              <Text className="font-medium capitalize">{profile?.role || 'resident'}</Text>
            </View>
            <View className="flex-row justify-between border-b border-border pb-3">
              <Text className="text-muted-foreground">Insights:</Text>
              <Text className="font-medium">{profile?.insights || 0}</Text>
            </View>
            <View className="flex-row justify-between border-b border-border pb-3">
              <Text className="text-muted-foreground">Streak:</Text>
              <Text className="font-medium">{profile?.streak || 0} days</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Hearts:</Text>
              <Text className="font-medium">{profile?.hearts || 5}</Text>
            </View>
          </View>
        </Card>

        <Button 
          variant="destructive"
          onPress={handleSignOut}
          disabled={loading}
        >
          Sign Out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
