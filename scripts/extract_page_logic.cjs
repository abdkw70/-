const fs = require('fs');

const pageChunk = fs.readFileSync('scripts/chunk_selectedVariant___next_static_chunks_app__5Bdomain_5D__5Blang_5D__shopping__product__5Bcollection_5D__5Bproduct_5D_page_eb13bafc9151240e_js.js', 'utf8');

// Let's search for SKU / item number rendering
const skuIdx = pageChunk.indexOf('sku');
console.log('SKU occurrences:', (pageChunk.match(/sku/g) || []).length);

// Let's search for "رقم المنتج" or "رقم الصنف" or "{sku}" or "SKU"
const terms = ['sku', 'selectedVariant', 'ProductOption', 'options', 'compareAtPrice', 'stock', 'isInStock'];

terms.forEach(t => {
  let pos = 0;
  console.log(`\n=== SEARCH IN PAGE CHUNK: ${t} ===`);
  for (let i = 0; i < 5; i++) {
    const idx = pageChunk.indexOf(t, pos);
    if (idx === -1) break;
    console.log(`[${i}] (at ${idx}):\n`, pageChunk.substring(Math.max(0, idx - 100), Math.min(pageChunk.length, idx + 300)));
    pos = idx + t.length;
  }
});
