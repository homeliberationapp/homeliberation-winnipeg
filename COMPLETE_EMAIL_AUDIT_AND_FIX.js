/**
 * COMPLETE EMAIL AUDIT AND STANDARDIZATION
 * Updates ALL HTML files to use homeliberationapp@gmail.com
 * Provides detailed reporting of all changes
 */

const fs = require('fs');
const path = require('path');

const CORRECT_EMAIL = 'homeliberationapp@gmail.com';

// All incorrect email patterns to replace
const INCORRECT_PATTERNS = [
    /info@homeliberation\.app/gi,
    /contact@homeliberation\.app/gi,
    /support@homeliberation\.app/gi,
    /hello@homeliberation\.app/gi,
    /team@homeliberation\.app/gi,
    /info@homeliberationwinnipeg\.com/gi,
    /contact@homeliberationwinnipeg\.com/gi,
    /support@homeliberationwinnipeg\.com/gi,
    /hello@homeliberationwinnipeg\.com/gi,
    /team@homeliberationwinnipeg\.com/gi,
    /info@velocityrealestate\.com/gi,
    /contact@velocityrealestate\.com/gi,
    /support@velocityrealestate\.com/gi,
    /hello@velocityrealestate\.com/gi,
    /team@velocityrealestate\.com/gi,
];

// All site HTML files (excluding node_modules, admin, etc.)
const HTML_FILES = [
    'index.html',
    'index_dark.html',
    'about.html',
    'services.html',
    'contact.html',
    'sellers.html',
    'buyers.html',
    'properties.html',
    'foreclosure.html',
    'bankruptcy.html',
    'landlord.html',
    'inherited.html',
    'downsizing.html',
    'quick-sale.html',
    'repairs.html',
    'tax-liens.html',
    'calculator.html',
    'faq.html',
    'terms.html',
    'privacy.html',
    'offline.html',
    'other.html',
    'buyers-list.html',
    'admin-dashboard.html',
    'admin-login.html',
];

console.log('🔍 COMPLETE EMAIL AUDIT AND STANDARDIZATION\n');
console.log('='.repeat(70));
console.log(`Target Email: ${CORRECT_EMAIL}`);
console.log('='.repeat(70));
console.log('');

let totalFilesProcessed = 0;
let totalFilesModified = 0;
let totalReplacements = 0;
const detailedReport = [];

HTML_FILES.forEach(filename => {
    const filepath = path.join(__dirname, filename);

    if (!fs.existsSync(filepath)) {
        console.log(`⚠️  ${filename} - NOT FOUND (skipping)`);
        return;
    }

    totalFilesProcessed++;

    let content = fs.readFileSync(filepath, 'utf8');
    let originalContent = content;
    let fileReplacements = 0;
    const replacementDetails = [];

    // Try each incorrect pattern
    INCORRECT_PATTERNS.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
            const matchedEmail = matches[0]; // Get actual matched string
            const count = matches.length;

            content = content.replace(pattern, CORRECT_EMAIL);
            fileReplacements += count;
            totalReplacements += count;

            replacementDetails.push(`  - ${matchedEmail} → ${CORRECT_EMAIL} (${count}x)`);
        }
    });

    // Save if changed
    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        totalFilesModified++;

        console.log(`✅ ${filename} - ${fileReplacements} replacement(s)`);
        replacementDetails.forEach(detail => console.log(detail));
        console.log('');

        detailedReport.push({
            file: filename,
            replacements: fileReplacements,
            details: replacementDetails
        });
    } else {
        // Check if file already has correct email
        if (content.includes(CORRECT_EMAIL)) {
            console.log(`✓  ${filename} - Already correct`);
        } else {
            console.log(`○  ${filename} - No email found`);
        }
    }
});

console.log('');
console.log('='.repeat(70));
console.log('📊 FINAL SUMMARY');
console.log('='.repeat(70));
console.log(`Files Processed: ${totalFilesProcessed}`);
console.log(`Files Modified: ${totalFilesModified}`);
console.log(`Total Replacements: ${totalReplacements}`);
console.log('');

if (totalFilesModified > 0) {
    console.log('✅ EMAIL STANDARDIZATION COMPLETE');
    console.log('');
    console.log('Files updated:');
    detailedReport.forEach(item => {
        console.log(`  - ${item.file} (${item.replacements} changes)`);
    });
} else {
    console.log('ℹ️  No changes needed - all emails already correct');
}

console.log('');
console.log('='.repeat(70));

// Create audit report file
const auditReport = {
    timestamp: new Date().toISOString(),
    correctEmail: CORRECT_EMAIL,
    filesProcessed: totalFilesProcessed,
    filesModified: totalFilesModified,
    totalReplacements: totalReplacements,
    details: detailedReport
};

fs.writeFileSync(
    path.join(__dirname, 'EMAIL_AUDIT_REPORT.json'),
    JSON.stringify(auditReport, null, 2),
    'utf8'
);

console.log('📄 Detailed report saved to: EMAIL_AUDIT_REPORT.json');
console.log('');
