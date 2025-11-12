const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5678;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'homeliberationapp@gmail.com';

if (SENDGRID_API_KEY && SENDGRID_API_KEY !== 'SG.your-sendgrid-api-key') {
    sgMail.setApiKey(SENDGRID_API_KEY);
    console.log('✅ SendGrid configured');
} else {
    console.log('⚠️  SendGrid API key not configured');
    console.log('   Set SENDGRID_API_KEY in .env file');
}

// Webhook endpoint to receive form submissions
app.post('/webhook/property-lead', async (req, res) => {
    console.log('\n📬 NEW FORM SUBMISSION RECEIVED');
    console.log('Timestamp:', new Date().toISOString());

    try {
        const formData = req.body;

        // Log received data
        console.log('Form data keys:', Object.keys(formData));
        console.log('Name:', formData.fullName);
        console.log('Email:', formData.email);
        console.log('Phone:', formData.phone);

        // Build HTML email content
        let emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #f97316; margin-bottom: 20px;">🏠 New Property Lead</h1>
                    <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
                        Received: ${new Date(formData.timestamp || Date.now()).toLocaleString('en-CA', { timeZone: 'America/Winnipeg' })} CST
                    </p>

                    <h2 style="color: #1e293b; font-size: 18px; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 20px;">Contact Information</h2>
                    <table style="width: 100%; margin-bottom: 30px;">
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Name:</td><td style="padding: 8px 0; color: #1e293b;">${formData.fullName || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Email:</td><td style="padding: 8px 0; color: #1e293b;"><a href="mailto:${formData.email}">${formData.email || 'N/A'}</a></td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Phone:</td><td style="padding: 8px 0; color: #1e293b;"><a href="tel:${formData.phone}">${formData.phone || 'N/A'}</a></td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Best Time:</td><td style="padding: 8px 0; color: #1e293b;">${formData.preferredContact || 'N/A'}</td></tr>
                    </table>

                    <h2 style="color: #1e293b; font-size: 18px; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 20px;">Property Details</h2>
                    <table style="width: 100%; margin-bottom: 30px;">
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Address:</td><td style="padding: 8px 0; color: #1e293b;">${formData.address || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">City:</td><td style="padding: 8px 0; color: #1e293b;">${formData.city || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Postal Code:</td><td style="padding: 8px 0; color: #1e293b;">${formData.postalCode || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Property Type:</td><td style="padding: 8px 0; color: #1e293b;">${formData.propertyType || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Bedrooms:</td><td style="padding: 8px 0; color: #1e293b;">${formData.bedrooms || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Bathrooms:</td><td style="padding: 8px 0; color: #1e293b;">${formData.bathrooms || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Square Feet:</td><td style="padding: 8px 0; color: #1e293b;">${formData.squareFeet || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight bold;">Year Built:</td><td style="padding: 8px 0; color: #1e293b;">${formData.yearBuilt || 'N/A'}</td></tr>
                    </table>

                    <h2 style="color: #1e293b; font-size: 18px; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 20px;">Situation</h2>
                    <table style="width: 100%; margin-bottom: 30px;">
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Reason:</td><td style="padding: 8px 0; color: #1e293b;">${formData.sellReason || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Timeline:</td><td style="padding: 8px 0; color: #1e293b;">${formData.timeline || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Condition:</td><td style="padding: 8px 0; color: #1e293b;">${formData.propertyCondition || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Mortgage:</td><td style="padding: 8px 0; color: #1e293b;">${formData.hasMortgage || 'N/A'}</td></tr>
                        ${formData.mortgageBalance ? `<tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Mortgage Balance:</td><td style="padding: 8px 0; color: #1e293b;">$${formData.mortgageBalance}</td></tr>` : ''}
                        ${formData.priceExpectation ? `<tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Expected Price:</td><td style="padding: 8px 0; color: #1e293b;">$${formData.priceExpectation}</td></tr>` : ''}
                    </table>

                    ${formData.repairsNeeded ? `
                    <h2 style="color: #1e293b; font-size: 18px; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 20px;">Repairs Needed</h2>
                    <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #f97316; margin-bottom: 30px; color: #1e293b;">${formData.repairsNeeded}</p>
                    ` : ''}

                    ${formData.additionalInfo ? `
                    <h2 style="color: #1e293b; font-size: 18px; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 20px;">Additional Information</h2>
                    <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #f97316; margin-bottom: 30px; color: #1e293b;">${formData.additionalInfo}</p>
                    ` : ''}

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #999; font-size: 12px;">
                        <p>📧 Sent via Home Liberation Winnipeg</p>
                        <p>Source: ${formData.source || 'Website Consultation Form'}</p>
                    </div>
                </div>
            </div>
        `;

        // SendGrid email message
        const msg = {
            to: FROM_EMAIL, // Send to your email
            from: FROM_EMAIL, // Must be a verified sender in SendGrid
            subject: `🏠 New Property Lead: ${formData.fullName} - ${formData.address || formData.city || 'Winnipeg'}`,
            html: emailHtml,
            replyTo: formData.email
        };

        // Send email via SendGrid
        console.log('📤 Sending email via SendGrid...');
        await sgMail.send(msg);

        console.log('✅ Email sent successfully via SendGrid!');

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Form submitted successfully. Email sent.',
            provider: 'SendGrid'
        });

    } catch (error) {
        console.error('❌ ERROR sending email:', error);
        console.error('Error details:', error.message);

        if (error.response) {
            console.error('SendGrid error:', error.response.body);
        }

        // Send error response
        res.status(500).json({
            success: false,
            message: 'Failed to process form submission',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'running',
        message: 'Email server is operational (SendGrid)',
        email: FROM_EMAIL,
        provider: 'SendGrid'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 EMAIL SERVER STARTED (SendGrid)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📬 Listening on http://localhost:${PORT}`);
    console.log(`📧 Emails will be sent to: ${FROM_EMAIL}`);
    console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook/property-lead`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`📮 Provider: SendGrid`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'SG.your-sendgrid-api-key') {
        console.log('\n⚠️  IMPORTANT: Set SENDGRID_API_KEY environment variable in .env file\n');
    }
});
