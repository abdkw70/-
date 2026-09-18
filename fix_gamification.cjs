const fs = require('fs');

let code = fs.readFileSync('server/gamification.ts', 'utf8');

// There are strings like: { ar: "ما هو مضاد كلمة "إيجاز" في اللغة العربية؟", en: "Gamification Question" }
// This is invalid TS. Let's fix it by replacing the inner double quotes or just using single quotes.

// We need to carefully replace the nested quotes.
// Wait, why not just read the original file from a backup? I didn't back it up.
// I can fix it manually with regex.
// The broken line is: { ar: "ما هو مضاد كلمة "إيجاز" في اللغة العربية؟",
code = code.replace(/\{ ar: "(.*?)", en: "(.*?)" \}/g, (match, arStr, enStr) => {
  // If the regex matched correctly, it might have stopped at the first quote.
  // Wait, let's see how regex /question: \{ ar: "(.*?)", en: "(.*?)" \}/ matched it.
  return match;
});
// This won't work because it's a syntax error, regex already messed it up.
