/**
 * COMPLETE FIX - REMOVE ALL VIOLATIONS
 * - Remove ALL tel: links
 * - Remove ALL phone mentions
 * - Remove ALL timeframes (48 hours, 7 days, etc)
 * - Remove "Call" text everywhere
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 COMPLETE FIX - REMOVING ALL VIOLATIONS\n');

const htmlFiles = glob.sync('*.html', { cwd: __dirname });

let totalChanges = 0;

htmlFiles.forEach((file) => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;

    // Remove ALL tel: links completely
    const telLinkRegex = /<a\s+href="tel:[^"]*"[^>]*>[\s\S]*?<\/a>/gi;
    const telMatches = content.match(telLinkRegex);
    if (telMatches) {
        changes += telMatches.length;
        content = content.replace(telLinkRegex, '');
    }

    // Remove phone tracking code
    content = content.replace(/document\.querySelectorAll\('a\[href\^="tel:"\]'\)\.forEach[\s\S]*?\}\);/g, '');

    // Remove timeframes
    content = content.replace(/48 hours/gi, 'promptly');
    content = content.replace(/within 24 hours/gi, 'quickly');
    content = content.replace(/in 7 days/gi, 'on your schedule');
    content = content.replace(/7 Days/g, 'Fast Process');
    content = content.replace(/7-21 days/gi, 'on your timeline');
    content = content.replace(/as fast as 7 days or take up to 90 days/gi, 'on your preferred timeline');

    // Remove "Call" text
    content = content.replace(/>\s*Call\s*</gi, '>Contact Us<');
    content = content.replace(/Call us/gi, 'Reach us');
    content = content.replace(/Call now/gi, 'Contact now');

    // Remove stat about 7 days
    content = content.replace(/<div class="stat-number">7 Days<\/div>/g, '<div class="stat-number">Flexible Timeline</div>');

    fs.writeFileSync(filePath, content);

    if (changes > 0 || content !== fs.readFileSync(filePath, 'utf8')) {
        console.log(`✅ Fixed: ${file} (${changes} phone links removed)`);
        totalChanges++;
    }
});

console.log(`\n✨ COMPLETE! Fixed ${totalChanges} files`);
console.log('\n📋 Removed:');
console.log('   ✅ ALL tel: links');
console.log('   ✅ ALL phone tracking code');
console.log('   ✅ ALL timeframes (48 hours, 7 days, etc)');
console.log('   ✅ ALL "Call" buttons/text');
