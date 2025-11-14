
import { supabase } from '../integrations/supabase/client';

export interface UserPoints {
  total_points: number;
  recent_activities: Array<{
    action_type: string;
    points_awarded: number;
    created_at: string;
    metadata: any;
  }>;
}

export interface UserBadge {
  id: string;
  badge_type: string;
  awarded_at: string;
}

export interface UserVoucher {
  id: string;
  voucher_code: string;
  partner_name: string;
  value: string;
  expires_at: string | null;
  is_redeemed: boolean;
}

export const awardPoints = async (
  userId: string,
  actionType: 'survey_completed' | 'referral' | 'upload' | 'admin_bonus',
  points: number,
  metadata: any = {}
): Promise<void> => {
  const { error } = await supabase
    .from('user_points_log')
    .insert({
      user_id: userId,
      action_type: actionType,
      points_awarded: points,
      metadata
    });

  if (error) {
    console.error('Error awarding points:', error);
    throw error;
  }

  // Check for badge eligibility
  await checkAndAwardBadges(userId);
};

export const getUserPoints = async (userId: string): Promise<UserPoints> => {
  const { data, error } = await supabase
    .from('user_points_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user points:', error);
    throw error;
  }

  const total_points = (data || []).reduce((sum, entry) => sum + entry.points_awarded, 0);
  const recent_activities = (data || []).slice(0, 10);

  return { total_points, recent_activities };
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    throw error;
  }

  return data || [];
};

export const getUserVouchers = async (userId: string): Promise<UserVoucher[]> => {
  const { data, error } = await supabase
    .from('user_vouchers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_redeemed', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user vouchers:', error);
    throw error;
  }

  return data || [];
};

const checkAndAwardBadges = async (userId: string): Promise<void> => {
  // Get user's survey completion count
  const { data: surveyCount } = await supabase
    .from('user_points_log')
    .select('id')
    .eq('user_id', userId)
    .eq('action_type', 'survey_completed');

  const completions = surveyCount?.length || 0;

  const badgesToAward = [];

  if (completions >= 1) badgesToAward.push('survey_starter');
  if (completions >= 5) badgesToAward.push('5x_participant');
  if (completions >= 10) badgesToAward.push('community_champion');

  for (const badgeType of badgesToAward) {
    const { error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_type: badgeType
      });

    // Ignore conflicts if badge already exists
    if (error && !error.message.includes('duplicate')) {
      console.error('Error awarding badge:', error);
    }
  }
};

export const redeemVoucher = async (voucherId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_vouchers')
    .update({ is_redeemed: true })
    .eq('id', voucherId);

  if (error) {
    console.error('Error redeeming voucher:', error);
    throw error;
  }
};
