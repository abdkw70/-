const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(
  /speech_config:\s*\{[\s\S]*?\}\s*\}\s*\}/m,
  `speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: lang && lang.includes("en") ? "Zephyr" : "Kore"
            }
          }
        }
      }`
);

fs.writeFileSync('server/routes/aiChat.ts', code);
