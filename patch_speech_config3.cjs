const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(
  /generation_config:\s*\{\s*speechConfig:\s*\{\s*voiceConfig:\s*\{\s*prebuiltVoiceConfig:\s*\{\s*voiceName: lang && lang\.includes\("en"\) \? "Zephyr" : "Kore"\s*\}\s*\}\s*\}\s*\}\s*\}/m,
  `generationConfig: {
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: lang && lang.includes("en") ? "Zephyr" : "Kore"
            }
          }
        }
      }`
);

fs.writeFileSync('server/routes/aiChat.ts', code);
