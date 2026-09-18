const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.dependencies['@google/genai'] = '^2.4.0';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
