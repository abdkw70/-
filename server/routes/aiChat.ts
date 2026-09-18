import { Router } from 'express';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db } from '../db.js';

export const aiChatRouter = Router();

let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai && (process.env.GEMINI_API_KEY || process.env.GEMINIAPIKEY)) {
    ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || process.env.GEMINIAPIKEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// ---------------- Tools ----------------
const searchStoreDeclaration: FunctionDeclaration = {
  name: 'searchStore',
  description: 'Search for products in the store by keyword, category, or generic term. IMPORTANT: Use short, broad keywords (e.g. use "ستاند" or "قلم" instead of long phrases) to get more results, then intelligently filter and compare them yourself.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'The search term. Leave empty to get random/popular products.' },
      minPrice: { type: Type.NUMBER, description: 'Minimum price in KWD (optional)' },
      maxPrice: { type: Type.NUMBER, description: 'Maximum price in KWD (optional)' },
      category: { type: Type.STRING, description: 'Specific category to filter by (optional)' }
    },
  },
};

const getProductDeclaration: FunctionDeclaration = {
  name: 'getProduct',
  description: 'Get full details of a specific product using its handle (slug). Useful for checking variants, stock, and detailed description.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      handle: { type: Type.STRING, description: 'The product handle (slug)' },
    },
    required: ['handle'],
  },
};

const getCartDetailsDeclaration: FunctionDeclaration = {
  name: 'getCartDetails',
  description: 'Get the current user\'s shopping cart details, including items, total price, and discounts.',
};

const addToCartDeclaration: FunctionDeclaration = {
  name: 'addToCart',
  description: 'Add a product to the user\'s cart. If the product has options/variants, you MUST ask the user which variant they want first, and then pass the variantId.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productId: { type: Type.STRING, description: 'The ID of the product' },
      variantId: { type: Type.STRING, description: 'The ID of the specific variant. If the product has variants, this is REQUIRED.' },
      quantity: { type: Type.NUMBER, description: 'Quantity to add (default is 1)' },
    },
    required: ['productId'],
  },
};

const getStorePoliciesDeclaration: FunctionDeclaration = {
  name: 'getStorePolicies',
  description: 'Get information about store shipping fees, discounts, free shipping thresholds, and gamification rewards.',
};


// ---------------- TTS Endpoint ----------------
aiChatRouter.post('/tts', async (req, res) => {
  const aiClient = getAI();
  if (!aiClient) return res.status(500).json({ error: 'Gemini API not configured' });
  
  const { text, lang } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });
  
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

    let audioBase64 = '';
    const audioPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith('audio/'));
    if (audioPart && audioPart.inlineData) {
      audioBase64 = audioPart.inlineData.data;
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


// ---------------- Router ----------------
aiChatRouter.post('/', async (req, res) => {
  const aiClient = getAI();
  if (!aiClient) {
    return res.status(500).json({ error: 'Gemini API is not configured on the server.' });
  }

  const { messages: rawMessages, sessionId, userName, userId, currentProductHandle, isAutoWelcome } = req.body;
  
  if (isAutoWelcome && currentProductHandle) {
    const product = db.getProducts().find(p => p.handle === currentProductHandle);
    if (!product) return res.json({ response: 'يا هلا فيك بمكتبة الشاطئ الأزرق!' });
    
    const prompt = `أنت موظف مبيعات حقيقي وطبيعي داخل "مكتبة الشاطئ الأزرق".
تسولف ويا الزبون بصوتك بشكل عفوي ومريح تماماً، مو روبوت ولا مترجم آلي.

العميل دخل للتو صفحة المنتج التالي:
الاسم: ${product.title}
السعر: ${product.price} دينار
القسم: ${product.categoryName || ''}

مهمتك:
رحّب بالعميل وتعرّف على المنتج بشكل طبيعي جداً وسريع (جملة أو جملتين فقط).
مثال للأسلوب الكويتي: "إي هذا ستاند المكتب الهرمي، سعره 300 فلس، وعنده خيارات بالحجم. تبيني أقولك الفرق بينهم؟"
مثال للأسلوب الإنجليزي: "Hey there! This is the acrylic stand, it's 300 fils. Let me know if you need to know the sizes."

تعليمات صارمة جداً:
1. الردود قصيرة وسريعة (جملة أو جملتين كحد أقصى).
2. لا تستخدم الفصحى نهائياً بالعربي (استخدم اللهجة الكويتية الدارجة).
3. لا تستخدم الأسلوب الآلي أو المترجم (ممنوع: مرحباً بك، طاب يومك، هذا المنتج يتميز بـ).
4. اذكر معلومة حقيقية ومهمة عن المنتج ثم توقف لانتظار تفاعل العميل.
5. لا تقرأ الوصف كاملاً أبداً، اذكر أهم 2 إلى 3 معلومات فقط.
6. لا تذكر معلومات غير موجودة ببيانات المنتج.
7. اكتب النص سادة فقط (PLAIN TEXT ONLY). ممنوع النجوم، ممنوع التشكيل، ممنوع الإيموجي، ممنوع الروابط، ممنوع العناوين، ممنوع الـ Markdown. اكتب فقط ما ستقوله بفمك.`;

    try {
      const aiClient = getAI();
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.8 }
      });
      
      let text = response.text || '';
      let suggestions = [];
      const sugRegex = /<SUGGESTIONS>([\s\S]*?)<\/SUGGESTIONS>/gi;
      let sugMatch = sugRegex.exec(text);
      if (sugMatch && sugMatch[1]) {
         suggestions = sugMatch[1].split(',').map(s => s.trim()).filter(s => s);
         text = text.replace(/<SUGGESTIONS>[\s\S]*?<\/SUGGESTIONS>/gi, '').trim();
      }
      return res.json({ response: text, productCards: [], suggestions });
    } catch (e) {
      console.error('Auto welcome error:', e);
      return res.json({ response: 'ممتاز، هذا المنتج متوفر حالياً. أقدر أساعدك إذا كان مناسب لاحتياجك.' });
    }
  }

  if (!rawMessages || !Array.isArray(rawMessages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }
  
  // Prevent context overflow and Rate Limit 429 errors by keeping only recent history (max 12 messages)
  const messages = rawMessages.slice(-12);

  const settings = db.getSettings();
  if ((settings as any).aiChatEnabled === false) {
    return res.status(403).json({ error: 'AI Chat is currently disabled.' });
  }

  // Enforce System Prompt & Strict Rules
  let baseInstruction = `أنت موظف مبيعات حقيقي وطبيعي داخل "مكتبة الشاطئ الأزرق" (Blue Beach Stationery) في الكويت.
تسولف ويا الزبون بصوتك بشكل عفوي ومريح تماماً، مو روبوت ولا مترجم آلي ولا قارئ نصوص.
تصرف وكأنك موظف فاهم منتجات المحل وتعرف شلون تساعد الزبون بسرعة ومن غير إزعاج.

تعليمات التحدث والأسلوب (صارمة جداً):
1. مطابقة لغة الزبون تلقائياً:
- إذا كلمك بالعربي، تكلّم باللهجة الكويتية الدارجة والعفوية بشكل طبيعي جداً مثل: "هلا والله"، "آمرني"، "شنو تدور اليوم؟"، "تبي شي حق الدوام ولا للدراسة؟".
- إذا كلمك بالإنجليزي، تكلّم فوراً بإنجليزي بشري طبيعي وعفوي جداً مثل: "Hey there! Sure, what kind of pens are you looking for today?".
- ممنوع الأسلوب الآلي أو المترجم: بالعربي ممنوع الفصحى تماماً (ممنوع: مرحباً بك، يسعدني مساعدتك، كيف يمكنني مساعدتك، طاب يومك). بالإنجليزي ممنوع (Greetings, how may I assist your purchase today).
- لا تتكلم وكأنك تقرأ من قاعدة بيانات أو وصف منتج.

2. الردود قصيرة وسريعة:
- خل الرد الصوتي عادة جملة أو جملتين فقط. لا تطول بالكلام لأن الزبون ممكن يمل أو ينزعج من الصوت.
- قل أهم معلومة أولاً ثم اسأل سؤال خفيف يكمل الحوار.
- إذا الزبون يبي تفاصيل أكثر، عطه التفاصيل على دفعات قصيرة بدل ما تعطيه كل المعلومات مرة وحدة.

3. الاعتماد على البيانات الحقيقية:
- اذكر المعلومات الحقيقية والمهمة الخاصة بالمنتج نفسه.
- إذا كانت المعلومات موجودة في قاعدة البيانات، استخدمها بدقة.
- إذا كانت المعلومة غير موجودة، لا تخمنها ولا تخترعها ولا تقولها وكأنها حقيقة.
- إذا كان المنتج يحتوي على خيارات أو Variants، اشرح الفرق بينها (مثل اختلاف السعر أو الحجم) إذا كانت هذه البيانات موجودة.

4. التفاصيل دقيقة وسريعة:
- لا تقرأ وصف المنتج بالكامل حتى لو كان طويلاً. اذكر أهم 2 إلى 4 معلومات، ثم خل الزبون يطلب المزيد.
- إذا ضغط الزبون على خيار مثل "تفاصيل أكثر"، أعطه المعلومات الإضافية المهمة بشكل مختصر.
- إذا سأل عن السعر، جاوبه بالسعر مباشرة بدون إعادة شرح المنتج. إذا سأل عن المقاس، جاوبه بالمقاس مباشرة.
- إذا سأل هل المنتج يناسب استخدام معين، افحص بيانات المنتج أولاً ثم جاوبه.

5. طريقة الحوار والتفاعل:
- لا تجعل كل رد ينتهي بنفس السؤال. غيّر أسلوبك حسب سياق الحوار.
- استخدم عبارات طبيعية قصيرة مثل: إي، أكيد، تمام، ولا يهمك، شوف، عندك هالخيار، هذا أنسب لك. لكن لا تكررها بشكل مصطنع.
- إذا كان الزبون يتصفح المنتجات فقط، لا تستمر بالكلام مع كل حركة بدون سبب. 
- بعد الجملة الأولى توقف مباشرة وخله يقرر إذا يبي يكمل.

6. كتابة النص الصوتي (الأهم):
- اكتب النص الذي سيتم تحويله إلى صوت كنص سادة فقط (PLAIN TEXT ONLY).
- لا تستخدم نجوم (*). لا تستخدم نقاط أو تعداد (- أو 1. 2.). لا تستخدم تشكيل. لا تستخدم إيموجي. لا تستخدم روابط. لا تستخدم Markdown.
- كل نص ترسله يجب أن يكون جمل متسلسلة وطبيعية وسهلة النطق، وكأن موظف حقيقي قالها بصوته للزبون.

8. أزرار الدردشة المقترحة (Suggestions):
في نهاية كل رد، اقترح 3 أو 4 أزرار ردود سريعة ذكية تناسب كلامك والمنتج الحالي لتسهيل الحوار على العميل.
ضع هذه الخيارات بين علامات <SUGGESTIONS> وافصل بينها بفاصلة.
مثال: <SUGGESTIONS>شنو الخيارات؟,يناسب استخدامي؟,أضفه للسلة</SUGGESTIONS>

7. الأدوات والسلة والبحث:
- إذا طلب عدة منتجات معاً، حللها وابحث عنها كلها. جهزها للسلة واستفسر عن الخيارات إذا لزم الأمر.
- إذا قال "أضفه للسلة"، استخدم أداة addToCart.
- لا تخترع أبداً منتجات أو أسعار أو أرقام. 

*** عرض المنتجات (Product Cards) ***
لعرض المنتجات التي تنصح بها، يجب عليك وضع المقابض (handles) الحقيقية للمنتجات كما رجعت لك من قاعدة البيانات (عبر أداة searchStore) داخل هذه العلامات:
<PRODUCT_CARDS>handle1,handle2</PRODUCT_CARDS>
تنبيه هام جداً: إياك أن تخترع مقابض (handles) من عندك! استخدم فقط الـ handle الدقيق الخاص بالمنتج الموجود في نتيجة البحث.

${currentProductHandle ? '\nتنبيه: المستخدم يتصفح حالياً صفحة المنتج: ' + currentProductHandle + ' . استخدم هذه المعلومة للتعرف على المنتج وبدء الكلام بشكل مختصر وطبيعي جداً.' : ''}`;

  if (userName) {
    baseInstruction += `\n\nمعلومة هامة عن المستخدم الحالي:
- المستخدم مسجل الدخول حالياً باسم: "${userName}".
- يجب عليك استخدام هذا الاسم "${userName}" عند التحدث معه للترحيب به ولجعله يشعر بالاهتمام بطريقة كويتية عفوية (مثلاً: يا هلا بـ ${userName}، أو حياك الله يا ${userName}). لا تخمن أسماء أخرى.`;
  }


  try {
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const tools = [{
      functionDeclarations: [
        searchStoreDeclaration,
        getProductDeclaration,
        getCartDetailsDeclaration,
        addToCartDeclaration,
        getStorePoliciesDeclaration
      ]
    }];

    const generateWithRetry = async (params: any, retries = 2): Promise<any> => {
      try {
        return await aiClient!.models.generateContent(params);
      } catch (e: any) {
        if (retries > 0 && (e?.status === 503 || e?.status === 429 || e?.message?.includes('503') || e?.message?.includes('429') || e?.message?.includes('Quota'))) {
          await new Promise(r => setTimeout(r, 1500));
          return generateWithRetry(params, retries - 1);
        }
        throw e;
      }
    };

    let response = await generateWithRetry({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction: baseInstruction,
        tools,
        toolConfig: { includeServerSideToolInvocations: true },
        temperature: 0.7,
      }
    });

    let functionCalls = response.functionCalls;
    let turnCount = 0;

    // Loop for handling multiple sequential tool calls
    while (functionCalls && functionCalls.length > 0 && turnCount < 4) {
      turnCount++;
      const call = functionCalls[0];
      const name = call.name;
      const args = call.args as any;
      let toolResult: any = { error: 'Unknown tool' };

      try {
        if (name === 'searchStore') {
          const term = (args.query || '').toLowerCase().trim();
          let allProducts = db.getProducts().filter(p => p.isInStock !== false);
          
          if (args.category) {
            allProducts = allProducts.filter(p => 
              p.categoryName?.toLowerCase().includes(args.category.toLowerCase()) ||
              p.subcategoryName?.toLowerCase().includes(args.category.toLowerCase())
            );
          }
          if (args.minPrice !== undefined) allProducts = allProducts.filter(p => p.price >= args.minPrice);
          if (args.maxPrice !== undefined) allProducts = allProducts.filter(p => p.price <= args.maxPrice);

          if (term) {
            allProducts = allProducts.filter(p => 
              p.title.toLowerCase().includes(term) || 
              (p.titleEn && p.titleEn.toLowerCase().includes(term)) ||
              (p.description && p.description.toLowerCase().includes(term))
            );
          }
          
          toolResult = allProducts.slice(0, 15).map(p => ({
            id: p.id,
            handle: p.handle,
            title: p.title,
            price: p.price,
            hasVariants: p.variants?.length > 0
          }));
        } 
        else if (name === 'getProduct') {
          const product = db.getProducts().find(p => p.handle === args.handle);
          if (product) {
            toolResult = {
              id: product.id,
              title: product.title,
              description: product.description,
              price: product.price,
              isInStock: product.isInStock,
              variants: product.variants?.map(v => ({ id: v.id, title: v.title, price: v.price, isInStock: v.isInStock })) || [],
              options: product.options || []
            };
          } else {
            toolResult = { error: 'Product not found' };
          }
        }
        else if (name === 'getCartDetails') {
          toolResult = db.getCart(sessionId);
        }
        else if (name === 'addToCart') {
          const { productId, variantId, quantity = 1 } = args;
          const product = db.getProducts().find(p => p.id === productId);
          if (!product) {
            toolResult = { error: 'Product not found' };
          } else {
            const cart = db.getCart(sessionId);
            
            // Check variant if required
            let valid = true;
            if (product.variants?.length > 0 && !variantId) {
              toolResult = { error: 'Product has variants, please specify variantId' };
              valid = false;
            }
            
            if (valid) {
              let price = product.price;
              let title = product.title;
              if (variantId) {
                const variant = product.variants.find(v => v.id === variantId);
                if (variant) {
                  price = variant.price;
                  title = `${product.title} - ${variant.title}`;
                }
              }

              const existingItem = cart.items.find(i => i.productId === productId && i.variantId === variantId);
              if (existingItem) {
                existingItem.quantity += quantity;
              } else {
                cart.items.push({
                  id: Math.random().toString(36).substring(2, 9),
                  productId,
                  variantId,
                  handle: product.handle,
                  title,
                  price,
                  quantity,
                  image: product.images?.[0]?.src || ''
                });
              }
              db.updateCart(sessionId, cart);
              toolResult = { success: true, message: 'Added to cart successfully' };
            }
          }
        }
        else if (name === 'getStorePolicies') {
          const storeSettings = db.getSettings();
          toolResult = {
            shippingFee: storeSettings.standardShippingFee || 2,
            freeShippingThreshold: storeSettings.freeShippingEnabled ? storeSettings.freeShippingThreshold : 'Not available'
          };
        }
      } catch (e: any) {
        toolResult = { error: e.message };
      }

      // Add tool response to history
      const toolCallPart = response.candidates?.[0]?.content?.parts || [];
      contents.push({ role: 'model', parts: toolCallPart });
      contents.push({
        role: 'user',
        parts: [{
          functionResponse: {
            name: name,
            response: { result: toolResult }
          }
        } as any]
      });

      // Call AI again
      response = await generateWithRetry({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction: baseInstruction,
          tools,
          toolConfig: { includeServerSideToolInvocations: true },
        }
      });
      functionCalls = response.functionCalls;
    }

    let finalResponseText = response.text || '';
    
    let productCards: any[] = [];
    let suggestions: string[] = [];
    
    // Parse <SUGGESTIONS> tags
    const sugRegex = /<SUGGESTIONS>([\s\S]*?)<\/SUGGESTIONS>/gi;
    let sugMatch = sugRegex.exec(finalResponseText);
    if (sugMatch && sugMatch[1]) {
       suggestions = sugMatch[1].split(',').map(s => s.trim()).filter(s => s);
       finalResponseText = finalResponseText.replace(/<SUGGESTIONS>[\s\S]*?<\/SUGGESTIONS>/gi, '').trim();
    }


    // Parse <PRODUCT_CARDS> tags
    const cardRegex = /<PRODUCT_CARD[^>]*>([\s\S]*?)<\/PRODUCT_CARD[^>]*>/gi;
    let match;
    const handlesToFetch = new Set<string>();
    
    while ((match = cardRegex.exec(finalResponseText)) !== null) {
      if (match[1]) {
        match[1].split(',').forEach(h => handlesToFetch.add(h.trim()));
      }
    }

    if (handlesToFetch.size > 0) {
      const allProducts = db.getProducts();
      
      const normalizeHandle = (h: string) => h.replace(/[^\p{L}\p{N}-]/gu, '').toLowerCase();
      const normalizedHandlesToFetch = Array.from(handlesToFetch).map(normalizeHandle);

      productCards = allProducts.filter(p => {
        const pHandle = normalizeHandle(p.handle);
        return normalizedHandlesToFetch.includes(pHandle) || normalizedHandlesToFetch.includes(p.id.toLowerCase());
      });

      // Remove tags from text
      finalResponseText = finalResponseText.replace(/<PRODUCT_CARD[^>]*>([\s\S]*?)<\/PRODUCT_CARD[^>]*>/gi, '').trim();
    }

    return res.json({
      response: finalResponseText,
      productCards,
      suggestions
    });

  } catch (err: any) {
    console.error('AI Chat Error:', err);
    import('fs').then(fs => fs.appendFileSync('ai-chat-error.log', new Date().toISOString() + ' ' + (err.stack || err.message || JSON.stringify(err)) + '\n'))
    if (err?.status === 503 || err?.message?.includes('503') || err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('High demand')) {
      return res.json({ 
        response: 'عذراً، أواجه ضغطاً عالياً في الوقت الحالي. يرجى المحاولة مرة أخرى بعد قليل.' 
      });
    }
    
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Quota') || err?.message?.includes('quota') || err?.message?.includes('exhausted') || err?.status === 'RESOURCE_EXHAUSTED') {
      return res.json({ 
        response: 'عذراً، أواجه ضغطاً عالياً في الوقت الحالي. يرجى المحاولة مرة أخرى بعد قليل.' 
      });
    }
    res.status(500).json({ error: err.message });

  }
});
