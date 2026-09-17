const fs = require('fs');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function inspectChunks() {
  const html = fs.readFileSync('scripts/live_prod_ستاند-عرض-شفاف-وجهين-اكرلك-هرمي.html', 'utf8');
  const chunkMatches = html.match(/src="(\/_next\/static\/chunks\/[^"]+)"/g) || [];
  console.log('Chunk count:', chunkMatches.length);

  for (const m of chunkMatches) {
    const chunkPath = m.match(/src="([^"]+)"/)[1];
    const chunkUrl = 'https://maktaba-q8.com' + chunkPath;
    console.log('Fetching chunk:', chunkUrl);
    try {
      const code = await fetchUrl(chunkUrl);
      console.log('Chunk length:', code.length);

      // Search for item number, sku, variant, price, options logic in JS
      const keywords = ['رقم الصنف', 'sku', 'selectedVariant', 'ProductOption', 'options', 'compareAtPrice', 'variantPrice'];
      keywords.forEach(kw => {
        if (code.includes(kw)) {
          console.log(`-> Chunk contains "${kw}"!`);
          fs.writeFileSync(`scripts/chunk_${kw}_${chunkPath.replace(/[^a-zA-Z0-9]/g, '_')}.js`, code);
        }
      });
    } catch(e) {
      console.error('Error fetching chunk:', e.message);
    }
  }
}

inspectChunks();
