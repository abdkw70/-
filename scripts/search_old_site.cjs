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

async function searchAndInspect() {
  const searchQueries = [
    'ستاند اسم مكتب هرمي',
    'ستاند',
    'دفتر',
    'قلم',
    'ألوان',
    'ملف',
    'طابعة',
    'شنطة'
  ];

  for (const q of searchQueries) {
    const encoded = encodeURIComponent(q);
    const searchUrl = `https://maktaba-q8.com/ar/search?q=${encoded}`;
    console.log(`\nFetching search for: ${q} (${searchUrl})`);
    try {
      const res = await fetchUrl(searchUrl);
      console.log(`Search status for "${q}":`, res.statusCode, 'Length:', res.body.length);
      // Extract product links
      const pLinks = res.body.match(/href="(\/ar\/product\/[^"]+)"/g) || [];
      console.log(`Found ${pLinks.length} products for "${q}":`, pLinks.slice(0, 5));

      fs.writeFileSync(`scripts/search_${encoded.slice(0, 20)}.html`, res.body);
    } catch (e) {
      console.error(`Error searching ${q}:`, e.message);
    }
  }
}

searchAndInspect();
