
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, Users } from 'lucide-react';

interface BadgeRendererProps {
  badges: Array<{
    id: string;
    badge_type: string;
    awarded_at: string;
  }>;
  variant?: 'full' | 'compact';
}

const BadgeRenderer: React.FC<BadgeRendererProps> = ({ badges, variant = 'full' }) => {
  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'survey_starter':
        return {
          icon: Star,
          label: 'Survey Starter',
          color: 'bg-blue-100 text-blue-800',
          description: 'Completed your first survey'
        };
      case '5x_participant':
        return {
          icon: Trophy,
          label: '5x Participant',
          color: 'bg-yellow-100 text-yellow-800',
          description: 'Completed 5 surveys'
        };
      case 'community_champion':
        return {
          icon: Award,
          label: 'Community Champion',
          color: 'bg-purple-100 text-purple-800',
          description: 'Completed 10+ surveys'
        };
      case 'town_rep':
        return {
          icon: Users,
          label: 'Town Representative',
          color: 'bg-green-100 text-green-800',
          description: 'Active community representative'
        };
      default:
        return {
          icon: Award,
          label: type.replace(/_/g, ' '),
          color: 'bg-gray-100 text-gray-800',
          description: 'Special achievement'
        };
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-1">
        {badges.map((badge) => {
          const config = getBadgeConfig(badge.badge_type);
          const Icon = config.icon;
          return (
            <Badge key={badge.id} className={config.color}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.isArray(badges) ? (
        badges.map((badge) => {
          const config = getBadgeConfig(badge.badge_type);
          const Icon = config.icon;
          return (
            <div key={badge.id} className="flex items-center p-4 bg-white rounded-lg border shadow-sm">
              <div className={`p-3 rounded-full ${config.color} mr-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{config.label}</h3>
                <p className="text-sm text-gray-600">{config.description}</p>
                <p className="text-xs text-gray-500">
                  Earned {new Date(badge.awarded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
        );
      }
      )) : (
        <div className="text-gray-500">No badges available</div>
      )}
    </div>
  );
};

export default BadgeRenderer;
