import { supabase } from '@/integrations/supabase/client';

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

    // 2. Save placement results
    const { error: placementError } = await supabase
      .from('placement_results')
      .insert({
        user_id: userId,
        domain: data.domain.id,
        total_score: data.knowledgeScore,
        unlocked_to_unit: data.unlockedUnit
      });

    if (placementError) {
      console.error('Placement results error:', placementError);
      throw placementError;
    }

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

    // 4. Initialize path progress - unlock units based on knowledge check
    const initialUnits = Array.from({ length: data.unlockedUnit }, (_, i) => ({
      user_id: userId,
      unit_id: `unit_${i + 1}`,
      status: i === 0 ? 'current' : (i < data.unlockedUnit ? 'available' : 'locked')
    }));

    const { error: pathError } = await supabase
      .from('path_progress')
      .insert(initialUnits);

    if (pathError) {
      console.error('Path progress error:', pathError);
      throw pathError;
    }

    return { success: true };
  } catch (error) {
    console.error('Onboarding completion error:', error);
    throw error;
  }
};
