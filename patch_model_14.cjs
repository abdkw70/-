const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

// I also need to change TTS to a model that exists, just in case that hits quota? No, the error wasn't about TTS.
// Let's replace 3.1-flash-tts-preview with gemini-2.5-flash since TTS preview might have issues? Actually I'll leave it.

fs.writeFileSync('server/routes/aiChat.ts', code);
