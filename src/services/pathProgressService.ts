import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PathProgressUpdate {
  unitId: string;
  status: 'locked' | 'available' | 'current' | 'completed';
  insightsEarned?: number;
}

export const pathProgressService = {
  /**
   * Initialize path progress for a new user
   */
  async initializePathProgress(userId: string, domain: string) {
    try {
      // Create initial path progress - Unit 1 is current, rest are locked
      const initialProgress = Array.from({ length: 10 }, (_, i) => ({
        user_id: userId,
        unit_id: `unit_${i + 1}`,
        status: i === 0 ? 'current' : 'locked',
        insights_earned: 0
      }));

      const { error } = await supabase
        .from('path_progress')
        .insert(initialProgress);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error initializing path progress:', error);
      return { success: false, error };
    }
  },

  /**
   * Complete a unit and unlock the next one
   */
  async completeUnit(unitId: string, insightsEarned: number = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get current unit number
      const unitNum = parseInt(unitId.split('_')[1]);
      const nextUnitId = `unit_${unitNum + 1}`;
      const isCheckpoint = unitNum % 5 === 0;

      // Mark current unit as completed
      const { error: updateError } = await supabase
        .from('path_progress')
        .update({
          status: 'completed',
          insights_earned: insightsEarned,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('unit_id', unitId);

      if (updateError) throw updateError;

      // Award bonus insights for checkpoints
      const checkpointBonus = isCheckpoint ? 20 : 0;
      const totalInsights = insightsEarned + checkpointBonus;

      // Get current insights and update
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

      // If not the last unit, unlock the next one and make it current
      if (unitNum < 10) {
        const { error: nextError } = await supabase
          .from('path_progress')
          .update({ status: 'current' })
          .eq('user_id', user.id)
          .eq('unit_id', nextUnitId);

        if (nextError) throw nextError;
      }

      // Check for new achievements (imported dynamically to avoid circular deps)
      const { achievementService } = await import('./achievementService');
      const newBadges = await achievementService.checkAndAwardAchievements(user.id);

      return { 
        success: true, 
        insightsEarned: totalInsights,
        isCheckpoint,
        unitNumber: unitNum,
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
   */
  async getUserProgress() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('path_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('unit_id');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return { success: false, error };
    }
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
