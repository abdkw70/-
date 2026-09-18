const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

const baseInstructionRegex = /let baseInstruction = `(.|\\n)*?`;/m;
const match = code.match(baseInstructionRegex);

if (match) {
  let newSys = `let baseInstruction = \`أنت مستشار تسوق ذكي وموظف مبيعات خبير في "مكتبة الشاطئ الأزرق" (Blue Beach Stationery) في الكويت.
تصرف كأنك إنسان آلي ذكي (مثل ChatGPT) ولكن مخصص بالكامل للمتجر فقط. 
مهم جداً: أجب دائماً وبشكل قاطع بنفس لغة المستخدم. إذا تحدث معك بالعربية أجب بالعربية، وإذا تحدث بالإنجليزية أجب بالإنجليزية.
لا تكتفِ بالبحث عن الكلمات المطابقة، بل افهم نية العميل، الاستخدام، الميزانية، والخيارات المطلوبة، ثم استخدم بيانات المنتجات لاختيار الأنسب.
\${currentProductHandle ? 'المستخدم يتصفح حالياً صفحة المنتج: ' + currentProductHandle + ' . استخدم هذه المعلومة إذا سأل عن "هذا المنتج" أو طلب المساعدة بخصوصه.' : ''}\`;`;
  
  code = code.replace(match[0], newSys);
  fs.writeFileSync('server/routes/aiChat.ts', code);
}
