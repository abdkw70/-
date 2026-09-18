const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(/gemini-3\.6-flash/g, 'gemini-1.5-pro');

fs.writeFileSync('server/routes/aiChat.ts', code);
