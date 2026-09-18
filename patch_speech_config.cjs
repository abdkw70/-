const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(
  /speech_config:\s*\{\s*language: lang \|\| "ar-SA",\s*voice: lang && lang\.includes\("en"\) \? "zephyr" : "kore"\s*\}/m,
  `speech_config: {
          voice_config: {
            prebuilt_voice_config: {
              voice_name: lang && lang.includes("en") ? "Zephyr" : "Kore"
            }
          }
        }`
);

fs.writeFileSync('server/routes/aiChat.ts', code);
