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

async function testFetchProducts() {
  const handles = [
    'ستاند-عرض-شفاف-وجهين-اكرلك-هرمي',
    'ستاند-مايل-للبروشرات-اكرلك',
    'ستاند-عرض-بروشور-شفاف-وجه-واحد-مائل',
    'ستاند-شفاف-اكرلك-وجهين-قصير',
    'علبة-اقلام-مكتب-حديد',
    'مشرط-كتر',
    'براية-درام'
  ];

  for (const h of handles) {
    const encoded = encodeURIComponent(h);
    const urls = [
      `https://maktaba-q8.com/ar/product/all/${encoded}`,
      `https://maktaba-q8.com/product/all/${encoded}`
    ];

    for (const u of urls) {
      console.log('Testing:', u);
      const res = await fetchUrl(u);
      console.log('-> Status:', res.statusCode, 'Body length:', res.body.length);
      if (res.statusCode === 200 && !res.body.includes('Page not found')) {
        console.log(`SUCCESS on: ${u}`);
        fs.writeFileSync(`scripts/live_prod_${h}.html`, res.body);
        break;
      }
    }
  }
}

testFetchProducts();
