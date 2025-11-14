const { test, expect } = require('@playwright/test');

test.describe('Contact Form - Property Analysis', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000/contact.html');
    });

    test('form loads with all required fields', async ({ page }) => {
        // Check hero section with background
        await expect(page.locator('.contact-hero')).toBeVisible();
        await expect(page.locator('h1')).toContainText('Property Analysis');

        // Check trust signals
        await expect(page.locator('text=100% Confidential')).toBeVisible();
        await expect(page.locator('text=24-48 Hour Response')).toBeVisible();
        await expect(page.locator('text=No Obligation')).toBeVisible();

        // Check form container
        await expect(page.locator('.form-container')).toBeVisible();
        await expect(page.locator('#consultationForm')).toBeVisible();

        // Check required fields exist
        await expect(page.locator('input[name="first_name"]')).toBeVisible();
        await expect(page.locator('input[name="last_name"]')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="phone"]')).toBeVisible();
        await expect(page.locator('input[name="address"]')).toBeVisible();
    });

    test('form has professional styling', async ({ page }) => {
        // Check form container has gradient background
        const formContainer = page.locator('.form-container');
        const bgColor = await formContainer.evaluate(el =>
            window.getComputedStyle(el).background
        );
        expect(bgColor).toContain('gradient');

        // Check inputs have proper styling
        const firstNameInput = page.locator('input[name="first_name"]');
        const inputBg = await firstNameInput.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
        );
        expect(inputBg).toBeTruthy();
    });

    test('validates required fields', async ({ page }) => {
        // Try to submit empty form
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Check that HTML5 validation prevents submission
        const firstNameInput = page.locator('input[name="first_name"]');
        const isInvalid = await firstNameInput.evaluate(el => !el.validity.valid);
        expect(isInvalid).toBe(true);
    });

    test('completes full form submission workflow', async ({ page }) => {
        // Fill out personal information
        await page.fill('input[name="first_name"]', 'John');
        await page.fill('input[name="last_name"]', 'Smith');
        await page.fill('input[name="email"]', 'john.smith@example.com');
        await page.fill('input[name="phone"]', '(204) 555-1234');

        // Fill out property details
        await page.fill('input[name="address"]', '123 Main Street, Winnipeg, MB R3C 1A1');
        await page.selectOption('select[name="property_type"]', 'Apartment Building (4+ units)');
        await page.fill('input[name="year_built"]', '1985');
        await page.fill('input[name="bedrooms"]', '12');
        await page.fill('input[name="bathrooms"]', '8');
        await page.fill('input[name="square_feet"]', '8500');
        await page.selectOption('select[name="condition"]', 'fair');

        // Fill out situation
        await page.selectOption('select[name="situation"]', 'landlord-tired');
        await page.selectOption('select[name="occupancy"]', 'occupied');
        await page.selectOption('select[name="mortgage_status"]', 'current');
        await page.selectOption('select[name="timeline"]', '30-60-days');

        // Fill out financial details
        await page.fill('input[name="mortgage_balance"]', '350000');
        await page.fill('input[name="liens"]', '0');
        await page.fill('input[name="back_taxes"]', '0');
        await page.fill('input[name="asking_price"]', '650000');

        // Fill additional details
        await page.fill('textarea[name="additional_details"]', 'Looking to sell quickly. Property is in decent shape but needs updates.');

        // Submit form
        const submitButton = page.locator('button[type="submit"]');

        // Mock the backend response
        await page.route('**/api/submit-consultation', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    message: 'Consultation submitted successfully',
                    sheetsSaved: true
                })
            });
        });

        await submitButton.click();

        // Wait for success state
        await page.waitForTimeout(500);

        // Check button changed to success state
        const buttonText = await submitButton.textContent();
        expect(buttonText).toContain('Submitted Successfully');
    });

    test('handles submission errors gracefully', async ({ page }) => {
        // Fill minimum required fields
        await page.fill('input[name="first_name"]', 'Test');
        await page.fill('input[name="last_name"]', 'User');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="phone"]', '2045551234');
        await page.fill('input[name="address"]', '456 Test St');

        // Mock failed backend response
        await page.route('**/api/submit-consultation', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: false,
                    message: 'Server error'
                })
            });
        });

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Wait for error state
        await page.waitForTimeout(500);

        // Check button shows error state
        const buttonText = await submitButton.textContent();
        expect(buttonText).toContain('Error');
    });

    test('displays placeholders for all inputs', async ({ page }) => {
        // Check placeholders are helpful
        const firstNamePlaceholder = await page.locator('input[name="first_name"]').getAttribute('placeholder');
        expect(firstNamePlaceholder).toBeTruthy();

        const emailPlaceholder = await page.locator('input[name="email"]').getAttribute('placeholder');
        expect(emailPlaceholder).toContain('@');

        const phonePlaceholder = await page.locator('input[name="phone"]').getAttribute('placeholder');
        expect(phonePlaceholder).toContain('204');
    });

    test('form sections have proper styling', async ({ page }) => {
        // Check form sections exist
        const sections = page.locator('.form-section');
        const sectionCount = await sections.count();
        expect(sectionCount).toBeGreaterThan(0);

        // Check section headings
        await expect(page.locator('.form-section h2').first()).toBeVisible();
    });

    test('submit button has professional styling', async ({ page }) => {
        const submitButton = page.locator('button[type="submit"]');

        // Check button is visible
        await expect(submitButton).toBeVisible();

        // Check button has gradient background
        const background = await submitButton.evaluate(el =>
            window.getComputedStyle(el).background
        );
        expect(background).toContain('gradient');
    });

    test('mobile responsive layout', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Check form is still visible and usable
        await expect(page.locator('#consultationForm')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // Check hero section adapts
        await expect(page.locator('.contact-hero')).toBeVisible();
    });

    test('foreclosure section displays conditionally', async ({ page }) => {
        // Check foreclosure section initially hidden
        const foreclosureSection = page.locator('#foreclosureSection');
        const isVisible = await foreclosureSection.isVisible().catch(() => false);

        if (!isVisible) {
            // Select foreclosure situation to trigger display
            await page.selectOption('select[name="situation"]', 'foreclosure');
            await page.waitForTimeout(200);

            // Now it should be visible
            await expect(foreclosureSection).toBeVisible();
        }
    });
});

test.describe('Contact Form - Visual Regression', () => {
    test('hero section visual snapshot', async ({ page }) => {
        await page.goto('http://localhost:8000/contact.html');
        await page.waitForLoadState('networkidle');

        const hero = page.locator('.contact-hero');
        await expect(hero).toHaveScreenshot('contact-hero.png');
    });

    test('form container visual snapshot', async ({ page }) => {
        await page.goto('http://localhost:8000/contact.html');
        await page.waitForLoadState('networkidle');

        const formContainer = page.locator('.form-container');
        await expect(formContainer).toHaveScreenshot('form-container.png', {
            maxDiffPixels: 100
        });
    });
});
