const fs = require('fs');
const https = require('https');

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

function extractProductDataFromHtml(html, name) {
  fs.writeFileSync(`scripts/prod_${name}.html`, html);

  // Look for JSON-LD schema
  const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
  const jsonLdList = [];
  jsonLdMatches.forEach(tag => {
    const raw = tag.replace(/<\/?script[^>]*>/gi, '').trim();
    try {
      jsonLdList.push(JSON.parse(raw));
    } catch(e) {}
  });

  // Look for RSC stream JSON chunks (self.__next_f.push)
  const rscMatches = html.match(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g) || [];
  const rscChunks = [];
  rscMatches.forEach(m => {
    try {
      const match = m.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)$/s);
      if (match) {
        // Unescape JS string
        const unescaped = JSON.parse(`"${match[1]}"`);
        rscChunks.push(unescaped);
      }
    } catch (e) {}
  });

  const fullRscText = rscChunks.join('\n');
  fs.writeFileSync(`scripts/prod_${name}_rsc.txt`, fullRscText);

  // Search in RSC text for product fields: options, variants, sku, price, item numbers (رقم الصنف)
  console.log(`\n=== PRODUCT: ${name} ===`);
  console.log('JSON-LD count:', jsonLdList.length);
  if (jsonLdList.length > 0) {
    fs.writeFileSync(`scripts/prod_${name}_jsonld.json`, JSON.stringify(jsonLdList, null, 2));
  }

  // Find option types, variant arrays, sku, price in RSC text
  const optionMatches = fullRscText.match(/"__typename":"ProductOption"[^}]+/g) || [];
  console.log('ProductOption matches:', optionMatches);

  const variantMatches = fullRscText.match(/"__typename":"ProductVariant"[^}]+/g) || [];
  console.log('ProductVariant matches:', variantMatches.length);

  // Extract raw HTML sections containing "رقم الصنف" or options selector
  const itemNoIdx = html.indexOf('رقم الصنف');
  if (itemNoIdx !== -1) {
    console.log('Found "رقم الصنف" in HTML!');
    const snippet = html.substring(Math.max(0, itemNoIdx - 400), Math.min(html.length, itemNoIdx + 1200));
    console.log('HTML snippet around "رقم الصنف":\n', snippet);
    fs.writeFileSync(`scripts/prod_${name}_itemNo_snippet.html`, snippet);
  } else {
    console.log('No "رقم الصنف" in HTML for', name);
  }

  return { jsonLdList, rscChunksCount: rscChunks.length, variantMatchesCount: variantMatches.length };
}

async function run() {
  const productsToTest = [
    { name: 'stand', url: 'https://maktaba-q8.com/ar/product/%D8%B3%D8%AA%D8%A7%D9%86%D8%AF-%D8%A7%D8%B3%D9%85-%D9%85%D9%83%D8%AA%D8%A8-%D9%87%D8%B1%D9%85%D9%8A' },
    { name: 'box_file', url: 'https://maktaba-q8.com/ar/product/%E2%81%A8%E2%80%AB%D8%A8%D9%88%D9%83%D8%B3-%D9%81%D8%A7%D9%8A%D9%84-%E2%80%AB2-%D8%AD%D9%84%D9%82%D8%A9%E2%81%A9' },
    { name: 'id_badge', url: 'https://maktaba-q8.com/ar/product/%D8%B9%D9%84%D8%A7%D9%81-%D9%87%D9%88%D9%8A%D8%A9-%D9%84%D9%84%D8%B9%D9%85%D9%84' },
    { name: 'foam_cutter', url: 'https://maktaba-q8.com/ar/product/%D8%AC%D9%87%D8%A7%D8%B2-%D9%82%D8%B5-%D8%A7%D9%84%D9%81%D9%84%D9%8A%D9%86' }
  ];

  for (const p of productsToTest) {
    console.log('Fetching:', p.name, p.url);
    const res = await fetchUrl(p.url);
    console.log('Status:', res.statusCode);
    if (res.statusCode === 200) {
      extractProductDataFromHtml(res.body, p.name);
    }
  }
}

run();
