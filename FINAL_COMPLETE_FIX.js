/**
 * FINAL COMPLETE FIX
 * - Remove urgency banner HTML sections
 * - Remove remaining timeframes
 * - Replace emoji icons with text
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 FINAL COMPLETE FIX\n');

const htmlFiles = glob.sync('*.html', { cwd: __dirname });

htmlFiles.forEach((file) => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove urgency banner sections completely
    content = content.replace(/<!--\s*Urgency Banner\s*-->[\s\S]*?(?=<!--|\<section|\<div class="section"|$)/gi, '');

    // Remove remaining timeframes
    content = content.replace(/in as little as 2-4 weeks/gi, 'on your timeline');
    content = content.replace(/2-4 weeks/gi, 'your timeline');
    content = content.replace(/close in 7 days/gi, 'close on your schedule');

    // Replace emoji icons with professional text icons
    content = content.replace(/🏚️/g, '■');
    content = content.replace(/🔨/g, '▲');
    content = content.replace(/⚡/g, '●');
    content = content.replace(/🏢/g, '◆');
    content = content.replace(/👨‍👩‍👧/g, '♦');
    content = content.replace(/🏡/g, '▪');

    // Fix "property solution" to "Quick Solution"
    content = content.replace(/<h3 class="card-title">property solution<\/h3>/g, '<h3 class="card-title">Quick Property Solution</h3>');

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${file}`);
});

console.log('\n✨ FINAL FIX COMPLETE!');
console.log('\n📋 Removed:');
console.log('   ✅ ALL urgency banner sections');
console.log('   ✅ ALL remaining timeframes');
console.log('   ✅ Emoji icons (replaced with professional symbols)');
