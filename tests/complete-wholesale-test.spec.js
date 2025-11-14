/**
 * COMPLETE WHOLESALE CONTACT FORM TEST
 * Fills out entire form with realistic data and submits
 */

const { test, expect } = require('@playwright/test');

test.describe('Complete Wholesale Form Submission', () => {

    test('submit realistic wholesale consultation request', async ({ page }) => {
        console.log('🚀 Starting complete wholesale form test...\n');

        // Navigate to contact form
        await page.goto('https://homeliberation.app/contact.html');
        await page.waitForLoadState('networkidle');

        console.log('✅ Page loaded successfully');

        // PERSONAL INFORMATION
        await page.fill('input[name="first_name"]', 'Michael');
        await page.fill('input[name="last_name"]', 'Johnson');
        await page.fill('input[name="email"]', 'michael.johnson.test@gmail.com');
        await page.fill('input[name="phone"]', '(204) 555-7890');

        console.log('✅ Personal information filled');

        // PROPERTY DETAILS
        await page.fill('input[name="address"]', '456 Portage Avenue, Winnipeg, MB R3G 0W5');

        // Select neighborhood
        await page.selectOption('select[name="neighborhood"]', 'West Broadway');

        // Property type - Apartment building for high score
        await page.selectOption('select[name="property_type"]', 'Apartment Building (4+ units)');

        await page.fill('input[name="year_built"]', '1975');
        await page.fill('input[name="bedrooms"]', '16');
        await page.fill('input[name="bathrooms"]', '12');
        await page.fill('input[name="square_feet"]', '9500');

        // Condition - Fair (needs work but not terrible)
        await page.selectOption('select[name="condition"]', 'fair');

        console.log('✅ Property details filled');

        // SITUATION
        await page.selectOption('select[name="situation"]', 'landlord');
        await page.selectOption('select[name="occupancy"]', 'occupied');
        await page.selectOption('select[name="mortgage_status"]', 'current');
        await page.selectOption('select[name="timeline"]', '30-60-days');

        console.log('✅ Situation details filled');

        // COMPREHENSIVE FINANCIAL ANALYSIS (Critical wholesale fields)

        // REQUIRED: Municipal Assessment Value
        await page.fill('input[name="assessment_value"]', '425000');

        // ARV - After Repair Value
        await page.fill('input[name="arv"]', '550000');

        // Current Market Value (As-Is)
        await page.fill('input[name="current_market_value"]', '385000');

        // Estimated Total Repairs
        await page.fill('input[name="estimated_repairs"]', '65000');

        // Mortgage Balance
        await page.fill('input[name="mortgage_balance"]', '280000');

        // Monthly Payment
        await page.fill('input[name="monthly_payment"]', '2100');

        // Interest Rate
        await page.fill('input[name="interest_rate"]', '5.25');

        // Years Remaining
        await page.fill('input[name="years_remaining"]', '22');

        // Liens
        await page.fill('input[name="liens"]', '0');

        // Back Taxes
        await page.fill('input[name="back_taxes"]', '0');

        // Annual Taxes
        await page.fill('input[name="annual_taxes"]', '5200');

        // HOA Fees
        await page.fill('input[name="hoa_fees"]', '0');

        // Current Rent (if rented)
        await page.fill('input[name="current_rent"]', '12800');

        // Market Rent Potential
        await page.fill('input[name="market_rent"]', '16000');

        // Asking Price
        await page.fill('input[name="asking_price"]', '365000');

        // Minimum Acceptable
        await page.fill('input[name="minimum_price"]', '340000');

        // Equity
        await page.fill('input[name="equity"]', '145000');

        // Days on Market
        await page.fill('input[name="days_on_market"]', '0');

        // Previous List Price
        await page.fill('input[name="previous_list_price"]', '0');

        console.log('✅ All 18 financial fields filled');

        // REPAIRS NEEDED
        await page.selectOption('select[name="repair_roof"]', 'moderate');
        await page.selectOption('select[name="repair_foundation"]', 'minor');
        await page.selectOption('select[name="repair_hvac"]', 'moderate');
        await page.selectOption('select[name="repair_plumbing"]', 'minor');
        await page.selectOption('select[name="repair_electrical"]', 'minor');
        await page.selectOption('select[name="repair_windows"]', 'moderate');
        await page.selectOption('select[name="repair_kitchen"]', 'major');
        await page.selectOption('select[name="repair_bathroom"]', 'moderate');
        await page.selectOption('select[name="repair_flooring"]', 'moderate');

        console.log('✅ Repair details filled');

        // ADDITIONAL DETAILS
        const additionalDetails = `16-unit apartment building in West Broadway. Building is currently occupied with month-to-month tenants. Total monthly rent collected is $12,800 but could be $16,000+ with renovations. Property needs kitchen upgrades, new flooring, HVAC updates, and roof work. Owner is a tired landlord ready to move on. Clear title, no liens, taxes current. Looking for quick cash close within 30-60 days. Building has good bones but needs cosmetic updates. All units are 1-bedroom apartments. Seller motivated - inherited property and wants to liquidate. Will consider all reasonable cash offers.`;

        await page.fill('textarea[name="additional_details"]', additionalDetails);

        console.log('✅ Additional details filled');

        // CONSENT CHECKBOX
        await page.check('input[name="consent"]');

        console.log('✅ Consent checkbox checked');

        // Take screenshot before submission
        await page.screenshot({
            path: 'test-screenshots/form-filled-complete.png',
            fullPage: true
        });

        console.log('✅ Screenshot saved: form-filled-complete.png');

        // CALCULATE EXPECTED WHOLESALE METRICS
        const arv = 550000;
        const repairs = 65000;
        const wholesaleFee = 15000;
        const expectedMAO = Math.round((arv * 0.70) - repairs - wholesaleFee);
        const expectedBuyerProfit = Math.round((arv * 0.70) - repairs);
        const totalDebt = 280000;
        const expectedEquity = arv - totalDebt;

        console.log('\n📊 EXPECTED WHOLESALE METRICS:');
        console.log(`   ARV: $${arv.toLocaleString()}`);
        console.log(`   70% of ARV: $${(arv * 0.70).toLocaleString()}`);
        console.log(`   Repairs: $${repairs.toLocaleString()}`);
        console.log(`   Wholesale Fee: $${wholesaleFee.toLocaleString()}`);
        console.log(`   Maximum Allowable Offer (MAO): $${expectedMAO.toLocaleString()}`);
        console.log(`   Buyer Profit Potential: $${expectedBuyerProfit.toLocaleString()}`);
        console.log(`   Total Debt: $${totalDebt.toLocaleString()}`);
        console.log(`   Estimated Equity: $${expectedEquity.toLocaleString()}`);
        console.log(`   Seller's Minimum: $340,000`);
        console.log(`   Deal Spread: $${(arv - expectedMAO).toLocaleString()} (${Math.round(((arv - expectedMAO) / arv) * 100)}%)`);

        console.log('\n💡 DEAL ANALYSIS:');
        if (expectedMAO >= 340000) {
            console.log(`   ✅ EXCELLENT DEAL! MAO ($${expectedMAO.toLocaleString()}) exceeds seller minimum ($340,000)`);
            console.log(`   ✅ Profit margin for wholesaler: $${(expectedMAO - 340000).toLocaleString()}`);
        } else {
            console.log(`   ⚠️  NEGOTIATION NEEDED: MAO ($${expectedMAO.toLocaleString()}) below seller minimum ($340,000)`);
            console.log(`   📉 Gap to close: $${(340000 - expectedMAO).toLocaleString()}`);
        }

        // SUBMIT FORM
        console.log('\n🚀 Submitting form...');

        const submitButton = page.locator('button[type="submit"]');

        // Wait for form submission
        const responsePromise = page.waitForResponse(
            response => response.url().includes('/api/submit-consultation'),
            { timeout: 30000 }
        );

        await submitButton.click();

        try {
            const response = await responsePromise;
            const responseData = await response.json();

            console.log('\n✅ FORM SUBMITTED SUCCESSFULLY!');
            console.log('📧 Response:', JSON.stringify(responseData, null, 2));

            // Take screenshot of success state
            await page.screenshot({
                path: 'test-screenshots/form-submitted-success.png',
                fullPage: true
            });

            // Verify success message appears
            await expect(submitButton).toContainText(/Submitted|Success/i, { timeout: 10000 });

        } catch (error) {
            console.error('❌ Form submission failed:', error.message);

            // Take screenshot of error state
            await page.screenshot({
                path: 'test-screenshots/form-submission-error.png',
                fullPage: true
            });

            throw error;
        }

        console.log('\n✅ TEST COMPLETE - Form submitted with complete wholesale data');
    });
});
