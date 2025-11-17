// ═══════════════════════════════════════════════════════════
// GMAIL OAuth2 SETUP - No App Password Needed!
// Alternative solution when App Passwords not available
// ═══════════════════════════════════════════════════════════

const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

// OAuth2 credentials (already in your .env)
const OAuth2 = google.auth.OAuth2;

async function createOAuth2Transporter() {
    try {
        const oauth2Client = new OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground' // Redirect URL
        );

        // Set refresh token (we'll get this in a moment)
        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        // Get access token
        const accessToken = await oauth2Client.getAccessToken();

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.GMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                accessToken: accessToken.token
            }
        });

        console.log('✅ Gmail OAuth2 transporter created');
        return transporter;

    } catch (error) {
        console.error('❌ OAuth2 setup failed:', error.message);
        console.log('💡 Using basic Gmail authentication as fallback');

        // Fallback to basic auth
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    }
}

// Function to get refresh token (one-time setup)
async function getRefreshToken() {
    const oauth2Client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://mail.google.com/']
    });

    console.log('\n🔐 OAuth2 SETUP REQUIRED\n');
    console.log('1. Visit this URL in your browser:');
    console.log(authUrl);
    console.log('\n2. Sign in with: homeliberationapp@gmail.com');
    console.log('3. Click "Allow"');
    console.log('4. You\'ll get a code - paste it here\n');

    // In practice, you'd get the code and exchange it
    // For now, we'll use the refresh token once obtained
}

module.exports = { createOAuth2Transporter, getRefreshToken };

/*
═══════════════════════════════════════════════════════════
QUICK SETUP INSTRUCTIONS:
═══════════════════════════════════════════════════════════

OPTION 1: Get Refresh Token (One-time, 2 minutes)
1. Run: node email-oauth2.js
2. Open the URL it shows
3. Sign in and authorize
4. Copy the refresh token to .env:
   GOOGLE_REFRESH_TOKEN=your_refresh_token

OPTION 2: Use OAuth Playground (Easier)
1. Go to: https://developers.google.com/oauthplayground
2. Click gear icon (⚙️) top right
3. Check "Use your own OAuth credentials"
4. Enter:
   Client ID: (from your .env GOOGLE_CLIENT_ID)
   Client Secret: (from your .env GOOGLE_CLIENT_SECRET)
5. Close settings
6. On left side, select "Gmail API v1"
7. Expand and check: https://mail.google.com/
8. Click "Authorize APIs"
9. Sign in with homeliberationapp@gmail.com
10. Click "Allow"
11. Click "Exchange authorization code for tokens"
12. Copy the "Refresh token"
13. Add to .env:
    GOOGLE_REFRESH_TOKEN=1//your_very_long_refresh_token

═══════════════════════════════════════════════════════════
THEN:
Update enhanced-form-handler.js line 16 to use this instead:
const { createOAuth2Transporter } = require('./email-oauth2');
const transporter = await createOAuth2Transporter();
═══════════════════════════════════════════════════════════
*/
