const fs = require('fs');
let code = fs.readFileSync('server/gamification.ts', 'utf8');

const regex = /question:\s*'(.*?)'/g;
code = code.replace(regex, (match, arStr) => {
  let enStr = "Gamification Question";
  return `question: { ar: "${arStr}", en: "${enStr}" }`;
});

const regexOpts = /options:\s*\[(.*?)\]/g;
code = code.replace(regexOpts, (match, optsStr) => {
  // optsStr looks like: 'الرياض', 'مدينة الكويت', 'الدوحة', 'المنامة'
  // Let's replace each string with {ar, en}
  const replacedOpts = optsStr.replace(/'(.*?)'/g, (m, opt) => {
    return `{ ar: "${opt}", en: "Option text" }`;
  });
  return `options: [${replacedOpts}]`;
});

const regexExp = /explanation:\s*'(.*?)'/g;
code = code.replace(regexExp, (match, arStr) => {
  return `explanation: { ar: "${arStr}", en: "Explanation text" }`;
});

fs.writeFileSync('server/gamification.ts', code);
