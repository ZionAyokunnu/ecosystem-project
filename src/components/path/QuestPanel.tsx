import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Quest {
  id: string;
  icon: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: { type: string; amount: number };
  bgColor: string;
  textColor: string;
}

export const QuestPanel: React.FC = () => {
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's daily goal
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_goal')
        .eq('id', user.id)
        .single();

      const dailyGoal = profile?.daily_goal || 3;

      // Count today's survey responses
      const today = new Date().toISOString().split('T')[0];
      const { count: surveyCount } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`);

      // Default quests
      const defaultQuests: Quest[] = [
        {
          id: 'daily_insights',
          icon: '🧠',
          title: 'Check Your Impact',
          description: 'See how your learning affects your community',
          progress: 0,
          total: 1,
          reward: { type: 'insights', amount: 3 },
          bgColor: '#F3E8FF',
          textColor: '#7C3AED'
        },
        {
          id: 'insights',
          icon: '⚡',
          title: `Discover ${dailyGoal} connections`,
          description: 'Complete ecosystem surveys',
          progress: surveyCount || 0,
          total: dailyGoal,
          reward: { type: 'insights', amount: 15 },
          bgColor: '#FEF3C7',
          textColor: '#92400E'
        },
        {
          id: 'explore',
          icon: '🔍',
          title: 'Explore for 10 minutes',
          description: 'Time spent learning',
          progress: 0,
          total: 10,
          reward: { type: 'insights', amount: 10 },
          bgColor: '#DBEAFE',
          textColor: '#1E40AF'
        },
        {
          id: 'interact',
          icon: '🤝',
          title: 'Share 2 community stories',
          description: 'Add local insights',
          progress: 0,
          total: 2,
          reward: { type: 'badge', amount: 1 },
          bgColor: '#D1FAE5',
          textColor: '#047857'
        }
      ];

      setQuests(defaultQuests);
    } catch (error) {
      console.error('Error loading quests:', error);
    }
  };

  return (
    <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">
          Daily Ecosystem Quests
        </h3>
        <button className="text-xs font-bold text-success hover:underline">
          VIEW ALL
        </button>
      </div>

      {/* Quest items */}
      <div className="space-y-3">
        {quests.map((quest) => {
          const progressPercent = (quest.progress / quest.total) * 100;
          const isInsightsQuest = quest.id === 'daily_insights';
          
          return (
            <div
              key={quest.id}
              className={`p-3 rounded-lg border border-muted/50 flex items-center gap-3 ${isInsightsQuest ? 'cursor-pointer hover:scale-105 transition-all duration-200' : ''}`}
              style={{ backgroundColor: quest.bgColor }}
              onClick={isInsightsQuest ? () => navigate('/insights') : undefined}
            >
              {/* Icon */}
              <div className="text-2xl flex-shrink-0">
                {quest.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {quest.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {quest.description}
                </div>

                {/* Progress bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {quest.progress}/{quest.total}
                  </span>
                </div>
              </div>

              {/* Reward */}
              <div
                className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                style={{ 
                  backgroundColor: quest.textColor + '20',
                  color: quest.textColor
                }}
              >
                +{quest.reward.amount}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
