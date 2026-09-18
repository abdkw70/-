const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(/gemini-3\.1-pro-preview/g, 'gemini-2.5-flash');

fs.writeFileSync('server/routes/aiChat.ts', code);
