// test-twilio.ts
import 'dotenv/config';                  // so that .env is loaded
import { callTest } from './src/integrations/twilio/client';

(async () => {
  try {
    const phone = '+44YOURNUMBER';      // ← replace with your E.164 number
    console.log(`📞  Calling ${phone}…`);
    const call = await callTest(phone);
    console.log('✅ Call initiated! SID:', call.sid);
  } catch (err) {
    console.error('❌ Twilio error:', err);
  }
})();