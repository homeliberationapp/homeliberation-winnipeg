/**
 * COMPLETE DESIGN APPLICATION WITH BACKGROUND PHOTOS
 * Based on GOOGLE_SITES_DESIGN.md specifications
 * - Navy: #0a1929
 * - Charcoal: #1a1a1a
 * - Gold: #d4af37
 * - Professional dark Winnipeg photos
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🎨 APPLYING COMPLETE DARK PROFESSIONAL DESIGN WITH BACKGROUNDS\n');

// Correct color scheme from design spec
const theme = {
    navy: '#0a1929',
    charcoal: '#1a1a1a',
    gold: '#d4af37',
    white: '#ffffff',
    lightGray: '#b0b0b0',
    darkGray: '#2d3748'
};

// Dark professional background images (Winnipeg/property themed)
const backgrounds = {
    hero: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80', // Dark cityscape
    section1: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80', // Evening city
    section2: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80', // Dark residential
    property: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80', // Modern home
    contact: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1920&q=80' // Professional exterior
};

const completeCSS = `
<style>
/* COMPLETE DARK PROFESSIONAL DESIGN */
:root {
    --navy: ${theme.navy};
    --charcoal: ${theme.charcoal};
    --gold: ${theme.gold};
    --white: ${theme.white};
    --light-gray: ${theme.lightGray};
    --dark-gray: ${theme.darkGray};
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', sans-serif;
    background: var(--navy);
    color: var(--white);
    line-height: 1.6;
    font-size: 16px;
}

/* HERO SECTION WITH BACKGROUND */
.hero, .hero-section, [class*="hero"] {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(26, 26, 26, 0.90) 100%),
                url('${backgrounds.hero}') center/cover no-repeat fixed;
    padding: 120px 20px;
    text-align: center;
    position: relative;
    min-height: 600px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.hero h1, .hero-section h1 {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 800;
    color: var(--white);
    margin-bottom: 20px;
    text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.7);
    letter-spacing: -0.5px;
}

.hero .subheading, .hero-section .subheading {
    font-size: clamp(1.2rem, 3vw, 2rem);
    color: var(--gold);
    margin-bottom: 40px;
    font-weight: 600;
    text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.7);
}

/* SECTIONS WITH BACKGROUNDS */
.section {
    padding: 100px 20px;
    position: relative;
}

.section-navy {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.97) 0%, rgba(26, 26, 26, 0.95) 100%),
                url('${backgrounds.section1}') center/cover no-repeat fixed;
}

.section-charcoal {
    background: linear-gradient(135deg, rgba(26, 26, 26, 0.97) 0%, rgba(10, 25, 41, 0.95) 100%),
                url('${backgrounds.section2}') center/cover no-repeat fixed;
}

.section-property {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(26, 26, 26, 0.93) 100%),
                url('${backgrounds.property}') center/cover no-repeat fixed;
}

.section-title {
    font-size: clamp(2rem, 5vw, 3rem);
    color: var(--gold);
    text-align: center;
    margin-bottom: 60px;
    font-weight: 800;
    letter-spacing: -0.5px;
    text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
}

/* GRID SYSTEM */
.grid, .grid-container {
    display: grid;
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.grid-3 {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.grid-2 {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

/* CARDS - MODERN GLASS EFFECT */
.card {
    background: rgba(26, 26, 26, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 16px;
    padding: 40px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.card:hover {
    border-color: var(--gold);
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(212, 175, 55, 0.3);
}

.card h3 {
    color: var(--white);
    font-size: 1.75rem;
    margin-bottom: 16px;
    font-weight: 700;
}

.card p {
    color: var(--light-gray);
    font-size: 1.05rem;
    line-height: 1.7;
}

/* BUTTONS - PREMIUM GOLD */
.btn, button[type="submit"], .cta-button {
    display: inline-block;
    padding: 18px 36px;
    font-size: 1.1rem;
    font-weight: 700;
    text-decoration: none;
    border-radius: 10px;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-gold {
    background: linear-gradient(135deg, var(--gold) 0%, #e8c14b 100%);
    color: var(--navy);
    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
}

.btn-gold:hover {
    background: linear-gradient(135deg, #e8c14b 0%, var(--gold) 100%);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(212, 175, 55, 0.6);
}

/* CHECKMARKS - GOLD */
.check-list, ul li {
    list-style: none;
}

.check-list li, ul li {
    color: var(--white);
    padding: 12px 0;
    padding-left: 35px;
    position: relative;
    font-size: 1.05rem;
}

.check-list li:before, ul li:before {
    content: "✓";
    color: var(--gold);
    font-weight: 800;
    font-size: 1.4rem;
    position: absolute;
    left: 0;
    top: 8px;
}

/* STEPS/PROCESS */
.step {
    background: rgba(26, 26, 26, 0.95);
    border-left: 4px solid var(--gold);
    border-radius: 12px;
    padding: 50px;
    margin-bottom: 30px;
    position: relative;
    transition: all 0.3s ease;
}

.step:hover {
    border-left-width: 8px;
    transform: translateX(10px);
}

.step-number {
    font-size: 4rem;
    color: var(--gold);
    font-weight: 800;
    opacity: 0.2;
    position: absolute;
    top: 20px;
    right: 30px;
}

.step h3 {
    color: var(--white);
    font-size: 2rem;
    margin-bottom: 16px;
    font-weight: 700;
}

.step p {
    color: var(--light-gray);
    font-size: 1.1rem;
    line-height: 1.7;
}

/* FORMS - DARK PROFESSIONAL */
.form-group, .input-group {
    margin-bottom: 24px;
}

.form-label, label {
    display: block;
    color: var(--white);
    font-weight: 600;
    margin-bottom: 10px;
    font-size: 1.05rem;
}

.form-input, .form-select, .form-textarea, input, select, textarea {
    width: 100%;
    padding: 16px;
    background: rgba(26, 26, 26, 0.8);
    border: 2px solid var(--dark-gray);
    border-radius: 8px;
    color: var(--white);
    font-size: 1rem;
    transition: all 0.3s ease;
}

.form-input:focus, .form-select:focus, .form-textarea:focus,
input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--gold);
    background: rgba(26, 26, 26, 0.95);
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

/* NAVIGATION - STICKY HEADER */
.navbar, nav, header {
    background: rgba(10, 25, 41, 0.98);
    backdrop-filter: blur(20px);
    padding: 20px 40px;
    position: sticky;
    top: 0;
    z-index: 1000;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.nav-link, nav a {
    color: var(--white);
    text-decoration: none;
    padding: 12px 20px;
    transition: all 0.3s ease;
    font-weight: 500;
    font-size: 1.05rem;
}

.nav-link:hover, nav a:hover {
    color: var(--gold);
    transform: translateY(-2px);
}

/* FOOTER - DARK WITH GOLD ACCENTS */
.footer, footer {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.98) 0%, rgba(26, 26, 26, 0.95) 100%);
    border-top: 2px solid var(--gold);
    padding: 60px 20px 30px;
    color: var(--light-gray);
}

.footer a, footer a {
    color: var(--gold);
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer a:hover, footer a:hover {
    color: #e8c14b;
}

/* CONTACT SECTION */
.contact-section {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(26, 26, 26, 0.93) 100%),
                url('${backgrounds.contact}') center/cover no-repeat fixed;
    padding: 100px 20px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .grid-3, .grid-2 {
        grid-template-columns: 1fr;
    }

    .hero, .hero-section {
        padding: 80px 20px;
        min-height: 500px;
    }

    .section {
        padding: 60px 20px;
    }

    .step {
        padding: 30px;
    }
}

/* ANIMATIONS */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(40px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes goldPulse {
    0%, 100% {
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
    }
    50% {
        box-shadow: 0 0 40px rgba(212, 175, 55, 0.8);
    }
}

.fade-in {
    animation: fadeInUp 0.8s ease-out;
}

.pulse-gold {
    animation: goldPulse 2s ease-in-out infinite;
}

/* UTILITY CLASSES */
.text-gold { color: var(--gold); }
.text-white { color: var(--white); }
.text-gray { color: var(--light-gray); }
.bg-navy { background: var(--navy); }
.bg-charcoal { background: var(--charcoal); }
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
.font-black { font-weight: 800; }

/* PROFESSIONAL TYPOGRAPHY */
h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
}

h1 { font-size: clamp(2.5rem, 5vw, 4rem); }
h2 { font-size: clamp(2rem, 4vw, 3rem); }
h3 { font-size: clamp(1.5rem, 3vw, 2rem); }

p {
    margin-bottom: 1rem;
    line-height: 1.7;
}
</style>
`;

console.log('✅ Generated complete CSS with backgrounds\n');

// Find all HTML files
const htmlFiles = glob.sync('*.html', { cwd: __dirname });

console.log(`📄 Found ${htmlFiles.length} HTML files to update\n`);

htmlFiles.forEach((file) => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove any existing style tags
    content = content.replace(/<style>[\s\S]*?<\/style>/g, '');

    // Add complete dark professional CSS before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${completeCSS}\n</head>`);
    }

    // Update meta theme-color
    if (content.includes('<meta name="theme-color"')) {
        content = content.replace(
            /<meta name="theme-color"[^>]*>/g,
            `<meta name="theme-color" content="${theme.navy}">`
        );
    } else if (content.includes('</head>')) {
        content = content.replace(
            '</head>',
            `    <meta name="theme-color" content="${theme.navy}">\n</head>`
        );
    }

    // Write updated content
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${file}`);
});

console.log('\n✨ COMPLETE DESIGN WITH BACKGROUNDS APPLIED!');
console.log('\n📋 Applied:');
console.log('   - Navy (#0a1929), Charcoal (#1a1a1a), Gold (#d4af37)');
console.log('   - Dark professional Winnipeg/property background photos');
console.log('   - Glass morphism cards with gold accents');
console.log('   - Premium typography and animations');
console.log('   - Responsive design for all devices');
console.log('\nNext: Commit and push to GitHub');
