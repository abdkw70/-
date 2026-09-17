const fs = require('fs');

const files = fs.readdirSync('scripts').filter(f => f.startsWith('live_prod_') && f.endsWith('.html'));

files.forEach(file => {
  const html = fs.readFileSync(`scripts/${file}`, 'utf8');
  console.log(`\n========================================`);
  console.log('FILE:', file);

  // Search for "رقم الصنف" or "رقم" or "خيارات" or "المقاس" or "اللون" or "الصنف"
  const terms = ['رقم الصنف', 'رقم', 'الصنف', 'المقاس', 'اللون', 'الحجم', 'النوع', 'اختر', 'sku', 'SKU'];
  terms.forEach(t => {
    const idx = html.indexOf(t);
    if (idx !== -1) {
      console.log(`Found "${t}" at index ${idx}!`);
      const context = html.substring(Math.max(0, idx - 100), Math.min(html.length, idx + 300));
      console.log('Context:\n', context.replace(/\s+/g, ' '));
    }
  });
});
