// ═══════════════════════════════════════════════════════════
// PROPERTY DATA BOT - Automated Data Aggregation
// Scrapes public records + MLS + APIs to build complete property profile
// ═══════════════════════════════════════════════════════════

const puppeteer = require('puppeteer');
const axios = require('axios');

class PropertyDataBot {
  constructor(config) {
    this.config = config;
    this.browser = null;
  }

  // ───────────────────────────────────────────────────────────
  // MAIN FUNCTION: Get Complete Property Data
  // ───────────────────────────────────────────────────────────
  async getPropertyData(address) {
    console.log(`🔍 Fetching data for: ${address}`);

    const data = {
      address: address,
      timestamp: new Date().toISOString(),
      sources: [],
      confidence: 0
    };

    try {
      // Run all data sources in parallel for speed
      const [
        assessmentData,
        mlsData,
        courtData,
        geocodeData,
        compsData
      ] = await Promise.all([
        this.getAssessmentData(address),
        this.getMLSData(address),
        this.getCourtRecords(address),
        this.geocodeAddress(address),
        this.getComparables(address)
      ]);

      // Merge all data sources
      Object.assign(data, {
        ...assessmentData,
        ...mlsData,
        ...courtData,
        ...geocodeData,
        comparables: compsData
      });

      // Calculate ARV from comps
      data.arv = this.calculateARV(compsData);

      // Calculate confidence score (how many sources confirmed data)
      data.confidence = this.calculateConfidence(data.sources);

      console.log(`✅ Data collected. Confidence: ${data.confidence}%`);

      return data;

    } catch (error) {
      console.error('❌ Error fetching property data:', error);
      return { ...data, error: error.message };
    }
  }

  // ───────────────────────────────────────────────────────────
  // DATA SOURCE 1: City Assessment Records
  // ───────────────────────────────────────────────────────────
  async getAssessmentData(address) {
    console.log('  📊 Fetching assessment data...');

    try {
      // For Winnipeg: https://assessment.winnipeg.ca/asmttax/
      // This is a simplified example - actual implementation needs proper scraping

      const browser = await this.getBrowser();
      const page = await browser.newPage();

      await page.goto('https://assessment.winnipeg.ca/asmttax/English/Search/Search.aspx', {
        waitUntil: 'networkidle2'
      });

      // Fill in address search form
      await page.type('#txtAddress', address);
      await page.click('#btnSearch');
      await page.waitForSelector('.assessment-results', { timeout: 10000 });

      // Extract data from results
      const assessmentData = await page.evaluate(() => {
        return {
          owner: document.querySelector('.owner-name')?.textContent.trim(),
          assessedValue: parseFloat(document.querySelector('.assessed-value')?.textContent.replace(/[^0-9]/g, '')),
          propertyType: document.querySelector('.property-type')?.textContent.trim(),
          yearBuilt: parseInt(document.querySelector('.year-built')?.textContent),
          lotSize: document.querySelector('.lot-size')?.textContent.trim(),
          bedrooms: parseInt(document.querySelector('.bedrooms')?.textContent),
          bathrooms: parseFloat(document.querySelector('.bathrooms')?.textContent),
          sqft: parseFloat(document.querySelector('.sqft')?.textContent.replace(/[^0-9]/g, ''))
        };
      });

      await page.close();

      return {
        ...assessmentData,
        sources: [...(assessmentData.sources || []), 'City Assessment']
      };

    } catch (error) {
      console.log('  ⚠️  Assessment data unavailable');
      return { sources: [] };
    }
  }

  // ───────────────────────────────────────────────────────────
  // DATA SOURCE 2: MLS Historical Data
  // ───────────────────────────────────────────────────────────
  async getMLSData(address) {
    console.log('  🏠 Fetching MLS data...');

    try {
      // Scrape Realtor.ca for sold listings
      // This is simplified - actual implementation needs proper scraping + cookie handling

      const browser = await this.getBrowser();
      const page = await browser.newPage();

      await page.goto(`https://www.realtor.ca/`, { waitUntil: 'networkidle2' });

      // Search for address
      await page.type('#heroSearch', address);
      await page.keyboard.press('Enter');
      await page.waitForSelector('.listing-card', { timeout: 10000 });

      // Extract listing data
      const mlsData = await page.evaluate(() => {
        const listing = document.querySelector('.listing-card');
        if (!listing) return {};

        return {
          lastSalePrice: parseFloat(listing.querySelector('.price')?.textContent.replace(/[^0-9]/g, '')),
          lastSaleDate: listing.querySelector('.sold-date')?.textContent.trim(),
          listingHistory: listing.querySelector('.listing-history')?.textContent.trim(),
          daysOnMarket: parseInt(listing.querySelector('.days-on-market')?.textContent)
        };
      });

      await page.close();

      return {
        ...mlsData,
        sources: [...(mlsData.sources || []), 'MLS (Realtor.ca)']
      };

    } catch (error) {
      console.log('  ⚠️  MLS data unavailable');
      return { sources: [] };
    }
  }

  // ───────────────────────────────────────────────────────────
  // DATA SOURCE 3: Court Records (Foreclosure, Probate, Liens)
  // ───────────────────────────────────────────────────────────
  async getCourtRecords(address) {
    console.log('  ⚖️  Checking court records...');

    try {
      // Manitoba Land Titles Office search
      // https://web43.gov.mb.ca/Registry/SearchByPartyName.aspx

      return {
        foreclosureStatus: 'none',  // Placeholder - needs real scraping
        liens: [],
        probateStatus: 'none',
        sources: ['Manitoba Court Records']
      };

    } catch (error) {
      console.log('  ⚠️  Court records unavailable');
      return { sources: [] };
    }
  }

  // ───────────────────────────────────────────────────────────
  // DATA SOURCE 4: Google Maps API (Geocoding + Street View)
  // ───────────────────────────────────────────────────────────
  async geocodeAddress(address) {
    console.log('  🗺️  Geocoding address...');

    try {
      const apiKey = this.config.integrations.googleMaps.apiKey;
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { address, key: apiKey }
      });

      if (response.data.results.length === 0) {
        throw new Error('Address not found');
      }

      const result = response.data.results[0];
      const location = result.geometry.location;

      // Get neighborhood from address components
      const neighborhood = result.address_components.find(c => c.types.includes('neighborhood'))?.long_name;
      const postalCode = result.address_components.find(c => c.types.includes('postal_code'))?.long_name;

      // Generate Street View URL
      const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${location.lat},${location.lng}&key=${apiKey}`;

      return {
        latitude: location.lat,
        longitude: location.lng,
        neighborhood,
        postalCode,
        streetViewUrl,
        formattedAddress: result.formatted_address,
        sources: ['Google Maps API']
      };

    } catch (error) {
      console.log('  ⚠️  Geocoding failed');
      return { sources: [] };
    }
  }

  // ───────────────────────────────────────────────────────────
  // DATA SOURCE 5: Comparable Sales (For ARV Calculation)
  // ───────────────────────────────────────────────────────────
  async getComparables(address) {
    console.log('  📈 Finding comparable sales...');

    try {
      // In production: Scrape recent sold listings in same neighborhood
      // For now: Return mock data

      // This would actually scrape Realtor.ca sold listings within 0.5 miles, similar size, sold in last 6 months

      return [
        {
          address: '125 Main St',
          soldPrice: 295000,
          soldDate: '2025-09-15',
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1800,
          distance: 0.2 // miles
        },
        {
          address: '130 Main St',
          soldPrice: 310000,
          soldDate: '2025-08-22',
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1850,
          distance: 0.3
        },
        {
          address: '140 Main St',
          soldPrice: 288000,
          soldDate: '2025-07-10',
          bedrooms: 3,
          bathrooms: 1.5,
          sqft: 1750,
          distance: 0.4
        }
      ];

    } catch (error) {
      console.log('  ⚠️  Comps unavailable');
      return [];
    }
  }

  // ───────────────────────────────────────────────────────────
  // ARV CALCULATION (After Repair Value)
  // ───────────────────────────────────────────────────────────
  calculateARV(comps) {
    if (!comps || comps.length === 0) {
      return this.config.market.defaultARV; // Fallback
    }

    // Simple average of comps (in production: weight by recency, distance, similarity)
    const avgPrice = comps.reduce((sum, comp) => sum + comp.soldPrice, 0) / comps.length;

    console.log(`  💰 ARV calculated: $${avgPrice.toLocaleString()}`);

    return Math.round(avgPrice / 1000) * 1000; // Round to nearest $1000
  }

  // ───────────────────────────────────────────────────────────
  // CONFIDENCE SCORE (How many sources verified data)
  // ───────────────────────────────────────────────────────────
  calculateConfidence(sources) {
    const totalSources = 5; // Assessment, MLS, Court, Maps, Comps
    const confirmedSources = sources.length;

    return Math.round((confirmedSources / totalSources) * 100);
  }

  // ───────────────────────────────────────────────────────────
  // BROWSER MANAGEMENT (Reuse browser instance for performance)
  // ───────────────────────────────────────────────────────────
  async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

module.exports = PropertyDataBot;

// ═══════════════════════════════════════════════════════════
// USAGE EXAMPLE
// ═══════════════════════════════════════════════════════════

if (require.main === module) {
  const CONFIG = require('../config');
  const bot = new PropertyDataBot(CONFIG);

  (async () => {
    const data = await bot.getPropertyData('123 Main St, Winnipeg, MB');
    console.log('\n📄 PROPERTY DATA:');
    console.log(JSON.stringify(data, null, 2));

    await bot.closeBrowser();
  })();
}
