const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const localizedTextType = `
export type LocalizedText = string | { ar: string; en: string };
`;

code = localizedTextType + code;

// Replace GameConfig string fields
code = code.replace(/title: string;/g, 'title: LocalizedText;');
code = code.replace(/description: string;/g, 'description: LocalizedText;');
code = code.replace(/prompt: string;/g, 'prompt: LocalizedText;');
code = code.replace(/winMessage: string;/g, 'winMessage: LocalizedText;');
code = code.replace(/lossMessage: string;/g, 'lossMessage: LocalizedText;');
code = code.replace(/timeoutMessage: string;/g, 'timeoutMessage: LocalizedText;');
code = code.replace(/label\?: string;/g, 'label?: LocalizedText;');

fs.writeFileSync('src/types.ts', code);
