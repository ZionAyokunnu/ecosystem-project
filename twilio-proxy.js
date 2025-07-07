import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
import Twilio from 'twilio';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.VITE_SUPABASE_URL;
const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Missing Supabase env vars in .env');
}
const supabase = createClient(supabaseUrl, supabaseAnon);

// GET /api/surveys/:surveyId
app.get('/api/surveys/:surveyId', async (req, res) => {
  const { surveyId } = req.params;
  const { data, error } = await supabase
    .from('survey_questions')
    .select('question_id, prompt, input_type, is_required')
    .eq('survey_id', surveyId)
    .order('question_id', { ascending: true });

  if (error) {
    console.error('Supabase fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

 app.post('/api/call', async (req, res) => {
   const { phone } = req.body;

   // Read creds from .env
   const sid  = process.env.TWILIO_ACCOUNT_SID;
   const tok  = process.env.TWILIO_AUTH_TOKEN;
   const from = process.env.TWILIO_PHONE_NUMBER;
   if (!sid||!tok||!from) {
     return res.status(500).json({ error: 'Missing TWILIO_ env vars' });
   }

   const client = Twilio(sid, tok);
   try {
    const call = await client.calls.create({
    to: phone,
    from: process.env.TWILIO_PHONE_NUMBER,
    url: `${baseUrl}/api/gather?surveyId=${surveyId}&questionIndex=0&phone=${encodeURIComponent(phone)}`
    });
     res.json({ success: true, sid: call.sid });
   } catch (err) {
     console.error(err);
     res.status(500).json({ success: false, error: err.message });
   }
 });

 // POST /api/call-survey
app.post('/api/call-survey', async (req, res) => {
  const { phone, surveyId } = req.body;
  if (!phone || !surveyId) {
    return res.status(400).json({ error: 'phone and surveyId required' });
  }

  // 1) Load questions
  const { data: questions, error } = await supabase
    .from('survey_questions')
    .select('prompt')
    .eq('survey_id', surveyId)
    .order('question_id', { ascending: true });

  if (error) {
    console.error('Error loading questions:', error);
    return res.status(500).json({ error: error.message });
  }

  // 2) Build TwiML dynamically
  let twiml = '<Response>';
  for (const q of questions) {
    twiml += `<Say voice="alice">${q.prompt}</Say>`;
    // If you want to capture DTMF: use <Gather> here
  }
  twiml += '</Response>';

  // 3) Trigger the call
  try {
    const call = await Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    ).calls.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      twiml,
    });
    res.json({ success: true, sid: call.sid });
  } catch (err) {
    console.error('Twilio call error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/gather', async (req, res) => {
  const { surveyId, questionIndex, phone } = req.query;
  const idx = parseInt(questionIndex, 10);
  const answer = req.body.SpeechResult; // Twilio posts this

  // 1) Persist the answer
  const { data: ids } = await supabase
    .from('survey_questions')
    .select('question_id')
    .eq('survey_id', surveyId)
    .order('question_id', { ascending: true });
  const questionId = ids[idx].question_id;

  await supabase.from('survey_responses').insert({
    survey_id: surveyId,
    question_id: questionId,
    phone_number: phone,
    answer,
  });

  // 2) Prepare next question or end
  const next = idx + 1;
  if (next < ids.length) {
    // Fetch next prompt
    const { data: prompts } = await supabase
      .from('survey_questions')
      .select('prompt')
      .eq('survey_id', surveyId)
      .order('question_id', { ascending: true });

    const prompt = prompts[next].prompt;
    const actionUrl = `${baseUrl}/api/gather?surveyId=${surveyId}&questionIndex=${next}&phone=${encodeURIComponent(phone)}`;

    // TwiML with a <Gather>
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${actionUrl}" method="POST">
    <Say voice="alice">${prompt}</Say>
  </Gather>
  <Say voice="alice">Sorry, I didn’t catch that.</Say>
  <Redirect>${actionUrl}</Redirect>
</Response>`;

    res.type('text/xml').send(xml);
  } else {
    // End of survey
    res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for completing the survey. Goodbye!</Say>
</Response>`);
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// PUBLIC_URL should point to a publicly reachable address (e.g. your ngrok tunnel)
const baseUrl = process.env.PUBLIC_URL || 'https://kbkypgtpplgrnmkrwmjc.supabase.co';

// After your `const baseUrl = …` line, add:
function parseSpokenNumber(spoken) {
  const n = parseInt(spoken, 10);
  if (!isNaN(n)) return n;
  const map = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };
  const w = (spoken || '').trim().toLowerCase();
  return map[w] ?? null;
}
const quantitativeTypes = ['slider', 'select', 'relationship'];

// …earlier endpoints…

app.post('/api/gather', async (req, res) => {
  const { surveyId, questionIndex, phone } = req.query;
  const idx = parseInt(questionIndex, 10);

  // 1) Load all question metadata (id, prompt, input_type)
  const { data: questions, error: qError } = await supabase
    .from('survey_questions')
    .select('question_id, prompt, input_type')
    .eq('survey_id', surveyId)
    .order('question_id', { ascending: true });
  if (qError || !questions) {
    console.error('Error loading questions metadata:', qError);
    return res.status(500).end();
  }

  // Grab current question details
  const { question_id: qId, prompt, input_type } = questions[idx];

  // 2) Parse the answer
  let answer;
  if (quantitativeTypes.includes(input_type)) {
    // Prefer keypad
    if (req.body.Digits) {
      answer = req.body.Digits;
    } else {
      answer = parseSpokenNumber(req.body.SpeechResult);
    }
  } else {
    // Free‐form text
    answer = req.body.SpeechResult || '';
  }

  // 3) Persist the parsed answer
  await supabase.from('survey_responses').insert({
    survey_id: surveyId,
    question_id: qId,
    phone_number: phone,
    answer
  });

  // 4) Build TwiML for next step
  const nextIdx = idx + 1;
  if (nextIdx < questions.length) {
    const { prompt: nextPrompt, input_type: nextType } = questions[nextIdx];
    const actionUrl = `${baseUrl}/api/gather?surveyId=${surveyId}&questionIndex=${nextIdx}&phone=${encodeURIComponent(phone)}`;
    const isQuant = quantitativeTypes.includes(nextType);
    const gatherAttrs = isQuant
      ? 'input="dtmf speech" numDigits="2"'
      : 'input="speech" speechTimeout="auto"';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather ${gatherAttrs} action="${actionUrl}" method="POST">
    <Say voice="alice">${nextPrompt}</Say>
  </Gather>
  <Say voice="alice">Sorry, I didn’t catch that.</Say>
  <Redirect>${actionUrl}</Redirect>
</Response>`;
    res.type('text/xml').send(xml);
  } else {
    // End call
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for completing the survey. Goodbye!</Say>
</Response>`;
    res.type('text/xml').send(xml);
  }
});

 app.listen(3001, () => console.log('API listening on http://localhost:3001'));