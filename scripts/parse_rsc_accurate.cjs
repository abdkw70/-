const fs = require('fs');

const standHtml = fs.readFileSync('scripts/prod_stand.html', 'utf8');

const scriptMatches = standHtml.match(/<script>self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)<\/script>/g) || [];
console.log('Script matches count:', scriptMatches.length);

let combined = '';
scriptMatches.forEach((s, idx) => {
  const contentMatch = s.match(/<script>self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)<\/script>/);
  if (contentMatch) {
    try {
      const raw = contentMatch[1];
      const unescaped = JSON.parse(`"${raw}"`);
      combined += unescaped + '\n---CHUNK---\n';
    } catch(e) {
      combined += contentMatch[1] + '\n---CHUNK---\n';
    }
  }
});

fs.writeFileSync('scripts/stand_rsc_combined.txt', combined);
console.log('Combined length:', combined.length);

// Let's write a script to search for product details in combined
const lines = combined.split('\n');
console.log('Total lines in combined:', lines.length);

const interesting = lines.filter(l => 
  l.includes('Product') || 
  l.includes('ستاند') || 
  l.includes('variants') || 
  l.includes('options') || 
  l.includes('customFields') || 
  l.includes('Option') ||
  l.includes('رقم') ||
  l.includes('صنف') ||
  l.includes('sku') ||
  l.includes('SKU')
);

console.log('Interesting lines count:', interesting.length);
interesting.slice(0, 40).forEach((l, i) => console.log(`[${i}] ${l.slice(0, 180)}`));
