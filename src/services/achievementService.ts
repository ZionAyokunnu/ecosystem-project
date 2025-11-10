import { supabase } from '@/integrations/supabase/client';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  unitsCompleted: number;
  streak: number;
  insights: number;
  hearts: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first unit',
    icon: '👣',
    condition: (stats) => stats.unitsCompleted >= 1
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Complete 3 units',
    icon: '🚀',
    condition: (stats) => stats.unitsCompleted >= 3
  },
  {
    id: 'halfway_hero',
    name: 'Halfway Hero',
    description: 'Complete 5 units (Checkpoint!)',
    icon: '🏆',
    condition: (stats) => stats.unitsCompleted >= 5
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 7 units',
    icon: '📚',
    condition: (stats) => stats.unitsCompleted >= 7
  },
  {
    id: 'master_learner',
    name: 'Master Learner',
    description: 'Complete all 10 units!',
    icon: '👑',
    condition: (stats) => stats.unitsCompleted >= 10
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    condition: (stats) => stats.streak >= 3
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    condition: (stats) => stats.streak >= 7
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: 'Maintain a 30-day streak',
    icon: '💎',
    condition: (stats) => stats.streak >= 30
  },
  {
    id: 'insight_collector',
    name: 'Insight Collector',
    description: 'Earn 100 insights',
    icon: '💰',
    condition: (stats) => stats.insights >= 100
  },
  {
    id: 'insight_master',
    name: 'Insight Master',
    description: 'Earn 500 insights',
    icon: '💎',
    condition: (stats) => stats.insights >= 500
  }
];

export const achievementService = {
  /**
   * Check and award new achievements for a user
   */
  async checkAndAwardAchievements(userId: string): Promise<string[]> {
    try {
      // Get user stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('insights, hearts, streak')
        .eq('id', userId)
        .single();

      // Get completed units count
      const { data: progress } = await supabase
        .from('user_node_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (!profile || !progress) return [];

      const stats: UserStats = {
        unitsCompleted: progress.length,
        streak: profile.streak || 0,
        insights: profile.insights || 0,
        hearts: profile.hearts || 5
      };

      // Get already earned badges
      const { data: existingBadges } = await supabase
        .from('user_badges')
        .select('badge_type')
        .eq('user_id', userId);

      const earnedBadgeIds = new Set(existingBadges?.map(b => b.badge_type) || []);
      const newBadges: string[] = [];

      // Check each achievement
      for (const achievement of ACHIEVEMENTS) {
        if (!earnedBadgeIds.has(achievement.id) && achievement.condition(stats)) {
          // Award the badge
          const { error } = await supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_type: achievement.id
            });

          if (!error) {
            newBadges.push(achievement.name);
          }
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  },

  /**
   * Get all achievements with user's progress
   */
  async getUserAchievements(userId: string) {
    try {
      const { data: badges } = await supabase
        .from('user_badges')
        .select('badge_type, awarded_at')
        .eq('user_id', userId);

      const earnedBadgeIds = new Set(badges?.map(b => b.badge_type) || []);

      return ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        earned: earnedBadgeIds.has(achievement.id),
        earnedAt: badges?.find(b => b.badge_type === achievement.id)?.awarded_at
      }));
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  },

  /**
   * Get achievement details by ID
   */
  getAchievementById(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
  },

  /**
   * Get all achievements
   */
  getAllAchievements(): Achievement[] {
    return ACHIEVEMENTS;
  }
};
