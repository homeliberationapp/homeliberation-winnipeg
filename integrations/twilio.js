// ═══════════════════════════════════════════════════════════
// TWILIO SMS INTEGRATION
// Send automated SMS notifications to sellers & buyers
// ═══════════════════════════════════════════════════════════

const twilio = require('twilio');

let client = null;

function initTwilio(config) {
  if (!config.integrations.twilio.accountSid || !config.integrations.twilio.authToken) {
    console.warn('⚠️  Twilio credentials missing - SMS disabled');
    return null;
  }

  client = twilio(
    config.integrations.twilio.accountSid,
    config.integrations.twilio.authToken
  );

  console.log('✅ Twilio initialized');
  return client;
}

async function sendSMS(to, message) {
  try {
    if (!client) {
      console.log('📱 [TEST MODE] SMS to', to, ':', message);
      return { success: true, test: true };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: to
    });

    console.log(`✅ SMS sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid };

  } catch (error) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { initTwilio, sendSMS };
