import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DomainDrillSurvey } from './DomainDrillSurvey';
import { ConnectionExploreSurvey } from './ConnectionExploreSurvey';
import { LocalMeasurementSurvey } from './LocalMeasurementSurvey';
import { KnowledgeReviewSurvey } from './KnowledgeReviewSurvey';
import { useAuth } from '@/hooks/useAuth';

interface NodeSurveyRendererProps {
  nodeId: string;
  nodeType: 'domain_drill' | 'connection_explore' | 'local_measure' | 'knowledge_review';
  onComplete: (data: any) => void;
  onStart?: () => Promise<boolean>;
}

export const NodeSurveyRenderer: React.FC<NodeSurveyRendererProps> = ({
  nodeId,
  nodeType,
  onComplete,
  onStart
}) => {
  const { user } = useAuth();
  const [nodeData, setNodeData] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNodeData = async () => {
      if (!user?.id) return;

      const { data: node } = await supabase
        .from('learning_nodes')
        .select('*')
        .eq('id', nodeId)
        .single();

      const { data: pathState } = await supabase
        .from('user_path_state')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setNodeData(node);
      setUserState(pathState);
      setLoading(false);
    };

    loadNodeData();
  }, [nodeId, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">Loading your task...</div>
      </div>
    );
  }

  const commonProps = {
    nodeData,
    userState,
    onComplete,
    onStart
  };

  switch (nodeType) {
    case 'domain_drill':
      return <DomainDrillSurvey {...commonProps} />;
    case 'connection_explore':
      return <ConnectionExploreSurvey {...commonProps} />;
    case 'local_measure':
      return <LocalMeasurementSurvey {...commonProps} />;
    case 'knowledge_review':
      return <KnowledgeReviewSurvey {...commonProps} />;
    default:
      return <div className="min-h-screen flex items-center justify-center">Unknown task type</div>;
  }
};
