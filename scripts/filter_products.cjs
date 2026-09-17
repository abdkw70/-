const fs = require('fs');

const raw = fs.readFileSync('scripts/all_sitemap_urls.txt', 'utf8');
const urls = raw.split('\n')
  .map(l => l.replace(/<\/?loc>/g, '').trim())
  .filter(Boolean);

console.log('Total URLs:', urls.length);
const productUrls = urls.filter(u => u.includes('/product/'));
console.log('Product URLs count:', productUrls.length);

const decoded = productUrls.map(u => {
  try {
    return { url: u, decoded: decodeURIComponent(u) };
  } catch(e) {
    return { url: u, decoded: u };
  }
});

console.log('\nSample decoded product URLs:');
decoded.slice(0, 30).forEach((item, i) => {
  console.log(`[${i}] ${item.decoded}`);
});

// Search for "ستاند" in decoded
const stands = decoded.filter(d => d.decoded.includes('ستاند') || d.decoded.includes('هرمي') || d.decoded.includes('مكتب'));
console.log('\nStands / Office products found:');
stands.forEach(s => console.log(s.decoded, '->', s.url));

fs.writeFileSync('scripts/decoded_products.json', JSON.stringify(decoded, null, 2));
