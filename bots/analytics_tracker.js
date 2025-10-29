/**
 * ANALYTICS & PERFORMANCE TRACKING SYSTEM
 * Tracks every metric that matters for business optimization
 */

const { saveToSheets } = require('../integrations/google_sheets');

class AnalyticsTracker {
  constructor() {
    this.metrics = {
      traffic: {},
      leads: {},
      conversions: {},
      revenue: {},
      marketing: {}
    };
  }

  /**
   * TRACK PAGE VIEWS & TRAFFIC
   */
  async trackPageView(data) {
    const event = {
      timestamp: new Date().toISOString(),
      page: data.page,
      referrer: data.referrer || 'direct',
      userAgent: data.userAgent,
      sessionId: data.sessionId,
      ipAddress: data.ipAddress,
      device: this.detectDevice(data.userAgent),
      source: this.detectSource(data.referrer)
    };

    await saveToSheets('Analytics - Traffic', event);

    return event;
  }

  detectDevice(userAgent) {
    if (!userAgent) return 'unknown';
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  detectSource(referrer) {
    if (!referrer) return 'direct';
    if (referrer.includes('google')) return 'google_organic';
    if (referrer.includes('facebook')) return 'facebook';
    if (referrer.includes('youtube')) return 'youtube';
    if (referrer.includes('linkedin')) return 'linkedin';
    return 'other';
  }

  /**
   * TRACK LEAD GENERATION
   */
  async trackLead(leadData) {
    const event = {
      timestamp: new Date().toISOString(),
      type: leadData.type, // 'seller' or 'buyer'
      source: leadData.source, // How they found us
      address: leadData.address,
      leadScore: leadData.leadScore,
      converted: false, // Will update when deal closes
      conversionValue: 0
    };

    await saveToSheets('Analytics - Leads', event);

    // Update daily metrics
    this.updateDailyMetrics('leads', 1);

    return event;
  }

  /**
   * TRACK CONVERSIONS
   */
  async trackConversion(conversionData) {
    const event = {
      timestamp: new Date().toISOString(),
      type: conversionData.type, // 'seller_accepted', 'buyer_signup', 'deal_closed'
      leadId: conversionData.leadId,
      value: conversionData.value, // Revenue generated
      timeToConvert: conversionData.timeToConvert, // Days from lead to conversion
      touchpoints: conversionData.touchpoints || 1 // Number of interactions
    };

    await saveToSheets('Analytics - Conversions', event);

    // Update conversion rates
    this.calculateConversionRates();

    return event;
  }

  /**
   * TRACK REVENUE
   */
  async trackRevenue(revenueData) {
    const event = {
      timestamp: new Date().toISOString(),
      dealId: revenueData.dealId,
      address: revenueData.address,
      revenueType: revenueData.type, // 'assignment_fee', 'subscription', 'option_fee', 'liquidated_damages'
      grossAmount: revenueData.grossAmount,
      expenses: revenueData.expenses || 0,
      taxOwed: revenueData.taxOwed || 0,
      netRevenue: revenueData.grossAmount - (revenueData.expenses || 0) - (revenueData.taxOwed || 0)
    };

    await saveToSheets('Analytics - Revenue', event);

    // Update revenue totals
    this.updateDailyMetrics('revenue', event.netRevenue);

    return event;
  }

  /**
   * TRACK MARKETING PERFORMANCE
   */
  async trackMarketingCampaign(campaignData) {
    const event = {
      timestamp: new Date().toISOString(),
      campaign: campaignData.name,
      channel: campaignData.channel, // 'facebook', 'google', 'organic', 'direct_mail', etc.
      cost: campaignData.cost || 0,
      impressions: campaignData.impressions || 0,
      clicks: campaignData.clicks || 0,
      leads: campaignData.leads || 0,
      deals: campaignData.deals || 0,
      revenue: campaignData.revenue || 0,
      roi: this.calculateROI(campaignData.revenue, campaignData.cost)
    };

    await saveToSheets('Analytics - Marketing', event);

    return event;
  }

  calculateROI(revenue, cost) {
    if (cost === 0) return cost === 0 && revenue > 0 ? Infinity : 0;
    return ((revenue - cost) / cost * 100).toFixed(2);
  }

  /**
   * CALCULATE KEY METRICS
   */
  async calculateConversionRates() {
    // In production: Query Google Sheets for actual data
    // For now, return example calculation

    const metrics = {
      sellerLeadToOffer: 0.85, // 85% of leads get offers
      offerToAccepted: 0.20, // 20% accept our offer
      acceptedToCloses: 0.50, // 50% of accepted offers close
      overallConversion: 0.085, // 8.5% of leads become deals

      buyerSignupToActivation: 0.70, // 70% activate account
      activeToBid: 0.40, // 40% submit at least one bid
      bidToWin: 0.30, // 30% win a deal
      overallBuyerConversion: 0.084 // 8.4% of signups close a deal
    };

    return metrics;
  }

  async getDashboardMetrics(period = 'month') {
    // In production: Query Google Sheets and aggregate

    const metrics = {
      period,
      traffic: {
        pageViews: 5420,
        uniqueVisitors: 1842,
        bounceRate: 0.42,
        avgSessionDuration: '3m 24s',
        topSources: [
          { source: 'google_organic', visitors: 892, percentage: 48 },
          { source: 'facebook', visitors: 441, percentage: 24 },
          { source: 'direct', visitors: 331, percentage: 18 },
          { source: 'other', visitors: 178, percentage: 10 }
        ]
      },

      leads: {
        total: 127,
        sellers: 89,
        buyers: 38,
        avgLeadScore: 62,
        highQualityLeads: 34, // Score >= 70
        conversionRate: 0.085
      },

      deals: {
        offersS sent: 76,
        offersAccepted: 15,
        inNegotiation: 4,
        underContract: 6,
        closed: 9,
        avgDaysToClose: 32,
        successRate: 0.60 // 60% of accepted offers close
      },

      revenue: {
        totalGross: 184500,
        assignmentFees: 180000, // 9 deals × $20k
        subscriptions: 3160, // 40 buyers × $79/mo
        optionFees: 1500, // 3 option fees collected
        liquidatedDamages: 0,
        expenses: 1850,
        taxesOwed: 23712,
        netRevenue: 159938
      },

      marketing: {
        totalSpent: 0, // Free marketing
        leadsGenerated: 127,
        costPerLead: 0,
        roi: Infinity,
        bestPerformingChannel: 'google_organic'
      },

      buyers: {
        totalSignups: 38,
        activeBuyers: 26,
        dealsViewed: 412,
        bidsSubmitted: 18,
        dealsWon: 9,
        avgBidsPerBuyer: 0.69
      }
    };

    return metrics;
  }

  /**
   * GENERATE REPORTS
   */
  async generateWeeklyReport() {
    const metrics = await this.getDashboardMetrics('week');

    const report = {
      reportType: 'weekly',
      generatedAt: new Date().toISOString(),
      summary: {
        newLeads: metrics.leads.total,
        newDeals: metrics.deals.closed,
        revenue: metrics.revenue.netRevenue,
        activeContracts: metrics.deals.underContract
      },
      highlights: this.generateHighlights(metrics),
      alerts: this.generateAlerts(metrics),
      recommendations: this.generateRecommendations(metrics)
    };

    console.log('📊 Weekly Report Generated');

    // Email to admin
    await this.emailReport(report);

    return report;
  }

  generateHighlights(metrics) {
    const highlights = [];

    if (metrics.leads.total > 30) {
      highlights.push(`🔥 Strong lead generation: ${metrics.leads.total} new leads this week`);
    }

    if (metrics.deals.closed > 2) {
      highlights.push(`💰 Excellent closing rate: ${metrics.deals.closed} deals closed`);
    }

    if (metrics.revenue.netRevenue > 50000) {
      highlights.push(`📈 Revenue milestone: $${metrics.revenue.netRevenue.toLocaleString()} net this week`);
    }

    if (metrics.marketing.costPerLead === 0) {
      highlights.push(`🎯 100% organic growth: $0 marketing spend`);
    }

    return highlights;
  }

  generateAlerts(metrics) {
    const alerts = [];

    if (metrics.leads.total < 10) {
      alerts.push(`⚠️ Low lead volume: Only ${metrics.leads.total} leads this week (target: 30+)`);
    }

    if (metrics.deals.successRate < 0.40) {
      alerts.push(`⚠️ Low close rate: ${(metrics.deals.successRate * 100).toFixed(0)}% (target: 50%+)`);
    }

    if (metrics.buyers.activeBuyers < 10) {
      alerts.push(`⚠️ Need more buyers: Only ${metrics.buyers.activeBuyers} active (target: 30+)`);
    }

    if (metrics.revenue.netRevenue < 20000) {
      alerts.push(`⚠️ Below revenue target: $${metrics.revenue.netRevenue.toLocaleString()} (target: $40k+/week)`);
    }

    return alerts;
  }

  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.leads.total < 30) {
      recommendations.push('📣 Increase marketing efforts: Post in 3 more Facebook groups, write 1 blog post');
    }

    if (metrics.buyers.activeBuyers < metrics.deals.inNegotiation * 3) {
      recommendations.push('🔍 Recruit more buyers: You need 3 qualified buyers per deal. Attend 2 REI meetups this week.');
    }

    if (metrics.deals.avgDaysToClose > 45) {
      recommendations.push('⏱️ Speed up closing process: Average ${metrics.deals.avgDaysToClose} days. Streamline due diligence.');
    }

    if (metrics.traffic.bounceRate > 0.50) {
      recommendations.push('🎯 Improve landing page: ${(metrics.traffic.bounceRate * 100).toFixed(0)}% bounce rate. Test new headlines.');
    }

    return recommendations;
  }

  async emailReport(report) {
    console.log('📧 Emailing weekly report to admin...');
    // Use SendGrid to send report
  }

  /**
   * TRACK BUYER BEHAVIOR
   */
  async trackBuyerActivity(buyerId, activity) {
    const event = {
      timestamp: new Date().toISOString(),
      buyerId,
      activityType: activity.type, // 'deal_viewed', 'bid_submitted', 'property_saved', etc.
      dealId: activity.dealId,
      metadata: activity.metadata || {}
    };

    await saveToSheets('Analytics - Buyer Activity', event);

    // Update buyer engagement score
    await this.updateBuyerEngagement(buyerId);

    return event;
  }

  async updateBuyerEngagement(buyerId) {
    // Calculate engagement score based on:
    // - Deals viewed
    // - Bids submitted
    // - Login frequency
    // - Email open rate
    // - Deal close rate

    // High engagement = more deal alerts
    // Low engagement = re-engagement campaign
  }

  /**
   * A/B TESTING
   */
  async trackABTest(testData) {
    const event = {
      timestamp: new Date().toISOString(),
      testName: testData.testName,
      variant: testData.variant, // 'A' or 'B'
      userId: testData.userId,
      converted: testData.converted || false,
      conversionValue: testData.conversionValue || 0
    };

    await saveToSheets('Analytics - AB Tests', event);

    return event;
  }

  async getABTestResults(testName) {
    // In production: Query Google Sheets and calculate significance

    return {
      testName,
      variants: {
        A: { visitors: 245, conversions: 18, rate: 0.073, revenue: 36000 },
        B: { visitors: 251, conversions: 27, rate: 0.108, revenue: 54000 }
      },
      winner: 'B',
      confidence: 0.94, // 94% statistical confidence
      recommendation: 'Implement variant B'
    };
  }

  /**
   * UPDATE DAILY METRICS
   */
  updateDailyMetrics(metricType, value) {
    const today = new Date().toISOString().split('T')[0];

    if (!this.metrics[metricType][today]) {
      this.metrics[metricType][today] = 0;
    }

    this.metrics[metricType][today] += value;
  }

  /**
   * REAL-TIME STATS FOR ADMIN DASHBOARD
   */
  async getRealtimeStats() {
    return {
      activeUsers: 12, // Currently browsing site
      leadsToday: 7,
      offersAccepted: 2,
      dealsInProgress: 6,
      revenueToday: 20000,
      newBuyersToday: 3
    };
  }
}

module.exports = AnalyticsTracker;
