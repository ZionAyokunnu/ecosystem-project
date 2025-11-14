import { supabase } from '../integrations/supabase/client';
// NOTE: Twilio integration - needs platform-specific implementation
// import { callTest } from '@/integrations/twilio/client';

export interface VoiceCallAttempt {
  id: string;
  survey_id: string;
  user_id: string;
  phone_number: string;
  status: 'scheduled' | 'calling' | 'completed' | 'failed' | 'declined' | 'rescheduled';
  scheduled_at: string;
  attempted_at?: string;
  completed_at?: string;
  call_duration_seconds?: number;
  twilio_call_sid?: string;
  failure_reason?: string;
  reschedule_requested_at?: string;
}

export interface SurveyNotification {
  id: string;
  survey_id: string;
  user_id: string;
  notification_type: 'web_banner' | 'sms_pre_call' | 'push_notification';
  sent_at: string;
  message_content?: string;
  delivery_status: 'sent' | 'delivered' | 'failed';
}

// Schedule voice calls for all eligible users when a survey goes live
export const scheduleVoiceCalls = async (surveyId: string, locationId: string) => {
  console.warn('scheduleVoiceCalls is deprecated. Voice call system has been disabled.');
  try {
    // Get target users for this survey
    const { data: targetUsers, error: usersError } = await supabase
      .rpc('get_survey_target_users', {
        survey_id_param: surveyId,
        location_id_param: locationId
      });

    if (usersError) throw usersError;
    if (!targetUsers || targetUsers.length === 0) {
      console.log('No target users found for survey:', surveyId);
      return;
    }

    // Schedule calls for each user (within 1 hour)
    const callAttempts = targetUsers.map(user => ({
      survey_id: surveyId,
      user_id: user.user_id,
      phone_number: user.phone_number,
      status: 'scheduled' as const,
      scheduled_at: new Date(Date.now() + Math.random() * 60 * 60 * 1000).toISOString() // Within 1 hour
    }));

    const { error: callsError } = await supabase
      .from('voice_call_attempts')
      .insert(callAttempts);

    if (callsError) throw callsError;

    // Note: survey_notifications table no longer exists
    console.log('Survey notifications feature has been disabled');

    console.log(`Scheduled ${callAttempts.length} voice calls for survey ${surveyId}`);
    return callAttempts.length;
  } catch (error) {
    console.error('Error scheduling voice calls:', error);
    throw error;
  }
};

// Get call attempts for a survey
export const getCallAttempts = async (surveyId: string): Promise<VoiceCallAttempt[]> => {
  const { data, error } = await supabase
    .from('voice_call_attempts')
    .select('*')
    .eq('survey_id', surveyId)
    .order('scheduled_at', { ascending: true });

  if (error) throw error;
  return data as VoiceCallAttempt[];
};

// Update call attempt status
export const updateCallAttempt = async (
  attemptId: string, 
  updates: Partial<VoiceCallAttempt>
) => {
  const { error } = await supabase
    .from('voice_call_attempts')
    .update(updates)
    .eq('id', attemptId);

  if (error) throw error;
};

// Test voice call function (uses existing Twilio integration)
export const makeTestCall = async (phoneNumber: string) => {
  try {
    const result = await callTest(phoneNumber);
    console.log('Test call initiated:', result);
    return result;
  } catch (error) {
    console.error('Error making test call:', error);
    throw error;
  }
};

// Get survey notifications
export const getSurveyNotifications = async (userId: string): Promise<SurveyNotification[]> => {
  console.warn('getSurveyNotifications is deprecated. survey_notifications table no longer exists.');
  return [];
};

// Mark survey notification as delivered
export const markNotificationDelivered = async (notificationId: string) => {
  console.warn('markNotificationDelivered is deprecated. survey_notifications table no longer exists.');
  throw new Error('Survey notifications feature has been disabled');
};
