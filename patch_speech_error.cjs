const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

code = code.replace(
  /recognitionRef\.current\.onerror = \(event: any\) => \{\n\s*console\.error\('Speech recognition error', event\.error\);\n\s*setIsListening\(false\);\n\s*\};/,
  `recognitionRef.current.onerror = (event: any) => {
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          console.error('Speech recognition error:', event.error);
        }
        setIsListening(false);
      };`
);

fs.writeFileSync('src/components/Chatbot.tsx', code);
