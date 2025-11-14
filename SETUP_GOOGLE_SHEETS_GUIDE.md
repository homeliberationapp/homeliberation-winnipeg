# 📊 GOOGLE SHEETS SETUP GUIDE - Complete Step-by-Step

**Purpose:** Setup Google Sheets with 44-column structure for wholesale lead management
**Status:** Ready to run (2-3 minutes)
**File:** form-to-sheets.js (already complete)

---

## 🚀 QUICK SETUP (If You Have Service Account)

If you already have Google Service Account credentials:

```bash
cd "C:\Users\Owner\Desktop\VelocityRealEstate"
node -e "const {createSheetHeaders} = require('./form-to-sheets.js'); createSheetHeaders();"
```

Done! Skip to verification section.

---

## 📋 FULL SETUP (First Time)

### Step 1: Create Google Spreadsheet

1. Go to: https://sheets.google.com
2. Click "**+ Blank**" to create new spreadsheet
3. Name it: "**Home Liberation Leads**"
4. Note the **Spreadsheet ID** from URL:
   - URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy: `SPREADSHEET_ID_HERE`

---

### Step 2: Create Google Cloud Service Account

1. Go to: https://console.cloud.google.com
2. Create new project: "**Home Liberation**"
3. Enable **Google Sheets API**:
   - Go to: https://console.cloud.google.com/apis/library
   - Search: "Google Sheets API"
   - Click "**Enable**"

4. Create Service Account:
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Click "**+ Create Service Account**"
   - Name: `homeliberation-sheets`
   - Role: "Editor"
   - Click "**Create Key**"
   - Type: JSON
   - Download JSON file

5. Open JSON file, find:
   - `client_email`: The service account email
   - `private_key`: The private key (starts with `-----BEGIN PRIVATE KEY-----`)

---

### Step 3: Share Spreadsheet with Service Account

1. Open your Google Sheet
2. Click "**Share**" (top right)
3. Paste the **service account email** (from JSON)
4. Permission: "Editor"
5. Uncheck "Notify people"
6. Click "**Share**"

---

### Step 4: Configure Environment Variables

Create or edit `.env` file in project root:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Email Configuration (optional, for local testing)
GMAIL_USER=homeliberationapp@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here

# Server
PORT=5678
```

**IMPORTANT:**
- Keep `.env` in `.gitignore` (never commit secrets!)
- Private key must have literal `\n` for newlines (keep as single line)

---

### Step 5: Run Headers Setup Script

```bash
cd "C:\Users\Owner\Desktop\VelocityRealEstate"
node -e "const {createSheetHeaders} = require('./form-to-sheets.js'); createSheetHeaders();"
```

**Expected Output:**
```
✅ Google Sheets headers created successfully!
✅ 44 columns (A:AS) configured:
   - Timestamp, Name, Email, Phone
   - Property Details (8 fields)
   - Situation (4 fields)
   - Financial Analysis (18 fields)
   - Repairs, Details, Score, Metrics
```

---

### Step 6: Verify Sheet Structure

Open your Google Sheet - should see header row:

| A | B | C | D | E | F | ... | AN |
|---|---|---|---|---|---|---|---|
| Timestamp | First Name | Last Name | Email | Phone | Address | ... | Wholesale Metrics |

**All 44 columns:**
1. Timestamp
2. First Name
3. Last Name
4. Email
5. Phone
6. Address
7. Neighborhood
8. Property Type
9. Year Built
10. Bedrooms
11. Bathrooms
12. Square Feet
13. Condition
14. Situation
15. Occupancy
16. Mortgage Status
17. Timeline
18. Assessment Value ⭐
19. ARV
20. Current Market Value
21. Estimated Repairs
22. Mortgage Balance
23. Monthly Payment
24. Interest Rate
25. Years Remaining
26. Liens
27. Back Taxes
28. Annual Taxes
29. HOA Fees
30. Current Rent
31. Market Rent
32. Asking Price
33. Minimum Price
34. Equity
35. Days on Market
36. Previous List Price
37. Repairs (JSON)
38. Additional Details
39. Lead Score
40. Wholesale Metrics (JSON)

---

## 🧪 TEST SUBMISSION

Test the complete flow:

```bash
# Option 1: Use test script
node SUBMIT_TEST_CONSULTATION.js

# Option 2: Fill form manually
# Visit: https://homeliberation.app/contact.html
# Fill all fields
# Submit
```

**Check Results:**
1. Open Google Sheet
2. Should see new row with:
   - All 40 form fields populated
   - Lead score calculated (0-115)
   - Wholesale metrics in JSON format
   - Timestamp

---

## 📊 UNDERSTANDING THE DATA

### Lead Score (Column AL)
- **90-115:** 🔥 HOT LEAD (Apartment + Foreclosure + Immediate)
- **70-89:** ✅ QUALITY LEAD (Multi-family + Motivated)
- **50-69:** ⚠️ GOOD LEAD (Standard situation)
- **0-49:** 📋 FOLLOW-UP (Needs nurturing)

### Wholesale Metrics (Column AM) - JSON Format
```json
{
  "mao": 305000,
  "buyerProfit": 320000,
  "wholesaleFee": 15000,
  "totalDebt": 280000,
  "estimatedEquity": 270000,
  "spreadPercentage": 45
}
```

**Definitions:**
- **MAO:** Maximum Allowable Offer (ARV × 70% - Repairs - Fee)
- **buyerProfit:** Potential profit for end buyer
- **wholesaleFee:** Your assignment fee ($15k standard)
- **totalDebt:** Mortgage + Liens + Back Taxes
- **estimatedEquity:** ARV - Total Debt
- **spreadPercentage:** (ARV - MAO) / ARV × 100

---

## 🔧 ALTERNATIVE: Use Google Apps Script

If you prefer not to use Service Account:

1. Open Google Sheet
2. **Extensions → Apps Script**
3. Paste this code:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads');
  const data = JSON.parse(e.postData.contents);

  // Calculate wholesale metrics
  const arv = parseFloat(data.arv) || 0;
  const repairs = parseFloat(data.estimated_repairs) || 0;
  const mao = (arv * 0.70) - repairs - 15000;

  // Calculate lead score
  let score = 0;
  if (data.property_type?.includes('apartment')) score += 30;
  // ... (copy full calculation from form-to-sheets.js)

  sheet.appendRow([
    new Date(),
    data.first_name,
    data.last_name,
    // ... all 44 fields
  ]);

  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. **Deploy → New Deployment**
5. Type: "Web app"
6. Who has access: "Anyone"
7. Copy Web App URL
8. Update contact.html webhook URL to Apps Script URL

---

## ✅ VERIFICATION CHECKLIST

- [ ] Google Spreadsheet created
- [ ] Spreadsheet ID noted
- [ ] Google Sheets API enabled
- [ ] Service Account created with JSON key
- [ ] Spreadsheet shared with service account email
- [ ] .env file configured with credentials
- [ ] Headers script run successfully
- [ ] 44 columns visible in sheet
- [ ] Test submission successful
- [ ] Data appears in sheet with lead score
- [ ] Wholesale metrics calculated

---

## 🔒 SECURITY NOTES

**IMPORTANT:**
- ✅ `.env` file in `.gitignore` (DO NOT commit to git!)
- ✅ Service account JSON key stored securely
- ✅ Spreadsheet shared only with service account
- ✅ Never expose credentials in public code

**If credentials leaked:**
1. Delete service account immediately
2. Create new one
3. Update .env
4. Reshare spreadsheet

---

## 🎯 NEXT STEPS AFTER SETUP

1. **Connect n8n workflow** (see SETUP_N8N_WORKFLOW_GUIDE.md)
2. **Test end-to-end** form submission
3. **Monitor leads** in Google Sheets
4. **Create views** for:
   - High-score leads (>80)
   - Foreclosure leads
   - Apartments/multi-family
   - Leads by timeline

5. **Setup alerts** (Google Sheets → Tools → Notification rules)
6. **Create dashboard** using Google Data Studio

---

**Created:** 2025-11-14
**Estimated Setup Time:** 5-10 minutes
**Difficulty:** Easy (copy-paste configuration)
**Dependencies:** Google Cloud account (free)
