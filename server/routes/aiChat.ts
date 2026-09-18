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

// ---------------- Text Normalization & Search Helpers ----------------
function toSafeString(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.ar || val.en || '';
  return String(val);
}

function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel/diacritics
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // Replace punctuation with space
    .trim();
}

const SYNONYM_GROUPS: string[][] = [
  ['ستاند', 'استاند', 'حامل', 'مسند', 'تثبيت', 'stand', 'holder'],
  ['شنطة', 'شنط', 'حقيبة', 'حقائب', 'باك باك', 'باق', 'bag', 'backpack', 'schoolbag'],
  ['دفتر', 'دفاتر', 'كشكول', 'كشاكيل', 'كراسة', 'نوتة', 'نوته', 'مذكرة', 'notebook', 'diary'],
  ['قلم', 'اقلام', 'حبر', 'جاف', 'رصاص', 'تحديد', 'هايلايتر', 'ماركر', 'pen', 'pencil', 'marker'],
  ['الوان', 'تلوين', 'رسم', 'فرش', 'فرشاة', 'كانفس', 'اكريليك', 'مائي', 'colors', 'paint', 'art'],
  ['مقلمة', 'مقالم', 'حافظة اقلام', 'pencil case', 'case'],
  ['ملف', 'ملفات', 'فايل', 'دوسيه', 'دوسيات', 'حافظة', 'folder', 'file'],
  ['مقص', 'لاصق', 'صمغ', 'تجليد', 'جلاد', 'دباسة', 'خرامة', 'glue', 'scissors', 'stapler'],
  ['ابتدائي', 'اطفال', 'مدرسة', 'مدرسي', 'روضة', 'primary', 'school', 'kids']
];

function expandWithSynonyms(words: string[]): string[] {
  const result = new Set<string>(words);
  for (const word of words) {
    for (const group of SYNONYM_GROUPS) {
      const normalizedGroup = group.map(normalizeArabic);
      if (normalizedGroup.some(g => g.includes(word) || word.includes(g))) {
        normalizedGroup.forEach(item => result.add(item));
      }
    }
  }
  return Array.from(result);
}

// ---------------- Tools Definitions ----------------
const searchStoreDeclaration: FunctionDeclaration = {
  name: 'searchStore',
  description: 'Search for products in the store by keyword, category, price, or specific feature (e.g. A4 size, stand, backpack). Returns real products with titles, prices, stock, variants, and descriptions.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'The search term (e.g. "ستاند كتب A4", "شنطة مدرسة", "أقلام حبر").' },
      minPrice: { type: Type.NUMBER, description: 'Minimum price in KWD (optional)' },
      maxPrice: { type: Type.NUMBER, description: 'Maximum price in KWD (optional)' },
      category: { type: Type.STRING, description: 'Category or subcategory to filter by (optional)' }
    },
  },
};

const getProductDeclaration: FunctionDeclaration = {
  name: 'getProduct',
  description: 'Get full details of a specific product using its handle (slug) or ID. Returns complete description, sizes, colors, variants, prices, and stock.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      handle: { type: Type.STRING, description: 'The product handle or ID' },
    },
    required: ['handle'],
  },
};

const getCartDetailsDeclaration: FunctionDeclaration = {
  name: 'getCartDetails',
  description: 'Get the current user\'s shopping cart details, including items, quantities, total price, and shipping info.',
};

const addToCartDeclaration: FunctionDeclaration = {
  name: 'addToCart',
  description: 'Add a product to the user\'s shopping cart. If the product has variants (such as sizes or colors), specify the variantId.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productId: { type: Type.STRING, description: 'The ID of the product' },
      variantId: { type: Type.STRING, description: 'The ID of the chosen variant (optional if product has no variants)' },
      quantity: { type: Type.NUMBER, description: 'Quantity to add (default is 1)' },
    },
    required: ['productId'],
  },
};

const getStorePoliciesDeclaration: FunctionDeclaration = {
  name: 'getStorePolicies',
  description: 'Get live, authentic information about store delivery fees, free shipping thresholds, delivery timing, currently active payment options (Cash on delivery, WhatsApp order), and return policy.',
};

const CANDIDATE_CHAT_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash'
];

// ---------------- AI Chat Router ----------------
aiChatRouter.post('/', async (req, res) => {
  const aiClient = getAI();
  if (!aiClient) {
    return res.status(500).json({ error: 'Gemini API is not configured on the server.' });
  }

  const { 
    messages: rawMessages, 
    sessionId, 
    userName, 
    userId, 
    currentProductHandle,
    currentCategoryHandle,
    recentProductHandles = [],
    recommendedProductHandles = [],
    currentLanguage = 'ar',
    isAutoWelcome, 
    requestId: incomingReqId 
  } = req.body;

  const requestId = incomingReqId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  // Handle Auto-Welcome when visiting a product page
  if (isAutoWelcome && currentProductHandle) {
    const product = db.getProducts().find(p => p.handle === currentProductHandle);
    if (!product) return res.json({ response: 'يا هلا فيك بمكتبة الشاطئ الأزرق! شلون أقدر أساعدك؟' });
    
    const prompt = `أنت المساعد الذكي لمكتبة الشاطئ الأزرق (Blue Beach Stationery) في الكويت.
العميل يتصفح حالياً صفحة المنتج التالي:
الاسم: ${toSafeString(product.title) || product.handle}
السعر: ${product.price} د.ك
القسم: ${product.categoryName || ''}
التوفر: ${product.isInStock ? 'متوفر' : 'غير متوفر حالياً'}
الخيارات: ${product.variants?.length ? product.variants.map(v => toSafeString(v.title)).join('، ') : 'لا يوجد خيارات'}

المهمة:
اكتب رسالة ترحيبية قصيرة وذكية (جملة أو جملتين فقط) ترحب بالعميل وتعرض مساعدته في هذا المنتج بالذات أو الإجابة عن مواصفاته ومقاساته وأسعاره.
استخدم لغة عربية ودية ومهذبة مع لمسة كويتية راقية (مثل: "يا هلا فيك! هذا المنتج متوفر، تحب تسأل عن المقاسات أو الألوان المتوفرة؟").
اكتب نصاً واضحاً ومباشراً بدون تعقيد.
في النهاية ضع اقتراحات سريعة للعميل بين <SUGGESTIONS>تفاصيل المقاسات,الألوان المتوفرة,أضف للسلة</SUGGESTIONS>`;

    try {
      let response: any = null;
      for (const m of CANDIDATE_CHAT_MODELS) {
        try {
          response = await aiClient.models.generateContent({
            model: m,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.7 }
          });
          if (response) break;
        } catch (e: any) {
          console.warn(`[Auto Welcome] Model ${m} fallback:`, e?.message?.slice(0, 60));
        }
      }
      if (!response) throw new Error('Auto welcome models failed');
      
      let text = response.text || '';
      let suggestions: string[] = [];
      const sugRegex = /<SUGGESTIONS>([\s\S]*?)<\/SUGGESTIONS>/gi;
      const sugMatch = sugRegex.exec(text);
      if (sugMatch && sugMatch[1]) {
        suggestions = sugMatch[1].split(',').map((s: string) => s.trim()).filter((s: string) => s);
        text = text.replace(/<SUGGESTIONS>[\s\S]*?<\/SUGGESTIONS>/gi, '').trim();
      }
      return res.json({ response: text, productCards: [product], suggestions });
    } catch (e) {
      console.error('Auto welcome error:', e);
      return res.json({ 
        response: 'يا هلا فيك! هذا المنتج متوفر في مكتبتنا، أقدر أساعدك بأي استفسار عن مواصفاته أو خياراته.',
        productCards: product ? [product] : [],
        suggestions: ['شنو تفاصيل المنتج؟', 'هل متوفر ألوان ثانية؟', 'أضفه للسلة']
      });
    }
  }

  if (!rawMessages || !Array.isArray(rawMessages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }
  
  // Maintain context across recent turns (up to 16 messages)
  const messages = rawMessages.slice(-16);

  const settings = db.getSettings();
  if ((settings as any).aiChatEnabled === false) {
    return res.status(403).json({ error: 'AI Chat is currently disabled.' });
  }

  // Detect products discussed previously in conversation for contextual follow-ups
  const allProductsInDb = db.getProducts();
  const previouslyMentionedHandles: string[] = [];
  
  for (const msg of messages) {
    const content = msg.content || '';
    for (const p of allProductsInDb) {
      const pTitle = toSafeString(p.title);
      if (
        (pTitle && content.includes(pTitle.slice(0, 15))) ||
        (p.handle && content.includes(p.handle))
      ) {
        if (!previouslyMentionedHandles.includes(p.handle)) {
          previouslyMentionedHandles.push(p.handle);
        }
      }
    }
  }

  // Build System Instructions
  let systemInstruction = `أنت المساعد الذكي لمبيعات وخدمة عملاء "مكتبة الشاطئ الأزرق" (Blue Beach Stationery) في دولة الكويت.
أنت خبير بجميع منتجات المكتبة، الأقسام، الأسعار، المواصفات، المخزون، والخيارات، وهدفك مساعدة العميل كأنك موظف مبيعات محترف وخبير داخل المحل.

*** القواعد الصارمة والأساسية ***:
1. فهم سياق المحادثة بالكامل والحفاظ عليه:
   - يجب أن تتذكر ما كان يتحدث عنه العميل في الرسائل السابقة.
   - إذا سأل العميل: "أبي ستاند لكتاب A4" ثم في الرسالة التالية قال: "في لون ثاني؟" أو "كم سعره؟" أو "أضفه للسلة"، افهم فوراً أنه يتكلم عن نفس المنتج أو المنتجات التي اقترحتها، ولا تطلب منه إعادة الشرح أبداً!
   - افحص خيارات الـ Variants لنفس المنتج وأجب بدقة.

2. الارتباط ببيانات المتجر الحقيقية فقط (ممنوع اختراع أي بيانات):
   - استخدم أداة searchStore أو getProduct للبحث في بيانات المتجر.
   - لا تخترع أبداً منتجاً، أو سعراً، أو مقاساً، أو لوناً، أو خياراً (Variant)، أو سياسة غير موجودة في بيانات المتجر.
   - إذا لم تجد المنتج المطلوب بدقة، قل ذلك بكل صدق ووضوح، ثم اقترح بدائل حقيقية متوفرة فعلياً في المتجر تناسب احتياجه.

3. تقديم توصيات ذكية حسب احتياج العميل:
   - افهم نية العميل واحتياجه الفعلي وليس فقط الكلمات المفتاحية.
   - مثال: إذا طلب ستاند لكتاب A4، ابحث في مواصفات الستاندات وتأكد أن الستاند يدعم حجم A4، ثم اشرح له لماذا هذا المنتج مناسب ورشحه له.
   - مثال: إذا طلب شنطة لطالب ابتدائي، رشح له الشنط المناسبة للأعمار الابتدائية مع ذكر السعر والمميزات.

4. عرض بطاقات المنتجات (Product Cards):
   - عند ترشيح أو ذكر منتجات، ضع المقابض (handles) الحقيقية للمنتجات داخل هذا الوسم بالضبط:
     <PRODUCT_CARDS>handle1,handle2</PRODUCT_CARDS>
   - سيقوم النظام بتحويل هذه المقابض إلى بطاقات منتجات تفاعلية كاملة مع الصورة، السعر، الخصم، زر إضافة للسلة، واختيار الـ Variant!
   - تنبيه: استخدم فقط مقابض حقيقية رجعت لك من أداة searchStore أو getProduct.

5. خيارات سريعة وسياقية (Quick Actions):
   - في نهاية كل رد، اقترح دائماً 3 إلى 5 خيارات سريعة ذكية تناسب سياق المحادثة تحديداً (لا تعرض خيارات عشوائية).
   - ضعها داخل الوسم التالي:
     <SUGGESTIONS>خيار 1,خيار 2,خيار 3</SUGGESTIONS>
   - أمثلة حسب السياق:
     - عند اقتراح منتج: <SUGGESTIONS>عرض التفاصيل,الألوان والمقاسات,أضف للسلة,منتجات مشابهة</SUGGESTIONS>
     - عند السؤال عن الدفع أو الشحن: <SUGGESTIONS>كم مدة التوصيل؟,طرق الدفع المتاحة,العودة للمنتجات</SUGGESTIONS>

6. الأسلوب والتنسيق والسرعة:
   - تطابق اللغة: إذا كلمك العميل بالعربي، تكلّم بعربية راقية وسلسة مع لمسة كويتية/خليجية محبوبة ومرحبة (مثل: "أكيد يا هلا"، "عندنا هالخيارات الممتازة لك"). وإذا كلمك بالإنجليزي، أجب بإنجليزي سليم ومحترف.
   - استخدم Markdown الخفيف (نقاط عريضة -، وتغميق الكلمات المهمة **السعر**) لترتيب المعلومات وسهولة القراءة.
   - الردود تكون واضحة، مختصرة، ومنظمة بدون حشو أو إطالة غير مفيدة، مع إيموجي خفيف ومناسب.
   - لا تكرر نفس الكلام أو الأسئلة السابقة.

7. طرق الدفع وسياسة المتجر الحقيقية (STORE TRUTH - صارم جداً):
   - طرق الدفع المعتمدة حالياً في المتجر:
     1. الدفع نقداً عند الاستلام (Cash on Delivery).
     2. إرسال الطلب وإتمام الدفع والمتابعة مباشرة عبر الواتساب (WhatsApp).
     * تنبيه حاسم: بوابات الدفع الإلكتروني (KNET, Visa, Mastercard, Apple Pay) غير مفعلة حالياً في الموقع. ممنوع منعاً باتاً أن تذكر أن KNET أو البطاقات الائتمانية أو Apple Pay متوفرة حالياً، وإذا سألك العميل عن KNET أو الفيزا، قل له بوضوح: "الدفع حالياً متوفر نقداً عند الاستلام، أو إرسال الطلب ومتابعته عبر الواتساب، وبوابات الدفع الإلكتروني مثل KNET غير مفعلة حالياً بالموقع".
   - الشحن والتوصيل:
     - رسوم التوصيل القياسية لجميع مناطق الكويت: ${settings.standardShippingFee ?? settings.shippingFee ?? 2} د.ك.
     - التوصيل المجاني: ${settings.freeShippingEnabled ? `مفعل للطلبات بقيمة ${settings.freeShippingThreshold} د.ك أو أكثر.` : 'غير مفعل حالياً (تطبق رسوم التوصيل على جميع الطلبات).'}
     - مدة التوصيل: خلال 24 - 48 ساعة لكافة مناطق الكويت.
   - سياسة الاسترجاع والاستبدال:
     - 14 يوماً من تاريخ استلام الطلب، بشرط أن تكون المنتجات بحالتها الأصلية غير مستخدمة ومغلفة بغلافها الأصلي مع وجود الفاتورة.

8. سياق العميل والتصفح الحالي:
${userName ? `- العميل مسجل الدخول حالياً باسم: "${userName}". خاطبه باسمه باحترام وترحاب (مثلاً: "يا هلا فيك يا ${userName}" أو "حياك الله يا ${userName}"). لا تخترع أسماء أخرى.` : '- العميل زائر (لم يسجل اسمه بعد)، رحب به بشكل طبيعي دون اختراع اسم.'}
${currentProductHandle ? `- العميل يتصفح حالياً صفحة المنتج: "${currentProductHandle}".` : ''}
${currentCategoryHandle ? `- العميل يتصفح حالياً قسم: "${currentCategoryHandle}". إذا سأل العميل، ركز على خيارات هذا القسم واقترح له خيارات فرعية سريعة مناسبة له.` : ''}
${previouslyMentionedHandles.length > 0 ? `- المنتجات التي تم التحدث عنها مؤخراً في الجلسة: [${previouslyMentionedHandles.join(', ')}]. إذا سأل العميل أسئلة تابعة، اربطها بهذه المنتجات.` : ''}`;

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

    const generateWithFallback = async (params: { contents: any[], config: any }): Promise<any> => {
      let lastError: any = null;
      for (const modelName of CANDIDATE_CHAT_MODELS) {
        try {
          return await aiClient!.models.generateContent({
            model: modelName,
            contents: params.contents,
            config: params.config,
          });
        } catch (e: any) {
          lastError = e;
          const status = e?.status || e?.statusCode || e?.code;
          if (status === 400 || status === 401 || status === 403) {
            throw e;
          }
        }
      }
      throw lastError;
    };

    let response = await generateWithFallback({
      contents,
      config: {
        systemInstruction,
        tools,
        toolConfig: { includeServerSideToolInvocations: true },
        temperature: 0.7,
      }
    });

    let functionCalls = response.functionCalls;
    let turnCount = 0;
    let lastSearchedHandles: string[] = [];

    // Loop for handling tools
    while (functionCalls && functionCalls.length > 0 && turnCount < 4) {
      turnCount++;
      const call = functionCalls[0];
      const name = call.name;
      const args = call.args as any;
      let toolResult: any = { error: 'Unknown tool' };

      try {
        if (name === 'searchStore') {
          const rawQuery = (args.query || '').trim();
          const normalizedQuery = normalizeArabic(rawQuery);
          const rawTokens = normalizedQuery.split(/\s+/).filter(Boolean);
          const expandedTokens = expandWithSynonyms(rawTokens);

          let allProducts = db.getProducts();

          if (args.category) {
            const catQuery = normalizeArabic(args.category);
            allProducts = allProducts.filter(p => {
              const cName = normalizeArabic(p.categoryName || '');
              const sName = normalizeArabic(p.subcategoryName || '');
              return cName.includes(catQuery) || sName.includes(catQuery);
            });
          }

          if (args.minPrice !== undefined) allProducts = allProducts.filter(p => p.price >= args.minPrice);
          if (args.maxPrice !== undefined) allProducts = allProducts.filter(p => p.price <= args.maxPrice);

          // Scoring products based on relevance & synonyms
          interface ScoredProduct {
            product: any;
            score: number;
          }

          const scored: ScoredProduct[] = [];

          for (const p of allProducts) {
            const titleAr = toSafeString(p.title);
            const titleEn = p.titleEn || '';
            const desc = toSafeString(p.description);
            const normTitle = normalizeArabic(`${titleAr} ${titleEn}`);
            const normDesc = normalizeArabic(desc);
            const normHandle = normalizeArabic(p.handle || '');
            const normCat = normalizeArabic(`${p.categoryName || ''} ${p.subcategoryName || ''}`);
            
            let score = 0;

            if (rawTokens.length === 0) {
              // No query -> general products
              score = 1;
            } else {
              // Direct phrase match
              if (normTitle.includes(normalizedQuery)) score += 50;
              if (normHandle.includes(normalizedQuery)) score += 40;
              if (normDesc.includes(normalizedQuery)) score += 20;

              // Token matches
              for (const token of rawTokens) {
                if (normTitle.includes(token)) score += 15;
                if (normDesc.includes(token)) score += 6;
                if (normCat.includes(token)) score += 8;
                
                // Check in variants
                if (p.variants && Array.isArray(p.variants)) {
                  for (const v of p.variants) {
                    const vTitle = toSafeString(v.title);
                    if (normalizeArabic(vTitle).includes(token)) score += 10;
                  }
                }
              }

              // Synonym token matches
              for (const syn of expandedTokens) {
                if (!rawTokens.includes(syn)) {
                  if (normTitle.includes(syn)) score += 8;
                  if (normDesc.includes(syn)) score += 4;
                  if (normCat.includes(syn)) score += 5;
                }
              }
            }

            if (score > 0) {
              // Prefer in-stock products slightly
              if (p.isInStock) score += 5;
              scored.push({ product: p, score });
            }
          }

          scored.sort((a, b) => b.score - a.score);

          // If no matches found with query, fallback to popular in-stock items
          let finalMatches = scored.map(s => s.product);
          if (finalMatches.length === 0 && rawTokens.length > 0) {
            finalMatches = allProducts.filter(p => p.isInStock).slice(0, 6);
          }

          const results = finalMatches.slice(0, 10).map(p => {
            const title = toSafeString(p.title) || p.handle;
            const desc = toSafeString(p.description);
            return {
              id: p.id,
              handle: p.handle,
              title,
              titleEn: p.titleEn,
              price: p.price,
              compareAtPrice: p.compareAtPrice,
              discountPercentage: p.discountPercentage,
              category: p.categoryName,
              isInStock: p.isInStock,
              stockQuantity: p.stockQuantity,
              descriptionExcerpt: desc.slice(0, 180),
              variants: (p.variants || []).map((v: any) => ({
                id: v.id,
                title: toSafeString(v.title) || v.name || v.id,
                price: v.price,
                isInStock: v.stock !== undefined ? v.stock > 0 : v.isInStock !== false
              })),
              options: p.options || []
            };
          });

          lastSearchedHandles = results.map(r => r.handle);
          toolResult = { count: results.length, products: results };
        }
        else if (name === 'getProduct') {
          const product = db.getProducts().find(p => p.handle === args.handle || p.id === args.handle);
          if (product) {
            const title = toSafeString(product.title) || product.handle;
            const desc = toSafeString(product.description);
            toolResult = {
              id: product.id,
              handle: product.handle,
              title,
              titleEn: product.titleEn,
              description: desc,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              discountPercentage: product.discountPercentage,
              categoryName: product.categoryName,
              subcategoryName: product.subcategoryName,
              isInStock: product.isInStock,
              stockQuantity: product.stockQuantity,
              variants: (product.variants || []).map((v: any) => ({
                id: v.id,
                title: toSafeString(v.title) || v.name || v.id,
                sku: v.sku,
                price: v.price,
                compareAtPrice: v.compareAtPrice,
                stock: v.stock ?? v.stockQuantity,
                isInStock: v.stock !== undefined ? v.stock > 0 : v.isInStock !== false,
                selectedOptions: v.selectedOptions
              })),
              options: product.options || []
            };
          } else {
            toolResult = { error: 'Product not found in store' };
          }
        }
        else if (name === 'getCartDetails') {
          const cart = db.getCart(sessionId);
          const storeSettings = db.getSettings();
          const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const freeShipping = storeSettings.freeShippingEnabled && subtotal >= (storeSettings.freeShippingThreshold || 20);
          const shippingFee = freeShipping ? 0 : (storeSettings.standardShippingFee || 2);
          
          toolResult = {
            itemsCount: cart.items.length,
            subtotal,
            shippingFee,
            total: subtotal + shippingFee,
            items: cart.items.map(i => ({
              id: i.id,
              title: i.title,
              price: i.price,
              quantity: i.quantity,
              handle: i.handle
            }))
          };
        }
        else if (name === 'addToCart') {
          const { productId, variantId, quantity = 1 } = args;
          const product = db.getProducts().find(p => p.id === productId || p.handle === productId);
          
          if (!product) {
            toolResult = { error: 'Product not found' };
          } else {
            const cart = db.getCart(sessionId);
            let chosenVariant: any = null;
            
            if (product.variants?.length > 0) {
              if (variantId) {
                chosenVariant = product.variants.find(v => v.id === variantId);
              }
              if (!chosenVariant && product.variants.length === 1) {
                chosenVariant = product.variants[0];
              }
            }

            const itemPrice = chosenVariant ? chosenVariant.price : product.price;
            const pTitle = toSafeString(product.title) || product.handle;
            const vTitle = chosenVariant ? toSafeString(chosenVariant.title) : '';
            const itemTitle = vTitle ? `${pTitle} - ${vTitle}` : pTitle;

            const existingItem = cart.items.find(i => 
              i.productId === product.id && 
              (chosenVariant ? i.variantId === chosenVariant.id : !i.variantId)
            );

            if (existingItem) {
              existingItem.quantity += quantity;
            } else {
              cart.items.push({
                id: Math.random().toString(36).substring(2, 9),
                productId: product.id,
                variantId: chosenVariant?.id,
                handle: product.handle,
                title: itemTitle,
                price: itemPrice,
                quantity,
                image: product.images?.[0]?.src || ''
              });
            }
            db.updateCart(sessionId, cart);

            toolResult = {
              success: true,
              message: `تم إضافة ${itemTitle} إلى السلة بنجاح!`,
              productTitle: itemTitle,
              quantity,
              price: itemPrice,
              cartItemsTotal: cart.items.length
            };
          }
        }
        else if (name === 'getStorePolicies') {
          const storeSettings = db.getSettings();
          const fee = storeSettings.standardShippingFee ?? storeSettings.shippingFee ?? 2;
          toolResult = {
            standardShippingFee: `${fee} د.ك لجميع مناطق الكويت`,
            freeShipping: storeSettings.freeShippingEnabled 
              ? `توصيل مجاني للطلبات بقيمة ${storeSettings.freeShippingThreshold} د.ك أو أكثر` 
              : `التوصيل بسعر ثابت ${fee} د.ك لجميع مناطق الكويت`,
            deliveryTime: 'توصيل سريع خلال 24 - 48 ساعة لكافة مناطق الكويت',
            activePaymentMethods: [
              'الدفع نقداً عند الاستلام (Cash on Delivery)',
              'إرسال الطلب وإتمام الدفع والمتابعة مباشرة عبر الواتساب (WhatsApp)'
            ],
            inactivePaymentMethodsWarning: 'بوابات الدفع الإلكتروني (KNET / Visa / Mastercard / Apple Pay) غير مفعلة حالياً في الموقع. ممنوع منعاً باتاً ذكر أنها متوفرة.',
            returnsPolicy: 'إمكانية الاسترجاع والاستبدال خلال 14 يوماً من الاستلام بشرط أن يكون المنتج بحالته الأصلية غير مستخدم ومغلف بغلافه الأصلي مع وجود الفاتورة'
          };
        }
      } catch (e: any) {
        toolResult = { error: e.message };
      }

      // Append tool interaction to history
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

      response = await generateWithFallback({
        contents,
        config: {
          systemInstruction,
          tools,
          toolConfig: { includeServerSideToolInvocations: true },
        }
      });
      functionCalls = response.functionCalls;
    }

    let finalResponseText = response.text || '';
    if (!finalResponseText && response.candidates?.[0]?.content?.parts) {
      const textParts = response.candidates[0].content.parts.filter((p: any) => p.text).map((p: any) => p.text);
      if (textParts.length > 0) {
        finalResponseText = textParts.join('\n');
      }
    }
    
    let productCards: any[] = [];
    let suggestions: string[] = [];
    
    // Parse <SUGGESTIONS> tags
    const sugRegex = /<SUGGESTIONS>([\s\S]*?)<\/SUGGESTIONS>/gi;
    const sugMatch = sugRegex.exec(finalResponseText);
    if (sugMatch && sugMatch[1]) {
      suggestions = sugMatch[1].split(',').map((s: string) => s.trim()).filter((s: string) => s);
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

      finalResponseText = finalResponseText.replace(/<PRODUCT_CARD[^>]*>([\s\S]*?)<\/PRODUCT_CARD[^>]*>/gi, '').trim();
    }

    // Auto-populate cards from recent search tool if cards omitted but search was performed
    if (productCards.length === 0 && lastSearchedHandles.length > 0) {
      const allProducts = db.getProducts();
      productCards = allProducts.filter(p => lastSearchedHandles.slice(0, 4).includes(p.handle));
    }

    if (!finalResponseText || finalResponseText.trim().length < 5) {
      if (productCards && productCards.length > 0) {
        finalResponseText = 'تفضل يا الغالي، هذي المنتجات المناسبة لطلبك والمتوفرة عندنا بالمكتبة:';
      } else {
        finalResponseText = 'يا هلا فيك بمكتبة الشاطئ الأزرق! تفضل بأي استفسار وحاضر أساعدك بكل حب.';
      }
    }

    if (!suggestions || suggestions.length === 0) {
      if (productCards && productCards.length > 0) {
        suggestions = ['تفاصيل المنتج', 'الألوان والمقاسات', 'أضفه للسلة', 'منتجات مشابهة'];
      } else {
        suggestions = ['شنو المنتجات المتوفرة؟', 'عروض وخصومات اليوم', 'استفسار عن التوصيل والشحن'];
      }
    }

    return res.json({
      requestId,
      response: finalResponseText,
      productCards,
      suggestions
    });

  } catch (err: any) {
    const rawMsg = err?.message || String(err);
    const status = err?.status || err?.statusCode || err?.code || 500;
    console.error(`[AI Chat Error] requestId: ${requestId}`, rawMsg);

    return res.status(status === 429 ? 429 : 500).json({
      requestId,
      error: rawMsg,
      message: status === 429 
        ? 'عذراً، الخدمة عليها ضغط لحظي حالياً، يرجى الانتظار بضع ثوانٍ وإعادة المحاولة.'
        : 'عذراً يا الغالي، حدث خطأ بسيط بالاتصال، تفضل اسألني مرة ثانية وسأجاوبك فوراً.'
    });
  }
});

// ---------------- Real-time Sync Status Endpoint ----------------
aiChatRouter.get('/sync-status', (req, res) => {
  try {
    const status = db.getSyncStatus();
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get sync status' });
  }
});

// ---------------- Smart Product Recommendation Endpoint ----------------
aiChatRouter.post('/recommendation', async (req, res) => {
  try {
    const { productHandle, recentProductHandles = [], currentLanguage = 'ar' } = req.body;
    if (!productHandle) {
      return res.status(400).json({ error: 'productHandle is required' });
    }

    const allProducts = db.getProducts();
    const product = allProducts.find(p => p.handle === productHandle || p.id === productHandle);
    if (!product || !product.isInStock) {
      return res.json({ recommendation: null });
    }

    const isRtl = currentLanguage === 'ar';
    const title = toSafeString(isRtl ? product.title : (product.titleEn || product.title));
    const category = product.categoryName || '';
    const price = product.price;

    // Check if user recently viewed a product in the same category or with related tags
    let previousProduct: any = null;
    if (Array.isArray(recentProductHandles) && recentProductHandles.length > 0) {
      for (const h of recentProductHandles) {
        if (h !== productHandle) {
          const found = allProducts.find(p => p.handle === h || p.id === h);
          if (found) {
            previousProduct = found;
            break;
          }
        }
      }
    }

    let rationale = '';
    let inChatText = '';

    if (previousProduct && previousProduct.categoryId === product.categoryId) {
      const prevTitle = toSafeString(isRtl ? previousProduct.title : (previousProduct.titleEn || previousProduct.title));
      if (isRtl) {
        rationale = `هذا مشابه لـ "${prevTitle.slice(0, 20)}..." اللي شفته، لكن بسعر ${price} د.ك ومواصفات مختلفة تناسبك 👍`;
        inChatText = `شفت المنتج اللي فتحته (${title}) 👀\n\nأرشحه لك خصوصاً أنه في نفس قسم "${category}" ومشابه للخيار السابق لكن بمواصفات ومقاسات مخصصة.\n\n**السعر:** ${price} د.ك`;
      } else {
        rationale = `Similar to "${prevTitle.slice(0, 20)}..." you viewed, with dedicated specs at ${price} KWD 👍`;
        inChatText = `I noticed you are viewing (${title}) 👀\n\nI recommend this option especially for ${category} with dedicated specs.\n\n**Price:** ${price} KWD`;
      }
    } else {
      // Analyze title and specs for genuine recommendation
      const hasA4 = /A4/i.test(title) || /A4/i.test(product.description || '');
      const isStand = /ستاند|حامل|stand/i.test(title);
      const isBag = /شنطة|حقيبة|bag/i.test(title);
      const isPen = /قلم|أقلام|pen/i.test(title);

      if (isStand && hasA4) {
        rationale = isRtl 
          ? 'هذا ممكن يناسبك 👍 خصوصاً إذا كنت تبحث عن ستاند للكتب ومقاسه يدعم A4.'
          : 'This might suit you 👍 especially if you are looking for an A4 book or document stand.';
      } else if (isStand) {
        rationale = isRtl
          ? `ستاند عملي وأنيق للعرض والتنظيم بسعر ${price} د.ك ومناسب للمكتب أو المعرض.`
          : `A practical and sleek display stand at ${price} KWD, ideal for office or display.`;
      } else if (isBag) {
        rationale = isRtl
          ? 'خيار ممتاز ومريح ومناسب لحفظ وتنظيم الأغراض والكتب المدرسية.'
          : 'An excellent durable option for organizing books and school supplies.';
      } else if (isPen) {
        rationale = isRtl
          ? 'قلم عالي الجودة بكتابة سلسة وألوان واضحة ومميزة.'
          : 'High quality pen with smooth ink flow and clear lines.';
      } else {
        rationale = isRtl
          ? `منتج مميز في قسم ${category || 'المكتبة'} بسعر ${price} د.ك ومتوفر للتوصيل السريع.`
          : `Featured product in ${category || 'stationery'} at ${price} KWD, ready for fast delivery.`;
      }

      inChatText = isRtl
        ? `شفت المنتج اللي فتحته 👀\n\nأرشحه لك إذا كنت تبحث عن هذا النوع، خصوصاً بسبب جودته ومناسبته لاحتياجك في قسم "${category}".\n\n**السعر:** ${price} د.ك`
        : `I noticed you opened this product 👀\n\nI recommend it if you are looking for top quality in "${category}".\n\n**Price:** ${price} KWD`;
    }

    return res.json({
      recommendation: rationale,
      inChatPrompt: inChatText,
      product
    });
  } catch (err: any) {
    console.error('Error generating product recommendation:', err);
    return res.status(500).json({ error: 'Failed to generate recommendation' });
  }
});
