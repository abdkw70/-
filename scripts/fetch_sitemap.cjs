const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

async function findProducts() {
  // Let's fetch sitemap or collections to find all real product handles
  const urlsToTry = [
    'https://maktaba-q8.com/sitemap.xml',
    'https://maktaba-q8.com/ar/sitemap.xml',
    'https://maktaba-q8.com/ar/products',
    'https://maktaba-q8.com/ar/collection/%D8%A7%D8%AF%D9%88%D8%A7%D8%AA-%D9%88%D8%A7%D9%83%D8%B3%D8%B3%D9%88%D8%A7%D8%B1%D8%AA-%D8%A7%D9%84%D9%85%D9%83%D8%AA%D8%A8',
    'https://maktaba-q8.com/ar/product/%D8%B3%D8%AA%D8%A7%D9%86%D8%AF-%D8%A7%D8%B3%D9%85-%D9%85%D9%83%D8%AA%D8%A8-%D9%87%D8%B1%D9%85%D9%8A'
  ];

  for (const url of urlsToTry) {
    console.log('Fetching:', url);
    try {
      const res = await fetchUrl(url);
      console.log('-> Status:', res.statusCode, 'Length:', res.body.length);
      if (url.includes('sitemap')) {
        const productUrls = res.body.match(/<loc>(https:\/\/maktaba-q8\.com\/ar\/product\/[^<]+)<\/loc>/g) || [];
        console.log(`Found ${productUrls.length} product URLs in sitemap`);
        fs.writeFileSync('scripts/sitemap_products.txt', productUrls.join('\n'));
      } else if (url.includes('ستاند-اسم-مكتب-هرمي')) {
        fs.writeFileSync('scripts/stand_product.html', res.body);
      }
    } catch (e) {
      console.error('Error fetching', url, e.message);
    }
  }
}

findProducts();
