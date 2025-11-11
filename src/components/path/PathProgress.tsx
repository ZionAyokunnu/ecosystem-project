import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

      // Get current day from count of completed nodes (next available day)
      const { count: completedCount } = await supabase
        .from('user_node_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const currentDayValue = (completedCount || 0) + 1;
      setCurrentDay(currentDayValue);
      console.log('🐛 Current day calculation:', {
        completedCount,
        currentDayValue,
        shouldStartAtDay1: completedCount === 0
      });

      // Get learning nodes with user progress
      const { data: learningNodes } = await supabase
        .from('learning_nodes')
        .select('*')
        .gte('day_number', currentDayValue)
        .lte('day_number', currentDayValue + 9)
        .order('day_number');

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
          sequence_day: node.day_number,
          estimated_minutes: node.estimated_minutes || 3,
          isCheckpoint: node.day_number % 7 === 0
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
      <div className="w-[480px] h-20 mb-12 rounded-2xl bg-gradient-to-br from-success to-success-light p-4 flex items-center justify-between animate-scale-in">
        <div className="flex-1">
          <div className="text-xs font-bold text-white/80 uppercase tracking-wide">
            Day {currentDay}
          </div>
          <div className="text-lg font-bold text-white">
            {nodes.find(n => n.status === 'current')?.title || 'Your Learning Journey'}
          </div>
        </div>
        
        {/* Insights Button */}
        <button
          onClick={() => navigate('/insights')}
          className="bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
        >
          <span className="text-lg">🧠</span>
          <span className="text-sm">See Insights</span>
        </button>
        
        <span className="text-2xl ml-4">📊</span>
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
