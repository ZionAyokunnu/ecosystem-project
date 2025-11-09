import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PathNode } from './PathNode';
import { PathMascot } from './PathMascot';

interface PathNodeData {
  id: string;
  node_type: 'domain_drill' | 'connection_explore' | 'local_measure' | 'knowledge_review';
  status: 'locked' | 'available' | 'current' | 'completed';
  title: string;
  sequence_day: number;
  estimated_minutes: number;
  isCheckpoint?: boolean;
}

export const PathProgress: React.FC = () => {
  const [nodes, setNodes] = useState<PathNodeData[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPathProgress();
  }, []);

  const loadPathProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's path state
      const { data: pathState } = await supabase
        .from('user_path_state')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentDayValue = pathState?.current_day || 1;
      setCurrentDay(currentDayValue);

      // Get learning nodes with user progress
      const { data: learningNodes } = await supabase
        .from('learning_nodes')
        .select('*')
        .gte('sequence_day', currentDayValue)
        .lte('sequence_day', currentDayValue + 9)
        .order('sequence_day');

      // Get user progress for these nodes
      const nodeIds = learningNodes?.map(n => n.id) || [];
      const { data: progressData } = await supabase
        .from('user_node_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('node_id', nodeIds);

      const progressMap = new Map(progressData?.map(p => [p.node_id, p]) || []);

      const nodesData: PathNodeData[] = (learningNodes || []).map((node, i) => {
        const progress = progressMap.get(node.id);
        return {
          id: node.id,
          node_type: node.node_type as PathNodeData['node_type'],
          status: (progress?.status as PathNodeData['status']) || 'locked',
          title: node.title,
          sequence_day: node.sequence_day,
          estimated_minutes: node.estimated_minutes || 3,
          isCheckpoint: node.sequence_day % 7 === 0
        };
      });

      setNodes(nodesData);
      
    } catch (error) {
      console.error('Error loading path progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading your path...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-10 px-[60px]">
      {/* Current day banner */}
      <div className="w-[480px] h-16 mb-12 rounded-2xl bg-gradient-to-br from-success to-success-light p-4 flex items-center justify-between animate-scale-in">
        <div>
          <div className="text-xs font-bold text-white/80 uppercase tracking-wide">
            Day {currentDay}
          </div>
          <div className="text-lg font-bold text-white">
            {nodes.find(n => n.status === 'current')?.title || 'Your Current Task'}
          </div>
        </div>
        <span className="text-2xl">📊</span>
      </div>

      {/* Path track - vertical line */}
      <div className="absolute left-[300px] top-0 bottom-0 w-1 bg-border" />

      {/* Nodes with mascot */}
      <div className="relative">
        {nodes.map((node) => (
          <div key={node.id} className="relative mb-[120px] last:mb-0">
            <PathNode {...node} />
          </div>
        ))}
        
        {/* Mascot follows current day */}
        <PathMascot currentUnit={currentDay} />
      </div>
    </div>
  );
};
