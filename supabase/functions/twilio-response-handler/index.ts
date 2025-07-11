import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const url = new URL(req.url);
    const questionId = url.searchParams.get('questionId');
    const surveyId = url.searchParams.get('surveyId');

    if (!questionId || !surveyId) {
      throw new Error('Missing questionId or surveyId');
    }

    const formData = await req.formData();
    const digits = formData.get('Digits')?.toString();
    const recordingUrl = formData.get('RecordingUrl')?.toString();
    const callSid = formData.get('CallSid')?.toString();
    const from = formData.get('From')?.toString();

    // Get user ID from phone number
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', from)
      .single();

    if (profileError || !profile) {
      console.error('Could not find user for phone number:', from);
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, we couldn't process your response. Please try again later.</Say>
  <Hangup/>
</Response>`, {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml' }
      });
    }

    let responseData: any = {
      survey_id: surveyId,
      user_id: profile.id,
      question_id: questionId,
      response_type: 'voice',
      phone_number: from
    };

    if (digits) {
      // Numeric response (slider)
      const value = parseInt(digits);
      if (value >= 1 && value <= 10) {
        responseData.quantitative_value = value;
      }
    } else if (recordingUrl) {
      // Voice response - we'll transcribe this later
      responseData.qualitative_text = `Recording: ${recordingUrl}`;
      responseData.raw_transcript = recordingUrl;
      
      // TODO: Implement speech-to-text transcription
      // This could be done via another edge function or external service
    }

    // Save the response
    const { error: responseError } = await supabase
      .from('survey_responses')
      .insert([responseData]);

    if (responseError) {
      console.error('Error saving response:', responseError);
    }

    // Update call attempt status
    if (callSid) {
      await supabase
        .from('voice_call_attempts')
        .update({ status: 'completed' })
        .eq('twilio_call_sid', callSid);
    }

    // Continue with next question or end call
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for your response.</Say>
  <Redirect>/functions/v1/twilio-next-question?surveyId=${surveyId}&callSid=${callSid}</Redirect>
</Response>`, {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error('Error in twilio-response-handler:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, there was an error processing your response. Goodbye.</Say>
  <Hangup/>
</Response>`, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/xml' }
    });
  }
});