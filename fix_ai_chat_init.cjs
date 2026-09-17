const fs = require('fs');
let content = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

content = content.replace(
  /let ai: GoogleGenAI \| null = null;[\s\S]*?aiChatRouter\.post\('\/', async \(req, res\) => {/m,
  `let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

const searchProductsDeclaration: FunctionDeclaration = {
  name: 'searchProducts',
  description: 'Search for products in the store by keyword, category, or generic term.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search term (e.g. "ألوان", "شنطة", "قلم")',
      },
    },
    required: ['query'],
  },
};

aiChatRouter.post('/', async (req, res) => {
  const aiClient = getAI();
  if (!aiClient) {
    return res.status(500).json({ error: 'Gemini API is not configured on the server.' });
  }`
);

// We also need to change `ai.models...` to `aiClient.models...` inside the route
content = content.replace(/ai\.models\.generateContent/g, "aiClient.models.generateContent");

fs.writeFileSync('server/routes/aiChat.ts', content);
