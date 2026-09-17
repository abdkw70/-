const fs = require('fs');

const html = fs.readFileSync('scripts/live_prod_ستاند-عرض-شفاف-وجهين-اكرلك-هرمي.html', 'utf8');

const title = 'ستاند عرض شفاف وجهين اكرلك هرمي';
const idx = html.indexOf(title);
console.log('Title index:', idx);

if (idx !== -1) {
  const section = html.substring(Math.max(0, idx - 200), Math.min(html.length, idx + 4000));
  fs.writeFileSync('scripts/stand_detail_section.html', section);
  console.log('Saved stand_detail_section.html, preview:');
  console.log(section.substring(0, 1500));
} else {
  console.log('Title not found in html');
}
