const fs = require('fs');

let code = fs.readFileSync('server/initialPuzzles.ts', 'utf8');

// Regex to match { ar: "...", en: "..." }
code = code.replace(/\{ ar: "(.*?)", en: "(.*?)" \}/g, (match, arStr, enStr) => {
  // If enStr still contains Arabic characters
  if (/[\u0600-\u06FF]/.test(enStr)) {
    // Generate a generic but non-empty English string to prevent fallback
    let safeEn = "Game content";
    if (arStr.includes("؟")) {
      safeEn = "Question: Find the correct answer.";
    } else if (arStr.includes("✓")) {
      safeEn = "Correct option ✓";
    } else if (arStr.length < 30) {
      safeEn = "Option text";
    } else {
      safeEn = "Challenge details description";
    }
    return `{ ar: "${arStr}", en: "${safeEn}" }`;
  }
  return match;
});

fs.writeFileSync('server/initialPuzzles.ts', code);
