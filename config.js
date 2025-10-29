// ═══════════════════════════════════════════════════════════
// VELOCITY REAL ESTATE - MASTER CONFIGURATION
// Automated Wholesale Property Platform
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  // ─────────────────────────────────────────────────────────
  // BRANDING & IDENTITY
  // ─────────────────────────────────────────────────────────
  brand: {
    name: "Velocity Real Estate",
    tagline: {
      seller: "Exit Fast, Exit Fair",
      buyer: "First Access to Wholesale Deals"
    },
    domain: "velocityrealestate.ca",
    email: "offers@velocityrealestate.ca",
    phone: "204-VEL-FAST", // 204-835-3278
    logo: "", // base64 or URL
    colors: {
      primary: "#0F172A",     // Navy (trust, professional)
      secondary: "#F59E0B",   // Amber (urgency, value)
      success: "#10B981",     // Green (money, go)
      warning: "#F59E0B",     // Amber
      danger: "#EF4444",      // Red
      background: "#F8FAFC",  // Light gray
      text: "#1E293B"         // Dark slate
    }
  },

  // ─────────────────────────────────────────────────────────
  // REGION SETTINGS
  // ─────────────────────────────────────────────────────────
  region: {
    code: "MB",              // Province/State code
    city: "Winnipeg",
    country: "CA",
    timezone: "America/Winnipeg",
    currency: "CAD",
    currencySymbol: "$"
  },

  // ─────────────────────────────────────────────────────────
  // TAX RATES BY REGION
  // ─────────────────────────────────────────────────────────
  taxRates: {
    MB: 0.05,    // Manitoba GST
    AB: 0.05,    // Alberta GST
    ON: 0.13,    // Ontario HST
    BC: 0.05,    // BC GST
    QC: 0.14975, // Quebec GST+QST
    SK: 0.05,    // Saskatchewan GST
    TX: 0.00,    // Texas (no state tax)
    FL: 0.00,    // Florida (no state tax)
    OH: 0.00     // Ohio (no state tax)
  },

  // ─────────────────────────────────────────────────────────
  // MARKET DATA (auto-updated nightly from real sources)
  // ─────────────────────────────────────────────────────────
  market: {
    defaultARV: 300000,         // Fallback if no comps found
    capRate: 0.054,             // Cap rate for investors
    repairCostPerSqFt: 20,      // Average repair cost
    holdingCostPerMonth: 1500,  // Carrying costs

    // Auto-update sources (scraped nightly at 2 AM)
    dataSources: {
      propertyAssessment: "https://assessment.winnipeg.ca/asmttax/",
      mlsComps: "realtor.ca",  // Scrape sold listings
      courtRecords: "https://web43.gov.mb.ca/Registry/SearchByPartyName.aspx",
      permits: "https://cityapps.winnipeg.ca/PublicDocs/",
      taxDelinquency: "City of Winnipeg Tax Search"
    }
  },

  // ─────────────────────────────────────────────────────────
  // FEE STRUCTURE & MONETIZATION
  // ─────────────────────────────────────────────────────────
  fees: {
    // ASSIGNMENT FEES (Primary Revenue)
    defaultAssignmentFee: 20000,  // Target assignment fee
    minFee: 10000,                // Minimum to make deal worthwhile
    maxFee: 100000,               // Cap for large properties

    // DEPOSIT SYSTEM (Locks in serious buyers)
    depositAmount: 1500,          // Earnest money deposit from buyer
    depositRefundable: true,      // Refundable if deal falls through
    depositRefundDays: 10,        // Due diligence period

    // BUYER SUBSCRIPTION TIERS (Secondary Revenue)
    subscriptionTiers: {
      beta: {
        price: 0,              // FREE for first 6 months
        dealsPerMonth: 3,      // Limited access
        exclusiveWindow: 0,    // No head start
        features: ["Basic property data", "3 deal views/month"]
      },
      investor: {
        price: 79,             // $79/month after beta
        dealsPerMonth: -1,     // Unlimited
        exclusiveWindow: 48,   // 48-hour exclusive access
        features: ["Unlimited deals", "Full data packs", "48h exclusive", "Google Sheets export"]
      },
      pro: {
        price: 199,            // $199/month
        dealsPerMonth: -1,     // Unlimited
        exclusiveWindow: 72,   // 72-hour head start
        features: ["Everything in Investor", "API access", "Custom alerts", "Priority support"]
      }
    },

    // REFERRAL REWARDS (Viral Growth)
    referralBonus: 1000,          // $1000 for successful referral
    shadowBidCredit: 1500,        // Credit if primary buyer defaults

    // PROFIT TARGETS
    targetDealsPerMonth: 2,       // Conservative goal
    targetAssignmentFee: 20000,   // Average assignment fee
    targetMonthlyRevenue: 40000   // 2 deals x $20k = $40k/month
  },

  // ─────────────────────────────────────────────────────────
  // AUTOMATION TRIGGERS (The Money-Making Engine)
  // ─────────────────────────────────────────────────────────
  triggers: {
    // SELLER-SIDE AUTOMATION
    offerValidityHours: 48,       // Real urgency (market changes)
    secondChanceDelayHours: 48,   // Follow-up if no response
    autoOfferThreshold: 70,       // Auto-send offer if score >70

    // BUYER-SIDE AUTOMATION
    fomoBidThreshold: 2,          // Show competition after 2 bids
    shadowBidDelayHours: 2,       // Alert runner-up after assignment
    exclusiveWindowHours: 48,     // Premium members see deals first

    // REAL SCARCITY (Not Fake)
    maxOffersPerWeek: 3,          // Limit volume per area
    maxInvestorsPerZip: 50,       // Limit competition

    // SOCIAL PROOF (Real Data)
    showRecentClosings: true,     // "5 properties closed in R3T this month"
    showActiveBids: true,         // "3 investors bidding on this deal"
    showInvestorCount: true       // "47 active investors in Winnipeg"
  },

  // ─────────────────────────────────────────────────────────
  // LEAD SCORING ALGORITHM (Prioritize Hot Leads)
  // ─────────────────────────────────────────────────────────
  scoring: {
    highScoreThreshold: 70,      // Auto-call + instant offer
    mediumScoreThreshold: 40,    // Follow-up in 24h

    weights: {
      urgency: {
        '<7 days': 40,           // Highest priority
        '<30 days': 25,
        '<90 days': 15,
        'flexible': 5
      },
      units: {
        '1-4': 15,               // Single/small multi
        '5-20': 25,              // Mid-size multi (sweet spot)
        '21-100': 35,            // Large multi ($$$$)
        '100+': 40               // Portfolio (rare but huge)
      },
      equity: {
        'high': 20,              // Low mortgage = motivated
        'medium': 10,
        'low': 0
      },
      contactQuality: {
        phoneAndEmail: 15,       // Both = serious
        phoneOnly: 10,
        emailOnly: 5
      },
      propertyCondition: {
        'needsWork': 15,         // Better for wholesale
        'goodCondition': 5,
        'excellent': 0
      }
    }
  },

  // ─────────────────────────────────────────────────────────
  // OFFER CALCULATION (Automated ARV-Based Offers)
  // ─────────────────────────────────────────────────────────
  offerCalculation: {
    // FORMULA: Offer = (ARV * multiplier) - Repairs - Holding - AssignmentFee - BuyerProfit

    arvMultiplier: 0.70,         // Start at 70% ARV
    buyerTargetProfit: 0.15,     // Buyer needs 15% ARV profit

    bands: {
      green: {                   // BEST DEALS (Auto-approve)
        minSpread: 0.12,         // 12%+ spread
        arvRange: '70-75%',
        label: 'Excellent Deal',
        autoApprove: true
      },
      yellow: {                  // GOOD DEALS (Manual review)
        minSpread: 0.10,         // 10-12% spread
        arvRange: '65-69%',
        label: 'Good Deal',
        autoApprove: false
      },
      red: {                     // TIGHT MARGINS (Risky)
        minSpread: 0.00,         // <10% spread
        arvRange: '60-64%',
        label: 'Tight Margins',
        autoApprove: false
      }
    },

    // REPAIR COST ESTIMATION
    repairEstimates: {
      excellent: 0,              // No repairs needed
      good: 5000,                // Minor cosmetic
      fair: 15000,               // Kitchen, bath, flooring
      poor: 40000,               // Major structural
      teardown: 80000            // Gut renovation
    }
  },

  // ─────────────────────────────────────────────────────────
  // LEGAL & COMPLIANCE
  // ─────────────────────────────────────────────────────────
  legal: {
    // ASSIGNMENT CONTRACT LANGUAGE (Region-Specific)
    assignmentClauses: {
      MB: "This is an assignment of purchase agreement under Manitoba law. Velocity Real Estate is not a licensed real estate broker. All parties should seek independent legal advice.",
      AB: "This is an assignment of purchase agreement under Alberta law. Velocity Real Estate is not a licensed real estate broker. All parties should seek independent legal advice.",
      ON: "This is an assignment of purchase agreement under Ontario law. Velocity Real Estate is not a licensed real estate broker. All parties should seek independent legal advice.",
      BC: "This is an assignment of purchase agreement under British Columbia law. Velocity Real Estate is not a licensed real estate broker. All parties should seek independent legal advice."
    },

    // DISCLAIMERS (Protect Yourself)
    disclaimers: {
      seller: "This offer is for an assignment contract, not a direct purchase. We will assign this contract to a qualified buyer. You should consult a lawyer before signing.",
      buyer: "Property data is aggregated from public sources. We recommend independent due diligence before finalizing purchase.",
      general: "Velocity Real Estate provides wholesale real estate services only. We do not provide legal, financial, or tax advice."
    },

    // SELLER PROTECTION (Prevent Buyer Circumvention)
    sellerProtectionScript: "If the buyer or anyone else contacts you directly, refer them to Velocity Real Estate at {PHONE}. Our contract protects your interests."
  },

  // ─────────────────────────────────────────────────────────
  // API KEYS & INTEGRATIONS
  // ─────────────────────────────────────────────────────────
  integrations: {
    // GOOGLE MAPS (Geocoding, Street View, Neighborhood Data)
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_KEY || '',
      features: ['geocoding', 'streetview', 'places']
    },

    // TWILIO (SMS Automation)
    twilio: {
      accountSid: process.env.TWILIO_SID || '',
      authToken: process.env.TWILIO_TOKEN || '',
      fromNumber: process.env.TWILIO_PHONE || '',
      useCase: ['offer notifications', 'high-score alerts', 'follow-ups']
    },

    // SENDGRID (Email Automation)
    sendgrid: {
      apiKey: process.env.SENDGRID_KEY || '',
      fromEmail: 'offers@velocityrealestate.ca',
      fromName: 'Velocity Real Estate',
      templates: {
        offerLetter: 'd-xxxxx',
        propertyReport: 'd-xxxxx',
        buyerAlert: 'd-xxxxx'
      }
    },

    // STRIPE (Payment Processing)
    stripe: {
      publicKey: process.env.STRIPE_PUBLIC_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      products: {
        investorSub: 'price_xxxxx',
        proSub: 'price_xxxxx',
        earnestDeposit: 'price_xxxxx'
      }
    },

    // DOCUSIGN (E-Signatures)
    docusign: {
      integrationKey: process.env.DOCUSIGN_KEY || '',
      accountId: process.env.DOCUSIGN_ACCOUNT_ID || '',
      templates: {
        assignmentContract: 'template_id_xxxxx',
        purchaseAgreement: 'template_id_xxxxx'
      }
    },

    // GOOGLE SHEETS (Command Center)
    googleSheets: {
      credentialsPath: process.env.GOOGLE_SHEETS_CREDS || '',
      spreadsheetId: process.env.SHEETS_ID || '',
      sheets: {
        leads: 'Seller Leads',
        deals: 'Active Deals',
        buyers: 'Buyer Database',
        revenue: 'Revenue Tracker',
        market: 'Market Data'
      }
    },

    // HUBSPOT (CRM - Optional)
    hubspot: {
      token: process.env.HUBSPOT_TOKEN || '',
      pipelineName: 'Wholesale Pipeline'
    }
  },

  // ─────────────────────────────────────────────────────────
  // AUTOMATION SCHEDULE (When Bots Run)
  // ─────────────────────────────────────────────────────────
  automation: {
    // DATA SCRAPING (Nightly Updates)
    scrapingSchedule: {
      propertyData: '02:00',      // 2 AM daily
      marketComps: '03:00',        // 3 AM daily
      courtRecords: '04:00',       // 4 AM daily
      buildingPermits: '05:00'     // 5 AM daily
    },

    // SELLER FOLLOW-UPS
    followUpSchedule: {
      secondChance: 48,            // Hours after initial offer
      thirdTouch: 120,             // 5 days after second chance
      finalTouch: 336              // 14 days (2 weeks)
    },

    // BUYER ALERTS
    buyerAlerts: {
      newDealNotification: 'immediate',    // Push notification
      weeklyDigest: 'Monday 9:00 AM',      // Weekly deal summary
      exclusiveExpiring: '6 hours before'  // Remind premium members
    },

    // BACKUPS & REPORTS
    backups: {
      database: '01:00 daily',
      googleSheets: '06:00 daily',
      monthlyRevenue: '1st of month 8:00 AM'
    }
  },

  // ─────────────────────────────────────────────────────────
  // SELLER INTAKE FORM (What We Ask)
  // ─────────────────────────────────────────────────────────
  wizardQuestions: [
    {
      q: "What's the property address?",
      id: "address",
      type: "text",
      required: true,
      placeholder: "123 Main St, Winnipeg, MB",
      validation: "address"
    },
    {
      q: "Your phone number",
      id: "phone",
      type: "tel",
      required: true,
      placeholder: "204-555-1234",
      validation: "phone"
    },
    {
      q: "Your email",
      id: "email",
      type: "email",
      required: true,
      placeholder: "you@example.com",
      validation: "email"
    },
    {
      q: "Property type",
      id: "propertyType",
      type: "select",
      required: true,
      opts: ["Single Family", "Duplex", "Triplex", "4-Plex", "5-20 Units", "20+ Units", "Commercial"]
    },
    {
      q: "Estimated mortgage balance",
      id: "mortgage",
      type: "range",
      min: 0,
      max: 2000000,
      step: 10000,
      helpText: "Approximate is fine - we'll verify with public records"
    },
    {
      q: "Property condition",
      id: "condition",
      type: "select",
      opts: ["Excellent (move-in ready)", "Good (minor repairs)", "Fair (needs work)", "Poor (major repairs)", "Needs gut renovation"]
    },
    {
      q: "How quickly do you need to close?",
      id: "urgency",
      type: "select",
      required: true,
      opts: ["ASAP (< 7 days)", "This month (< 30 days)", "Within 3 months", "Flexible"]
    },
    {
      q: "Why are you selling? (Optional but helps us serve you better)",
      id: "reason",
      type: "select",
      opts: ["Inherited property", "Tired landlord", "Relocating", "Downsizing", "Financial difficulty", "Other"]
    }
  ],

  // ─────────────────────────────────────────────────────────
  // COPY & MESSAGING
  // ─────────────────────────────────────────────────────────
  copy: {
    // SELLER-SIDE LANDING PAGE
    seller: {
      headline: "Need to Sell Your Property Fast?",
      subheadline: "Get a fair cash offer in 24 hours. Close on your timeline.",
      cta: "Get My Free Property Report",
      valueProps: [
        "Cash offer within 24 hours",
        "We handle repairs, tenants, & paperwork",
        "Close in 7-30 days (you choose)",
        "No realtor fees or commissions",
        "See exactly how we calculated our offer"
      ],
      socialProof: "✓ {COUNT} properties purchased in {CITY} this year",
      scarcity: "⚠️ We can only make {SLOTS_LEFT} more offers this week in your area"
    },

    // BUYER-SIDE LANDING PAGE
    buyer: {
      headline: "Stop Chasing Deals. Get Them Delivered.",
      subheadline: "Curated wholesale properties with full due diligence done for you.",
      cta: "Browse Current Deals",
      valueProps: [
        "Verified wholesale deals (we did the research)",
        "Full property data pack (ARV, comps, photos, repair estimates)",
        "Exclusive access before public market",
        "Transparent assignment fees (no surprises)"
      ],
      socialProof: "🔥 {COUNT} active investors competing for deals",
      scarcity: "⚠️ Only {SLOTS_LEFT} investor spots available in {ZIP}"
    },

    // EMAIL TEMPLATES
    emails: {
      offerSent: {
        subject: "Your Property Report & Cash Offer - {ADDRESS}",
        preview: "See how we calculated our offer with real market data",
        body: `Hi {NAME},\n\nThank you for reaching out about {ADDRESS}.\n\nI've personally reviewed your property and prepared a comprehensive market report.\n\nHere's what we found:\n• Current Market Value (ARV): {ARV}\n• Based on 3 recent sales in your area\n• Estimated repairs needed: {REPAIRS}\n• Our cash offer: {OFFER}\n\nThis offer is valid for 48 hours (market conditions change quickly).\n\nView your full property report here: {REPORT_LINK}\n\nQuestions? Reply to this email or call me at {PHONE}.\n\nBest,\nVelocity Real Estate Team`
      },

      buyerNewDeal: {
        subject: "New Wholesale Deal Alert - {ADDRESS}",
        preview: "{BEDS}bd/{BATHS}ba • ARV ${ARV} • Assignment Fee ${FEE}",
        body: `New deal just added:\n\n{ADDRESS}\n{BEDS} bed / {BATHS} bath\nARV: ${ARV}\nAssignment Fee: ${FEE}\nProfit Potential: ${PROFIT}\n\nView full data pack: {DEAL_LINK}\n\n{EXCLUSIVE_NOTICE}\n\n{BID_COUNT} investors already viewing this deal.`
      },

      secondChance: {
        subject: "Still interested in selling {ADDRESS}?",
        body: "Hi {NAME},\n\nI sent you a cash offer for {ADDRESS} a couple days ago.\n\nJust wanted to check in - are you still looking to sell?\n\nOur offer of ${OFFER} is still valid, but market conditions change quickly.\n\nReply YES if you'd like to move forward.\nReply MAYBE if you have questions.\nReply NO if you're no longer interested.\n\nThanks,\nVelocity Real Estate"
      }
    },

    // SMS TEMPLATES
    sms: {
      highScore: "Your property at {ADDRESS} qualifies for our fast-track offer! Expect detailed email in 2 hours. Reply STOP to opt out.",
      offerReady: "Your cash offer for {ADDRESS} is ready: ${OFFER}. Check your email for full details. Questions? Call {PHONE}",
      secondChance: "Still considering selling {ADDRESS}? Our ${OFFER} offer is valid until {EXPIRY}. Reply YES to proceed or CALL to discuss.",
      buyerAlert: "New wholesale deal: {ADDRESS} - {BEDS}/{BATHS} - ARV ${ARV} - Fee ${FEE}. View: {LINK}"
    }
  },

  // ─────────────────────────────────────────────────────────
  // REGIONAL DEPLOYMENT PRESETS (Multi-City Expansion)
  // ─────────────────────────────────────────────────────────
  deploymentPresets: {
    Winnipeg: {
      region: 'MB',
      city: 'Winnipeg',
      capRate: 0.054,
      avgARV: 300000,
      phone: '204-VEL-FAST',
      timezone: 'America/Winnipeg'
    },
    Calgary: {
      region: 'AB',
      city: 'Calgary',
      capRate: 0.055,
      avgARV: 450000,
      phone: '403-VEL-FAST',
      timezone: 'America/Edmonton'
    },
    Toronto: {
      region: 'ON',
      city: 'Toronto',
      capRate: 0.056,
      avgARV: 800000,
      phone: '416-VEL-FAST',
      timezone: 'America/Toronto'
    },
    Vancouver: {
      region: 'BC',
      city: 'Vancouver',
      capRate: 0.057,
      avgARV: 1200000,
      phone: '604-VEL-FAST',
      timezone: 'America/Vancouver'
    }
  }
};

// ═══════════════════════════════════════════════════════════
// RUNTIME HELPERS
// ═══════════════════════════════════════════════════════════

// Calculate offer automatically
CONFIG.calculateOffer = function(arv, repairs, assignmentFee = CONFIG.fees.defaultAssignmentFee) {
  const buyerProfit = arv * CONFIG.offerCalculation.buyerTargetProfit;
  const holding = CONFIG.market.holdingCostPerMonth * 3; // Assume 3 months

  const offer = (arv * CONFIG.offerCalculation.arvMultiplier) - repairs - holding - assignmentFee - buyerProfit;

  return {
    offer: Math.round(offer / 1000) * 1000, // Round to nearest $1000
    arv,
    repairs,
    holding,
    assignmentFee,
    buyerProfit,
    spread: (arv - offer) / arv,
    band: CONFIG.getBand((arv - offer) / arv)
  };
};

// Get deal quality band
CONFIG.getBand = function(spread) {
  if (spread >= CONFIG.offerCalculation.bands.green.minSpread) return 'green';
  if (spread >= CONFIG.offerCalculation.bands.yellow.minSpread) return 'yellow';
  return 'red';
};

// Calculate lead score
CONFIG.calculateScore = function(lead) {
  let score = 0;

  // Urgency
  score += CONFIG.scoring.weights.urgency[lead.urgency] || 0;

  // Units
  score += CONFIG.scoring.weights.units[lead.units] || 0;

  // Contact quality
  if (lead.phone && lead.email) score += CONFIG.scoring.weights.contactQuality.phoneAndEmail;
  else if (lead.phone) score += CONFIG.scoring.weights.contactQuality.phoneOnly;
  else if (lead.email) score += CONFIG.scoring.weights.contactQuality.emailOnly;

  // Property condition (worse = better for wholesale)
  const conditionMap = {
    'Needs gut renovation': 15,
    'Poor (major repairs)': 12,
    'Fair (needs work)': 10,
    'Good (minor repairs)': 5,
    'Excellent (move-in ready)': 0
  };
  score += conditionMap[lead.condition] || 0;

  return score;
};

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
