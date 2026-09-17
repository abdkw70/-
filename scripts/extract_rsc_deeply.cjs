const fs = require('fs');

const standHtml = fs.readFileSync('scripts/prod_stand.html', 'utf8');

// Match all self.__next_f.push([1,"..."])
const re = /self\.__next_f\.push\(\[1,"(.*)"\]\)/g;
let match;
let fullText = '';
while ((match = re.exec(standHtml)) !== null) {
  try {
    const unescaped = JSON.parse(`"${match[1]}"`);
    fullText += unescaped + '\n';
  } catch (e) {
    fullText += match[1] + '\n';
  }
}

fs.writeFileSync('scripts/stand_rsc_all.txt', fullText);
console.log('Full RSC text length:', fullText.length);

// Let's search for "ستاند" or "price" or "options" or "variants" in fullText
const lines = fullText.split('\n');
console.log('Total RSC lines:', lines.length);

const matchedLines = lines.filter(l => l.includes('ستاند') || l.includes('ProductVariant') || l.includes('ProductOption') || l.includes('price') || l.includes('sku') || l.includes('SKU'));
console.log('Matched lines count:', matchedLines.length);
matchedLines.slice(0, 30).forEach((l, i) => console.log(`[${i}] ${l.substring(0, 200)}`));
