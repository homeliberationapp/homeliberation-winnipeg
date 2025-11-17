// ═══════════════════════════════════════════════════════════
// FORM HANDLER - Complete Lead Capture System
// Works standalone without Google Forms
// ═══════════════════════════════════════════════════════════

const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// CORS for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Lead storage directory
const LEADS_DIR = path.join(__dirname, 'leads');

// Ensure leads directory exists
async function ensureLeadsDir() {
    try {
        await fs.mkdir(LEADS_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating leads directory:', error);
    }
}

// Calculate lead score (AI-like scoring)
function calculateLeadScore(data) {
    let score = 0;

    // Property condition scoring
    if (data.condition) {
        if (data.condition.includes('Very Poor')) score += 150;
        else if (data.condition.includes('Poor')) score += 120;
        else if (data.condition.includes('Fair')) score += 80;
        else if (data.condition.includes('Good')) score += 40;
    }

    // Timeline urgency
    if (data.timeline === 'Immediately (1-7 days)') score += 100;
    else if (data.timeline === '1-2 weeks') score += 80;
    else if (data.timeline === '2-4 weeks') score += 60;
    else if (data.timeline === '30-60 days') score += 40;

    // Reason for selling
    if (data.reason && (data.reason.includes('Foreclosure') || data.reason.includes('Behind on payments'))) score += 100;
    if (data.reason && data.reason.includes('Inherited')) score += 70;
    if (data.reason && data.reason.includes('Major repairs')) score += 80;
    if (data.reason && data.reason.includes('Divorce')) score += 60;

    // Mortgage status
    if (data.mortgageStatus && data.mortgageStatus.includes('behind')) score += 80;
    if (data.mortgageStatus && data.mortgageStatus.includes('foreclosure')) score += 100;

    // Cap at 600
    return Math.min(score, 600);
}

// Determine priority level
function getPriorityLevel(score) {
    if (score >= 400) return 'HOT';
    if (score >= 300) return 'WARM';
    if (score >= 200) return 'LUKEWARM';
    return 'COLD';
}

// POST /api/leads - Handle form submissions
app.post('/api/leads', async (req, res) => {
    try {
        console.log('📨 New lead submission received');

        const leadData = {
            ...req.body,
            timestamp: new Date().toISOString(),
            id: `LEAD_${Date.now()}`
        };

        // Calculate score
        leadData.score = calculateLeadScore(leadData);
        leadData.priority = getPriorityLevel(leadData.score);

        console.log(`📊 Lead scored: ${leadData.score}/600 (${leadData.priority})`);

        // Save to JSON file
        const leadFile = path.join(LEADS_DIR, `${leadData.id}.json`);
        await fs.writeFile(leadFile, JSON.stringify(leadData, null, 2));
        console.log(`💾 Lead saved: ${leadFile}`);

        // Update leads index
        await updateLeadsIndex(leadData);

        // Send email notification
        await sendEmailNotification(leadData);

        res.json({
            success: true,
            leadId: leadData.id,
            score: leadData.score,
            priority: leadData.priority,
            message: 'Thank you! We will contact you within 24 hours.'
        });

    } catch (error) {
        console.error('❌ Error processing lead:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit form. Please try again.'
        });
    }
});

// Update leads index file
async function updateLeadsIndex(newLead) {
    try {
        const indexFile = path.join(LEADS_DIR, '_index.json');
        let index = { leads: [], lastUpdated: null };

        // Read existing index
        try {
            const existing = await fs.readFile(indexFile, 'utf8');
            index = JSON.parse(existing);
        } catch (error) {
            // File doesn't exist yet, use empty index
        }

        // Add new lead summary
        index.leads.unshift({
            id: newLead.id,
            name: `${newLead.firstName} ${newLead.lastName}`,
            email: newLead.email,
            phone: newLead.phone,
            address: newLead.propertyAddress,
            score: newLead.score,
            priority: newLead.priority,
            timestamp: newLead.timestamp
        });

        // Keep only last 1000 leads in index
        if (index.leads.length > 1000) {
            index.leads = index.leads.slice(0, 1000);
        }

        index.lastUpdated = new Date().toISOString();
        index.totalLeads = index.leads.length;
        index.hotLeads = index.leads.filter(l => l.priority === 'HOT').length;
        index.warmLeads = index.leads.filter(l => l.priority === 'WARM').length;

        await fs.writeFile(indexFile, JSON.stringify(index, null, 2));
        console.log('📇 Leads index updated');

    } catch (error) {
        console.error('Error updating index:', error);
    }
}

// Send email notification
async function sendEmailNotification(lead) {
    try {
        const priorityEmoji = {
            'HOT': '🔥🔥🔥',
            'WARM': '🔥🔥',
            'LUKEWARM': '🔥',
            'COLD': '❄️'
        };

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0f2240 0%, #d4af37 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🏠 New Lead Received!</h1>
                </div>

                <div style="background: #f5f5f5; padding: 30px;">
                    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <h2 style="color: #0f2240; margin-top: 0;">
                            ${priorityEmoji[lead.priority]} ${lead.priority} PRIORITY LEAD
                        </h2>
                        <p style="font-size: 24px; color: #d4af37; font-weight: bold; margin: 10px 0;">
                            Score: ${lead.score}/600
                        </p>
                    </div>

                    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <h3 style="color: #0f2240; margin-top: 0;">Contact Information</h3>
                        <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
                        <p><strong>Phone:</strong> <a href="tel:${lead.phone}">${lead.phone}</a></p>
                        <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
                        <p><strong>Best Time to Call:</strong> ${lead.bestTimeToCall || 'Anytime'}</p>
                    </div>

                    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <h3 style="color: #0f2240; margin-top: 0;">Property Details</h3>
                        <p><strong>Address:</strong> ${lead.propertyAddress || 'Not provided'}</p>
                        <p><strong>Type:</strong> ${lead.propertyType || 'Not specified'}</p>
                        <p><strong>Bedrooms:</strong> ${lead.bedrooms || 'N/A'}</p>
                        <p><strong>Bathrooms:</strong> ${lead.bathrooms || 'N/A'}</p>
                        <p><strong>Condition:</strong> ${lead.condition || 'Not specified'}</p>
                    </div>

                    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <h3 style="color: #0f2240; margin-top: 0;">Situation</h3>
                        <p><strong>Reason for Selling:</strong> ${lead.reason || 'Not specified'}</p>
                        <p><strong>Timeline:</strong> ${lead.timeline || 'Not specified'}</p>
                        <p><strong>Mortgage Status:</strong> ${lead.mortgageStatus || 'Not specified'}</p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #666; font-size: 12px;">
                            Lead ID: ${lead.id}<br>
                            Received: ${new Date(lead.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        `;

        const mailOptions = {
            from: `"Home Liberation Winnipeg" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject: `${priorityEmoji[lead.priority]} ${lead.priority} LEAD: ${lead.firstName} ${lead.lastName} (${lead.score}/600)`,
            html: emailHtml
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email notification sent');

    } catch (error) {
        console.error('❌ Email send failed:', error.message);
        // Don't throw - lead is still saved even if email fails
    }
}

// GET /api/leads - View all leads
app.get('/api/leads', async (req, res) => {
    try {
        const indexFile = path.join(LEADS_DIR, '_index.json');
        const data = await fs.readFile(indexFile, 'utf8');
        const index = JSON.parse(data);
        res.json(index);
    } catch (error) {
        res.json({ leads: [], totalLeads: 0, hotLeads: 0, warmLeads: 0 });
    }
});

// GET /api/leads/:id - View specific lead
app.get('/api/leads/:id', async (req, res) => {
    try {
        const leadFile = path.join(LEADS_DIR, `${req.params.id}.json`);
        const data = await fs.readFile(leadFile, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(404).json({ error: 'Lead not found' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Home Liberation Form Handler',
        emailConfigured: !!process.env.GMAIL_APP_PASSWORD
    });
});

// Start server
async function start() {
    await ensureLeadsDir();

    app.listen(PORT, () => {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('   🏠 HOME LIBERATION - FORM HANDLER ACTIVE');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`✅ Form endpoint: http://localhost:${PORT}/api/leads`);
        console.log(`✅ Leads stored in: ${LEADS_DIR}`);
        console.log(`✅ Email notifications: ${process.env.GMAIL_USER}`);
        console.log('\n📋 Ready to receive leads!\n');
    });
}

start().catch(console.error);

module.exports = app;
