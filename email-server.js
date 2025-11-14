const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { saveToSheets } = require('./form-to-sheets');
const { getLeads, getLeadStats, getHighPriorityLeads } = require('./sheets-to-admin');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5678;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support large photo uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure email transport (using Gmail SMTP)
// IMPORTANT: You need to set up an App Password for homeliberationapp@gmail.com
// Go to: Google Account > Security > 2-Step Verification > App Passwords
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'homeliberationapp@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'YOUR_APP_PASSWORD_HERE' // Replace with actual app password
    }
});

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
    if (error) {
        console.error('⚠️  Email configuration error:', error.message);
        console.error('   Make sure GMAIL_APP_PASSWORD is set in .env file');
    } else {
        console.log('✅ Email server ready to send emails');
    }
});

// Webhook endpoint to receive form submissions
app.post('/webhook/property-lead', async (req, res) => {
    console.log('\n📬 NEW FORM SUBMISSION RECEIVED');
    console.log('Timestamp:', new Date().toISOString());

    try {
        const formData = req.body;

        // Log received data (without sensitive info in production)
        console.log('Form data keys:', Object.keys(formData));
        console.log('Name:', formData.fullName);
        console.log('Email:', formData.email);
        console.log('Phone:', formData.phone);
        console.log('Photos:', formData.photo_count || 0);

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
                        <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Year Built:</td><td style="padding: 8px 0; color: #1e293b;">${formData.yearBuilt || 'N/A'}</td></tr>
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

                    ${formData.photo_count && formData.photo_count > 0 ? `
                    <h2 style="color: #1e293b; font-size: 18px; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 20px;">📷 Property Photos</h2>
                    <p style="color: #666; margin-bottom: 20px;"><strong>${formData.photo_count} photo(s)</strong> were uploaded with this submission.</p>
                    ` : ''}

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #999; font-size: 12px;">
                        <p>📧 Sent via Velocity Real Estate / Home Liberation Winnipeg</p>
                        <p>Source: ${formData.source || 'Website Consultation Form'}</p>
                    </div>
                </div>
            </div>
        `;

        // Email options
        const mailOptions = {
            from: '"Velocity Real Estate Website" <homeliberationapp@gmail.com>',
            to: 'homeliberationapp@gmail.com',
            subject: `🏠 New Property Lead: ${formData.fullName} - ${formData.address || formData.city || 'Winnipeg'}`,
            html: emailHtml,
            replyTo: formData.email
        };

        // Add photos as attachments if provided
        if (formData.photos && Array.isArray(formData.photos) && formData.photos.length > 0) {
            mailOptions.attachments = formData.photos.map((photo, index) => ({
                filename: photo.filename || `property-photo-${index + 1}.jpg`,
                content: photo.data.split('base64,')[1], // Extract base64 data
                encoding: 'base64'
            }));
            console.log(`📎 Attaching ${mailOptions.attachments.length} photos`);
        }

        // Send email
        console.log('📤 Sending email to homeliberationapp@gmail.com...');
        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Form submitted successfully. Email sent to homeliberationapp@gmail.com',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ ERROR sending email:', error);
        console.error('Error details:', error.message);

        // Send error response
        res.status(500).json({
            success: false,
            message: 'Failed to process form submission',
            error: error.message
        });
    }
});

// Consultation form endpoint with Google Sheets integration
app.post('/api/submit-consultation', async (req, res) => {
    console.log('\n📋 NEW CONSULTATION FORM SUBMISSION');
    console.log('Timestamp:', new Date().toISOString());

    try {
        const formData = req.body;

        // Log received data
        console.log('Name:', `${formData.first_name} ${formData.last_name}`);
        console.log('Email:', formData.email);
        console.log('Property:', formData.address);

        // Save to Google Sheets with lead scoring
        let sheetResult;
        try {
            sheetResult = await saveToSheets(formData);
            console.log('✅ Saved to Google Sheets with lead score:', sheetResult);
        } catch (sheetError) {
            console.error('⚠️  Google Sheets save failed:', sheetError.message);
            // Continue with email even if Sheets fails
        }

        // Build comprehensive email
        let emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #d4af37; margin-bottom: 10px;">🏢 New Property Analysis Request</h1>
                    ${sheetResult ? `<p style="background: #10b981; color: white; padding: 10px; border-radius: 5px; font-weight: bold;">Lead Score: ${sheetResult.leadScore || 'N/A'}/100</p>` : ''}

                    <h2 style="color: #0f2240; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Contact Information</h2>
                    <table style="width: 100%; margin-bottom: 20px;">
                        <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td>${formData.first_name} ${formData.last_name}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${formData.email}">${formData.email}</a></td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:${formData.phone}">${formData.phone}</a></td></tr>
                    </table>

                    <h2 style="color: #0f2240; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Property Details</h2>
                    <table style="width: 100%; margin-bottom: 20px;">
                        <tr><td style="padding: 8px 0; font-weight: bold;">Address:</td><td>${formData.address || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Property Type:</td><td>${formData.property_type || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Year Built:</td><td>${formData.year_built || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Bedrooms:</td><td>${formData.bedrooms || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Bathrooms:</td><td>${formData.bathrooms || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Square Feet:</td><td>${formData.square_feet || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Condition:</td><td>${formData.condition || 'N/A'}</td></tr>
                    </table>

                    <h2 style="color: #0f2240; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Situation & Timeline</h2>
                    <table style="width: 100%; margin-bottom: 20px;">
                        <tr><td style="padding: 8px 0; font-weight: bold;">Situation:</td><td>${formData.situation || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Occupancy:</td><td>${formData.occupancy || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Mortgage Status:</td><td>${formData.mortgage_status || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Timeline:</td><td>${formData.timeline || 'N/A'}</td></tr>
                    </table>

                    <h2 style="color: #0f2240; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Financial Details</h2>
                    <table style="width: 100%; margin-bottom: 20px;">
                        <tr><td style="padding: 8px 0; font-weight: bold;">Mortgage Balance:</td><td>$${formData.mortgage_balance || '0'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Liens:</td><td>$${formData.liens || '0'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Back Taxes:</td><td>$${formData.back_taxes || '0'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Asking Price:</td><td>$${formData.asking_price || 'N/A'}</td></tr>
                    </table>

                    ${formData.additional_details ? `
                    <h2 style="color: #0f2240; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Additional Details</h2>
                    <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #d4af37;">${formData.additional_details}</p>
                    ` : ''}

                    <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
                        <p style="margin: 0; color: #0f2240;"><strong>📊 Google Sheets:</strong> ${sheetResult ? '✅ Saved successfully' : '⚠️ Save failed - check logs'}</p>
                        <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
                    </div>
                </div>
            </div>
        `;

        // Send email
        const mailOptions = {
            from: '"Home Liberation Winnipeg" <homeliberationapp@gmail.com>',
            to: 'homeliberationapp@gmail.com',
            subject: `🏢 Property Analysis: ${formData.property_type || 'Property'} - ${formData.address}`,
            html: emailHtml,
            replyTo: formData.email
        };

        console.log('📤 Sending email notification...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');

        res.status(200).json({
            success: true,
            message: 'Consultation submitted successfully',
            sheetsSaved: !!sheetResult
        });

    } catch (error) {
        console.error('❌ ERROR processing consultation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process consultation',
            error: error.message
        });
    }
});

// Admin API - Get all leads
app.get('/api/admin/leads', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const sortBy = req.query.sort || 'timestamp';

        const leads = await getLeads(limit, sortBy);

        res.json({
            success: true,
            count: leads.length,
            leads
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Admin API - Get lead statistics
app.get('/api/admin/stats', async (req, res) => {
    try {
        const stats = await getLeadStats();

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Admin API - Get high priority leads
app.get('/api/admin/priority-leads', async (req, res) => {
    try {
        const leads = await getHighPriorityLeads();

        res.json({
            success: true,
            count: leads.length,
            leads
        });
    } catch (error) {
        console.error('Error fetching priority leads:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'running',
        message: 'Email server is operational',
        email: 'homeliberationapp@gmail.com'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 EMAIL SERVER STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📬 Listening on http://localhost:${PORT}`);
    console.log(`📧 Emails will be sent to: homeliberationapp@gmail.com`);
    console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook/property-lead`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Set GMAIL_APP_PASSWORD environment variable');
    console.log('   or edit this file to add your Gmail App Password\n');
});
