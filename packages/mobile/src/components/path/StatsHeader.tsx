import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@ecosystem/shared';
import { Text } from '@/src/components/ui/Text';

interface StatsData {
  insights: number;
  hearts: number;
  streak: number;
}

export const StatsHeader: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    insights: 0,
    hearts: 5,
    streak: 0
  });

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('insights, hearts, streak')
        .eq('id', user.id)
        .single();

      if (profile) {
        setStats({
          insights: profile.insights || 0,
          hearts: profile.hearts || 5,
          streak: profile.streak || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
    
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      type: 'insights',
      icon: '💎',
      count: stats.insights,
      color: 'hsl(220, 90%, 56%)',
      label: 'Insights',
      route: '/wallet'
    },
    {
      type: 'hearts',
      icon: '❤️',
      count: stats.hearts,
      color: 'hsl(0, 84%, 60%)',
      label: 'Energy',
      route: '/profile'
    },
    {
      type: 'streak',
      icon: '🔥',
      count: stats.streak,
      color: 'hsl(38, 92%, 50%)',
      label: 'Streak',
      route: '/profile'
    }
  ];

  return (
    <View className="absolute top-4 right-4 z-50 flex-row gap-3">
      {statItems.map((item) => (
        <Pressable
          key={item.type}
          onPress={() => router.push(item.route as any)}
          className="px-3 py-2 rounded-full flex-row items-center gap-2 border-2"
          style={{ 
            backgroundColor: `${item.color}20`,
            borderColor: `${item.color}30`
          }}
        >
          <Text className="text-base">{item.icon}</Text>
          <Text 
            className="text-sm font-bold"
            style={{ color: item.color }}
          >
            {item.count}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
