# GOOGLE SHEETS DASHBOARD - COMPLETE SYSTEM

**Spreadsheet Name:** Velocity Real Estate - Deal Management System

**Number of Sheets:** 6 tabs
**Auto-updates:** Yes (from Google Form)
**Formulas:** All included below (copy/paste ready)

---

## SHEET 1: LEADS (Auto-populated from Google Form)

**Purpose:** All form submissions land here automatically

**DO NOT EDIT THIS SHEET** - It auto-populates from your Google Form

### Columns (Auto-created by Google Form):

```
A: Timestamp
B: Property Address
C: Property Type
D: Bedrooms
E: Bathrooms
F: Square Feet
G: Year Built
H: Garage
I: Basement
J: Overall Condition
K: Repairs Needed
L: Estimated Repair Cost
M: Owner's AS-IS Value Estimate
N: Owner's After-Repair Value Estimate
O: Amount Owed
P: Behind on Payments
Q: Is Rental Property
R: Units Rented
S: Monthly Rental Income
T: Vacancy Status
U: Tenant Issues
V: Why Selling
W: Other Reason
X: Urgency (1-10)
Y: Ideal Timeline
Z: What They Need
AA: Bottom Line Acceptance
AB: Tried Selling Before
AC: What Happened Before
AD: First Name
AE: Last Name
AF: Phone
AG: Email
AH: Best Time to Call
AI: Agreement Checkbox
```

**Additional Calculated Columns (YOU ADD THESE):**

```
AJ: LEAD SCORE
Formula for AJ2:
=IF(X2="","",
   (X2*10) +
   IF(P2="No, payments are current",0,
      IF(P2="Yes, 1-2 months behind",10,
         IF(P2="Yes, 3-4 months behind",20,
            IF(P2="Yes, 5-6 months behind",30,40)))) +
   IF(Y2="ASAP (within 7-14 days)",30,
      IF(Y2="Within 30 days",20,
         IF(Y2="30-60 days",10,5))) +
   IF(J2="⭐ Very Poor (Uninhabitable, fire damage, condemned, tear-down candidate)",20,
      IF(J2="⭐⭐ Poor (Major repairs needed - roof, foundation, systems, extensive work)",15,0))
)

Drag down to all rows

AK: PRIORITY
Formula for AK2:
=IF(AJ2="","",
   IF(AJ2>=70,"🔥 HOT LEAD",
      IF(AJ2>=50,"⚡ WARM LEAD",
         IF(AJ2>=30,"📋 NORMAL","❄️ COLD"))))

Drag down to all rows

AL: STATUS
Manual entry dropdown:
- New (default)
- Contacted
- Analyzing
- Offer Made
- Negotiating
- Accepted
- Declined
- Dead

AM: ASSIGNED TO
Manual entry (your name or team member)

AN: NOTES
Manual entry (your notes about the lead)
```

---

## SHEET 2: DEAL ANALYSIS

**Purpose:** Detailed analysis for each property deal

### Column Structure:

```
ROW 1: HEADERS (Bold, freeze row)

A1: Lead ID
B1: Property Address
C1: Property Type
D1: Square Feet
E1: Year Built
F1: Condition

COMPARABLE SALES SECTION:
G1: Comp 1 Address
H1: Comp 1 Price
I1: Comp 1 Sqft
J1: Comp 1 $/Sqft

K1: Comp 2 Address
L1: Comp 2 Price
M1: Comp 2 Sqft
N1: Comp 2 $/Sqft

O1: Comp 3 Address
P1: Comp 3 Price
Q1: Comp 3 Sqft
R1: Comp 3 $/Sqft

S1: Average $/Sqft

AS-IS VALUE SECTION:
T1: Base Value
U1: Condition Adjustment
V1: Garage Value
W1: Basement Value
X1: Other Adjustments
Y1: AS-IS VALUE

YOUR EQUITY PLAY:
Z1: Target Contract %
AA1: Your Contract Price
AB1: INSTANT EQUITY

YOUR ASSIGNMENT FEE:
AC1: Assignment Fee %
AD1: YOUR ASSIGNMENT FEE

BUYER'S NUMBERS:
AE1: Buyer Purchase Price
AF1: Buyer's Equity
AG1: Buyer's Equity %

DEAL QUALITY:
AH1: Deal Rating
AI1: Min Assignment Fee
AJ1: Max Assignment Fee
AK1: Recommended Offer
```

### FORMULAS (Start from Row 2):

```
ROW 2 FORMULAS:

A2: Manual entry (link to LEADS sheet row)
B2: Manual entry (copy from LEADS)
C2: Manual entry (copy from LEADS)
D2: Manual entry (copy from LEADS)
E2: Manual entry (copy from LEADS)
F2: Manual entry (copy from LEADS - condition)

G2-I2: Manual entry (find comps on Realtor.ca)
J2: =IF(I2="","",H2/I2)

K2-M2: Manual entry (second comp)
N2: =IF(M2="","",L2/M2)

O2-Q2: Manual entry (third comp)
R2: =IF(Q2="","",P2/Q2)

S2: =IF(J2="","",AVERAGE(J2,N2,R2))

T2: =IF(D2="","",S2*D2)

U2: =IF(T2="","",
   IF(F2="⭐ Very Poor",-T2*0.20,
      IF(F2="⭐⭐ Poor",-T2*0.15,
         IF(F2="⭐⭐⭐ Fair",-T2*0.10,
            IF(F2="⭐⭐⭐⭐ Good",0,T2*0.05)))))

V2: Manual entry (add garage value: $8000 for single, $15000 for double)

W2: Manual entry (add basement value: $0 for none, $10000 for unfinished, $20000 for finished)

X2: Manual entry (any other adjustments: +/- value)

Y2: =IF(T2="","",T2+U2+V2+W2+X2)

Z2: 0.75 (default 75% of as-is value - you can adjust)

AA2: =IF(Y2="","",Y2*Z2)

AB2: =IF(Y2="","",Y2-AA2)

AC2: 0.35 (default 35% - you can adjust between 0.30-0.50)

AD2: =IF(AB2="","",AB2*AC2)

AE2: =IF(AA2="","",AA2+AD2)

AF2: =IF(Y2="","",Y2-AE2)

AG2: =IF(Y2="","",AF2/Y2)

AH2: =IF(AG2="","",
   IF(AG2>=0.20,"🌟 EXCELLENT",
      IF(AG2>=0.15,"✅ GOOD",
         IF(AG2>=0.10,"⚠️ FAIR","❌ POOR"))))

AI2: =IF(AB2="","",AB2*0.30)

AJ2: =IF(AB2="","",AB2*0.50)

AK2: =IF(AA2="","",ROUND(AA2,-3))
```

**Conditional Formatting:**

```
Apply to column AH (Deal Rating):
- If contains "EXCELLENT" → Green background
- If contains "GOOD" → Light green background
- If contains "FAIR" → Yellow background
- If contains "POOR" → Red background

Apply to column AG (Buyer's Equity %):
- If >= 0.20 → Green text
- If >= 0.15 → Blue text
- If >= 0.10 → Orange text
- If < 0.10 → Red text
```

---

## SHEET 3: MULTI-FAMILY ANALYSIS

**Purpose:** Income property analysis (NOI ÷ Cap Rate method)

### Column Structure:

```
ROW 1: HEADERS

A1: Lead ID
B1: Property Address
C1: Units

INCOME ANALYSIS:
D1: Unit 1 Rent
E1: Unit 2 Rent
F1: Unit 3 Rent
(add columns for each unit as needed)
...
K1: Total Units
L1: Average Rent
M1: Gross Scheduled Income
N1: Vacancy % (default 5%)
O1: Vacancy Loss
P1: Effective Gross Income

EXPENSES:
Q1: Property Taxes
R1: Insurance
S1: Utilities (if owner-paid)
T1: Maintenance Reserve
U1: Property Management
V1: Repairs & CapEx
W1: Total Operating Expenses
X1: Expense Ratio %

NET OPERATING INCOME:
Y1: NOI

VALUATION:
Z1: Market Cap Rate
AA1: AS-IS VALUE (Income Method)

YOUR EQUITY PLAY:
AB1: Target Contract %
AC1: Your Contract Price
AD1: INSTANT EQUITY
AE1: Assignment Fee %
AF1: YOUR ASSIGNMENT FEE

BUYER'S NUMBERS:
AG1: Buyer Purchase Price
AH1: Buyer's Equity
AI1: Buyer's Equity %
AJ1: Deal Rating
```

### FORMULAS (Start from Row 2):

```
A2: Manual entry (Lead ID)
B2: Manual entry (Property Address)
C2: Manual entry (Number of units)

D2-J2: Manual entry (rent for each unit)

K2: Manual entry (total units, or =C2)

L2: =AVERAGE(D2:J2) (adjust range based on number of units)

M2: =SUM(D2:J2)*12 (or =K2*L2*12)

N2: 0.05 (default 5% vacancy, adjust based on area/class)

O2: =M2*N2

P2: =M2-O2

Q2-V2: Manual entry (actual expenses if known, or use defaults below)
Default expense estimates:
Q2 (Taxes): =M2*0.12 (12% of gross)
R2 (Insurance): =M2*0.04 (4% of gross)
S2 (Utilities): =M2*0.08 (8% if owner-paid, 0 if tenant-paid)
T2 (Maintenance): =M2*0.08 (8% reserve)
U2 (Mgmt): =M2*0.08 (8% if professionally managed)
V2 (Repairs): =M2*0.10 (10% for CapEx reserve)

W2: =SUM(Q2:V2)

X2: =W2/P2 (expense ratio as %)

Y2: =P2-W2 (Net Operating Income)

Z2: Manual entry (market cap rate for area/class)
Winnipeg cap rates 2025:
- Class A (built 2010+): 0.045 (4.5%)
- Class B (1980-2010): 0.060 (6.0%)
- Class C (1950-1980): 0.075 (7.5%)
- Class D (pre-1950): 0.095 (9.5%)

AA2: =Y2/Z2 (Property value = NOI ÷ Cap Rate)

AB2: 0.75 (75% of value - adjust as needed)

AC2: =AA2*AB2

AD2: =AA2-AC2 (Instant equity in your contract)

AE2: 0.35 (35% assignment fee - adjust 30-50%)

AF2: =AD2*AE2 (YOUR PROFIT)

AG2: =AC2+AF2 (What buyer pays)

AH2: =AA2-AG2 (Buyer's equity)

AI2: =AH2/AA2 (Buyer's equity %)

AJ2: =IF(AI2="","",
   IF(AI2>=0.20,"🌟 EXCELLENT",
      IF(AI2>=0.15,"✅ GOOD",
         IF(AI2>=0.10,"⚠️ FAIR","❌ POOR"))))
```

**Conditional Formatting:**

```
Apply to column Y (NOI):
- If > 0 → Green text, bold
- If < 0 → Red text, bold

Apply to column X (Expense Ratio):
- If < 0.40 → Green (great)
- If 0.40-0.50 → Yellow (normal)
- If > 0.50 → Red (high expenses)

Apply to column AF (YOUR ASSIGNMENT FEE):
- If >= 40000 → Dark green background, white text
- If >= 25000 → Light green background
- If >= 15000 → Yellow background
- If < 15000 → No color
```

---

## SHEET 4: OFFERS & NEGOTIATION

**Purpose:** Track all offers made and negotiations

### Column Structure:

```
A1: Lead ID
B1: Property Address
C1: Seller Name
D1: Offer Attempt #
E1: Date Made
F1: Your Contract Price Offered
G1: Assignment Fee (Internal)
H1: Seller Response
I1: Counter Amount (if any)
J1: Final Contract Price
K1: Status
L1: Notes
```

### Data Validation:

```
Column H (Seller Response):
Dropdown:
- Pending (waiting for response)
- Accepted
- Rejected
- Counter-offered
- Needs time to think
- Will get back to us
- Dead (not interested)

Column K (Status):
Dropdown:
- Offer out
- Under negotiation
- Accepted - moving to contract
- Rejected - done
- Rejected - will try again
- Waiting for decision
```

### Formulas:

```
D2: =COUNTIF($B$2:$B2,B2) (auto-numbers attempts for same property)

This automatically tracks: First offer, Second offer, Third offer, etc.
```

---

## SHEET 5: BUYERS DATABASE

**Purpose:** Track your investor buyers for assignments

### Column Structure:

```
A1: Buyer ID
B1: Buyer Name
C1: Company Name
D1: Contact Person
E1: Phone
F1: Email
G1: Buyer Type
H1: Preferred Areas (Winnipeg)
I1: Min Bedrooms
J1: Max Purchase Price
K1: Max Repairs Willing to Do
L1: Cash or Financing
M1: Typical Close Timeline
N1: Deals Closed with Us
O1: Last Contact Date
P1: Rating (1-5 stars)
Q1: Notes
```

### Data Validation:

```
Column G (Buyer Type):
Dropdown:
- House Flipper
- Buy & Hold Landlord
- Developer
- Multi-Family Investor
- Institutional Buyer
- End User (Live-in)
- Wholesaler (like you)

Column L (Cash or Financing):
Dropdown:
- Cash only
- Pre-approved financing
- Hard money lender
- Mix (depends on deal)

Column P (Rating):
Dropdown:
- ⭐⭐⭐⭐⭐ Excellent
- ⭐⭐⭐⭐ Good
- ⭐⭐⭐ Average
- ⭐⭐ Below Average
- ⭐ Poor
```

### Auto-Calculations:

```
A2: =ROW()-1 (auto-numbers buyer IDs)

N2: =COUNTIF('ASSIGNMENTS & CLOSINGS'!D:D,B2)
(Counts how many deals this buyer has closed with you)
```

---

## SHEET 6: ASSIGNMENTS & CLOSINGS

**Purpose:** Track assigned deals and your profits

### Column Structure:

```
A1: Deal ID
B1: Property Address
C1: Seller Name
D1: Buyer Name (from BUYERS DATABASE)
E1: Your Contract Price (with seller)
F1: Assignment Fee
G1: Buyer's Purchase Price (Contract + Fee)
H1: Contract Date
I1: Scheduled Close Date
J1: Actual Close Date
K1: Status
L1: YOUR PROFIT (when closed)
M1: Notes
```

### Data Validation:

```
Column D (Buyer Name):
Create dropdown from BUYERS DATABASE sheet, column B
Formula: =BUYERS DATABASE!B:B

Column K (Status):
Dropdown:
- Under contract (waiting for close)
- Closed (PAID ✅)
- Delayed (new close date needed)
- Fell through (buyer backed out)
- Cancelled
```

### Formulas:

```
A2: =ROW()-1 (auto-numbers deal IDs)

G2: =E2+F2 (auto-calculates total buyer pays)

L2: =IF(K2="Closed (PAID ✅)",F2,0)
(Only shows profit when status = Closed)
```

### Summary Section (Top of sheet):

```
Add these above row 1:

ROW 1:
A1: TOTAL DEALS IN PIPELINE
B1: =COUNTA(B3:B1000)

C1: TOTAL UNDER CONTRACT
D1: =COUNTIF(K3:K1000,"Under contract (waiting for close)")

E1: TOTAL CLOSED
F1: =COUNTIF(K3:K1000,"Closed (PAID ✅)")

ROW 2:
A2: TOTAL POTENTIAL PROFIT (Pipeline)
B2: =SUM(F3:F1000)

C2: PROFIT REALIZED (Closed Deals)
D2: =SUMIF(K3:K1000,"Closed (PAID ✅)",L3:L1000)

Format these cells:
- Bold
- Larger font (14pt)
- Cell color: Dark background with gold text
- Number format: Currency ($)
```

### Conditional Formatting:

```
Apply to column K (Status):
- If "Closed (PAID ✅)" → Green background, white text
- If "Under contract" → Blue background, white text
- If "Fell through" → Red background, white text

Apply to column L (YOUR PROFIT):
- If > 0 → Green text, bold
- Number format: Currency with $ symbol
```

---

## DASHBOARD SUMMARY (Optional - Sheet 7)

**Purpose:** Visual dashboard of key metrics

Create this as a separate sheet for quick overview:

### KPIs:

```
═══════════════════════════════════════════════════════════
                    VELOCITY REAL ESTATE
                    PERFORMANCE DASHBOARD
═══════════════════════════════════════════════════════════

LEADS:
────────────────────────────────────────────
Total Leads:              =COUNTA(LEADS!A:A)-1
Hot Leads (Score >70):    =COUNTIF(LEADS!AJ:AJ,">=70")
Warm Leads (50-69):       =COUNTIFS(LEADS!AJ:AJ,">=50",LEADS!AJ:AJ,"<70")
Normal Leads (30-49):     =COUNTIFS(LEADS!AJ:AJ,">=30",LEADS!AJ:AJ,"<50")

CONVERSION:
────────────────────────────────────────────
Offers Made:              =COUNTA('OFFERS & NEGOTIATION'!A:A)-1
Acceptance Rate:          =COUNTIF('OFFERS & NEGOTIATION'!H:H,"Accepted")/COUNTA('OFFERS & NEGOTIATION'!A:A)
Average Attempts to Close: =AVERAGE('OFFERS & NEGOTIATION'!D:D)

REVENUE:
────────────────────────────────────────────
Deals Closed:             ='ASSIGNMENTS & CLOSINGS'!F1
Total Revenue (Closed):   ='ASSIGNMENTS & CLOSINGS'!D2
Average Assignment Fee:   ='ASSIGNMENTS & CLOSINGS'!D2/'ASSIGNMENTS & CLOSINGS'!F1
Pipeline Value:           ='ASSIGNMENTS & CLOSINGS'!B2

THIS MONTH:
────────────────────────────────────────────
New Leads This Month:     =COUNTIFS(LEADS!A:A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))
Deals Closed This Month:  =COUNTIFS('ASSIGNMENTS & CLOSINGS'!J:J,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))
Revenue This Month:       =SUMIFS('ASSIGNMENTS & CLOSINGS'!L:L,'ASSIGNMENTS & CLOSINGS'!J:J,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))
```

Format this dashboard sheet with:
- Dark background (#1a1a1a)
- Gold headers
- Large, bold numbers
- Currency formatting on $ amounts
- Percentage formatting on rates

---

## COLOR CODING (Apply to all sheets)

```
HEADERS (Row 1 all sheets):
- Background: #0a1929 (Navy)
- Text: #ffffff (White)
- Bold, 12pt font
- Freeze row

DATA ROWS:
- Alternating row colors for readability:
  - Even rows: #1a1a1a (Dark charcoal)
  - Odd rows: #2d2d2d (Slightly lighter)

IMPORTANT COLUMNS (calculated results):
- Border: 2px gold border (#d4af37)
- Background: Slightly darker
- Text: Bold

NUMBER FORMATTING:
- Currency: $###,###
- Percentages: ##.##%
- Dates: MMM DD, YYYY
```

---

## PROTECTION & PERMISSIONS

```
SHEET 1 (LEADS):
- Protect entire sheet (don't allow editing)
- Only allow editing columns AJ-AN (your manual columns)
- Reason: Form auto-populates, don't want to accidentally edit

OTHER SHEETS:
- No protection needed
- You'll be manually entering data
```

---

**THIS IS YOUR COMPLETE GOOGLE SHEETS SYSTEM**

All formulas are copy/paste ready.
Dark mode styling included.
Auto-calculating equity, assignment fees, deal quality.

Next: Zapier automation setup guide
