const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

// Update auto-welcome prompt
code = code.replace(
  /اكتب فقط ما ستقوله بفمك\.\\\`\s*;/m,
  `اكتب فقط ما ستقوله بفمك.

8. اقتراح أزرار دردشة (Suggestions):
في نهاية نصك، اقترح 3 أو 4 أزرار خيارات سريعة مرتبطة جداً بالمنتج والسياق، وضعها بين علامات <SUGGESTIONS> هكذا:
<SUGGESTIONS>تفاصيل أكثر,الفرق بينهم,أضفه للسلة</SUGGESTIONS>
غيّر الخيارات لتناسب المنتج الحالي (مثلاً للشنطة: هل تناسب لابتوب؟ وللقلم: هل خطه عريض؟).\`;`
);

// Update baseInstruction
code = code.replace(
  /كل نص ترسله يجب أن يكون جمل متسلسلة وطبيعية وسهلة النطق، وكأن موظف حقيقي قالها بصوته للزبون\./m,
  `كل نص ترسله يجب أن يكون جمل متسلسلة وطبيعية وسهلة النطق، وكأن موظف حقيقي قالها بصوته للزبون.

8. أزرار الدردشة المقترحة (Suggestions):
في نهاية كل رد، اقترح 3 أو 4 أزرار ردود سريعة ذكية تناسب كلامك والمنتج الحالي لتسهيل الحوار على العميل.
ضع هذه الخيارات بين علامات <SUGGESTIONS> وافصل بينها بفاصلة.
مثال: <SUGGESTIONS>شنو الخيارات؟,يناسب استخدامي؟,أضفه للسلة</SUGGESTIONS>`
);

// Extract suggestions from finalResponseText
const parseSuggestionsRegex = /let productCards: any\[\] = \[\];/m;
const extractSuggestionsLogic = `
    let productCards: any[] = [];
    let suggestions: string[] = [];
    
    // Parse <SUGGESTIONS> tags
    const sugRegex = /<SUGGESTIONS>([\\s\\S]*?)<\\/SUGGESTIONS>/gi;
    let sugMatch = sugRegex.exec(finalResponseText);
    if (sugMatch && sugMatch[1]) {
       suggestions = sugMatch[1].split(',').map(s => s.trim()).filter(s => s);
       finalResponseText = finalResponseText.replace(/<SUGGESTIONS>[\\s\\S]*?<\\/SUGGESTIONS>/gi, '').trim();
    }
`;
code = code.replace(parseSuggestionsRegex, extractSuggestionsLogic);

// Add suggestions to the response
code = code.replace(
  /return res\.json\(\{\s*response: finalResponseText,\s*productCards\s*\}\);/m,
  `return res.json({\n      response: finalResponseText,\n      productCards,\n      suggestions\n    });`
);

// Also extract from autoWelcome!
code = code.replace(
  /return res\.json\(\{ response: response\.text, productCards: \[\] \}\);/m,
  `
      let text = response.text || '';
      let suggestions = [];
      const sugRegex = /<SUGGESTIONS>([\\s\\S]*?)<\\/SUGGESTIONS>/gi;
      let sugMatch = sugRegex.exec(text);
      if (sugMatch && sugMatch[1]) {
         suggestions = sugMatch[1].split(',').map(s => s.trim()).filter(s => s);
         text = text.replace(/<SUGGESTIONS>[\\s\\S]*?<\\/SUGGESTIONS>/gi, '').trim();
      }
      return res.json({ response: text, productCards: [], suggestions });`
);

fs.writeFileSync('server/routes/aiChat.ts', code);
