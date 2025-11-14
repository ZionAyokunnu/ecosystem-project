import React from 'react';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/Text';

interface PathMascotProps {
  currentDay: number;
}

export const PathMascot: React.FC<PathMascotProps> = ({ currentDay }) => {
  const getMessage = () => {
    if (currentDay === 1) return "Welcome to your learning journey! 🌟";
    if (currentDay <= 3) return "You're making great progress! 💪";
    if (currentDay <= 5) return "Keep up the amazing work! 🎯";
    return "You're on fire! 🔥";
  };

  return (
    <View className="fixed bottom-20 right-4 z-20">
      <View className="relative">
        <View className="w-16 h-16 bg-background rounded-full shadow-lg flex items-center justify-center animate-bounce">
          <Text className="text-2xl">🦉</Text>
        </View>
        <View className="absolute bottom-full right-0 mb-2 bg-background rounded-2xl px-4 py-2 shadow-lg max-w-48">
          <Text className="text-sm font-medium text-foreground">{getMessage()}</Text>
        </View>
      </View>
    </View>
  );
};
