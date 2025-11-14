/**
 * GOOGLE SHEETS TO ADMIN DASHBOARD
 * Pulls lead data from Google Sheets for admin dashboard display
 */

const { google } = require('googleapis');
require('dotenv').config();

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID';

function getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    return auth;
}

async function getLeads(limit = 50, sortBy = 'timestamp') {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });

        // Get all data from Leads sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Leads!A2:W1000', // Skip header row, get up to 1000 leads
        });

        const rows = response.data.values || [];

        // Parse rows into structured lead objects
        const leads = rows.map((row, index) => ({
            id: index + 1,
            timestamp: row[0] || '',
            first_name: row[1] || '',
            last_name: row[2] || '',
            email: row[3] || '',
            phone: row[4] || '',
            address: row[5] || '',
            property_type: row[6] || '',
            year_built: row[7] || '',
            bedrooms: row[8] || '',
            bathrooms: row[9] || '',
            square_feet: row[10] || '',
            condition: row[11] || '',
            situation: row[12] || '',
            occupancy: row[13] || '',
            mortgage_status: row[14] || '',
            timeline: row[15] || '',
            mortgage_balance: row[16] || '',
            liens: row[17] || '',
            back_taxes: row[18] || '',
            asking_price: row[19] || '',
            repairs: row[20] ? JSON.parse(row[20]) : {},
            additional_details: row[21] || '',
            lead_score: parseInt(row[22]) || 0,
        }));

        // Sort leads
        if (sortBy === 'score') {
            leads.sort((a, b) => b.lead_score - a.lead_score);
        } else if (sortBy === 'timestamp') {
            leads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }

        // Limit results
        return leads.slice(0, limit);

    } catch (error) {
        console.error('❌ Error reading from Google Sheets:', error.message);
        throw error;
    }
}

async function getLeadStats() {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Leads!A2:W1000',
        });

        const rows = response.data.values || [];
        const leads = rows.map(row => ({
            property_type: row[6] || '',
            situation: row[12] || '',
            timeline: row[15] || '',
            lead_score: parseInt(row[22]) || 0,
            timestamp: row[0] || '',
        }));

        // Calculate statistics
        const total = leads.length;
        const highQuality = leads.filter(l => l.lead_score >= 70).length;
        const mediumQuality = leads.filter(l => l.lead_score >= 40 && l.lead_score < 70).length;
        const lowQuality = leads.filter(l => l.lead_score < 40).length;

        // Property type breakdown
        const propertyTypes = {};
        leads.forEach(l => {
            propertyTypes[l.property_type] = (propertyTypes[l.property_type] || 0) + 1;
        });

        // Timeline breakdown
        const timelines = {};
        leads.forEach(l => {
            timelines[l.timeline] = (timelines[l.timeline] || 0) + 1;
        });

        // Situation breakdown
        const situations = {};
        leads.forEach(l => {
            situations[l.situation] = (situations[l.situation] || 0) + 1;
        });

        // Leads by month
        const leadsPerMonth = {};
        leads.forEach(l => {
            if (l.timestamp) {
                const month = l.timestamp.substring(0, 7); // YYYY-MM
                leadsPerMonth[month] = (leadsPerMonth[month] || 0) + 1;
            }
        });

        return {
            total,
            quality: {
                high: highQuality,
                medium: mediumQuality,
                low: lowQuality,
            },
            propertyTypes,
            timelines,
            situations,
            leadsPerMonth,
            averageScore: total > 0 ? Math.round(leads.reduce((sum, l) => sum + l.lead_score, 0) / total) : 0,
        };

    } catch (error) {
        console.error('❌ Error calculating stats:', error.message);
        throw error;
    }
}

async function getHighPriorityLeads() {
    const allLeads = await getLeads(1000, 'score');

    // Filter for urgent + high quality
    return allLeads.filter(lead => {
        const isUrgent = lead.timeline?.includes('immediate') || lead.timeline?.includes('ASAP');
        const isHighScore = lead.lead_score >= 60;
        return isUrgent || isHighScore;
    }).slice(0, 20);
}

module.exports = {
    getLeads,
    getLeadStats,
    getHighPriorityLeads,
};
