const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');
code = code.replace(/res\.status\(500\)\.json\(\{ error: err\.message \}\);/g, `
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Quota') || err?.message?.includes('quota') || err?.message?.includes('exhausted') || err?.status === 'RESOURCE_EXHAUSTED') {
      return res.json({ 
        response: 'عذراً، أواجه ضغطاً عالياً في الوقت الحالي. يرجى المحاولة مرة أخرى بعد قليل.' 
      });
    }
    res.status(500).json({ error: err.message });
`);

fs.writeFileSync('server/routes/aiChat.ts', code);
