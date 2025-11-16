/**
 * CLEANUP OLD DOCUMENTATION FILES
 * Moves outdated/redundant docs to archive folder
 */

const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = path.join(__dirname, 'OLD_DOCUMENTATION_ARCHIVE');

// Files to archive (outdated or redundant)
const filesToArchive = [
    '30_DOLLAR_BUDGET_BUILD_SYSTEM.md',
    'COMPLETE_AUDIT_BEFORE_COMPACTION.md',
    'COMPLETE_IMPLEMENTATION_STATUS.md',
    'COMPLETE_STATUS_RIGHT_NOW.md',
    'CRITICAL_AUDIT_AND_CORRECTIONS.md',
    'DOMAIN_SETUP_GUIDE.md',
    'EQUITY_ASSIGNMENT_CALCULATOR_CORRECT.md',
    'EXECUTE_AFTER_NEXT_COMPACTION.md',
    'FINAL_STATUS.md',
    'FIX_OAUTH_REDIRECT_URI.md',
    'GOOGLE_FORM_COMPLETE.md',
    'GOOGLE_SHEETS_DASHBOARD.md',
    'GOOGLE_SITES_DESIGN.md',
    'HONEST_COMPLETION_REPORT_2025-11-14.md',
    'HONEST_TRUTH_WHAT_IS_NOT_DONE.md',
    'MANITOBA_ASSIGNMENT_CONTRACTS_EXPERT.md',
    'MULTIFAMILY_APARTMENT_ACQUISITION_EXPERT.md',
    'N8N_MCP_INSTALLATION_SUMMARY.md'
];

// Files to KEEP (current and relevant)
const filesToKeep = [
    'README.md',
    'DEPLOYMENT_SUCCESS_REPORT.md',
    'FINAL_AUTONOMOUS_COMPLETION.md',
    'HONEST_VERIFICATION_REPORT.md',
    'SETUP_N8N_WORKFLOW_GUIDE.md',
    'SETUP_GOOGLE_SHEETS_GUIDE.md',
    'SESSION_COMPLETION_SUMMARY.md'
];

console.log('🗂️  CLEANING UP OLD DOCUMENTATION FILES\n');
console.log('='.repeat(70));

// Create archive directory if it doesn't exist
if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR);
    console.log(`✅ Created archive directory: ${ARCHIVE_DIR}\n`);
}

let movedCount = 0;
let errors = 0;

filesToArchive.forEach(filename => {
    const sourcePath = path.join(__dirname, filename);
    const destPath = path.join(ARCHIVE_DIR, filename);

    if (fs.existsSync(sourcePath)) {
        try {
            fs.renameSync(sourcePath, destPath);
            movedCount++;
            console.log(`📦 Archived: ${filename}`);
        } catch (err) {
            errors++;
            console.log(`❌ Error moving ${filename}: ${err.message}`);
        }
    } else {
        console.log(`⚠️  Not found: ${filename}`);
    }
});

console.log('\n' + '='.repeat(70));
console.log('📊 CLEANUP SUMMARY');
console.log('='.repeat(70));
console.log(`Files Archived: ${movedCount}`);
console.log(`Errors: ${errors}`);
console.log(`\nKept in root (current/active):`);
filesToKeep.forEach(f => console.log(`  ✅ ${f}`));

console.log('\n✅ DOCUMENTATION CLEANUP COMPLETE');
console.log('All old files moved to: OLD_DOCUMENTATION_ARCHIVE/');
