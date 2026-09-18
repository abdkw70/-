const fs = require('fs');
let code = fs.readFileSync('src/components/freeChallenge/VisualPuzzleRenderer.tsx', 'utf8');

code = code.replace(/return \{ label: 'لغز بصري', icon: Sparkles, color: 'text-amber-400' \};/, "return { label: t('games.visual_puzzle', 'لغز بصري'), icon: Sparkles, color: 'text-amber-400' };");
code = code.replace(/\{\['أ', 'ب', 'ج', 'د'\]\[idx\]\}/, "{language === 'en' ? ['A', 'B', 'C', 'D'][idx] : ['أ', 'ب', 'ج', 'د'][idx]}");

fs.writeFileSync('src/components/freeChallenge/VisualPuzzleRenderer.tsx', code);
