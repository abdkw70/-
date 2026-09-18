require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const aiClient = new GoogleGenAI();
async function run() {
  const text = "هلا والله، شلونك؟";
  const lang = "ar-SA";
  try {
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
    console.log("SUCCESS!");
  } catch (e) {
    console.log("FAILED!", e.message);
  }
}
run();
