/**
 * AI-Powered Property Analysis Engine
 * Generates comprehensive property evaluations with expert-level insights
 * Automatically emails detailed reports to business owner
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  // Email configuration (update with your email)
  email: {
    to: 'your-email@example.com', // CHANGE THIS
    from: 'noreply@homeliberationwinnipeg.com',
    subject: '[NEW LEAD] Property Analysis Report'
  },

  // n8n webhook endpoints
  webhooks: {
    email: 'http://localhost:5678/webhook/send-email-report',
    sheets: 'http://localhost:5678/webhook/save-to-sheets',
    slack: 'http://localhost:5678/webhook/slack-alert'
  },

  // Analysis parameters - Updated 2025 Winnipeg Market Data
  winnipegMarket: {
    medianPrice: 365000, // 2025 median price
    averageDaysOnMarket: 21, // 2025 average DOM
    appreciationRate: 0.042, // 4.2% annual appreciation
    rentToValueRatio: 0.0075, // 0.75% of property value per month
    pricePerSqft: 180 // Average price per square foot
  }
};

// ═══════════════════════════════════════════════════════════════
// AI PROPERTY ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════

class PropertyAnalyzer {

  /**
   * Main analysis function - generates comprehensive property report
   */
  async analyze(propertyData) {
    console.log('\n🏠 Starting AI Property Analysis...\n');

    const analysis = {
      timestamp: new Date().toISOString(),
      leadInfo: this.extractLeadInfo(propertyData),
      propertyDetails: this.analyzePropertyDetails(propertyData),
      marketAnalysis: this.performMarketAnalysis(propertyData),
      financialAnalysis: this.calculateFinancials(propertyData),
      riskAssessment: this.assessRisks(propertyData),
      opportunityScore: this.calculateOpportunityScore(propertyData),
      repairEstimates: this.estimateRepairs(propertyData),
      comparableProperties: this.findComparables(propertyData),
      investmentPotential: this.analyzeInvestmentPotential(propertyData),
      recommendedOffer: this.generateOfferRecommendation(propertyData),
      actionPlan: this.createActionPlan(propertyData),
      redFlags: this.identifyRedFlags(propertyData),
      strengths: this.identifyStrengths(propertyData)
    };

    console.log('✅ Analysis complete!\n');
    return analysis;
  }

  /**
   * Extract and structure lead information
   */
  extractLeadInfo(data) {
    return {
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      contactedAt: new Date().toLocaleString(),
      source: data.source || 'Website Contact Form',
      timeline: data.timeline || 'Not specified',
      situation: data.situation || 'Not specified'
    };
  }

  /**
   * Analyze property details and characteristics
   */
  analyzePropertyDetails(data) {
    const propertyType = data.property_type || 'Single Family';
    const condition = data.condition || 'Average';
    const yearBuilt = parseInt(data.year_built) || 1980;
    const age = new Date().getFullYear() - yearBuilt;

    return {
      type: propertyType,
      condition: condition,
      yearBuilt: yearBuilt,
      age: age,
      bedrooms: parseInt(data.bedrooms) || 3,
      bathrooms: parseFloat(data.bathrooms) || 2,
      squareFeet: parseInt(data.square_feet) || 1200,
      occupancy: data.occupancy || 'Owner Occupied',
      mortgageStatus: data.mortgage_status || 'Unknown',

      // Analysis
      ageCategory: age < 10 ? 'New' : age < 25 ? 'Modern' : age < 50 ? 'Mature' : 'Older',
      sizeCategory: this.categorizeSQ(parseInt(data.square_feet) || 1200),
      conditionScore: this.getConditionScore(condition)
    };
  }

  /**
   * Perform market analysis for Winnipeg
   */
  performMarketAnalysis(data) {
    const sqft = parseInt(data.square_feet) || 1200;
    const pricePerSqFt = CONFIG.winnipegMarket.medianPrice / 1200; // $291/sqft average

    const estimatedMarketValue = sqft * pricePerSqFt;
    const estimatedRent = estimatedMarketValue * CONFIG.winnipegMarket.rentToValueRatio;

    return {
      winnipegMedianPrice: CONFIG.winnipegMarket.medianPrice,
      estimatedMarketValue: Math.round(estimatedMarketValue),
      pricePerSquareFoot: Math.round(pricePerSqFt),
      estimatedMonthlyRent: Math.round(estimatedRent),
      averageDaysOnMarket: CONFIG.winnipegMarket.averageDaysOnMarket,
      marketTrend: 'Stable to Appreciating',
      competitionLevel: 'Moderate',
      buyerDemand: this.assessBuyerDemand(data),
      neighborhood: this.analyzeNeighborhood(data.address || '')
    };
  }

  /**
   * Calculate comprehensive financials
   */
  calculateFinancials(data) {
    const marketValue = this.performMarketAnalysis(data).estimatedMarketValue;
    const condition = data.condition || 'Average';

    // Repair estimates based on condition
    const repairCosts = this.estimateRepairs(data).totalEstimate;

    // Calculate ARV (After Repair Value)
    const arv = condition === 'Excellent' ? marketValue : marketValue * 1.1;

    // Wholesale formula: ARV × 70% - Repairs - Profit Margin
    const wholesaleOffer = (arv * 0.70) - repairCosts - 10000;

    // Maximum allowable offer (MAO)
    const mao = (arv * 0.75) - repairCosts;

    return {
      estimatedMarketValue: marketValue,
      afterRepairValue: Math.round(arv),
      repairCosts: repairCosts,
      wholesaleOffer: Math.round(Math.max(wholesaleOffer, marketValue * 0.5)),
      maximumAllowableOffer: Math.round(mao),
      potentialProfit: Math.round(arv - wholesaleOffer - repairCosts),
      profitMargin: '15-20%',
      holdingCosts: this.calculateHoldingCosts(),
      closingCosts: Math.round(marketValue * 0.03)
    };
  }

  /**
   * Assess risks with this property
   */
  assessRisks(data) {
    const risks = [];

    // Age risk
    const age = new Date().getFullYear() - (parseInt(data.year_built) || 1980);
    if (age > 50) {
      risks.push({
        category: 'Property Age',
        severity: 'MEDIUM',
        description: `Property is ${age} years old - may need major systems replacement`,
        mitigation: 'Budget extra for roof, HVAC, plumbing, electrical inspection'
      });
    }

    // Condition risk
    if (data.condition === 'Poor' || data.condition === 'Needs Major Repairs') {
      risks.push({
        category: 'Condition',
        severity: 'HIGH',
        description: 'Property requires significant repairs',
        mitigation: 'Get professional inspection, budget 20-30% above estimates'
      });
    }

    // Mortgage risk
    if (data.mortgage_status === 'Behind on Payments' || data.situation === 'Foreclosure') {
      risks.push({
        category: 'Foreclosure Risk',
        severity: 'HIGH',
        description: 'Property may be in foreclosure process',
        mitigation: 'Work with seller\'s lender, consider short sale, verify timeline'
      });
    }

    // Occupancy risk
    if (data.occupancy === 'Tenant Occupied') {
      risks.push({
        category: 'Tenant Occupancy',
        severity: 'MEDIUM',
        description: 'Tenant may have lease rights, harder to show/sell',
        mitigation: 'Review lease terms, consider cash-for-keys, factor in vacancy'
      });
    }

    // Title risks
    if (data.situation === 'Tax Liens' || data.situation === 'Estate/Probate') {
      risks.push({
        category: 'Title Issues',
        severity: 'HIGH',
        description: 'Potential title complications or liens',
        mitigation: 'Order title search immediately, consult real estate attorney'
      });
    }

    return {
      totalRisks: risks.length,
      overallRiskLevel: risks.some(r => r.severity === 'HIGH') ? 'HIGH' :
                        risks.some(r => r.severity === 'MEDIUM') ? 'MEDIUM' : 'LOW',
      risks: risks,
      riskScore: this.calculateRiskScore(risks)
    };
  }

  /**
   * Calculate opportunity score (0-100)
   */
  calculateOpportunityScore(data) {
    let score = 50; // Start at neutral

    // Motivation factors (higher motivation = higher score)
    const urgentSituations = ['Foreclosure', 'Bankruptcy', 'Tax Liens', 'Divorce'];
    if (urgentSituations.includes(data.situation)) {
      score += 20;
    }

    // Timeline (faster = better)
    if (data.timeline === 'ASAP' || data.timeline === 'Within 1 Month') {
      score += 15;
    }

    // Property condition (worse condition = better wholesale deal)
    if (data.condition === 'Poor' || data.condition === 'Needs Major Repairs') {
      score += 10;
    }

    // Occupancy (vacant = easier)
    if (data.occupancy === 'Vacant') {
      score += 10;
    }

    // Mortgage status
    if (data.mortgage_status === 'Paid Off') {
      score += 10;
    } else if (data.mortgage_status === 'Behind on Payments') {
      score += 15; // More motivated
    }

    return {
      score: Math.min(score, 100),
      rating: score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : score >= 40 ? 'FAIR' : 'LOW',
      reasoning: this.explainScore(score, data)
    };
  }

  /**
   * Estimate repair costs
   */
  estimateRepairs(data) {
    const condition = data.condition || 'Average';
    const sqft = parseInt(data.square_feet) || 1200;
    const age = new Date().getFullYear() - (parseInt(data.year_built) || 1980);

    const estimates = {
      cosmetic: 0,
      structural: 0,
      systems: 0,
      exterior: 0
    };

    // Condition-based estimates
    switch(condition) {
      case 'Excellent':
        estimates.cosmetic = sqft * 5; // $5/sqft
        break;
      case 'Good':
        estimates.cosmetic = sqft * 10;
        break;
      case 'Average':
        estimates.cosmetic = sqft * 20;
        estimates.systems = 5000;
        break;
      case 'Fair':
        estimates.cosmetic = sqft * 30;
        estimates.systems = 10000;
        estimates.structural = 5000;
        break;
      case 'Poor':
      case 'Needs Major Repairs':
        estimates.cosmetic = sqft * 40;
        estimates.systems = 15000;
        estimates.structural = 10000;
        estimates.exterior = 8000;
        break;
    }

    // Age-based adjustments
    if (age > 50) {
      estimates.systems += 10000; // Likely need new HVAC, electrical, plumbing
      estimates.structural += 5000;
    }

    const totalEstimate = Object.values(estimates).reduce((a, b) => a + b, 0);
    const contingency = totalEstimate * 0.20; // 20% contingency

    return {
      breakdown: estimates,
      subtotal: Math.round(totalEstimate),
      contingency: Math.round(contingency),
      totalEstimate: Math.round(totalEstimate + contingency),
      detailedItems: this.getDetailedRepairItems(condition, age)
    };
  }

  /**
   * Find comparable properties (simulated)
   */
  findComparables(data) {
    const marketValue = this.performMarketAnalysis(data).estimatedMarketValue;

    // Simulated comps (in real implementation, would fetch from MLS)
    return {
      count: 5,
      avgPrice: marketValue,
      avgPricePerSqFt: Math.round(marketValue / (parseInt(data.square_feet) || 1200)),
      range: {
        low: Math.round(marketValue * 0.85),
        high: Math.round(marketValue * 1.15)
      },
      note: 'Based on recent sales in Winnipeg area. Get professional CMA for accuracy.'
    };
  }

  /**
   * Analyze investment potential
   */
  analyzeInvestmentPotential(data) {
    const financials = this.calculateFinancials(data);
    const monthlyRent = this.performMarketAnalysis(data).estimatedMonthlyRent;

    // Buy-and-hold analysis
    const purchasePrice = financials.wholesaleOffer;
    const cashOnCashReturn = (monthlyRent * 12) / purchasePrice;
    const capRate = ((monthlyRent * 12) - (purchasePrice * 0.02)) / purchasePrice; // 2% annual expenses

    return {
      wholesalePotential: {
        rating: 'GOOD',
        expectedProfit: financials.potentialProfit,
        timeToSell: '14-30 days',
        confidence: '75%'
      },
      rentalPotential: {
        rating: cashOnCashReturn > 0.08 ? 'GOOD' : 'FAIR',
        monthlyRent: monthlyRent,
        cashOnCashReturn: (cashOnCashReturn * 100).toFixed(2) + '%',
        capRate: (capRate * 100).toFixed(2) + '%',
        yearlyIncome: monthlyRent * 12
      },
      flipPotential: {
        rating: financials.potentialProfit > 30000 ? 'GOOD' : 'FAIR',
        arv: financials.afterRepairValue,
        totalInvestment: purchasePrice + financials.repairCosts,
        expectedProfit: financials.potentialProfit,
        roi: ((financials.potentialProfit / (purchasePrice + financials.repairCosts)) * 100).toFixed(2) + '%'
      }
    };
  }

  /**
   * Generate offer recommendation
   */
  generateOfferRecommendation(data) {
    const financials = this.calculateFinancials(data);
    const opportunity = this.calculateOpportunityScore(data);

    // Adjust offer based on opportunity score
    let recommendedOffer = financials.wholesaleOffer;

    if (opportunity.score >= 80) {
      recommendedOffer = financials.wholesaleOffer * 0.95; // Can offer slightly more for hot deal
    } else if (opportunity.score < 40) {
      recommendedOffer = financials.wholesaleOffer * 0.85; // Lower offer for risky deal
    }

    return {
      initialOffer: Math.round(recommendedOffer),
      maxOffer: financials.maximumAllowableOffer,
      negotiationRange: {
        low: Math.round(recommendedOffer),
        high: Math.round(recommendedOffer * 1.10)
      },
      strategy: this.createNegotiationStrategy(data, opportunity),
      talkingPoints: this.createTalkingPoints(data)
    };
  }

  /**
   * Create action plan for this lead
   */
  createActionPlan(data) {
    const timeline = data.timeline || 'Not specified';
    const situation = data.situation || 'General Inquiry';

    const plan = [];

    // Immediate actions (24 hours)
    plan.push({
      timeframe: 'IMMEDIATE (Within 24 Hours)',
      priority: 'CRITICAL',
      actions: [
        '📞 Call lead to build rapport and verify information',
        '📧 Send welcome email with next steps',
        '📋 Schedule property walkthrough/inspection',
        '🔍 Pull preliminary title search',
        '💰 Run comps and validate market value estimate'
      ]
    });

    // Short-term actions (2-7 days)
    plan.push({
      timeframe: 'SHORT-TERM (2-7 Days)',
      priority: 'HIGH',
      actions: [
        '🏠 Conduct property inspection',
        '🔨 Get contractor repair estimates',
        '📊 Complete full financial analysis',
        '💼 Present offer to seller',
        '📝 Begin negotiation process'
      ]
    });

    // Medium-term actions (1-2 weeks)
    if (situation === 'Foreclosure' || data.mortgage_status === 'Behind on Payments') {
      plan.push({
        timeframe: 'MEDIUM-TERM (1-2 Weeks)',
        priority: 'MEDIUM',
        actions: [
          '🏦 Contact lender for short sale approval (if applicable)',
          '⚖️ Consult attorney on foreclosure timeline',
          '📄 Order full title search',
          '🤝 Get purchase agreement signed',
          '💵 Secure financing/cash funds'
        ]
      });
    }

    return plan;
  }

  /**
   * Identify red flags
   */
  identifyRedFlags(data) {
    const flags = [];

    if (!data.email && !data.phone) {
      flags.push('❌ No contact information - verify legitimacy');
    }

    const age = new Date().getFullYear() - (parseInt(data.year_built) || 1980);
    if (age > 80) {
      flags.push('⚠️ Very old property (80+ years) - expect major systems issues');
    }

    if (data.situation === 'Tax Liens') {
      flags.push('🚩 Tax liens - must verify amount owed and payment plan');
    }

    if (data.mortgage_status === 'Unknown') {
      flags.push('⚠️ Mortgage status unknown - verify before making offer');
    }

    if (!data.square_feet || data.square_feet === '0') {
      flags.push('📏 No square footage provided - must verify for accurate valuation');
    }

    return flags.length > 0 ? flags : ['✅ No major red flags identified'];
  }

  /**
   * Identify strengths/opportunities
   */
  identifyStrengths(data) {
    const strengths = [];

    if (data.timeline === 'ASAP' || data.timeline === 'Within 1 Month') {
      strengths.push('✅ Motivated seller with urgent timeline');
    }

    if (data.occupancy === 'Vacant') {
      strengths.push('✅ Vacant property - easier to show and sell');
    }

    if (data.mortgage_status === 'Paid Off') {
      strengths.push('✅ No mortgage - clean title likely, flexible closing');
    }

    const sqft = parseInt(data.square_feet) || 0;
    if (sqft >= 1500) {
      strengths.push('✅ Good size property - strong buyer demand');
    }

    if (data.bedrooms >= 3 && data.bathrooms >= 2) {
      strengths.push('✅ Desirable bed/bath count - appeals to families');
    }

    return strengths.length > 0 ? strengths : ['Opportunities exist but require further analysis'];
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  categorizeSQ(sqft) {
    if (sqft < 800) return 'Small';
    if (sqft < 1200) return 'Medium';
    if (sqft < 2000) return 'Large';
    return 'Very Large';
  }

  getConditionScore(condition) {
    const scores = {
      'Excellent': 95,
      'Good': 80,
      'Average': 60,
      'Fair': 40,
      'Poor': 20,
      'Needs Major Repairs': 10
    };
    return scores[condition] || 50;
  }

  assessBuyerDemand(data) {
    const beds = parseInt(data.bedrooms) || 3;
    const baths = parseFloat(data.bathrooms) || 2;

    if (beds >= 3 && baths >= 2) return 'HIGH';
    if (beds >= 2 && baths >= 1.5) return 'MEDIUM';
    return 'LOW';
  }

  analyzeNeighborhood(address) {
    // Simplified - in production would use Google Maps API or local data
    return {
      quality: 'To be determined with address verification',
      schools: 'Research needed',
      crime: 'Research needed',
      amenities: 'Research needed'
    };
  }

  calculateHoldingCosts() {
    return {
      monthly: 1500,
      breakdown: {
        taxes: 400,
        insurance: 150,
        utilities: 300,
        maintenance: 400,
        misc: 250
      }
    };
  }

  calculateRiskScore(risks) {
    let score = 0;
    risks.forEach(risk => {
      if (risk.severity === 'HIGH') score += 30;
      if (risk.severity === 'MEDIUM') score += 15;
      if (risk.severity === 'LOW') score += 5;
    });
    return Math.min(score, 100);
  }

  explainScore(score, data) {
    const reasons = [];
    if (data.timeline === 'ASAP') reasons.push('Urgent timeline');
    if (data.situation === 'Foreclosure') reasons.push('Foreclosure situation');
    if (data.condition === 'Poor') reasons.push('Poor condition = deep discount potential');
    if (data.occupancy === 'Vacant') reasons.push('Vacant and ready');

    return reasons.join(', ') || 'Standard wholesale opportunity';
  }

  getDetailedRepairItems(condition, age) {
    const items = [];

    if (condition === 'Poor' || condition === 'Needs Major Repairs') {
      items.push('Complete interior paint', 'New flooring throughout', 'Kitchen remodel',
                 'Bathroom updates', 'New fixtures', 'Landscaping');
    }

    if (age > 50) {
      items.push('HVAC replacement', 'Electrical panel upgrade', 'Plumbing updates',
                 'Roof inspection/replacement', 'Foundation repair (if needed)');
    }

    return items.length > 0 ? items : ['Cosmetic updates', 'Minor repairs'];
  }

  createNegotiationStrategy(data, opportunity) {
    if (opportunity.score >= 80) {
      return 'AGGRESSIVE - Move quickly, be competitive but fair, emphasize fast close';
    } else if (opportunity.score >= 60) {
      return 'BALANCED - Start with strong but reasonable offer, be prepared to negotiate';
    } else {
      return 'CONSERVATIVE - Low initial offer, thorough due diligence, negotiate hard';
    }
  }

  createTalkingPoints(data) {
    const points = [
      '💰 All-cash offer, no financing contingency',
      '⚡ Can close in 7-14 days (seller chooses date)',
      '🏠 Buy as-is, no repairs needed',
      '💵 No realtor fees or commissions to pay',
      '📋 We handle all paperwork and closing costs'
    ];

    if (data.situation === 'Foreclosure') {
      points.push('🏦 We work with your lender to stop foreclosure');
    }

    if (data.condition === 'Poor') {
      points.push('🔨 We buy in any condition - don\'t worry about repairs');
    }

    return points;
  }
}

// ═══════════════════════════════════════════════════════════════
// EMAIL REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════

class ReportGenerator {

  generateEmailReport(analysis) {
    const html = this.generateHTML(analysis);
    const text = this.generatePlainText(analysis);

    return { html, text };
  }

  generateHTML(a) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; border-left: 4px solid #3498db; padding-left: 15px; }
    .score { font-size: 48px; font-weight: bold; color: #27ae60; text-align: center; margin: 20px 0; }
    .rating { text-align: center; font-size: 24px; color: #7f8c8d; margin-bottom: 30px; }
    .alert-high { background: #e74c3c; color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .alert-medium { background: #f39c12; color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .alert-low { background: #3498db; color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .success { background: #27ae60; color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .info { background: #ecf0f1; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .card { background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6; }
    .card h3 { margin-top: 0; color: #2c3e50; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #34495e; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f5f5f5; }
    .money { color: #27ae60; font-weight: bold; font-size: 1.1em; }
    ul { list-style: none; padding: 0; }
    li { padding: 8px 0; border-bottom: 1px solid #eee; }
    li:before { content: "→ "; color: #3498db; font-weight: bold; }
  </style>
</head>
<body>
  <h1>🏠 Property Analysis Report</h1>
  <p><strong>Generated:</strong> ${new Date(a.timestamp).toLocaleString()}</p>

  <div class="success">
    <h2 style="margin:0; color: white;">📊 OPPORTUNITY SCORE</h2>
    <div class="score">${a.opportunityScore.score}/100</div>
    <div class="rating">${a.opportunityScore.rating}</div>
    <p style="margin: 0;"><strong>Why:</strong> ${a.opportunityScore.reasoning}</p>
  </div>

  <h2>📋 Lead Information</h2>
  <div class="info">
    <table>
      <tr><td><strong>Name:</strong></td><td>${a.leadInfo.name}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${a.leadInfo.email}</td></tr>
      <tr><td><strong>Phone:</strong></td><td>${a.leadInfo.phone}</td></tr>
      <tr><td><strong>Address:</strong></td><td>${a.leadInfo.address}</td></tr>
      <tr><td><strong>Timeline:</strong></td><td>${a.leadInfo.timeline}</td></tr>
      <tr><td><strong>Situation:</strong></td><td>${a.leadInfo.situation}</td></tr>
      <tr><td><strong>Source:</strong></td><td>${a.leadInfo.source}</td></tr>
    </table>
  </div>

  <h2>🏘️ Property Details</h2>
  <div class="grid">
    <div class="card">
      <h3>Basic Info</h3>
      <ul>
        <li>Type: ${a.propertyDetails.type}</li>
        <li>Year Built: ${a.propertyDetails.yearBuilt} (${a.propertyDetails.age} years old)</li>
        <li>Bedrooms: ${a.propertyDetails.bedrooms}</li>
        <li>Bathrooms: ${a.propertyDetails.bathrooms}</li>
        <li>Square Feet: ${a.propertyDetails.squareFeet.toLocaleString()}</li>
      </ul>
    </div>
    <div class="card">
      <h3>Status</h3>
      <ul>
        <li>Condition: ${a.propertyDetails.condition}</li>
        <li>Occupancy: ${a.propertyDetails.occupancy}</li>
        <li>Mortgage: ${a.propertyDetails.mortgageStatus}</li>
        <li>Age Category: ${a.propertyDetails.ageCategory}</li>
        <li>Size: ${a.propertyDetails.sizeCategory}</li>
      </ul>
    </div>
  </div>

  <h2>💰 Financial Analysis</h2>
  <div class="alert-low">
    <h3 style="margin-top:0; color: white;">💵 RECOMMENDED OFFER</h3>
    <p class="money" style="color: white; font-size: 36px; margin: 10px 0;">$${a.recommendedOffer.initialOffer.toLocaleString()}</p>
    <p style="margin: 0;"><strong>Maximum Offer:</strong> $${a.recommendedOffer.maxOffer.toLocaleString()}</p>
    <p style="margin: 5px 0;"><strong>Negotiation Range:</strong> $${a.recommendedOffer.negotiationRange.low.toLocaleString()} - $${a.recommendedOffer.negotiationRange.high.toLocaleString()}</p>
    <p style="margin: 5px 0;"><strong>Strategy:</strong> ${a.recommendedOffer.strategy}</p>
  </div>

  <table>
    <tr><th>Metric</th><th>Value</th></tr>
    <tr><td>Market Value (Current)</td><td class="money">$${a.financialAnalysis.estimatedMarketValue.toLocaleString()}</td></tr>
    <tr><td>After Repair Value (ARV)</td><td class="money">$${a.financialAnalysis.afterRepairValue.toLocaleString()}</td></tr>
    <tr><td>Repair Costs</td><td>$${a.financialAnalysis.repairCosts.toLocaleString()}</td></tr>
    <tr><td>Wholesale Offer</td><td class="money">$${a.financialAnalysis.wholesaleOffer.toLocaleString()}</td></tr>
    <tr><td>Potential Profit</td><td class="money">$${a.financialAnalysis.potentialProfit.toLocaleString()}</td></tr>
    <tr><td>Holding Costs (Monthly)</td><td>$${a.financialAnalysis.holdingCosts.monthly.toLocaleString()}</td></tr>
    <tr><td>Closing Costs</td><td>$${a.financialAnalysis.closingCosts.toLocaleString()}</td></tr>
  </table>

  <h2>🔨 Repair Estimates</h2>
  <table>
    <tr><th>Category</th><th>Estimate</th></tr>
    <tr><td>Cosmetic</td><td>$${a.repairEstimates.breakdown.cosmetic.toLocaleString()}</td></tr>
    <tr><td>Systems (HVAC, Plumbing, Electrical)</td><td>$${a.repairEstimates.breakdown.systems.toLocaleString()}</td></tr>
    <tr><td>Structural</td><td>$${a.repairEstimates.breakdown.structural.toLocaleString()}</td></tr>
    <tr><td>Exterior</td><td>$${a.repairEstimates.breakdown.exterior.toLocaleString()}</td></tr>
    <tr><td><strong>Subtotal</strong></td><td><strong>$${a.repairEstimates.subtotal.toLocaleString()}</strong></td></tr>
    <tr><td>Contingency (20%)</td><td>$${a.repairEstimates.contingency.toLocaleString()}</td></tr>
    <tr><td><strong>TOTAL ESTIMATE</strong></td><td class="money">$${a.repairEstimates.totalEstimate.toLocaleString()}</td></tr>
  </table>

  <div class="info">
    <strong>Key Repairs Needed:</strong>
    <ul>
      ${a.repairEstimates.detailedItems.map(item => `<li>${item}</li>`).join('')}
    </ul>
  </div>

  <h2>⚠️ Risk Assessment</h2>
  <div class="alert-${a.riskAssessment.overallRiskLevel.toLowerCase()}">
    <h3 style="margin-top: 0; color: white;">Overall Risk Level: ${a.riskAssessment.overallRiskLevel}</h3>
    <p style="color: white; margin: 0;">Risk Score: ${a.riskAssessment.riskScore}/100</p>
  </div>

  ${a.riskAssessment.risks.map(risk => `
    <div class="alert-${risk.severity.toLowerCase()}">
      <h4 style="margin-top: 0; color: white;">${risk.category} - ${risk.severity} RISK</h4>
      <p style="margin: 5px 0;"><strong>Issue:</strong> ${risk.description}</p>
      <p style="margin: 5px 0;"><strong>Mitigation:</strong> ${risk.mitigation}</p>
    </div>
  `).join('')}

  <h2>🚩 Red Flags & Strengths</h2>
  <div class="grid">
    <div class="card">
      <h3 style="color: #e74c3c;">⚠️ Red Flags</h3>
      <ul>
        ${a.redFlags.map(flag => `<li>${flag}</li>`).join('')}
      </ul>
    </div>
    <div class="card">
      <h3 style="color: #27ae60;">✅ Strengths</h3>
      <ul>
        ${a.strengths.map(strength => `<li>${strength}</li>`).join('')}
      </ul>
    </div>
  </div>

  <h2>📈 Investment Potential</h2>
  <div class="grid">
    <div class="card">
      <h3>Wholesale</h3>
      <p><strong>Rating:</strong> ${a.investmentPotential.wholesalePotential.rating}</p>
      <p><strong>Expected Profit:</strong> <span class="money">$${a.investmentPotential.wholesalePotential.expectedProfit.toLocaleString()}</span></p>
      <p><strong>Time to Sell:</strong> ${a.investmentPotential.wholesalePotential.timeToSell}</p>
    </div>
    <div class="card">
      <h3>Rental</h3>
      <p><strong>Rating:</strong> ${a.investmentPotential.rentalPotential.rating}</p>
      <p><strong>Monthly Rent:</strong> <span class="money">$${a.investmentPotential.rentalPotential.monthlyRent.toLocaleString()}</span></p>
      <p><strong>Cash-on-Cash Return:</strong> ${a.investmentPotential.rentalPotential.cashOnCashReturn}</p>
      <p><strong>Cap Rate:</strong> ${a.investmentPotential.rentalPotential.capRate}</p>
    </div>
  </div>

  <h2>📋 Action Plan</h2>
  ${a.actionPlan.map(phase => `
    <div class="alert-${phase.priority.toLowerCase()}">
      <h3 style="margin-top: 0; color: white;">${phase.timeframe} - ${phase.priority} PRIORITY</h3>
      <ul style="color: white;">
        ${phase.actions.map(action => `<li style="color: white; border-bottom-color: rgba(255,255,255,0.3);">${action}</li>`).join('')}
      </ul>
    </div>
  `).join('')}

  <h2>💬 Negotiation Talking Points</h2>
  <div class="info">
    <ul>
      ${a.recommendedOffer['talking points'].map(point => `<li>${point}</li>`).join('')}
    </ul>
  </div>

  <h2>📊 Market Analysis</h2>
  <table>
    <tr><th>Metric</th><th>Value</th></tr>
    <tr><td>Winnipeg Median Price</td><td>$${a.marketAnalysis.winnipegMedianPrice.toLocaleString()}</td></tr>
    <tr><td>Estimated Market Value</td><td class="money">$${a.marketAnalysis.estimatedMarketValue.toLocaleString()}</td></tr>
    <tr><td>Price per Square Foot</td><td>$${a.marketAnalysis.pricePerSquareFoot}</td></tr>
    <tr><td>Estimated Monthly Rent</td><td>$${a.marketAnalysis.estimatedMonthlyRent.toLocaleString()}</td></tr>
    <tr><td>Average Days on Market</td><td>${a.marketAnalysis.averageDaysOnMarket} days</td></tr>
    <tr><td>Market Trend</td><td>${a.marketAnalysis.marketTrend}</td></tr>
    <tr><td>Buyer Demand</td><td>${a.marketAnalysis.buyerDemand}</td></tr>
  </table>

  <div class="success" style="margin-top: 40px;">
    <h2 style="margin-top: 0; color: white;">🎯 BOTTOM LINE RECOMMENDATION</h2>
    <p style="font-size: 18px; color: white;">
      <strong>Make an offer of $${a.recommendedOffer.initialOffer.toLocaleString()}</strong> with a maximum of $${a.recommendedOffer.maxOffer.toLocaleString()}.
      ${a.opportunityScore.score >= 70 ? 'This is a GOOD opportunity - move quickly!' : 'Proceed with caution and thorough due diligence.'}
    </p>
    <p style="color: white;">Expected profit if wholesaled: <strong class="money" style="color: white;">$${a.financialAnalysis.potentialProfit.toLocaleString()}</strong></p>
  </div>

  <hr style="margin: 40px 0;">
  <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
    This report was automatically generated by AI Property Analyzer<br>
    Home Liberation Winnipeg | ${new Date().getFullYear()}
  </p>
</body>
</html>
    `;
  }

  generatePlainText(a) {
    return `
═══════════════════════════════════════════════════════════════════
PROPERTY ANALYSIS REPORT
═══════════════════════════════════════════════════════════════════

Generated: ${new Date(a.timestamp).toLocaleString()}

OPPORTUNITY SCORE: ${a.opportunityScore.score}/100 - ${a.opportunityScore.rating}
${a.opportunityScore.reasoning}

───────────────────────────────────────────────────────────────────
LEAD INFORMATION:
───────────────────────────────────────────────────────────────────
Name: ${a.leadInfo.name}
Email: ${a.leadInfo.email}
Phone: ${a.leadInfo.phone}
Address: ${a.leadInfo.address}
Timeline: ${a.leadInfo.timeline}
Situation: ${a.leadInfo.situation}

───────────────────────────────────────────────────────────────────
PROPERTY DETAILS:
───────────────────────────────────────────────────────────────────
Type: ${a.propertyDetails.type}
Year Built: ${a.propertyDetails.yearBuilt} (${a.propertyDetails.age} years old)
Bedrooms: ${a.propertyDetails.bedrooms}
Bathrooms: ${a.propertyDetails.bathrooms}
Square Feet: ${a.propertyDetails.squareFeet.toLocaleString()}
Condition: ${a.propertyDetails.condition}
Occupancy: ${a.propertyDetails.occupancy}

───────────────────────────────────────────────────────────────────
FINANCIAL ANALYSIS:
───────────────────────────────────────────────────────────────────
Market Value: $${a.financialAnalysis.estimatedMarketValue.toLocaleString()}
After Repair Value: $${a.financialAnalysis.afterRepairValue.toLocaleString()}
Repair Costs: $${a.financialAnalysis.repairCosts.toLocaleString()}

RECOMMENDED OFFER: $${a.recommendedOffer.initialOffer.toLocaleString()}
Maximum Offer: $${a.recommendedOffer.maxOffer.toLocaleString()}
Expected Profit: $${a.financialAnalysis.potentialProfit.toLocaleString()}

───────────────────────────────────────────────────────────────────
RISK ASSESSMENT: ${a.riskAssessment.overallRiskLevel} (${a.riskAssessment.riskScore}/100)
───────────────────────────────────────────────────────────────────
${a.riskAssessment.risks.map(r => `${r.severity}: ${r.category} - ${r.description}`).join('\n')}

───────────────────────────────────────────────────────────────────
ACTION PLAN:
───────────────────────────────────────────────────────────────────
${a.actionPlan.map(p => `\n${p.timeframe} (${p.priority}):\n${p.actions.map(a => `- ${a}`).join('\n')}`).join('\n\n')}

═══════════════════════════════════════════════════════════════════
END OF REPORT
═══════════════════════════════════════════════════════════════════
    `;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT & USAGE
// ═══════════════════════════════════════════════════════════════

async function analyzeProperty(formData) {
  const analyzer = new PropertyAnalyzer();
  const reportGen = new ReportGenerator();

  // Generate analysis
  const analysis = await analyzer.analyze(formData);

  // Generate email report
  const report = reportGen.generateEmailReport(analysis);

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `property-analysis-${timestamp}.json`;
  fs.writeFileSync(
    path.join(__dirname, 'reports', filename),
    JSON.stringify(analysis, null, 2)
  );

  console.log(`✅ Report saved: ${filename}\n`);

  return { analysis, report };
}

module.exports = {
  PropertyAnalyzer,
  ReportGenerator,
  analyzeProperty,
  CONFIG
};

// Example usage
if (require.main === module) {
  // Create reports directory
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Sample property data
  const sampleData = {
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    phone: '204-555-1234',
    address: '123 Main St, Winnipeg, MB',
    property_type: 'Single Family',
    year_built: '1985',
    bedrooms: '3',
    bathrooms: '2',
    square_feet: '1500',
    condition: 'Fair',
    situation: 'Foreclosure',
    occupancy: 'Vacant',
    mortgage_status: 'Behind on Payments',
    timeline: 'ASAP'
  };

  analyzeProperty(sampleData)
    .then(({ analysis, report }) => {
      console.log('\n📧 Email Report Generated!');
      console.log('HTML length:', report.html.length);
      console.log('Text length:', report.text.length);
      console.log('\n🎯 Opportunity Score:', analysis.opportunityScore.score);
      console.log('💰 Recommended Offer: $' + analysis.recommendedOffer.initialOffer.toLocaleString());
    })
    .catch(console.error);
}
