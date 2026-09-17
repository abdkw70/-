const fs = require('fs');

const pageChunkPath = 'scripts/chunk_selectedVariant___next_static_chunks_app__5Bdomain_5D__5Blang_5D__shopping__product__5Bcollection_5D__5Bproduct_5D_page_eb13bafc9151240e_js.js';
const chunk9685Path = 'scripts/chunk_ProductOption___next_static_chunks_9685_67b58b96616a2777_js.js';

const pageChunk = fs.readFileSync(pageChunkPath, 'utf8');
const chunk9685 = fs.readFileSync(chunk9685Path, 'utf8');

console.log('Page chunk length:', pageChunk.length);
console.log('9685 chunk length:', chunk9685.length);

// Let's search for how variants, options, prices, SKU, images, and add to cart work
function findContexts(code, keyword, len = 500) {
  const results = [];
  let pos = 0;
  while (true) {
    const idx = code.indexOf(keyword, pos);
    if (idx === -1) break;
    results.push(code.substring(Math.max(0, idx - 150), Math.min(code.length, idx + len)));
    pos = idx + keyword.length;
    if (results.length > 10) break;
  }
  return results;
}

const terms = ['selectedVariant', 'ProductOption', 'sku', 'SKU', 'compareAtPrice', 'options', 'variants', 'quantity', 'addToCart'];

terms.forEach(t => {
  console.log(`\n========================================`);
  console.log(`PAGE CHUNK - TERM: ${t}`);
  const ctxs = findContexts(pageChunk, t, 400);
  console.log(`Found ${ctxs.length} occurrences in page chunk`);
  ctxs.slice(0, 3).forEach((c, i) => console.log(`[${i}]\n`, c));
});

terms.forEach(t => {
  console.log(`\n========================================`);
  console.log(`CHUNK 9685 - TERM: ${t}`);
  const ctxs = findContexts(chunk9685, t, 400);
  console.log(`Found ${ctxs.length} occurrences in chunk 9685`);
  ctxs.slice(0, 3).forEach((c, i) => console.log(`[${i}]\n`, c));
});
