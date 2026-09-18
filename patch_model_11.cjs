const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

// The quota metric generated is generativelanguage.googleapis.com/generate_content_free_tier_requests for model gemini-3.6-flash.
// Wait, the quota might be exhausted. To fix this, we should change the API key to use a different one, but we don't have it.
// We can use the interactions API or just catch the 429 error and return a graceful message.
code = code.replace(/e\?\.status === 503/g, 'e?.status === 503 || e?.status === 429');
code = code.replace(/e\?\.message\?\.includes\('503'\)/g, 'e?.message?.includes(\'503\') || e?.message?.includes(\'429\') || e?.message?.includes(\'Quota\')');

fs.writeFileSync('server/routes/aiChat.ts', code);
