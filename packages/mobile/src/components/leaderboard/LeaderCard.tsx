import React from 'react';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';

interface LeaderCardProps {
  user: any;
  rank: number;
  isCurrentUser: boolean;
}

export function LeaderCard({ user, rank, isCurrentUser }: LeaderCardProps) {
  return (
    <Card 
      className={`p-4 ${
        isCurrentUser ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Text className="text-xl font-bold text-gray-500 w-10">
            #{rank}
          </Text>
          <View className="ml-4 flex-1">
            <Text className="font-semibold text-base" numberOfLines={1}>
              {user.first_name}
            </Text>
            <Text className="text-sm text-gray-500">
              {user.league_tier} League
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="font-bold text-lg">
            {user.total_points}
          </Text>
          <Text className="text-xs text-gray-500">
            {user.survey_count} surveys
          </Text>
        </View>
      </View>
    </Card>
  );
}
