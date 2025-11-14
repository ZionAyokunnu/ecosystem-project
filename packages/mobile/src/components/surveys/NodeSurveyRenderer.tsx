import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth, supabase } from '@ecosystem/shared';
import { DomainDrillSurvey } from './DomainDrillSurvey';
import { ConnectionExploreSurvey } from './ConnectionExploreSurvey';
import { LocalMeasurementSurvey } from './LocalMeasurementSurvey';
import { KnowledgeReviewSurvey } from './KnowledgeReviewSurvey';
import { Text } from '@/src/components/ui/Text';

interface NodeSurveyRendererProps {
  nodeId: string;
  nodeType: 'domain_drill' | 'connection_explore' | 'local_measure' | 'knowledge_review';
  onComplete: (data: any) => void;
  loading?: boolean;
}

export function NodeSurveyRenderer({ 
  nodeId, 
  nodeType, 
  onComplete, 
  loading = false 
}: NodeSurveyRendererProps) {
  const { user } = useAuth();
  const [nodeData, setNodeData] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadNodeData = async () => {
      if (!user?.id) return;

      const { data: node } = await supabase
        .from('learning_nodes')
        .select('*')
        .eq('id', nodeId)
        .single();

      const { data: profile } = await supabase
        .from('profiles')
        .select('streak, last_session, preferred_domains, selected_domain, location_id')
        .eq('id', user.id)
        .single();

      const { count: completedCount } = await supabase
        .from('user_node_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const pathState = profile ? {
        user_id: user.id,
        location_id: profile.location_id,
        current_day: (completedCount || 0) + 1,
        furthest_unlocked_day: (completedCount || 0) + 1,
        preferred_domains: profile.preferred_domains || [],
        selected_domain: profile.selected_domain,
        current_streak: profile.streak || 0,
        last_session_date: profile.last_session
      } : null;

      setNodeData(node);
      setUserState(pathState);
      setDataLoading(false);
    };

    loadNodeData();
  }, [nodeId, user?.id]);

  if (dataLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="text-xl text-foreground mt-4">Loading your task...</Text>
      </View>
    );
  }

  const commonProps = {
    nodeData,
    userState,
    onComplete
  };

  return (
    <ScrollView className="flex-1">
      {nodeType === 'domain_drill' && <DomainDrillSurvey {...commonProps} />}
      {nodeType === 'connection_explore' && <ConnectionExploreSurvey {...commonProps} />}
      {nodeType === 'local_measure' && <LocalMeasurementSurvey {...commonProps} />}
      {nodeType === 'knowledge_review' && <KnowledgeReviewSurvey {...commonProps} />}
      
      {loading && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-4">Saving your progress...</Text>
        </View>
      )}
    </ScrollView>
  );
}
