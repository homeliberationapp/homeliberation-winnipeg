/**
 * GOOGLE SHEETS INTEGRATION FOR CONTACT FORM
 * Automatically saves form submissions to Google Sheets
 */

const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID';

// Initialize Google Sheets API
function getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return auth;
}

async function saveToSheets(formData) {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });

        // Prepare row data
        const timestamp = new Date().toISOString();
        const row = [
            timestamp,
            // Personal Info
            formData.first_name || '',
            formData.last_name || '',
            formData.email || '',
            formData.phone || '',

            // Property Details
            formData.address || '',
            formData.property_type || '',
            formData.year_built || '',
            formData.bedrooms || '',
            formData.bathrooms || '',
            formData.square_feet || '',
            formData.condition || '',

            // Situation
            formData.situation || '',
            formData.occupancy || '',
            formData.mortgage_status || '',
            formData.timeline || '',

            // Financial
            formData.mortgage_balance || '',
            formData.liens || '',
            formData.back_taxes || '',
            formData.asking_price || '',

            // Repairs (JSON string for complex data)
            JSON.stringify({
                roof: formData.repair_roof || '',
                foundation: formData.repair_foundation || '',
                hvac: formData.repair_hvac || '',
                plumbing: formData.repair_plumbing || '',
                electrical: formData.repair_electrical || '',
                kitchen: formData.repair_kitchen || '',
                bathroom: formData.repair_bathroom || '',
                flooring: formData.repair_flooring || '',
                windows: formData.repair_windows || '',
                exterior: formData.repair_exterior || '',
            }),

            // Additional Info
            formData.additional_details || '',

            // Lead Score (calculated)
            calculateLeadScore(formData),
        ];

        // Append to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Leads!A:Z',
            valueInputOption: 'RAW',
            requestBody: {
                values: [row],
            },
        });

        const leadScore = calculateLeadScore(formData);
        console.log('✅ Form data saved to Google Sheets');
        return { success: true, timestamp, leadScore };

    } catch (error) {
        console.error('❌ Error saving to Google Sheets:', error.message);
        throw error;
    }
}

/**
 * Calculate lead quality score (0-100)
 */
function calculateLeadScore(data) {
    let score = 0;

    // Property type scoring (multi-family = higher)
    if (data.property_type?.includes('apartment') || data.property_type?.includes('Apartment')) score += 30;
    else if (data.property_type?.includes('plex')) score += 25;
    else score += 15;

    // Motivation scoring
    const highMotivation = ['foreclosure', 'divorce', 'bankruptcy', 'tax-liens'];
    if (highMotivation.some(m => data.situation?.includes(m))) score += 25;
    else score += 10;

    // Timeline scoring (urgent = higher)
    if (data.timeline?.includes('immediate') || data.timeline?.includes('urgent')) score += 20;
    else if (data.timeline?.includes('month')) score += 15;
    else score += 5;

    // Condition scoring (poor = higher margin)
    if (data.condition === 'poor' || data.condition === 'uninhabitable') score += 15;
    else if (data.condition === 'fair') score += 10;
    else score += 5;

    // Financial distress scoring
    if (data.mortgage_status?.includes('behind') || data.mortgage_status?.includes('foreclosure')) score += 10;

    return Math.min(score, 100);
}

/**
 * Create spreadsheet headers (run once)
 */
async function createSheetHeaders() {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });

        const headers = [
            'Timestamp',
            'First Name',
            'Last Name',
            'Email',
            'Phone',
            'Address',
            'Property Type',
            'Year Built',
            'Bedrooms',
            'Bathrooms',
            'Square Feet',
            'Condition',
            'Situation',
            'Occupancy',
            'Mortgage Status',
            'Timeline',
            'Mortgage Balance',
            'Liens',
            'Back Taxes',
            'Asking Price',
            'Repairs (JSON)',
            'Additional Details',
            'Lead Score',
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Leads!A1:W1',
            valueInputOption: 'RAW',
            requestBody: {
                values: [headers],
            },
        });

        console.log('✅ Sheet headers created');

    } catch (error) {
        console.error('❌ Error creating headers:', error.message);
    }
}

module.exports = { saveToSheets, createSheetHeaders, calculateLeadScore };
