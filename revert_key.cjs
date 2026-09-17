const fs = require('fs');
let content = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

content = content.replace(
  /\(process\.env\.GEMINI_API_KEY \|\| process\.env\.GEMINIAPIKEY\)/g,
  "process.env.GEMINI_API_KEY"
);

fs.writeFileSync('server/routes/aiChat.ts', content);
