/**
 * ADMIN PROPERTY HOLD/SELF-PURCHASE SYSTEM
 *
 * Allows admin to:
 * 1. Hold properties before showing to buyers
 * 2. Purchase properties themselves (self-purchase)
 * 3. Set automated filters/rules for auto-hold
 * 4. Time-based release to buyers
 */

class AdminHoldSystem {
  constructor() {
    this.holdDurationHours = 48; // Default hold period
    this.autoHoldRules = this.loadAutoHoldRules();
  }

  /**
   * MANUAL HOLD - Admin manually holds a property
   */
  async holdProperty(propertyId, reason, holdUntilTimestamp = null) {
    const holdUntil = holdUntilTimestamp || this.calculateHoldExpiry();

    const update = {
      adminHoldStatus: 'HOLD',
      holdUntil: holdUntil,
      holdReason: reason,
      heldBy: 'admin',
      heldAt: Date.now()
    };

    // Update in database
    await this.updatePropertyStatus(propertyId, update);

    console.log(`✅ Property ${propertyId} held until ${new Date(holdUntil).toLocaleString()}`);
    console.log(`Reason: ${reason}`);

    return {
      success: true,
      holdUntil: new Date(holdUntil),
      message: 'Property successfully held'
    };
  }

  /**
   * SELF-PURCHASE - Admin marks property for personal purchase
   */
  async markSelfPurchase(propertyId, notes) {
    const update = {
      adminHoldStatus: 'SELF-PURCHASE',
      holdUntil: null, // No expiry for self-purchase
      holdReason: notes || 'Admin purchasing this property',
      heldBy: 'admin',
      heldAt: Date.now(),
      visibleToBuyers: false // Never show to buyers
    };

    await this.updatePropertyStatus(propertyId, update);

    console.log(`🏠 Property ${propertyId} marked for admin self-purchase`);

    // Move to separate "Admin Purchases" sheet
    await this.moveToAdminPurchases(propertyId);

    return {
      success: true,
      message: 'Property marked for self-purchase and removed from buyer pool'
    };
  }

  /**
   * RELEASE PROPERTY - Make available to buyers
   */
  async releaseProperty(propertyId, releaseNotes = '') {
    const update = {
      adminHoldStatus: 'RELEASED',
      holdUntil: null,
      releaseReason: releaseNotes,
      releasedAt: Date.now(),
      visibleToBuyers: true
    };

    await this.updatePropertyStatus(propertyId, update);

    console.log(`🚀 Property ${propertyId} released to buyers`);

    // Notify all matching buyers
    await this.notifyMatchingBuyers(propertyId);

    return {
      success: true,
      message: 'Property released to buyer pool'
    };
  }

  /**
   * AUTO-HOLD CHECK - Evaluate if property should be auto-held
   */
  async checkAutoHold(property) {
    const rules = this.autoHoldRules;
    let shouldHold = false;
    let reason = '';

    // Rule 1: Profit margin threshold
    if (rules.minProfitMargin && property.profitMargin >= rules.minProfitMargin) {
      shouldHold = true;
      reason = `High profit margin: ${(property.profitMargin * 100).toFixed(1)}% (threshold: ${(rules.minProfitMargin * 100).toFixed(1)}%)`;
    }

    // Rule 2: Property type filter
    if (rules.propertyTypes && rules.propertyTypes.includes(property.propertyType)) {
      shouldHold = true;
      reason = `Property type match: ${property.propertyType}`;
    }

    // Rule 3: Minimum units (multi-family)
    if (rules.minUnits && property.units >= rules.minUnits) {
      shouldHold = true;
      reason = `Multi-family: ${property.units} units (threshold: ${rules.minUnits})`;
    }

    // Rule 4: Postal code filter
    if (rules.postalCodes && rules.postalCodes.some(pc => property.postalCode.startsWith(pc))) {
      shouldHold = true;
      reason = `Postal code match: ${property.postalCode}`;
    }

    // Rule 5: Minimum ARV
    if (rules.minARV && property.arv >= rules.minARV) {
      shouldHold = true;
      reason = `High ARV: $${property.arv.toLocaleString()} (threshold: $${rules.minARV.toLocaleString()})`;
    }

    // Rule 6: Maximum offer (undervalued deals)
    if (rules.maxOfferRatio && (property.offer / property.arv) <= rules.maxOfferRatio) {
      shouldHold = true;
      reason = `Exceptional value: ${((property.offer / property.arv) * 100).toFixed(1)}% of ARV (max: ${(rules.maxOfferRatio * 100).toFixed(1)}%)`;
    }

    // Rule 7: Deal quality score
    if (rules.minDealQuality && property.dealQuality >= rules.minDealQuality) {
      shouldHold = true;
      reason = `High quality score: ${property.dealQuality}/100 (threshold: ${rules.minDealQuality})`;
    }

    if (shouldHold) {
      console.log(`🎯 AUTO-HOLD TRIGGERED: ${reason}`);
      await this.holdProperty(property.id, `AUTO-HOLD: ${reason}`);

      // Send notification to admin
      await this.notifyAdmin({
        type: 'auto-hold',
        property: property,
        reason: reason
      });
    }

    return { shouldHold, reason };
  }

  /**
   * SET AUTO-HOLD RULES
   */
  async setAutoHoldRules(rules) {
    // Validate rules
    const validRules = {
      minProfitMargin: rules.minProfitMargin || null,     // e.g., 0.20 (20%)
      propertyTypes: rules.propertyTypes || [],           // e.g., ['multi-family', 'apartment']
      minUnits: rules.minUnits || null,                   // e.g., 5
      postalCodes: rules.postalCodes || [],               // e.g., ['R3T', 'R3C']
      minARV: rules.minARV || null,                       // e.g., 500000
      maxOfferRatio: rules.maxOfferRatio || null,         // e.g., 0.65 (65% of ARV)
      minDealQuality: rules.minDealQuality || null,       // e.g., 85
      enabled: rules.enabled !== false                    // Default true
    };

    // Save to persistent storage
    await this.saveAutoHoldRules(validRules);

    this.autoHoldRules = validRules;

    console.log('✅ Auto-hold rules updated:');
    console.log(JSON.stringify(validRules, null, 2));

    return {
      success: true,
      rules: validRules
    };
  }

  /**
   * GET HELD PROPERTIES
   */
  async getHeldProperties() {
    // Fetch all properties with HOLD or SELF-PURCHASE status
    const allProperties = await this.fetchAllProperties();

    const held = allProperties.filter(p =>
      p.adminHoldStatus === 'HOLD' ||
      p.adminHoldStatus === 'SELF-PURCHASE'
    );

    // Check for expired holds and auto-release
    for (const property of held) {
      if (property.adminHoldStatus === 'HOLD' && property.holdUntil) {
        if (Date.now() > property.holdUntil) {
          console.log(`⏰ Auto-releasing expired hold: ${property.id}`);
          await this.releaseProperty(property.id, 'Hold period expired (auto-released)');
        }
      }
    }

    return held;
  }

  /**
   * EXTEND HOLD - Admin extends hold period
   */
  async extendHold(propertyId, additionalHours = 24) {
    const property = await this.getProperty(propertyId);

    if (property.adminHoldStatus !== 'HOLD') {
      return {
        success: false,
        error: 'Property is not currently on hold'
      };
    }

    const currentExpiry = property.holdUntil || Date.now();
    const newExpiry = currentExpiry + (additionalHours * 60 * 60 * 1000);

    await this.updatePropertyStatus(propertyId, {
      holdUntil: newExpiry,
      holdExtendedAt: Date.now(),
      holdExtendedBy: additionalHours
    });

    console.log(`⏰ Hold extended by ${additionalHours} hours until ${new Date(newExpiry).toLocaleString()}`);

    return {
      success: true,
      newExpiry: new Date(newExpiry)
    };
  }

  /**
   * CALCULATE HOLD EXPIRY
   */
  calculateHoldExpiry() {
    return Date.now() + (this.holdDurationHours * 60 * 60 * 1000);
  }

  /**
   * UPDATE PROPERTY STATUS (Database)
   */
  async updatePropertyStatus(propertyId, updates) {
    // In production: Update Google Sheets row
    // For now: Update local cache/memory

    try {
      const response = await fetch('/api/admin/update-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          updates
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update property status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  /**
   * FETCH ALL PROPERTIES
   */
  async fetchAllProperties() {
    try {
      const response = await fetch('/api/admin/properties');
      return await response.json();
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  /**
   * GET SINGLE PROPERTY
   */
  async getProperty(propertyId) {
    try {
      const response = await fetch(`/api/admin/property/${propertyId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  /**
   * MOVE TO ADMIN PURCHASES SHEET
   */
  async moveToAdminPurchases(propertyId) {
    // Move property to separate "Admin Purchases" tracking sheet
    try {
      await fetch('/api/admin/move-to-purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      });

      console.log(`📊 Property moved to Admin Purchases tracking`);
    } catch (error) {
      console.error('Error moving to purchases:', error);
    }
  }

  /**
   * NOTIFY MATCHING BUYERS
   */
  async notifyMatchingBuyers(propertyId) {
    // Find buyers who match this property criteria
    // Send email/SMS notification that new deal is available

    try {
      await fetch('/api/buyers/notify-new-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      });

      console.log(`📧 Matching buyers notified about property ${propertyId}`);
    } catch (error) {
      console.error('Error notifying buyers:', error);
    }
  }

  /**
   * NOTIFY ADMIN
   */
  async notifyAdmin(notification) {
    // Send SMS/Email to admin about auto-hold trigger
    try {
      await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });

      console.log(`📱 Admin notified: ${notification.type}`);
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  }

  /**
   * SAVE AUTO-HOLD RULES
   */
  async saveAutoHoldRules(rules) {
    // Save to localStorage or database
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('autoHoldRules', JSON.stringify(rules));
    }

    // Also save to server
    try {
      await fetch('/api/admin/save-hold-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules })
      });
    } catch (error) {
      console.error('Error saving hold rules:', error);
    }
  }

  /**
   * LOAD AUTO-HOLD RULES
   */
  loadAutoHoldRules() {
    // Load from localStorage
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('autoHoldRules');
      if (saved) {
        return JSON.parse(saved);
      }
    }

    // Default rules (conservative - admin reviews most deals)
    return {
      minProfitMargin: 0.15,        // 15%+ margin
      propertyTypes: ['multi-family', 'apartment'],
      minUnits: 5,
      postalCodes: [],
      minARV: null,
      maxOfferRatio: 0.70,          // Offers at 70% ARV or less
      minDealQuality: 75,
      enabled: true
    };
  }

  /**
   * GET STATISTICS
   */
  async getStatistics() {
    const allProperties = await this.fetchAllProperties();

    const stats = {
      totalHeld: allProperties.filter(p => p.adminHoldStatus === 'HOLD').length,
      totalSelfPurchase: allProperties.filter(p => p.adminHoldStatus === 'SELF-PURCHASE').length,
      totalReleased: allProperties.filter(p => p.adminHoldStatus === 'RELEASED').length,
      expiringToday: allProperties.filter(p => {
        if (p.adminHoldStatus !== 'HOLD' || !p.holdUntil) return false;
        const expiry = new Date(p.holdUntil);
        const today = new Date();
        return expiry.toDateString() === today.toDateString();
      }).length
    };

    return stats;
  }
}

// Singleton instance
const adminHoldSystem = new AdminHoldSystem();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = adminHoldSystem;
}
