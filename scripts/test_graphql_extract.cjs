const fs = require('fs');
const https = require('https');

const code = fs.readFileSync('scripts/chunk_ProductOption___next_static_chunks_9685_67b58b96616a2777_js.js', 'utf8');

const qIdx = code.indexOf('query ProductDetails');
console.log('qIdx:', qIdx);

// Look around qIdx for the query string
const snippet = code.substring(qIdx - 50, qIdx + 2500);
console.log('Snippet around query ProductDetails:');
console.log(snippet.substring(0, 800));
