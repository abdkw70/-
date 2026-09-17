const fs = require('fs');

const standHtml = fs.readFileSync('scripts/prod_stand.html', 'utf8');

console.log('standHtml length:', standHtml.length);
// Search for prices, titles, SKU, inputs, buttons, options, radio buttons, dropdowns, etc.
const keywords = ['د.ك', 'KWD', 'السعر', 'ستاند', 'هرمي', 'صنف', 'رقم', 'sku', 'SKU', 'variant', 'option', 'price', 'selected'];

keywords.forEach(kw => {
  const count = (standHtml.match(new RegExp(kw, 'gi')) || []).length;
  console.log(`Keyword "${kw}": count = ${count}`);
});

// Let's write all text nodes or form elements in prod_stand.html to a debug file
const forms = standHtml.match(/<form[\s\S]*?<\/form>/gi) || [];
console.log('Form count:', forms.length);

const buttons = standHtml.match(/<button[\s\S]*?<\/button>/gi) || [];
console.log('Button count:', buttons.length);
fs.writeFileSync('scripts/stand_buttons.txt', buttons.join('\n---\n'));

// Let's extract any script JSON or inline objects
const scripts = standHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
scripts.forEach((s, i) => {
  if (s.includes('price') || s.includes('ستاند') || s.includes('sku') || s.includes('variant')) {
    console.log(`Script ${i} matches! Length: ${s.length}`);
    fs.writeFileSync(`scripts/stand_script_${i}.txt`, s);
  }
});
