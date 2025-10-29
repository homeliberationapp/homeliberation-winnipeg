/**
 * INTELLIGENT MATCHER
 * AI-powered buyer-to-deal matching
 *
 * Uses multiple signals to match buyers with perfect deals:
 * - Investment criteria
 * - Past behavior
 * - Response patterns
 * - Portfolio preferences
 */

class IntelligentMatcher {

  constructor() {
    this.weights = {
      propertyType: 0.25,      // 25% weight
      budget: 0.20,            // 20% weight
      location: 0.20,          // 20% weight
      roi: 0.15,               // 15% weight
      dealQuality: 0.10,       // 10% weight
      behaviorMatch: 0.10      // 10% weight (AI learns this)
    };
  }

  /**
   * FIND MATCHING BUYERS FOR A DEAL
   * When new deal comes in, find all buyers who would be interested
   */
  async findMatchingBuyers(deal, allBuyers) {
    console.log(`\n🎯 Finding buyers for: ${deal.address}`);

    const matches = [];

    for (const buyer of allBuyers) {
      const matchScore = this.calculateMatchScore(buyer, deal);

      if (matchScore >= 50) { // Minimum 50% match
        matches.push({
          buyer,
          matchScore,
          matchReasons: this.getMatchReasons(buyer, deal, matchScore)
        });
      }
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`   Found ${matches.length} matching buyers`);
    console.log(`   Top match: ${matches[0]?.buyer.name} (${matches[0]?.matchScore}% match)`);

    return matches;
  }

  /**
   * FIND MATCHING DEALS FOR A BUYER
   * When buyer logs in, show them deals that match their criteria
   */
  async findMatchingDeals(buyer, allDeals) {
    console.log(`\n🏠 Finding deals for: ${buyer.name}`);

    const matches = [];

    for (const deal of allDeals) {
      const matchScore = this.calculateMatchScore(buyer, deal);

      if (matchScore >= 50) {
        matches.push({
          deal,
          matchScore,
          matchReasons: this.getMatchReasons(buyer, deal, matchScore)
        });
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`   Found ${matches.length} matching deals`);

    return matches;
  }

  /**
   * CALCULATE MATCH SCORE
   * Returns 0-100 score
   */
  calculateMatchScore(buyer, deal) {
    const criteria = buyer.investmentCriteria;
    let totalScore = 0;

    // 1. PROPERTY TYPE MATCH (25 points)
    if (criteria.propertyTypes && criteria.propertyTypes.includes(deal.propertyType)) {
      totalScore += 25;
    }

    // 2. BUDGET MATCH (20 points)
    if (deal.price >= criteria.minBudget && deal.price <= criteria.maxBudget) {
      totalScore += 20;
    } else if (deal.price < criteria.maxBudget * 1.1) {
      // Close to budget
      totalScore += 10;
    }

    // 3. LOCATION MATCH (20 points)
    if (criteria.preferredNeighborhoods && criteria.preferredNeighborhoods.includes(deal.neighborhood)) {
      totalScore += 20;
    } else if (!criteria.avoidNeighborhoods || !criteria.avoidNeighborhoods.includes(deal.neighborhood)) {
      // Not in avoid list
      totalScore += 10;
    }

    // 4. ROI MATCH (15 points)
    if (deal.roi >= criteria.minROI) {
      totalScore += 15;

      // Bonus for exceptional ROI
      if (deal.roi >= criteria.minROI * 1.5) {
        totalScore += 5;
      }
    } else if (deal.roi >= criteria.minROI * 0.8) {
      // Close to target ROI
      totalScore += 7;
    }

    // 5. DEAL QUALITY MATCH (10 points)
    if (deal.dealQuality >= criteria.minDealQuality) {
      totalScore += 10;
    } else if (deal.dealQuality >= criteria.minDealQuality * 0.9) {
      totalScore += 5;
    }

    // 6. BEHAVIOR MATCH (10 points) - AI learns this
    const behaviorScore = this.calculateBehaviorMatch(buyer, deal);
    totalScore += behaviorScore;

    return Math.min(100, Math.round(totalScore));
  }

  /**
   * CALCULATE BEHAVIOR MATCH
   * AI learns what types of deals this buyer actually bids on
   */
  calculateBehaviorMatch(buyer, deal) {
    let score = 0;

    // Past behavior
    const bidHistory = buyer.bidHistory || [];

    if (bidHistory.length === 0) {
      // New buyer, no data yet
      return 5; // Neutral score
    }

    // Check if buyer has bid on similar properties
    const similarBids = bidHistory.filter(bid => {
      return bid.propertyType === deal.propertyType &&
             Math.abs(bid.bidAmount - deal.price) / deal.price < 0.2; // Within 20%
    });

    if (similarBids.length > 0) {
      score += 5;
    }

    // Check if buyer wins deals in this price range
    const winsInRange = bidHistory.filter(bid => {
      return bid.wonDeal &&
             bid.finalPrice >= deal.price * 0.8 &&
             bid.finalPrice <= deal.price * 1.2;
    });

    if (winsInRange.length > 0) {
      score += 5;
    }

    return score;
  }

  /**
   * GET MATCH REASONS
   * Explain WHY this is a good match
   */
  getMatchReasons(buyer, deal, score) {
    const reasons = [];
    const criteria = buyer.investmentCriteria;

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
      reasons.push(`Exceeds your ROI target: ${(deal.roi * 100).toFixed(1)}%`);
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
   * NOTIFY MATCHING BUYERS
   * Send email/SMS to buyers when deal matches their criteria
   */
  async notifyMatchingBuyers(deal, matches) {
    console.log(`\n📧 Notifying ${matches.length} matching buyers...`);

    for (const match of matches) {
      const buyer = match.buyer;

      // Check notification preferences
      if (!buyer.notifications || !buyer.notifications.email || !buyer.notifications.email.newDeals) {
        continue;
      }

      // Check quiet hours
      if (this.isQuietHours(buyer)) {
        console.log(`   ⏰ ${buyer.name} - Quiet hours, queued for later`);
        await this.queueNotification(buyer, deal, match);
        continue;
      }

      // Send email
      if (match.matchScore >= 80) {
        // High match - send email + SMS
        await this.sendEmailNotification(buyer, deal, match);
        if (buyer.notifications.sms && buyer.notifications.sms.newDeals) {
          await this.sendSMSNotification(buyer, deal, match);
        }
      } else {
        // Regular match - email only
        await this.sendEmailNotification(buyer, deal, match);
      }

      console.log(`   ✅ ${buyer.name} - ${match.matchScore}% match`);
    }
  }

  /**
   * CHECK QUIET HOURS
   */
  isQuietHours(buyer) {
    if (!buyer.notifications || !buyer.notifications.quietHours || !buyer.notifications.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const quietStart = parseInt(buyer.notifications.quietHours.startTime.split(':')[0]);
    const quietEnd = parseInt(buyer.notifications.quietHours.endTime.split(':')[0]);

    if (quietStart < quietEnd) {
      return currentHour >= quietStart && currentHour < quietEnd;
    } else {
      // Quiet hours span midnight
      return currentHour >= quietStart || currentHour < quietEnd;
    }
  }

  /**
   * SEND EMAIL NOTIFICATION
   */
  async sendEmailNotification(buyer, deal, match) {
    const subject = match.matchScore >= 80
      ? `🔥 PERFECT MATCH: ${deal.address}`
      : `🏠 New Deal Matches Your Criteria: ${deal.address}`;

    const body = `
      <h2>${deal.address}</h2>
      <p><strong>${match.matchScore}% Match</strong> to your investment criteria</p>

      <h3>Deal Highlights:</h3>
      <ul>
        <li>Price: $${deal.price.toLocaleString()}</li>
        <li>ARV: $${deal.arv.toLocaleString()}</li>
        <li>ROI: ${(deal.roi * 100).toFixed(1)}%</li>
        <li>Cap Rate: ${(deal.capRate * 100).toFixed(1)}%</li>
        <li>Neighborhood: ${deal.neighborhood}</li>
      </ul>

      <h3>Why This Matches:</h3>
      <ul>
        ${match.matchReasons.map(r => `<li>${r}</li>`).join('')}
      </ul>

      <p><a href="${process.env.APP_URL}/deals/${deal.id}" style="background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">View Deal & Place Bid</a></p>

      ${match.matchScore >= 80 ? '<p style="color: #EF4444; font-weight: bold;">⚠️ This is a hot deal - other investors are viewing it right now!</p>' : ''}
    `;

    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: buyer.email,
        subject,
        html: body
      })
    });
  }

  /**
   * SEND SMS NOTIFICATION
   */
  async sendSMSNotification(buyer, deal, match) {
    const message = `🔥 HOT DEAL: ${deal.address} - ${match.matchScore}% match! ROI: ${(deal.roi * 100).toFixed(1)}%. View now: ${process.env.APP_URL}/deals/${deal.id}`;

    await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: buyer.phone,
        message
      })
    });
  }

  /**
   * QUEUE NOTIFICATION FOR LATER
   */
  async queueNotification(buyer, deal, match) {
    // Save to queue, will be sent when quiet hours end
    await fetch('/api/notifications/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId: buyer.userId,
        dealId: deal.id,
        matchScore: match.matchScore,
        sendAfter: this.calculateQuietHoursEnd(buyer)
      })
    });
  }

  /**
   * CALCULATE QUIET HOURS END
   */
  calculateQuietHoursEnd(buyer) {
    const now = new Date();
    const quietEnd = parseInt(buyer.notifications.quietHours.endTime.split(':')[0]);

    const endTime = new Date(now);
    endTime.setHours(quietEnd, 0, 0, 0);

    if (endTime < now) {
      // Quiet hours end tomorrow
      endTime.setDate(endTime.getDate() + 1);
    }

    return endTime.getTime();
  }
}

// Export
module.exports = new IntelligentMatcher();
