import React from 'react';
import { Clock } from 'lucide-react';

interface Activity {
  id: string;
  action_type: string;
  points_awarded: number;
  created_at: string;
  metadata?: any;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityIcons: Record<string, string> = {
  'survey_completed': '📝',
  'daily_quest': '🎯',
  'streak_bonus': '🔥',
  'badge_earned': '🏆',
  'referral': '👥',
  'level_up': '⭐'
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">No activity yet. Start learning to see your progress here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const icon = activityIcons[activity.action_type] || '✨';
        const actionName = activity.action_type
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return (
          <div
            key={activity.id}
            className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="text-3xl">{icon}</div>
            <div className="flex-1">
              <div className="font-medium text-foreground">{actionName}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(activity.created_at).toLocaleDateString()} at{' '}
                {new Date(activity.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                +{activity.points_awarded}
              </div>
              <div className="text-xs text-muted-foreground">insights</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
