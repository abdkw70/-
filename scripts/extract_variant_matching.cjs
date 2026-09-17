const fs = require('fs');

const pageChunk = fs.readFileSync('scripts/chunk_selectedVariant___next_static_chunks_app__5Bdomain_5D__5Blang_5D__shopping__product__5Bcollection_5D__5Bproduct_5D_page_eb13bafc9151240e_js.js', 'utf8');

// Search for variant matching algorithm
// Usually:
// selectedOptions is a map { [optionId]: valueId }
// matching variant is variants.find(v => v.selectedOptions.every(so => selectedOptions[so.option.id] === so.value.id))
const variantMatchIdx = pageChunk.indexOf('selectedOptions');
console.log('selectedOptions occurrences:', (pageChunk.match(/selectedOptions/g) || []).length);

let pos = 0;
while (true) {
  const idx = pageChunk.indexOf('selectedOptions', pos);
  if (idx === -1) break;
  console.log(`\n=== MATCH AT ${idx} ===`);
  console.log(pageChunk.substring(Math.max(0, idx - 150), Math.min(pageChunk.length, idx + 350)));
  pos = idx + 'selectedOptions'.length;
}
