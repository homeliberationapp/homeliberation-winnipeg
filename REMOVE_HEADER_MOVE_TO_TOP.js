/**
 * REMOVE HEADER COMPLETELY - MOVE INFO TO TOP OF PAGE
 * World-class implementation: Clean, no nav bar, info at page top
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🎨 REMOVING HEADER - MOVING INFO TO PAGE TOP\n');

const htmlFiles = glob.sync('*.html', { cwd: __dirname }).filter(f => f !== 'index_dark.html');

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove the entire <nav> section
    content = content.replace(/<nav>[\s\S]*?<\/nav>/gi, '');

    // Remove nav-related CSS
    content = content.replace(/\/\* Modern Navigation \*\/[\s\S]*?(?=\/\*|\.hero|\.section)/gi, '');
    content = content.replace(/\.nav-[^{]*\{[^}]*\}/g, '');
    content = content.replace(/nav\s*\{[^}]*\}/g, '');
    content = content.replace(/\.logo\s*\{[^}]*\}/g, '');

    // Add top info bar in hero section - find hero opening tag
    const topInfoBar = `
    <!-- Top Info Bar (no header/nav) -->
    <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(15, 34, 64, 0.95);
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #d4af37;
        z-index: 1000;
    ">
        <div style="color: #d4af37; font-weight: 700; font-size: 1.1rem;">
            Home Liberation Winnipeg
        </div>
        <div style="display: flex; gap: 2rem; align-items: center;">
            <a href="mailto:hello@homeliberationwinnipeg.com" style="color: #c0c0c0; text-decoration: none; font-size: 0.95rem;">
                hello@homeliberationwinnipeg.com
            </a>
            <a href="contact.html" style="
                background: #d4af37;
                color: #0f2240;
                padding: 8px 20px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.9rem;
            ">Get Your Offer</a>
        </div>
    </div>
`;

    // Insert at beginning of body
    content = content.replace(/<body>/, '<body>' + topInfoBar);

    // Add padding-top to body to account for fixed top bar
    if (!content.includes('body { padding-top:')) {
        content = content.replace(/body\s*\{/, 'body {\n    padding-top: 50px;');
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file}: Removed header, added top info bar`);
});

console.log('\n✨ HEADER REMOVAL COMPLETE!\n');
console.log('📋 Changes:');
console.log('   ✅ Removed all <nav> headers');
console.log('   ✅ Removed all nav-related CSS');
console.log('   ✅ Added minimal top info bar with:');
console.log('      - Company name (left)');
console.log('      - Email + CTA button (right)');
console.log('   ✅ Clean, professional, world-class design');
console.log('   ✅ No bulky navigation taking up space');
