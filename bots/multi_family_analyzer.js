/**
 * MULTI-FAMILY & APARTMENT BUILDING ANALYZER
 * Handles 2-4 units, 5+ units, and apartment buildings
 * Uses NOI (Net Operating Income) and Cap Rate methodology
 */

const { detectCity, getCityConfig } = require('../config/cities');

class MultiFamilyAnalyzer {
  constructor() {
    this.expenseRatios = {
      'multi-family-2-4': 0.45, // 45% of GRI
      'multi-family-5+': 0.50,  // 50% of GRI
      'apartment-building': 0.55 // 55% of GRI (higher due to amenities)
    };

    this.marketCapRates = {
      'winnipeg': {
        'multi-family-2-4': 0.070,
        'multi-family-5+': 0.065,
        'apartment-building': 0.060
      },
      'calgary': {
        'multi-family-2-4': 0.065,
        'multi-family-5+': 0.060,
        'apartment-building': 0.055
      },
      'toronto': {
        'multi-family-2-4': 0.055,
        'multi-family-5+': 0.050,
        'apartment-building': 0.045
      },
      'vancouver': {
        'multi-family-2-4': 0.050,
        'multi-family-5+': 0.045,
        'apartment-building': 0.040
      }
    };
  }

  /**
   * MAIN ANALYSIS FUNCTION
   */
  async analyzeMultiFamily(property) {
    const {
      address,
      units,
      propertyType, // 'multi-family-2-4', 'multi-family-5+', 'apartment-building'
      currentRents,   // Array of monthly rents: [800, 850, 900, 900]
      expenses,       // Optional: Actual expenses if known
      sqft,
      yearBuilt,
      condition
    } = property;

    // Validate property type
    if (!['multi-family-2-4', 'multi-family-5+', 'apartment-building'].includes(propertyType)) {
      return {
        error: 'Invalid property type for multi-family analysis',
        requiresSingleFamilyAnalysis: true
      };
    }

    // Validate unit count matches property type
    if (propertyType === 'multi-family-2-4' && (units < 2 || units > 4)) {
      return { error: '2-4 unit properties must have 2-4 units' };
    }
    if (propertyType === 'multi-family-5+' && units < 5) {
      return { error: '5+ unit properties must have at least 5 units' };
    }
    if (propertyType === 'apartment-building' && units < 10) {
      return { error: 'Apartment buildings must have at least 10 units' };
    }

    // Step 1: Calculate Gross Rental Income (GRI)
    const monthlyGRI = currentRents.reduce((sum, rent) => sum + rent, 0);
    const annualGRI = monthlyGRI * 12;

    // Step 2: Estimate market rents (if units are under-rented)
    const city = detectCity(address);
    const marketRents = await this.estimateMarketRents(city, units, sqft);
    const potentialGRI = marketRents.reduce((sum, rent) => sum + rent, 0) * 12;

    // Step 3: Calculate expenses
    const estimatedExpenses = expenses || this.estimateExpenses(annualGRI, propertyType, units);
    const totalExpenses = Object.values(estimatedExpenses).reduce((a, b) => a + b, 0);

    // Step 4: Calculate NOI (Net Operating Income)
    const currentNOI = annualGRI - totalExpenses;
    const potentialNOI = potentialGRI - totalExpenses;

    // Step 5: Get market cap rate
    const marketCapRate = this.getMarketCapRate(city, propertyType);

    // Step 6: Calculate ARV using cap rate formula: ARV = NOI / Cap Rate
    const currentARV = currentNOI / marketCapRate;
    const potentialARV = potentialNOI / marketCapRate;

    // Step 7: Calculate buyer's target cap rate (2% better than market = lower price)
    const buyerCapRate = marketCapRate + 0.02;

    // Step 8: Calculate maximum buyer would pay
    const maxBuyerPrice = potentialNOI / buyerCapRate;

    // Step 9: Determine assignment fee
    const assignmentFee = this.calculateAssignmentFee(potentialARV, propertyType);

    // Step 10: Calculate our offer
    const buffer = 50000; // Safety buffer for buyer
    const ourOffer = maxBuyerPrice - assignmentFee - buffer;

    // Step 11: Calculate buyer's ROI potential
    const buyerInvestment = maxBuyerPrice;
    const buyerAnnualCashFlow = potentialNOI;
    const buyerCashOnCashReturn = (buyerAnnualCashFlow / buyerInvestment) * 100;

    // Step 12: Return comprehensive analysis
    return {
      propertyInfo: {
        address,
        units,
        propertyType,
        sqft,
        yearBuilt,
        condition
      },

      income: {
        currentMonthlyGRI: monthlyGRI,
        currentAnnualGRI: annualGRI,
        potentialMonthlyGRI: marketRents.reduce((a, b) => a + b, 0),
        potentialAnnualGRI: potentialGRI,
        unitRents: {
          current: currentRents,
          market: marketRents,
          upside: marketRents.map((m, i) => m - currentRents[i])
        }
      },

      expenses: {
        breakdown: estimatedExpenses,
        total: totalExpenses,
        expenseRatio: (totalExpenses / annualGRI * 100).toFixed(1) + '%'
      },

      noi: {
        current: currentNOI,
        potential: potentialNOI,
        upside: potentialNOI - currentNOI
      },

      valuation: {
        currentARV: Math.round(currentARV),
        potentialARV: Math.round(potentialARV),
        marketCapRate: (marketCapRate * 100).toFixed(2) + '%',
        buyerCapRate: (buyerCapRate * 100).toFixed(2) + '%'
      },

      offer: {
        ourOffer: Math.round(ourOffer),
        assignmentFee: assignmentFee,
        maxBuyerPrice: Math.round(maxBuyerPrice),
        spread: Math.round(potentialARV - ourOffer),
        spreadPercent: ((potentialARV - ourOffer) / potentialARV * 100).toFixed(1) + '%'
      },

      buyerAnalysis: {
        purchasePrice: Math.round(maxBuyerPrice),
        annualCashFlow: Math.round(buyerAnnualCashFlow),
        monthlyCashFlow: Math.round(buyerAnnualCashFlow / 12),
        cashOnCashReturn: buyerCashOnCashReturn.toFixed(2) + '%',
        capRate: ((potentialNOI / maxBuyerPrice) * 100).toFixed(2) + '%',
        profitAtSale: Math.round(potentialARV - maxBuyerPrice)
      },

      dealQuality: this.assessDealQuality({
        currentNOI,
        potentialNOI,
        ourOffer,
        potentialARV,
        buyerCashOnCashReturn,
        units
      }),

      recommendations: this.generateRecommendations({
        currentRents,
        marketRents,
        condition,
        cashOnCashReturn: buyerCashOnCashReturn
      })
    };
  }

  /**
   * ESTIMATE MARKET RENTS
   */
  async estimateMarketRents(city, units, totalSqft) {
    // Average sqft per unit
    const sqftPerUnit = totalSqft / units;

    // Market rent per sqft by city
    const rentPerSqft = {
      'winnipeg': 1.10,
      'calgary': 1.30,
      'toronto': 2.20,
      'vancouver': 2.50,
      'edmonton': 1.20
    };

    const cityRate = rentPerSqft[city] || 1.10;
    const baseRent = sqftPerUnit * cityRate;

    // Generate array of market rents (with slight variation for different unit sizes)
    return Array.from({ length: units }, (_, i) => {
      const variance = (Math.random() * 0.1) - 0.05; // ±5% variance
      return Math.round(baseRent * (1 + variance));
    });
  }

  /**
   * ESTIMATE EXPENSES
   */
  estimateExpenses(annualGRI, propertyType, units) {
    return {
      propertyTax: Math.round(annualGRI * 0.12),
      insurance: Math.round(annualGRI * 0.05),
      maintenance: Math.round(annualGRI * 0.10),
      repairs: Math.round(annualGRI * 0.05),
      utilities: Math.round(annualGRI * 0.08), // Water/garbage (tenants pay heat/electric)
      propertyManagement: Math.round(annualGRI * 0.08), // 8% management fee
      vacancy: Math.round(annualGRI * 0.07), // 7% vacancy allowance
      advertising: Math.round(units * 200), // $200 per unit per year
      legal: Math.round(units * 150), // Legal/admin
      miscellaneous: Math.round(annualGRI * 0.02) // 2% buffer
    };
  }

  /**
   * GET MARKET CAP RATE
   */
  getMarketCapRate(city, propertyType) {
    const cityRates = this.marketCapRates[city] || this.marketCapRates['winnipeg'];
    return cityRates[propertyType] || 0.065;
  }

  /**
   * CALCULATE ASSIGNMENT FEE
   */
  calculateAssignmentFee(arv, propertyType) {
    const feeStructure = {
      'multi-family-2-4': {
        percent: 0.03, // 3% of ARV
        min: 20000,
        max: 50000
      },
      'multi-family-5+': {
        percent: 0.04, // 4% of ARV
        min: 50000,
        max: 100000
      },
      'apartment-building': {
        percent: 0.04,
        min: 75000,
        max: 150000
      }
    };

    const structure = feeStructure[propertyType];
    const calculated = arv * structure.percent;

    return Math.min(Math.max(calculated, structure.min), structure.max);
  }

  /**
   * ASSESS DEAL QUALITY
   */
  assessDealQuality(metrics) {
    const {
      currentNOI,
      potentialNOI,
      ourOffer,
      potentialARV,
      buyerCashOnCashReturn,
      units
    } = metrics;

    let score = 0;
    const factors = [];

    // Factor 1: NOI Upside (higher is better)
    const noiUpside = ((potentialNOI - currentNOI) / currentNOI) * 100;
    if (noiUpside > 20) {
      score += 25;
      factors.push({ factor: 'High rent upside', value: `${noiUpside.toFixed(0)}%`, impact: 25 });
    } else if (noiUpside > 10) {
      score += 15;
      factors.push({ factor: 'Moderate rent upside', value: `${noiUpside.toFixed(0)}%`, impact: 15 });
    } else {
      score += 5;
      factors.push({ factor: 'Low rent upside', value: `${noiUpside.toFixed(0)}%`, impact: 5 });
    }

    // Factor 2: Buyer Cash-on-Cash Return (higher is better)
    if (buyerCashOnCashReturn > 12) {
      score += 30;
      factors.push({ factor: 'Excellent buyer ROI', value: `${buyerCashOnCashReturn.toFixed(1)}%`, impact: 30 });
    } else if (buyerCashOnCashReturn > 10) {
      score += 20;
      factors.push({ factor: 'Good buyer ROI', value: `${buyerCashOnCashReturn.toFixed(1)}%`, impact: 20 });
    } else if (buyerCashOnCashReturn > 8) {
      score += 10;
      factors.push({ factor: 'Acceptable buyer ROI', value: `${buyerCashOnCashReturn.toFixed(1)}%`, impact: 10 });
    } else {
      score += 0;
      factors.push({ factor: 'Low buyer ROI', value: `${buyerCashOnCashReturn.toFixed(1)}%`, impact: 0 });
    }

    // Factor 3: Spread (our margin)
    const spread = potentialARV - ourOffer;
    const spreadPercent = (spread / potentialARV) * 100;
    if (spreadPercent > 25) {
      score += 25;
      factors.push({ factor: 'Excellent spread', value: `${spreadPercent.toFixed(0)}%`, impact: 25 });
    } else if (spreadPercent > 20) {
      score += 15;
      factors.push({ factor: 'Good spread', value: `${spreadPercent.toFixed(0)}%`, impact: 15 });
    } else {
      score += 5;
      factors.push({ factor: 'Tight spread', value: `${spreadPercent.toFixed(0)}%`, impact: 5 });
    }

    // Factor 4: Unit count (more units = more stable)
    if (units >= 10) {
      score += 20;
      factors.push({ factor: 'High unit count (stable)', value: `${units} units`, impact: 20 });
    } else if (units >= 5) {
      score += 15;
      factors.push({ factor: 'Medium unit count', value: `${units} units`, impact: 15 });
    } else {
      score += 10;
      factors.push({ factor: 'Low unit count', value: `${units} units`, impact: 10 });
    }

    return {
      score,
      grade: score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F',
      recommendation: score >= 70 ? 'PURSUE AGGRESSIVELY' : score >= 50 ? 'GOOD DEAL' : 'PASS',
      factors
    };
  }

  /**
   * GENERATE RECOMMENDATIONS
   */
  generateRecommendations(data) {
    const recommendations = [];

    // Rent upside opportunity
    data.currentRents.forEach((current, i) => {
      const market = data.marketRents[i];
      if (market > current * 1.10) { // 10%+ below market
        recommendations.push({
          type: 'income_optimization',
          priority: 'high',
          action: `Increase rent on Unit ${i + 1} from $${current} to $${market}`,
          impact: `+$${(market - current) * 12}/year`,
          timeline: 'On lease renewal'
        });
      }
    });

    // Condition-based recommendations
    if (data.condition === 'needs-work') {
      recommendations.push({
        type: 'value_add',
        priority: 'medium',
        action: 'Renovate units to justify market rents',
        impact: 'Increase NOI by 15-20%',
        timeline: '6-12 months'
      });
    }

    // Cash-on-cash optimization
    if (data.cashOnCashReturn < 10) {
      recommendations.push({
        type: 'financing',
        priority: 'high',
        action: 'Negotiate seller financing or creative terms',
        impact: 'Improve cash-on-cash return to 12%+',
        timeline: 'Before closing'
      });
    }

    return recommendations;
  }
}

module.exports = MultiFamilyAnalyzer;
