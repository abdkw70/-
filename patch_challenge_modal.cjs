const fs = require('fs');
let code = fs.readFileSync('src/components/gamification/ChallengeModal.tsx', 'utf8');

code = code.replace(/import \{ useLanguage \} from '\.\.\/\.\.\/context\/LanguageContext';/, "import { useLanguage } from '../../context/LanguageContext';\nimport { getLocalizedText } from '../../utils/translation';");

code = code.replace(/\{currentQuestion\.question\}/g, '{getLocalizedText(currentQuestion.question, language)}');
code = code.replace(/\{option\}/g, '{getLocalizedText(option, language)}');

fs.writeFileSync('src/components/gamification/ChallengeModal.tsx', code);
