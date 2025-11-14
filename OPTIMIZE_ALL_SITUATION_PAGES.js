/**
 * OPTIMIZE ALL SITUATION PAGES FOR WHOLESALE
 * Adds wholesale-specific messaging to each situation page
 */

const fs = require('fs');
const path = require('path');

const situationPages = [
    {
        file: 'foreclosure.html',
        wholesale: {
            headline: 'Stop Foreclosure with a Fast Cash Offer',
            subheadline: 'We buy houses in foreclosure - close before auction, protect your credit, walk away with cash',
            value: 'No realtor fees, no repairs, cash in days not months'
        }
    },
    {
        file: 'landlord.html',
        wholesale: {
            headline: 'Tired of Being a Landlord? We Buy Rental Properties',
            subheadline: 'Sell your rental property AS-IS - tenants, repairs, and all. Get cash and move on',
            value: 'Buy multi-family buildings, apartments, and single rentals'
        }
    },
    {
        file: 'inherited.html',
        wholesale: {
            headline: 'Inherited a House? Sell for Cash Without the Hassle',
            subheadline: 'We buy inherited properties AS-IS - no cleaning, no repairs, fast closing',
            value: 'Skip probate delays, avoid family disputes, get fair cash offer'
        }
    },
    {
        file: 'bankruptcy.html',
        wholesale: {
            headline: 'Selling Your Home Due to Bankruptcy? We Can Help',
            subheadline: 'Fast cash offers for homes in bankruptcy - work with your trustee, close quickly',
            value: 'Preserve equity, avoid foreclosure, fresh start with cash'
        }
    },
    {
        file: 'downsizing.html',
        wholesale: {
            headline: 'Downsizing? Sell Your House Fast for Cash',
            subheadline: 'No showings, no staging, no waiting. Cash offer and close on your timeline',
            value: 'Perfect for retirees, empty nesters, life transitions'
        }
    },
    {
        file: 'repairs.html',
        wholesale: {
            headline: 'Sell Your House AS-IS - No Repairs Needed',
            subheadline: 'We buy houses in any condition - foundation issues, roof damage, fire, flood, anything',
            value: 'Save thousands on repairs, close as-is, get cash now'
        }
    },
    {
        file: 'quick-sale.html',
        wholesale: {
            headline: 'Need to Sell Your House Quickly? Get Cash in 7 Days',
            subheadline: 'Job relocation, divorce, emergency - we close fast with cash',
            value: 'No waiting for buyer financing, guaranteed close, cash in hand'
        }
    },
    {
        file: 'tax-liens.html',
        wholesale: {
            headline: 'Behind on Property Taxes? We Buy Houses with Tax Liens',
            subheadline: 'We pay off back taxes and liens, give you cash, save your property from seizure',
            value: 'Stop tax sale, protect credit, walk away with money'
        }
    }
];

console.log('🔧 OPTIMIZING SITUATION PAGES FOR WHOLESALE\n');
console.log('='.repeat(70));

let filesUpdated = 0;
let totalChanges = 0;

situationPages.forEach(page => {
    const filepath = path.join(__dirname, page.file);

    if (!fs.existsSync(filepath)) {
        console.log(`⚠️  ${page.file} - NOT FOUND`);
        return;
    }

    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;
    let changeCount = 0;

    // Pattern 1: Update generic headlines to wholesale-specific
    const headlinePattern = /<h1[^>]*>([^<]+)<\/h1>/i;
    if (headlinePattern.test(content)) {
        content = content.replace(headlinePattern, `<h1 style="color: white; font-size: 2.5rem; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
            ${page.wholesale.headline}
        </h1>`);
        changed = true;
        changeCount++;
    }

    // Pattern 2: Add wholesale value proposition if missing
    if (!content.includes('CASH') || !content.includes('AS-IS')) {
        const heroEndPattern = /<\/section><!-- (?:Hero|hero)/i;
        if (heroEndPattern.test(content)) {
            const valueProposition = `
        <div style="max-width: 800px; margin: 2rem auto; padding: 1.5rem; background: rgba(212, 175, 55, 0.15); border-left: 4px solid #d4af37; border-radius: 8px;">
            <h3 style="color: #d4af37; margin-bottom: 0.5rem;">💰 Wholesale Cash Offer</h3>
            <p style="color: white; margin-bottom: 0;">${page.wholesale.value}</p>
        </div>
    `;
            content = content.replace(heroEndPattern, `${valueProposition}\n    </section><!-- Hero`);
            changed = true;
            changeCount++;
        }
    }

    // Pattern 3: Update CTAs to wholesale language
    const genericCTAs = [
        { old: /Get Your Free Consultation/gi, new: 'Get Your CASH Offer Now' },
        { old: /Schedule Consultation/gi, new: 'Get CASH Offer' },
        { old: /Contact Us Today/gi, new: 'Get Your Cash Offer' },
        { old: /Learn More →/gi, new: 'Get Cash Offer →' }
    ];

    genericCTAs.forEach(cta => {
        if (cta.old.test(content)) {
            content = content.replace(cta.old, cta.new);
            changed = true;
            changeCount++;
        }
    });

    if (changed) {
        fs.writeFileSync(filepath, content, 'utf8');
        filesUpdated++;
        totalChanges += changeCount;
        console.log(`✅ ${page.file} - ${changeCount} wholesale optimization(s)`);
        console.log(`   Headline: "${page.wholesale.headline.substring(0, 50)}..."`);
    } else {
        console.log(`○  ${page.file} - Already optimized`);
    }
});

console.log('');
console.log('='.repeat(70));
console.log('📊 OPTIMIZATION SUMMARY');
console.log('='.repeat(70));
console.log(`Files Updated: ${filesUpdated}`);
console.log(`Total Changes: ${totalChanges}`);
console.log('');

if (filesUpdated > 0) {
    console.log('✅ SITUATION PAGES OPTIMIZED FOR WHOLESALE');
} else {
    console.log('ℹ️  No changes needed - pages already optimized');
}
