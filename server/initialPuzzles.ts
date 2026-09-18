import { VisualPuzzle } from './freeChallengeTypes';

export const allInitialPuzzles: VisualPuzzle[] = [
  // =========================================================================
  // 1. Visual Difference (اختلاف الصورة والبحث عن المختلف) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_diff_1',
    type: 'visual_difference',
    title: { ar: "اكتشاف العنصر المختلف على طاولة المكتب", en: "Spot the Different Element on the Desk" },
    prompt: { ar: "قارن بين اللوحتين؛ ما هو العنصر الذي تم استبداله في اللوحة المعدلة (B)؟", en: "Compare the two panels; which element was replaced in the modified panel (B)?" },
    category: { ar: "أدوات مكتبية", en: "Office Supplies" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 3,
    mainVisual: {
      svgContent: `<div class="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        <div class="border border-sky-400/40 rounded-2xl p-2.5 bg-slate-900 text-center">
          <span class="text-[10px] text-sky-400 font-bold block mb-1">اللوحة الأصلية (A)</span>
          <div class="flex justify-around items-center h-16 bg-slate-800/80 rounded-xl px-2">
            <span class="text-2xl" title="دفتر">📓</span>
            <span class="text-2xl" title="مقص">✂️</span>
            <span class="text-2xl" title="ممحاة">🧼</span>
            <span class="text-2xl" title="دباسة">📎</span>
          </div>
        </div>
        <div class="border border-amber-400/40 rounded-2xl p-2.5 bg-slate-900 text-center">
          <span class="text-[10px] text-amber-400 font-bold block mb-1">اللوحة المعدلة (B)</span>
          <div class="flex justify-around items-center h-16 bg-slate-800/80 rounded-xl px-2">
            <span class="text-2xl" title="دفتر">📓</span>
            <span class="text-2xl" title="مقص">✂️</span>
            <span class="text-2xl" title="مبراة">✏️</span>
            <span class="text-2xl" title="دباسة">📎</span>
          </div>
        </div>
      </div>`,
      promptDetails: { ar: "دقق في العنصر الثالث من اليمين في كل لوحة", en: "Look closely at the third element from the right in each panel" },
    },
    options: [
      { id: 'd1_1', label: { ar: "تم تغيير الدفتر", en: "The notebook was changed" } },
      { id: 'd1_2', label: { ar: "تم تغيير المقص", en: "The scissors were changed" } },
      { id: 'd1_3', label: { ar: "تم تغيير الدباسة", en: "The stapler was changed" } },
      { id: 'd1_4', label: { ar: "تم استبدال الممحاة بقلم رصاص / مبراة ✓", en: "The eraser was replaced with a pencil/sharpener ✓" } },
    ],
    explanation: { ar: "في اللوحة الأولى توجد الممحاة (🧼) بينما تم استبدالها في اللوحة الثانية بالقلم (✏️).", en: "In the first panel there is an eraser (🧼) while it was replaced by a pencil (✏️) in the second." },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_diff_2',
    type: 'visual_difference',
    title: { ar: "اختلاف الحقائب المدرسية", en: "School Bags Difference" },
    prompt: { ar: "قارن بين تفاصيل الحقيبتين؛ ما هو الفارق الوحيد الموجود في الحقيبة (B)؟", en: "Compare the two bags; what is the only difference in bag (B)?" },
    category: { ar: "حقائب وقرطاسية", en: "Bags & Stationery" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="grid grid-cols-2 gap-3 max-w-sm mx-auto text-center">
        <div class="border border-indigo-400/40 rounded-2xl p-3 bg-slate-900">
          <span class="text-[10px] text-indigo-300 font-bold block mb-2">الحقيبة (A)</span>
          <div class="text-4xl py-2">🎒</div>
          <span class="text-[11px] text-slate-300">سحاب أصفر • مقبض أسود</span>
        </div>
        <div class="border border-emerald-400/40 rounded-2xl p-3 bg-slate-900">
          <span class="text-[10px] text-emerald-300 font-bold block mb-2">الحقيبة (B)</span>
          <div class="text-4xl py-2">🎒</div>
          <span class="text-[11px] text-emerald-400 font-bold">سحاب أخضر • مقبض أسود</span>
        </div>
      </div>`,
      promptDetails: { ar: "انتبه للون سحاب الجيب الأمامي", en: "Option text" },
    },
    options: [
      { id: 'd2_1', label: { ar: "شكل المقبض العلوي", en: "Option text" } },
      { id: 'd2_2', label: { ar: "لون السحاب الأمامي تم تغييره للأخضر ✓", en: "Correct option ✓" } },
      { id: 'd2_3', label: { ar: "عدد الجيوب الجانبية", en: "Option text" } },
      { id: 'd2_4', label: { ar: "خامة القماش الخارجي", en: "Option text" } },
    ],
    explanation: { ar: "سحاب الحقيبة B لونه أخضر بينما في A لونه أصفر.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_diff_3',
    type: 'visual_difference',
    title: { ar: "اختلاف طاولة الرسم والألوان", en: "Drawing Table Colors Difference" },
    prompt: { ar: "أي أداة رسم تم تدويرها أو تغيير زاويتها في اللوحة الثانية؟", en: "Which drawing tool was rotated or its angle changed in the second panel?" },
    category: { ar: "أدوات رسم وفنون", en: "Arts & Drawing Tools" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="grid grid-cols-2 gap-3 max-w-sm mx-auto text-center">
        <div class="border border-pink-400/40 rounded-2xl p-3 bg-slate-900">
          <span class="text-[10px] text-pink-300 font-bold block mb-1">طاولة A</span>
          <div class="flex justify-around items-center h-14 bg-slate-800/80 rounded-xl px-2">
            <span class="text-2xl transform rotate-0">🖌️</span>
            <span class="text-2xl">🎨</span>
            <span class="text-2xl">📐</span>
          </div>
        </div>
        <div class="border border-purple-400/40 rounded-2xl p-3 bg-slate-900">
          <span class="text-[10px] text-purple-300 font-bold block mb-1">طاولة B</span>
          <div class="flex justify-around items-center h-14 bg-slate-800/80 rounded-xl px-2">
            <span class="text-2xl transform rotate-90 inline-block">🖌️</span>
            <span class="text-2xl">🎨</span>
            <span class="text-2xl">📐</span>
          </div>
        </div>
      </div>`,
      promptDetails: { ar: "لاحظ زاوية اتجاه فرشاة الرسم 🖌️", en: "Challenge details description" },
    },
    options: [
      { id: 'd3_1', label: { ar: "فرشاة الرسم دارت بمقدار 90 درجة ✓", en: "Correct option ✓" } },
      { id: 'd3_2', label: { ar: "لوحة الألوان تغيرت", en: "Option text" } },
      { id: 'd3_3', label: { ar: "المسطرة تحولت لمنقلة", en: "Option text" } },
      { id: 'd3_4', label: { ar: "لا يوجد أي اختلاف", en: "Option text" } },
    ],
    explanation: { ar: "فرشاة الرسم 🖌️ تم تدويرها 90 درجة في اللوحة B.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_diff_4',
    type: 'visual_difference',
    title: { ar: "اختلاف علبة الهندسة المدرسية", en: "School Geometry Box Difference" },
    prompt: { ar: "ما العنصر المضاف الجديد في العلبة (B) غير الموجود في (A)؟", en: "What is the new element added to box (B) that is not in (A)?" },
    category: { ar: "أدوات هندسية", en: "Geometry Tools" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<div class="grid grid-cols-2 gap-3 max-w-sm mx-auto text-center">
        <div class="border border-amber-400/40 rounded-2xl p-2.5 bg-slate-900">
          <span class="text-[10px] text-amber-300 font-bold block mb-1">العلبة A (3 أدوات)</span>
          <div class="flex justify-around items-center h-14 bg-slate-800 rounded-xl px-2">
            <span class="text-2xl">📐</span>
            <span class="text-2xl">📏</span>
            <span class="text-2xl">✏️</span>
          </div>
        </div>
        <div class="border border-cyan-400/40 rounded-2xl p-2.5 bg-slate-900">
          <span class="text-[10px] text-cyan-300 font-bold block mb-1">العلبة B (4 أدوات)</span>
          <div class="flex justify-around items-center h-14 bg-slate-800 rounded-xl px-2">
            <span class="text-2xl">📐</span>
            <span class="text-2xl">📏</span>
            <span class="text-2xl">✏️</span>
            <span class="text-2xl text-emerald-400 font-bold">🧲</span>
          </div>
        </div>
      </div>`,
      promptDetails: { ar: "انتبه للأداة الرابعة المضافة في أقصى اليسار", en: "Challenge details description" },
    },
    options: [
      { id: 'd4_1', label: { ar: "تمت إضافة مبراة", en: "Option text" } },
      { id: 'd4_2', label: { ar: "تم تغيير نوع المسطرة", en: "Option text" } },
      { id: 'd4_3', label: { ar: "تمت إضافة مغناطيس تجارب تعليمي 🧲 ✓", en: "Correct option ✓" } },
      { id: 'd4_4', label: { ar: "تمت إزالة القلم", en: "Option text" } },
    ],
    explanation: { ar: "العلبة B تحتوي على مغناطيس تعليمي إضافي لم يكن موجوداً في A.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 2. Silhouette Match (تطابق الظلال الدقيقة) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_sil_1',
    type: 'silhouette_match',
    title: { ar: "تطابق ظل قلم الحبر الفاخر", en: "Luxury Pen Shadow Match" },
    prompt: { ar: "أي من الأدوات التالية يتطابق ظلها تماماً مع الشكل المعروض؟", en: "Which of the following tools matches the displayed shadow exactly?" },
    category: { ar: "أقلام وأدوات كتابة", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 100 100" class="w-24 h-24 text-slate-900 fill-current mx-auto filter drop-shadow-md">
        <path d="M45 10 L55 10 L58 45 L54 85 L50 95 L46 85 L42 45 Z M47 25 L53 25 M48 55 L52 55" />
        <circle cx="50" cy="95" r="2" fill="#000" />
      </svg>`,
      promptDetails: { ar: "انتبه لطول السن المعدني واستقامة الهيكل", en: "Challenge details description" },
    },
    options: [
      { id: 's1_1', label: { ar: "قلم ريشة كلاسيكي رفيع ✓", en: "Correct option ✓" } },
      { id: 's1_2', label: { ar: "قلم تحديد عريض (هايلايتر)", en: "Option text" } },
      { id: 's1_3', label: { ar: "قلم رصاص خشبي مع ممحاة", en: "Option text" } },
      { id: 's1_4', label: { ar: "فرشاة رسم مائية بيضاوية", en: "Option text" } },
    ],
    explanation: { ar: "الشكل المعروض هو ظل قلم حبر كلاسيكي بسن حاد وتصميم متناسق.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sil_2',
    type: 'silhouette_match',
    title: { ar: "تطابق ظل حقيبة الظهر المدرسية", en: "School Backpack Shadow Match" },
    prompt: { ar: "حدد الحقيبة المدرسية المطابقة لظل الشكل بالكامل:", en: "Select the school bag that fully matches the shadow:" },
    category: { ar: "شنط وحقائب مدرسية", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 100 100" class="w-24 h-24 text-slate-950 fill-current mx-auto filter drop-shadow-md">
        <path d="M28 35 C28 20, 72 20, 72 35 L76 80 C76 86, 70 90, 64 90 L36 90 C30 90, 24 86, 24 80 Z M38 20 C38 12, 62 12, 62 20 M32 50 L68 50 L66 75 L34 75 Z" />
      </svg>`,
      promptDetails: { ar: "قارن المقبض العلوي وجيب السحاب الأمامي المستطيل", en: "Challenge details description" },
    },
    options: [
      { id: 's2_1', label: { ar: "حقيبة كتف جانبية", en: "Option text" } },
      { id: 's2_2', label: { ar: "حقيبة ظهر مقوسة بجيب عريض ✓", en: "Correct option ✓" } },
      { id: 's2_3', label: { ar: "حافظة لابتوب مستطيلة", en: "Option text" } },
      { id: 's2_4', label: { ar: "حقيبة ترولي بعجلات", en: "Option text" } },
    ],
    explanation: { ar: "الحقيبة ذات المقبض القوسي والجيب الأمامي العريض هي التطابق الدقيق.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sil_3',
    type: 'silhouette_match',
    title: { ar: "تطابق ظل المقص المكتبي", en: "Office Scissors Shadow Match" },
    prompt: { ar: "أي مقص من الخيارات يتطابق مع ظل الشفرات والمقبض البيضاوي المزدوج؟", en: "Which scissors match the shadow of the blades and the double oval handle?" },
    category: { ar: "أدوات قص وتجليد", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-5xl filter brightness-0">✂️</span>
      </div>`,
      promptDetails: { ar: "مقص ذو حلقتين بيضاويتين متطابقتين وشفرتين مفتوحتين بزاوية 30°", en: "Challenge details description" },
    },
    options: [
      { id: 's3_1', label: { ar: "مشرط ورق مستقيم", en: "Option text" } },
      { id: 's3_2', label: { ar: "كماشة تثبيت معدنية", en: "Option text" } },
      { id: 's3_3', label: { ar: "مقص مكتبي ستانلس ستيل بحلقات بيضاوية ✓", en: "Correct option ✓" } },
      { id: 's3_4', label: { ar: "خرامة ورق دائرية", en: "Option text" } },
    ],
    explanation: { ar: "المقص ذو الشفرات المتقاطعة والحلقات البيضاوية هو المطابق التام.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sil_4',
    type: 'silhouette_match',
    title: { ar: "تطابق ظل الفرجار الهندسي", en: "Geometry Compass Shadow Match" },
    prompt: { ar: "أي أداة هندسية تمثل هذا الظل المدبب ذو الساقين المفصليتين؟", en: "Which geometry tool represents this pointed shadow with two hinged legs?" },
    category: { ar: "أدوات هندسية", en: "Geometry Tools" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 3,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 100 100" class="w-24 h-24 mx-auto text-slate-900 fill-current filter drop-shadow-md">
        <polygon points="48,10 52,10 54,25 75,90 70,92 50,35 30,92 25,90 46,25" />
        <circle cx="50" cy="20" r="4" fill="#000" />
      </svg>`,
      promptDetails: { ar: "أداة رسم الدوائر الهندسية الدقيقة", en: "Challenge details description" },
    },
    options: [
      { id: 's4_1', label: { ar: "مسطرة مثلثة 45°", en: "Option text" } },
      { id: 's4_2', label: { ar: "منقلة نصف دائرية", en: "Option text" } },
      { id: 's4_3', label: { ar: "مسطرة حرف T", en: "Option text" } },
      { id: 's4_4', label: { ar: "فرجار رسم الدوائر الدقيق (Compass) ✓", en: "Correct option ✓" } },
    ],
    explanation: { ar: "الظل يعود للفرجار الهندسي ذو الرأس المحوري وساقي الرسم.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 3. Pattern Completion (إكمال الأنماط الهندسية) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_pat_1',
    type: 'pattern_completion',
    title: { ar: "إكمال متتالية أضلاع الأشكال الهندسية", en: "Complete the Geometric Shapes Sequence" },
    prompt: { ar: "ما هو الشكل التالي في المتتالية؟ [دائرة 0️⃣ → مربع 4️⃣ → سداسي 6️⃣ → ثماني 8️⃣ → ؟]", en: "What is the next shape in the sequence? [Circle 0️⃣ → Square 4️⃣ → Hexagon 6️⃣ → Octagon 8️⃣ → ?]" },
    category: { ar: "أدوات هندسية", en: "Geometry Tools" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="flex items-center justify-center gap-2 py-3 bg-slate-900 rounded-2xl border border-slate-800">
        <div class="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-xs font-bold text-sky-300">○ (0)</div>
        <span class="text-slate-500 font-bold">→</span>
        <div class="w-10 h-10 bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-xs font-bold text-indigo-300">□ (4)</div>
        <span class="text-slate-500 font-bold">→</span>
        <div class="w-10 h-10 bg-purple-500/20 border border-purple-400 flex items-center justify-center text-xs font-bold text-purple-300">⬡ (6)</div>
        <span class="text-slate-500 font-bold">→</span>
        <div class="w-10 h-10 bg-pink-500/20 border border-pink-400 flex items-center justify-center text-xs font-bold text-pink-300">🛑 (8)</div>
        <span class="text-slate-500 font-bold">→</span>
        <div class="w-10 h-10 bg-amber-500/30 border-2 border-dashed border-amber-400 flex items-center justify-center text-sm font-extrabold text-amber-300 animate-pulse">؟</div>
      </div>`,
      promptDetails: { ar: "زيادة متتالية بمقدار +2 في عدد الأضلاع بعد المربع (4 → 6 → 8 → 10)", en: "Challenge details description" },
    },
    options: [
      { id: 'p1_1', label: { ar: "مثلث (3 أضلاع)", en: "Option text" } },
      { id: 'p1_2', label: { ar: "مضلع عشري Decagon (10 أضلاع) ✓", en: "Correct option ✓" } },
      { id: 'p1_3', label: { ar: "نجمة خماسية (5 أضلاع)", en: "Option text" } },
      { id: 'p1_4', label: { ar: "مربع إضافي", en: "Option text" } },
    ],
    explanation: { ar: "تزيد الأضلاع بمقدار 2 في كل خطوة (4, 6, 8, 10)، والشكل التالي هو ذو 10 أضلاع.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_pat_2',
    type: 'pattern_completion',
    title: { ar: "إكمال دوران مسطرة الهندسة 📐", en: "Complete the Ruler Rotation 📐" },
    prompt: { ar: "المسطرة تدور باتجاه عقارب الساعة بمقدار 90 درجة كل خطوة؛ ما هو الوضع التالي؟", en: "The ruler rotates clockwise by 90 degrees each step; what is the next position?" },
    category: { ar: "أدوات هندسية", en: "Geometry Tools" },
    difficulty: 'easy',
    timeLimitSeconds: 7,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="flex items-center justify-center gap-3 py-2 bg-slate-900 rounded-2xl">
        <span class="text-2xl transform rotate-0">📐</span>
        <span class="text-slate-500">→</span>
        <span class="text-2xl transform rotate-90">📐</span>
        <span class="text-slate-500">→</span>
        <span class="text-2xl transform rotate-180">📐</span>
        <span class="text-slate-500">→</span>
        <span class="text-2xl text-amber-400 font-extrabold">؟</span>
      </div>`,
      promptDetails: { ar: "0° ثم 90° ثم 180° ثم ...", en: "Option text" },
    },
    options: [
      { id: 'p2_1', label: { ar: "دوران 270° (نحو اليسار) ✓", en: "Correct option ✓" } },
      { id: 'p2_2', label: { ar: "دوران 45°", en: "Option text" } },
      { id: 'p2_3', label: { ar: "عودة إلى 0° مباشرة", en: "Option text" } },
      { id: 'p2_4', label: { ar: "دوران معكوس", en: "Option text" } },
    ],
    explanation: { ar: "الدوران بمقدار 90 درجة بعد 180 درجة يصل إلى 270 درجة.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_pat_3',
    type: 'pattern_completion',
    title: { ar: "نمط تبادل ألوان وأشكال الأقلام", en: "Pen Colors & Shapes Pattern" },
    prompt: { ar: "أكمل النمط المتناوب: [قلم أحمر 🔴 ➔ قلم أزرق 🔵 ➔ قلم أحمر 🔴 ➔ قلم أزرق 🔵 ➔ ؟]", en: "Question: Find the correct answer." },
    category: { ar: "أقلام وأدوات", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 7,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<div class="flex justify-center items-center gap-2 p-3 bg-slate-900 rounded-2xl">
        <span class="text-2xl">🔴</span><span class="text-slate-500">➔</span>
        <span class="text-2xl">🔵</span><span class="text-slate-500">➔</span>
        <span class="text-2xl">🔴</span><span class="text-slate-500">➔</span>
        <span class="text-2xl">🔵</span><span class="text-slate-500">➔</span>
        <span class="text-2xl font-bold text-amber-400">؟</span>
      </div>`,
      promptDetails: { ar: "تناوب بسيط بين الأحمر والأزرق", en: "Option text" },
    },
    options: [
      { id: 'p3_1', label: { ar: "قلم أصفر 🟡", en: "Option text" } },
      { id: 'p3_2', label: { ar: "قلم أخضر 🟢", en: "Option text" } },
      { id: 'p3_3', label: { ar: "قلم أحمر 🔴 (الدور عليه في المتتالية) ✓", en: "Correct option ✓" } },
      { id: 'p3_4', label: { ar: "قلم أسود ⚫", en: "Option text" } },
    ],
    explanation: { ar: "النمط يتناوب بين الأحمر والأزرق بالتتابع، بعد الأزرق يأتي قلم أحمر.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_pat_4',
    type: 'pattern_completion',
    title: { ar: "متتالية مقاسات الورق والدفاتر القياسية", en: "Paper & Notebook Sizes Sequence" },
    prompt: { ar: "ما المقاس التالي الذي يضاعف حجم الورقة في السلسلة: [A6 ➔ A5 ➔ A4 ➔ ؟]؟", en: "Question: Find the correct answer." },
    category: { ar: "ورق ودفاتر", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="flex justify-center items-center gap-2 p-3 bg-slate-900 rounded-2xl font-mono font-bold text-sm">
        <span class="px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300">A6</span>➔
        <span class="px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300">A5</span>➔
        <span class="px-2.5 py-1 bg-sky-900/60 text-sky-300 border border-sky-500 rounded-lg">A4</span>➔
        <span class="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500 rounded-lg">؟</span>
      </div>`,
      promptDetails: { ar: "المقاس الهندسي الأكبر المباشر بعد A4", en: "Challenge details description" },
    },
    options: [
      { id: 'p4_1', label: { ar: "مقاس A3 (ضعف مساحة A4) ✓", en: "Correct option ✓" } },
      { id: 'p4_2', label: { ar: "مقاس A2", en: "Option text" } },
      { id: 'p4_3', label: { ar: "مقاس B5", en: "Option text" } },
      { id: 'p4_4', label: { ar: "مقاس A7", en: "Option text" } },
    ],
    explanation: { ar: "المقاس المباشر الأكبر من A4 هو A3.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 4. Fast Pattern Count (تحدي العد والتركيز السريع) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_cnt_1',
    type: 'fast_pattern_count',
    title: { ar: "عد أقلام التحديد الخضراء 🟢", en: "Count the Green Highlighters 🟢" },
    prompt: { ar: "كم عدد أقلام التحديد الخضراء (الزمردية) الظاهرة في اللوحة؟", en: "Question: Find the correct answer." },
    category: { ar: "قرطاسية وألوان", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 7,
    correctAnswerIndex: 2,
    mainVisual: {
      gridItems: [
        { icon: 'highlighter', color: '#10b981', label: { ar: "أخضر", en: "Option text" } },
        { icon: 'highlighter', color: '#f59e0b', label: { ar: "برتقالي", en: "Option text" } },
        { icon: 'highlighter', color: '#10b981', label: { ar: "أخضر", en: "Option text" } },
        { icon: 'pencil', color: '#3b82f6', label: { ar: "أزرق", en: "Option text" } },
        { icon: 'highlighter', color: '#10b981', label: { ar: "أخضر", en: "Option text" } },
        { icon: 'highlighter', color: '#ef4444', label: { ar: "أحمر", en: "Option text" } },
        { icon: 'highlighter', color: '#10b981', label: { ar: "أخضر", en: "Option text" } },
        { icon: 'eraser', color: '#8b5cf6', label: { ar: "بنفسجي", en: "Option text" } },
        { icon: 'highlighter', color: '#10b981', label: { ar: "أخضر", en: "Option text" } },
        { icon: 'highlighter', color: '#f59e0b', label: { ar: "برتقالي", en: "Option text" } },
        { icon: 'highlighter', color: '#10b981', label: { ar: "أخضر", en: "Option text" } },
        { icon: 'highlighter', color: '#10b981', label: { ar: "أخضر", en: "Option text" } },
      ],
      promptDetails: { ar: "عد بسرعة أقلام التحديد الخضراء فقط وتجاهل الألوان الأخرى", en: "Challenge details description" },
    },
    options: [
      { id: 'c1_1', label: { ar: "5 أقلام", en: "Option text" } },
      { id: 'c1_2', label: { ar: "6 أقلام", en: "Option text" } },
      { id: 'c1_3', label: { ar: "7 أقلام خضراء ✓", en: "Correct option ✓" } },
      { id: 'c1_4', label: { ar: "8 أقلام", en: "Option text" } },
    ],
    explanation: { ar: "توجد بالضبط 7 أقلام تحديد باللون الأخضر داخل الشبكة.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_cnt_2',
    type: 'fast_pattern_count',
    title: { ar: "عد نجوم التميز الذهبية ⭐", en: "Count the Golden Stars ⭐" },
    prompt: { ar: "ما هو عدد النجوم الذهبية اللامعة ذات 5 رؤوس في المشهد؟", en: "Question: Find the correct answer." },
    category: { ar: "أدوات تعليمية", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      gridItems: [
        { icon: 'star', color: '#eab308', label: { ar: "نجمة ذهبية", en: "Option text" } },
        { icon: 'circle', color: '#3b82f6', label: { ar: "دائرة زرقاء", en: "Option text" } },
        { icon: 'star', color: '#eab308', label: { ar: "نجمة ذهبية", en: "Option text" } },
        { icon: 'square', color: '#ec4899', label: { ar: "مربع وردي", en: "Option text" } },
        { icon: 'star', color: '#eab308', label: { ar: "نجمة ذهبية", en: "Option text" } },
        { icon: 'triangle', color: '#10b981', label: { ar: "مثلث أخضر", en: "Option text" } },
        { icon: 'star', color: '#eab308', label: { ar: "نجمة ذهبية", en: "Option text" } },
        { icon: 'star', color: '#94a3b8', label: { ar: "نجمة رمادية", en: "Option text" } },
        { icon: 'star', color: '#eab308', label: { ar: "نجمة ذهبية", en: "Option text" } },
        { icon: 'circle', color: '#eab308', label: { ar: "قرص أصفر", en: "Option text" } },
        { icon: 'star', color: '#eab308', label: { ar: "نجمة ذهبية", en: "Option text" } },
        { icon: 'diamond', color: '#6366f1', label: { ar: "معين نيلي", en: "Option text" } },
      ],
      promptDetails: { ar: "احذر النجوم الرمادية أو الأقراص الصفراء!", en: "Challenge details description" },
    },
    options: [
      { id: 'c2_1', label: { ar: "5 نجوم", en: "Option text" } },
      { id: 'c2_2', label: { ar: "6 نجوم ذهبية ✓", en: "Correct option ✓" } },
      { id: 'c2_3', label: { ar: "7 نجوم", en: "Option text" } },
      { id: 'c2_4', label: { ar: "8 نجوم", en: "Option text" } },
    ],
    explanation: { ar: "هناك 6 نجوم ذهبية وواحدة رمادية ورمز دائري أصفر.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_cnt_3',
    type: 'fast_pattern_count',
    title: { ar: "عد دبابيس الورق الفضية 📎", en: "Count the Silver Paperclips 📎" },
    prompt: { ar: "كم عدد مشابك ودبابيس الورق المعروضة في شبكة القرطاسية؟", en: "Question: Find the correct answer." },
    category: { ar: "لوازم مكتبية", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 7,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="grid grid-cols-4 gap-2.5 p-3 bg-slate-900 rounded-2xl max-w-xs mx-auto border border-slate-800">
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📎</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">✏️</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📎</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">✂️</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📎</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">🧼</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📎</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📏</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📎</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📌</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📓</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📐</div>
      </div>`,
      promptDetails: { ar: "ابحث عن رمز الدبوس 📎 فقط", en: "Option text" },
    },
    options: [
      { id: 'c3_1', label: { ar: "5 دبابيس ورق 📎 ✓", en: "Correct option ✓" } },
      { id: 'c3_2', label: { ar: "6 دبابيس", en: "Option text" } },
      { id: 'c3_3', label: { ar: "4 دبابيس", en: "Option text" } },
      { id: 'c3_4', label: { ar: "7 دبابيس", en: "Option text" } },
    ],
    explanation: { ar: "توجد بالضبط 5 دبابيس ورق موزعة في اللوحة.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_cnt_4',
    type: 'fast_pattern_count',
    title: { ar: "عد دفاتر الملاحظات المدرسية 📓", en: "Count the School Notebooks 📓" },
    prompt: { ar: "كم عدد الدفاتر المدرسية 📓 الظاهرة بين الأدوات؟", en: "Question: Find the correct answer." },
    category: { ar: "دفاتر وقرطاسية", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 7,
    correctAnswerIndex: 3,
    mainVisual: {
      svgContent: `<div class="grid grid-cols-4 gap-2.5 p-3 bg-slate-900 rounded-2xl max-w-xs mx-auto border border-slate-800">
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📓</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📓</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">✏️</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📓</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📓</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">✂️</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📓</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📓</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📏</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📓</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📓</div>
        <div class="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">📌</div>
      </div>`,
      promptDetails: { ar: "عد رمز الدفتر 📓 في كل صف", en: "Option text" },
    },
    options: [
      { id: 'c4_1', label: { ar: "6 دفاتر", en: "Option text" } },
      { id: 'c4_2', label: { ar: "7 دفاتر", en: "Option text" } },
      { id: 'c4_3', label: { ar: "9 دفاتر", en: "Option text" } },
      { id: 'c4_4', label: { ar: "8 دفاتر مدرسية 📓 ✓", en: "Correct option ✓" } },
    ],
    explanation: { ar: "توجد 8 دفاتر موزعة بين الأدوات الأخرى.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 5. Shape Sorting (فرز ومطابقة وتصنيف الأشكال) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_sort_1',
    type: 'shape_sorting',
    title: { ar: "فرز الأدوات حسب الشكل الدائري", en: "Sort Tools by Circular Shape" },
    prompt: { ar: "أي مجموعة أدوات تحتوي فقط على أشكال دائرية ومستديرة دون زوايا حادة؟", en: "Question: Find the correct answer." },
    category: { ar: "تصنيف الأشكال", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="flex justify-center items-center gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800">
        <div class="w-12 h-12 rounded-full border-2 border-dashed border-sky-400 flex items-center justify-center text-xs font-bold text-sky-300">مطلوب: دائري ⭕</div>
      </div>`,
      promptDetails: { ar: "اختر المجموعة التي لا تحتوي على أي أضلاع حادة أو مستطيلات", en: "Challenge details description" },
    },
    options: [
      { id: 'so1_1', label: { ar: "مسطرة مثلثة 📐 وممحاة مستطيلة 🧼", en: "Challenge details description" } },
      { id: 'so1_2', label: { ar: "شريط لاصق دائري 🛞 وممحاة دائرية 🔘 وعدسة مكبرة 🔍 ✓", en: "Correct option ✓" } },
      { id: 'so1_3', label: { ar: "دفتر ملاحظات 📓 ومقص حاد ✂️", en: "Option text" } },
      { id: 'so1_4', label: { ar: "علبة ألوان خشبية 📦 ومسطرة مستقيمة 📏", en: "Challenge details description" } },
    ],
    explanation: { ar: "الشريط اللاصق والممحاة الدائرية والعدسة المكبرة كلها أدوات دائرية خالية من الزوايا الحادة.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sort_2',
    type: 'shape_sorting',
    title: { ar: "فرز الأدوات ذات الزوايا القائمة (90 درجة)", en: "Sort Tools with Right Angles (90°)" },
    prompt: { ar: "أي أداة من الأدوات التالية تحتوي على زوايا قائمة 90° هندسية دقيقة؟", en: "Question: Find the correct answer." },
    category: { ar: "هندسة وقياس", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-amber-400 font-bold block mb-1">المعيار المطلوب:</span>
        <span class="text-lg text-white font-mono">زاوية قائمة 90° (Right Angle) 📐</span>
      </div>`,
      promptDetails: { ar: "ابحث عن شكل يحتوي على تعامد تام", en: "Challenge details description" },
    },
    options: [
      { id: 'so2_1', label: { ar: "مسطرة زاوية قائمة مثلثة (مثلث 90°) ✓", en: "Correct option ✓" } },
      { id: 'so2_2', label: { ar: "كرة أرضية جغرافية مجسمة 🌍", en: "Option text" } },
      { id: 'so2_3', label: { ar: "طامس أخطاء بيضاوي", en: "Option text" } },
      { id: 'so2_4', label: { ar: "منقلة نصف دائرية", en: "Option text" } },
    ],
    explanation: { ar: "المسطرة المثلثة تحتوي على زاوية قائمة 90 درجة.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sort_3',
    type: 'shape_sorting',
    title: { ar: "تصنيف أدوات القياس والرسم الدقيق", en: "Sort Measurement & Drawing Tools" },
    prompt: { ar: "أي مجموعة تضم أدوات تستخدم حصراً في القياس وحساب الأبعاد؟", en: "Question: Find the correct answer." },
    category: { ar: "أدوات قياس", en: "Measurement Tools" },
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-emerald-400 font-bold block mb-1">فئة التصنيف:</span>
        <span class="text-sm text-slate-200">أدوات القياس والحساب المترية 📏</span>
      </div>`,
      promptDetails: { ar: "كل العناصر يجب أن تكون أدوات قياس", en: "Challenge details description" },
    },
    options: [
      { id: 'so3_1', label: { ar: "صمغ لاصق + مقص ورق", en: "Option text" } },
      { id: 'so3_2', label: { ar: "ألوان شمعية + فرشاة رسم", en: "Option text" } },
      { id: 'so3_3', label: { ar: "مسطرة مدرجة 📏 + منقلة زوايا 📐 + شريط قياس ⏱️ ✓", en: "Correct option ✓" } },
      { id: 'so3_4', label: { ar: "حقيبة ظهر + مقلمة قماشية", en: "Option text" } },
    ],
    explanation: { ar: "المسطرة والمنقلة وشريط القياس هي أدوات قياس دقيقة.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sort_4',
    type: 'shape_sorting',
    title: { ar: "فرز أدوات التلوين المائي", en: "Sort Watercolor Tools" },
    prompt: { ar: "أي عنصر لا ينتمي إلى مجموعة أدوات الرسم بالألوان المائية؟", en: "Question: Find the correct answer." },
    category: { ar: "فنون ورسم", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 3,
    mainVisual: {
      svgContent: `<div class="flex justify-around items-center p-3 bg-slate-900 rounded-2xl border border-slate-800 text-2xl">
        <span>🖌️</span>
        <span>🎨</span>
        <span>💧</span>
        <span class="text-amber-400 font-bold text-sm">العنصر الدخيل؟</span>
      </div>`,
      promptDetails: { ar: "حدد العنصر الذي لا يستخدم في الرسم المائي", en: "Challenge details description" },
    },
    options: [
      { id: 'so4_1', label: { ar: "ريشة رسم ناعمة", en: "Option text" } },
      { id: 'so4_2', label: { ar: "باليت خلط الألوان", en: "Option text" } },
      { id: 'so4_3', label: { ar: "كوب ماء لغسيل الفرشاة", en: "Option text" } },
      { id: 'so4_4', label: { ar: "دباسة أوراق مكتبية ثقيلة (عنصر دخيل) ✓", en: "Correct option ✓" } },
    ],
    explanation: { ar: "الدباسة أداة مكتبية وليست من أدوات الرسم والتلوين المائي.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 6. Visual Memory (الذاكرة البصرية السريعة) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_mem_1',
    type: 'visual_memory',
    title: { ar: "تذكر موقع الدباسة المدرسية 📎", en: "Option text" },
    prompt: { ar: "في أي مربع كان موقع الدباسة المدرسية (📎)؟ [الصف العلوي A - B | الصف السفلي C - D]", en: "Question: Find the correct answer." },
    category: { ar: "الذاكرة البصرية", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 10,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<div class="grid grid-cols-2 gap-3 p-3 bg-slate-900 rounded-2xl max-w-xs mx-auto border border-slate-800 text-center">
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700"><span class="text-xs text-slate-400 block mb-1">المربع A</span><span class="text-xl">📓 دفتر</span></div>
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700"><span class="text-xs text-slate-400 block mb-1">المربع B</span><span class="text-xl">✂️ مقص</span></div>
        <div class="p-3 bg-amber-500/20 rounded-xl border border-amber-500/50"><span class="text-xs text-amber-400 block mb-1 font-bold">المربع C</span><span class="text-xl">📎 دباسة</span></div>
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700"><span class="text-xs text-slate-400 block mb-1">المربع D</span><span class="text-xl">📐 مسطرة</span></div>
      </div>`,
      promptDetails: { ar: "المربع C في الصف السفلي على اليمين", en: "Challenge details description" },
    },
    options: [
      { id: 'm1_1', label: { ar: "المربع A (أعلى يمين)", en: "Option text" } },
      { id: 'm1_2', label: { ar: "المربع B (أعلى يسار)", en: "Option text" } },
      { id: 'm1_3', label: { ar: "المربع C (أسفل يمين) ✓", en: "Correct option ✓" } },
      { id: 'm1_4', label: { ar: "المربع D (أسفل يسار)", en: "Option text" } },
    ],
    explanation: { ar: "كانت الدباسة المدرسية موضوعة في المربع C في الصف السفلي.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_mem_2',
    type: 'visual_memory',
    title: { ar: "تذكر لون قلم الهايلايتر العلوي", en: "Challenge details description" },
    prompt: { ar: "ما كان لون قلم التحديد (هايلايتر) في الخانة العلوية؟", en: "Question: Find the correct answer." },
    category: { ar: "الذاكرة البصرية", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 9,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-slate-400 block mb-2">احفظ اللون بسرعة:</span>
        <div class="inline-block px-4 py-2 bg-pink-500/20 border border-pink-400 rounded-xl text-pink-300 font-bold text-base">
          🖍️ قلم وردي نيون (Neon Pink)
        </div>
      </div>`,
      promptDetails: { ar: "تذكر درجة اللون الوردي الفاقع", en: "Option text" },
    },
    options: [
      { id: 'm2_1', label: { ar: "وردي فاقع (Pink) ✓", en: "Correct option ✓" } },
      { id: 'm2_2', label: { ar: "أخضر ليموني", en: "Option text" } },
      { id: 'm2_3', label: { ar: "أزرق سماوي", en: "Option text" } },
      { id: 'm2_4', label: { ar: "برتقالي داكن", en: "Option text" } },
    ],
    explanation: { ar: "القلم المعروض كان باللون الوردي النيون.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_mem_3',
    type: 'visual_memory',
    title: { ar: "تذكر رقم صندوق الهدية الذهبية 🎁", en: "Challenge details description" },
    prompt: { ar: "في أي صندوق من الصناديق الثلاثة كانت تختبئ الجائزة الذهبية؟", en: "Question: Find the correct answer." },
    category: { ar: "الذاكرة البصرية", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="grid grid-cols-3 gap-2 p-3 bg-slate-900 rounded-2xl text-center">
        <div class="p-2 bg-slate-800 rounded-lg"><span class="text-xs text-slate-400 block">صندوق 1</span><span>📦</span></div>
        <div class="p-2 bg-amber-500/20 border border-amber-400 rounded-lg"><span class="text-xs text-amber-300 font-bold block">صندوق 2</span><span>🎁 جائزة</span></div>
        <div class="p-2 bg-slate-800 rounded-lg"><span class="text-xs text-slate-400 block">صندوق 3</span><span>📦</span></div>
      </div>`,
      promptDetails: { ar: "الصندوق الأوسط رقم 2", en: "Option text" },
    },
    options: [
      { id: 'm3_1', label: { ar: "الصندوق رقم [1]", en: "Option text" } },
      { id: 'm3_2', label: { ar: "الصندوق رقم [2] الأوسط ✓", en: "Correct option ✓" } },
      { id: 'm3_3', label: { ar: "الصندوق رقم [3]", en: "Option text" } },
      { id: 'm3_4', label: { ar: "لا شيء في الصناديق", en: "Option text" } },
    ],
    explanation: { ar: "الهدية كانت داخل الصندوق رقم 2 في المنتصف.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_mem_4',
    type: 'visual_memory',
    title: { ar: "تذكر ترتيب وميض الرموز الثلاثة", en: "Challenge details description" },
    prompt: { ar: "ما هو الترتيب الصحيح لوميض الرموز: [1 ➔ 2 ➔ 3]؟", en: "Question: Find the correct answer." },
    category: { ar: "الذاكرة البصرية", en: "Option text" },
    difficulty: 'hard',
    timeLimitSeconds: 9,
    correctAnswerIndex: 3,
    mainVisual: {
      svgContent: `<div class="flex justify-center items-center gap-3 p-3 bg-slate-900 rounded-2xl text-xl">
        <span class="p-2 bg-slate-800 rounded-lg">1: ✂️ مقص</span>
        <span>➔</span>
        <span class="p-2 bg-slate-800 rounded-lg">2: ✏️ قلم</span>
        <span>➔</span>
        <span class="p-2 bg-slate-800 rounded-lg">3: 🧼 ممحاة</span>
      </div>`,
      promptDetails: { ar: "مقص ثم قلم ثم ممحاة", en: "Option text" },
    },
    options: [
      { id: 'm4_1', label: { ar: "قلم ➔ ممحاة ➔ مقص", en: "Option text" } },
      { id: 'm4_2', label: { ar: "ممحاة ➔ مقص ➔ قلم", en: "Option text" } },
      { id: 'm4_3', label: { ar: "مقص ➔ ممحاة ➔ قلم", en: "Option text" } },
      { id: 'm4_4', label: { ar: "مقص ➔ قلم ➔ ممحاة ✓", en: "Correct option ✓" } },
    ],
    explanation: { ar: "الترتيب كان: 1- مقص، 2- قلم، 3- ممحاة.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 7. Missing Puzzle Piece (القطعة الناقصة من التركيب) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_miss_1',
    type: 'missing_puzzle_piece',
    title: { ar: "القطعة المفقودة في لوحة الألوان الفنية", en: "Challenge details description" },
    prompt: { ar: "أي قطعة من الخيارات أدناه تكمل نمط التدرج اللوني في الخانة الفارغة (؟)؟", en: "Question: Find the correct answer." },
    category: { ar: "أدوات رسم وفنون", en: "Arts & Drawing Tools" },
    difficulty: 'medium',
    timeLimitSeconds: 9,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 150 150" class="w-36 h-36 mx-auto rounded-2xl border-2 border-slate-700 bg-slate-900 p-2">
        <rect x="10" y="10" width="40" height="40" rx="6" fill="#38bdf8"/>
        <rect x="55" y="10" width="40" height="40" rx="6" fill="#818cf8"/>
        <rect x="100" y="10" width="40" height="40" rx="6" fill="#c084fc"/>

        <rect x="10" y="55" width="40" height="40" rx="6" fill="#0284c7"/>
        <rect x="55" y="55" width="40" height="40" rx="6" fill="#4f46e5"/>
        <rect x="100" y="55" width="40" height="40" rx="6" fill="#9333ea"/>

        <rect x="10" y="100" width="40" height="40" rx="6" fill="#0369a1"/>
        <rect x="55" y="100" width="40" height="40" rx="6" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,4" fill="#1e293b"/>
        <text x="75" y="126" font-size="18" font-weight="extrabold" fill="#fbbf24" text-anchor="middle">؟</text>

        <rect x="100" y="100" width="40" height="40" rx="6" fill="#6b21a8"/>
      </svg>`,
      promptDetails: { ar: "العمود الأوسط يتدرج من النيلي الفاتح (#818cf8) إلى الداكن", en: "Challenge details description" },
    },
    options: [
      { id: 'mp1_1', label: { ar: "مربع نيلي داكن (#3730a3) ✓", en: "Correct option ✓" } },
      { id: 'mp1_2', label: { ar: "مربع برتقالي ناري", en: "Option text" } },
      { id: 'mp1_3', label: { ar: "مربع أخضر غامق", en: "Option text" } },
      { id: 'mp1_4', label: { ar: "مربع أزرق سماوي فاتح", en: "Option text" } },
    ],
    explanation: { ar: "التدرج اللوني في العمود الأوسط يتطلب درجة الأزرق النيلي الداكن لإتمام التناسق.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_miss_2',
    type: 'missing_puzzle_piece',
    title: { ar: "إكمال غلاف كتاب الرياضيات الهندسي", en: "Challenge details description" },
    prompt: { ar: "ما هي القطعة المناسبة لإكمال الزاوية الناقصة في غلاف الكتاب؟", en: "Question: Find the correct answer." },
    category: { ar: "كتب ومناهج", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <div class="w-32 h-20 mx-auto bg-gradient-to-r from-sky-600 to-indigo-600 rounded-lg flex items-center justify-center relative">
          <span class="text-xs text-white font-bold">كتاب الهندسة</span>
          <div class="absolute top-0 right-0 w-8 h-8 bg-slate-900 border-b-2 border-l-2 border-dashed border-amber-400 flex items-center justify-center text-xs text-amber-400 font-black">؟</div>
        </div>
      </div>`,
      promptDetails: { ar: "مربع الزاوية العلوية اليمنى باللون الأزرق الموشح", en: "Challenge details description" },
    },
    options: [
      { id: 'mp2_1', label: { ar: "قطعة دائرية صفراء", en: "Option text" } },
      { id: 'mp2_2', label: { ar: "مثلث زاوية بلون أزرق نيلي متناسق ✓", en: "Correct option ✓" } },
      { id: 'mp2_3', label: { ar: "قطعة خشبية بنية", en: "Option text" } },
      { id: 'mp2_4', label: { ar: "حلقة معدنية", en: "Option text" } },
    ],
    explanation: { ar: "القطعة النيلية المتناسقة تكمل زاوية الغلاف بدقة.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_miss_3',
    type: 'missing_puzzle_piece',
    title: { ar: "القطعة المفقودة من لوحة ألوان الباستيل", en: "Challenge details description" },
    prompt: { ar: "أي لون من الألوان يكمل التدرج الأفقي: [وردي فاتح ➔ خوخي ➔ ؟ ➔ أصفر]؟", en: "Question: Find the correct answer." },
    category: { ar: "ألوان وفنون", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<div class="flex justify-center items-center gap-2 p-3 bg-slate-900 rounded-2xl">
        <div class="w-10 h-10 rounded-lg bg-rose-300"></div>
        <div class="w-10 h-10 rounded-lg bg-orange-300"></div>
        <div class="w-10 h-10 rounded-lg border-2 border-dashed border-amber-400 flex items-center justify-center text-amber-300 font-bold">؟</div>
        <div class="w-10 h-10 rounded-lg bg-yellow-300"></div>
      </div>`,
      promptDetails: { ar: "اللون الانتقالي بين الخوخي والأصفر", en: "Challenge details description" },
    },
    options: [
      { id: 'mp3_1', label: { ar: "أزرق كحلي داكن", en: "Option text" } },
      { id: 'mp3_2', label: { ar: "بنفسجي باذنجاني", en: "Option text" } },
      { id: 'mp3_3', label: { ar: "برتقالي فاتح مشمشي (Apricot) ✓", en: "Correct option ✓" } },
      { id: 'mp3_4', label: { ar: "رمادي حجري", en: "Option text" } },
    ],
    explanation: { ar: "اللون المشمشي الفاتح هو حلقة الوصل الطبيعية في تدرج الطيف.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_miss_4',
    type: 'missing_puzzle_piece',
    title: { ar: "ترس المبراة الميكانيكية المفقود ⚙️", en: "Challenge details description" },
    prompt: { ar: "أي ترس ميكانيكي يتطابق قطره مع الفراغ المخصص لإدارة شفرة المبراة؟", en: "Question: Find the correct answer." },
    category: { ar: "أدوات مكتبية", en: "Office Supplies" },
    difficulty: 'hard',
    timeLimitSeconds: 9,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <div class="flex justify-center items-center gap-2 text-3xl">
          <span>⚙️ (كبير)</span>
          <span class="text-amber-400 text-base font-bold">[؟ ترس متوسط 8 أسنان]</span>
          <span>⚙️ (صغير)</span>
        </div>
      </div>`,
      promptDetails: { ar: "ترس وسيط متوسط لنقل الحركة بين الترسين", en: "Challenge details description" },
    },
    options: [
      { id: 'mp4_1', label: { ar: "ترس فولاذي متوسط بـ 8 أسنان متناسقة ✓", en: "Correct option ✓" } },
      { id: 'mp4_2', label: { ar: "قضيب حديدي مسطح", en: "Option text" } },
      { id: 'mp4_3', label: { ar: "حبل مطاطي", en: "Option text" } },
      { id: 'mp4_4', label: { ar: "مسمار لولبي فردي", en: "Option text" } },
    ],
    explanation: { ar: "الترس ذو الأسنان الـ 8 ينقل الحركة بين الترس الكبير والترس الصغير بكفاءة.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 8. One-Stroke Maze (المتاهة الذكية السريعة) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_maze_1',
    type: 'one_stroke_maze',
    title: { ar: "مسار التوصيل السريع إلى مكتبة الشاطئ الازرق", en: "Challenge details description" },
    prompt: { ar: "أي مسار ملون (A، B، C، D) يربط البداية (🚩) بالمتجر (🏪) دون أن يعترضه أي حاجز أحمر (⛔)؟", en: "Question: Find the correct answer." },
    category: { ar: "ألعاب ذكاء", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 9,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 200 120" class="w-full max-w-xs mx-auto rounded-xl bg-slate-900 p-2 shadow-inner">
        <circle cx="20" cy="60" r="10" fill="#22c55e" />
        <text x="20" y="64" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">🚩</text>
        
        <circle cx="180" cy="60" r="12" fill="#0284c7" />
        <text x="180" y="65" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">🏪</text>

        <rect x="70" y="15" width="12" height="30" rx="3" fill="#ef4444" />
        <text x="76" y="33" font-size="8" fill="#fff" text-anchor="middle">⛔</text>

        <rect x="120" y="75" width="12" height="35" rx="3" fill="#ef4444" />
        <text x="126" y="95" font-size="8" fill="#fff" text-anchor="middle">⛔</text>

        <path d="M20 60 Q50 85 95 70 Q140 40 180 60" fill="none" stroke="#38bdf8" stroke-width="4"/>
      </svg>`,
      promptDetails: { ar: "تتبع المسار الأزرق (C) لتجاوز جميع الحواجز بأمان", en: "Challenge details description" },
    },
    options: [
      { id: 'mz1_1', label: { ar: "المسار A (الوردي المتقطع)", en: "Option text" } },
      { id: 'mz1_2', label: { ar: "المسار B (الأصفر السفلي)", en: "Option text" } },
      { id: 'mz1_3', label: { ar: "المسار C (الأزرق المتدفق) ✓", en: "Correct option ✓" } },
      { id: 'mz1_4', label: { ar: "المسار D (البنفسجي المغلق)", en: "Option text" } },
    ],
    explanation: { ar: "المسار C (الأزرق) يمر بين الحاجز العلوي والحاجز السفلي بسلاسة دون اصطدام.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_maze_2',
    type: 'one_stroke_maze',
    title: { ar: "المتاهة السريعة إلى الحقيبة المدرسية 🎒", en: "Challenge details description" },
    prompt: { ar: "أي المسارات الثلاثة (1 أو 2 أو 3) مفتوح بالكامل للوصول إلى الحقيبة دون أي حاجز؟", en: "Question: Find the correct answer." },
    category: { ar: "متاهات ومسارات", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 9,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 max-w-sm mx-auto">
        <div class="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
          <span>نقطة البداية: 🚶‍♂️</span>
          <span>الهدف: 🎒 الحقيبة</span>
        </div>
        <div class="space-y-2 text-xs">
          <div class="p-1.5 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center justify-between text-rose-300">
            <span>مسار [1]: يمين ➔ أعلى ➔ (جدار مسدود ⛔)</span>
          </div>
          <div class="p-1.5 bg-emerald-950/40 border border-emerald-500/60 rounded-lg flex items-center justify-between text-emerald-300 font-bold">
            <span>مسار [2]: مستقيم ➔ دوران يسار ➔ طريق مفتوح ✅</span>
          </div>
          <div class="p-1.5 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center justify-between text-rose-300">
            <span>مسار [3]: أسفل ➔ دوران يمين ➔ (حاجز مغلق ⛔)</span>
          </div>
        </div>
      </div>`,
      promptDetails: { ar: "المسار 2 سالك ومباشر بدون عوائق", en: "Challenge details description" },
    },
    options: [
      { id: 'mz2_1', label: { ar: "المسار رقم [1]", en: "Option text" } },
      { id: 'mz2_2', label: { ar: "المسار رقم [2] (المفتوح بالكامل) ✓", en: "Correct option ✓" } },
      { id: 'mz2_3', label: { ar: "المسار رقم [3]", en: "Option text" } },
      { id: 'mz2_4', label: { ar: "جميع المسارات مغلقة", en: "Option text" } },
    ],
    explanation: { ar: "المسار رقم [2] هو المسار الوحيد الخالي من العوائق والحواجز المغلقة.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_maze_3',
    type: 'one_stroke_maze',
    title: { ar: "مسار توصيل القلم بالدفتر ✏️ ➔ 📓", en: "Challenge details description" },
    prompt: { ar: "أي خط يربط القلم بالدفتر دون أن يتقاطع مع الخطوط الأخرى؟", en: "Question: Find the correct answer." },
    category: { ar: "مسارات وتوصيل", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <div class="flex justify-between items-center text-xs font-bold px-2">
          <span>✏️ القلم</span>
          <span class="text-emerald-400 font-bold">المسار الأخضر (مباشر دون تقاطع)</span>
          <span>📓 الدفتر</span>
        </div>
      </div>`,
      promptDetails: { ar: "المسار المباشر العلوي الأخضر", en: "Option text" },
    },
    options: [
      { id: 'mz3_1', label: { ar: "المسار العلوي الأخضر (B) ✓", en: "Correct option ✓" } },
      { id: 'mz3_2', label: { ar: "المسار المتعرج السفلي (C)", en: "Option text" } },
      { id: 'mz3_3', label: { ar: "المسار المتقاطع الأوسط (A)", en: "Option text" } },
      { id: 'mz3_4', label: { ar: "المسار المنحني الحلزوني (D)", en: "Option text" } },
    ],
    explanation: { ar: "المسار العلوي الأخضر يربط النقطتين بسلاسة دون أي تقاطع.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_maze_4',
    type: 'one_stroke_maze',
    title: { ar: "مسار خروج سيارة الشحن السريع 🚚", en: "Challenge details description" },
    prompt: { ar: "أي بوابة خروج من المستودع تؤدي مباشرة إلى الطريق السريع (طريق 50)؟", en: "Question: Find the correct answer." },
    category: { ar: "لوجستيات وتوصيل", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 7,
    correctAnswerIndex: 3,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-slate-400 block mb-1">شاحنة التوصيل: 🚚</span>
        <span class="text-xs text-amber-400 font-bold">البوابة [D] متصلة بالطريق السريع مباشرة بدون إشارات</span>
      </div>`,
      promptDetails: { ar: "البوابة D مفتوحة للشحن السريع", en: "Option text" },
    },
    options: [
      { id: 'mz4_1', label: { ar: "البوابة [A] (مغلقة للصيانة)", en: "Option text" } },
      { id: 'mz4_2', label: { ar: "البوابة [B] (مسار بطيء)", en: "Option text" } },
      { id: 'mz4_3', label: { ar: "البوابة [C] (تحويل إجباري)", en: "Option text" } },
      { id: 'mz4_4', label: { ar: "البوابة [D] (المسار المباشر السريع) ✓", en: "Correct option ✓" } },
    ],
    explanation: { ar: "البوابة D هي المنفذ المباشر والسريع للشاحنة.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 9. Order Sequence (ترتيب السلاسل والمقادير) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_seq_1',
    type: 'order_sequence',
    title: { ar: "ترتيب الأدوات تصاعدياً حسب الطول 📏", en: "Challenge details description" },
    prompt: { ar: "رتب الأدوات التالية من الأقصر إلى الأطول: [ممحاة 🧼 (3cm) - قلم رصاص ✏️ (15cm) - مسطرة 📏 (30cm) - دبوس 📎 (1cm)]", en: "Challenge details description" },
    category: { ar: "ترتيب وقياسات", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="flex justify-around items-center p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <div><span class="text-xl">📎</span><span class="text-[10px] text-slate-400 block">1cm</span></div>
        <div><span class="text-xl">🧼</span><span class="text-[10px] text-slate-400 block">3cm</span></div>
        <div><span class="text-xl">✏️</span><span class="text-[10px] text-slate-400 block">15cm</span></div>
        <div><span class="text-xl">📏</span><span class="text-[10px] text-slate-400 block">30cm</span></div>
      </div>`,
      promptDetails: { ar: "الترتيب من الأصغر 1cm إلى الأكبر 30cm", en: "Challenge details description" },
    },
    options: [
      { id: 'sq1_1', label: { ar: "دبوس (1cm) ➔ ممحاة (3cm) ➔ قلم (15cm) ➔ مسطرة (30cm) ✓", en: "Correct option ✓" } },
      { id: 'sq1_2', label: { ar: "مسطرة ➔ قلم ➔ ممحاة ➔ دبوس", en: "Option text" } },
      { id: 'sq1_3', label: { ar: "ممحاة ➔ دبوس ➔ قلم ➔ مسطرة", en: "Option text" } },
      { id: 'sq1_4', label: { ar: "قلم ➔ مسطرة ➔ ممحاة ➔ دبوس", en: "Option text" } },
    ],
    explanation: { ar: "الترتيب التصاعدي الصحيح يبدأ من الدبوس (1 سم) ثم الممحاة (3 سم) ثم القلم (15 سم) ثم المسطرة (30 سم).", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_seq_2',
    type: 'order_sequence',
    title: { ar: "ترتيب خطوات تجليد وحماية الكتاب المدرسي 📚", en: "Challenge details description" },
    prompt: { ar: "ما هو الترتيب المنطقي لخطوات تجليد الكتاب؟", en: "Question: Find the correct answer." },
    category: { ar: "تجليد وقرطاسية", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-amber-300 font-bold block mb-1">خطوات تجليد الدفاتر:</span>
        <span class="text-xs text-slate-300">القياس والقص ➔ التثبيت ➔ طي الزوايا ➔ وضع الاستيكر</span>
      </div>`,
      promptDetails: { ar: "ابدأ دائماً بقياس وقص التجليد المناسب", en: "Challenge details description" },
    },
    options: [
      { id: 'sq2_1', label: { ar: "وضع الاستيكر ➔ قص التجليد ➔ قراءة الكتاب", en: "Challenge details description" } },
      { id: 'sq2_2', label: { ar: "قص التجليد حسب المقاس ➔ فرد الغلاف ➔ طي الزوايا ➔ وضع بطاقة الاسم ✓", en: "Correct option ✓" } },
      { id: 'sq2_3', label: { ar: "طي الزوايا ➔ قص التجليد ➔ وضع الكتاب في الحقيبة", en: "Challenge details description" } },
      { id: 'sq2_4', label: { ar: "استخدام الكتاب مباشرة دون تجليد", en: "Challenge details description" } },
    ],
    explanation: { ar: "الخطوة الأولى هي القص ثم الفرد ثم الطي ثم إلصاق بطاقة الاسم.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_seq_3',
    type: 'order_sequence',
    title: { ar: "ترتيب سماكة سن أقلام الحبر الجاف 🖊️", en: "Challenge details description" },
    prompt: { ar: "رتب خطوط أقلام الحبر من الأرفع (الأدق) إلى الأعظم سماكة:", en: "Challenge details description" },
    category: { ar: "أقلام وكتابة", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 7,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<div class="flex justify-around items-center p-3 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xs">
        <span class="text-sky-300">0.38mm</span>
        <span>➔</span>
        <span class="text-indigo-300">0.5mm</span>
        <span>➔</span>
        <span class="text-purple-300">0.7mm</span>
        <span>➔</span>
        <span class="text-pink-300">1.0mm</span>
      </div>`,
      promptDetails: { ar: "0.38 مم هو الأرفع و 1.0 مم هو الأعرض", en: "Challenge details description" },
    },
    options: [
      { id: 'sq3_1', label: { ar: "1.0mm ➔ 0.7mm ➔ 0.5mm ➔ 0.38mm", en: "1.0mm ➔ 0.7mm ➔ 0.5mm ➔ 0.38mm" } },
      { id: 'sq3_2', label: { ar: "0.5mm ➔ 1.0mm ➔ 0.38mm ➔ 0.7mm", en: "0.5mm ➔ 1.0mm ➔ 0.38mm ➔ 0.7mm" } },
      { id: 'sq3_3', label: { ar: "0.38mm ➔ 0.5mm ➔ 0.7mm ➔ 1.0mm ✓", en: "0.38mm ➔ 0.5mm ➔ 0.7mm ➔ 1.0mm ✓" } },
      { id: 'sq3_4', label: { ar: "0.7mm ➔ 0.38mm ➔ 1.0mm ➔ 0.5mm", en: "0.7mm ➔ 0.38mm ➔ 1.0mm ➔ 0.5mm" } },
    ],
    explanation: { ar: "الترتيب التصاعدي الصحيح لسماكة السن هو من 0.38 ملم وصولاً إلى 1.0 ملم.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_seq_4',
    type: 'order_sequence',
    title: { ar: "ترتيب سعة حافظات الأقلام (المقالم)", en: "Challenge details description" },
    prompt: { ar: "رتب حافظات الأقلام من الأصغر سعة إلى الأكبر سعة استيعابية:", en: "Challenge details description" },
    category: { ar: "مقالم وحافظات", en: "Option text" },
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-emerald-400 font-bold block mb-1">التدرج الحجمي:</span>
        <span class="text-xs text-slate-300">مقلمة قلم مفرد ➔ مقلمة سحاب واحد ➔ مقلمة طابقين ➔ صندوق أدوات</span>
      </div>`,
      promptDetails: { ar: "المقلمة الفردية تحمل قلماً واحداً والصندوق يحمل 50+ أداة", en: "Challenge details description" },
    },
    options: [
      { id: 'sq4_1', label: { ar: "جراب قلم مفرد ➔ مقلمة جيب ➔ مقلمة طابقين ➔ صندوق تنظيم مكتبي ✓", en: "Correct option ✓" } },
      { id: 'sq4_2', label: { ar: "صندوق تنظيم ➔ مقلمة طابقين ➔ جراب مفرد", en: "Challenge details description" } },
      { id: 'sq4_3', label: { ar: "مقلمة طابقين ➔ جراب مفرد ➔ صندوق تنظيم", en: "Challenge details description" } },
      { id: 'sq4_4', label: { ar: "مقلمة جيب ➔ صندوق تنظيم ➔ جراب مفرد", en: "Challenge details description" } },
    ],
    explanation: { ar: "التدرج يبدأ من الجراب الفردي وصولاً إلى الصندوق المكتبي المتكامل.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 10. Reaction Speed (اختبار سرعة رد الفعل) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_rx_1',
    type: 'reaction_speed',
    title: { ar: "استجابة سريعة للرمز الذهبي ✨", en: "Option text" },
    prompt: { ar: "اضغط فوراً على الزر الذي يحتوي على الرمز الذهبي اللامع (⭐):", en: "Challenge details description" },
    category: { ar: "سرعة رد الفعل", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 6,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="p-4 bg-slate-900 rounded-2xl border border-amber-500/40 text-center animate-pulse">
        <span class="text-xs text-amber-400 font-bold block mb-1">وميض فوري! حدد الرمز:</span>
        <span class="text-4xl">⭐</span>
      </div>`,
      promptDetails: { ar: "اختر زر النجمة الذهبية بأقصى سرعة", en: "Challenge details description" },
    },
    options: [
      { id: 'rx1_1', label: { ar: "🔹 زر المربع الأزرق", en: "Option text" } },
      { id: 'rx1_2', label: { ar: "⭐ زر النجمة الذهبية (المطابق للوميض) ✓", en: "Correct option ✓" } },
      { id: 'rx1_3', label: { ar: "🛑 زر الإيقاف الأحمر", en: "Option text" } },
      { id: 'rx1_4', label: { ar: "🟢 زر الدائرة الخضراء", en: "Option text" } },
    ],
    explanation: { ar: "الرمز الذي ومض هو النجمة الذهبية ⭐.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_rx_2',
    type: 'reaction_speed',
    title: { ar: "استجابة إشارة المرور الخضراء للانطلاق 🟢", en: "Challenge details description" },
    prompt: { ar: "الضوء أصبح أخضر الآن! اضغط على زر الانطلاق الفوري:", en: "Challenge details description" },
    category: { ar: "سرعة رد الفعل", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 5,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="p-4 bg-slate-900 rounded-2xl border border-emerald-500/40 text-center animate-pulse">
        <span class="text-xs text-emerald-400 font-bold block mb-1">إشارة خضراء: انطلق الآن!</span>
        <span class="text-4xl">🟢</span>
      </div>`,
      promptDetails: { ar: "اضغط على زر المرور الأخضر", en: "Option text" },
    },
    options: [
      { id: 'rx2_1', label: { ar: "🟢 زر المرور الأخضر (GO!) ✓", en: "Correct option ✓" } },
      { id: 'rx2_2', label: { ar: "🔴 زر التوقف الأحمر", en: "Option text" } },
      { id: 'rx2_3', label: { ar: "🟡 زر الاستعداد الأصفر", en: "Option text" } },
      { id: 'rx2_4', label: { ar: "⚪ زر الانتظار الأبيض", en: "Option text" } },
    ],
    explanation: { ar: "الإشارة خضراء تتطلب الضغط الفوري على زر المرور الأخضر.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_rx_3',
    type: 'reaction_speed',
    title: { ar: "وميض رمز البرق السريع ⚡", en: "Option text" },
    prompt: { ar: "حدد زر البرق الأصفر الصاعق فور ظهوره:", en: "Challenge details description" },
    category: { ar: "سرعة رد الفعل", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 5,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<div class="p-4 bg-slate-900 rounded-2xl border border-yellow-500/40 text-center animate-pulse">
        <span class="text-xs text-yellow-400 font-bold block mb-1">صعقة سرعة!</span>
        <span class="text-4xl">⚡</span>
      </div>`,
      promptDetails: { ar: "اختر زر صاعقة البرق ⚡", en: "Option text" },
    },
    options: [
      { id: 'rx3_1', label: { ar: "❄️ رمز الجليد", en: "Option text" } },
      { id: 'rx3_2', label: { ar: "🔥 رمز اللهب", en: "Option text" } },
      { id: 'rx3_3', label: { ar: "⚡ رمز البرق الأصفر السريع ✓", en: "Correct option ✓" } },
      { id: 'rx3_4', label: { ar: "💧 رمز قطرة الماء", en: "Option text" } },
    ],
    explanation: { ar: "الرمز الظاهر هو صاعقة البرق ⚡.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_rx_4',
    type: 'reaction_speed',
    title: { ar: "استجابة قلم الحبر الأزرق 🖊️", en: "Option text" },
    prompt: { ar: "حدد زر قلم الحبر الأزرق فور ظهوره بين الأدوات:", en: "Challenge details description" },
    category: { ar: "سرعة رد الفعل", en: "Option text" },
    difficulty: 'easy',
    timeLimitSeconds: 5,
    correctAnswerIndex: 3,
    mainVisual: {
      svgContent: `<div class="p-4 bg-slate-900 rounded-2xl border border-sky-500/40 text-center animate-pulse">
        <span class="text-xs text-sky-400 font-bold block mb-1">أداة الكتابة ظهرت!</span>
        <span class="text-4xl">🖊️</span>
      </div>`,
      promptDetails: { ar: "اختر زر قلم الحبر 🖊️ بأسرع رد فعل", en: "Challenge details description" },
    },
    options: [
      { id: 'rx4_1', label: { ar: "📏 مسطرة قياس", en: "Option text" } },
      { id: 'rx4_2', label: { ar: "✂️ مقص ورق", en: "Option text" } },
      { id: 'rx4_3', label: { ar: "📌 دبوس لوحة", en: "Option text" } },
      { id: 'rx4_4', label: { ar: "🖊️ قلم حبر أزرق فاخر ✓", en: "Correct option ✓" } },
    ],
    explanation: { ar: "الرمز الذي ظهر في الوميض هو قلم الحبر الأزرق 🖊️.", en: "Challenge details description" },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];
