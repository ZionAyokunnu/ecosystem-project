import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, learningPathService } from '@ecosystem/shared';
import { supabase } from '@ecosystem/shared';
import { PathNode } from '@/src/components/path/PathNode';
import { StatsHeader } from '@/src/components/path/StatsHeader';
import { PathMascot } from '@/src/components/path/PathMascot';
import { Text } from '@/src/components/ui/Text';

interface PathNodeData {
  id: string;
  node_type: 'domain_drill' | 'connection_explore' | 'local_measure' | 'knowledge_review';
  status: 'locked' | 'available' | 'current' | 'completed';
  title: string;
  sequence_day: number;
  estimated_minutes: number;
  isCheckpoint?: boolean;
}

export default function LearningPathScreen() {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<PathNodeData[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refreshProgress = useCallback(async () => {
    try {
      if (!user) return;

      const { data: progressData } = await supabase
        .from('user_node_progress')
        .select('*')
        .eq('user_id', user.id);

      const { data: learningNodes } = await supabase
        .from('learning_nodes')
        .select('*')
        .gte('day_number', 1)
        .lte('day_number', 10)
        .order('day_number');

      const progressMap = new Map(progressData?.map(p => [p.node_id, p]) || []);
      
      const nodesData: PathNodeData[] = (learningNodes || []).map((node) => {
        const progress = progressMap.get(node.id);
        return {
          id: node.id,
          node_type: node.node_type as PathNodeData['node_type'],
          status: (progress?.status as PathNodeData['status']) || 'locked',
          title: node.title,
          sequence_day: node.day_number,
          estimated_minutes: node.estimated_minutes || 3,
          isCheckpoint: node.day_number % 7 === 0
        };
      });

      setNodes(nodesData);
      
      const { count: completedCount } = await supabase
        .from('user_node_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');
      
      setCurrentDay((completedCount || 0) + 1);
    } catch (error) {
      console.error('Error refreshing progress:', error);
    }
  }, [user]);

  const loadPathProgress = async () => {
    try {
      if (!user) return;

      const { count: progressCount } = await supabase
        .from('user_node_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (!progressCount || progressCount === 0) {
        await learningPathService.initializeUserPath(user.id);
      }

      await refreshProgress();
    } catch (error) {
      console.error('Error loading path progress:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadPathProgress();
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPathProgress();
  };

  const handleNodePress = (nodeId: string, nodeType: string) => {
    router.push({
      pathname: '/unit-survey',
      params: { nodeId, type: nodeType }
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-lg text-foreground">Loading your path...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-muted/30">
      <StatsHeader />
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingTop: 80, paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="relative py-8">
          <View className="absolute left-8 top-0 bottom-0 w-1 bg-border" />
          
          {nodes.map((node) => (
            <View key={node.id} className="mb-16 relative">
              <PathNode
                {...node}
                onPress={() => handleNodePress(node.id, node.node_type)}
              />
            </View>
          ))}
        </View>

        <PathMascot currentDay={currentDay} />
      </ScrollView>
    </SafeAreaView>
  );
}
