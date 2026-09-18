const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

// Add state for dynamic suggestions
if (!code.includes('const [dynamicSuggestions, setDynamicSuggestions]')) {
  code = code.replace(
    /const \[welcomeBubble, setWelcomeBubble\] = useState<string \| null>\(null\);/,
    `const [welcomeBubble, setWelcomeBubble] = useState<string | null>(null);\n  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);`
  );
}

// Update the fetch in auto-welcome to save suggestions
code = code.replace(
  /const welcomeMsg = data\.response \|\| \(isRtl \? 'يا هلا! تبيني أساعدك بهالمنتج\؟' : 'Hello! Need help with this product\?'\);/,
  `const welcomeMsg = data.response || (isRtl ? 'يا هلا! تبيني أساعدك بهالمنتج؟' : 'Hello! Need help with this product?');\n             if (data.suggestions && data.suggestions.length > 0) {\n               setDynamicSuggestions(data.suggestions);\n             }`
);

// Update the fetch in sendMessageFromInput to save suggestions
code = code.replace(
  /const data = await res\.json\(\);\n\s*if \(data\.error\) \{/,
  `const data = await res.json();\n\n      if (data.suggestions && data.suggestions.length > 0) {\n        setDynamicSuggestions(data.suggestions);\n      }\n\n      if (data.error) {`
);

// Update the render logic for suggestions to use dynamicSuggestions if available
code = code.replace(
  /const suggestions = currentProductHandle\s*\?\s*\(isRtl \? productSuggestionsAr : productSuggestionsEn\)\s*:\s*\(isRtl \? generalSuggestionsAr : generalSuggestionsEn\);/,
  `const suggestions = dynamicSuggestions.length > 0\n    ? dynamicSuggestions\n    : (currentProductHandle\n       ? (isRtl ? productSuggestionsAr : productSuggestionsEn)\n       : (isRtl ? generalSuggestionsAr : generalSuggestionsEn));`
);

fs.writeFileSync('src/components/Chatbot.tsx', code);
