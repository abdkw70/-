const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(/gemini-1\.5-pro/g, 'gemini-3.1-pro-preview'); // let's try the pro preview model

fs.writeFileSync('server/routes/aiChat.ts', code);
