const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /{!isAdminRoute {!isAdminRoute && <Footer categories={categories} onNavigate={navigate} \/>}{!isAdminRoute && <Footer categories={categories} onNavigate={navigate} \/>} <Footer categories={categories} onNavigate={navigate} \/>}/g,
  '{!isAdminRoute && <Footer categories={categories} onNavigate={navigate} />}'
);

fs.writeFileSync('src/App.tsx', content);
