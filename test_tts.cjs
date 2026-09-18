require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI();

async function run() {
  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.1-flash-tts-preview',
      input: 'hello',
      response_modalities: ['audio'],
      generation_config: {
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Zephyr"
            }
          }
        }
      }
    });
    console.log("SUCCESS");
  } catch (e) {
    console.log("FAILED", e);
  }
}

run();
