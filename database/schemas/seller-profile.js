/**
 * SELLER PROFILE SCHEMA
 * Complete seller data + document vault + communication tracking
 */

const SellerProfileSchema = {
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

  // ═══════════════════════════════════════════════════════════
  // PROPERTY INFORMATION
  // ═══════════════════════════════════════════════════════════
  properties: [{
    id: String,
    status: String,            // 'submitted', 'analyzing', 'offer-sent', 'negotiating', 'signed', 'closed', 'cancelled'

    // Address
    address: String,
    city: String,              // Always 'Winnipeg'
    province: String,          // Always 'Manitoba'
    postalCode: String,
    neighborhood: String,

    // Property details
    propertyType: String,      // 'single-family', 'multi-family', 'condo', 'townhouse'
    units: Number,
    bedrooms: Number,
    bathrooms: Number,
    squareFeet: Number,
    lotSize: String,
    yearBuilt: Number,
    garage: Boolean,
    basement: String,          // 'finished', 'unfinished', 'none'

    // Condition
    overallCondition: String,  // 'excellent', 'good', 'fair', 'poor'
    repairsNeeded: [String],   // ['roof', 'furnace', 'foundation']
    estimatedRepairCost: Number,

    // Photos
    photos: [String],          // Cloudinary URLs
    photosTaken: Boolean,

    // Current situation
    currentMortgageBalance: Number,
    mortgageHolder: String,
    monthlyPayment: Number,
    propertyTaxes: Number,
    otherLiens: Number,

    // Seller motivation (CRITICAL)
    motivationLevel: Number,   // 1-10 (10 = desperate)
    motivationReasons: [String], // ['foreclosure', 'divorce', 'job-loss', 'inherited', 'downsizing']
    timeframe: String,         // '<7 days', '<30 days', '<90 days', 'flexible'
    urgencyScore: Number,      // Calculated 0-100

    // Our analysis
    arv: Number,               // After-repair value
    arvConfidence: Number,     // 0-100%
    ourOffer: Number,
    offerDate: Number,
    offerExpiresAt: Number,    // 36-hour timer
    offerAccepted: Boolean,
    acceptedDate: Number,

    // Assignment details (if signed)
    assignmentFee: Number,
    buyerAssignedTo: String,   // Buyer ID
    buyerName: String,
    closingDate: Number,
    closedDate: Number,
    finalSalePrice: Number,

    // Flags
    isForeclosure: Boolean,
    needsManualReview: Boolean,
    manualReviewReasons: [String],
    adminHoldStatus: String,   // From admin hold system
    holdReason: String,

    // Timestamps
    submittedAt: Number,
    analyzedAt: Number,
    offerSentAt: Number,
    signedAt: Number,
    closedAt: Number
  }],

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT VAULT (Critical for trust)
  // ═══════════════════════════════════════════════════════════
  documents: [{
    id: String,
    type: String,              // 'mortgage-statement', 'tax-bill', 'title', 'id', 'proof-of-ownership'
    fileName: String,
    fileUrl: String,           // Cloudinary URL (encrypted)
    fileSize: Number,
    mimeType: String,
    uploadedAt: Number,
    verified: Boolean,         // Admin verified?
    verifiedBy: String,        // Admin ID
    verifiedAt: Number,
    propertyId: String,        // Which property this belongs to
    notes: String
  }],

  // ═══════════════════════════════════════════════════════════
  // COMMUNICATION HISTORY (Every interaction logged)
  // ═══════════════════════════════════════════════════════════
  communications: [{
    id: String,
    type: String,              // 'email', 'sms', 'call', 'meeting'
    direction: String,         // 'inbound', 'outbound'
    subject: String,
    message: String,
    sentBy: String,            // Admin ID or 'system'
    sentAt: Number,
    opened: Boolean,
    openedAt: Number,
    clicked: Boolean,
    replied: Boolean,
    repliedAt: Number,
    propertyId: String         // Which property discussed
  }],

  // ═══════════════════════════════════════════════════════════
  // SELLER PSYCHOLOGY (AI learns this)
  // ═══════════════════════════════════════════════════════════
  psychology: {
    painPoints: [String],      // ['behind-on-payments', 'inherited-unwanted', 'divorce']
    emotionalState: String,    // 'desperate', 'stressed', 'calm', 'optimistic'
    decisionMaker: String,     // 'self', 'spouse', 'family', 'lawyer'
    negotiationStyle: String,  // 'firm', 'flexible', 'emotional', 'analytical'
    trustLevel: Number,        // 0-100 (do they trust us?)
    priceExpectation: String,  // 'realistic', 'high', 'flexible'
    likelyToAccept: Number     // AI prediction 0-100%
  },

  // ═══════════════════════════════════════════════════════════
  // FOLLOW-UP TRACKING (Nurture sequence)
  // ═══════════════════════════════════════════════════════════
  followUp: {
    currentStage: String,      // 'initial', 'offer-sent', 'negotiating', 'closed'
    nextFollowUpDate: Number,
    followUpCount: Number,
    lastContactDate: Number,
    lastContactMethod: String,

    // 14-day nurture sequence
    nurtureSequence: {
      day0: Boolean,           // Confirmation email
      day1: Boolean,           // Educational content
      day3: Boolean,           // Social proof
      day7: Boolean,           // Urgency reminder
      day14: Boolean,          // Final offer
      completed: Boolean
    },

    // Response tracking
    emailResponses: Number,
    smsResponses: Number,
    callAnswered: Number,
    callMissed: Number,
    responseRate: Number       // Overall responsiveness
  },

  // ═══════════════════════════════════════════════════════════
  // REFERRALS
  // ═══════════════════════════════════════════════════════════
  referrals: {
    referredBy: String,        // Who referred them
    referralSource: String,    // 'google', 'facebook', 'friend', 'lawyer'
    referredSellers: [String], // Sellers they referred
    referralEarnings: Number   // $1,000 per referral
  },

  // ═══════════════════════════════════════════════════════════
  // NOTIFICATIONS & PREFERENCES
  // ═══════════════════════════════════════════════════════════
  notifications: {
    email: {
      offerReady: Boolean,
      statusUpdates: Boolean,
      closingReminders: Boolean,
      marketUpdates: Boolean
    },

    sms: {
      enabled: Boolean,
      offerReady: Boolean,
      urgentOnly: Boolean
    },

    // Preferred contact method
    preferredMethod: String,   // 'email', 'sms', 'call'
    preferredTime: String,     // 'morning', 'afternoon', 'evening'

    // Quiet hours
    quietHours: {
      enabled: Boolean,
      startTime: String,
      endTime: String
    }
  },

  // ═══════════════════════════════════════════════════════════
  // TAGS & SEGMENTATION
  // ═══════════════════════════════════════════════════════════
  tags: [String],              // ['hot-lead', 'foreclosure', 'inherited', 'quick-close']
  segment: String,             // 'hot', 'warm', 'cold', 'dead'
  leadScore: Number,           // 0-100 (calculated by AI)
  priority: Number,            // 1-10 (10 = call immediately)

  // ═══════════════════════════════════════════════════════════
  // LEGAL & COMPLIANCE
  // ═══════════════════════════════════════════════════════════
  legal: {
    contractSigned: Boolean,
    contractSignedDate: Number,
    contractUrl: String,       // Cloudinary URL

    // Assignment agreement
    assignmentSigned: Boolean,
    assignmentDate: Number,
    assignmentUrl: String,

    // Disclosures
    disclosuresReceived: Boolean,
    disclosureUrls: [String],

    // Lawyer info
    lawyerName: String,
    lawyerEmail: String,
    lawyerPhone: String,
    closingBooked: Boolean,
    closingDate: Number,
    closingLocation: String
  },

  // ═══════════════════════════════════════════════════════════
  // FINANCIAL SUMMARY
  // ═══════════════════════════════════════════════════════════
  financial: {
    totalPropertiesSubmitted: Number,
    totalPropertiesSold: Number,
    totalMoneyReceived: Number,        // What seller got
    avgOfferAcceptance: Number,        // % of our offers accepted
    avgTimeToClose: Number             // Days from submission to close
  },

  // ═══════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════
  createdAt: Number,
  updatedAt: Number,
  lastActivityAt: Number,

  // Account status
  status: String,              // 'active', 'closed', 'banned'
  statusReason: String,
  notes: String                // Admin notes
};

module.exports = SellerProfileSchema;
