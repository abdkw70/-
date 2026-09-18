const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

// 1. Add TTS streaming endpoint to server/routes/aiChat.ts
const ttsEndpoint = `
// ---------------- TTS Endpoint ----------------
aiChatRouter.post('/tts', async (req, res) => {
  const aiClient = getAI();
  if (!aiClient) return res.status(500).json({ error: 'Gemini API not configured' });
  
  const { text, lang } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });
  
  try {
    const interaction = await aiClient.interactions.create({
      model: 'gemini-3.1-flash-tts-preview',
      input: text,
      response_modalities: ['AUDIO'],
      generation_config: {
        speech_config: {
          language: lang || "ar-SA",
          voice: lang && lang.includes("en") ? "zephyr" : "kore" 
        }
      }
    });

    let audioBase64 = '';
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const audioContent = step.content?.find((c: any) => c.type === 'audio');
        if (audioContent && audioContent.data) {
          audioBase64 = audioContent.data;
          break;
        }
      }
    }
    
    if (audioBase64) {
      return res.json({ audioData: audioBase64 });
    } else {
      return res.status(500).json({ error: 'No audio generated' });
    }
  } catch (e) {
    console.error('TTS error:', e);
    return res.status(500).json({ error: String(e) });
  }
});
`;

code = code.replace(/\/\/ ---------------- Router ----------------/, ttsEndpoint + '\n\n// ---------------- Router ----------------');
fs.writeFileSync('server/routes/aiChat.ts', code);
