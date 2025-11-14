/**
 * COMPLETE BUTTON AND LINK AUDIT
 * Tests ALL buttons, CTAs, and links across entire site
 * Reports broken links, missing pages, and functionality issues
 */

const fs = require('fs');
const path = require('path');

// All site HTML files
const HTML_FILES = [
    'index.html',
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
];

console.log('🔍 COMPLETE BUTTON AND LINK AUDIT\n');
console.log('='.repeat(70));
console.log('');

let totalButtons = 0;
let totalLinks = 0;
let brokenLinks = [];
let externalLinks = [];
let emailLinks = [];
let telLinks = [];
const detailedReport = [];

HTML_FILES.forEach(filename => {
    const filepath = path.join(__dirname, filename);

    if (!fs.existsSync(filepath)) {
        console.log(`⚠️  ${filename} - NOT FOUND (skipping)`);
        return;
    }

    const content = fs.readFileSync(filepath, 'utf8');

    console.log(`\n📄 ${filename}`);
    console.log('-'.repeat(70));

    const fileReport = {
        file: filename,
        buttons: [],
        internalLinks: [],
        externalLinks: [],
        emailLinks: [],
        telLinks: [],
        brokenLinks: []
    };

    // Extract all button elements
    const buttonRegex = /<button[^>]*>(.*?)<\/button>/gi;
    let match;
    let fileButtonCount = 0;
    while ((match = buttonRegex.exec(content)) !== null) {
        fileButtonCount++;
        totalButtons++;
        const buttonText = match[1].replace(/<[^>]*>/g, '').trim();
        const buttonHtml = match[0].substring(0, 100);
        fileReport.buttons.push({ text: buttonText, html: buttonHtml });
        console.log(`  🔘 Button: "${buttonText}"`);
    }

    // Extract all anchor links
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let fileLinkCount = 0;
    while ((match = linkRegex.exec(content)) !== null) {
        fileLinkCount++;
        totalLinks++;
        const href = match[1];
        const linkText = match[2].replace(/<[^>]*>/g, '').trim();

        // Categorize link
        if (href.startsWith('mailto:')) {
            emailLinks.push({ file: filename, href, text: linkText });
            fileReport.emailLinks.push({ href, text: linkText });
            console.log(`  📧 Email: ${href}`);
        } else if (href.startsWith('tel:')) {
            telLinks.push({ file: filename, href, text: linkText });
            fileReport.telLinks.push({ href, text: linkText });
            console.log(`  📞 Phone: ${href}`);
        } else if (href.startsWith('http://') || href.startsWith('https://')) {
            externalLinks.push({ file: filename, href, text: linkText });
            fileReport.externalLinks.push({ href, text: linkText });
            console.log(`  🔗 External: ${href} ("${linkText}")`);
        } else if (href.startsWith('#')) {
            // Anchor link within same page
            console.log(`  ⚓ Anchor: ${href} ("${linkText}")`);
        } else {
            // Internal link - check if file exists
            const targetPath = path.join(__dirname, href.split('?')[0].split('#')[0]);
            const exists = fs.existsSync(targetPath);

            if (!exists) {
                brokenLinks.push({ file: filename, href, text: linkText });
                fileReport.brokenLinks.push({ href, text: linkText });
                console.log(`  ❌ BROKEN: ${href} ("${linkText}") - FILE NOT FOUND`);
            } else {
                fileReport.internalLinks.push({ href, text: linkText });
                console.log(`  ✅ Internal: ${href} ("${linkText}")`);
            }
        }
    }

    console.log(`  Summary: ${fileButtonCount} buttons, ${fileLinkCount} links`);
    detailedReport.push(fileReport);
});

// Final Summary
console.log('');
console.log('='.repeat(70));
console.log('📊 FINAL SUMMARY');
console.log('='.repeat(70));
console.log(`Total Buttons: ${totalButtons}`);
console.log(`Total Links: ${totalLinks}`);
console.log(`Email Links: ${emailLinks.length}`);
console.log(`Phone Links: ${telLinks.length}`);
console.log(`External Links: ${externalLinks.length}`);
console.log(`Broken Links: ${brokenLinks.length}`);
console.log('');

// Report broken links
if (brokenLinks.length > 0) {
    console.log('❌ BROKEN LINKS FOUND:');
    brokenLinks.forEach(link => {
        console.log(`  - ${link.file}: ${link.href} ("${link.text}")`);
    });
    console.log('');
}

// Report all email links
if (emailLinks.length > 0) {
    console.log('📧 EMAIL LINKS:');
    const uniqueEmails = [...new Set(emailLinks.map(l => l.href))];
    uniqueEmails.forEach(email => {
        const count = emailLinks.filter(l => l.href === email).length;
        console.log(`  - ${email} (${count} occurrences)`);
    });
    console.log('');
}

// Report external links (for verification)
if (externalLinks.length > 0) {
    console.log('🔗 EXTERNAL LINKS (verify these manually):');
    const uniqueExternal = [...new Set(externalLinks.map(l => l.href))];
    uniqueExternal.forEach(url => {
        const count = externalLinks.filter(l => l.href === url).length;
        console.log(`  - ${url} (${count} occurrences)`);
    });
    console.log('');
}

// Save detailed report
const auditReport = {
    timestamp: new Date().toISOString(),
    totalButtons,
    totalLinks,
    brokenLinksCount: brokenLinks.length,
    details: detailedReport,
    brokenLinks,
    emailLinks,
    telLinks,
    externalLinks
};

fs.writeFileSync(
    path.join(__dirname, 'BUTTON_AUDIT_REPORT.json'),
    JSON.stringify(auditReport, null, 2),
    'utf8'
);

console.log('='.repeat(70));
console.log('📄 Detailed report saved to: BUTTON_AUDIT_REPORT.json');
console.log('');

if (brokenLinks.length > 0) {
    console.log('⚠️  ACTION REQUIRED: Fix broken links listed above');
} else {
    console.log('✅ NO BROKEN LINKS FOUND - All internal links are valid');
}
console.log('');
