const fs = require('fs');

const html = fs.readFileSync('scripts/live_prod_ستاند-عرض-شفاف-وجهين-اكرلك-هرمي.html', 'utf8');

const title = 'ستاند عرض شفاف وجهين اكرلك هرمي';
let pos = 0;
while (true) {
  const idx = html.indexOf(title, pos);
  if (idx === -1) break;
  console.log(`Found occurrence at index ${idx}`);
  const snippet = html.substring(idx - 100, idx + 1000);
  console.log('--- SNIPPET ---');
  console.log(snippet);
  pos = idx + title.length;
}
