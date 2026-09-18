const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

// The quota is exhausted for 3.6-flash, so we can use gemini-1.5-flash which is widely available and has huge limits.
// Wait, earlier I tried gemini-1.5-flash, but it said "This model models/gemini-2.0-flash is no longer available" (I replaced 1.5 with 2.0).
// Let's use gemini-1.5-flash properly. Wait, I replaced 1.5-flash with 2.0-flash in patch 5. What happened before?
// In patch 4 I replaced 3.6-flash with 1.5-flash, but then immediately replaced it with 2.0. So I never tested 1.5-flash!
code = code.replace(/gemini-3\.6-flash/g, 'gemini-1.5-flash');

fs.writeFileSync('server/routes/aiChat.ts', code);
