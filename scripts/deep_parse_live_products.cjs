const fs = require('fs');

const files = fs.readdirSync('scripts').filter(f => f.startsWith('live_prod_') && f.endsWith('.html'));

for (const f of files) {
  const html = fs.readFileSync(`scripts/${f}`, 'utf8');
  console.log(`\n======================================================`);
  console.log(`ANALYZING: ${f}`);
  
  // Extract RSC chunks
  const scriptMatches = html.match(/<script>self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)<\/script>/g) || [];
  let combined = '';
  scriptMatches.forEach(s => {
    const match = s.match(/<script>self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)<\/script>/);
    if (match) {
      try {
        combined += JSON.parse(`"${match[1]}"`) + '\n';
      } catch(e) {
        combined += match[1] + '\n';
      }
    }
  });

  fs.writeFileSync(`scripts/${f}_rsc.txt`, combined);

  // Search for product details in combined
  // Find Product title, price, variants, options, sku, stock, etc.
  const titleMatch = combined.match(/"title":"([^"]+)"/g);
  console.log('Titles found:', titleMatch?.slice(0, 5));

  // Find all json objects with "__typename":"Product" or "__typename":"ProductVariant"
  const lines = combined.split('\n');
  lines.forEach(line => {
    if (line.includes('"__typename":"Product"') || line.includes('"__typename":"ProductVariant"') || line.includes('"__typename":"ProductOption"')) {
      console.log('RSC Object line:', line.substring(0, 300));
    }
  });

  // Extract visible HTML text around options, prices, buy button
  const formIdx = html.indexOf('<form');
  if (formIdx !== -1) {
    const formSnippet = html.substring(formIdx, formIdx + 3000);
    fs.writeFileSync(`scripts/${f}_form.html`, formSnippet);
  }
}
