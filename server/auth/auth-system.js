/**
 * AUTHENTICATION SYSTEM
 * Multi-admin + Customer auth with Google OAuth
 *
 * Features:
 * - Email/password registration
 * - Google OAuth (one-click login)
 * - Role-based access control (admins)
 * - JWT token authentication
 * - 2FA for admins
 * - Session management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

class AuthSystem {

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION';
    this.jwtExpiry = '7d'; // Tokens last 7 days

    // Google OAuth client
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
    );

    // Admin roles
    this.roles = {
      OWNER: 'owner',           // Full access, can add/remove admins
      MANAGER: 'manager',       // Can manage deals, buyers, sellers
      ANALYST: 'analyst',       // Read-only analytics
      SUPPORT: 'support'        // Customer support (limited access)
    };

    // Permissions per role
    this.permissions = {
      owner: ['*'], // All permissions
      manager: [
        'leads.view', 'leads.edit', 'leads.delete',
        'deals.view', 'deals.edit', 'deals.close',
        'buyers.view', 'buyers.edit',
        'properties.hold', 'properties.release', 'properties.self-purchase',
        'analytics.view'
      ],
      analyst: [
        'leads.view', 'deals.view', 'buyers.view',
        'analytics.view', 'reports.generate'
      ],
      support: [
        'leads.view', 'buyers.view',
        'messages.send', 'tickets.view'
      ]
    };
  }

  /**
   * REGISTER USER (Email/Password)
   */
  async registerUser(email, password, userType = 'buyer', additionalData = {}) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user object
      const user = {
        id: this.generateUserId(),
        email: email.toLowerCase(),
        passwordHash,
        userType, // 'buyer', 'seller', 'admin'
        role: userType === 'admin' ? this.roles.SUPPORT : null, // Default admin role
        emailVerified: false,
        createdAt: Date.now(),
        lastLogin: null,
        ...additionalData
      };

      // Save to database
      await this.saveUser(user);

      // Send verification email
      await this.sendVerificationEmail(user);

      console.log(`✅ User registered: ${email} (${userType})`);

      return {
        success: true,
        userId: user.id,
        message: 'Registration successful. Please check your email to verify your account.'
      };

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * LOGIN (Email/Password)
   */
  async login(email, password) {
    try {
      // Get user
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if email verified
      if (!user.emailVerified) {
        throw new Error('Please verify your email before logging in');
      }

      // Check if 2FA required (for admins)
      if (user.userType === 'admin' && user.twoFactorEnabled) {
        return {
          requiresTwoFactor: true,
          userId: user.id,
          message: 'Please enter your 2FA code'
        };
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Update last login
      await this.updateUserLastLogin(user.id);

      console.log(`✅ User logged in: ${email}`);

      return {
        success: true,
        token,
        user: this.sanitizeUser(user)
      };

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * GOOGLE OAUTH LOGIN
   * One-click authentication via Google
   */
  async loginWithGoogle(googleIdToken) {
    try {
      // Verify Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleIdToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name;
      const picture = payload.picture;
      const emailVerified = payload.email_verified;

      console.log(`🔐 Google OAuth login attempt: ${email}`);

      // Check if user exists
      let user = await this.getUserByGoogleId(googleId);

      if (!user) {
        // Check if user exists with same email (link accounts)
        user = await this.getUserByEmail(email);

        if (user) {
          // Link Google account
          console.log(`🔗 Linking Google account to existing user: ${email}`);
          user.googleId = googleId;
          user.googlePicture = picture;
          user.emailVerified = emailVerified; // Trust Google verification
          await this.updateUser(user);
        } else {
          // Create new user
          console.log(`➕ Creating new user from Google: ${email}`);

          user = {
            id: this.generateUserId(),
            email: email.toLowerCase(),
            googleId,
            googlePicture: picture,
            name,
            userType: 'buyer', // Default to buyer (sellers/admins created manually)
            emailVerified: emailVerified,
            createdAt: Date.now(),
            lastLogin: null,
            passwordHash: null // No password for OAuth users
          };

          await this.saveUser(user);
        }
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Update last login
      await this.updateUserLastLogin(user.id);

      console.log(`✅ Google OAuth login successful: ${email}`);

      return {
        success: true,
        token,
        user: this.sanitizeUser(user)
      };

    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Google authentication failed');
    }
  }

  /**
   * VERIFY JWT TOKEN
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * GENERATE JWT TOKEN
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry
    });
  }

  /**
   * CHECK PERMISSION
   */
  hasPermission(user, permission) {
    // Owners have all permissions
    if (user.role === this.roles.OWNER) {
      return true;
    }

    // Check if user's role has this permission
    const rolePermissions = this.permissions[user.role] || [];

    return rolePermissions.includes(permission) || rolePermissions.includes('*');
  }

  /**
   * INVITE ADMIN
   * Owner can invite new admins
   */
  async inviteAdmin(inviterUserId, email, role) {
    try {
      // Verify inviter is owner
      const inviter = await this.getUserById(inviterUserId);
      if (!inviter || inviter.role !== this.roles.OWNER) {
        throw new Error('Only owners can invite admins');
      }

      // Validate role
      if (!Object.values(this.roles).includes(role)) {
        throw new Error('Invalid admin role');
      }

      // Check if user already exists
      const existing = await this.getUserByEmail(email);
      if (existing) {
        throw new Error('User already exists');
      }

      // Create invite token
      const inviteToken = this.generateInviteToken(email, role);

      // Save invite
      await this.saveInvite({
        email,
        role,
        inviteToken,
        invitedBy: inviterUserId,
        createdAt: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      });

      // Send invite email
      await this.sendAdminInviteEmail(email, inviteToken, role);

      console.log(`✅ Admin invite sent: ${email} (${role})`);

      return {
        success: true,
        message: 'Admin invite sent successfully'
      };

    } catch (error) {
      console.error('Invite admin error:', error);
      throw error;
    }
  }

  /**
   * ACCEPT ADMIN INVITE
   */
  async acceptAdminInvite(inviteToken, password) {
    try {
      // Verify invite token
      const invite = await this.getInviteByToken(inviteToken);
      if (!invite) {
        throw new Error('Invalid or expired invite');
      }

      if (Date.now() > invite.expiresAt) {
        throw new Error('Invite has expired');
      }

      // Register admin user
      await this.registerUser(invite.email, password, 'admin', {
        role: invite.role,
        emailVerified: true // Trust invite link
      });

      // Mark invite as used
      await this.markInviteUsed(inviteToken);

      console.log(`✅ Admin invite accepted: ${invite.email}`);

      return {
        success: true,
        message: 'Admin account created successfully'
      };

    } catch (error) {
      console.error('Accept invite error:', error);
      throw error;
    }
  }

  /**
   * HELPER FUNCTIONS
   */

  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateInviteToken(email, role) {
    const payload = { email, role, type: 'admin_invite' };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
  }

  sanitizeUser(user) {
    // Remove sensitive fields
    const { passwordHash, twoFactorSecret, ...safeUser } = user;
    return safeUser;
  }

  /**
   * DATABASE OPERATIONS (placeholders)
   */

  async getUserByEmail(email) {
    // Fetch from database
    const response = await fetch(`/api/users/by-email/${email}`);
    if (!response.ok) return null;
    return await response.json();
  }

  async getUserByGoogleId(googleId) {
    // Fetch from database
    const response = await fetch(`/api/users/by-google-id/${googleId}`);
    if (!response.ok) return null;
    return await response.json();
  }

  async getUserById(userId) {
    // Fetch from database
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) return null;
    return await response.json();
  }

  async saveUser(user) {
    // Save to database
    await fetch('/api/users/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  }

  async updateUser(user) {
    // Update in database
    await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  }

  async updateUserLastLogin(userId) {
    // Update last login timestamp
    await fetch(`/api/users/${userId}/last-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastLogin: Date.now() })
    });
  }

  async sendVerificationEmail(user) {
    // Send verification email via SendGrid
    const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${user.id}`;

    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.email,
        template: 'email-verification',
        data: { verificationLink, name: user.name }
      })
    });
  }

  async sendAdminInviteEmail(email, inviteToken, role) {
    // Send admin invite email
    const inviteLink = `${process.env.APP_URL}/auth/admin/accept-invite?token=${inviteToken}`;

    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        template: 'admin-invite',
        data: { inviteLink, role }
      })
    });
  }

  async saveInvite(invite) {
    // Save invite to database
    await fetch('/api/admin/invites/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invite)
    });
  }

  async getInviteByToken(token) {
    // Fetch invite from database
    const response = await fetch(`/api/admin/invites/by-token/${token}`);
    if (!response.ok) return null;
    return await response.json();
  }

  async markInviteUsed(token) {
    // Mark invite as used
    await fetch(`/api/admin/invites/mark-used`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
  }
}

// Singleton instance
const authSystem = new AuthSystem();

module.exports = authSystem;
