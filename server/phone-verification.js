/**
 * PHONE VERIFICATION SYSTEM
 * SMS verification using Twilio
 *
 * Features:
 * - Send verification codes via SMS
 * - Verify codes
 * - Rate limiting (prevent spam)
 * - Code expiration (10 minutes)
 * - Resend functionality
 * - Phone number formatting/validation
 */

const twilio = require('twilio');

class PhoneVerificationSystem {

  constructor() {
    // Initialize Twilio client
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // Store verification codes (in production, use database)
    this.verificationCodes = new Map();

    // Rate limiting
    this.rateLimits = new Map();
    this.MAX_ATTEMPTS_PER_HOUR = 3;
  }

  /**
   * SEND VERIFICATION CODE
   * Generates 6-digit code and sends via SMS
   */
  async sendVerificationCode(phoneNumber, userId) {
    console.log(`📱 Sending verification code to: ${phoneNumber}`);

    // Format phone number
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    if (!this.isValidPhoneNumber(formattedPhone)) {
      throw new Error('Invalid phone number format');
    }

    // Check rate limiting
    if (this.isRateLimited(userId)) {
      const remainingTime = this.getRateLimitRemainingTime(userId);
      throw new Error(`Too many attempts. Try again in ${remainingTime} minutes.`);
    }

    // Generate 6-digit code
    const code = this.generateCode();
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

    // Store code
    this.verificationCodes.set(userId, {
      code,
      phoneNumber: formattedPhone,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    });

    // Update rate limit
    this.updateRateLimit(userId);

    // Send SMS via Twilio
    try {
      const message = await this.client.messages.create({
        body: `Your Velocity Real Estate verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this message.`,
        from: this.fromNumber,
        to: formattedPhone
      });

      console.log(`   ✅ SMS sent successfully (ID: ${message.sid})`);

      return {
        success: true,
        message: 'Verification code sent via SMS',
        expiresIn: 600 // 10 minutes in seconds
      };

    } catch (error) {
      console.error(`   ❌ Failed to send SMS: ${error.message}`);

      // Twilio-specific error handling
      if (error.code === 21211) {
        throw new Error('Invalid phone number');
      } else if (error.code === 21608) {
        throw new Error('Phone number is not verified (Twilio trial account)');
      } else if (error.code === 21610) {
        throw new Error('Phone number is blacklisted or unsubscribed');
      }

      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * VERIFY CODE
   * Check if entered code matches
   */
  async verifyCode(code, userId) {
    console.log(`🔐 Verifying code for user: ${userId}`);

    const verification = this.verificationCodes.get(userId);

    if (!verification) {
      throw new Error('No verification code found. Please request a new code.');
    }

    // Check expiration
    if (Date.now() > verification.expiresAt) {
      this.verificationCodes.delete(userId);
      throw new Error('Verification code expired. Please request a new code.');
    }

    // Check attempts (max 3 attempts)
    if (verification.attempts >= 3) {
      this.verificationCodes.delete(userId);
      throw new Error('Too many failed attempts. Please request a new code.');
    }

    // Verify code
    if (code !== verification.code) {
      verification.attempts++;
      console.log(`   ❌ Invalid code (attempt ${verification.attempts}/3)`);
      throw new Error(`Invalid code. ${3 - verification.attempts} attempts remaining.`);
    }

    // Success!
    console.log(`   ✅ Code verified successfully`);

    // Clean up
    this.verificationCodes.delete(userId);

    return {
      success: true,
      phoneNumber: verification.phoneNumber,
      message: 'Phone number verified successfully'
    };
  }

  /**
   * RESEND CODE
   * Send code again (same code, new expiration)
   */
  async resendCode(userId) {
    console.log(`🔄 Resending verification code for user: ${userId}`);

    const verification = this.verificationCodes.get(userId);

    if (!verification) {
      throw new Error('No verification in progress');
    }

    // Check rate limiting
    if (this.isRateLimited(userId)) {
      const remainingTime = this.getRateLimitRemainingTime(userId);
      throw new Error(`Too many attempts. Try again in ${remainingTime} minutes.`);
    }

    // Extend expiration
    verification.expiresAt = Date.now() + (10 * 60 * 1000);
    verification.attempts = 0; // Reset attempts

    // Update rate limit
    this.updateRateLimit(userId);

    // Send SMS
    try {
      const message = await this.client.messages.create({
        body: `Your Velocity Real Estate verification code is: ${verification.code}\n\nThis code expires in 10 minutes.`,
        from: this.fromNumber,
        to: verification.phoneNumber
      });

      console.log(`   ✅ SMS resent successfully`);

      return {
        success: true,
        message: 'Verification code resent',
        expiresIn: 600
      };

    } catch (error) {
      console.error(`   ❌ Failed to resend SMS: ${error.message}`);
      throw new Error(`Failed to resend SMS: ${error.message}`);
    }
  }

  /**
   * GENERATE 6-DIGIT CODE
   */
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * FORMAT PHONE NUMBER
   * Convert to E.164 format (+1 for Canada/US)
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // If it's 10 digits, assume North America (+1)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }

    // Add + prefix
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * VALIDATE PHONE NUMBER
   * Basic validation for North American numbers
   */
  isValidPhoneNumber(phoneNumber) {
    // E.164 format: +1XXXXXXXXXX (11 digits after +)
    const regex = /^\+1[0-9]{10}$/;
    return regex.test(phoneNumber);
  }

  /**
   * RATE LIMITING
   */
  isRateLimited(userId) {
    const limits = this.rateLimits.get(userId);
    if (!limits) return false;

    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentAttempts = limits.filter(timestamp => timestamp > oneHourAgo);

    // Update stored attempts (remove old ones)
    if (recentAttempts.length < limits.length) {
      this.rateLimits.set(userId, recentAttempts);
    }

    return recentAttempts.length >= this.MAX_ATTEMPTS_PER_HOUR;
  }

  updateRateLimit(userId) {
    const limits = this.rateLimits.get(userId) || [];
    limits.push(Date.now());
    this.rateLimits.set(userId, limits);
  }

  getRateLimitRemainingTime(userId) {
    const limits = this.rateLimits.get(userId) || [];
    if (limits.length === 0) return 0;

    const oldestAttempt = Math.min(...limits);
    const resetTime = oldestAttempt + (60 * 60 * 1000); // 1 hour
    const remainingMs = resetTime - Date.now();
    return Math.ceil(remainingMs / (60 * 1000)); // Convert to minutes
  }

  /**
   * CLEAN UP EXPIRED CODES
   * Run this periodically (cron job)
   */
  cleanupExpiredCodes() {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, verification] of this.verificationCodes.entries()) {
      if (now > verification.expiresAt) {
        this.verificationCodes.delete(userId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired verification codes`);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// EXPRESS ROUTES
// ═══════════════════════════════════════════════════════════

function setupPhoneVerificationRoutes(app) {
  const verificationSystem = new PhoneVerificationSystem();

  // Clean up expired codes every 5 minutes
  setInterval(() => {
    verificationSystem.cleanupExpiredCodes();
  }, 5 * 60 * 1000);

  /**
   * SEND VERIFICATION CODE
   * POST /api/phone/send-code
   */
  app.post('/api/phone/send-code', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      const userId = req.user.userId; // From auth middleware

      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number required' });
      }

      const result = await verificationSystem.sendVerificationCode(phoneNumber, userId);
      res.json(result);

    } catch (error) {
      console.error('Send code error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * VERIFY CODE
   * POST /api/phone/verify-code
   */
  app.post('/api/phone/verify-code', async (req, res) => {
    try {
      const { code } = req.body;
      const userId = req.user.userId;

      if (!code) {
        return res.status(400).json({ error: 'Verification code required' });
      }

      const result = await verificationSystem.verifyCode(code, userId);

      // Update user profile
      // await updateUserProfile(userId, {
      //   phone: result.phoneNumber,
      //   phoneVerified: true
      // });

      res.json(result);

    } catch (error) {
      console.error('Verify code error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * RESEND CODE
   * POST /api/phone/resend-code
   */
  app.post('/api/phone/resend-code', async (req, res) => {
    try {
      const userId = req.user.userId;

      const result = await verificationSystem.resendCode(userId);
      res.json(result);

    } catch (error) {
      console.error('Resend code error:', error);
      res.status(400).json({ error: error.message });
    }
  });
}

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

module.exports = {
  PhoneVerificationSystem,
  setupPhoneVerificationRoutes
};
