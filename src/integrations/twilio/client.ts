import Twilio from 'twilio';

// Ensure these env vars are set in your .env (we did this in Step 1)
const accountSid = import.meta.env.TWILIO_ACCOUNT_SID!;
const authToken  = import.meta.env.TWILIO_AUTH_TOKEN!;
const fromNumber = import.meta.env.TWILIO_PHONE_NUMBER!;

if (!accountSid || !authToken || !fromNumber) {
  throw new Error(
    'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER must be set in .env'
  );
}

// Initialize the Twilio client
export const twilioClient = Twilio(accountSid, authToken);

/**
 * Makes a simple outbound call that reads a canned message.
 * @param to The E.164 phone number to call, e.g. "+15551234567"
 */
export async function callTest(to: string) {
  return twilioClient.calls.create({
    to,
    from: fromNumber,
    // A minimal TwiML response—reads your message and hangs up
    twiml: `
      <Response>
        <Say voice="Rejoice">
          Hello! This is a test call from zion ai system
        </Say>
      </Response>
    `.trim(),
  });
}