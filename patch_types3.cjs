const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(/question: string;/g, 'question: LocalizedText;');
code = code.replace(/options: string\[\];/g, 'options: LocalizedText[];');
fs.writeFileSync('src/types.ts', code);
