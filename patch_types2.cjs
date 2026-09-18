const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(/promptDetails\?: string;/g, 'promptDetails?: LocalizedText;');
code = code.replace(/explanation\?: string;/g, 'explanation?: LocalizedText;');
fs.writeFileSync('src/types.ts', code);
