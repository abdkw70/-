const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

const regex = /const interaction = await aiClient\.interactions\.create\(\{[\s\S]*?\}\);/m;

const replacement = `const response = await aiClient.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: text,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: lang && lang.includes("en") ? "Zephyr" : "Kore"
            }
          }
        }
      }
    });

    let audioBase64 = '';
    const audioPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith('audio'));
    if (audioPart && audioPart.inlineData) {
      audioBase64 = audioPart.inlineData.data;
    }`;

// Wait, the previous code had a loop over interaction.steps
// Let's just replace the try block in /tts endpoint

const ttsEndpointRegex = /try \{\s*const interaction = await aiClient\.interactions\.create\(\{[\s\S]*?if \(audioBase64\) \{/m;

const ttsReplacement = `try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: text,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: lang && lang.includes("en") ? "Zephyr" : "Kore"
            }
          }
        }
      }
    });

    let audioBase64 = '';
    const audioPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith('audio/'));
    if (audioPart && audioPart.inlineData) {
      audioBase64 = audioPart.inlineData.data;
    }
    
    if (audioBase64) {`;

code = code.replace(ttsEndpointRegex, ttsReplacement);

fs.writeFileSync('server/routes/aiChat.ts', code);
