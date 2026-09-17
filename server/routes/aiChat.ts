import { Router } from 'express';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db } from '../db.js';

export const aiChatRouter = Router();

let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai && (process.env.GEMINI_API_KEY || process.env.GEMINIAPIKEY)) {
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
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  const settings = db.getSettings();
  if ((settings as any).aiChatEnabled === false) {
    return res.status(403).json({ error: 'AI Chat is currently disabled.' });
  }

  try {
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const systemInstruction = (settings as any).aiChatSystemPrompt || 'أنت مساعد ذكي متخصص في خدمة عملاء مكتبة الشاطئ الأزرق في الكويت.';

    // Helper to run with simple retry for 503
    const generateWithRetry = async (params: any, retries = 2): Promise<any> => {
      try {
        return await aiClient!.models.generateContent(params);
      } catch (e: any) {
        if (retries > 0 && e?.status === 503) {
          console.log(`[AI Chat] 503 High Demand, retrying... (${retries} left)`);
          await new Promise(r => setTimeout(r, 1500));
          return generateWithRetry(params, retries - 1);
        }
        throw e;
      }
    };

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [searchProductsDeclaration] }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    });

    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'searchProducts') {
        const query = (call.args as any).query as string;
        const term = (query || '').toLowerCase().trim();
        const allProducts = db.getProducts();
        
        let matches = [];
        if (term) {
           matches = allProducts.filter(p => 
              p.title.toLowerCase().includes(term) || 
              (p.titleEn && p.titleEn.toLowerCase().includes(term)) ||
              (p.description && p.description.toLowerCase().includes(term)) ||
              (p.categoryName && p.categoryName.toLowerCase().includes(term)) ||
              (p.subcategoryName && p.subcategoryName.toLowerCase().includes(term))
           ).slice(0, 15);
        } else {
           matches = allProducts.slice(0, 10);
        }
        
        const toolResult = matches.map(p => ({
          title: p.title,
          price: p.price,
          isInStock: p.isInStock,
          url: `/product/${p.handle}`
        }));

        const toolCallPart = response.candidates?.[0]?.content?.parts || [];
        const updatedContents = [
          ...contents,
          { role: 'model', parts: toolCallPart },
          { 
            role: 'user', 
            parts: [{ 
              functionResponse: { 
                name: 'searchProducts', 
                response: { result: toolResult } 
              } 
            }] 
          }
        ];

        const finalResponse = await generateWithRetry({
           model: 'gemini-3.8-flash',
           contents: updatedContents,
           config: {
             systemInstruction,
           }
        });

        return res.json({ response: finalResponse.text });
      }
    }

    return res.json({ response: response.text });
  } catch (err: any) {
    console.error('AI Chat Error:', err);
    if (err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('High demand')) {
      return res.json({ 
        response: 'عذراً، أواجه ضغطاً عالياً في الوقت الحالي. يرجى المحاولة مرة أخرى بعد قليل.' 
      });
    }
    res.status(500).json({ error: err.message });
  }
});
