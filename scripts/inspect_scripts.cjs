const fs = require('fs');

const html = fs.readFileSync('scripts/home.html', 'utf8');

console.log('HTML length:', html.length);
// Check for script tags
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
console.log('Script tags count:', scripts.length);

scripts.forEach((s, idx) => {
  if (s.length > 500) {
    console.log(`Script ${idx} length: ${s.length}, preview: ${s.substring(0, 150)}...`);
    fs.writeFileSync(`scripts/script_${idx}.js`, s);
  }
});

// Check for links to api or platform (Wuilt, Shopify, Salla, Zid, WooCommerce, custom)
const links = html.match(/https?:\/\/[a-zA-Z0-9.\-_/]+/g) || [];
const uniqueDomains = [...new Set(links.map(l => {
  try { return new URL(l).hostname; } catch(e) { return ''; }
}).filter(Boolean))];
console.log('Domains found:', uniqueDomains);
