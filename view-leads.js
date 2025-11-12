/**
 * Lead Viewer - View all captured leads
 * Run with: node view-leads.js
 */

const fs = require('fs');
const path = require('path');

const leadsDir = './leads';

console.log('\n📋 CAPTURED LEADS\n');
console.log('='.repeat(80));

// Check if leads directory exists
if (!fs.existsSync(leadsDir)) {
    console.log('❌ No leads directory found');
    console.log('📝 Leads will be created when forms are submitted\n');
    process.exit(0);
}

// Read all lead files
const files = fs.readdirSync(leadsDir).filter(f => f.endsWith('.json'));

if (files.length === 0) {
    console.log('📭 No leads yet');
    console.log('✅ System is ready to capture leads when forms are submitted\n');
    process.exit(0);
}

console.log(`📊 Total Leads: ${files.length}\n`);

// Sort files by timestamp (newest first)
files.sort().reverse();

// Display each lead
files.forEach((file, index) => {
    const filePath = path.join(leadsDir, file);
    const lead = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const timestamp = new Date(parseInt(file.replace('lead-', '').replace('.json', '')));

    console.log(`\n${'─'.repeat(80)}`);
    console.log(`LEAD #${index + 1} - ${timestamp.toLocaleString()}`);
    console.log('─'.repeat(80));

    console.log(`\n👤 CONTACT:`);
    console.log(`   Name: ${lead.fullName || 'N/A'}`);
    console.log(`   Email: ${lead.email || 'N/A'}`);
    console.log(`   Phone: ${lead.phone || 'N/A'}`);
    console.log(`   Best Time: ${lead.preferredContact || 'N/A'}`);

    console.log(`\n🏠 PROPERTY:`);
    console.log(`   Address: ${lead.address || 'N/A'}`);
    console.log(`   City: ${lead.city || 'N/A'}`);
    console.log(`   Postal Code: ${lead.postalCode || 'N/A'}`);
    console.log(`   Type: ${lead.propertyType || 'N/A'}`);
    console.log(`   Bedrooms: ${lead.bedrooms || 'N/A'}`);
    console.log(`   Bathrooms: ${lead.bathrooms || 'N/A'}`);
    console.log(`   Sq Ft: ${lead.squareFeet || 'N/A'}`);
    console.log(`   Year Built: ${lead.yearBuilt || 'N/A'}`);

    console.log(`\n📝 SITUATION:`);
    console.log(`   Reason: ${lead.sellReason || 'N/A'}`);
    console.log(`   Timeline: ${lead.timeline || 'N/A'}`);
    console.log(`   Condition: ${lead.propertyCondition || 'N/A'}`);
    console.log(`   Mortgage: ${lead.hasMortgage || 'N/A'}`);

    if (lead.mortgageBalance) {
        console.log(`   Mortgage Balance: $${lead.mortgageBalance}`);
    }
    if (lead.priceExpectation) {
        console.log(`   Price Expectation: $${lead.priceExpectation}`);
    }

    if (lead.repairsNeeded) {
        console.log(`\n🔧 REPAIRS NEEDED:`);
        console.log(`   ${lead.repairsNeeded}`);
    }

    if (lead.additionalInfo) {
        console.log(`\n💬 ADDITIONAL INFO:`);
        console.log(`   ${lead.additionalInfo}`);
    }

    console.log(`\n📄 File: ${file}`);
});

console.log(`\n${'='.repeat(80)}`);
console.log(`\n✅ Showing ${files.length} lead(s)\n`);
console.log(`📁 Location: ${path.resolve(leadsDir)}\n`);
