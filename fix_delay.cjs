const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

code = code.replace(
  /const delay = \(storeSettings\?\.voiceAutoWelcomeDelaySeconds \?\? 3\) \* 1000;\s*const delay = \(storeSettings\?\.voiceAutoWelcomeDelaySeconds \?\? 3\) \* 1000;/,
  'const delay = (storeSettings?.voiceAutoWelcomeDelaySeconds ?? 3) * 1000;'
);

code = code.replace(
  /setTimeout\(async \(\) => \{/,
  'const timeout = setTimeout(async () => {'
);

code = code.replace(
  /        \}, delay\);\n      \}\n    \}\n  \}, \[currentProductHandle, isRtl, storeSettings, isSoundOn\]\);/,
  `        }, delay);\n        return () => clearTimeout(timeout);\n      }\n    }\n  }, [currentProductHandle, isRtl, storeSettings, isSoundOn]);`
);

fs.writeFileSync('src/components/Chatbot.tsx', code);
