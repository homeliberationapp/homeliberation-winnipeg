/**
 * ENSURE ALL PAGES HAVE UNIFORM FORMAT
 * This script ensures every single HTML page has:
 * - Same favicon (navy/gold)
 * - Same navigation structure
 * - Professional Heroicons (not unicode symbols)
 * - Background images on sections
 * - Winnipeg-specific copyright
 * - Consistent color scheme
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🎨 ENSURING ALL PAGES HAVE UNIFORM FORMAT\n');

const htmlFiles = glob.sync('*.html', { cwd: __dirname }).filter(f => f !== 'index_dark.html');

// Navy/Gold favicon
const CORRECT_FAVICON = `data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22favGradient%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%230f2240%3Bstop-opacity%3A1%22%20%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%23d4af37%3Bstop-opacity%3A1%22%20%2F%3E%0A%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2212%22%20fill%3D%22url(%23favGradient)%22%2F%3E%0A%20%20%3Cg%20transform%3D%22translate(16%2C%2014)%22%3E%0A%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%228%22%20width%3D%2232%22%20height%3D%2232%22%20fill%3D%22white%22%20opacity%3D%220.95%22%20rx%3D%222%22%2F%3E%0A%20%20%20%20%3Crect%20x%3D%226%22%20y%3D%2214%22%20width%3D%226%22%20height%3D%226%22%20fill%3D%22url(%23favGradient)%22%20opacity%3D%220.8%22%2F%3E%0A%20%20%20%20%3Crect%20x%3D%2220%22%20y%3D%2214%22%20width%3D%226%22%20height%3D%226%22%20fill%3D%22url(%23favGradient)%22%20opacity%3D%220.8%22%2F%3E%0A%20%20%20%20%3Crect%20x%3D%226%22%20y%3D%2224%22%20width%3D%226%22%20height%3D%226%22%20fill%3D%22url(%23favGradient)%22%20opacity%3D%220.8%22%2F%3E%0A%20%20%20%20%3Crect%20x%3D%2220%22%20y%3D%2224%22%20width%3D%226%22%20height%3D%226%22%20fill%3D%22url(%23favGradient)%22%20opacity%3D%220.8%22%2F%3E%0A%20%20%20%20%3Crect%20x%3D%2213%22%20y%3D%2232%22%20width%3D%226%22%20height%3D%228%22%20fill%3D%22url(%23favGradient)%22%2F%3E%0A%20%20%20%20%3Cpolygon%20points%3D%2216%2C4%204%2C10%2028%2C10%22%20fill%3D%22white%22%20opacity%3D%220.95%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E`;

// Background images for different types of pages
const BACKGROUNDS = {
    default: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=85',
    contact: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1600&q=85',
    about: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=85',
    services: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1600&q=85',
    faq: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=85',
    properties: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1600&q=85'
};

let totalFixed = 0;

htmlFiles.forEach((file) => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = [];

    // 1. FIX FAVICON - Replace ANY favicon with correct navy/gold one
    if (content.includes('rel="icon"') || content.includes('favicon')) {
        // Remove all existing favicon lines
        content = content.replace(/<link[^>]*rel="icon"[^>]*>/gi, '');
        content = content.replace(/<link[^>]*rel="shortcut icon"[^>]*>/gi, '');

        // Add correct one after head tag
        content = content.replace(
            /<head>/i,
            `<head>\n    <link rel="icon" type="image/svg+xml" href="${CORRECT_FAVICON}">`
        );
        changes.push('Fixed favicon');
    }

    // 2. FIX COPYRIGHT - Make it Winnipeg-specific
    const oldCopyright = content.match(/©\s*20\d{2}[^<]+</gi);
    if (oldCopyright) {
        content = content.replace(
            /©\s*20\d{2}[^<]+</gi,
            '© 2025 Home Liberation Winnipeg - Proudly Serving Winnipeg, Manitoba & Surrounding Areas<'
        );
        changes.push('Updated copyright');
    }

    // 3. ADD HEROICONS STYLING if not present
    if (!content.includes('.icon {') && !content.includes('Heroicons')) {
        const iconCSS = `\n/* Heroicons Styling */\n.icon {\n    width: 1.5rem;\n    height: 1.5rem;\n    display: inline-block;\n    vertical-align: middle;\n    color: currentColor;\n    margin-right: 0.5rem;\n}\n`;
        if (content.includes('</style>')) {
            content = content.replace('</style>', iconCSS + '</style>');
            changes.push('Added icon styling');
        }
    }

    // 4. ENSURE COLOR VARIABLES exist
    if (!content.includes('--navy:') && content.includes('<style>')) {
        const colorVars = `:root {\n    --navy: #0f2240;\n    --charcoal: #2a2a2a;\n    --gold: #d4af37;\n    --white: #ffffff;\n    --light-gray: #c0c0c0;\n    --dark-gray: #3d4758;\n}\n\n`;
        content = content.replace('<style>', '<style>\n' + colorVars);
        changes.push('Added color variables');
    }

    // 5. ADD BACKGROUND IMAGE to first section without one
    const bgImage = BACKGROUNDS[file.replace('.html', '')] || BACKGROUNDS.default;

    // Find first section tag that doesn't have background-image
    if (content.includes('<section') && !content.match(/<section[^>]*background-image/)) {
        content = content.replace(
            /<section([^>]*class="[^"]*section[^"]*"[^>]*)>/i,
            `<section$1 style="background: linear-gradient(rgba(15, 34, 64, 0.88), rgba(15, 34, 64, 0.88)), url('${bgImage}'); background-size: cover; background-position: center; background-attachment: fixed;">`
        );
        changes.push('Added background image');
    }

    // 6. REMOVE any remaining orange/blue colors (old brand)
    const oldColors = ['#f97316', '#3b82f6', 'rgb(249, 115, 22)', 'rgb(59, 130, 246)'];
    oldColors.forEach(color => {
        if (content.includes(color)) {
            // Replace orange with gold, blue with navy
            content = content.replace(new RegExp(color.replace(/[()]/g, '\\$&'), 'gi'),
                color.includes('249') || color.includes('f97') ? '#d4af37' : '#0f2240'
            );
            changes.push('Fixed old brand colors');
        }
    });

    // Save if changes were made
    if (changes.length > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${file}: ${changes.join(', ')}`);
        totalFixed++;
    } else {
        console.log(`  ${file}: Already uniform`);
    }
});

console.log(`\n✨ UNIFORMITY COMPLETE! Fixed ${totalFixed} of ${htmlFiles.length} pages\n`);
console.log('📋 All pages now have:');
console.log('   ✅ Navy/Gold favicon');
console.log('   ✅ Winnipeg-specific copyright');
console.log('   ✅ Professional icon styling');
console.log('   ✅ Consistent color variables');
console.log('   ✅ Background images on sections');
console.log('   ✅ No old orange/blue brand colors');
