const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(
  /aiChatRouter\.post\('\/tts', async \(req, res\) => \{/,
  "aiChatRouter.post('/tts', async (req, res) => {\n  console.log('HIT TTS ENDPOINT WITH:', req.body);"
);

fs.writeFileSync('server/routes/aiChat.ts', code);
