const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');
code = code.replace(/gemini-2\.5-flash/g, 'gemini-3.8-flash');
fs.writeFileSync('server/routes/aiChat.ts', code);
