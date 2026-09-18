const fs = require('fs');
let code = fs.readFileSync('src/components/freeChallenge/FreeChallengeModal.tsx', 'utf8');

code = code.replace(/import \{ useLanguage \} from '\.\.\/\.\.\/context\/LanguageContext';/, "import { useLanguage } from '../../context/LanguageContext';\nimport { getLocalizedText } from '../../utils/translation';");

code = code.replace(/\{activeGame\?\.title \|\| \(t\('games\.shopping_challenge'\)\)\}/, "{getLocalizedText(activeGame?.title, language) || (t('games.shopping_challenge'))}");

// In the rendering of games lists (activeGame or games.map)
code = code.replace(/\{game\.title\}/g, '{getLocalizedText(game.title, language)}');
code = code.replace(/\{game\.description\}/g, '{getLocalizedText(game.description, language)}');
code = code.replace(/\{activeGame\?\.title\}/g, '{getLocalizedText(activeGame?.title, language)}');
code = code.replace(/\{activeGame\?\.description\}/g, '{getLocalizedText(activeGame?.description, language)}');

fs.writeFileSync('src/components/freeChallenge/FreeChallengeModal.tsx', code);
