/**
 * MULTI-CITY EXPANSION CONFIGURATION
 * Add new cities by simply adding to this config object
 */

const CITIES = {
  winnipeg: {
    code: 'WPG',
    name: 'Winnipeg',
    province: 'MB',
    provinceFull: 'Manitoba',
    taxRate: 0.05, // PST + GST = 12% (HST equivalent for simplicity)

    // Market Data
    avgARV: 300000,
    capRate: 0.054,
    repairCostPerSqFt: 20,
    avgRent: 1400,

    // Data Sources
    dataSources: {
      assessment: 'https://assessment.winnipeg.ca/asmttax/',
      court: 'https://web43.gov.mb.ca/Registry/',
      permits: 'https://cityapps.winnipeg.ca/PublicDocs/',
      propertyRecords: 'https://www.gov.mb.ca/tpb/'
    },

    // Contact Info
    phone: '204-VEL-FAST',
    phoneDisplay: '(204) 835-3278',
    email: 'winnipeg@velocityrealestate.ca',

    // Legal
    legalLanguage: 'MB',
    requiresLawyer: true,
    assignmentLegal: 'Assignments are legal in Manitoba under common law contract principles.',

    // Operational
    active: true,
    launchDate: '2025-01-01',

    // Neighborhoods (for targeting)
    neighborhoods: [
      { name: 'West End', avgPrice: 250000, demand: 'high' },
      { name: 'North End', avgPrice: 200000, demand: 'high' },
      { name: 'Transcona', avgPrice: 280000, demand: 'medium' },
      { name: 'St. Vital', avgPrice: 350000, demand: 'medium' },
      { name: 'Charleswood', avgPrice: 450000, demand: 'low' }
    ]
  },

  calgary: {
    code: 'YYC',
    name: 'Calgary',
    province: 'AB',
    provinceFull: 'Alberta',
    taxRate: 0.05, // GST only (no PST in Alberta)

    // Market Data
    avgARV: 450000,
    capRate: 0.055,
    repairCostPerSqFt: 25,
    avgRent: 1800,

    // Data Sources
    dataSources: {
      assessment: 'https://www.calgary.ca/assessment',
      court: 'https://albertacourts.ca',
      permits: 'https://maps.calgary.ca/PermitsAndLicences/',
      propertyRecords: 'https://www.servicealberta.ca/land-titles.cfm'
    },

    // Contact Info
    phone: '403-VEL-FAST',
    phoneDisplay: '(403) 835-3278',
    email: 'calgary@velocityrealestate.ca',

    // Legal
    legalLanguage: 'AB',
    requiresLawyer: true,
    assignmentLegal: 'Assignments are legal in Alberta. Real Property Act permits contract assignments.',

    // Operational
    active: false, // Not launched yet
    launchDate: '2025-06-01', // Planned launch

    // Neighborhoods
    neighborhoods: [
      { name: 'Forest Lawn', avgPrice: 350000, demand: 'high' },
      { name: 'Dover', avgPrice: 320000, demand: 'high' },
      { name: 'Marlborough', avgPrice: 380000, demand: 'medium' },
      { name: 'Bowness', avgPrice: 500000, demand: 'medium' }
    ]
  },

  toronto: {
    code: 'YYZ',
    name: 'Toronto',
    province: 'ON',
    provinceFull: 'Ontario',
    taxRate: 0.13, // HST

    // Market Data
    avgARV: 800000,
    capRate: 0.056,
    repairCostPerSqFt: 35,
    avgRent: 2400,

    // Data Sources
    dataSources: {
      assessment: 'https://www.toronto.ca/services-payments/property-taxes-utilities/property-tax/',
      court: 'https://www.ontariocourts.ca',
      permits: 'https://www.toronto.ca/services-payments/building-construction/',
      propertyRecords: 'https://www.ontario.ca/page/land-registration'
    },

    // Contact Info
    phone: '416-VEL-FAST',
    phoneDisplay: '(416) 835-3278',
    email: 'toronto@velocityrealestate.ca',

    // Legal
    legalLanguage: 'ON',
    requiresLawyer: true,
    assignmentLegal: 'Assignments are legal in Ontario. HST applies to assignment fees on new construction.',

    // Operational
    active: false, // Not launched yet
    launchDate: '2025-09-01', // Planned launch

    // Neighborhoods
    neighborhoods: [
      { name: 'Scarborough', avgPrice: 650000, demand: 'high' },
      { name: 'North York', avgPrice: 750000, demand: 'high' },
      { name: 'Etobicoke', avgPrice: 800000, demand: 'medium' },
      { name: 'East York', avgPrice: 900000, demand: 'low' }
    ]
  },

  edmonton: {
    code: 'YEG',
    name: 'Edmonton',
    province: 'AB',
    provinceFull: 'Alberta',
    taxRate: 0.05, // GST only

    // Market Data
    avgARV: 380000,
    capRate: 0.058,
    repairCostPerSqFt: 22,
    avgRent: 1500,

    // Data Sources
    dataSources: {
      assessment: 'https://www.edmonton.ca/city_government/property_assessment',
      court: 'https://albertacourts.ca',
      permits: 'https://www.edmonton.ca/city_government/urban_planning_and_design/development-permits',
      propertyRecords: 'https://www.servicealberta.ca/land-titles.cfm'
    },

    // Contact Info
    phone: '780-VEL-FAST',
    phoneDisplay: '(780) 835-3278',
    email: 'edmonton@velocityrealestate.ca',

    // Legal
    legalLanguage: 'AB',
    requiresLawyer: true,
    assignmentLegal: 'Assignments are legal in Alberta. Real Property Act permits contract assignments.',

    // Operational
    active: false,
    launchDate: '2025-12-01',

    // Neighborhoods
    neighborhoods: [
      { name: 'Millwoods', avgPrice: 320000, demand: 'high' },
      { name: 'Castle Downs', avgPrice: 350000, demand: 'high' },
      { name: 'Clareview', avgPrice: 300000, demand: 'medium' }
    ]
  },

  vancouver: {
    code: 'YVR',
    name: 'Vancouver',
    province: 'BC',
    provinceFull: 'British Columbia',
    taxRate: 0.12, // PST + GST

    // Market Data
    avgARV: 1200000,
    capRate: 0.045,
    repairCostPerSqFt: 45,
    avgRent: 2800,

    // Data Sources
    dataSources: {
      assessment: 'https://www.bcassessment.ca/',
      court: 'https://www.bccourts.ca/',
      permits: 'https://vancouver.ca/home-property-development/building-permits.aspx',
      propertyRecords: 'https://ltsa.ca/'
    },

    // Contact Info
    phone: '604-VEL-FAST',
    phoneDisplay: '(604) 835-3278',
    email: 'vancouver@velocityrealestate.ca',

    // Legal
    legalLanguage: 'BC',
    requiresLawyer: true,
    assignmentLegal: 'Assignments are legal in BC. Property Transfer Tax may apply on assignments.',

    // Operational
    active: false,
    launchDate: '2026-03-01', // Year 2 expansion

    // Neighborhoods
    neighborhoods: [
      { name: 'Surrey', avgPrice: 950000, demand: 'high' },
      { name: 'Burnaby', avgPrice: 1100000, demand: 'high' },
      { name: 'Richmond', avgPrice: 1300000, demand: 'medium' }
    ]
  }
};

/**
 * AUTO-DETECT CITY FROM ADDRESS
 */
function detectCity(address) {
  const addressLower = address.toLowerCase();

  // Check for city name mention
  if (addressLower.includes('winnipeg')) return 'winnipeg';
  if (addressLower.includes('calgary')) return 'calgary';
  if (addressLower.includes('toronto')) return 'toronto';
  if (addressLower.includes('edmonton')) return 'edmonton';
  if (addressLower.includes('vancouver')) return 'vancouver';

  // Check for postal code patterns
  if (/R[0-9][A-Z]/.test(address)) return 'winnipeg'; // Manitoba
  if (/T[0-9][A-Z]/.test(address)) {
    // Could be Calgary or Edmonton (both Alberta)
    if (addressLower.includes('calg') || /T[2-3]/.test(address)) return 'calgary';
    return 'edmonton';
  }
  if (/M[0-9][A-Z]/.test(address)) return 'toronto'; // Ontario
  if (/V[0-9][A-Z]/.test(address)) return 'vancouver'; // BC

  // Default to Winnipeg (our first market)
  return 'winnipeg';
}

/**
 * GET CITY CONFIGURATION
 */
function getCityConfig(cityKey) {
  return CITIES[cityKey] || CITIES.winnipeg;
}

/**
 * GET ALL ACTIVE CITIES
 */
function getActiveCities() {
  return Object.keys(CITIES).filter(key => CITIES[key].active);
}

/**
 * GET CITY BY POSTAL CODE
 */
function getCityByPostalCode(postalCode) {
  if (!postalCode) return 'winnipeg';

  const firstChar = postalCode.charAt(0).toUpperCase();

  const postalMap = {
    'R': 'winnipeg',
    'T': 'calgary', // Default Calgary for T (could also be Edmonton)
    'M': 'toronto',
    'V': 'vancouver'
  };

  return postalMap[firstChar] || 'winnipeg';
}

/**
 * GET LANDING PAGE URL FOR CITY
 */
function getCityURL(cityKey) {
  const baseURL = 'https://velocityrealestate.ca';

  if (cityKey === 'winnipeg') {
    return baseURL; // Main site is Winnipeg
  }

  return `${baseURL}/${cityKey}`;
}

/**
 * CALCULATE CITY-SPECIFIC OFFER
 */
function calculateCityOffer(cityKey, arv, repairs) {
  const config = getCityConfig(cityKey);

  const assignmentFee = 20000;
  const buyerProfit = arv * 0.15; // 15% buyer margin
  const holding = 1500 * 3; // 3 months holding costs

  const offer = (arv * 0.70) - repairs - holding - assignmentFee - buyerProfit;

  return {
    offer: Math.round(offer),
    arv,
    repairs,
    assignmentFee,
    taxRate: config.taxRate,
    city: config.name,
    spread: arv - offer,
    spreadPercent: ((arv - offer) / arv * 100).toFixed(1)
  };
}

module.exports = {
  CITIES,
  detectCity,
  getCityConfig,
  getActiveCities,
  getCityByPostalCode,
  getCityURL,
  calculateCityOffer
};
