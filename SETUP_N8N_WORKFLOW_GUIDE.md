# 🔧 N8N WORKFLOW SETUP GUIDE - Complete Step-by-Step

**Purpose:** Connect contact form to Google Sheets and email notifications
**Status:** Ready to implement (5-10 minutes)
**Site:** https://homeliberation.app

---

## 📋 PREREQUISITES

✅ n8n installed (already done)
✅ Contact form has webhook URL: `https://homeliberation.app/webhook/property-lead`
✅ Google Sheets API enabled
✅ Gmail SMTP configured

---

## 🚀 STEP-BY-STEP SETUP

### Step 1: Start n8n Server

```bash
cd "C:\Users\Owner\Desktop\VelocityRealEstate"
n8n start
```

- Opens browser at: http://localhost:5678
- Login or create account (free)

---

### Step 2: Create New Workflow

1. Click "**+ Add workflow**" (top right)
2. Name it: "**Property Lead Webhook to Sheets**"
3. Save workflow (Ctrl+S)

---

### Step 3: Add Webhook Trigger

1. Click "**+**" button to add first node
2. Search for "**Webhook**"
3. Select "**Webhook**" node
4. Configure:
   - **HTTP Method:** POST
   - **Path:** `/property-lead`
   - **Response Mode:** "When Last Node Finishes"
   - **Response Code:** 200
5. Click "**Execute Node**" to test
6. Copy the **Production URL** (will be like: `https://YOUR-N8N-URL/webhook/property-lead`)

---

### Step 4: Update Contact Form Webhook URL

Edit `contact.html` line ~1650:

```javascript
// CURRENT (local):
const webhookURL = 'https://homeliberation.app/webhook/property-lead';

// CHANGE TO (your n8n URL):
const webhookURL = 'https://YOUR-N8N-URL/webhook/property-lead';
```

Or keep using your actual n8n.cloud URL if you have one.

---

### Step 5: Add Google Sheets Node

1. Click "**+**" after Webhook node
2. Search for "**Google Sheets**"
3. Select "**Google Sheets**"
4. **Operation:** "Append Row"
5. Click "**Add Credential**"
6. Choose "**OAuth2**" or "**Service Account**"

**For OAuth2:**
- Click "**Connect my account**"
- Login with Google (homeliberationapp@gmail.com)
- Grant permissions

**For Service Account:**
- Use credentials from form-to-sheets.js
- Paste service account email
- Paste private key

7. Configure Sheet:
   - **Spreadsheet ID:** `YOUR_SPREADSHEET_ID`
   - **Sheet Name:** `Leads`
   - **Range:** `A:AS` (44 columns)

8. **Map Data Fields** (click "+ Add Field Mapping"):

```javascript
Column A: {{$json["timestamp"]}}
Column B: {{$json["first_name"]}}
Column C: {{$json["last_name"]}}
Column D: {{$json["email"]}}
Column E: {{$json["phone"]}}
Column F: {{$json["address"]}}
Column G: {{$json["neighborhood"]}}
Column H: {{$json["property_type"]}}
Column I: {{$json["year_built"]}}
Column J: {{$json["bedrooms"]}}
Column K: {{$json["bathrooms"]}}
Column L: {{$json["square_feet"]}}
Column M: {{$json["condition"]}}
Column N: {{$json["situation"]}}
Column O: {{$json["occupancy"]}}
Column P: {{$json["mortgage_status"]}}
Column Q: {{$json["timeline"]}}
Column R: {{$json["assessment_value"]}}
Column S: {{$json["arv"]}}
Column T: {{$json["current_market_value"]}}
Column U: {{$json["estimated_repairs"]}}
Column V: {{$json["mortgage_balance"]}}
Column W: {{$json["monthly_payment"]}}
Column X: {{$json["interest_rate"]}}
Column Y: {{$json["years_remaining"]}}
Column Z: {{$json["liens"]}}
Column AA: {{$json["back_taxes"]}}
Column AB: {{$json["annual_taxes"]}}
Column AC: {{$json["hoa_fees"]}}
Column AD: {{$json["current_rent"]}}
Column AE: {{$json["market_rent"]}}
Column AF: {{$json["asking_price"]}}
Column AG: {{$json["minimum_price"]}}
Column AH: {{$json["equity"]}}
Column AI: {{$json["days_on_market"]}}
Column AJ: {{$json["previous_list_price"]}}
Column AK: {{$json["repairs"]}} (JSON)
Column AL: {{$json["additional_details"]}}
Column AM: {{$json["lead_score"]}}
Column AN: {{$json["wholesale_metrics"]}} (JSON)
```

---

### Step 6: Add Wholesale Metrics Calculation (Function Node)

1. Click "**+**" between Webhook and Google Sheets
2. Search for "**Function**"
3. Select "**Function**" node
4. Paste this code:

```javascript
// Calculate Wholesale Metrics
const data = items[0].json;

const arv = parseFloat(data.arv) || parseFloat(data.assessment_value) || 0;
const repairs = parseFloat(data.estimated_repairs) || 0;
const wholesaleFee = 15000;

const mao = Math.max(0, (arv * 0.70) - repairs - wholesaleFee);
const buyerProfit = Math.max(0, (arv * 0.70) - repairs);

const mortgage = parseFloat(data.mortgage_balance) || 0;
const liens = parseFloat(data.liens) || 0;
const backTaxes = parseFloat(data.back_taxes) || 0;
const totalDebt = mortgage + liens + backTaxes;

const estimatedEquity = Math.max(0, arv - totalDebt);
const spreadPercentage = arv > 0 ? Math.round(((arv - mao) / arv) * 100) : 0;

// Calculate Lead Score
let leadScore = 0;

if (data.property_type?.includes('apartment')) leadScore += 30;
else if (data.property_type?.includes('plex')) leadScore += 25;
else leadScore += 15;

const highMotivation = ['foreclosure', 'divorce', 'bankruptcy', 'tax-liens'];
if (highMotivation.some(m => data.situation?.includes(m))) leadScore += 25;
else leadScore += 10;

if (data.timeline?.includes('immediate')) leadScore += 20;
else if (data.timeline?.includes('month')) leadScore += 15;
else leadScore += 5;

if (data.condition === 'poor' || data.condition === 'uninhabitable') leadScore += 15;
else if (data.condition === 'fair') leadScore += 10;
else leadScore += 5;

if (data.mortgage_status?.includes('behind')) leadScore += 10;

if (estimatedEquity > 100000) leadScore += 10;
else if (estimatedEquity > 50000) leadScore += 5;

if (data.assessment_value) leadScore += 5;

leadScore = Math.min(leadScore, 115);

// Add calculated fields to output
return [{
    json: {
        ...data,
        timestamp: new Date().toISOString(),
        lead_score: leadScore,
        wholesale_metrics: JSON.stringify({
            mao: Math.round(mao),
            buyerProfit: Math.round(buyerProfit),
            wholesaleFee,
            totalDebt: Math.round(totalDebt),
            estimatedEquity: Math.round(estimatedEquity),
            spreadPercentage
        }),
        repairs: JSON.stringify({
            roof: data.repair_roof || '',
            foundation: data.repair_foundation || '',
            hvac: data.repair_hvac || '',
            plumbing: data.repair_plumbing || '',
            electrical: data.repair_electrical || '',
            windows: data.repair_windows || '',
            kitchen: data.repair_kitchen || '',
            bathroom: data.repair_bathroom || '',
            flooring: data.repair_flooring || '',
            exterior: data.repair_exterior || '',
            painting: data.repair_painting || ''
        })
    }
}];
```

5. Reconnect nodes: Webhook → Function → Google Sheets

---

### Step 7: Add Email Notification Node

1. Click "**+**" after Google Sheets
2. Search for "**Gmail**" or "**Send Email**"
3. Select "**Gmail**" node
4. **Operation:** "Send Email"
5. Add Gmail credentials (homeliberationapp@gmail.com)
6. Configure:
   - **To:** `homeliberationapp@gmail.com`
   - **Subject:** `🔥 New Property Lead - Score {{$node["Function"].json["lead_score"]}}/115`
   - **Email Type:** HTML
   - **Message:**

```html
<h2>New Property Lead Received</h2>

<h3>📊 Lead Score: {{$node["Function"].json["lead_score"]}}/115</h3>

<h3>👤 Contact Information</h3>
<p><strong>Name:</strong> {{$node["Webhook"].json["first_name"]}} {{$node["Webhook"].json["last_name"]}}</p>
<p><strong>Email:</strong> {{$node["Webhook"].json["email"]}}</p>
<p><strong>Phone:</strong> {{$node["Webhook"].json["phone"]}}</p>

<h3>🏠 Property Details</h3>
<p><strong>Address:</strong> {{$node["Webhook"].json["address"]}}</p>
<p><strong>Type:</strong> {{$node["Webhook"].json["property_type"]}}</p>
<p><strong>Condition:</strong> {{$node["Webhook"].json["condition"]}}</p>
<p><strong>Situation:</strong> {{$node["Webhook"].json["situation"]}}</p>

<h3>💰 Wholesale Analysis</h3>
<p><strong>Assessment Value:</strong> ${{$node["Webhook"].json["assessment_value"]}}</p>
<p><strong>ARV:</strong> ${{$node["Webhook"].json["arv"]}}</p>
<p><strong>Estimated Repairs:</strong> ${{$node["Webhook"].json["estimated_repairs"]}}</p>
<p><strong>MAO:</strong> ${{JSON.parse($node["Function"].json["wholesale_metrics"]).mao}}</p>
<p><strong>Buyer Profit Potential:</strong> ${{JSON.parse($node["Function"].json["wholesale_metrics"]).buyerProfit}}</p>

<h3>⏰ Timeline</h3>
<p><strong>Desired Close:</strong> {{$node["Webhook"].json["timeline"]}}</p>

<p><em>View full details in Google Sheets</em></p>
```

---

### Step 8: Test the Workflow

1. Click "**Execute Workflow**" (top)
2. Go to contact form: https://homeliberation.app/contact.html
3. Fill out form with test data
4. Submit
5. Check n8n execution log (should show green checkmarks)
6. Verify:
   - ✅ New row in Google Sheets
   - ✅ Email received at homeliberationapp@gmail.com
   - ✅ Lead score calculated
   - ✅ Wholesale metrics present

---

### Step 9: Activate Workflow

1. Toggle switch at top: "**Inactive**" → "**Active**"
2. Workflow now runs automatically on form submissions

---

### Step 10: Deploy n8n (Production)

**Option A: Keep Running Locally**
```bash
n8n start &
# Runs in background
```

**Option B: Use n8n Cloud** (recommended)
1. Go to https://n8n.cloud
2. Create account (free tier)
3. Export workflow (Settings → Export)
4. Import to n8n.cloud
5. Update contact form webhook URL to n8n.cloud URL

**Option C: Deploy to Heroku/Railway**
- Follow n8n deployment docs
- Update webhook URL in contact.html

---

## ✅ VERIFICATION CHECKLIST

- [ ] n8n workflow created with 4 nodes (Webhook → Function → Sheets → Email)
- [ ] Webhook URL updated in contact.html
- [ ] Google Sheets connected with OAuth/Service Account
- [ ] Test form submission successful
- [ ] Data appears in Google Sheets with wholesale metrics
- [ ] Email notification received
- [ ] Workflow activated
- [ ] n8n running in production

---

## 🔧 TROUBLESHOOTING

**Issue: Webhook not receiving data**
- Check contact form console for errors
- Verify webhook URL matches n8n webhook path
- Check n8n execution log for errors

**Issue: Google Sheets not saving**
- Verify spreadsheet ID correct
- Check sheet name is "Leads"
- Ensure OAuth/Service Account has edit permissions

**Issue: Email not sending**
- Verify Gmail credentials
- Check "Less secure apps" setting if using app password
- Confirm recipient email correct

---

**Created:** 2025-11-14
**Estimated Setup Time:** 10-15 minutes
**Difficulty:** Medium (copy-paste configuration)
