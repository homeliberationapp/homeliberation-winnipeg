// ═══════════════════════════════════════════════════════════
// GOOGLE SHEETS INTEGRATION
// Your command center - track everything in real-time
// ═══════════════════════════════════════════════════════════

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

let doc = null;
let sheets = {};

async function initGoogleSheets(config) {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, serviceAccountAuth);
    await doc.loadInfo();

    // Get all sheets
    sheets.leads = doc.sheetsByTitle['Seller Leads'];
    sheets.deals = doc.sheetsByTitle['Active Deals'];
    sheets.buyers = doc.sheetsByTitle['Buyer Database'];
    sheets.revenue = doc.sheetsByTitle['Revenue Tracker'];
    sheets.market = doc.sheetsByTitle['Market Data'];

    console.log(`✅ Google Sheets connected: "${doc.title}"`);
    return true;

  } catch (error) {
    console.warn('⚠️  Google Sheets connection failed - using test mode');
    return false;
  }
}

async function saveToSheets(sheetName, data) {
  try {
    if (!doc) {
      console.log(`📊 [TEST MODE] Save to "${sheetName}":`, Object.keys(data));
      return { success: true, test: true };
    }

    const sheet = sheets[sheetName.toLowerCase().replace(' ', '')];

    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    // Add timestamp if not present
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }

    await sheet.addRow(data);

    console.log(`✅ Saved to "${sheetName}"`);
    return { success: true };

  } catch (error) {
    console.error('❌ Google Sheets error:', error.message);
    return { success: false, error: error.message };
  }
}

async function updateRow(sheetName, searchColumn, searchValue, updates) {
  try {
    if (!doc) {
      console.log(`📊 [TEST MODE] Update "${sheetName}" where ${searchColumn} = ${searchValue}`);
      return { success: true, test: true };
    }

    const sheet = sheets[sheetName.toLowerCase().replace(' ', '')];
    await sheet.loadCells();

    const rows = await sheet.getRows();
    const row = rows.find(r => r[searchColumn] === searchValue);

    if (!row) {
      throw new Error(`Row not found with ${searchColumn} = ${searchValue}`);
    }

    Object.keys(updates).forEach(key => {
      row[key] = updates[key];
    });

    await row.save();

    console.log(`✅ Updated row in "${sheetName}"`);
    return { success: true };

  } catch (error) {
    console.error('❌ Update error:', error.message);
    return { success: false, error: error.message };
  }
}

async function getRows(sheetName, filter = {}) {
  try {
    if (!doc) {
      console.log(`📊 [TEST MODE] Get rows from "${sheetName}"`);
      return [];
    }

    const sheet = sheets[sheetName.toLowerCase().replace(' ', '')];
    const rows = await sheet.getRows();

    // Apply filters
    let filtered = rows;
    if (Object.keys(filter).length > 0) {
      filtered = rows.filter(row => {
        return Object.keys(filter).every(key => row[key] === filter[key]);
      });
    }

    return filtered.map(r => r.toObject());

  } catch (error) {
    console.error('❌ Get rows error:', error.message);
    return [];
  }
}

module.exports = {
  initGoogleSheets,
  saveToSheets,
  updateRow,
  getRows
};
