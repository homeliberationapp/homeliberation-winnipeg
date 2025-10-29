/**
 * SAVED SEARCH MANAGER
 * Allows buyers to save investment criteria and get email alerts
 *
 * Features:
 * - Save multiple search criteria
 * - Email frequency options (instant, daily, weekly)
 * - Match new deals against saved searches
 * - Send personalized email alerts
 * - Track email opens/clicks
 * - Pause/resume searches
 */

class SavedSearchManager {

  constructor() {
    this.searches = []; // In production, load from database
  }

  /**
   * CREATE SAVED SEARCH
   * Buyer saves their investment criteria
   */
  async createSavedSearch(buyerId, searchData) {
    console.log(`💾 Creating saved search for buyer: ${buyerId}`);

    const search = {
      id: this.generateSearchId(),
      buyerId: buyerId,
      name: searchData.name || 'My Search',

      // Investment criteria
      criteria: {
        propertyTypes: searchData.propertyTypes || [],
        preferredNeighborhoods: searchData.preferredNeighborhoods || [],
        minBudget: searchData.minBudget || 0,
        maxBudget: searchData.maxBudget || 1000000,
        minROI: searchData.minROI || 0.10,
        minCapRate: searchData.minCapRate || 0.05,
        minDealQuality: searchData.minDealQuality || 70,
        maxRepairCost: searchData.maxRepairCost || 100000
      },

      // Email preferences
      emailFrequency: searchData.emailFrequency || 'instant', // 'instant', 'daily', 'weekly'
      active: true,

      // Tracking
      createdAt: Date.now(),
      lastEmailSent: null,
      totalEmailsSent: 0,
      totalMatchesFound: 0,
      emailOpenRate: 0,
      emailClickRate: 0
    };

    // Save to database
    await this.saveSearch(search);

    console.log(`   ✅ Saved search created: "${search.name}"`);
    console.log(`   📧 Email frequency: ${search.emailFrequency}`);

    return search;
  }

  /**
   * UPDATE SAVED SEARCH
   */
  async updateSavedSearch(searchId, updates) {
    const search = await this.getSearch(searchId);

    if (!search) {
      throw new Error('Search not found');
    }

    // Update criteria
    if (updates.criteria) {
      search.criteria = { ...search.criteria, ...updates.criteria };
    }

    // Update email frequency
    if (updates.emailFrequency) {
      search.emailFrequency = updates.emailFrequency;
    }

    // Update name
    if (updates.name) {
      search.name = updates.name;
    }

    // Update active status
    if (typeof updates.active === 'boolean') {
      search.active = updates.active;
    }

    await this.saveSearch(search);

    console.log(`✅ Search updated: ${search.name}`);
    return search;
  }

  /**
   * DELETE SAVED SEARCH
   */
  async deleteSavedSearch(searchId) {
    console.log(`🗑️  Deleting saved search: ${searchId}`);

    // Delete from database
    await this.removeSearch(searchId);

    console.log(`   ✅ Search deleted`);
  }

  /**
   * GET ALL SAVED SEARCHES FOR BUYER
   */
  async getBuyerSearches(buyerId) {
    // In production, fetch from database
    return this.searches.filter(s => s.buyerId === buyerId);
  }

  /**
   * FIND MATCHING DEALS FOR SAVED SEARCH
   * Check if new deal matches a saved search
   */
  async findMatchingSearches(deal) {
    console.log(`🔍 Finding saved searches matching: ${deal.address}`);

    const allSearches = await this.getAllActiveSearches();
    const matches = [];

    for (const search of allSearches) {
      const matchScore = this.calculateMatchScore(search.criteria, deal);

      if (matchScore >= 50) {
        matches.push({
          search,
          matchScore,
          deal
        });
      }
    }

    console.log(`   Found ${matches.length} matching searches`);
    return matches;
  }

  /**
   * CALCULATE MATCH SCORE
   * Same logic as intelligent_matcher.js
   */
  calculateMatchScore(criteria, deal) {
    let score = 0;

    // Property type (25 points)
    if (criteria.propertyTypes && criteria.propertyTypes.includes(deal.propertyType)) {
      score += 25;
    }

    // Budget (20 points)
    if (deal.price >= criteria.minBudget && deal.price <= criteria.maxBudget) {
      score += 20;
    } else if (deal.price < criteria.maxBudget * 1.1) {
      score += 10;
    }

    // Location (20 points)
    if (criteria.preferredNeighborhoods && criteria.preferredNeighborhoods.includes(deal.neighborhood)) {
      score += 20;
    }

    // ROI (15 points)
    if (deal.roi >= criteria.minROI) {
      score += 15;
    }

    // Cap Rate (10 points)
    if (deal.capRate >= criteria.minCapRate) {
      score += 10;
    }

    // Deal Quality (10 points)
    if (deal.dealQuality >= criteria.minDealQuality) {
      score += 10;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * SEND INSTANT EMAIL ALERTS
   * For 'instant' frequency searches
   */
  async sendInstantAlerts(deal) {
    console.log(`📧 Sending instant alerts for: ${deal.address}`);

    const matches = await this.findMatchingSearches(deal);

    // Filter for instant frequency
    const instantMatches = matches.filter(m => m.search.emailFrequency === 'instant');

    console.log(`   ${instantMatches.length} instant alerts to send`);

    for (const match of instantMatches) {
      await this.sendMatchEmail(match.search, match.deal, match.matchScore);

      // Update search stats
      match.search.lastEmailSent = Date.now();
      match.search.totalEmailsSent++;
      match.search.totalMatchesFound++;
      await this.saveSearch(match.search);
    }

    console.log(`   ✅ Instant alerts sent`);
  }

  /**
   * SEND DAILY DIGEST
   * For 'daily' frequency searches (run via cron at 8am)
   */
  async sendDailyDigests() {
    console.log(`📧 Sending daily digests...`);

    const allSearches = await this.getAllActiveSearches();
    const dailySearches = allSearches.filter(s => s.emailFrequency === 'daily');

    console.log(`   ${dailySearches.length} daily digests to send`);

    for (const search of dailySearches) {
      // Get new deals from last 24 hours
      const newDeals = await this.getNewDealsLastDay();

      // Find matching deals
      const matches = newDeals
        .map(deal => ({
          deal,
          matchScore: this.calculateMatchScore(search.criteria, deal)
        }))
        .filter(m => m.matchScore >= 50)
        .sort((a, b) => b.matchScore - a.matchScore);

      if (matches.length > 0) {
        await this.sendDailyDigestEmail(search, matches);

        // Update stats
        search.lastEmailSent = Date.now();
        search.totalEmailsSent++;
        search.totalMatchesFound += matches.length;
        await this.saveSearch(search);
      }
    }

    console.log(`   ✅ Daily digests sent`);
  }

  /**
   * SEND WEEKLY DIGEST
   * For 'weekly' frequency searches (run via cron on Mondays at 8am)
   */
  async sendWeeklyDigests() {
    console.log(`📧 Sending weekly digests...`);

    const allSearches = await this.getAllActiveSearches();
    const weeklySearches = allSearches.filter(s => s.emailFrequency === 'weekly');

    console.log(`   ${weeklySearches.length} weekly digests to send`);

    for (const search of weeklySearches) {
      // Get new deals from last 7 days
      const newDeals = await this.getNewDealsLastWeek();

      // Find matching deals
      const matches = newDeals
        .map(deal => ({
          deal,
          matchScore: this.calculateMatchScore(search.criteria, deal)
        }))
        .filter(m => m.matchScore >= 50)
        .sort((a, b) => b.matchScore - a.matchScore);

      if (matches.length > 0) {
        await this.sendWeeklyDigestEmail(search, matches);

        // Update stats
        search.lastEmailSent = Date.now();
        search.totalEmailsSent++;
        search.totalMatchesFound += matches.length;
        await this.saveSearch(search);
      }
    }

    console.log(`   ✅ Weekly digests sent`);
  }

  /**
   * SEND MATCH EMAIL (Instant)
   */
  async sendMatchEmail(search, deal, matchScore) {
    const buyer = await this.getBuyer(search.buyerId);

    const subject = matchScore >= 80
      ? `🔥 PERFECT MATCH: ${deal.address}`
      : `🏠 New Deal Matches "${search.name}": ${deal.address}`;

    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${deal.address}</h2>
        <p style="font-size: 18px; color: #F59E0B; font-weight: bold;">${matchScore}% Match to "${search.name}"</p>

        <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Deal Highlights:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;"><strong>Price:</strong></td>
              <td style="padding: 8px 0; text-align: right;">$${deal.price.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>ARV:</strong></td>
              <td style="padding: 8px 0; text-align: right;">$${deal.arv.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>ROI:</strong></td>
              <td style="padding: 8px 0; text-align: right; color: #10B981; font-weight: bold;">${(deal.roi * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Cap Rate:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${(deal.capRate * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Neighborhood:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${deal.neighborhood}</td>
            </tr>
          </table>
        </div>

        <h3>Why This Matches:</h3>
        <ul style="line-height: 1.8;">
          ${this.getMatchReasons(search.criteria, deal, matchScore).map(r => `<li>${r}</li>`).join('')}
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/deals/${deal.id}"
             style="background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
                    color: white;
                    padding: 16px 40px;
                    text-decoration: none;
                    border-radius: 8px;
                    display: inline-block;
                    font-weight: bold;
                    font-size: 16px;">
            View Deal & Place Bid
          </a>
        </div>

        ${matchScore >= 80 ? '<p style="color: #EF4444; font-weight: bold; text-align: center;">⚠️ This is a hot deal - other investors are viewing it right now!</p>' : ''}

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;" />

        <p style="font-size: 12px; color: #64748B;">
          You're receiving this email because this deal matches your saved search "<strong>${search.name}</strong>".
          <br/>
          <a href="${process.env.APP_URL}/buyers/saved-searches" style="color: #F59E0B;">Manage your saved searches</a> |
          <a href="${process.env.APP_URL}/buyers/settings" style="color: #F59E0B;">Email preferences</a>
        </p>
      </div>
    `;

    await this.sendEmail(buyer.email, subject, body, {
      searchId: search.id,
      dealId: deal.id,
      trackOpens: true,
      trackClicks: true
    });
  }

  /**
   * SEND DAILY DIGEST EMAIL
   */
  async sendDailyDigestEmail(search, matches) {
    const buyer = await this.getBuyer(search.buyerId);

    const subject = `📊 Daily Digest: ${matches.length} New Deal${matches.length > 1 ? 's' : ''} Match "${search.name}"`;

    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Daily Digest</h2>
        <p>${matches.length} new deal${matches.length > 1 ? 's' : ''} match your saved search "<strong>${search.name}</strong>"</p>

        ${matches.map(match => `
          <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${match.deal.address}</h3>
            <p style="color: #F59E0B; font-weight: bold;">${match.matchScore}% Match</p>

            <table style="width: 100%; margin: 15px 0;">
              <tr>
                <td><strong>Price:</strong> $${match.deal.price.toLocaleString()}</td>
                <td><strong>ROI:</strong> <span style="color: #10B981;">${(match.deal.roi * 100).toFixed(1)}%</span></td>
              </tr>
              <tr>
                <td><strong>ARV:</strong> $${match.deal.arv.toLocaleString()}</td>
                <td><strong>Cap Rate:</strong> ${(match.deal.capRate * 100).toFixed(1)}%</td>
              </tr>
            </table>

            <a href="${process.env.APP_URL}/deals/${match.deal.id}"
               style="background: #F59E0B;
                      color: white;
                      padding: 12px 24px;
                      text-decoration: none;
                      border-radius: 6px;
                      display: inline-block;
                      margin-top: 10px;">
              View Deal
            </a>
          </div>
        `).join('')}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/buyers/dashboard"
             style="color: #F59E0B; text-decoration: underline;">
            View All Deals →
          </a>
        </div>

        <p style="font-size: 12px; color: #64748B; margin-top: 30px;">
          <a href="${process.env.APP_URL}/buyers/saved-searches" style="color: #F59E0B;">Manage saved searches</a> |
          <a href="${process.env.APP_URL}/buyers/settings" style="color: #F59E0B;">Change to instant alerts</a>
        </p>
      </div>
    `;

    await this.sendEmail(buyer.email, subject, body, {
      searchId: search.id,
      trackOpens: true
    });
  }

  /**
   * SEND WEEKLY DIGEST EMAIL
   */
  async sendWeeklyDigestEmail(search, matches) {
    const buyer = await this.getBuyer(search.buyerId);

    const subject = `📊 Weekly Digest: ${matches.length} Deal${matches.length > 1 ? 's' : ''} Match "${search.name}"`;

    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Weekly Digest</h2>
        <p>Here are the <strong>${matches.length}</strong> best deals from this week that match "<strong>${search.name}</strong>"</p>

        ${matches.slice(0, 5).map(match => `
          <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${match.deal.address}</h3>
            <p style="color: #F59E0B; font-weight: bold;">${match.matchScore}% Match</p>

            <p><strong>Price:</strong> $${match.deal.price.toLocaleString()} | <strong>ROI:</strong> <span style="color: #10B981;">${(match.deal.roi * 100).toFixed(1)}%</span></p>

            <a href="${process.env.APP_URL}/deals/${match.deal.id}"
               style="background: #F59E0B;
                      color: white;
                      padding: 12px 24px;
                      text-decoration: none;
                      border-radius: 6px;
                      display: inline-block;">
              View Deal
            </a>
          </div>
        `).join('')}

        ${matches.length > 5 ? `<p style="text-align: center;"><a href="${process.env.APP_URL}/buyers/dashboard" style="color: #F59E0B;">View all ${matches.length} matches →</a></p>` : ''}

        <p style="font-size: 12px; color: #64748B; margin-top: 30px;">
          <a href="${process.env.APP_URL}/buyers/saved-searches" style="color: #F59E0B;">Manage saved searches</a> |
          <a href="${process.env.APP_URL}/buyers/settings" style="color: #F59E0B;">Change to daily alerts</a>
        </p>
      </div>
    `;

    await this.sendEmail(buyer.email, subject, body, {
      searchId: search.id,
      trackOpens: true
    });
  }

  /**
   * GET MATCH REASONS
   */
  getMatchReasons(criteria, deal, score) {
    const reasons = [];

    if (criteria.propertyTypes && criteria.propertyTypes.includes(deal.propertyType)) {
      reasons.push(`Matches your preferred property type: ${deal.propertyType}`);
    }

    if (deal.price >= criteria.minBudget && deal.price <= criteria.maxBudget) {
      reasons.push(`Within your budget: $${deal.price.toLocaleString()}`);
    }

    if (criteria.preferredNeighborhoods && criteria.preferredNeighborhoods.includes(deal.neighborhood)) {
      reasons.push(`In your preferred neighborhood: ${deal.neighborhood}`);
    }

    if (deal.roi >= criteria.minROI) {
      reasons.push(`Exceeds your ROI target: ${(deal.roi * 100).toFixed(1)}% (target: ${(criteria.minROI * 100).toFixed(1)}%)`);
    }

    if (deal.dealQuality >= criteria.minDealQuality) {
      reasons.push(`High quality deal: ${deal.dealQuality}/100`);
    }

    if (score >= 80) {
      reasons.push(`🔥 EXCEPTIONAL MATCH - Act fast!`);
    }

    return reasons;
  }

  /**
   * TRACK EMAIL OPEN
   */
  async trackEmailOpen(searchId, dealId) {
    const search = await this.getSearch(searchId);
    if (!search) return;

    // Calculate open rate
    const totalOpens = search.totalOpens || 0;
    search.totalOpens = totalOpens + 1;
    search.emailOpenRate = (search.totalOpens / search.totalEmailsSent) * 100;

    await this.saveSearch(search);
  }

  /**
   * TRACK EMAIL CLICK
   */
  async trackEmailClick(searchId, dealId) {
    const search = await this.getSearch(searchId);
    if (!search) return;

    // Calculate click rate
    const totalClicks = search.totalClicks || 0;
    search.totalClicks = totalClicks + 1;
    search.emailClickRate = (search.totalClicks / search.totalEmailsSent) * 100;

    await this.saveSearch(search);
  }

  /**
   * HELPER: Generate search ID
   */
  generateSearchId() {
    return 'search_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * HELPER: Get buyer
   */
  async getBuyer(buyerId) {
    // In production, fetch from database
    return {
      userId: buyerId,
      email: 'buyer@example.com',
      name: 'John Doe'
    };
  }

  /**
   * HELPER: Get search
   */
  async getSearch(searchId) {
    return this.searches.find(s => s.id === searchId);
  }

  /**
   * HELPER: Save search
   */
  async saveSearch(search) {
    const index = this.searches.findIndex(s => s.id === search.id);
    if (index >= 0) {
      this.searches[index] = search;
    } else {
      this.searches.push(search);
    }
  }

  /**
   * HELPER: Remove search
   */
  async removeSearch(searchId) {
    this.searches = this.searches.filter(s => s.id !== searchId);
  }

  /**
   * HELPER: Get all active searches
   */
  async getAllActiveSearches() {
    return this.searches.filter(s => s.active);
  }

  /**
   * HELPER: Get new deals from last day
   */
  async getNewDealsLastDay() {
    // In production, fetch from database
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    // return deals.filter(d => d.createdAt >= oneDayAgo);
    return [];
  }

  /**
   * HELPER: Get new deals from last week
   */
  async getNewDealsLastWeek() {
    // In production, fetch from database
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    // return deals.filter(d => d.createdAt >= oneWeekAgo);
    return [];
  }

  /**
   * HELPER: Send email
   */
  async sendEmail(to, subject, html, options = {}) {
    console.log(`📧 Sending email to: ${to}`);
    console.log(`   Subject: ${subject}`);

    // In production, use SendGrid or similar
    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        html,
        ...options
      })
    });
  }
}

// Export
module.exports = new SavedSearchManager();
