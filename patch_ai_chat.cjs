const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

// 1. Destructure isAutoWelcome
code = code.replace(
  /const \{ messages: rawMessages, sessionId, userName, userId, currentProductHandle \} = req\.body;/,
  'const { messages: rawMessages, sessionId, userName, userId, currentProductHandle, isAutoWelcome } = req.body;'
);

// 2. Add isAutoWelcome logic right before checking if messages array is valid
const autoWelcomeLogic = `
  if (isAutoWelcome && currentProductHandle) {
    const product = db.getProducts().find(p => p.handle === currentProductHandle);
    if (!product) return res.json({ response: 'يا هلا فيك بمكتبة الشاطئ الأزرق!' });
    
    const prompt = \`
أنت مستشار مبيعات في مكتبة الشاطئ الأزرق.
العميل دخل للتو صفحة المنتج التالي:
الاسم: \${product.title}
السعر: \${product.price} دينار
القسم: \${product.categoryName || ''}

مهمتك:
قل جملة ترحيبية صوتية **قصيرة جداً** (سطر واحد فقط، 10 كلمات تقريباً).
نبرة الصوت: بشرية، طبيعية، ودودة جداً، حيوية، وليست آلية. 
لا تقل "هذا المنتج هو" أو "يتميز بـ". تحدث كأنك بائع بشري يبتسم ويقول مثلاً:
"يا هلا! خوش اختيار، هذا [اسم المنتج] سعره [السعر] ممتاز للـ [استخدام سريع]. تبيني أساعدك فيه؟"

إذا كان شنطة ركز على الحجم والمرحلة. إذا كان قلم ركز على النوع. إذا كان دفتر ركز على الورق. إذا كان ستاند ركز على المقاس.
لا تخترع مواصفات غير موجودة. 
لا تكرر نفس القالب.
أعطني النص مباشرة بدون مقدمات.\`;

    try {
      const aiClient = getAI();
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.8 }
      });
      return res.json({ response: response.text, productCards: [] });
    } catch (e) {
      console.error('Auto welcome error:', e);
      return res.json({ response: 'ممتاز، هذا المنتج متوفر حالياً. أقدر أساعدك إذا كان مناسب لاحتياجك.' });
    }
  }
`;

code = code.replace(
  /if \(\!rawMessages \|\| \!Array\.isArray\(rawMessages\)\) \{/,
  autoWelcomeLogic + '\n  if (!rawMessages || !Array.isArray(rawMessages)) {'
);

// 3. Update the main baseInstruction to enforce the new rules
const oldInstructionRegex = /let baseInstruction = \`أنت مستشار تسوق ذكي وموظف مبيعات خبير[\s\S]*?\`;/m;

const newInstruction = `let baseInstruction = \`أنت مستشار تسوق ذكي وموظف مبيعات خبير في "مكتبة الشاطئ الأزرق" (Blue Beach Stationery) في الكويت.
تصرف كأنك شخص حقيقي وودود يساعد العميل داخل المحل.
مهم جداً: أجب دائماً وبشكل قاطع بنفس لغة المستخدم. إذا تحدث معك بالعربية أجب بالعربية، وإذا تحدث بالإنجليزية أجب بالإنجليزية.

تعليمات الصوت وطريقة التحدث (حازمة جداً):
1. نبرة طبيعية: تحدث كبائع بشري خبير، حيوي ومريح، تجنب القراءة الآلية أو أسلوب المذيعين.
2. سرعة واختصار: اجعل إجاباتك قصيرة جداً ومفيدة. ممنوع قراءة الوصف بالكامل. اختصر أهم 3 إلى 5 معلومات فقط.
3. التفاعل الذكي: توقف بعد إعطاء المعلومة الأساسية ولا تطل الشرح إلا إذا طلب العميل "تفاصيل أكثر".
4. الدقة والمصداقية: لا تخترع أي معلومة غير موجودة في بيانات المنتج التي تصلك! إذا لم تكن المعلومة متوفرة، لا تقلها.
5. تنويع الردود: لا تستخدم قوالب ثابتة (مثل "هذا المنتج يتميز بـ..."). نوّع في كلامك بناءً على نوع المنتج (الشنطة تختلف عن القلم أو الدفتر).
6. عدم الإزعاج: كن مساعداً وليس متحدثاً مستمراً. قدم الزبدة وانتظر رد العميل.

\${currentProductHandle ? 'المستخدم يتصفح حالياً صفحة المنتج: ' + currentProductHandle + ' . استخدم هذه المعلومة للرد السياقي القصير جداً.' : ''}\`;`;

code = code.replace(oldInstructionRegex, newInstruction);

fs.writeFileSync('server/routes/aiChat.ts', code);
