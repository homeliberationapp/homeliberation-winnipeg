// ═══════════════════════════════════════════════════════════
// EMAIL DELIVERY VERIFICATION TEST
// Tests that Gmail App Password works and emails are sent
// ═══════════════════════════════════════════════════════════

const { test, expect } = require('@playwright/test');

test('Verify email delivery with real lead submission', async ({ page }) => {
    console.log('\n🧪 TEST: Email Delivery Verification\n');

    // Navigate to lead form
    await page.goto('http://localhost:3000/lead-form.html');
    console.log('✅ Form loaded');

    // Fill out HOT lead form (should trigger email)
    console.log('\n📝 Filling form with HOT lead data...');

    // Contact Information
    await page.fill('input[name="firstName"]', 'Email');
    await page.fill('input[name="lastName"]', 'TestUser');
    await page.fill('input[name="phone"]', '(204) 555-9999');
    await page.fill('input[name="email"]', 'test-email@example.com');

    // Property Details
    await page.fill('input[name="propertyAddress"]', '999 Email Test Street, Winnipeg, MB');
    await page.selectOption('select[name="propertyType"]', 'Single-Family Home');
    await page.selectOption('select[name="bedrooms"]', '3');
    await page.selectOption('select[name="condition"]', 'Very Poor - Uninhabitable/condemned');

    // Situation (designed to create HOT lead with high score)
    await page.selectOption('select[name="reason"]', 'Foreclosure / Behind on payments');
    await page.selectOption('select[name="timeline"]', 'Immediately (1-7 days)');
    await page.selectOption('select[name="mortgageStatus"]', 'In foreclosure');
    await page.selectOption('select[name="bestTimeToCall"]', 'Morning (8-12 PM)');

    await page.fill('textarea[name="comments"]', 'TEST EMAIL DELIVERY - This is a test lead to verify Gmail App Password is working correctly. Expected: 500+ score, HOT priority, email notification sent to homeliberationapp@gmail.com');

    console.log('✅ Form filled with HOT lead criteria');

    // Take screenshot before submission
    await page.screenshot({ path: 'C:\\Users\\Owner\\Desktop\\email-test-before.png', fullPage: true });
    console.log('📸 Screenshot saved: email-test-before.png');

    // Submit form
    console.log('\n📤 Submitting form...');
    await page.click('button[type="submit"]');

    // Wait for success message
    await page.waitForSelector('.success-message:not(.hidden)', { timeout: 10000 });
    console.log('✅ Form submitted successfully');

    // Extract response details
    const successText = await page.textContent('.success-message');
    console.log('\n📋 Server Response:');
    console.log(successText);

    // Extract lead ID and score
    const leadIdMatch = successText.match(/Lead ID: (LEAD_\d+)/);
    const scoreMatch = successText.match(/Score: (\d+)\/600/);
    const priorityMatch = successText.match(/\((.*?) Priority\)/);

    expect(leadIdMatch).toBeTruthy();
    expect(scoreMatch).toBeTruthy();
    expect(priorityMatch).toBeTruthy();

    const leadId = leadIdMatch[1];
    const score = parseInt(scoreMatch[1]);
    const priority = priorityMatch[1];

    console.log(`\n🎯 Lead Details:`);
    console.log(`   ID: ${leadId}`);
    console.log(`   Score: ${score}/600`);
    console.log(`   Priority: ${priority}`);

    // Verify high score (should be HOT)
    expect(score).toBeGreaterThanOrEqual(400);
    expect(priority).toBe('HOT');

    // Take screenshot after submission
    await page.screenshot({ path: 'C:\\Users\\Owner\\Desktop\\email-test-after.png', fullPage: true });
    console.log('📸 Screenshot saved: email-test-after.png');

    // Wait a moment for email to send
    console.log('\n⏳ Waiting 5 seconds for email to send...');
    await page.waitForTimeout(5000);

    console.log('\n✅ TEST COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 CHECK YOUR EMAIL: homeliberationapp@gmail.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nExpected email subject: 🔥🔥🔥 HOT LEAD: Email TestUser (${score}/600)`);
    console.log('Expected from: Home Liberation Winnipeg <homeliberationapp@gmail.com>');
    console.log(`Expected content: Lead details with score ${score}/600`);
    console.log('\nIf email received: ✅ Gmail App Password is working!');
    console.log('If no email: ❌ Check server logs for errors');
    console.log('\n');
});
