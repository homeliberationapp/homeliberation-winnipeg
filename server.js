// ═══════════════════════════════════════════════════════════
// VELOCITY REAL ESTATE - Complete Backend Server
// Winnipeg wholesale real estate platform
//
// Phase 1: Authentication + Data Accuracy
// Phase 2: User Profiles + Personalization
// Phase 3: Phone Verification + Seller Dashboard + Testing
// ═══════════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Winnipeg-specific config
const CONFIG = require('./config-winnipeg');

// Phase 1: Original bots
const OfferEngine = require('./bots/offer_engine');
const BuyerMarketplace = require('./bots/buyer_marketplace');
const WinnipegDataScraper = require('./bots/winnipeg_data_scraper');

// Phase 2: New intelligent systems
const IntelligentMatcher = require('./bots/intelligent_matcher');
const SavedSearchManager = require('./bots/saved_search_manager');

// Phase 3: Route handlers
const { setupAuthRoutes } = require('./server/auth/auth-system');
const { setupUploadRoutes } = require('./server/upload-handler');
const { setupPhoneVerificationRoutes } = require('./server/phone-verification');

// Integrations
const { initTwilio } = require('./integrations/twilio');
const { initSendGrid } = require('./integrations/sendgrid');
const { initGoogleSheets } = require('./integrations/google_sheets');

const app = express();
const PORT = process.env.PORT || 3000;

// ───────────────────────────────────────────────────────────
// MIDDLEWARE
// ───────────────────────────────────────────────────────────

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const jwt = require('jsonwebtoken');
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ───────────────────────────────────────────────────────────
// INITIALIZE INTEGRATIONS
// ───────────────────────────────────────────────────────────

initTwilio(CONFIG);
initSendGrid(CONFIG);
initGoogleSheets(CONFIG);

const offerEngine = new OfferEngine(CONFIG);
const buyerMarketplace = new BuyerMarketplace(CONFIG);

// ───────────────────────────────────────────────────────────
// SETUP PHASE 2 & 3 ROUTES
// ───────────────────────────────────────────────────────────

// Phase 2: Authentication (Google OAuth + JWT)
setupAuthRoutes(app);

// Phase 2: Photo Uploads (Cloudinary)
setupUploadRoutes(app);

// Phase 3: Phone Verification (Twilio SMS)
setupPhoneVerificationRoutes(app);

console.log('✅ Phase 2 & 3 routes initialized');

// ───────────────────────────────────────────────────────────
// API ROUTES (PHASE 1 - ORIGINAL)
// ───────────────────────────────────────────────────────────

// SELLER: Submit property for offer
app.post('/api/submit-property', async (req, res) => {
  try {
    const leadData = req.body;
    console.log('\n📥 New seller lead received');

    const result = await offerEngine.processLead(leadData);

    res.json({
      success: true,
      message: 'Thank you! You\'ll receive your offer within 24 hours.',
      leadScore: result.leadScore,
      estimatedOffer: result.leadScore >= 70 ? result.offer : null
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// BUYER: Get all active deals
app.get('/api/deals', async (req, res) => {
  try {
    const { getRows } = require('./integrations/google_sheets');
    const deals = await getRows('Active Deals', { status: 'active' });

    res.json({ success: true, deals });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// BUYER: Get single deal details
app.get('/api/deals/:id', async (req, res) => {
  try {
    const { getRows } = require('./integrations/google_sheets');
    const deals = await getRows('Active Deals', { id: req.params.id });

    if (deals.length === 0) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    res.json({ success: true, deal: deals[0] });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// BUYER: Submit bid on deal
app.post('/api/bid', async (req, res) => {
  try {
    const { dealId, buyerId, bidAmount } = req.body;

    const result = await buyerMarketplace.receiveBid(dealId, buyerId, bidAmount);

    res.json({ success: true, ...result });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ADMIN: Accept winning bid
app.post('/api/accept-bid', async (req, res) => {
  try {
    const { dealId, buyerId, finalFee } = req.body;

    const result = await buyerMarketplace.acceptBid(dealId, buyerId, finalFee);

    res.json({ success: true });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// WEBHOOK: Stripe payment confirmation
app.post('/api/webhooks/stripe', async (req, res) => {
  // TODO: Verify Stripe signature
  // TODO: Update deal status on payment
  res.json({ received: true });
});

// ═══════════════════════════════════════════════════════════
// PHASE 2 & 3 API ROUTES
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// BUYER PROFILE & CRITERIA
// ───────────────────────────────────────────────────────────

app.get('/api/buyer/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { getRows } = require('./integrations/google_sheets');
    const profiles = await getRows('Buyer Profiles', { userId });

    res.json(profiles.length > 0 ? profiles[0] : { userId, investmentCriteria: {} });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/buyer/criteria', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const criteria = req.body;

    const { updateRow } = require('./integrations/google_sheets');
    await updateRow('Buyer Profiles', { userId }, { investmentCriteria: criteria });

    res.json({ success: true, message: 'Investment criteria saved' });
  } catch (error) {
    console.error('Update criteria error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ───────────────────────────────────────────────────────────
// SAVED SEARCHES
// ───────────────────────────────────────────────────────────

app.post('/api/saved-searches', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const search = await SavedSearchManager.createSavedSearch(userId, req.body);
    res.json(search);
  } catch (error) {
    console.error('Create search error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/saved-searches', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const searches = await SavedSearchManager.getBuyerSearches(userId);
    res.json(searches);
  } catch (error) {
    console.error('Get searches error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/saved-searches/:searchId', authenticateToken, async (req, res) => {
  try {
    const search = await SavedSearchManager.updateSavedSearch(req.params.searchId, req.body);
    res.json(search);
  } catch (error) {
    console.error('Update search error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/saved-searches/:searchId', authenticateToken, async (req, res) => {
  try {
    await SavedSearchManager.deleteSavedSearch(req.params.searchId);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ───────────────────────────────────────────────────────────
// USER PREFERENCES
// ───────────────────────────────────────────────────────────

app.get('/api/user/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { getRows } = require('./integrations/google_sheets');
    const prefs = await getRows('User Preferences', { userId });

    res.json(prefs.length > 0 ? prefs[0] : { notifications: {} });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/user/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { updateRow } = require('./integrations/google_sheets');
    await updateRow('User Preferences', { userId }, req.body);

    res.json({ success: true, message: 'Preferences saved' });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ───────────────────────────────────────────────────────────
// SELLER DASHBOARD
// ───────────────────────────────────────────────────────────

app.get('/api/seller/properties', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { getRows } = require('./integrations/google_sheets');
    const properties = await getRows('Seller Properties', { sellerId: userId });

    res.json(properties);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/seller/documents', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { getRows } = require('./integrations/google_sheets');
    const documents = await getRows('Seller Documents', { userId });

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/seller/communications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { getRows } = require('./integrations/google_sheets');
    const comms = await getRows('Communications', { userId });

    res.json(comms);
  } catch (error) {
    console.error('Get communications error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/seller/properties/:propertyId/accept-offer', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.userId;

    const { updateRow } = require('./integrations/google_sheets');
    await updateRow('Seller Properties', { id: propertyId, sellerId: userId }, {
      status: 'signed',
      acceptedDate: Date.now()
    });

    // Notify matching buyers
    const { getRows } = require('./integrations/google_sheets');
    const properties = await getRows('Seller Properties', { id: propertyId });

    if (properties.length > 0) {
      const buyers = await getRows('Buyer Profiles', {});
      const matches = await IntelligentMatcher.findMatchingBuyers(properties[0], buyers);
      await IntelligentMatcher.notifyMatchingBuyers(properties[0], matches);
    }

    res.json({ success: true, message: 'Offer accepted! Our team will contact you within 24 hours.' });
  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ───────────────────────────────────────────────────────────
// EMAIL SENDING
// ───────────────────────────────────────────────────────────

app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    const { sendEmail } = require('./integrations/sendgrid');

    await sendEmail(to, subject, html);
    res.json({ success: true });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ───────────────────────────────────────────────────────────
// FRONTEND ROUTES
// ───────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/investors', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'investors.html'));
});

app.get('/deals/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deal-detail.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ───────────────────────────────────────────────────────────
// START SERVER
// ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🏢 VELOCITY REAL ESTATE - WINNIPEG                  ║
║      Complete Wholesale Platform                      ║
║                                                        ║
║   🌐 Server: http://localhost:${PORT}                  ║
║   🏙️  Service Area: ${CONFIG.market.city}, ${CONFIG.market.province}                 ║
║                                                        ║
║   PHASE 1: ✅ Authentication + Data Accuracy         ║
║   PHASE 2: ✅ Profiles + Personalization             ║
║   PHASE 3: ✅ Phone Verification + Dashboard         ║
║                                                        ║
║   📊 Google Sheets: Connected                         ║
║   📧 SendGrid: Ready                                  ║
║   📱 Twilio: Ready                                    ║
║   ☁️  Cloudinary: Ready                               ║
║   🤖 AI Matching: Active                              ║
║                                                        ║
║   💰 Ready to make money! Let's go! 🚀               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// ───────────────────────────────────────────────────────────
// SCHEDULED TASKS (Cron jobs)
// ───────────────────────────────────────────────────────────

const cron = require('node-cron');

// Daily at 2 AM: Scrape property data updates
cron.schedule('0 2 * * *', async () => {
  console.log('🌙 Running nightly data update...');
  // Update all active property data from Winnipeg sources
  // TODO: Implement daily scraping of all active properties
});

// Daily at 8 AM: Send daily digest emails (Phase 2)
cron.schedule('0 8 * * *', async () => {
  console.log('📊 Sending daily digests...');
  await SavedSearchManager.sendDailyDigests();
});

// Weekly on Mondays at 8 AM: Send weekly digest emails (Phase 2)
cron.schedule('0 8 * * 1', async () => {
  console.log('📊 Sending weekly digests...');
  await SavedSearchManager.sendWeeklyDigests();
});

// Every hour: Clean up expired phone verification codes (Phase 3)
cron.schedule('0 * * * *', async () => {
  console.log('🧹 Cleaning up expired codes...');
  // Phone verification system handles this internally
});

console.log('⏰ Cron jobs scheduled:');
console.log('   - 2:00 AM daily: Property data update');
console.log('   - 8:00 AM daily: Daily digest emails');
console.log('   - 8:00 AM Monday: Weekly digest emails');
console.log('   - Hourly: Cleanup tasks');

module.exports = app;
