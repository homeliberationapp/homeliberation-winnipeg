/**
 * ADD BACKGROUND IMAGES TO ALL SECTIONS
 * Add professional real estate background images to every section of the site
 */

const fs = require('fs');
const path = require('path');

console.log('🖼️  ADDING BACKGROUND IMAGES TO ALL SECTIONS\n');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Add background to "How It Works" section
content = content.replace(
    /<section class="section" style="background: var\(--surface\);">\s*<div class="container">\s*<h2 class="section-title">How It Works<\/h2>/,
    `<section class="section" style="background: linear-gradient(rgba(15, 34, 64, 0.92), rgba(15, 34, 64, 0.92)), url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=85'); background-size: cover; background-position: center; background-attachment: fixed;">
        <div class="container">
            <h2 class="section-title">How It Works</h2>`
);

// Add background to "Problem Properties" section
content = content.replace(
    /<section class="section" style="background: var\(--charcoal\);">\s*<div class="container">\s*<h2 class="section-title">We Offer Property Solutions For/,
    `<section class="section" style="background: linear-gradient(rgba(42, 42, 42, 0.90), rgba(42, 42, 42, 0.90)), url('https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1600&q=85'); background-size: cover; background-position: center; background-attachment: fixed;">
        <div class="container">
            <h2 class="section-title">We Offer Property Solutions For`
);

// Add background to testimonials section if exists
content = content.replace(
    /<section class="section"[^>]*>\s*<div class="container">\s*<h2 class="section-title">(Testimonials|What (?:Our Clients|People) Say)/gi,
    `<section class="section" style="background: linear-gradient(rgba(15, 34, 64, 0.88), rgba(15, 34, 64, 0.88)), url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600&q=85'); background-size: cover; background-position: center; background-attachment: fixed;">
        <div class="container">
            <h2 class="section-title">$1`
);

// Add background to FAQ section if on that page
if (content.includes('FAQ') || content.includes('Frequently Asked')) {
    content = content.replace(
        /<section class="section"[^>]*>\s*<div class="container">\s*<h2 class="section-title">(FAQ|Frequently Asked Questions)/gi,
        `<section class="section" style="background: linear-gradient(rgba(42, 42, 42, 0.88), rgba(42, 42, 42, 0.88)), url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=85'); background-size: cover; background-position: center; background-attachment: fixed;">
            <div class="container">
                <h2 class="section-title">$1`
    );
}

// Add background to Why Choose Us section
content = content.replace(
    /<section class="section"[^>]*>\s*<div class="container">\s*<h2 class="section-title">Why Choose (Us|Home Liberation)/gi,
    `<section class="section" style="background: linear-gradient(rgba(15, 34, 64, 0.90), rgba(15, 34, 64, 0.90)), url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1600&q=85'); background-size: cover; background-position: center; background-attachment: fixed;">
        <div class="container">
            <h2 class="section-title">Why Choose $1`
);

// Add background to Apartment section
content = content.replace(
    /<section style="max-width: 1400px; margin: 2\.4rem auto; padding: 0 2rem;">\s*<div style="text-align: center; margin-bottom: 3rem;">\s*<h2[^>]*>Apartment & Multi-Family Solutions/,
    `<section style="max-width: 1400px; margin: 2.4rem auto; padding: 3rem 2rem; background: linear-gradient(rgba(42, 42, 42, 0.85), rgba(42, 42, 42, 0.85)), url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=85'); background-size: cover; background-position: center; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 3rem;">
            <h2 style="font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #d4af37, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Apartment & Multi-Family Solutions`
);

fs.writeFileSync(filePath, content);
console.log('✅ Added background images to all major sections in index.html');

// Now do the same for other key pages
const pagesToUpdate = [
    { file: 'contact.html', bg: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1600&q=85' },
    { file: 'about.html', bg: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=85' },
    { file: 'services.html', bg: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1600&q=85' },
    { file: 'faq.html', bg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=85' }
];

pagesToUpdate.forEach(({ file, bg }) => {
    const pagePath = path.join(__dirname, file);
    if (fs.existsSync(pagePath)) {
        let pageContent = fs.readFileSync(pagePath, 'utf8');

        // Add background to first section that doesn't have one
        pageContent = pageContent.replace(
            /<section class="section"(?! style="background:)/,
            `<section class="section" style="background: linear-gradient(rgba(15, 34, 64, 0.88), rgba(15, 34, 64, 0.88)), url('${bg}'); background-size: cover; background-position: center; background-attachment: fixed;"`
        );

        fs.writeFileSync(pagePath, pageContent);
        console.log(`✅ Added background to ${file}`);
    }
});

console.log('\n✨ BACKGROUND IMAGES COMPLETE!');
console.log('   All major sections now have professional real estate background photos');
