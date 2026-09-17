const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8'
      }
    }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          redirectUrl = 'https://maktaba-q8.com' + redirectUrl;
        }
        return resolve(fetchUrl(redirectUrl));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function inspect() {
  console.log('--- Fetching Homepage ---');
  try {
    const home = await fetchUrl('https://maktaba-q8.com/ar');
    console.log('Status:', home.statusCode, 'Body length:', home.body.length);
    fs.writeFileSync('scripts/home.html', home.body);

    // Look for product links, Next.js / Nuxt / Shopify / Wuilt / Salla scripts or state
    const matches = home.body.match(/href="(\/ar\/product[^"]+|\/product[^"]+)"/g) || [];
    console.log('Found product links:', matches.slice(0, 10));

    // Look for __NEXT_DATA__ or window.__INITIAL_STATE__ or json-ld
    const nextDataMatch = home.body.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
    if (nextDataMatch) {
      console.log('Found __NEXT_DATA__!');
      fs.writeFileSync('scripts/next_data_home.json', nextDataMatch[1]);
    }
  } catch (err) {
    console.error('Error fetching home:', err.message);
  }
}

inspect();
