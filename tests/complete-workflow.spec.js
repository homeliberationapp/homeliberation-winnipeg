/**
 * PLAYWRIGHT END-TO-END TESTS
 * Complete workflow testing for Velocity Real Estate platform
 *
 * Tests:
 * 1. Seller workflow (submit property → receive offer → accept)
 * 2. Buyer workflow (register → save search → view matches → place bid)
 * 3. Admin workflow (approve deal → assign to buyer)
 * 4. Email notifications
 * 5. Phone verification
 * 6. Photo uploads
 */

const { test, expect } = require('@playwright/test');

// ═══════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════

const TEST_DATA = {
  seller: {
    email: 'seller-test@example.com',
    name: 'John Seller',
    phone: '2045551234',
    property: {
      address: '123 Test Street',
      city: 'Winnipeg',
      province: 'Manitoba',
      postalCode: 'R3T 2E5',
      propertyType: 'single-family',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1500,
      yearBuilt: 1995
    }
  },
  buyer: {
    email: 'buyer-test@example.com',
    name: 'Jane Buyer',
    phone: '2045555678',
    criteria: {
      propertyTypes: ['single-family', 'multi-family'],
      minBudget: 150000,
      maxBudget: 350000,
      neighborhoods: ['River Heights', 'Tuxedo'],
      minROI: 0.15
    }
  },
  admin: {
    email: 'admin-test@example.com',
    password: 'admin123'
  }
};

// ═══════════════════════════════════════════════════════════
// SELLER WORKFLOW TESTS
// ═══════════════════════════════════════════════════════════

test.describe('Seller Workflow', () => {

  test('should allow seller to submit property', async ({ page }) => {
    // Go to homepage
    await page.goto('/');

    // Click "Sell Your Property"
    await page.click('text=Sell Your Property');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);

    // Register via Google OAuth (mocked)
    await page.evaluate(() => {
      // Mock Google OAuth response
      localStorage.setItem('authToken', 'mock-seller-token');
      localStorage.setItem('user', JSON.stringify({
        userId: 'seller-1',
        email: 'seller-test@example.com',
        name: 'John Seller',
        userType: 'seller'
      }));
    });

    // Go to property submission
    await page.goto('/sellers/submit-property.html');

    // Fill out property form
    await page.fill('[name="address"]', TEST_DATA.seller.property.address);
    await page.fill('[name="city"]', TEST_DATA.seller.property.city);
    await page.fill('[name="postalCode"]', TEST_DATA.seller.property.postalCode);
    await page.selectOption('[name="propertyType"]', TEST_DATA.seller.property.propertyType);
    await page.fill('[name="bedrooms"]', TEST_DATA.seller.property.bedrooms.toString());
    await page.fill('[name="bathrooms"]', TEST_DATA.seller.property.bathrooms.toString());
    await page.fill('[name="squareFeet"]', TEST_DATA.seller.property.squareFeet.toString());
    await page.fill('[name="yearBuilt"]', TEST_DATA.seller.property.yearBuilt.toString());

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Property submitted successfully');

    // Should redirect to dashboard
    await page.waitForURL(/.*dashboard/);
  });

  test('should display offer on seller dashboard', async ({ page }) => {
    // Login as seller
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-seller-token');
      localStorage.setItem('user', JSON.stringify({
        userId: 'seller-1',
        userType: 'seller'
      }));
    });

    await page.goto('/sellers/dashboard.html');

    // Should see property with offer
    await expect(page.locator('.property-card')).toBeVisible();
    await expect(page.locator('.offer-section')).toBeVisible();
    await expect(page.locator('.offer-amount')).toBeVisible();

    // Should see countdown timer
    await expect(page.locator('.countdown-timer')).toBeVisible();
    await expect(page.locator('.countdown-time')).toContainText(':');
  });

  test('should allow seller to accept offer', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-seller-token');
    });

    await page.goto('/sellers/dashboard.html');

    // Click accept offer
    const acceptButton = page.locator('button:has-text("Accept Offer")');
    await acceptButton.click();

    // Confirm dialog
    page.on('dialog', dialog => dialog.accept());

    // Wait for success
    await page.waitForTimeout(1000);

    // Should see success message
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

// ═══════════════════════════════════════════════════════════
// BUYER WORKFLOW TESTS
// ═══════════════════════════════════════════════════════════

test.describe('Buyer Workflow', () => {

  test('should allow buyer to register and set criteria', async ({ page }) => {
    await page.goto('/login.html');

    // Mock Google OAuth
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-buyer-token');
      localStorage.setItem('user', JSON.stringify({
        userId: 'buyer-1',
        email: 'buyer-test@example.com',
        name: 'Jane Buyer',
        userType: 'buyer'
      }));
    });

    // Go to dashboard
    await page.goto('/buyers/dashboard.html');

    // Click set criteria
    await page.click('text=Set Investment Criteria');

    // Fill out criteria form
    await page.check('[value="single-family"]');
    await page.check('[value="multi-family"]');
    await page.fill('[name="minBudget"]', TEST_DATA.buyer.criteria.minBudget.toString());
    await page.fill('[name="maxBudget"]', TEST_DATA.buyer.criteria.maxBudget.toString());
    await page.check('[value="River Heights"]');
    await page.fill('[name="minROI"]', '15');

    // Save criteria
    await page.click('button:has-text("Save Criteria")');

    // Should see success message
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should show matching deals on buyer dashboard', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-buyer-token');
      localStorage.setItem('user', JSON.stringify({
        userId: 'buyer-1',
        userType: 'buyer',
        investmentCriteria: {
          propertyTypes: ['single-family'],
          minBudget: 150000,
          maxBudget: 350000
        }
      }));
    });

    await page.goto('/buyers/dashboard.html');

    // Should see matches tab
    await page.click('text=Matches');

    // Should see deal cards
    await expect(page.locator('.deal-card')).toHaveCount.toBeGreaterThan(0);

    // Each card should show match percentage
    await expect(page.locator('.match-score').first()).toBeVisible();
    await expect(page.locator('.match-score').first()).toContainText('%');
  });

  test('should allow buyer to create saved search', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-buyer-token');
    });

    await page.goto('/buyers/saved-searches.html');

    // Click create search
    await page.click('text=Create Search');

    // Fill out form
    await page.fill('#search-name', 'Multi-Family in River Heights');
    await page.check('[value="multi-family"]');
    await page.fill('#min-budget', '200000');
    await page.fill('#max-budget', '300000');
    await page.check('[value="River Heights"]');
    await page.fill('#min-roi', '15');
    await page.check('[value="instant"]');

    // Save search
    await page.click('button[type="submit"]');

    // Should see success
    await page.waitForTimeout(1000);
    await expect(page.locator('.search-card')).toBeVisible();
  });

  test('should allow buyer to place bid', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-buyer-token');
    });

    await page.goto('/buyers/dashboard.html');

    // Click on a deal
    const dealCard = page.locator('.deal-card').first();
    await dealCard.click();

    // Should open deal details modal
    await expect(page.locator('.deal-modal')).toBeVisible();

    // Click bid button
    await page.click('text=Place Bid');

    // Fill bid amount
    await page.fill('[name="bidAmount"]', '250000');

    // Submit bid
    await page.click('button:has-text("Submit Bid")');

    // Should see success
    await expect(page.locator('.success-message')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
// ADMIN WORKFLOW TESTS
// ═══════════════════════════════════════════════════════════

test.describe('Admin Workflow', () => {

  test('should allow admin to login', async ({ page }) => {
    await page.goto('/admin.html');

    // Fill login form
    await page.fill('[name="email"]', TEST_DATA.admin.email);
    await page.fill('[name="password"]', TEST_DATA.admin.password);

    // Submit
    await page.click('button[type="submit"]');

    // Should see admin dashboard
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.locator('.admin-dashboard')).toBeVisible();
  });

  test('should display pending deals', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-admin-token');
      localStorage.setItem('user', JSON.stringify({
        userId: 'admin-1',
        role: 'owner'
      }));
    });

    await page.goto('/admin.html');

    // Should see pending deals section
    await expect(page.locator('.pending-deals')).toBeVisible();

    // Should see deal cards
    await expect(page.locator('.deal-card')).toHaveCount.toBeGreaterThan(0);
  });

  test('should allow admin to approve deal', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-admin-token');
    });

    await page.goto('/admin.html');

    // Click approve on first deal
    const approveButton = page.locator('button:has-text("Approve")').first();
    await approveButton.click();

    // Confirm dialog
    page.on('dialog', dialog => dialog.accept());

    // Should see success
    await page.waitForTimeout(1000);
  });

  test('should allow admin to hold deal', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-admin-token');
    });

    await page.goto('/admin.html');

    // Click hold button
    await page.click('button:has-text("Hold")');

    // Fill hold reason
    await page.fill('[name="holdReason"]', 'Needs additional verification');

    // Submit
    await page.click('button:has-text("Confirm Hold")');

    // Should see success
    await expect(page.locator('.success-message')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
// PHONE VERIFICATION TESTS
// ═══════════════════════════════════════════════════════════

test.describe('Phone Verification', () => {

  test('should send verification code', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-user-token');
    });

    await page.goto('/buyers/settings.html');

    // Click verify phone
    await page.click('text=Verify Phone Number');

    // Enter phone number
    await page.fill('#phone-input', '(204) 555-1234');

    // Click send code
    await page.click('text=Send Verification Code');

    // Should see code input screen
    await expect(page.locator('.code-digit').first()).toBeVisible();
  });

  test('should verify code', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-user-token');
    });

    await page.goto('/buyers/settings.html');
    await page.click('text=Verify Phone Number');
    await page.fill('#phone-input', '(204) 555-1234');
    await page.click('text=Send Verification Code');

    // Enter verification code (mocked as 123456)
    const codeDigits = page.locator('.code-digit');
    await codeDigits.nth(0).fill('1');
    await codeDigits.nth(1).fill('2');
    await codeDigits.nth(2).fill('3');
    await codeDigits.nth(3).fill('4');
    await codeDigits.nth(4).fill('5');
    await codeDigits.nth(5).fill('6');

    // Should auto-verify
    await page.waitForTimeout(1000);

    // Should see success screen
    await expect(page.locator('.success-icon')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
// PHOTO UPLOAD TESTS
// ═══════════════════════════════════════════════════════════

test.describe('Photo Uploads', () => {

  test('should upload profile picture', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-user-token');
    });

    await page.goto('/buyers/settings.html');

    // Click upload profile picture
    await page.click('text=Upload Profile Picture');

    // Upload file (mocked)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'profile.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake image data')
    });

    // Should see progress
    await expect(page.locator('.progress-bar')).toBeVisible();

    // Should see success
    await page.waitForTimeout(2000);
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should upload property photos', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-seller-token');
    });

    await page.goto('/sellers/submit-property.html');

    // Upload multiple photos
    const fileInput = page.locator('input[type="file"][multiple]');
    await fileInput.setInputFiles([
      { name: 'photo1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('photo1') },
      { name: 'photo2.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('photo2') },
      { name: 'photo3.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('photo3') }
    ]);

    // Should see 3 preview thumbnails
    await expect(page.locator('.photo-preview')).toHaveCount(3);
  });
});

// ═══════════════════════════════════════════════════════════
// SAVED SEARCH EMAIL ALERTS TESTS
// ═══════════════════════════════════════════════════════════

test.describe('Saved Search Alerts', () => {

  test('should create saved search with instant alerts', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-buyer-token');
    });

    await page.goto('/buyers/saved-searches.html');

    // Create search
    await page.click('text=Create Search');
    await page.fill('#search-name', 'Hot Deals');
    await page.check('[value="instant"]');
    await page.click('button[type="submit"]');

    // Should see search card
    await expect(page.locator('.search-card')).toBeVisible();
    await expect(page.locator('.search-card')).toContainText('Instant');
  });

  test('should allow pausing saved search', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-buyer-token');
    });

    await page.goto('/buyers/saved-searches.html');

    // Click pause on first search
    await page.click('button:has-text("Pause")');

    // Should change to "Resume"
    await expect(page.locator('button:has-text("Resume")')).toBeVisible();

    // Status badge should change
    await expect(page.locator('.status-paused')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
// EMAIL PREFERENCES TESTS
// ═══════════════════════════════════════════════════════════

test.describe('Email Preferences', () => {

  test('should allow setting email preferences', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-buyer-token');
    });

    await page.goto('/buyers/email-preferences.html');

    // Toggle some preferences
    await page.click('#toggle-newDeals');
    await page.click('#toggle-smsEnabled');

    // Set quiet hours
    await page.click('#toggle-quietHours');
    await page.fill('#quiet-start', '22:00');
    await page.fill('#quiet-end', '08:00');

    // Save preferences
    await page.click('button:has-text("Save Preferences")');

    // Should see success
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should show unsubscribe warning', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-buyer-token');
    });

    await page.goto('/buyers/email-preferences.html');

    // Click unsubscribe all
    await page.click('#toggle-unsubscribeAll');

    // Should see warning
    await expect(page.locator('.unsubscribe-warning')).toBeVisible();
    await expect(page.locator('.unsubscribe-warning')).toContainText('miss out');
  });
});

// ═══════════════════════════════════════════════════════════
// INTELLIGENT MATCHING TESTS
// ═══════════════════════════════════════════════════════════

test.describe('Intelligent Matching', () => {

  test('should show match score for each deal', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-buyer-token');
      localStorage.setItem('user', JSON.stringify({
        investmentCriteria: {
          propertyTypes: ['single-family'],
          minBudget: 200000,
          maxBudget: 300000
        }
      }));
    });

    await page.goto('/buyers/dashboard.html');

    // Should see match scores
    const matchScores = page.locator('.match-score');
    await expect(matchScores.first()).toBeVisible();

    // Score should be between 0-100
    const scoreText = await matchScores.first().textContent();
    const score = parseInt(scoreText);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('should show match reasons', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-buyer-token');
    });

    await page.goto('/buyers/dashboard.html');

    // Click on deal to see details
    await page.click('.deal-card');

    // Should see match reasons
    await expect(page.locator('.match-reasons')).toBeVisible();
    await expect(page.locator('.match-reasons li')).toHaveCount.toBeGreaterThan(0);
  });
});
