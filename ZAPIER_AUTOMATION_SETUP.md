# ZAPIER AUTOMATION SETUP - 5 FREE ZAPS

**Account:** Zapier Free Plan
**Limit:** 5 Zaps, 100 tasks/month
**Cost:** $0/month

---

## ZAP 1: NEW LEAD → EMAIL NOTIFICATION

**Purpose:** Get email immediately when someone submits the form

### Trigger:
- **App:** Google Sheets
- **Event:** New Spreadsheet Row
- **Spreadsheet:** Velocity Real Estate - Deal Management System
- **Worksheet:** LEADS
- **Trigger Column:** A (Timestamp)

### Action:
- **App:** Gmail
- **Event:** Send Email
- **To:** your@email.com
- **From:** your@email.com
- **Subject:** `🏠 New Lead: {{Property Address}}`

**Body:**
```
New property inquiry received!

PROPERTY DETAILS:
═══════════════════════════════════════════
Address: {{Property Address}}
Type: {{Property Type}}
Beds/Baths: {{Bedrooms}} bed / {{Bathrooms}} bath
Square Feet: {{Square Feet}}
Condition: {{Overall Condition}}

SELLER INFORMATION:
═══════════════════════════════════════════
Name: {{First Name}} {{Last Name}}
Phone: {{Phone}}
Email: {{Email}}
Best Time to Call: {{Best Time to Call}}

SITUATION:
═══════════════════════════════════════════
Why Selling: {{Why Selling}}
Urgency: {{Urgency (1-10)}}/10
Timeline: {{Ideal Timeline}}
Behind on Payments: {{Behind on Payments}}

LEAD SCORE: {{LEAD SCORE}}
PRIORITY: {{PRIORITY}}

FINANCIALS:
═══════════════════════════════════════════
Owner's AS-IS Estimate: ${{Owner's AS-IS Value Estimate}}
Amount Owed: {{Amount Owed}}

NEXT STEPS:
→ Review full details in Google Sheets
→ Research comps in the area
→ Run deal analysis
→ Call seller within 24 hours

[View in Google Sheets]
https://docs.google.com/spreadsheets/d/YOUR-SHEET-ID
```

### Settings:
- **Zap Name:** "New Lead Email Alert"
- **Status:** ON

---

## ZAP 2: HOT LEAD → SMS ALERT

**Purpose:** Get text message for urgent/hot leads (score ≥70)

### Trigger:
- **App:** Google Sheets
- **Event:** New Spreadsheet Row
- **Spreadsheet:** Velocity Real Estate - Deal Management System
- **Worksheet:** LEADS

### Filter:
- **App:** Filter by Zapier
- **Condition:** Only continue if...
  - **Column:** LEAD SCORE (AJ)
  - **Condition:** Greater than or equal to
  - **Value:** 70

### Action:
- **App:** SMS by Zapier (uses Twilio)
- **Phone Number:** Your phone number (+12045551234 format)
- **Message:**
```
🔥 HOT LEAD ALERT!

{{First Name}} {{Last Name}}
{{Property Address}}

Urgency: {{Urgency (1-10)}}/10
Score: {{LEAD SCORE}}
{{Why Selling}}

Call: {{Phone}}
Best time: {{Best Time to Call}}

Check email for full details.
```

### Settings:
- **Zap Name:** "Hot Lead SMS Alert"
- **Status:** ON

**Note:** First 100 SMS/month free with Zapier SMS, then $0.015 each

---

## ZAP 3: WELCOME EMAIL TO SELLER

**Purpose:** Auto-send confirmation email to seller immediately after form submission

### Trigger:
- **App:** Google Sheets
- **Event:** New Spreadsheet Row
- **Spreadsheet:** Velocity Real Estate - Deal Management System
- **Worksheet:** LEADS

### Action:
- **App:** Gmail
- **Event:** Send Email
- **To:** {{Email}}
- **From:** info@yoursite.com (or your@gmail.com)
- **Subject:** `Thank you {{First Name}} - We're Analyzing {{Property Address}} Now`

**Body:**
```
Hi {{First Name}},

Thank you for submitting your property information! We've received your inquiry about {{Property Address}} and are analyzing it right now.

WHAT HAPPENS NEXT:
═══════════════════════════════════════════

Within 24-48 Hours:
• We'll review your property details
• Research comparable sales in your area
• Calculate a fair cash offer based on current market conditions
• Prepare a detailed analysis

We'll Contact You:
• Phone: {{Phone}}
• Best time: {{Best Time to Call}}
• We'll discuss our offer and answer all your questions

Your Situation:
We understand you mentioned: "{{Why Selling}}"
We're committed to finding a solution that works for you.

QUESTIONS BEFORE THEN?
═══════════════════════════════════════════
Call or Text: (204) XXX-XXXX
Email: info@velocityrealestate.ca

Your information is 100% confidential and will never be shared.

Best regards,
Velocity Real Estate Team
Winnipeg's Trusted Property Solutions

---
This is an automated confirmation. We'll follow up personally within 24-48 hours.
```

### Settings:
- **Zap Name:** "Seller Welcome Email"
- **Status:** ON

---

## ZAP 4: 3-DAY FOLLOW-UP REMINDER

**Purpose:** Remind you to follow up if lead hasn't been contacted yet

### Trigger:
- **App:** Google Sheets
- **Event:** New Spreadsheet Row
- **Spreadsheet:** Velocity Real Estate - Deal Management System
- **Worksheet:** LEADS

### Delay:
- **App:** Delay by Zapier
- **Delay For:** 3 days (72 hours)

### Filter:
- **App:** Filter by Zapier
- **Condition:** Only continue if...
  - **Column:** STATUS (AL)
  - **Condition:** Exactly matches
  - **Value:** New

(If still "New" after 3 days, send reminder)

### Action:
- **App:** Gmail
- **Event:** Send Email
- **To:** your@email.com
- **Subject:** `⏰ Follow-Up Needed: {{First Name}} {{Last Name}} - {{Property Address}}`

**Body:**
```
FOLLOW-UP REMINDER - 3 Days Since Lead Received

This lead is still marked as "New" (not contacted yet).

LEAD DETAILS:
═══════════════════════════════════════════
Name: {{First Name}} {{Last Name}}
Property: {{Property Address}}
Phone: {{Phone}}
Email: {{Email}}
Best Time: {{Best Time to Call}}

Urgency: {{Urgency (1-10)}}/10
Timeline: {{Ideal Timeline}}
Lead Score: {{LEAD SCORE}}

ACTION NEEDED:
→ Update status in Google Sheets if already contacted
→ If not contacted, CALL TODAY
→ Reason selling: {{Why Selling}}

[Open Google Sheets]
https://docs.google.com/spreadsheets/d/YOUR-SHEET-ID
```

### Settings:
- **Zap Name:** "3-Day Follow-Up Reminder"
- **Status:** ON

---

## ZAP 5: DEAL CLOSED → REVENUE TRACKING

**Purpose:** Send celebration email and update revenue tracking when deal closes

### Trigger:
- **App:** Google Sheets
- **Event:** New or Updated Spreadsheet Row
- **Spreadsheet:** Velocity Real Estate - Deal Management System
- **Worksheet:** ASSIGNMENTS & CLOSINGS
- **Trigger Column:** K (Status)

### Filter:
- **App:** Filter by Zapier
- **Condition:** Only continue if...
  - **Column:** Status (K)
  - **Condition:** Exactly matches
  - **Value:** Closed (PAID ✅)

### Action:
- **App:** Gmail
- **Event:** Send Email
- **To:** your@email.com
- **Subject:** `🎉 DEAL CLOSED! You Made ${{YOUR PROFIT}} on {{Property Address}}`

**Body:**
```
🎉 CONGRATULATIONS! DEAL CLOSED! 🎉

DEAL SUMMARY:
═══════════════════════════════════════════
Property: {{Property Address}}
Seller: {{Seller Name}}
Buyer: {{Buyer Name}}

YOUR PROFIT: ${{YOUR PROFIT}}

DEAL FINANCIALS:
═══════════════════════════════════════════
Your Contract Price: ${{Your Contract Price (with seller)}}
Assignment Fee: ${{Assignment Fee}}
Buyer's Purchase Price: ${{Buyer's Purchase Price (Contract + Fee)}}

Close Date: {{Actual Close Date}}

PERFORMANCE UPDATE:
═══════════════════════════════════════════
Total Deals Closed This Year: [Check Dashboard]
Total Revenue This Year: [Check Dashboard]

Next Steps:
→ Thank the buyer (build relationship)
→ Thank the seller (ask for referrals)
→ Add buyer to database as "proven closer"
→ Celebrate your win!

Great work! 🚀
```

### Settings:
- **Zap Name:** "Deal Closed Celebration"
- **Status:** ON

---

## ZAPIER FREE TIER LIMITS

```
═══════════════════════════════════════════════════════════
                    FREE PLAN DETAILS
═══════════════════════════════════════════════════════════

Zaps Allowed:              5 (you're using all 5)
Tasks Per Month:           100
Update Interval:           15 minutes
Multi-step Zaps:           Yes ✓
Premium Apps:              No
Filters:                   Yes ✓
Delays:                    Yes ✓

TASK USAGE ESTIMATE:
───────────────────────────────────────────────────────────
Zap 1 (New Lead Email):    1 task per lead
Zap 2 (Hot Lead SMS):      1 task per hot lead (~30% of leads)
Zap 3 (Seller Email):      1 task per lead
Zap 4 (Follow-Up):         1 task per lead (after 3 days)
Zap 5 (Deal Closed):       1 task per closed deal

Example with 20 leads/month:
- 20 new lead emails = 20 tasks
- 6 hot lead SMS = 6 tasks
- 20 seller emails = 20 tasks
- 20 follow-ups = 20 tasks
- 3 closed deals = 3 tasks
TOTAL: 69 tasks (well under 100 limit)

IF YOU EXCEED 100 TASKS:
→ Upgrade to Zapier Starter ($29.99/month for 750 tasks)
→ Or disable non-critical Zaps (like follow-up reminders)
═══════════════════════════════════════════════════════════
```

---

## SETUP INSTRUCTIONS

### Step 1: Create Zapier Account
1. Go to zapier.com
2. Click "Sign Up"
3. Use Google account (easiest)
4. Select "Free" plan

### Step 2: Create First Zap
1. Click "Create Zap"
2. Follow trigger setup above for Zap 1
3. Test trigger (submit test form)
4. Set up action (Gmail)
5. Test action
6. Turn Zap ON

### Step 3: Repeat for Zaps 2-5
- Follow each Zap structure above
- Test each one before turning on
- Name each Zap clearly

### Step 4: Monitor Usage
- Check Zapier dashboard weekly
- View "Task History" to see what's running
- Track task usage (stay under 100/month)

---

## ALTERNATIVE: GOOGLE APPS SCRIPT (100% FREE)

If you want to avoid Zapier entirely and stay 100% free, you can use Google Apps Script to automate everything within Google Sheets.

**Advantages:**
- Completely free (no limits)
- Runs directly in Google Sheets
- No external service needed

**Disadvantages:**
- Requires some coding (JavaScript)
- More complex to set up

**I can provide Apps Script code if you prefer 100% free automation.**

Let me know if you want the Apps Script version instead of Zapier.

---

**YOUR AUTOMATION IS READY**

These 5 Zaps handle:
✓ Instant lead notifications
✓ Hot lead SMS alerts
✓ Seller confirmation emails
✓ Follow-up reminders
✓ Deal closed celebrations

All within your free tier limits.
