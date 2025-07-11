import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallRequest {
  surveyId: string;
  userId: string;
  phoneNumber: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { surveyId, userId, phoneNumber } = await req.json() as CallRequest;

    if (!surveyId || !userId || !phoneNumber) {
      throw new Error('Missing required parameters');
    }

    // Get survey details
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('survey_id', surveyId)
      .single();

    if (surveyError) throw surveyError;

    // Get survey questions
    const { data: questions, error: questionsError } = await supabase
      .from('survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('created_at');

    if (questionsError) throw questionsError;

    // Generate TwiML for the call
    const twiml = generateSurveyTwiML(survey, questions);

    // Create call attempt record
    const { error: attemptError } = await supabase
      .from('voice_call_attempts')
      .insert({
        survey_id: surveyId,
        user_id: userId,
        phone_number: phoneNumber,
        status: 'calling',
        attempted_at: new Date().toISOString()
      });

    if (attemptError) throw attemptError;

    // Make the call using Twilio
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioFromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioSid || !twilioToken || !twilioFromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const callResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phoneNumber,
        From: twilioFromNumber,
        Twiml: twiml,
      }),
    });

    const callResult = await callResponse.json();

    if (!callResponse.ok) {
      throw new Error(`Twilio error: ${callResult.message}`);
    }

    // Update call attempt with Twilio SID
    await supabase
      .from('voice_call_attempts')
      .update({
        twilio_call_sid: callResult.sid,
        status: 'calling'
      })
      .eq('survey_id', surveyId)
      .eq('user_id', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        callSid: callResult.sid,
        message: 'Call initiated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in twilio-voice-handler:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateSurveyTwiML(survey: any, questions: any[]): string {
  const estimatedTime = survey.estimated_duration_minutes || 5;
  
  let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Hello, my name is Sarah calling on behalf of the City Community Engagement Team.
    We're conducting a short survey about ${survey.title} to help guide local improvements.
    ${survey.justification ? `This survey ${survey.justification}` : ''}
    It should take about ${estimatedTime} minutes. Your feedback is very valuable.
    Let's get started.
  </Say>
  <Pause length="1"/>`;

  questions.forEach((question, index) => {
    if (question.input_type === 'slider') {
      twiml += `
  <Gather input="dtmf" numDigits="2" timeout="10" action="/functions/v1/twilio-response-handler?questionId=${question.question_id}&surveyId=${survey.survey_id}">
    <Say voice="alice">
      Question ${index + 1}: ${question.prompt}
      Please press a number from 1 to 10, then press the pound key.
    </Say>
  </Gather>`;
    } else if (question.input_type === 'text') {
      twiml += `
  <Record timeout="30" maxLength="120" action="/functions/v1/twilio-response-handler?questionId=${question.question_id}&surveyId=${survey.survey_id}">
    <Say voice="alice">
      Question ${index + 1}: ${question.prompt}
      Please speak your answer after the beep. Press any key when you're done.
    </Say>
  </Record>`;
    }
  });

  twiml += `
  <Say voice="alice">
    Thank you for completing our survey. Your feedback is very important to us and will help improve our community.
    Have a great day!
  </Say>
  <Hangup/>
</Response>`;

  return twiml;
}