const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

code = code.replace(
  /Uint8Array\.from\(atob\(data\.audioData\), c => c\.charCodeAt\(0\)\)\.buffer/,
  "await fetch(`data:audio/wav;base64,${data.audioData}`).then(r => r.arrayBuffer())"
);

fs.writeFileSync('src/components/Chatbot.tsx', code);
