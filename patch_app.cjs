const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<Chatbot onNavigate=\{navigate\} \/>/g,
  '<Chatbot onNavigate={navigate} currentPath={currentPath} />'
);

fs.writeFileSync('src/App.tsx', code);
