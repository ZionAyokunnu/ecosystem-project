import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/src/components/ui/Text';

interface PathNodeProps {
  id: string;
  node_type: 'domain_drill' | 'connection_explore' | 'local_measure' | 'knowledge_review';
  status: 'locked' | 'available' | 'current' | 'completed';
  title: string;
  sequence_day: number;
  estimated_minutes: number;
  isCheckpoint?: boolean;
  onPress: () => void;
}

export const PathNode: React.FC<PathNodeProps> = ({
  node_type,
  status,
  title,
  sequence_day,
  isCheckpoint,
  onPress
}) => {
  const nodeStyles = {
    locked: {
      background: 'hsl(var(--muted))',
      border: 'border-border',
      icon: '🔒',
      iconColor: 'text-muted-foreground',
      clickable: false,
      glow: false
    },
    available: {
      background: 'hsl(var(--background))',
      border: 'border-border',
      icon: '📍',
      iconColor: 'text-muted-foreground',
      clickable: true,
      glow: false
    },
    current: {
      background: 'hsl(var(--success))',
      border: 'border-success-hover',
      icon: '⭐',
      iconColor: 'text-success-foreground',
      clickable: true,
      glow: true
    },
    completed: {
      background: 'hsl(220, 90%, 56%)',
      border: 'border-blue-600',
      icon: '👑',
      iconColor: 'text-white',
      clickable: true,
      glow: false
    }
  };

  const style = isCheckpoint && status === 'completed' 
    ? {
        background: 'hsl(270, 70%, 60%)',
        border: 'border-purple-600',
        icon: '💎',
        iconColor: 'text-white',
        clickable: true,
        glow: false
      }
    : nodeStyles[status];

  return (
    <View className="relative flex items-center justify-center">
      <Pressable
        onPress={style.clickable ? onPress : undefined}
        disabled={!style.clickable}
        className={`
          relative w-14 h-14 rounded-full
          flex items-center justify-center
          z-10 border-4 ${style.border}
          ${style.glow ? 'shadow-lg shadow-success/40' : ''}
        `}
        style={{ backgroundColor: style.background }}
      >
        <Text className={`text-2xl font-bold ${style.iconColor}`}>
          {style.icon}
        </Text>
      </Pressable>

      <View 
        className="absolute left-20 bg-background border border-border rounded-lg px-4 py-2 shadow-sm"
        style={{ pointerEvents: 'none', width: 220 }}
      >
        <Text className="text-sm font-medium text-foreground">
          {title}
        </Text>
      </View>

      {status === 'current' && (
        <Pressable
          onPress={onPress}
          className="absolute -top-14 left-1/2 -translate-x-1/2
            w-30 h-10 rounded-full
            bg-gradient-to-r from-success to-success
            flex items-center justify-center gap-2
            shadow-lg"
        >
          <Text className="text-white font-bold text-sm">
            ⚡ START
          </Text>
        </Pressable>
      )}

      {status === 'available' && sequence_day > 2 && (
        <Pressable
          onPress={onPress}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2
            w-35 h-9 rounded-full
            bg-gradient-to-r from-purple-500 to-purple-600
            flex items-center justify-center gap-1.5
            shadow-md"
        >
          <Text className="text-white font-bold text-xs">
            🚀 JUMP HERE?
          </Text>
        </Pressable>
      )}
    </View>
  );
};
