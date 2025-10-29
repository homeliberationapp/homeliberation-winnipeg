/**
 * BUYER PROFILE SCHEMA
 * Complete buyer data for personalization & intelligent matching
 */

const BuyerProfileSchema = {
  // ═══════════════════════════════════════════════════════════
  // CORE IDENTITY
  // ═══════════════════════════════════════════════════════════
  userId: String,              // Links to auth system
  email: String,
  name: String,
  phone: String,
  phoneVerified: Boolean,

  // Profile customization
  profilePicture: String,      // Cloudinary URL
  bio: String,                 // Optional bio
  companyName: String,         // For professional investors

  // ═══════════════════════════════════════════════════════════
  // INVESTMENT CRITERIA (Critical for matching)
  // ═══════════════════════════════════════════════════════════
  investmentCriteria: {
    // Property types interested in
    propertyTypes: [String],   // ['single-family', 'multi-family', 'apartment', 'commercial']

    // Geographic preferences (Winnipeg neighborhoods)
    preferredNeighborhoods: [String],  // ['River Heights', 'Tuxedo', 'Charleswood']
    avoidNeighborhoods: [String],       // Areas to exclude

    // Budget range
    minBudget: Number,         // Minimum purchase price
    maxBudget: Number,         // Maximum purchase price

    // Units (for multi-family)
    minUnits: Number,          // Minimum units
    maxUnits: Number,          // Maximum units

    // Investment strategy
    strategy: String,          // 'flip', 'rental', 'buy-and-hold', 'wholesale'

    // Minimum return requirements
    minROI: Number,            // Minimum ROI % (e.g., 0.15 = 15%)
    minCashFlow: Number,       // Minimum monthly cash flow
    minCapRate: Number,        // Minimum cap rate (e.g., 0.06 = 6%)

    // Deal quality
    minDealQuality: Number,    // Minimum score (0-100)

    // Repair tolerance
    maxRepairCost: Number,     // Maximum repair budget
    preferTurnkey: Boolean,    // Prefer move-in ready?

    // Speed
    canCloseQuickly: Boolean,  // Can close in <14 days?
    needsFinancing: Boolean    // Needs mortgage or all-cash?
  },

  // ═══════════════════════════════════════════════════════════
  // SAVED SEARCHES (Email alerts)
  // ═══════════════════════════════════════════════════════════
  savedSearches: [{
    id: String,
    name: String,              // User's name for search
    criteria: Object,          // Copy of investmentCriteria
    emailFrequency: String,    // 'instant', 'daily', 'weekly'
    active: Boolean,
    createdAt: Number,
    lastEmailSent: Number
  }],

  // ═══════════════════════════════════════════════════════════
  // BID HISTORY (Track all bids)
  // ═══════════════════════════════════════════════════════════
  bidHistory: [{
    propertyId: String,
    address: String,
    bidAmount: Number,
    bidDate: Number,
    status: String,            // 'pending', 'accepted', 'rejected', 'outbid'
    wonDeal: Boolean,
    closedDate: Number,
    finalPrice: Number
  }],

  // ═══════════════════════════════════════════════════════════
  // PORTFOLIO (Deals won)
  // ═══════════════════════════════════════════════════════════
  portfolio: [{
    propertyId: String,
    address: String,
    purchasePrice: Number,
    purchaseDate: Number,
    arv: Number,
    repairCost: Number,
    currentValue: Number,      // If known
    soldPrice: Number,         // If sold
    soldDate: Number,
    profitRealized: Number,
    roi: Number,
    strategy: String           // What they did with it
  }],

  // ═══════════════════════════════════════════════════════════
  // FINANCIAL CAPACITY (Verify buyer is real)
  // ═══════════════════════════════════════════════════════════
  financial: {
    proofOfFundsVerified: Boolean,
    proofOfFundsDocument: String,    // Cloudinary URL
    verifiedAmount: Number,          // How much they can spend
    verifiedDate: Number,

    preApprovalLetter: String,       // If using financing
    preApprovalAmount: Number,
    lenderName: String,

    creditScore: Number,             // Optional
    llcFormed: Boolean,              // Professional investor?
    llcName: String
  },

  // ═══════════════════════════════════════════════════════════
  // PERFORMANCE METRICS (AI learns from this)
  // ═══════════════════════════════════════════════════════════
  performance: {
    totalBidsPlaced: Number,
    dealsWon: Number,
    winRate: Number,               // Percentage of bids won
    averageResponseTime: Number,   // Minutes to respond to new deal
    averageCloseTime: Number,      // Days from bid to close
    defaultRate: Number,           // Percentage of deals backed out
    totalSpent: Number,            // Lifetime spend
    totalProfit: Number,           // Lifetime profit (if known)
    avgROI: Number,                // Average ROI across portfolio
    reputation: Number             // Score 0-100 (calculated)
  },

  // ═══════════════════════════════════════════════════════════
  // SUBSCRIPTION (Tiered access)
  // ═══════════════════════════════════════════════════════════
  subscription: {
    tier: String,                  // 'beta' (free), 'investor' ($79), 'pro' ($199)
    status: String,                // 'active', 'paused', 'cancelled'
    startDate: Number,
    renewalDate: Number,
    paymentMethod: String,

    // Tier benefits
    dealsPerMonth: Number,         // How many deals can view
    dealsViewedThisMonth: Number,
    earlyAccess: Boolean,          // See deals before public?
    exclusiveDeals: Boolean        // Access to VIP-only deals?
  },

  // ═══════════════════════════════════════════════════════════
  // NOTIFICATIONS & PREFERENCES
  // ═══════════════════════════════════════════════════════════
  notifications: {
    email: {
      newDeals: Boolean,           // Instant email when match
      dailyDigest: Boolean,        // Daily summary
      weeklyReport: Boolean,       // Weekly market report
      bidUpdates: Boolean,         // When bid status changes
      outbid: Boolean,             // When someone bids higher
      dealClosed: Boolean          // When deal closes
    },

    sms: {
      enabled: Boolean,
      newDeals: Boolean,           // Instant SMS for hot deals
      bidUpdates: Boolean,
      urgentOnly: Boolean          // Only critical notifications
    },

    push: {
      enabled: Boolean,
      newDeals: Boolean,
      bidUpdates: Boolean
    },

    // Quiet hours
    quietHours: {
      enabled: Boolean,
      startTime: String,           // '22:00'
      endTime: String,             // '08:00'
      timezone: String
    }
  },

  // ═══════════════════════════════════════════════════════════
  // BEHAVIOR TRACKING (AI learns patterns)
  // ═══════════════════════════════════════════════════════════
  behavior: {
    lastLogin: Number,
    totalLogins: Number,
    averageSessionDuration: Number,    // Seconds

    // What they look at
    propertiesViewed: Number,
    favoritesAdded: Number,
    searchesPerformed: Number,

    // Engagement
    emailOpenRate: Number,
    emailClickRate: Number,
    smsResponseRate: Number,

    // Patterns (AI fills this)
    preferredDayOfWeek: String,        // When they're most active
    preferredTimeOfDay: String,        // When they respond fastest
    personalityType: String,           // 'aggressive', 'cautious', 'analytical'
    decisionSpeed: String              // 'fast', 'moderate', 'slow'
  },

  // ═══════════════════════════════════════════════════════════
  // REFERRALS & SOCIAL
  // ═══════════════════════════════════════════════════════════
  referrals: {
    referralCode: String,              // Unique code to share
    referredBy: String,                // Who referred them
    referredBuyers: [String],          // Buyers they referred
    referralEarnings: Number,          // $1,000 per referral
    referralCredits: Number            // Credits to use on deals
  },

  // ═══════════════════════════════════════════════════════════
  // TAGS & SEGMENTATION
  // ═══════════════════════════════════════════════════════════
  tags: [String],                      // ['high-value', 'fast-closer', 'multi-family-expert']
  segment: String,                     // 'vip', 'active', 'inactive', 'churned'
  priority: Number,                    // 1-10 (10 = highest priority buyer)

  // ═══════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════
  createdAt: Number,
  updatedAt: Number,
  lastActivityAt: Number,

  // Account status
  status: String,                      // 'active', 'suspended', 'banned'
  suspendedReason: String,
  notes: String                        // Admin notes
};

module.exports = BuyerProfileSchema;
