const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(
  /console\.log\('HIT TTS ENDPOINT WITH:', req\.body\);\s*/,
  ""
);

fs.writeFileSync('server/routes/aiChat.ts', code);
