const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(
  /const \{ messages: rawMessages, sessionId, userName, userId \} = req\.body;/,
  'const { messages: rawMessages, sessionId, userName, userId, currentProductHandle } = req.body;'
);

fs.writeFileSync('server/routes/aiChat.ts', code);
