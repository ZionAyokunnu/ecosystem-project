import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';

interface StoryCardProps {
  story: any;
  onReaction: (storyId: string, reactionType: string) => void;
  userReactions: string[];
}

export function StoryCard({ story, onReaction, userReactions }: StoryCardProps) {
  const reactionTypes = [
    { type: 'heart', emoji: '❤️' },
    { type: 'helpful', emoji: '💡' },
    { type: 'inspiring', emoji: '⭐' }
  ];

  const parts = story.story_text.split('\n\n');
  const title = parts[0] || story.story_text.substring(0, 100);
  const body = parts.slice(1).join('\n\n') || story.story_text;

  return (
    <Card className="p-6 mb-4">
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
          <Text className="text-lg">👤</Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-base">{title}</Text>
          <Text className="text-sm text-gray-500">
            by {story.author} • {new Date(story.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text className="text-gray-700 leading-relaxed mb-4">
        {body}
      </Text>

      {story.photo && (
        <Image
          source={{ uri: story.photo }}
          className="w-full h-48 rounded-xl mb-4"
          resizeMode="cover"
        />
      )}

      {story.location && (
        <View className="mb-4">
          <View className="bg-blue-100 rounded-full px-3 py-1 self-start">
            <Text className="text-xs text-blue-800 font-medium">
              📍 {story.location}
            </Text>
          </View>
        </View>
      )}

      <View className="border-t border-gray-100 pt-4">
        <View className="flex-row gap-2">
          {reactionTypes.map(reaction => {
            const isActive = userReactions.includes(reaction.type);
            const count = story.reactions?.[reaction.type] || 0;
            
            return (
              <Pressable
                key={reaction.type}
                onPress={() => onReaction(story.story_id, reaction.type)}
                className={`flex-row items-center gap-1 px-3 py-2 rounded-full ${
                  isActive ? 'bg-red-100' : 'bg-gray-100'
                }`}
              >
                <Text className={isActive ? 'text-base' : 'text-sm'}>
                  {reaction.emoji}
                </Text>
                {count > 0 && (
                  <Text className="text-xs font-medium">{count}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Card>
  );
}
