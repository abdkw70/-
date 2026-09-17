const fs = require('fs');
let content = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

content = content.replace(
  "process.env.GEMINI_API_KEY",
  "(process.env.GEMINI_API_KEY || process.env.GEMINIAPIKEY)"
).replace(
  "process.env.GEMINI_API_KEY",
  "(process.env.GEMINI_API_KEY || process.env.GEMINIAPIKEY)"
);

fs.writeFileSync('server/routes/aiChat.ts', content);
