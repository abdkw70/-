const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

// None of the fallback models work in this environment!
// I'll revert it back to gemini-3.6-flash, which works but runs out of quota.
// However, the error message I caught previously "عذراً، أواجه ضغطاً عالياً في الوقت الحالي. يرجى المحاولة مرة أخرى بعد قليل." 
// works gracefully when it hits quota! Let's check why the user still complained about the error.
// The user complained about the "models/gemini-2.5-flash is no longer available" error, which was MY fault (I caused it).
// They also showed me error 1: at throwErrorIfNotOK, which was the quota error.
// So returning to 3.6-flash is the ONLY valid fix, and catching the quota gracefully.
code = code.replace(/gemini-1\.5-flash/g, 'gemini-3.6-flash');

fs.writeFileSync('server/routes/aiChat.ts', code);
