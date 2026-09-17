const fs = require('fs');

const sitemap = fs.readFileSync('scripts/sitemap_products.txt', 'utf8') || '';
// Let's also read sitemap.xml
const rawSitemap = fs.existsSync('scripts/sitemap.xml') ? fs.readFileSync('scripts/sitemap.xml', 'utf8') : '';

// Let's parse all URLs from sitemap.xml by fetching and writing it properly
const https = require('https');
https.get('https://maktaba-q8.com/sitemap.xml', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('scripts/sitemap_raw.xml', data);
    const urls = data.match(/<loc>([^<]+)<\/loc>/g) || [];
    console.log('Total URLs in sitemap:', urls.length);
    console.log('Sample URLs:', urls.slice(0, 20));
    fs.writeFileSync('scripts/all_sitemap_urls.txt', urls.join('\n'));
  });
});
