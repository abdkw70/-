const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(/gemini-1\.5-flash/g, 'gemini-2.0-flash');

fs.writeFileSync('server/routes/aiChat.ts', code);
