const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(
  /const { messages, sessionId, userId, userName } = req\.body;/,
  'const { messages, sessionId, userId, userName, currentProductHandle } = req.body;'
);

const sysPromptRegex = /let baseInstruction = `(.|\n)*?`;/m;
const sysPromptMatch = code.match(sysPromptRegex);
if (sysPromptMatch) {
  let newSys = sysPromptMatch[0].replace(
    /`;$/,
    `\n${"$"}{currentProductHandle ? 'المستخدم يتصفح حالياً صفحة المنتج: ' + currentProductHandle + ' . استخدم هذه المعلومة إذا سأل عن "هذا المنتج" أو طلب المساعدة بخصوصه.' : ''}\`;`
  );
  code = code.replace(sysPromptMatch[0], newSys);
}

fs.writeFileSync('server/routes/aiChat.ts', code);
