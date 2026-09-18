const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const response = await ai.models.list();
  // Depending on SDK version, it might be an iterator or an array
  for await (const m of response) {
    if (m.name.includes("gemini")) {
      console.log(m.name);
    }
  }
}
run();
