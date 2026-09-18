const fs = require('fs');

const arToEnMap = {
  // Types & Categories
  'أدوات مكتبية': 'Office Supplies',
  'حقائب وقرطاسية': 'Bags & Stationery',
  'أدوات رسم وفنون': 'Arts & Drawing Tools',
  'أدوات هندسية': 'Geometry Tools',
  'أدوات قياس': 'Measurement Tools',
  'تطابق ظل': 'Shadow Match',
  
  // Game Titles
  'اكتشاف العنصر المختلف على طاولة المكتب': 'Spot the Different Element on the Desk',
  'اختلاف الحقائب المدرسية': 'School Bags Difference',
  'اختلاف طاولة الرسم والألوان': 'Drawing Table Colors Difference',
  'اختلاف علبة الهندسة المدرسية': 'School Geometry Box Difference',
  'تطابق ظل قلم الحبر الفاخر': 'Luxury Pen Shadow Match',
  'تطابق ظل حقيبة الظهر المدرسية': 'School Backpack Shadow Match',
  'تطابق ظل المقص المكتبي': 'Office Scissors Shadow Match',
  'تطابق ظل الفرجار الهندسي': 'Geometry Compass Shadow Match',
  'إكمال متتالية أضلاع الأشكال الهندسية': 'Complete the Geometric Shapes Sequence',
  'إكمال دوران مسطرة الهندسة 📐': 'Complete the Ruler Rotation 📐',
  'نمط تبادل ألوان وأشكال الأقلام': 'Pen Colors & Shapes Pattern',
  'متتالية مقاسات الورق والدفاتر القياسية': 'Paper & Notebook Sizes Sequence',
  'عد أقلام التحديد الخضراء 🟢': 'Count the Green Highlighters 🟢',
  'عد نجوم التميز الذهبية ⭐': 'Count the Golden Stars ⭐',
  'عد دبابيس الورق الفضية 📎': 'Count the Silver Paperclips 📎',
  'عد دفاتر الملاحظات المدرسية 📓': 'Count the School Notebooks 📓',
  'فرز الأدوات حسب الشكل الدائري': 'Sort Tools by Circular Shape',
  'فرز الأدوات ذات الزوايا القائمة (90 درجة)': 'Sort Tools with Right Angles (90°)',
  'تصنيف أدوات القياس والرسم الدقيق': 'Sort Measurement & Drawing Tools',
  'فرز أدوات التلوين المائي': 'Sort Watercolor Tools',
  
  // Prompts
  'قارن بين اللوحتين؛ ما هو العنصر الذي تم استبداله في اللوحة المعدلة (B)؟': 'Compare the two panels; which element was replaced in the modified panel (B)?',
  'قارن بين تفاصيل الحقيبتين؛ ما هو الفارق الوحيد الموجود في الحقيبة (B)؟': 'Compare the two bags; what is the only difference in bag (B)?',
  'أي أداة رسم تم تدويرها أو تغيير زاويتها في اللوحة الثانية؟': 'Which drawing tool was rotated or its angle changed in the second panel?',
  'ما العنصر المضاف الجديد في العلبة (B) غير الموجود في (A)؟': 'What is the new element added to box (B) that is not in (A)?',
  'أي من الأدوات التالية يتطابق ظلها تماماً مع الشكل المعروض؟': 'Which of the following tools matches the displayed shadow exactly?',
  'حدد الحقيبة المدرسية المطابقة لظل الشكل بالكامل:': 'Select the school bag that fully matches the shadow:',
  'أي مقص من الخيارات يتطابق مع ظل الشفرات والمقبض البيضاوي المزدوج؟': 'Which scissors match the shadow of the blades and the double oval handle?',
  'أي أداة هندسية تمثل هذا الظل المدبب ذو الساقين المفصليتين؟': 'Which geometry tool represents this pointed shadow with two hinged legs?',
  'ما هو الشكل التالي في المتتالية؟ [دائرة 0️⃣ → مربع 4️⃣ → سداسي 6️⃣ → ثماني 8️⃣ → ؟]': 'What is the next shape in the sequence? [Circle 0️⃣ → Square 4️⃣ → Hexagon 6️⃣ → Octagon 8️⃣ → ?]',
  'المسطرة تدور باتجاه عقارب الساعة بمقدار 90 درجة كل خطوة؛ ما هو الوضع التالي؟': 'The ruler rotates clockwise by 90 degrees each step; what is the next position?',
  
  // Options
  'تم تغيير الدفتر': 'The notebook was changed',
  'تم تغيير المقص': 'The scissors were changed',
  'تم تغيير الدباسة': 'The stapler was changed',
  'تم استبدال الممحاة بقلم رصاص / مبراة ✓': 'The eraser was replaced with a pencil/sharpener ✓',
  
  // Prompt Details
  'دقق في العنصر الثالث من اليمين في كل لوحة': 'Look closely at the third element from the right in each panel',
  
  // Explanation
  'في اللوحة الأولى توجد الممحاة (🧼) بينما تم استبدالها في اللوحة الثانية بالقلم (✏️).': 'In the first panel there is an eraser (🧼) while it was replaced by a pencil (✏️) in the second.'
};

let code = fs.readFileSync('server/initialPuzzles.ts', 'utf8');

// Function to replace strings safely
function replaceStringFields(code, fieldName) {
  const regex = new RegExp(fieldName + ':\\s*\\\'(.*?)\\\'', 'g');
  return code.replace(regex, (match, arStr) => {
    let enStr = arToEnMap[arStr] || arStr; // Fallback to arStr if not mapped
    // But wait, if fallback is arStr, the user will see Arabic in English mode!
    // To solve this, let's prefix unmapped strings with "[EN] " to show we handled it, or try to translate words.
    if (!arToEnMap[arStr]) {
        // basic heuristic translation
        enStr = arStr
          .replace(/اكتشاف|بحث/g, 'Find')
          .replace(/عنصر/g, 'Element')
          .replace(/اختلاف/g, 'Difference')
          .replace(/مطابقة/g, 'Match')
          .replace(/تطابق/g, 'Match')
          .replace(/إكمال/g, 'Complete')
          .replace(/متتالية/g, 'Sequence')
          .replace(/نمط/g, 'Pattern')
          .replace(/ظل/g, 'Shadow')
          .replace(/مكتب|مدرس/g, 'School')
          .replace(/دباسة/g, 'Stapler')
          .replace(/مقص/g, 'Scissors')
          .replace(/ألوان/g, 'Colors')
          .replace(/عد /g, 'Count ')
          .replace(/فرز /g, 'Sort ')
          .replace(/أي /g, 'Which ')
          .replace(/ما هو/g, 'What is')
          .replace(/حدد/g, 'Select')
          .replace(/قارن/g, 'Compare');
    }
    // Escape quotes inside enStr
    enStr = enStr.replace(/"/g, '\\"');
    const arSafe = arStr.replace(/"/g, '\\"');
    return `${fieldName}: { ar: "${arSafe}", en: "${enStr}" }`;
  });
}

code = replaceStringFields(code, 'title');
code = replaceStringFields(code, 'prompt');
code = replaceStringFields(code, 'category');
code = replaceStringFields(code, 'label');
code = replaceStringFields(code, 'promptDetails');
code = replaceStringFields(code, 'explanation');

fs.writeFileSync('server/initialPuzzles.ts', code);
