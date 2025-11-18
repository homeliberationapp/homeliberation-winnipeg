// ═══════════════════════════════════════════════════════════
// AUTOMATIC CREDENTIAL UPDATER
// Updates .env with Twilio and OpenAI credentials
// ═══════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

function updateCredentials(credentials) {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    console.log('\n🔄 Updating credentials...\n');

    // Update Twilio credentials
    if (credentials.TWILIO_ACCOUNT_SID) {
        envContent = envContent.replace(
            /TWILIO_ACCOUNT_SID=.*/,
            `TWILIO_ACCOUNT_SID=${credentials.TWILIO_ACCOUNT_SID}`
        );
        console.log('✅ Updated: TWILIO_ACCOUNT_SID');
    }

    if (credentials.TWILIO_AUTH_TOKEN) {
        envContent = envContent.replace(
            /TWILIO_AUTH_TOKEN=.*/,
            `TWILIO_AUTH_TOKEN=${credentials.TWILIO_AUTH_TOKEN}`
        );
        console.log('✅ Updated: TWILIO_AUTH_TOKEN');
    }

    if (credentials.TWILIO_PHONE_NUMBER) {
        envContent = envContent.replace(
            /TWILIO_PHONE_NUMBER=.*/,
            `TWILIO_PHONE_NUMBER=${credentials.TWILIO_PHONE_NUMBER}`
        );
        console.log('✅ Updated: TWILIO_PHONE_NUMBER');
    }

    // Update OpenAI credential
    if (credentials.OPENAI_API_KEY) {
        // Check if OPENAI_API_KEY exists in .env
        if (envContent.includes('OPENAI_API_KEY=')) {
            envContent = envContent.replace(
                /OPENAI_API_KEY=.*/,
                `OPENAI_API_KEY=${credentials.OPENAI_API_KEY}`
            );
        } else {
            // Add it after Gmail section
            envContent = envContent.replace(
                /(GMAIL_APP_PASSWORD=.*\n)/,
                `$1\n# ───────────────────────────────────────────────────────────\n# OPENAI (AI Lead Scoring)\n# ───────────────────────────────────────────────────────────\n\nOPENAI_API_KEY=${credentials.OPENAI_API_KEY}\n`
            );
        }
        console.log('✅ Updated: OPENAI_API_KEY');
    }

    // Write updated .env
    fs.writeFileSync(envPath, envContent);
    console.log('\n💾 .env file updated successfully!');
    console.log('\n🔄 Restart enhanced-form-handler.js to apply changes.\n');

    return true;
}

// Example usage (called from Claude)
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
═══════════════════════════════════════════════════════════
CREDENTIAL UPDATER
═══════════════════════════════════════════════════════════

Usage:
node update-credentials.js <param>=<value> [<param>=<value> ...]

Examples:
node update-credentials.js TWILIO_ACCOUNT_SID=ACxxxx TWILIO_AUTH_TOKEN=xxxxx
node update-credentials.js OPENAI_API_KEY=sk-proj-xxxxx
node update-credentials.js TWILIO_ACCOUNT_SID=ACxxxx OPENAI_API_KEY=sk-xxxxx

Available Parameters:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- OPENAI_API_KEY
        `);
        process.exit(0);
    }

    const credentials = {};
    args.forEach(arg => {
        const [key, value] = arg.split('=');
        if (key && value) {
            credentials[key] = value;
        }
    });

    updateCredentials(credentials);
}

module.exports = { updateCredentials };
