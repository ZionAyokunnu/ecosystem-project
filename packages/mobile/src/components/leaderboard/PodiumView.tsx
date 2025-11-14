import React from 'react';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';

interface PodiumViewProps {
  topThree: any[];
}

export function PodiumView({ topThree }: PodiumViewProps) {
  const [first, second, third] = topThree;

  return (
    <View className="px-4">
      <Text className="text-2xl font-bold text-center mb-6">Top Champions</Text>
      <View className="flex-row items-end justify-center gap-2">
        {second && (
          <View className="items-center flex-1">
            <Card className="bg-gray-200 p-3 mb-2 items-center w-full">
              <Text className="text-3xl mb-1">🥈</Text>
              <Text className="text-sm font-bold text-center" numberOfLines={1}>
                {second.first_name}
              </Text>
              <Text className="text-xs text-gray-600">
                {second.total_points} pts
              </Text>
            </Card>
            <View className="bg-gray-300 w-16 h-16 rounded-t-lg" />
          </View>
        )}

        {first && (
          <View className="items-center flex-1">
            <Card className="bg-yellow-200 p-4 mb-2 items-center w-full">
              <Text className="text-4xl mb-1">🏆</Text>
              <Text className="text-base font-bold text-center" numberOfLines={1}>
                {first.first_name}
              </Text>
              <Text className="text-sm text-gray-600">
                {first.total_points} pts
              </Text>
            </Card>
            <View className="bg-yellow-400 w-16 h-24 rounded-t-lg" />
          </View>
        )}

        {third && (
          <View className="items-center flex-1">
            <Card className="bg-orange-200 p-3 mb-2 items-center w-full">
              <Text className="text-3xl mb-1">🥉</Text>
              <Text className="text-sm font-bold text-center" numberOfLines={1}>
                {third.first_name}
              </Text>
              <Text className="text-xs text-gray-600">
                {third.total_points} pts
              </Text>
            </Card>
            <View className="bg-orange-400 w-16 h-12 rounded-t-lg" />
          </View>
        )}
      </View>
    </View>
  );
}
