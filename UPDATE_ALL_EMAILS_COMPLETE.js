/**
 * UPDATE ALL EMAIL ADDRESSES ACROSS ENTIRE WEBSITE
 * Ensures homeliberationapp@gmail.com is used everywhere
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const CORRECT_EMAIL = 'homeliberationapp@gmail.com';
const SITE_DIR = __dirname;

console.log('📧 Updating ALL email addresses across website...\n');

// Find ALL HTML files (excluding node_modules)
const htmlFiles = glob.sync('**/*.html', {
    cwd: SITE_DIR,
    ignore: ['node_modules/**', 'test-screenshots/**']
});

// Also check JS files for email addresses
const jsFiles = glob.sync('**/*.js', {
    cwd: SITE_DIR,
    ignore: ['node_modules/**', 'UPDATE_ALL_EMAILS_COMPLETE.js']
});

const allFiles = [...htmlFiles, ...jsFiles];

// All possible incorrect email variations
const INCORRECT_PATTERNS = [
    /info@homeliberation\.app/gi,
    /contact@homeliberation\.app/gi,
    /support@homeliberation\.app/gi,
    /admin@homeliberation\.app/gi,
    /hello@homeliberation\.app/gi,
    /info@homeliberationwinnipeg\.com/gi,
    /contact@homeliberationwinnipeg\.com/gi,
    /info@velocityrealestate\.com/gi,
    /contact@velocityrealestate\.com/gi,
    /hello@winnipegwholesale\.com/gi,
];

let totalUpdates = 0;
let filesUpdated = 0;

allFiles.forEach(file => {
    const filepath = path.join(SITE_DIR, file);

    if (!fs.existsSync(filepath)) {
        return;
    }

    let content = fs.readFileSync(filepath, 'utf8');
    let updated = false;
    let fileChanges = 0;

    // Replace all incorrect email patterns
    INCORRECT_PATTERNS.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            fileChanges += matches.length;
            content = content.replace(pattern, CORRECT_EMAIL);
            updated = true;
        }
    });

    if (updated) {
        fs.writeFileSync(filepath, content, 'utf8');
        filesUpdated++;
        totalUpdates += fileChanges;
        console.log(`✅ ${file} - Updated ${fileChanges} email(s)`);
    }
});

console.log('\n' + '='.repeat(70));
console.log(`✅ EMAIL UPDATE COMPLETE!`);
console.log(`   Total emails updated: ${totalUpdates}`);
console.log(`   Files modified: ${filesUpdated}`);
console.log(`   Correct email: ${CORRECT_EMAIL}`);
console.log('='.repeat(70) + '\n');
