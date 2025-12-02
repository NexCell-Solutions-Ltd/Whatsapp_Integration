require('dotenv').config();
const LinkShortener = require('./link_shortner');

async function testLinkShortening() {
  const shortener = new LinkShortener();
  
  console.log('🧪 Testing Link Shortener\n');
  
  // Test URLs
  const testUrls = [
    'https://www.example.com/properties/modern-2-bed-flat-islington-angel-n1-1650-month',
    'https://www.example.com/properties/cozy-studio-shoreditch-old-street-ec2-1200',
    'https://www.example.com/properties/spacious-3-bed-house-hackney-e8-2200'
  ];
  
  // Shorten individually
  console.log('Test 1: Individual shortening');
  for (const url of testUrls) {
    const short = await shortener.shorten(url);
    console.log(`${url} -> ${short}\n`);
  }
  
  // Test caching (should be instant)
  console.log('\nTest 2: Cached result (should be instant)');
  const cached = await shortener.shorten(testUrls[0]);
  console.log('Cached result:', cached);
  
  // Shorten multiple at once
  console.log('\nTest 3: Bulk shortening');
  const shortUrls = await shortener.shortenMultiple(testUrls);
  console.log('All shortened:', shortUrls);
  
  console.log('\n✅ Link shortening tests complete!');
}

testLinkShortening();