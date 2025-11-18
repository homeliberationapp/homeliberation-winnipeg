// ═══════════════════════════════════════════════════════════
// ENHANCED FORM HANDLER - With SMS, OpenAI, and Advanced Features
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
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Twilio setup (optional)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    try {
        const twilio = require('twilio');
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('✅ Twilio SMS enabled');
    } catch (error) {
        console.log('⚠️  Twilio setup failed - SMS disabled');
    }
} else {
    console.log('⚠️  Twilio not configured - SMS disabled');
}

// OpenAI setup (optional)
let openaiEnabled = false;
let OpenAI = null;
let openai = null;

if (process.env.OPENAI_API_KEY) {
    try {
        OpenAI = require('openai').default;
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        openaiEnabled = true;
        console.log('✅ OpenAI enabled - AI scoring active');
    } catch (error) {
        console.log('⚠️  OpenAI package not installed - using rule-based scoring');
    }
} else {
    console.log('⚠️  OpenAI not configured - using rule-based scoring');
}

const LEADS_DIR = path.join(__dirname, 'leads');

async function ensureLeadsDir() {
    try {
        await fs.mkdir(LEADS_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating leads directory:', error);
    }
}

// Enhanced AI-powered lead scoring
async function calculateLeadScore(data) {
    if (openaiEnabled) {
        return await aiScore(data);
    } else {
        return ruleBasedScore(data);
    }
}

// AI-powered scoring using OpenAI
async function aiScore(data) {
    try {
        const prompt = `You are a real estate investment expert. Score this property lead from 0-600 based on urgency and profitability.

Property Details:
- Condition: ${data.condition}
- Reason for selling: ${data.reason}
- Timeline: ${data.timeline}
- Mortgage status: ${data.mortgageStatus}
- Property type: ${data.propertyType}

Scoring criteria:
- Very poor condition + foreclosure + immediate timeline = 500-600 (HOT)
- Major repairs + urgent timeline = 400-500 (HOT)
- Fair condition + moderate urgency = 300-400 (WARM)
- Good condition + flexible timeline = 200-300 (LUKEWARM)
- Excellent condition + no urgency = 0-200 (COLD)

Return ONLY a JSON object with: {"score": number, "reasoning": "brief explanation"}`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 150
        });

        const result = JSON.parse(response.choices[0].message.content);
        console.log(`🤖 AI Score: ${result.score}/600 - ${result.reasoning}`);

        return {
            score: Math.min(600, Math.max(0, result.score)),
            aiReasoning: result.reasoning,
            scoringMethod: 'AI'
        };
    } catch (error) {
        console.error('AI scoring failed, using rule-based fallback:', error.message);
        return ruleBasedScore(data);
    }
}

// Rule-based scoring (fallback)
function ruleBasedScore(data) {
    let score = 0;

    // Condition scoring
    if (data.condition?.includes('Very Poor')) score += 150;
    else if (data.condition?.includes('Poor')) score += 120;
    else if (data.condition?.includes('Fair')) score += 80;
    else if (data.condition?.includes('Good')) score += 40;

    // Timeline urgency
    if (data.timeline === 'Immediately (1-7 days)') score += 100;
    else if (data.timeline === '1-2 weeks') score += 80;
    else if (data.timeline === '2-4 weeks') score += 60;
    else if (data.timeline === '30-60 days') score += 40;

    // Reason for selling
    if (data.reason?.includes('Foreclosure') || data.reason?.includes('Behind on payments')) score += 100;
    if (data.reason?.includes('Inherited')) score += 70;
    if (data.reason?.includes('Major repairs')) score += 80;
    if (data.reason?.includes('Divorce')) score += 60;

    // Mortgage status
    if (data.mortgageStatus?.includes('behind')) score += 80;
    if (data.mortgageStatus?.includes('foreclosure')) score += 100;

    return {
        score: Math.min(600, score),
        scoringMethod: 'Rule-Based'
    };
}

function getPriorityLevel(score) {
    if (score >= 400) return 'HOT';
    if (score >= 300) return 'WARM';
    if (score >= 200) return 'LUKEWARM';
    return 'COLD';
}

// Send SMS notification (if Twilio configured)
async function sendSMS(lead) {
    if (!twilioClient) return;

    if (lead.priority !== 'HOT') return; // Only send SMS for HOT leads

    try {
        const message = `🔥 HOT LEAD ALERT!\n${lead.firstName} ${lead.lastName}\nScore: ${lead.score}/600\n📍 ${lead.propertyAddress}\nCall: ${lead.phone}`;

        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.TWILIO_PHONE_NUMBER // Send to yourself
        });

        console.log('📱 SMS sent for HOT lead');
    } catch (error) {
        console.error('❌ SMS failed:', error.message);
    }
}

// POST /api/leads
app.post('/api/leads', async (req, res) => {
    try {
        console.log('📨 New lead submission received');

        const leadData = {
            ...req.body,
            timestamp: new Date().toISOString(),
            id: `LEAD_${Date.now()}`
        };

        // Calculate score (AI or rule-based)
        const scoreResult = await calculateLeadScore(leadData);
        leadData.score = scoreResult.score;
        leadData.priority = getPriorityLevel(scoreResult.score);
        leadData.scoringMethod = scoreResult.scoringMethod;

        if (scoreResult.aiReasoning) {
            leadData.aiReasoning = scoreResult.aiReasoning;
        }

        console.log(`📊 Lead scored: ${leadData.score}/600 (${leadData.priority}) [${scoreResult.scoringMethod}]`);

        // Save to file
        const leadFile = path.join(LEADS_DIR, `${leadData.id}.json`);
        await fs.writeFile(leadFile, JSON.stringify(leadData, null, 2));
        console.log(`💾 Lead saved: ${leadFile}`);

        // Update index
        await updateLeadsIndex(leadData);

        // Send email notification
        await sendEmailNotification(leadData);

        // Send SMS for HOT leads (if configured)
        await sendSMS(leadData);

        res.json({
            success: true,
            leadId: leadData.id,
            score: leadData.score,
            priority: leadData.priority,
            scoringMethod: scoreResult.scoringMethod,
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

async function updateLeadsIndex(newLead) {
    try {
        const indexFile = path.join(LEADS_DIR, '_index.json');
        let index = { leads: [], lastUpdated: null };

        try {
            const existing = await fs.readFile(indexFile, 'utf8');
            index = JSON.parse(existing);
        } catch (error) {
            // File doesn't exist yet
        }

        index.leads.unshift({
            id: newLead.id,
            name: `${newLead.firstName} ${newLead.lastName}`,
            email: newLead.email,
            phone: newLead.phone,
            address: newLead.propertyAddress,
            score: newLead.score,
            priority: newLead.priority,
            timestamp: newLead.timestamp,
            scoringMethod: newLead.scoringMethod
        });

        if (index.leads.length > 1000) {
            index.leads = index.leads.slice(0, 1000);
        }

        index.lastUpdated = new Date().toISOString();
        index.totalLeads = index.leads.length;
        index.hotLeads = index.leads.filter(l => l.priority === 'HOT').length;
        index.warmLeads = index.leads.filter(l => l.priority === 'WARM').length;
        index.aiScoredLeads = index.leads.filter(l => l.scoringMethod === 'AI').length;

        await fs.writeFile(indexFile, JSON.stringify(index, null, 2));
        console.log('📇 Leads index updated');

    } catch (error) {
        console.error('Error updating index:', error);
    }
}

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
                        ${lead.scoringMethod === 'AI' ? `<p style="color: #666; font-size: 14px;">🤖 AI-Scored${lead.aiReasoning ? ': ' + lead.aiReasoning : ''}</p>` : ''}
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
                        <p><strong>Condition:</strong> ${lead.condition || 'Not specified'}</p>
                    </div>

                    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <h3 style="color: #0f2240; margin-top: 0;">Situation</h3>
                        <p><strong>Reason for Selling:</strong> ${lead.reason || 'Not specified'}</p>
                        <p><strong>Timeline:</strong> ${lead.timeline || 'Not specified'}</p>
                        <p><strong>Mortgage Status:</strong> ${lead.mortgageStatus || 'Not specified'}</p>
                        ${lead.comments ? `<p><strong>Comments:</strong> ${lead.comments}</p>` : ''}
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #666; font-size: 12px;">
                            Lead ID: ${lead.id}<br>
                            Received: ${new Date(lead.timestamp).toLocaleString()}<br>
                            ${lead.scoringMethod === 'AI' ? '🤖 Scored with OpenAI GPT-3.5' : '📊 Rule-based scoring'}
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
    }
}

// GET /api/leads
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

// GET /api/leads/:id
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
        features: {
            email: !!process.env.GMAIL_APP_PASSWORD,
            sms: !!twilioClient,
            ai: openaiEnabled
        }
    });
});

async function start() {
    await ensureLeadsDir();

    app.listen(PORT, () => {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('   🏠 HOME LIBERATION - ENHANCED FORM HANDLER');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`✅ Form endpoint: http://localhost:${PORT}/api/leads`);
        console.log(`✅ Leads stored in: ${LEADS_DIR}`);
        console.log(`✅ Email notifications: ${process.env.GMAIL_USER}`);
        console.log(`${twilioClient ? '✅' : '⚠️'}  SMS notifications: ${twilioClient ? 'ENABLED' : 'DISABLED'}`);
        console.log(`${openaiEnabled ? '✅' : '⚠️'}  AI scoring: ${openaiEnabled ? 'ENABLED' : 'DISABLED (using rules)'}`);
        console.log('\n📋 Ready to receive leads!\n');
    });
}

start().catch(console.error);

module.exports = app;
