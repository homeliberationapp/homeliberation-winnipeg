// ═══════════════════════════════════════════════════════════
// BUYER MARKETPLACE
// Buyers bid on assignments = you maximize assignment fees
// ═══════════════════════════════════════════════════════════

const { sendEmail } = require('../integrations/sendgrid');
const { sendSMS } = require('../integrations/twilio');
const { saveToSheets, updateRow, getRows } = require('../integrations/google_sheets');

class BuyerMarketplace {
  constructor(config) {
    this.config = config;
  }

  // ───────────────────────────────────────────────────────────
  // PUBLISH DEAL (After Seller Signs Assignment)
  // ───────────────────────────────────────────────────────────
  async publishDeal(deal) {
    console.log(`\n📢 Publishing deal: ${deal.address}`);

    try {
      // STEP 1: Save to "Active Deals" sheet
      await saveToSheets('Active Deals', {
        ...deal,
        status: 'active',
        publishedAt: new Date().toISOString(),
        bidCount: 0,
        highestBid: deal.assignmentFee // Starting point
      });

      // STEP 2: Find matching buyers
      const matchingBuyers = await this.findMatchingBuyers(deal);
      console.log(`   Found ${matchingBuyers.length} matching buyers`);

      // STEP 3: Alert premium members FIRST (48h exclusive)
      const premiumBuyers = matchingBuyers.filter(b => b.tier === 'pro' || b.tier === 'investor');
      if (premiumBuyers.length > 0) {
        await this.alertBuyers(premiumBuyers, deal, true);
      }

      // STEP 4: Schedule alert to free tier after 48 hours
      setTimeout(async () => {
        const freeBuyers = matchingBuyers.filter(b => b.tier === 'beta');
        await this.alertBuyers(freeBuyers, deal, false);
      }, 48 * 60 * 60 * 1000);

      console.log('✅ Deal published successfully');

      return { success: true, buyersAlerted: matchingBuyers.length };

    } catch (error) {
      console.error('❌ Error publishing deal:', error);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────
  // FIND MATCHING BUYERS (Based on Preferences)
  // ───────────────────────────────────────────────────────────
  async findMatchingBuyers(deal) {
    const allBuyers = await getRows('Buyer Database');

    return allBuyers.filter(buyer => {
      // Check if buyer's criteria match this deal
      const typeMatch = !buyer.preferredTypes || buyer.preferredTypes.includes(deal.propertyType);
      const zipMatch = !buyer.preferredZips || buyer.preferredZips.includes(deal.postalCode);
      const budgetMatch = !buyer.maxBudget || (deal.offer + deal.assignmentFee) <= buyer.maxBudget;

      return typeMatch && zipMatch && budgetMatch && buyer.status === 'active';
    });
  }

  // ───────────────────────────────────────────────────────────
  // ALERT BUYERS (Email + SMS Push Notification)
  // ───────────────────────────────────────────────────────────
  async alertBuyers(buyers, deal, isExclusive) {
    const exclusiveNotice = isExclusive
      ? '🌟 EXCLUSIVE: Premium members only for 48 hours'
      : '';

    for (const buyer of buyers) {
      // SEND EMAIL
      const emailHTML = this.generateDealAlertEmail(deal, buyer, exclusiveNotice);

      await sendEmail({
        to: buyer.email,
        subject: `New Wholesale Deal Alert - ${deal.address}`,
        html: emailHTML
      });

      // SEND SMS
      const smsText = this.config.copy.sms.buyerAlert
        .replace('{ADDRESS}', deal.address)
        .replace('{BEDS}', deal.bedrooms || '?')
        .replace('{BATHS}', deal.bathrooms || '?')
        .replace('{ARV}', deal.arv.toLocaleString())
        .replace('{FEE}', deal.assignmentFee.toLocaleString())
        .replace('{LINK}', `https://velocityrealestate.ca/deals/${deal.id}`);

      await sendSMS(buyer.phone, smsText);
    }

    console.log(`   ✅ Alerted ${buyers.length} buyers`);
  }

  // ───────────────────────────────────────────────────────────
  // GENERATE DEAL ALERT EMAIL
  // ───────────────────────────────────────────────────────────
  generateDealAlertEmail(deal, buyer, exclusiveNotice) {
    const profit = deal.arv - deal.offer - deal.assignmentFee - deal.repairs;

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .header { background: #0F172A; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 30px; max-width: 600px; margin: 0 auto; }
    .deal-box { background: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; }
    .stat { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
    .profit { background: #10B981; color: #fff; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px; margin: 20px 0; }
    .cta { background: #F59E0B; color: #000; padding: 15px 30px; text-align: center; font-size: 18px; text-decoration: none; display: inline-block; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .exclusive { background: #F59E0B; color: #000; padding: 10px; text-align: center; font-weight: bold; border-radius: 4px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔥 New Deal Alert</h1>
  </div>

  <div class="content">
    ${exclusiveNotice ? `<div class="exclusive">${exclusiveNotice}</div>` : ''}

    <h2>${deal.address}</h2>

    <div class="deal-box">
      <div class="stat">
        <span><strong>Property Type:</strong></span>
        <span>${deal.propertyType}</span>
      </div>
      <div class="stat">
        <span><strong>Bedrooms / Bathrooms:</strong></span>
        <span>${deal.bedrooms || '?'} / ${deal.bathrooms || '?'}</span>
      </div>
      <div class="stat">
        <span><strong>Square Feet:</strong></span>
        <span>${deal.sqft?.toLocaleString() || 'N/A'}</span>
      </div>
      <div class="stat">
        <span><strong>After-Repair Value (ARV):</strong></span>
        <span style="font-weight: bold;">$${deal.arv.toLocaleString()}</span>
      </div>
      <div class="stat">
        <span><strong>Estimated Repairs:</strong></span>
        <span>$${deal.repairs.toLocaleString()}</span>
      </div>
      <div class="stat">
        <span><strong>Purchase Price:</strong></span>
        <span>$${deal.offer.toLocaleString()}</span>
      </div>
      <div class="stat">
        <span><strong>Assignment Fee:</strong></span>
        <span style="color: #F59E0B; font-weight: bold;">$${deal.assignmentFee.toLocaleString()}</span>
      </div>
    </div>

    <div class="profit">
      Estimated Profit: $${Math.round(profit).toLocaleString()}
    </div>

    <h3>What You Get:</h3>
    <ul>
      <li>✅ Signed assignment contract with seller</li>
      <li>✅ Full property data pack (comps, photos, reports)</li>
      <li>✅ Due diligence period (10 days)</li>
      <li>✅ Earnest deposit refundable if deal doesn't work</li>
    </ul>

    <p><strong>Comparables Used:</strong></p>
    <ul>
      ${(deal.comparables || []).map(comp => `
        <li>${comp.address} - Sold $${comp.soldPrice.toLocaleString()} on ${comp.soldDate}</li>
      `).join('')}
    </ul>

    <div style="text-align: center;">
      <a href="https://velocityrealestate.ca/deals/${deal.id}" class="cta">
        View Full Data Pack & Submit Bid →
      </a>
    </div>

    ${deal.bidCount > 0 ? `
      <p style="text-align: center; color: #EF4444; font-weight: bold;">
        ⚠️ ${deal.bidCount} investors already viewing this deal
      </p>
    ` : ''}

    <p style="font-size: 14px; color: #666;">
      Questions? Reply to this email or call ${this.config.brand.phone}.
    </p>
  </div>
</body>
</html>
    `;
  }

  // ───────────────────────────────────────────────────────────
  // RECEIVE BID (Buyer submits offer for assignment)
  // ───────────────────────────────────────────────────────────
  async receiveBid(dealId, buyerId, bidAmount) {
    console.log(`💰 New bid on ${dealId}: $${bidAmount} from buyer ${buyerId}`);

    try {
      // STEP 1: Save bid
      await saveToSheets('Bids', {
        dealId,
        buyerId,
        bidAmount,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });

      // STEP 2: Update deal bid count & highest bid
      const deal = await this.getDeal(dealId);
      const newBidCount = (deal.bidCount || 0) + 1;
      const newHighestBid = Math.max(deal.highestBid || 0, bidAmount);

      await updateRow('Active Deals', 'id', dealId, {
        bidCount: newBidCount,
        highestBid: newHighestBid
      });

      // STEP 3: FOMO Trigger (if 2+ bids, alert other bidders)
      if (newBidCount >= this.config.triggers.fomoBidThreshold) {
        await this.triggerFOMO(deal, bidAmount);
      }

      console.log('✅ Bid recorded');

      return { success: true, bidCount: newBidCount, highestBid: newHighestBid };

    } catch (error) {
      console.error('❌ Bid error:', error);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────
  // FOMO TRIGGER (Show Competition to Drive Bids Higher)
  // ───────────────────────────────────────────────────────────
  async triggerFOMO(deal, latestBid) {
    console.log('   🔥 Triggering FOMO (multiple bids)');

    const buyers = await this.findMatchingBuyers(deal);

    for (const buyer of buyers) {
      await sendEmail({
        to: buyer.email,
        subject: `⚠️ Multiple bids on ${deal.address}`,
        html: `
          <p>Hi ${buyer.name},</p>
          <p><strong>${deal.bidCount} investors are bidding on ${deal.address}</strong></p>
          <p>Current highest bid: <strong>$${deal.highestBid.toLocaleString()}</strong></p>
          <p>If you're interested, submit your best offer now:</p>
          <a href="https://velocityrealestate.ca/deals/${deal.id}">Submit Bid →</a>
        `
      });
    }
  }

  // ───────────────────────────────────────────────────────────
  // ACCEPT BID (You choose winning buyer)
  // ───────────────────────────────────────────────────────────
  async acceptBid(dealId, buyerId, finalFee) {
    console.log(`✅ Accepting bid from ${buyerId} for $${finalFee}`);

    try {
      // STEP 1: Update deal status
      await updateRow('Active Deals', 'id', dealId, {
        status: 'assigned',
        winningBuyer: buyerId,
        finalAssignmentFee: finalFee,
        assignedAt: new Date().toISOString()
      });

      // STEP 2: Send DocuSign to buyer
      // TODO: Implement DocuSign integration

      // STEP 3: Alert losing bidders (shadow bid system)
      const allBids = await getRows('Bids', { dealId });
      const losingBidders = allBids.filter(b => b.buyerId !== buyerId);

      for (const bid of losingBidders) {
        setTimeout(async () => {
          await this.sendShadowBidNotification(dealId, bid);
        }, this.config.triggers.shadowBidDelayHours * 60 * 60 * 1000);
      }

      console.log('✅ Bid accepted, DocuSign sent');

      return { success: true };

    } catch (error) {
      console.error('❌ Accept bid error:', error);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────
  // SHADOW BID NOTIFICATION (Runner-Up Gets Second Chance)
  // ───────────────────────────────────────────────────────────
  async sendShadowBidNotification(dealId, bid) {
    const deal = await this.getDeal(dealId);

    await sendEmail({
      to: bid.buyerEmail,
      subject: `Backup Position - ${deal.address}`,
      html: `
        <p>Hi,</p>
        <p>The assignment for <strong>${deal.address}</strong> was awarded to another investor.</p>
        <p>However, <strong>you are in backup position</strong>.</p>
        <p>If the primary buyer defaults within the next 48 hours, the deal is yours at your bid of $${bid.bidAmount.toLocaleString()}.</p>
        <p>As a thank-you for participating, we're giving you a <strong>$${this.config.fees.shadowBidCredit} credit</strong> toward your next deal.</p>
      `
    });
  }

  // ───────────────────────────────────────────────────────────
  // HELPER: Get Deal Data
  // ───────────────────────────────────────────────────────────
  async getDeal(dealId) {
    const deals = await getRows('Active Deals', { id: dealId });
    return deals[0] || null;
  }
}

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

module.exports = BuyerMarketplace;
