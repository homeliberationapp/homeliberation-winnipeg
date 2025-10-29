/**
 * FRAUD PREVENTION & VERIFICATION SYSTEM
 * Protects against fake sellers, scammers, and bad buyers
 */

const { getCityConfig } = require('../config/cities');

class FraudPrevention {
  constructor() {
    this.blacklist = new Set(); // Blocked emails/phones/addresses
    this.suspiciousPatterns = this.loadPatterns();
  }

  loadPatterns() {
    return {
      email: [
        /temp(orary)?mail/i,
        /10min(ute)?mail/i,
        /guerrilla(mail)?/i,
        /mailinator/i,
        /throwaway/i
      ],
      phone: [
        /^1234567/,
        /^5555555/,
        /^0000000/
      ],
      name: [
        /test/i,
        /fake/i,
        /asdf/i,
        /qwerty/i
      ]
    };
  }

  /**
   * SELLER VERIFICATION (Score 0-100)
   */
  async verifySellerLead(leadData) {
    const checks = {
      emailValid: this.verifyEmail(leadData.email),
      phoneValid: this.verifyPhone(leadData.phone),
      nameValid: this.verifyName(leadData.name),
      addressValid: await this.verifyAddress(leadData.address),
      ownershipConfirmed: await this.verifyOwnership(leadData),
      notBlacklisted: !this.isBlacklisted(leadData)
    };

    const score = Object.values(checks).filter(Boolean).length * 16.67;
    const flags = Object.keys(checks).filter(key => !checks[key]);

    return {
      verified: score >= 80,
      score: Math.round(score),
      flags,
      checks,
      riskLevel: score >= 80 ? 'low' : score >= 50 ? 'medium' : 'high'
    };
  }

  verifyEmail(email) {
    if (!email || !email.includes('@')) return false;

    // Check against disposable email patterns
    for (const pattern of this.suspiciousPatterns.email) {
      if (pattern.test(email)) return false;
    }

    // Check domain has MX records (would need DNS lookup in production)
    return true;
  }

  verifyPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');

    // Must be 10 digits (North America)
    if (cleaned.length !== 10) return false;

    // Check against fake patterns
    for (const pattern of this.suspiciousPatterns.phone) {
      if (pattern.test(cleaned)) return false;
    }

    return true;
  }

  verifyName(name) {
    if (!name || name.length < 2) return false;

    for (const pattern of this.suspiciousPatterns.name) {
      if (pattern.test(name)) return false;
    }

    return true;
  }

  async verifyAddress(address) {
    // Basic validation
    if (!address || address.length < 10) return false;

    // Check address exists via geocoding (would use Google Maps API in production)
    // For now, basic street pattern check
    const hasNumber = /\d+/.test(address);
    const hasStreet = /(st|street|ave|avenue|rd|road|blvd|boulevard|way|drive|dr)/i.test(address);

    return hasNumber && hasStreet;
  }

  async verifyOwnership(leadData) {
    // In production: Check public property records
    // Compare seller name against registered owner
    // For now, assume verified if address is valid
    return await this.verifyAddress(leadData.address);
  }

  isBlacklisted(leadData) {
    return this.blacklist.has(leadData.email) ||
           this.blacklist.has(leadData.phone) ||
           this.blacklist.has(leadData.address);
  }

  addToBlacklist(identifier) {
    this.blacklist.add(identifier);
  }

  /**
   * BUYER VERIFICATION (KYC - Know Your Customer)
   */
  async verifyBuyer(buyerData) {
    const checks = {
      identityVerified: await this.verifyIdentity(buyerData),
      fundsVerified: await this.verifyFunds(buyerData),
      experienceConfirmed: this.verifyExperience(buyerData),
      referencesChecked: await this.checkReferences(buyerData),
      notBlacklisted: !this.isBlacklisted(buyerData)
    };

    const score = Object.values(checks).filter(Boolean).length * 20;

    return {
      verified: score >= 80,
      score,
      checks,
      approvalStatus: score >= 80 ? 'approved' : score >= 60 ? 'conditional' : 'denied'
    };
  }

  async verifyIdentity(buyerData) {
    // In production: Use Stripe Identity or similar
    // Check government ID, selfie verification
    // For now, check if name and email are valid
    return this.verifyName(buyerData.name) && this.verifyEmail(buyerData.email);
  }

  async verifyFunds(buyerData) {
    // In production: Request proof of funds
    // - Bank statement
    // - Pre-approval letter
    // - Line of credit confirmation

    // For now, check if they've paid subscription (shows seriousness)
    return buyerData.subscriptionStatus === 'active' || buyerData.tier !== 'beta';
  }

  verifyExperience(buyerData) {
    // Check if buyer has stated experience level
    // Experienced investors = lower risk
    return buyerData.dealsCompleted !== undefined && buyerData.dealsCompleted >= 0;
  }

  async checkReferences(buyerData) {
    // In production: Call provided references
    // Verify past deals, partnerships, etc.

    // For now, check if references were provided
    return buyerData.references && buyerData.references.length >= 1;
  }

  /**
   * DEAL VERIFICATION (Before Assignment)
   */
  async verifyDealBeforeAssignment(deal, buyer) {
    const checks = {
      sellerOwnsProperty: await this.confirmOwnership(deal.address, deal.sellerName),
      noLiens: await this.checkLiens(deal.address),
      zoneVerified: await this.verifyZoning(deal.address, deal.propertyType),
      buyerHasFunds: await this.verifyFunds(buyer),
      titleClear: await this.runTitleSearch(deal.address)
    };

    const allPassed = Object.values(checks).every(Boolean);

    return {
      cleared: allPassed,
      checks,
      issues: Object.keys(checks).filter(key => !checks[key])
    };
  }

  async confirmOwnership(address, sellerName) {
    // In production: Query land registry / assessment office
    // Confirm seller name matches registered owner
    console.log(`🔍 Verifying ownership: ${sellerName} owns ${address}`);
    return true; // Assume verified
  }

  async checkLiens(address) {
    // In production: Check for:
    // - Tax liens
    // - Mortgage liens
    // - Mechanic's liens
    // - Judgment liens
    console.log(`🔍 Checking liens on ${address}`);
    return true; // Assume no liens
  }

  async verifyZoning(address, propertyType) {
    // In production: Check municipal zoning records
    // Ensure property type matches zoning (residential, commercial, etc.)
    console.log(`🔍 Verifying zoning for ${address}`);
    return true; // Assume correct
  }

  async runTitleSearch(address) {
    // In production: Use title company API or lawyer
    // Get title insurance estimate
    console.log(`🔍 Running title search for ${address}`);
    return true; // Assume clear title
  }

  /**
   * TRANSACTION MONITORING
   */
  detectFraudulentBehavior(userActivity) {
    const flags = [];

    // Multiple submissions in short time
    if (userActivity.submissionsLast24h > 5) {
      flags.push('excessive_submissions');
    }

    // Always bidding but never closing
    if (userActivity.bidsPlaced > 10 && userActivity.dealsClosed === 0) {
      flags.push('non_serious_bidder');
    }

    // Requesting data without engagement
    if (userActivity.propertiesViewed > 50 && userActivity.bidsPlaced === 0) {
      flags.push('data_scraper');
    }

    // Suspicious bid patterns (always outbidding by exactly $1)
    if (userActivity.lastBidPattern === 'sniper') {
      flags.push('suspicious_bidding');
    }

    return {
      isSuspicious: flags.length > 0,
      flags,
      action: flags.length >= 2 ? 'block' : flags.length === 1 ? 'review' : 'allow'
    };
  }

  /**
   * AUTOMATED RESPONSES
   */
  async handleFraudulentLead(leadData, verificationResult) {
    console.log(`⚠️ Fraudulent lead detected: ${leadData.email}`);
    console.log(`Flags: ${verificationResult.flags.join(', ')}`);

    // Add to blacklist
    this.addToBlacklist(leadData.email);
    this.addToBlacklist(leadData.phone);

    // Log for review
    await this.logFraudAttempt(leadData, verificationResult);

    // Do NOT send offer or follow-up
    return {
      action: 'rejected',
      reason: 'Failed verification',
      message: 'Thank you for your inquiry. We are unable to process your request at this time.'
    };
  }

  async logFraudAttempt(leadData, verificationResult) {
    const log = {
      timestamp: new Date().toISOString(),
      email: leadData.email,
      phone: leadData.phone,
      address: leadData.address,
      score: verificationResult.score,
      flags: verificationResult.flags,
      ip: leadData.ipAddress || 'unknown'
    };

    console.log('📝 Fraud attempt logged:', log);
    // In production: Save to Google Sheets "Fraud Log" tab
  }
}

module.exports = FraudPrevention;
