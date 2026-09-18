const fs = require('fs');
let code = fs.readFileSync('src/components/freeChallenge/VisualPuzzleRenderer.tsx', 'utf8');

code = code.replace(/import { useLanguage } from '\.\.\/\.\.\/context\/LanguageContext';/, "import { useLanguage } from '../../context/LanguageContext';\nimport { getLocalizedText } from '../../utils/translation';");

code = code.replace(/const { t } = useLanguage\(\);/, "const { t, language } = useLanguage();");

// Update prompt and promptDetails
code = code.replace(/\{prompt\}/g, '{getLocalizedText(prompt, language)}');
code = code.replace(/\{mainVisual\.promptDetails\}/g, '{getLocalizedText(mainVisual.promptDetails, language)}');

// Update options rendering
code = code.replace(/\{option\.label \|\| t\('games\.option_x', '', \{ idx: idx \+ 1 \}\)\}/, "{getLocalizedText(option.label, language) || t('games.option_x', '', { idx: idx + 1 })}");

fs.writeFileSync('src/components/freeChallenge/VisualPuzzleRenderer.tsx', code);
