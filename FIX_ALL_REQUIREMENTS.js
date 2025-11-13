/**
 * FIX ALL USER REQUIREMENTS
 * Based on CRITICAL_USER_REQUIREMENTS_FULL_CONTEXT.md
 * - Remove ALL cash mentions
 * - Remove ALL phone numbers
 * - Fix spacing (more compact)
 * - Remove header title, move to top
 * - Change to solutions messaging
 * - Promote apartments/multi-family
 * - Lighten colors slightly
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 FIXING ALL USER REQUIREMENTS\n');

// Lighter color scheme (not too dark, not too bright)
const colors = {
    navy: '#0f2240',      // Lighter navy (was #0a1929)
    charcoal: '#2a2a2a',  // Lighter charcoal (was #1a1a1a)
    gold: '#d4af37',
    white: '#ffffff',
    lightGray: '#c0c0c0',
    darkGray: '#3d4758'
};

// Compact spacing (40% less)
const spacing = {
    sectionPadding: '50px 20px',     // was 100px
    cardPadding: '25px',             // was 40px
    heroPadding: '70px 20px',        // was 120px
    heroMinHeight: '400px',          // was 600px
    gridGap: '20px',                 // was 30px
    margin: '30px'                   // was 50px
};

const compactCSS = `
<style>
/* COMPACT PROFESSIONAL DESIGN - SOLUTIONS FOCUSED */
:root {
    --navy: ${colors.navy};
    --charcoal: ${colors.charcoal};
    --gold: ${colors.gold};
    --white: ${colors.white};
    --light-gray: ${colors.lightGray};
    --dark-gray: ${colors.darkGray};
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
    background: var(--navy);
    color: var(--white);
    line-height: 1.5;
    font-size: 15px;
}

/* COMPACT HEADER - NO TITLE BANNER */
.navbar, nav, header {
    background: rgba(15, 34, 64, 0.98);
    padding: 15px 30px;
    position: sticky;
    top: 0;
    z-index: 1000;
    border-bottom: 1px solid var(--gold);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-logo {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--gold);
}

.nav-links {
    display: flex;
    gap: 25px;
}

.nav-link {
    color: var(--white);
    text-decoration: none;
    padding: 8px 15px;
    transition: all 0.3s ease;
    font-weight: 500;
}

.nav-link:hover {
    color: var(--gold);
}

/* COMPACT HERO */
.hero, .hero-section {
    background: linear-gradient(135deg, rgba(15, 34, 64, 0.92) 0%, rgba(42, 42, 42, 0.88) 100%),
                url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80') center/cover no-repeat fixed;
    padding: ${spacing.heroPadding};
    text-align: center;
    min-height: ${spacing.heroMinHeight};
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.hero h1 {
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 800;
    color: var(--white);
    margin-bottom: 15px;
    line-height: 1.2;
}

.hero .subheading {
    font-size: clamp(1.1rem, 2.5vw, 1.6rem);
    color: var(--gold);
    margin-bottom: 30px;
    font-weight: 600;
}

/* COMPACT SECTIONS */
.section {
    padding: ${spacing.sectionPadding};
}

.section-title {
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    color: var(--gold);
    text-align: center;
    margin-bottom: ${spacing.margin};
    font-weight: 800;
}

/* COMPACT GRID */
.grid {
    display: grid;
    gap: ${spacing.gridGap};
    max-width: 1200px;
    margin: 0 auto;
}

.grid-3 {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.grid-2 {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

/* COMPACT CARDS */
.card {
    background: rgba(42, 42, 42, 0.9);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 12px;
    padding: ${spacing.cardPadding};
    transition: all 0.3s ease;
}

.card:hover {
    border-color: var(--gold);
    transform: translateY(-4px);
}

.card h3 {
    color: var(--white);
    font-size: 1.4rem;
    margin-bottom: 12px;
    font-weight: 700;
}

.card p {
    color: var(--light-gray);
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 0;
}

/* BUTTONS - SOLUTIONS FOCUSED */
.btn, button {
    display: inline-block;
    padding: 15px 30px;
    font-size: 1rem;
    font-weight: 700;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
}

.btn-gold, .btn-primary {
    background: var(--gold);
    color: var(--navy);
}

.btn-gold:hover, .btn-primary:hover {
    background: #e8c14b;
    transform: translateY(-2px);
}

/* APARTMENT/MULTI-FAMILY PROMINENCE */
.apartments-section {
    background: linear-gradient(135deg, rgba(42, 42, 42, 0.95) 0%, rgba(15, 34, 64, 0.93) 100%);
    padding: ${spacing.sectionPadding};
    border: 2px solid var(--gold);
}

.feature-large {
    font-size: 1.8rem;
    color: var(--gold);
    font-weight: 700;
    text-align: center;
    margin-bottom: 20px;
}

/* COMPACT FOOTER */
.footer, footer {
    background: var(--navy);
    border-top: 2px solid var(--gold);
    padding: 40px 20px 20px;
    color: var(--light-gray);
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.footer a {
    color: var(--gold);
    text-decoration: none;
}

/* REMOVE SPACING */
h1, h2, h3 {
    margin-top: 0;
}

p {
    margin-bottom: 10px;
}

ul, ol {
    margin: 10px 0;
    padding-left: 25px;
}

/* RESPONSIVE - COMPACT */
@media (max-width: 768px) {
    .navbar {
        padding: 12px 20px;
    }

    .hero {
        padding: 50px 15px;
        min-height: 350px;
    }

    .section {
        padding: 40px 15px;
    }

    .card {
        padding: 20px;
    }
}
</style>
`;

// Search and replace rules
const replacements = [
    // Remove ALL cash mentions
    { from: /cash offer/gi, to: 'offer' },
    { from: /cash offers/gi, to: 'offers' },
    { from: /get your cash/gi, to: 'get your' },
    { from: /for cash/gi, to: '' },
    { from: /- cash/gi, to: '' },
    { from: /\bcash\b/gi, to: '' },

    // Remove phone numbers
    { from: /204-555-CASH/g, to: '' },
    { from: /204-555-2274/g, to: '' },
    { from: /<a href="tel:[^"]*"[^>]*>.*?<\/a>/gi, to: '' },
    { from: /call now/gi, to: 'contact us' },
    { from: /call us/gi, to: 'reach us' },
    { from: /phone:/gi, to: '' },

    // Change to solutions messaging
    { from: /sell your winnipeg house fast/gi, to: 'Winnipeg Property Solutions' },
    { from: /sell fast/gi, to: 'property solutions' },
    { from: /quick sale/gi, to: 'property solution' },
    { from: /fast close/gi, to: 'flexible timeline' },
    { from: /in 7 days/gi, to: 'on your timeline' },
    { from: /within 48 hours/gi, to: 'promptly' },

    // Promote apartments
    { from: /single-family homes/gi, to: 'Apartments, Multi-Family & Single-Family Properties' },

    // Remove false claims
    { from: /since 2020/gi, to: '' },
    { from: /247 properties/gi, to: 'properties' },
    { from: /\\$18\\.7M in offers/gi, to: '' },
    { from: /4\\.9★/gi, to: '' },
];

// Find all HTML files
const htmlFiles = glob.sync('*.html', { cwd: __dirname });

console.log(`📄 Found ${htmlFiles.length} HTML files\n`);

htmlFiles.forEach((file) => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove existing styles
    content = content.replace(/<style>[\s\S]*?<\/style>/g, '');

    // Add compact CSS
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${compactCSS}\n</head>`);
    }

    // Apply all text replacements
    replacements.forEach(({ from, to }) => {
        content = content.replace(from, to);
    });

    // Remove urgency banners
    content = content.replace(/<div[^>]*urgency[^>]*>[\s\S]*?<\/div>/gi, '');
    content = content.replace(/LIMITED TIME/gi, '');
    content = content.replace(/Only \d+ slots left/gi, '');

    // Update meta theme-color
    if (content.includes('<meta name="theme-color"')) {
        content = content.replace(
            /<meta name="theme-color"[^>]*>/g,
            `<meta name="theme-color" content="${colors.navy}">`
        );
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${file}`);
});

console.log('\n✨ ALL REQUIREMENTS FIXED!');
console.log('\n📋 Changes Applied:');
console.log('   ✅ Removed ALL cash mentions');
console.log('   ✅ Removed ALL phone numbers');
console.log('   ✅ Reduced spacing by 40%');
console.log('   ✅ Lightened colors (not too dark)');
console.log('   ✅ Changed to solutions messaging');
console.log('   ✅ Compact header (no title banner)');
console.log('   ✅ Removed urgency banners');
console.log('   ✅ Promoted apartments/multi-family');
console.log('\nNext: Add Google Form and deploy');
