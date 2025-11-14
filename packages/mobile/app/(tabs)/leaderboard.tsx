import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@ecosystem/shared';
import { supabase } from '@ecosystem/shared';
import { PodiumView } from '@/src/components/leaderboard/PodiumView';
import { LeaderCard } from '@/src/components/leaderboard/LeaderCard';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';

interface LeaderboardEntry {
  user_id: string;
  first_name: string;
  total_points: number;
  survey_count: number;
  badge_count: number;
  location_id?: string;
  rank_position?: number;
  league_tier?: string;
}

export default function LeaderboardScreen() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState<'global' | 'local'>('global');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTab, profile]);

  const loadLeaderboard = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_leaderboard_data', {
        p_location_id: selectedTab === 'local' ? profile.location_id : null
      });
      
      if (error) {
        console.error('Error loading leaderboard:', error);
        setUsers([]);
      } else {
        setUsers(data || []);
        const userEntry = data?.find((u: any) => u.user_id === profile?.id);
        setUserRank(userEntry || null);
      }
      
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading leaderboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-6">
          <Text className="text-3xl font-bold text-center mb-4">🏆 Community Champions</Text>
          
          <View className="bg-gray-100 rounded-full p-1 flex-row mb-6">
            <Button
              variant={selectedTab === 'global' ? 'default' : 'ghost'}
              onPress={() => setSelectedTab('global')}
              className="flex-1 rounded-full"
            >
              🌍 Global
            </Button>
            <Button
              variant={selectedTab === 'local' ? 'default' : 'ghost'}
              onPress={() => setSelectedTab('local')}
              className="flex-1 rounded-full"
            >
              📍 Local
            </Button>
          </View>
        </View>

        {topThree.length > 0 && (
          <View className="mb-8">
            <PodiumView topThree={topThree} />
          </View>
        )}

        {userRank && userRank.rank_position && userRank.rank_position > 3 && (
          <View className="mx-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-lg font-bold">Your Rank</Text>
                  <Text className="text-white text-3xl font-bold">
                    #{userRank.rank_position}
                  </Text>
                </View>
                <View>
                  <Text className="text-white text-lg font-bold text-right">
                    {userRank.total_points} points
                  </Text>
                  <Text className="text-white/90 text-sm text-right">
                    {userRank.league_tier} League
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        <View className="px-4 space-y-3 pb-6">
          {restOfUsers.map((user, index) => (
            <LeaderCard
              key={user.user_id}
              user={user}
              rank={index + 4}
              isCurrentUser={user.user_id === profile?.id}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
