import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export interface PathProgressUpdate {
  unitId: string;
  status: 'locked' | 'available' | 'current' | 'completed';
  insightsEarned?: number;
}

export const pathProgressService = {
  /**
   * Initialize path progress for a new user
   * Note: path_progress table no longer exists - using user_node_progress instead
   */
  async initializePathProgress(userId: string, domain: string) {
    console.warn('pathProgressService.initializePathProgress is deprecated. Use learningPathService.initializeUserPath() instead.');
    return { success: true };
  },

  /**
   * Complete a unit and unlock the next one
   * Note: path_progress table no longer exists - using user_node_progress instead
   */
  async completeUnit(unitId: string, insightsEarned: number = 10) {
    console.warn('pathProgressService.completeUnit is deprecated. Use learningPathService.completeNode() instead.');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const isCheckpoint = parseInt(unitId.split('_')[1] || '0') % 5 === 0;
      const checkpointBonus = isCheckpoint ? 20 : 0;
      const totalInsights = insightsEarned + checkpointBonus;

      // Award insights to profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('insights')
        .eq('id', user.id)
        .single();

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          insights: (profile?.insights || 0) + totalInsights
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Check for new achievements
      const { achievementService } = await import('./achievementService');
      const newBadges = await achievementService.checkAndAwardAchievements(user.id);

      return { 
        success: true, 
        insightsEarned: totalInsights,
        isCheckpoint,
        unitNumber: parseInt(unitId.split('_')[1] || '0'),
        newBadges
      };
    } catch (error) {
      console.error('Error completing unit:', error);
      toast.error('Failed to complete unit');
      return { success: false, error };
    }
  },

  /**
   * Get user's current progress
   * Note: path_progress table no longer exists - using user_node_progress instead
   */
  async getUserProgress() {
    console.warn('pathProgressService.getUserProgress is deprecated. Use learningPathService.getUserPathData() instead.');
    return { success: true, data: [] };
  },

  /**
   * Update streak and hearts after daily activity
   */
  async updateDailyStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const today = new Date().toDateString();

      // Get user's last session
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_session, streak, hearts')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const lastSession = profile.last_session 
        ? new Date(profile.last_session).toDateString() 
        : null;

      // Check if this is a new day
      if (lastSession !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const isConsecutive = lastSession === yesterday;

        // Update streak
        const newStreak = isConsecutive ? (profile.streak || 0) + 1 : 1;
        
        // Restore hearts to full (5)
        const { error } = await supabase
          .from('profiles')
          .update({
            last_session: new Date().toISOString(),
            streak: newStreak,
            hearts: 5
          })
          .eq('id', user.id);

        if (error) throw error;

        if (newStreak > 1) {
          toast.success(`🔥 ${newStreak} Day Streak!`, {
            description: 'Hearts restored to full!'
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating daily stats:', error);
      return { success: false, error };
    }
  },

  /**
   * Spend a heart (used when answering questions)
   */
  async spendHeart() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('hearts')
        .eq('id', user.id)
        .single();

      if (!profile || profile.hearts <= 0) {
        toast.error('No hearts left!', {
          description: 'Come back tomorrow for more hearts.'
        });
        return { success: false, error: 'No hearts remaining' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({ hearts: profile.hearts - 1 })
        .eq('id', user.id);

      if (error) throw error;

      return { success: true, heartsRemaining: profile.hearts - 1 };
    } catch (error) {
      console.error('Error spending heart:', error);
      return { success: false, error };
    }
  }
};
