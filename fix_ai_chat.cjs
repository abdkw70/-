const fs = require('fs');
let content = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

// Fix TS2339
content = content.replace(
  "if (settings.aiChatEnabled === false) {",
  "if ((settings as any).aiChatEnabled === false) {"
);

// Fix tools being outside config
content = content.replace(
  "      tools: [{ functionDeclarations: [searchProductsDeclaration] }],\n      toolConfig: { includeServerSideToolInvocations: true },\n      config: {\n        systemInstruction,\n      }",
  "      config: {\n        systemInstruction,\n        tools: [{ functionDeclarations: [searchProductsDeclaration] }],\n        toolConfig: { includeServerSideToolInvocations: true }\n      }"
);

fs.writeFileSync('server/routes/aiChat.ts', content);
