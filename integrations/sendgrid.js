// ═══════════════════════════════════════════════════════════
// SENDGRID EMAIL INTEGRATION
// Send automated emails (offer letters, buyer alerts, reports)
// ═══════════════════════════════════════════════════════════

const sgMail = require('@sendgrid/mail');

let initialized = false;

function initSendGrid(config) {
  const apiKey = config.integrations.sendgrid.apiKey;

  if (!apiKey) {
    console.warn('⚠️  SendGrid API key missing - Email disabled');
    return false;
  }

  sgMail.setApiKey(apiKey);
  initialized = true;
  console.log('✅ SendGrid initialized');
  return true;
}

async function sendEmail({ to, subject, text, html, attachments = [] }) {
  try {
    if (!initialized) {
      console.log('📧 [TEST MODE] Email to', to);
      console.log('   Subject:', subject);
      console.log('   Body:', text || html?.substring(0, 100));
      return { success: true, test: true };
    }

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'offers@velocityrealestate.ca',
        name: 'Velocity Real Estate'
      },
      subject,
      text,
      html,
      attachments: attachments.map(att => ({
        content: att.content?.toString('base64'),
        filename: att.filename,
        type: att.type || 'application/pdf',
        disposition: 'attachment'
      }))
    };

    const result = await sgMail.send(msg);

    console.log(`✅ Email sent to ${to}: ${subject}`);
    return { success: true, messageId: result[0].headers['x-message-id'] };

  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { initSendGrid, sendEmail };
