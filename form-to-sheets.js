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

        // Prepare row data with ALL comprehensive wholesale fields
        const timestamp = new Date().toISOString();
        const row = [
            timestamp,

            // PERSONAL INFO
            formData.first_name || '',
            formData.last_name || '',
            formData.email || '',
            formData.phone || '',

            // PROPERTY DETAILS
            formData.address || '',
            formData.neighborhood || '',
            formData.property_type || '',
            formData.year_built || '',
            formData.bedrooms || '',
            formData.bathrooms || '',
            formData.square_feet || '',
            formData.condition || '',

            // SITUATION
            formData.situation || '',
            formData.occupancy || '',
            formData.mortgage_status || '',
            formData.timeline || '',

            // COMPREHENSIVE FINANCIAL ANALYSIS (18 new fields)
            formData.assessment_value || '',           // CRITICAL for wholesale
            formData.arv || '',                         // After Repair Value
            formData.current_market_value || '',        // As-Is value
            formData.estimated_repairs || '',           // Total repair estimate
            formData.mortgage_balance || '',            // Total mortgage
            formData.monthly_payment || '',             // Monthly payment
            formData.interest_rate || '',               // Interest rate %
            formData.years_remaining || '',             // Years left on mortgage
            formData.liens || '',                       // Outstanding liens
            formData.back_taxes || '',                  // Back taxes owed
            formData.annual_taxes || '',                // Annual property taxes
            formData.hoa_fees || '',                    // HOA/Condo fees
            formData.current_rent || '',                // Current rent (if rented)
            formData.market_rent || '',                 // Market rent potential
            formData.asking_price || '',                // Seller's asking price
            formData.minimum_price || '',               // Minimum acceptable
            formData.equity || '',                      // Estimated equity
            formData.days_on_market || '',              // Days previously listed
            formData.previous_list_price || '',         // Previous listing price

            // REPAIRS (JSON string for detailed tracking)
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
                painting: formData.repair_painting || '',
            }),

            // ADDITIONAL INFO
            formData.additional_details || '',

            // LEAD SCORE (calculated with enhanced algorithm)
            calculateLeadScore(formData),

            // WHOLESALE METRICS (calculated)
            calculateWholesaleMetrics(formData),
        ];

        // Append to sheet (extended range for all wholesale fields)
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Leads!A:AS',  // Extended to column AS for all fields
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
 * Calculate lead quality score (0-100) - ENHANCED FOR WHOLESALE
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

    // NEW: Equity scoring (more equity = better deal)
    const equity = parseFloat(data.equity) || 0;
    if (equity > 100000) score += 10;
    else if (equity > 50000) score += 5;

    // NEW: Assessment value provided (shows serious seller)
    if (data.assessment_value) score += 5;

    return Math.min(score, 100);
}

/**
 * Calculate wholesale metrics (MAO, potential profit, etc.)
 */
function calculateWholesaleMetrics(data) {
    const arv = parseFloat(data.arv) || parseFloat(data.assessment_value) || 0;
    const repairs = parseFloat(data.estimated_repairs) || 0;
    const wholesaleFee = 15000; // Standard wholesale fee

    // Maximum Allowable Offer (MAO) = ARV × 70% - Repairs - Wholesale Fee
    const mao = Math.max(0, (arv * 0.70) - repairs - wholesaleFee);

    // Potential Profit for buyer
    const buyerProfit = Math.max(0, (arv * 0.70) - repairs);

    // Seller's equity position
    const mortgageBalance = parseFloat(data.mortgage_balance) || 0;
    const liens = parseFloat(data.liens) || 0;
    const backTaxes = parseFloat(data.back_taxes) || 0;
    const totalDebt = mortgageBalance + liens + backTaxes;

    const metrics = {
        mao: Math.round(mao),
        buyerProfit: Math.round(buyerProfit),
        wholesaleFee: wholesaleFee,
        totalDebt: Math.round(totalDebt),
        estimatedEquity: Math.round(Math.max(0, arv - totalDebt)),
        spreadPercentage: arv > 0 ? Math.round(((arv - mao) / arv) * 100) : 0,
    };

    return JSON.stringify(metrics);
}

/**
 * Create spreadsheet headers (run once)
 */
async function createSheetHeaders() {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });

        const headers = [
            // Core Info
            'Timestamp',
            'First Name',
            'Last Name',
            'Email',
            'Phone',

            // Property Details
            'Address',
            'Neighborhood',
            'Property Type',
            'Year Built',
            'Bedrooms',
            'Bathrooms',
            'Square Feet',
            'Condition',

            // Situation
            'Situation',
            'Occupancy',
            'Mortgage Status',
            'Timeline',

            // Comprehensive Financial Analysis (18 fields)
            'Assessment Value',
            'ARV (After Repair Value)',
            'Current Market Value',
            'Estimated Repairs',
            'Mortgage Balance',
            'Monthly Payment',
            'Interest Rate',
            'Years Remaining',
            'Liens',
            'Back Taxes',
            'Annual Taxes',
            'HOA Fees',
            'Current Rent',
            'Market Rent',
            'Asking Price',
            'Minimum Price',
            'Equity',
            'Days on Market',
            'Previous List Price',

            // Repairs & Additional
            'Repairs (JSON)',
            'Additional Details',

            // Calculated Metrics
            'Lead Score',
            'Wholesale Metrics (JSON)',
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Leads!A1:AS1',  // Extended range for all new columns
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
