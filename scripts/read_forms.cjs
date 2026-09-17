const fs = require('fs');

const files = fs.readdirSync('scripts').filter(f => f.endsWith('_form.html'));

files.forEach(f => {
  console.log(`\n============================`);
  console.log(`FORM: ${f}`);
  const content = fs.readFileSync(`scripts/${f}`, 'utf8');
  console.log(content);
});
