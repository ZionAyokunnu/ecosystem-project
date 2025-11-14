import React, { useState } from 'react';
import { View, Alert, Platform, Modal } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { AnimatedPressable } from '@/src/components/ui/AnimatedComponents';
import { useAuth } from '@ecosystem/shared';

interface ShareData {
  title: string;
  message: string;
  url?: string;
  image?: string;
  type: 'achievement' | 'progress' | 'story' | 'leaderboard' | 'streak';
}

interface ShareComponentProps {
  data: ShareData;
  onShare?: (method: string) => void;
  showStats?: boolean;
}

export function ShareComponent({ data, onShare, showStats = true }: ShareComponentProps) {
  const [sharing, setSharing] = useState(false);
  const { profile } = useAuth();

  const generateShareContent = (data: ShareData) => {
    const userName = profile?.first_name || 'Community Member';
    
    switch (data.type) {
      case 'achievement':
        return {
          title: `🏆 Achievement Unlocked!`,
          message: `${userName} just earned: ${data.title}! 🎉\n\nJoin the community engagement platform and start your learning journey!\n\n${data.message}`,
          hashtags: ['CommunityPlatform', 'Achievement', 'Learning', 'Progress']
        };
      
      case 'streak':
        return {
          title: `🔥 Streak Power!`,
          message: `${userName} is on fire! 🔥\n\n${data.message}\n\nDaily consistency leads to amazing results! Join us!`,
          hashtags: ['Streak', 'Consistency', 'Daily', 'Motivation']
        };
      
      default:
        return {
          title: data.title,
          message: data.message,
          hashtags: ['Community', 'Learning']
        };
    }
  };

  const shareContent = generateShareContent(data);

  const shareViaSystem = async () => {
    if (!await Sharing.isAvailableAsync()) {
      Alert.alert('Error', 'Sharing is not available on this device');
      return;
    }

    setSharing(true);
    try {
      const shareData = {
        title: shareContent.title,
        message: shareContent.message + (data.url ? `\n\n${data.url}` : ''),
      };

      await Sharing.shareAsync(data.url || '', {
        mimeType: 'text/plain',
        dialogTitle: shareData.title,
      });

      onShare?.('system');
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setSharing(false);
    }
  };

  const copyToClipboard = async () => {
    const textToShare = `${shareContent.title}\n\n${shareContent.message}${data.url ? `\n\n${data.url}` : ''}`;
    
    await Clipboard.setStringAsync(textToShare);
    Alert.alert('Copied!', 'Content copied to clipboard');
    onShare?.('clipboard');
  };

  return (
    <Card className="p-6">
      <View className="items-center mb-6">
        <View className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-full mb-3">
          <Text className="text-white text-2xl">
            {data.type === 'achievement' ? '🏆' : data.type === 'streak' ? '🔥' : '📊'}
          </Text>
        </View>
        <Text className="text-xl font-bold text-center">{shareContent.title}</Text>
        <Text className="text-gray-600 text-center mt-2">{data.message}</Text>
      </View>

      <View className="space-y-3">
        <Button
          onPress={shareViaSystem}
          disabled={sharing}
          className="bg-gradient-to-r from-green-500 to-green-600"
        >
          {sharing ? 'Sharing...' : '📤 Share with Friends'}
        </Button>

        <View className="flex-row justify-between space-x-2">
          <AnimatedPressable
            onPress={copyToClipboard}
            className="flex-1 bg-gray-600 p-3 rounded-lg items-center"
          >
            <Text className="text-white font-medium">Copy</Text>
          </AnimatedPressable>
        </View>

        <View className="flex-row flex-wrap justify-center gap-2 mt-4">
          {shareContent.hashtags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </View>
      </View>
    </Card>
  );
}

export function useAchievementShare() {
  const { profile } = useAuth();
  
  const shareAchievement = (achievement: {
    title: string;
    description: string;
    points: number;
    badgeEmoji: string;
  }) => {
    return {
      title: `${achievement.badgeEmoji} ${achievement.title}`,
      message: `Just earned ${achievement.points} points for: ${achievement.description}!`,
      type: 'achievement' as const,
    };
  };

  const shareStreak = (streakCount: number) => {
    const streakMessage = streakCount >= 30 ? "I'm officially addicted to learning! 🤓" :
                         streakCount >= 14 ? "Two weeks of consistent growth! 💪" :
                         streakCount >= 7 ? "One week strong! 🔥" :
                         "Building my daily habit! 🌱";

    return {
      title: `🔥 ${streakCount} Day Learning Streak!`,
      message: `${streakMessage} Join me on this amazing community platform!`,
      type: 'streak' as const,
    };
  };

  return {
    shareAchievement,
    shareStreak,
  };
}
