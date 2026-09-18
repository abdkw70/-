const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(
  /response_modalities:\s*\['AUDIO'\]/,
  "response_modalities: ['audio']"
);

fs.writeFileSync('server/routes/aiChat.ts', code);
