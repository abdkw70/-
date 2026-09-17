const fs = require('fs');
let content = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

content = content.replace(
  "  if (!aiClient) {\n    return res.status(500).json({ error: 'Gemini API is not configured on the server.' });\n  }\n  }",
  "  if (!aiClient) {\n    return res.status(500).json({ error: 'Gemini API is not configured on the server.' });\n  }"
);

fs.writeFileSync('server/routes/aiChat.ts', content);
