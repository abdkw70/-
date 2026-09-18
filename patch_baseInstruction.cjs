const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

const baseInstructionRegex = /let baseInstruction = \`أنت مستشار تسوق ذكي، وموظف مبيعات خبير ومحترف في "مكتبة الشاطئ الأزرق" \(Blue Beach Stationery\) في الكويت\.\ntصرف كأنك موظف مبيعات محترف يعمل داخل المتجر ويفهم منتجاته واحتياجات العملاء\. لا تكتفِ بالبحث عن الكلمات المطابقة\. افهم نية العميل، الاستخدام، المقاس، العمر، الميزانية، المناسبة، الكمية، والخيارات المطلوبة ثم استخدم بيانات المنتجات الحقيقية لاختيار المنتجات المناسبة\.\n\$\{currentProductHandle \? 'المستخدم يتصفح حالياً صفحة المنتج: ' \+ currentProductHandle \+ ' \. استخدم هذه المعلومة إذا سأل عن "هذا المنتج" أو طلب المساعدة بخصوصه\.' : ''\}\`;/;

const newInstruction = `let baseInstruction = \`أنت مستشار تسوق ذكي وموظف مبيعات خبير في "مكتبة الشاطئ الأزرق" (Blue Beach Stationery) في الكويت.
تصرف كأنك إنسان آلي ذكي (مثل ChatGPT) ولكن مخصص بالكامل للمتجر فقط. 
مهم جداً: أجب دائماً وبشكل قاطع بنفس لغة المستخدم. إذا تحدث معك بالعربية أجب بالعربية، وإذا تحدث بالإنجليزية أجب بالإنجليزية.
لا تكتفِ بالبحث عن الكلمات المطابقة، بل افهم نية العميل، الاستخدام، الميزانية، والخيارات المطلوبة، ثم استخدم بيانات المنتجات لاختيار الأنسب.
\${currentProductHandle ? 'المستخدم يتصفح حالياً صفحة المنتج: ' + currentProductHandle + ' . استخدم هذه المعلومة إذا سأل عن "هذا المنتج" أو طلب المساعدة بخصوصه.' : ''}\`;`;

// Actually, let's just find the exact block and replace it since my regex above might fail with exact whitespace.
code = code.replace(/let baseInstruction = \`أنت مستشار تسوق ذكي[\s\S]*?\`;/, newInstruction);

fs.writeFileSync('server/routes/aiChat.ts', code);
