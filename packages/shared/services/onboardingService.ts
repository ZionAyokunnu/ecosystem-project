import { supabase } from '../integrations/supabase/client';

export interface OnboardingData {
  domain: {
    id: string;
    title: string;
  } | null;
  knowledgeScore: number;
  unlockedUnit: number;
  dailyGoal: number;
  notificationsEnabled: boolean;
  notificationTime: string;
}

export const completeOnboarding = async (userId: string, data: OnboardingData) => {
  if (!data.domain) {
    throw new Error('Domain selection is required');
  }

  try {
    // 1. Update user profile with onboarding data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        daily_goal: data.dailyGoal,
        hearts: 5,
        streak: 0,
        last_session: new Date().toISOString(),
        insights: 0,
        selected_domain: data.domain.id,
        knowledge_level: data.knowledgeScore,
        has_completed_onboarding: true
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    // 2. Note: placement_results table no longer exists in new schema
    // Knowledge level is now stored directly in profiles table
    console.log('Placement results saved in profiles.knowledge_level');

    // 3. Save notification settings if enabled
    if (data.notificationsEnabled) {
      const hour = parseInt(data.notificationTime.split(':')[0]);
      const { error: notificationError } = await supabase
        .from('notification_settings')
        .insert({
          user_id: userId,
          enabled: true,
          time_hour: hour
        });

      if (notificationError) {
        console.error('Notification settings error:', notificationError);
        throw notificationError;
      }
    }

    // 4. Note: path_progress table no longer exists in new schema
    // Progress is now tracked via user_node_progress table
    // Initial progress is created by learningPathService.initializeUserPath()
    console.log('Path progress will be initialized by learning path service');

    return { success: true };
  } catch (error) {
    console.error('Onboarding completion error:', error);
    throw error;
  }
};
