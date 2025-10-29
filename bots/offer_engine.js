// ═══════════════════════════════════════════════════════════
// AUTOMATED OFFER ENGINE
// Generates cash offers based on ARV, sends professional offer letters
// ═══════════════════════════════════════════════════════════

const PropertyDataBot = require('./property_data_bot');
const { sendEmail } = require('../integrations/sendgrid');
const { sendSMS } = require('../integrations/twilio');
const { saveToSheets } = require('../integrations/google_sheets');

class OfferEngine {
  constructor(config) {
    this.config = config;
    this.dataBot = new PropertyDataBot(config);
  }

  // ───────────────────────────────────────────────────────────
  // MAIN: Process Seller Lead → Generate Offer → Send
  // ───────────────────────────────────────────────────────────
  async processLead(leadData) {
    console.log(`\n🚀 Processing lead for: ${leadData.address}`);

    try {
      // STEP 1: Fetch all property data
      const propertyData = await this.dataBot.getPropertyData(leadData.address);

      // STEP 2: Calculate lead score
      const leadScore = this.config.calculateScore(leadData);
      console.log(`📊 Lead Score: ${leadScore}/100`);

      // STEP 3: Estimate repairs based on condition
      const repairs = this.estimateRepairs(leadData.condition, propertyData.sqft);

      // STEP 4: Calculate offer
      const offerCalc = this.config.calculateOffer(
        propertyData.arv,
        repairs,
        this.config.fees.defaultAssignmentFee
      );

      // STEP 5: Build complete lead object
      const completeLead = {
        ...leadData,
        ...propertyData,
        leadScore,
        repairs,
        ...offerCalc,
        status: 'offer_generated',
        timestamp: new Date().toISOString()
      };

      // STEP 6: Save to Google Sheets (your command center)
      await saveToSheets('Seller Leads', completeLead);

      // STEP 7: Send offer (immediate for high-score, delayed for low-score)
      if (leadScore >= this.config.scoring.highScoreThreshold) {
        console.log('🔥 HIGH SCORE LEAD - Sending immediate offer');
        await this.sendImmediateOffer(completeLead);
      } else {
        console.log('⏰ Medium/Low score - Scheduling delayed offer');
        await this.scheduleDelayedOffer(completeLead);
      }

      console.log('✅ Lead processed successfully');

      return completeLead;

    } catch (error) {
      console.error('❌ Error processing lead:', error);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────
  // REPAIR COST ESTIMATION
  // ───────────────────────────────────────────────────────────
  estimateRepairs(condition, sqft) {
    const estimates = this.config.offerCalculation.repairEstimates;

    let baseRepair = 0;

    if (condition.includes('Excellent')) baseRepair = estimates.excellent;
    else if (condition.includes('Good')) baseRepair = estimates.good;
    else if (condition.includes('Fair')) baseRepair = estimates.fair;
    else if (condition.includes('Poor')) baseRepair = estimates.poor;
    else if (condition.includes('gut')) baseRepair = estimates.teardown;

    // Adjust for size
    const sizeFactor = sqft / 1800; // 1800 sqft is baseline
    const adjustedRepair = baseRepair * sizeFactor;

    console.log(`🔧 Estimated repairs: $${Math.round(adjustedRepair).toLocaleString()}`);

    return Math.round(adjustedRepair / 100) * 100; // Round to nearest $100
  }

  // ───────────────────────────────────────────────────────────
  // SEND IMMEDIATE OFFER (High-Score Leads)
  // ───────────────────────────────────────────────────────────
  async sendImmediateOffer(lead) {
    // SEND SMS FIRST (instant notification)
    const smsText = this.config.copy.sms.highScore
      .replace('{ADDRESS}', lead.address);

    await sendSMS(lead.phone, smsText);

    // SEND EMAIL WITH FULL OFFER LETTER (2 hours later)
    setTimeout(async () => {
      await this.sendOfferEmail(lead);
    }, 2 * 60 * 60 * 1000); // 2 hours

    // UPDATE SHEETS
    await saveToSheets('Seller Leads', { ...lead, status: 'offer_sent' });
  }

  // ───────────────────────────────────────────────────────────
  // SEND DELAYED OFFER (Medium/Low Score)
  // ───────────────────────────────────────────────────────────
  async scheduleDelayedOffer(lead) {
    // Send offer in 24 hours (manual review first)
    setTimeout(async () => {
      await this.sendOfferEmail(lead);
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  // ───────────────────────────────────────────────────────────
  // GENERATE & SEND PROFESSIONAL OFFER EMAIL
  // ───────────────────────────────────────────────────────────
  async sendOfferEmail(lead) {
    const offerHTML = this.generateOfferHTML(lead);

    const emailData = {
      to: lead.email,
      subject: `Your Property Report & Cash Offer - ${lead.address}`,
      html: offerHTML,
      attachments: [
        {
          filename: 'Property_Report.pdf',
          content: await this.generateOfferPDF(lead) // Generated PDF report
        }
      ]
    };

    await sendEmail(emailData);

    // Log SMS too
    const smsText = this.config.copy.sms.offerReady
      .replace('{ADDRESS}', lead.address)
      .replace('{OFFER}', lead.offer.toLocaleString())
      .replace('{PHONE}', this.config.brand.phone);

    await sendSMS(lead.phone, smsText);

    // Update status
    await saveToSheets('Seller Leads', { ...lead, status: 'offer_sent', offerSentAt: new Date().toISOString() });
  }

  // ───────────────────────────────────────────────────────────
  // GENERATE PROFESSIONAL OFFER LETTER HTML
  // ───────────────────────────────────────────────────────────
  generateOfferHTML(lead) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .header { background: #0F172A; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 30px; max-width: 600px; margin: 0 auto; }
    .offer-box { background: #F59E0B; color: #000; padding: 30px; text-align: center; font-size: 32px; font-weight: bold; border-radius: 8px; margin: 30px 0; }
    .breakdown { background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .breakdown-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
    .breakdown-row.total { font-weight: bold; font-size: 18px; border-top: 2px solid #0F172A; border-bottom: none; }
    .comps { margin: 20px 0; }
    .comp-item { background: #fff; padding: 15px; margin: 10px 0; border-left: 4px solid #10B981; }
    .cta { background: #10B981; color: #fff; padding: 15px 30px; text-align: center; font-size: 18px; text-decoration: none; display: inline-block; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${this.config.brand.name}</h1>
    <p>${this.config.brand.tagline.seller}</p>
  </div>

  <div class="content">
    <h2>Your Property Report</h2>
    <p>Hi ${lead.name || 'there'},</p>

    <p>Thank you for reaching out about <strong>${lead.address}</strong>.</p>

    <p>I've personally reviewed your property and prepared a comprehensive market analysis. Here's what we found:</p>

    <div class="offer-box">
      Cash Offer: $${lead.offer.toLocaleString()}
    </div>

    <p style="text-align: center; color: #666;">This offer is valid for 48 hours</p>

    <h3>How We Calculated This Offer</h3>

    <div class="breakdown">
      <div class="breakdown-row">
        <span>After-Repair Value (ARV)</span>
        <span>$${lead.arv.toLocaleString()}</span>
      </div>
      <div class="breakdown-row">
        <span>Estimated Repairs</span>
        <span>-$${lead.repairs.toLocaleString()}</span>
      </div>
      <div class="breakdown-row">
        <span>Holding Costs (3 months)</span>
        <span>-$${lead.holding.toLocaleString()}</span>
      </div>
      <div class="breakdown-row">
        <span>Assignment Fee</span>
        <span>-$${lead.assignmentFee.toLocaleString()}</span>
      </div>
      <div class="breakdown-row">
        <span>Buyer Profit Margin</span>
        <span>-$${Math.round(lead.buyerProfit).toLocaleString()}</span>
      </div>
      <div class="breakdown-row total">
        <span>Your Cash Offer</span>
        <span>$${lead.offer.toLocaleString()}</span>
      </div>
    </div>

    <h3>Recent Sales in Your Area</h3>
    <p>We based our ARV on these 3 comparable properties:</p>

    <div class="comps">
      ${(lead.comparables || []).map(comp => `
        <div class="comp-item">
          <strong>${comp.address}</strong><br>
          Sold: $${comp.soldPrice.toLocaleString()} on ${comp.soldDate}<br>
          ${comp.bedrooms} bed / ${comp.bathrooms} bath • ${comp.sqft} sqft<br>
          Distance: ${comp.distance} miles
        </div>
      `).join('')}
    </div>

    <h3>What Happens Next?</h3>
    <ol>
      <li><strong>Accept our offer</strong> (click button below)</li>
      <li><strong>We sign the agreement</strong> (sent via DocuSign - takes 5 minutes)</li>
      <li><strong>You choose closing date</strong> (7-30 days, your choice)</li>
      <li><strong>We handle everything</strong> (tenants, repairs, legal, etc.)</li>
      <li><strong>You get your cash</strong> (bank wire on closing day)</li>
    </ol>

    <div style="text-align: center;">
      <a href="https://velocityrealestate.ca/accept?id=${lead.id}" class="cta">
        Accept This Offer →
      </a>
    </div>

    <p><strong>Questions?</strong> Reply to this email or call me directly at ${this.config.brand.phone}.</p>

    <p>Best regards,<br>
    <strong>${this.config.brand.name} Team</strong></p>
  </div>

  <div class="footer">
    <p>${this.config.legal.disclaimers.seller}</p>
    <p>${this.config.brand.name} • ${this.config.brand.email} • ${this.config.brand.phone}</p>
  </div>
</body>
</html>
    `;
  }

  // ───────────────────────────────────────────────────────────
  // GENERATE PDF REPORT (Future: Use PDFKit)
  // ───────────────────────────────────────────────────────────
  async generateOfferPDF(lead) {
    // TODO: Implement PDF generation with PDFKit
    // For now, return null (email will be HTML only)
    return null;
  }

  // ───────────────────────────────────────────────────────────
  // FOLLOW-UP AUTOMATION (Second Chance Email)
  // ───────────────────────────────────────────────────────────
  async sendSecondChance(lead) {
    const delayHours = this.config.triggers.secondChanceDelayHours;

    setTimeout(async () => {
      const emailBody = this.config.copy.emails.secondChance.body
        .replace('{NAME}', lead.name || 'there')
        .replace('{ADDRESS}', lead.address)
        .replace('{OFFER}', lead.offer.toLocaleString());

      await sendEmail({
        to: lead.email,
        subject: this.config.copy.emails.secondChance.subject.replace('{ADDRESS}', lead.address),
        text: emailBody
      });

      const smsText = this.config.copy.sms.secondChance
        .replace('{ADDRESS}', lead.address)
        .replace('{OFFER}', lead.offer.toLocaleString())
        .replace('{EXPIRY}', this.getExpiryDate(48));

      await sendSMS(lead.phone, smsText);

      await saveToSheets('Seller Leads', { ...lead, status: 'second_chance_sent' });

    }, delayHours * 60 * 60 * 1000);
  }

  // ───────────────────────────────────────────────────────────
  // HELPER: Get Expiry Date
  // ───────────────────────────────────────────────────────────
  getExpiryDate(hours) {
    const expiry = new Date(Date.now() + hours * 60 * 60 * 1000);
    return expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

module.exports = OfferEngine;

// ═══════════════════════════════════════════════════════════
// USAGE EXAMPLE
// ═══════════════════════════════════════════════════════════

if (require.main === module) {
  const CONFIG = require('../config');
  const engine = new OfferEngine(CONFIG);

  const testLead = {
    address: '123 Main St, Winnipeg, MB',
    phone: '204-555-1234',
    email: 'seller@example.com',
    name: 'John Doe',
    propertyType: 'Single Family',
    condition: 'Fair (needs work)',
    urgency: '<30 days',
    units: '1-4'
  };

  (async () => {
    const result = await engine.processLead(testLead);
    console.log('\n✅ OFFER GENERATED:');
    console.log(`   Offer: $${result.offer.toLocaleString()}`);
    console.log(`   ARV: $${result.arv.toLocaleString()}`);
    console.log(`   Lead Score: ${result.leadScore}/100`);
  })();
}
