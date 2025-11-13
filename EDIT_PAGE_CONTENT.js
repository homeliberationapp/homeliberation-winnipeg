/**
 * EDIT PAGE CONTENT - Interactive page-by-page editor
 * Edit headers, explanations, descriptions on any page
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function editPage() {
    console.log('\n📝 PAGE CONTENT EDITOR\n');
    console.log('Available pages:');

    const pages = [
        'index.html', 'about.html', 'services.html', 'contact.html',
        'faq.html', 'foreclosure.html', 'repairs.html', 'inherited.html',
        'landlord.html', 'bankruptcy.html', 'tax-liens.html', 'downsizing.html',
        'quick-sale.html', 'sellers.html', 'properties.html', 'buyers.html',
        'calculator.html', 'other.html'
    ];

    pages.forEach((page, i) => console.log(`${i + 1}. ${page}`));

    const pageNum = await question('\nEnter page number to edit (or 0 to exit): ');

    if (pageNum === '0') {
        console.log('Goodbye!');
        rl.close();
        return;
    }

    const selectedPage = pages[parseInt(pageNum) - 1];
    if (!selectedPage) {
        console.log('Invalid page number');
        rl.close();
        return;
    }

    const filePath = path.join(__dirname, selectedPage);
    let content = fs.readFileSync(filePath, 'utf8');

    console.log(`\n✏️  Editing: ${selectedPage}\n`);
    console.log('What would you like to edit?');
    console.log('1. Page title (in <title> tag)');
    console.log('2. Hero heading (main h1)');
    console.log('3. Hero subheading/description');
    console.log('4. Section headings (all h2)');
    console.log('5. Custom text replacement');

    const editType = await question('\nEnter choice: ');

    switch(editType) {
        case '1': // Title
            const currentTitle = content.match(/<title>(.*?)<\/title>/)?.[1];
            console.log(`\nCurrent title: ${currentTitle}`);
            const newTitle = await question('New title: ');
            content = content.replace(/<title>.*?<\/title>/, `<title>${newTitle}</title>`);
            console.log('✅ Title updated');
            break;

        case '2': // Hero h1
            const currentH1 = content.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1].replace(/<[^>]*>/g, '');
            console.log(`\nCurrent hero heading: ${currentH1}`);
            const newH1 = await question('New hero heading: ');
            content = content.replace(/<h1[^>]*>.*?<\/h1>/s, (match) => {
                return match.replace(/>(.*?)<\/h1>/s, `>${newH1}</h1>`);
            });
            console.log('✅ Hero heading updated');
            break;

        case '3': // Hero description
            console.log('\nShowing all <p> tags in hero section...');
            const heroMatches = content.match(/<section class="hero"[^>]*>(.*?)<\/section>/s);
            if (heroMatches) {
                const pTags = heroMatches[1].match(/<p[^>]*>.*?<\/p>/gs);
                if (pTags) {
                    pTags.forEach((p, i) => {
                        const text = p.replace(/<[^>]*>/g, '');
                        console.log(`${i + 1}. ${text.substring(0, 80)}...`);
                    });
                    const pNum = await question('Which paragraph to edit? ');
                    const oldP = pTags[parseInt(pNum) - 1];
                    console.log(`\nCurrent: ${oldP.replace(/<[^>]*>/g, '')}`);
                    const newText = await question('New text: ');
                    content = content.replace(oldP, oldP.replace(/>.*?<\/p>/, `>${newText}</p>`));
                    console.log('✅ Description updated');
                }
            }
            break;

        case '4': // Section headings
            const h2Tags = content.match(/<h2[^>]*>.*?<\/h2>/gs);
            if (h2Tags) {
                console.log('\nSection headings:');
                h2Tags.forEach((h2, i) => {
                    const text = h2.replace(/<[^>]*>/g, '');
                    console.log(`${i + 1}. ${text}`);
                });
                const h2Num = await question('Which heading to edit? ');
                const oldH2 = h2Tags[parseInt(h2Num) - 1];
                console.log(`\nCurrent: ${oldH2.replace(/<[^>]*>/g, '')}`);
                const newH2 = await question('New heading: ');
                content = content.replace(oldH2, oldH2.replace(/>.*?<\/h2>/, `>${newH2}</h2>`));
                console.log('✅ Heading updated');
            }
            break;

        case '5': // Custom replacement
            const findText = await question('Text to find: ');
            const replaceText = await question('Replace with: ');
            const count = (content.match(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            console.log(`Found ${count} occurrence(s)`);
            if (count > 0) {
                content = content.replace(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceText);
                console.log('✅ Text replaced');
            }
            break;
    }

    fs.writeFileSync(filePath, content);
    console.log(`\n💾 Saved changes to ${selectedPage}`);

    const another = await question('\nEdit another section? (y/n): ');
    if (another.toLowerCase() === 'y') {
        await editPage();
    } else {
        console.log('\n✅ Done! Remember to commit changes:\n   git add *.html && git commit -m "Update page content" && git push');
        rl.close();
    }
}

editPage().catch(console.error);
