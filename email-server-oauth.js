const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5678;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// OAuth2 Configuration (using your existing Google OAuth credentials)
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground' // Redirect URL
    );

    // For Gmail API, we'll use nodemailer with OAuth2
    // This uses the OAuth credentials you already configured
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.GMAIL_USER || 'homeliberationapp@gmail.com',
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN, // We'll get this
            accessToken: process.env.GMAIL_ACCESS_TOKEN // Optional
        }
    });

    return transporter;
};

// Simple SMTP fallback (no authentication required for testing)
const createSimpleTransporter = () => {
    return nodemailer.createTransporter({
        host: 'localhost',
        port: 1025,
        secure: false,
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Webhook endpoint
app.post('/webhook/property-lead', async (req, res) => {
    console.log('\n📬 NEW FORM SUBMISSION RECEIVED');
    console.log('Timestamp:', new Date().toISOString());

    try {
        const formData = req.body;

        console.log('Form data:', JSON.stringify(formData, null, 2));

        // Build HTML email
        let emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #f97316;">🏠 New Property Lead</h1>
                <h2>Contact Information</h2>
                <p><strong>Name:</strong> ${formData.fullName || 'N/A'}</p>
                <p><strong>Email:</strong> ${formData.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${formData.phone || 'N/A'}</p>

                <h2>Property Details</h2>
                <p><strong>Address:</strong> ${formData.address || 'N/A'}</p>
                <p><strong>City:</strong> ${formData.city || 'N/A'}</p>
                <p><strong>Type:</strong> ${formData.propertyType || 'N/A'}</p>

                <h2>Situation</h2>
                <p><strong>Reason:</strong> ${formData.sellReason || 'N/A'}</p>
                <p><strong>Timeline:</strong> ${formData.timeline || 'N/A'}</p>
                <p><strong>Condition:</strong> ${formData.propertyCondition || 'N/A'}</p>
            </div>
        `;

        // For now, just log the email (we'll enable sending once OAuth is fully set up)
        console.log('\n📧 EMAIL CONTENT:');
        console.log('To: homeliberationapp@gmail.com');
        console.log('Subject: New Property Lead');
        console.log('Body length:', emailHtml.length, 'characters');

        // Save to file as backup
        const fs = require('fs');
        const timestamp = Date.now();
        const filename = `./leads/lead-${timestamp}.json`;

        // Create leads directory if it doesn't exist
        if (!fs.existsSync('./leads')) {
            fs.mkdirSync('./leads');
        }

        fs.writeFileSync(filename, JSON.stringify(formData, null, 2));
        console.log(`✅ Lead saved to: ${filename}`);

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Form submitted successfully. Lead saved locally.',
            leadId: timestamp
        });

    } catch (error) {
        console.error('❌ ERROR processing form:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process form submission',
            error: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'running',
        message: 'Email server operational (Lead capture mode)',
        email: 'homeliberationapp@gmail.com',
        mode: 'file-based-storage'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 EMAIL SERVER STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📬 Listening on http://localhost:${PORT}`);
    console.log(`📧 Email: homeliberationapp@gmail.com`);
    console.log(`🔗 Webhook: http://localhost:${PORT}/webhook/property-lead`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);
    console.log(`💾 Mode: Saving leads to ./leads/ folder`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Leads will be saved as JSON files');
    console.log('📧 Email sending will be enabled after OAuth setup\n');
});
