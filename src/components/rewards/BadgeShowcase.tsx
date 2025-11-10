import React, { useState } from 'react';

interface Badge {
  id: string;
  badge_type: string;
  awarded_at: string;
}

interface BadgeShowcaseProps {
  badges: Badge[];
}

const badgeConfig = {
  'streak_7': { emoji: '🔥', name: 'Week Warrior', color: 'orange' },
  'explorer': { emoji: '🗺️', name: 'Domain Explorer', color: 'blue' },
  'connector': { emoji: '🔗', name: 'Connection Master', color: 'purple' },
  'local_hero': { emoji: '🏠', name: 'Local Champion', color: 'green' },
  'consistency_king': { emoji: '👑', name: 'Consistency King', color: 'yellow' }
};

export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ badges }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (badges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 opacity-30">🏆</div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No badges yet</h3>
        <p className="text-muted-foreground">Complete learning tasks to earn your first achievement!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {badges.map((badge, index) => {
          const config = badgeConfig[badge.badge_type as keyof typeof badgeConfig] || {
            emoji: '🎯',
            name: badge.badge_type,
            color: 'gray'
          };

          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className="group relative p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 hover:border-yellow-400 transition-all duration-200 hover:scale-105 hover:shadow-lg animate-fade-in"
              style={{ 
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                {config.emoji}
              </div>
              <div className="text-xs font-medium text-foreground text-center">
                {config.name}
              </div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 transition-opacity duration-500" />
            </button>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="bg-background rounded-3xl p-8 max-w-md w-full text-center transform animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-8xl mb-6">
              {badgeConfig[selectedBadge.badge_type as keyof typeof badgeConfig]?.emoji || '🎯'}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {badgeConfig[selectedBadge.badge_type as keyof typeof badgeConfig]?.name || selectedBadge.badge_type}
            </h3>
            <p className="text-muted-foreground mb-6">
              Earned on {new Date(selectedBadge.awarded_at).toLocaleDateString()}
            </p>
            <button
              onClick={() => setSelectedBadge(null)}
              className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
            >
              Awesome! ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
};
