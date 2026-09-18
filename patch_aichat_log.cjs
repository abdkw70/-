const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(
  /console\.error\('AI Chat Error:', err\);/,
  `console.error('AI Chat Error:', err);
    require('fs').appendFileSync('ai-chat-error.log', new Date().toISOString() + ' ' + (err.stack || err.message || JSON.stringify(err)) + '\\n');`
);

fs.writeFileSync('server/routes/aiChat.ts', code);
