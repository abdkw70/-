const fs = require('fs');

console.log('=== BUTTONS ===');
console.log(fs.readFileSync('scripts/stand_buttons.txt', 'utf8'));

console.log('\n=== SCRIPT 72 PREVIEW ===');
console.log(fs.readFileSync('scripts/stand_script_72.txt', 'utf8').substring(0, 1000));

console.log('\n=== SCRIPT 78 PREVIEW ===');
console.log(fs.readFileSync('scripts/stand_script_78.txt', 'utf8').substring(0, 1000));
