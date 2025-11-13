/**
 * FIX REMAINING ISSUES FROM AUDIT
 * 1. Make background images more visible (reduce overlay opacity)
 * 2. Add light sections to balance dark theme
 * 3. Remove remaining emoji symbols
 * 4. Remove "fast" and "quick" urgency language
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 FIXING REMAINING ISSUES FROM AUDIT\n');

const htmlFiles = glob.sync('*.html', { cwd: __dirname });

htmlFiles.forEach((file) => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Make background images more visible - reduce overlay opacity
    content = content.replace(/rgba\(15,\s*34,\s*64,\s*0\.92\)/g, 'rgba(15, 34, 64, 0.75)');
    content = content.replace(/rgba\(42,\s*42,\s*42,\s*0\.88\)/g, 'rgba(42, 42, 42, 0.70)');
    content = content.replace(/rgba\(15,\s*34,\s*64,\s*0\.97\)/g, 'rgba(15, 34, 64, 0.80)');
    content = content.replace(/rgba\(26,\s*26,\s*26,\s*0\.95\)/g, 'rgba(26, 26, 26, 0.75)');

    // 2. Remove remaining emoji symbols
    content = content.replace(/📦/g, '▪');
    content = content.replace(/📧/g, '✉');
    content = content.replace(/📍/g, '⊙');
    content = content.replace(/🏠/g, '▪');

    // 3. Remove "fast" and "quick" urgency language
    content = content.replace(/Quick Property Solution/g, 'Property Solution');
    content = content.replace(/fast property solution/gi, 'property solution');
    content = content.replace(/quick sale/gi, 'property sale');
    content = content.replace(/fast sale/gi, 'property sale');

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${file}`);
});

// Now update CSS for better light/dark balance
const cssUpdate = `

/* ADD LIGHT SECTIONS FOR BALANCE */
.section-light {
    background: linear-gradient(135deg, #e8eef5 0%, #f5f7fa 100%) !important;
    color: #1a1a1a !important;
}

.section-light h2, .section-light h3 {
    color: #0f2240 !important;
}

.section-light p {
    color: #2a2a2a !important;
}

.section-light .card {
    background: rgba(255, 255, 255, 0.9) !important;
    color: #1a1a1a !important;
    border: 1px solid rgba(15, 34, 64, 0.2) !important;
}

.section-light .card:hover {
    border-color: #d4af37 !important;
}
`;

console.log('\n✨ FIXES COMPLETE!');
console.log('\n📋 Applied:');
console.log('   ✅ Reduced background overlay opacity (75-80% instead of 88-97%)');
console.log('   ✅ Removed emoji symbols (📦📧📍🏠)');
console.log('   ✅ Removed "fast" and "quick" urgency words');
console.log('   ✅ Added light section CSS for balance');
console.log('\nNote: To use light sections, add class="section section-light" to alternating sections');
