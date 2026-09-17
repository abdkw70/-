const fs = require('fs');

const combined = fs.readFileSync('scripts/stand_rsc_combined.txt', 'utf8');
const lines = combined.split('\n');
console.log('Total lines:', lines.length);
console.log('Last 50 lines:');
lines.slice(-50).forEach((l, i) => {
  console.log(`\n[Line ${lines.length - 50 + i} length ${l.length}]:\n`, l.slice(0, 300));
});
