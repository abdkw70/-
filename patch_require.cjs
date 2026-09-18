const fs = require('fs');
let code = fs.readFileSync('server/routes/aiChat.ts', 'utf8');

code = code.replace(
  /require\('fs'\)\.appendFileSync/g,
  "import('fs').then(fs => fs.appendFileSync"
);
code = code.replace(
  /\+ '\\n'\);/g,
  "+ '\\n'))"
);

fs.writeFileSync('server/routes/aiChat.ts', code);
