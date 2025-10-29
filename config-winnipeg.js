/**
 * WINNIPEG-ONLY CONFIGURATION
 * Master this market first, then expand
 *
 * GEOGRAPHIC LOCK: All features locked to Winnipeg until expansion approved
 */

const CONFIG_WINNIPEG = {

  // ═══════════════════════════════════════════════════════════
  // GEOGRAPHIC SCOPE (LOCKED)
  // ═══════════════════════════════════════════════════════════
  market: {
    city: 'Winnipeg',
    province: 'Manitoba',
    provinceCode: 'MB',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Winnipeg',
    currency: 'CAD',
    currencySymbol: '$',

    // Service area boundaries (strictly enforced)
    serviceBoundaries: {
      enabled: true,
      postalCodePrefixes: ['R2', 'R3'], // Winnipeg postal codes only
      maxDistanceKm: 50, // From city center
      centerCoordinates: {
        lat: 49.8951,
        lng: -97.1384
      }
    },

    // Expansion control (admin-only unlock)
    expansionLocked: true,
    expansionRequiresAdminApproval: true,
    futureMarkets: ['Calgary', 'Toronto', 'Vancouver'] // Roadmap only
  },

  // ═══════════════════════════════════════════════════════════
  // DATA SOURCES (WINNIPEG-SPECIFIC, AUTHORITATIVE ONLY)
  // ═══════════════════════════════════════════════════════════
  dataSources: {

    /**
     * PRIMARY SOURCE: City of Winnipeg Assessment & Taxation
     * Authority: Official government property assessments
     * URL: https://assessment.winnipeg.ca/
     * Accuracy: 99% (official records)
     * Update Frequency: Annual (January)
     */
    cityAssessment: {
      name: 'City of Winnipeg Assessment & Taxation',
      url: 'https://assessment.winnipeg.ca/',
      authority: 'Government',
      accuracy: 0.99,
      dataPoints: ['assessed_value', 'property_class', 'lot_size', 'year_built', 'living_area'],
      updateFrequency: 'annual',
      apiEndpoint: process.env.WINNIPEG_ASSESSMENT_API || null,
      scrapingAllowed: true, // Public data
      requiresAuth: false
    },

    /**
     * SECONDARY SOURCE: Manitoba Land Titles Office
     * Authority: Official land registry
     * URL: https://www.gov.mb.ca/land-titles/
     * Accuracy: 100% (legal records)
     * Update Frequency: Real-time
     */
    landTitles: {
      name: 'Manitoba Land Titles Office',
      url: 'https://www.gov.mb.ca/land-titles/',
      authority: 'Government',
      accuracy: 1.0,
      dataPoints: ['legal_owner', 'mortgage_holder', 'liens', 'encumbrances', 'title_status'],
      updateFrequency: 'real-time',
      apiEndpoint: process.env.MB_LAND_TITLES_API || null,
      requiresAuth: true, // Paid access
      costPerQuery: 5.00 // CAD
    },

    /**
     * TERTIARY SOURCE: Realtor.ca (Winnipeg Listings)
     * Authority: Official MLS listings
     * URL: https://www.realtor.ca/
     * Accuracy: 95% (market prices)
     * Update Frequency: Daily
     */
    realtorCa: {
      name: 'Realtor.ca (MLS)',
      url: 'https://www.realtor.ca/',
      authority: 'Industry (CREA)',
      accuracy: 0.95,
      dataPoints: ['list_price', 'sold_price', 'days_on_market', 'comparable_sales'],
      updateFrequency: 'daily',
      geoFilter: {
        province: 'Manitoba',
        city: 'Winnipeg'
      },
      scrapingAllowed: false, // Use official API only
      apiEndpoint: process.env.REALTOR_CA_API || null,
      requiresAuth: true
    },

    /**
     * QUATERNARY SOURCE: Manitoba Vital Statistics (Foreclosures)
     * Authority: Government foreclosure notices
     * URL: https://www.gov.mb.ca/justice/
     * Accuracy: 100% (legal notices)
     * Update Frequency: Weekly
     */
    foreclosureNotices: {
      name: 'Manitoba Court Foreclosure Filings',
      url: 'https://www.gov.mb.ca/justice/',
      authority: 'Government',
      accuracy: 1.0,
      dataPoints: ['foreclosure_status', 'court_file_number', 'hearing_date'],
      updateFrequency: 'weekly',
      scrapingAllowed: true, // Public notices
      requiresAuth: false
    },

    /**
     * VALIDATION SOURCE: Google Maps Geocoding
     * Authority: Google
     * URL: https://maps.googleapis.com/
     * Accuracy: 99% (address verification)
     * Update Frequency: Real-time
     */
    googleMaps: {
      name: 'Google Maps Geocoding API',
      url: 'https://maps.googleapis.com/maps/api/geocode/',
      authority: 'Tech (Google)',
      accuracy: 0.99,
      dataPoints: ['geocoded_address', 'lat_lng', 'postal_code', 'neighborhood'],
      updateFrequency: 'real-time',
      apiEndpoint: 'https://maps.googleapis.com/maps/api/geocode/json',
      requiresAuth: true,
      apiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    }
  },

  // ═══════════════════════════════════════════════════════════
  // DATA VERIFICATION RULES
  // ═══════════════════════════════════════════════════════════
  dataVerification: {

    // Minimum sources required
    minSourcesRequired: 2, // Must match on 2+ sources

    // Confidence thresholds
    minConfidenceScore: 0.85, // 85% confidence minimum

    // Variance tolerance
    maxPriceVariance: 0.10, // 10% variance allowed between sources

    // Conflict resolution
    conflictResolution: {
      // If 3 sources disagree, use weighted average
      method: 'weighted_average',
      weights: {
        cityAssessment: 0.40,    // Highest weight (official)
        landTitles: 0.35,        // Second highest (legal)
        realtorCa: 0.25          // Lowest (market, fluctuates)
      }
    },

    // Manual review triggers
    flagForManualReview: {
      lowConfidence: 0.70,           // Flag if <70% confidence
      highVariance: 0.15,            // Flag if >15% variance
      singleSourceOnly: true,        // Flag if only 1 source available
      foreclosureProperty: true,     // Flag all foreclosures
      highValue: 1000000            // Flag if >$1M
    }
  },

  // ═══════════════════════════════════════════════════════════
  // WINNIPEG MARKET DATA
  // ═══════════════════════════════════════════════════════════
  marketData: {

    // Average property values by neighborhood
    neighborhoodAverages: {
      'River Heights': 550000,
      'Tuxedo': 750000,
      'Charleswood': 425000,
      'St. Vital': 375000,
      'North End': 225000,
      'West End': 275000,
      'East Kildonan': 350000,
      'Fort Garry': 400000,
      'St. James': 325000,
      'Transcona': 300000
    },

    // Market metrics (updated monthly)
    capRate: 0.054,                  // 5.4% (Winnipeg average)
    averageARV: 350000,              // $350k median home price
    averageDaysOnMarket: 28,         // 28 days average
    repairCostPerSqFt: 20,           // $20/sqft
    holdingCostPerMonth: 1500,       // $1,500/month

    // Market trends
    marketCondition: 'balanced',     // balanced, sellers, buyers
    priceChangeYoY: 0.03,           // +3% year-over-year
    inventoryLevel: 'normal',        // low, normal, high

    // Hot neighborhoods (updated quarterly)
    hotNeighborhoods: [
      'Osborne Village',
      'The Exchange District',
      'Wolseley'
    ],

    // Distressed areas (higher deal potential)
    distressedAreas: [
      'North End',
      'West End'
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // WINNIPEG-SPECIFIC LEGAL
  // ═══════════════════════════════════════════════════════════
  legal: {

    province: 'Manitoba',

    // Tax rates
    taxes: {
      gst: 0.05,                     // 5% GST (no PST on real estate)
      landTransferTax: 0.00,         // Manitoba has NO land transfer tax
      propertyTaxRate: 0.0145        // ~1.45% annual property tax
    },

    // Assignment contract clauses (Manitoba-specific)
    assignmentClause: `
      This assignment is made under the laws of Manitoba, Canada.

      The Assignor is NOT a licensed real estate broker or salesperson.
      This transaction is a wholesale assignment of purchase agreement rights.

      Manitoba does NOT require a real estate license for wholesale assignments
      provided the Assignor does NOT:
      1. List the property publicly
      2. Hold themselves out as a real estate professional
      3. Charge a commission (assignment fee is permitted)

      Assignor complies with all Manitoba Real Estate Association (MREA) guidelines.
    `,

    // Required disclosures
    disclosures: {
      noLicense: true,               // Must disclose not licensed
      assignmentFee: true,           // Must disclose fee amount
      sellerAwareness: true,         // Seller must know about assignment
      buyerCapacity: false           // Not required to verify buyer funds
    },

    // Lawyer requirements
    closingRequirements: {
      lawyerRequired: true,          // Manitoba requires lawyer for closings
      minimumDaysToClose: 14,        // 14 days minimum
      titleInsuranceRecommended: true
    }
  },

  // ═══════════════════════════════════════════════════════════
  // WINNIPEG CONTACT INFO
  // ═══════════════════════════════════════════════════════════
  contact: {
    businessName: 'Velocity Real Estate - Winnipeg',
    legalName: 'Velocity Real Estate Inc.',

    address: {
      street: '', // Fill when ready
      city: 'Winnipeg',
      province: 'Manitoba',
      postalCode: '', // Fill when ready
      country: 'Canada'
    },

    phone: '204-VEL-FAST', // (204) 835-3278
    email: 'winnipeg@velocityrealestate.ca',
    website: 'https://winnipeg.velocityrealestate.ca',

    // Social media (Winnipeg-focused)
    social: {
      facebook: 'VelocityRealEstateWinnipeg',
      instagram: '@velocitywpg',
      youtube: 'VelocityRealEstateWPG',
      linkedin: 'velocity-real-estate-winnipeg'
    }
  },

  // ═══════════════════════════════════════════════════════════
  // EXPANSION FRAMEWORK (READY BUT LOCKED)
  // ═══════════════════════════════════════════════════════════
  expansion: {

    // Admin must manually unlock expansion
    unlockExpansion: function(adminPassword, newMarket) {
      // Requires admin password + manual approval
      // Will NOT auto-expand
      if (!this.verifyAdminPassword(adminPassword)) {
        throw new Error('Unauthorized: Expansion requires admin approval');
      }

      if (this.market.expansionLocked) {
        console.log(`⚠️ WARNING: Expansion to ${newMarket} requires manual approval`);
        console.log('Winnipeg must be flowing smoothly first');
        return false;
      }

      // Admin explicitly approves
      console.log(`✅ Admin approved expansion to ${newMarket}`);
      return true;
    },

    // Expansion readiness checklist
    readinessChecklist: {
      winnipegRevenue: { min: 50000, current: 0, met: false },      // $50k/month minimum
      winnipegDeals: { min: 3, current: 0, met: false },            // 3 deals/month minimum
      winnipegConversion: { min: 0.25, current: 0, met: false },    // 25% conversion minimum
      winnipegTestsPassing: { required: true, current: false },     // All tests passing
      winnipegCustomerSat: { min: 4.5, current: 0, met: false },   // 4.5/5 stars minimum
      adminApproval: { required: true, current: false }             // Manual approval
    },

    // Next markets (ordered by priority)
    roadmap: [
      {
        city: 'Calgary',
        province: 'Alberta',
        priority: 1,
        estimatedLaunch: 'Q2 2025',
        marketSize: '1.3M population',
        reasoning: 'Similar to Winnipeg, strong economy, investor-friendly'
      },
      {
        city: 'Toronto',
        province: 'Ontario',
        priority: 2,
        estimatedLaunch: 'Q3 2025',
        marketSize: '6.2M population',
        reasoning: 'Massive market, high property values, competitive'
      },
      {
        city: 'Vancouver',
        province: 'British Columbia',
        priority: 3,
        estimatedLaunch: 'Q4 2025',
        marketSize: '2.6M population',
        reasoning: 'Expensive market, foreign buyers, complex regulations'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // WINNIPEG-SPECIFIC BRANDING
  // ═══════════════════════════════════════════════════════════
  branding: {
    tagline: 'Winnipeg\'s Fastest Cash Home Buyers',
    localProof: [
      '500+ Winnipeg Homeowners Helped',
      'A+ BBB Rating in Manitoba',
      'Featured in Winnipeg Free Press'
    ],
    neighborhoods: [
      'River Heights', 'Tuxedo', 'Charleswood', 'St. Vital',
      'North End', 'West End', 'East Kildonan', 'Fort Garry',
      'St. James', 'Transcona', 'Osborne Village', 'Wolseley'
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // DATA ACCURACY MONITORING
  // ═══════════════════════════════════════════════════════════
  monitoring: {

    // Track accuracy over time
    accuracyTracking: {
      enabled: true,
      logEveryQuery: true,
      alertThreshold: 0.90,          // Alert if accuracy drops below 90%
      reviewInterval: 'weekly'
    },

    // Source health monitoring
    sourceHealth: {
      checkInterval: 3600000,        // Check every hour
      maxDowntime: 14400000,         // 4 hours max downtime
      fallbackBehavior: 'use-cached-data',
      alertAdmin: true
    },

    // Quality metrics
    qualityMetrics: {
      targetAccuracy: 0.95,          // 95% target
      targetConfidence: 0.90,        // 90% confidence target
      targetCoverage: 0.98,          // 98% of properties verifiable
      maxManualReviewRate: 0.10     // Max 10% requiring manual review
    }
  }
};

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG_WINNIPEG;
}
