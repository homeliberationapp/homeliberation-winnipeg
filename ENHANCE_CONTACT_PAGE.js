/**
 * ENHANCE CONTACT PAGE - Professional Visual Design + Copywriting
 * Adds background images, improves copy, connects to Google Sheets
 */

const fs = require('fs');
const path = require('path');

const contactFile = path.join(__dirname, 'contact.html');
let html = fs.readFileSync(contactFile, 'utf8');

// 1. ADD HERO BACKGROUND IMAGE
const heroSection = html.match(/<div class="container">\s*<h1>/);
if (heroSection) {
    // Add background image to hero section
    const heroStyle = `
    <style>
        .contact-hero {
            background: linear-gradient(rgba(15, 34, 64, 0.88), rgba(15, 34, 64, 0.92)),
                        url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=85');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            padding: 4rem 0 3rem 0;
            margin-top: 60px;
        }

        .form-container {
            background: linear-gradient(135deg, rgba(15, 34, 64, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
            border-radius: 16px;
            padding: 3rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .form-section {
            background: rgba(30,41,59,0.4) !important;
            border: 1px solid rgba(212, 175, 55, 0.15) !important;
            margin-bottom: 2.5rem !important;
            padding: 2rem !important;
            border-radius: 12px !important;
        }

        .form-section h2 {
            color: #d4af37 !important;
            font-size: 1.5rem !important;
            margin-bottom: 0.5rem !important;
            font-weight: 700 !important;
        }

        .form-section > p {
            color: rgba(255,255,255,0.8) !important;
            font-size: 0.95rem !important;
            margin-bottom: 1.5rem !important;
        }

        input[type="text"],
        input[type="email"],
        input[type="tel"],
        input[type="number"],
        select,
        textarea {
            background: rgba(15, 34, 64, 0.6) !important;
            border: 1px solid rgba(212, 175, 55, 0.3) !important;
            color: white !important;
            padding: 0.875rem 1rem !important;
            border-radius: 8px !important;
            transition: all 0.3s ease !important;
        }

        input:focus,
        select:focus,
        textarea:focus {
            border-color: #d4af37 !important;
            box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1) !important;
            outline: none !important;
        }

        button[type="submit"] {
            background: linear-gradient(135deg, #d4af37 0%, #f4c542 100%) !important;
            color: #0f2240 !important;
            padding: 1.25rem 3rem !important;
            font-size: 1.125rem !important;
            font-weight: 700 !important;
            border-radius: 12px !important;
            border: none !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4) !important;
        }

        button[type="submit"]:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 30px rgba(212, 175, 55, 0.6) !important;
        }

        .required {
            color: #f97316 !important;
        }

        label {
            color: rgba(255,255,255,0.95) !important;
            font-weight: 600 !important;
            font-size: 0.95rem !important;
            margin-bottom: 0.5rem !important;
            display: block !important;
        }
    </style>
    `;

    html = html.replace('</head>', heroStyle + '</head>');
}

// 2. WRAP CONTENT IN HERO SECTION
html = html.replace(
    /<div class="container">\s*<h1>/,
    '<div class="contact-hero"><div class="container"><h1>'
);

// Find closing of container and add hero close
const lastContainerClose = html.lastIndexOf('</div>\n\n    <footer');
if (lastContainerClose > 0) {
    html = html.substring(0, lastContainerClose) + '</div></div>' + html.substring(lastContainerClose + 6);
}

// 3. WRAP FORM IN FORM-CONTAINER
html = html.replace(
    '<form id="consultationForm">',
    '<div class="form-container"><form id="consultationForm">'
);

html = html.replace(
    '</form>',
    '</form></div>'
);

// 4. IMPROVE HERO COPY
html = html.replace(
    /<h1>Start Your Free <span class="highlight">Consultation<\/span><\/h1>/,
    '<h1 style="font-size: 3rem; font-weight: 900; margin-bottom: 1rem;">Get Your Free <span class="highlight">Property Analysis</span></h1>'
);

html = html.replace(
    /<p class="subtitle">\s*Fill out the form.*?<\/p>/s,
    `<p class="subtitle" style="font-size: 1.25rem; color: rgba(255,255,255,0.9); max-width: 700px; margin: 0 auto 3rem auto; line-height: 1.6;">
        Tell us about your property and situation. We'll analyze it and provide you with a comprehensive property solution within 24-48 hours. <strong style="color: #d4af37;">Completely confidential, no obligation.</strong>
    </p>`
);

// 5. ADD GOOGLE SHEETS CONNECTION TO FORM
const formSubmitScript = `
<script>
document.getElementById('consultationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
        // Send to backend
        const response = await fetch('/api/submit-consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            // Show success message
            submitBtn.textContent = '✓ Submitted Successfully!';
            submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

            // Redirect to thank you page after 2 seconds
            setTimeout(() => {
                window.location.href = '/thank-you.html';
            }, 2000);
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        submitBtn.textContent = '✗ Error - Please Try Again';
        submitBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        submitBtn.disabled = false;

        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
        }, 3000);
    }
});
</script>
`;

html = html.replace('</body>', formSubmitScript + '</body>');

// 6. IMPROVE PLACEHOLDERS
const placeholders = {
    'name="first_name"': 'placeholder="John"',
    'name="last_name"': 'placeholder="Smith"',
    'name="email"': 'placeholder="john.smith@email.com"',
    'name="phone"': 'placeholder="(204) 555-1234"',
    'name="address"': 'placeholder="123 Main Street, Winnipeg, MB R3C 1A1"',
    'name="year_built"': 'placeholder="e.g., 1985"',
    'name="bedrooms"': 'placeholder="3"',
    'name="bathrooms"': 'placeholder="2"',
    'name="square_feet"': 'placeholder="1,500"',
    'name="mortgage_balance"': 'placeholder="$150,000"',
    'name="liens"': 'placeholder="$5,000"',
    'name="back_taxes"': 'placeholder="$2,500"',
    'name="asking_price"': 'placeholder="$275,000"',
};

for (const [name, placeholder] of Object.entries(placeholders)) {
    const regex = new RegExp(`(<input[^>]*${name}[^>]*)(>)`, 'g');
    html = html.replace(regex, (match, p1, p2) => {
        if (!p1.includes('placeholder=')) {
            return `${p1} ${placeholder}${p2}`;
        }
        return match;
    });
}

// 7. ADD TRUST SIGNALS
const trustSignals = `
<div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 2rem; margin: 2rem 0; text-align: center;">
    <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 2rem;">
        <div>
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔒</div>
            <div style="font-weight: 700; color: #d4af37; margin-bottom: 0.25rem;">100% Confidential</div>
            <div style="font-size: 0.875rem; color: rgba(255,255,255,0.7);">Your information is secure</div>
        </div>
        <div>
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚡</div>
            <div style="font-weight: 700; color: #d4af37; margin-bottom: 0.25rem;">24-48 Hour Response</div>
            <div style="font-size: 0.875rem; color: rgba(255,255,255,0.7);">Fast professional analysis</div>
        </div>
        <div>
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">✓</div>
            <div style="font-weight: 700; color: #d4af37; margin-bottom: 0.25rem;">No Obligation</div>
            <div style="font-size: 0.875rem; color: rgba(255,255,255,0.7);">Free consultation always</div>
        </div>
    </div>
</div>
`;

html = html.replace(
    '<div class="form-container"><form',
    trustSignals + '<div class="form-container"><form'
);

// 8. Save enhanced file
fs.writeFileSync(contactFile, html);
console.log('✅ Contact page enhanced with professional design!');
console.log('   - Background images added');
console.log('   - Copywriting improved');
console.log('   - Visual styling enhanced');
console.log('   - Trust signals added');
console.log('   - Google Sheets connection added');
