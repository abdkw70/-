const fs = require('fs');

const files = fs.readdirSync('scripts').filter(f => f.startsWith('search_') && f.endsWith('.html'));

for (const file of files) {
  const content = fs.readFileSync(`scripts/${file}`, 'utf8');
  const match = content.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      console.log(`Parsed __NEXT_DATA__ from ${file}`);
      console.log('page:', data.page, 'props keys:', Object.keys(data.props || {}));
      if (data.props && data.props.pageProps) {
        console.log('pageProps keys:', Object.keys(data.props.pageProps));
        fs.writeFileSync(`scripts/props_${file}.json`, JSON.stringify(data.props.pageProps, null, 2));
      }
    } catch (e) {
      console.error('JSON parse error:', e.message);
    }
  } else {
    console.log('No __NEXT_DATA__ in', file);
  }
}
