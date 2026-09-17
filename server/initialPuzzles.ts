import { VisualPuzzle } from './freeChallengeTypes';

export const allInitialPuzzles: VisualPuzzle[] = [
  // =========================================================================
  // 1. Visual Difference (اختلاف الصورة والبحث عن المختلف) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_diff_1',
    type: 'visual_difference',
    title: 'اكتشاف العنصر المختلف على طاولة المكتب',
    prompt: 'قارن بين اللوحتين؛ ما هو العنصر الذي تم استبداله في اللوحة المعدلة (B)؟',
    category: 'أدوات مكتبية',
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
      promptDetails: 'دقق في العنصر الثالث من اليمين في كل لوحة',
    },
    options: [
      { id: 'd1_1', label: 'تم تغيير الدفتر' },
      { id: 'd1_2', label: 'تم تغيير المقص' },
      { id: 'd1_3', label: 'تم تغيير الدباسة' },
      { id: 'd1_4', label: 'تم استبدال الممحاة بقلم رصاص / مبراة ✓' },
    ],
    explanation: 'في اللوحة الأولى توجد الممحاة (🧼) بينما تم استبدالها في اللوحة الثانية بالقلم (✏️).',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_diff_2',
    type: 'visual_difference',
    title: 'اختلاف الحقائب المدرسية',
    prompt: 'قارن بين تفاصيل الحقيبتين؛ ما هو الفارق الوحيد الموجود في الحقيبة (B)؟',
    category: 'حقائب وقرطاسية',
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
      promptDetails: 'انتبه للون سحاب الجيب الأمامي',
    },
    options: [
      { id: 'd2_1', label: 'شكل المقبض العلوي' },
      { id: 'd2_2', label: 'لون السحاب الأمامي تم تغييره للأخضر ✓' },
      { id: 'd2_3', label: 'عدد الجيوب الجانبية' },
      { id: 'd2_4', label: 'خامة القماش الخارجي' },
    ],
    explanation: 'سحاب الحقيبة B لونه أخضر بينما في A لونه أصفر.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_diff_3',
    type: 'visual_difference',
    title: 'اختلاف طاولة الرسم والألوان',
    prompt: 'أي أداة رسم تم تدويرها أو تغيير زاويتها في اللوحة الثانية؟',
    category: 'أدوات رسم وفنون',
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
      promptDetails: 'لاحظ زاوية اتجاه فرشاة الرسم 🖌️',
    },
    options: [
      { id: 'd3_1', label: 'فرشاة الرسم دارت بمقدار 90 درجة ✓' },
      { id: 'd3_2', label: 'لوحة الألوان تغيرت' },
      { id: 'd3_3', label: 'المسطرة تحولت لمنقلة' },
      { id: 'd3_4', label: 'لا يوجد أي اختلاف' },
    ],
    explanation: 'فرشاة الرسم 🖌️ تم تدويرها 90 درجة في اللوحة B.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_diff_4',
    type: 'visual_difference',
    title: 'اختلاف علبة الهندسة المدرسية',
    prompt: 'ما العنصر المضاف الجديد في العلبة (B) غير الموجود في (A)؟',
    category: 'أدوات هندسية',
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
      promptDetails: 'انتبه للأداة الرابعة المضافة في أقصى اليسار',
    },
    options: [
      { id: 'd4_1', label: 'تمت إضافة مبراة' },
      { id: 'd4_2', label: 'تم تغيير نوع المسطرة' },
      { id: 'd4_3', label: 'تمت إضافة مغناطيس تجارب تعليمي 🧲 ✓' },
      { id: 'd4_4', label: 'تمت إزالة القلم' },
    ],
    explanation: 'العلبة B تحتوي على مغناطيس تعليمي إضافي لم يكن موجوداً في A.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 2. Silhouette Match (تطابق الظلال الدقيقة) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_sil_1',
    type: 'silhouette_match',
    title: 'تطابق ظل قلم الحبر الفاخر',
    prompt: 'أي من الأدوات التالية يتطابق ظلها تماماً مع الشكل المعروض؟',
    category: 'أقلام وأدوات كتابة',
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 100 100" class="w-24 h-24 text-slate-900 fill-current mx-auto filter drop-shadow-md">
        <path d="M45 10 L55 10 L58 45 L54 85 L50 95 L46 85 L42 45 Z M47 25 L53 25 M48 55 L52 55" />
        <circle cx="50" cy="95" r="2" fill="#000" />
      </svg>`,
      promptDetails: 'انتبه لطول السن المعدني واستقامة الهيكل',
    },
    options: [
      { id: 's1_1', label: 'قلم ريشة كلاسيكي رفيع ✓' },
      { id: 's1_2', label: 'قلم تحديد عريض (هايلايتر)' },
      { id: 's1_3', label: 'قلم رصاص خشبي مع ممحاة' },
      { id: 's1_4', label: 'فرشاة رسم مائية بيضاوية' },
    ],
    explanation: 'الشكل المعروض هو ظل قلم حبر كلاسيكي بسن حاد وتصميم متناسق.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sil_2',
    type: 'silhouette_match',
    title: 'تطابق ظل حقيبة الظهر المدرسية',
    prompt: 'حدد الحقيبة المدرسية المطابقة لظل الشكل بالكامل:',
    category: 'شنط وحقائب مدرسية',
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 100 100" class="w-24 h-24 text-slate-950 fill-current mx-auto filter drop-shadow-md">
        <path d="M28 35 C28 20, 72 20, 72 35 L76 80 C76 86, 70 90, 64 90 L36 90 C30 90, 24 86, 24 80 Z M38 20 C38 12, 62 12, 62 20 M32 50 L68 50 L66 75 L34 75 Z" />
      </svg>`,
      promptDetails: 'قارن المقبض العلوي وجيب السحاب الأمامي المستطيل',
    },
    options: [
      { id: 's2_1', label: 'حقيبة كتف جانبية' },
      { id: 's2_2', label: 'حقيبة ظهر مقوسة بجيب عريض ✓' },
      { id: 's2_3', label: 'حافظة لابتوب مستطيلة' },
      { id: 's2_4', label: 'حقيبة ترولي بعجلات' },
    ],
    explanation: 'الحقيبة ذات المقبض القوسي والجيب الأمامي العريض هي التطابق الدقيق.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sil_3',
    type: 'silhouette_match',
    title: 'تطابق ظل المقص المكتبي',
    prompt: 'أي مقص من الخيارات يتطابق مع ظل الشفرات والمقبض البيضاوي المزدوج؟',
    category: 'أدوات قص وتجليد',
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-5xl filter brightness-0">✂️</span>
      </div>`,
      promptDetails: 'مقص ذو حلقتين بيضاويتين متطابقتين وشفرتين مفتوحتين بزاوية 30°',
    },
    options: [
      { id: 's3_1', label: 'مشرط ورق مستقيم' },
      { id: 's3_2', label: 'كماشة تثبيت معدنية' },
      { id: 's3_3', label: 'مقص مكتبي ستانلس ستيل بحلقات بيضاوية ✓' },
      { id: 's3_4', label: 'خرامة ورق دائرية' },
    ],
    explanation: 'المقص ذو الشفرات المتقاطعة والحلقات البيضاوية هو المطابق التام.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sil_4',
    type: 'silhouette_match',
    title: 'تطابق ظل الفرجار الهندسي',
    prompt: 'أي أداة هندسية تمثل هذا الظل المدبب ذو الساقين المفصليتين؟',
    category: 'أدوات هندسية',
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 3,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 100 100" class="w-24 h-24 mx-auto text-slate-900 fill-current filter drop-shadow-md">
        <polygon points="48,10 52,10 54,25 75,90 70,92 50,35 30,92 25,90 46,25" />
        <circle cx="50" cy="20" r="4" fill="#000" />
      </svg>`,
      promptDetails: 'أداة رسم الدوائر الهندسية الدقيقة',
    },
    options: [
      { id: 's4_1', label: 'مسطرة مثلثة 45°' },
      { id: 's4_2', label: 'منقلة نصف دائرية' },
      { id: 's4_3', label: 'مسطرة حرف T' },
      { id: 's4_4', label: 'فرجار رسم الدوائر الدقيق (Compass) ✓' },
    ],
    explanation: 'الظل يعود للفرجار الهندسي ذو الرأس المحوري وساقي الرسم.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 3. Pattern Completion (إكمال الأنماط الهندسية) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_pat_1',
    type: 'pattern_completion',
    title: 'إكمال متتالية أضلاع الأشكال الهندسية',
    prompt: 'ما هو الشكل التالي في المتتالية؟ [دائرة 0️⃣ → مربع 4️⃣ → سداسي 6️⃣ → ثماني 8️⃣ → ؟]',
    category: 'أدوات هندسية',
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
      promptDetails: 'زيادة متتالية بمقدار +2 في عدد الأضلاع بعد المربع (4 → 6 → 8 → 10)',
    },
    options: [
      { id: 'p1_1', label: 'مثلث (3 أضلاع)' },
      { id: 'p1_2', label: 'مضلع عشري Decagon (10 أضلاع) ✓' },
      { id: 'p1_3', label: 'نجمة خماسية (5 أضلاع)' },
      { id: 'p1_4', label: 'مربع إضافي' },
    ],
    explanation: 'تزيد الأضلاع بمقدار 2 في كل خطوة (4, 6, 8, 10)، والشكل التالي هو ذو 10 أضلاع.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_pat_2',
    type: 'pattern_completion',
    title: 'إكمال دوران مسطرة الهندسة 📐',
    prompt: 'المسطرة تدور باتجاه عقارب الساعة بمقدار 90 درجة كل خطوة؛ ما هو الوضع التالي؟',
    category: 'أدوات هندسية',
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
      promptDetails: '0° ثم 90° ثم 180° ثم ...',
    },
    options: [
      { id: 'p2_1', label: 'دوران 270° (نحو اليسار) ✓' },
      { id: 'p2_2', label: 'دوران 45°' },
      { id: 'p2_3', label: 'عودة إلى 0° مباشرة' },
      { id: 'p2_4', label: 'دوران معكوس' },
    ],
    explanation: 'الدوران بمقدار 90 درجة بعد 180 درجة يصل إلى 270 درجة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_pat_3',
    type: 'pattern_completion',
    title: 'نمط تبادل ألوان وأشكال الأقلام',
    prompt: 'أكمل النمط المتناوب: [قلم أحمر 🔴 ➔ قلم أزرق 🔵 ➔ قلم أحمر 🔴 ➔ قلم أزرق 🔵 ➔ ؟]',
    category: 'أقلام وأدوات',
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
      promptDetails: 'تناوب بسيط بين الأحمر والأزرق',
    },
    options: [
      { id: 'p3_1', label: 'قلم أصفر 🟡' },
      { id: 'p3_2', label: 'قلم أخضر 🟢' },
      { id: 'p3_3', label: 'قلم أحمر 🔴 (الدور عليه في المتتالية) ✓' },
      { id: 'p3_4', label: 'قلم أسود ⚫' },
    ],
    explanation: 'النمط يتناوب بين الأحمر والأزرق بالتتابع، بعد الأزرق يأتي قلم أحمر.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_pat_4',
    type: 'pattern_completion',
    title: 'متتالية مقاسات الورق والدفاتر القياسية',
    prompt: 'ما المقاس التالي الذي يضاعف حجم الورقة في السلسلة: [A6 ➔ A5 ➔ A4 ➔ ؟]؟',
    category: 'ورق ودفاتر',
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
      promptDetails: 'المقاس الهندسي الأكبر المباشر بعد A4',
    },
    options: [
      { id: 'p4_1', label: 'مقاس A3 (ضعف مساحة A4) ✓' },
      { id: 'p4_2', label: 'مقاس A2' },
      { id: 'p4_3', label: 'مقاس B5' },
      { id: 'p4_4', label: 'مقاس A7' },
    ],
    explanation: 'المقاس المباشر الأكبر من A4 هو A3.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 4. Fast Pattern Count (تحدي العد والتركيز السريع) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_cnt_1',
    type: 'fast_pattern_count',
    title: 'عد أقلام التحديد الخضراء 🟢',
    prompt: 'كم عدد أقلام التحديد الخضراء (الزمردية) الظاهرة في اللوحة؟',
    category: 'قرطاسية وألوان',
    difficulty: 'easy',
    timeLimitSeconds: 7,
    correctAnswerIndex: 2,
    mainVisual: {
      gridItems: [
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'highlighter', color: '#f59e0b', label: 'برتقالي' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'pencil', color: '#3b82f6', label: 'أزرق' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'highlighter', color: '#ef4444', label: 'أحمر' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'eraser', color: '#8b5cf6', label: 'بنفسجي' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'highlighter', color: '#f59e0b', label: 'برتقالي' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
      ],
      promptDetails: 'عد بسرعة أقلام التحديد الخضراء فقط وتجاهل الألوان الأخرى',
    },
    options: [
      { id: 'c1_1', label: '5 أقلام' },
      { id: 'c1_2', label: '6 أقلام' },
      { id: 'c1_3', label: '7 أقلام خضراء ✓' },
      { id: 'c1_4', label: '8 أقلام' },
    ],
    explanation: 'توجد بالضبط 7 أقلام تحديد باللون الأخضر داخل الشبكة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_cnt_2',
    type: 'fast_pattern_count',
    title: 'عد نجوم التميز الذهبية ⭐',
    prompt: 'ما هو عدد النجوم الذهبية اللامعة ذات 5 رؤوس في المشهد؟',
    category: 'أدوات تعليمية',
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      gridItems: [
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'circle', color: '#3b82f6', label: 'دائرة زرقاء' },
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'square', color: '#ec4899', label: 'مربع وردي' },
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'triangle', color: '#10b981', label: 'مثلث أخضر' },
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'star', color: '#94a3b8', label: 'نجمة رمادية' },
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'circle', color: '#eab308', label: 'قرص أصفر' },
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'diamond', color: '#6366f1', label: 'معين نيلي' },
      ],
      promptDetails: 'احذر النجوم الرمادية أو الأقراص الصفراء!',
    },
    options: [
      { id: 'c2_1', label: '5 نجوم' },
      { id: 'c2_2', label: '6 نجوم ذهبية ✓' },
      { id: 'c2_3', label: '7 نجوم' },
      { id: 'c2_4', label: '8 نجوم' },
    ],
    explanation: 'هناك 6 نجوم ذهبية وواحدة رمادية ورمز دائري أصفر.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_cnt_3',
    type: 'fast_pattern_count',
    title: 'عد دبابيس الورق الفضية 📎',
    prompt: 'كم عدد مشابك ودبابيس الورق المعروضة في شبكة القرطاسية؟',
    category: 'لوازم مكتبية',
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
      promptDetails: 'ابحث عن رمز الدبوس 📎 فقط',
    },
    options: [
      { id: 'c3_1', label: '5 دبابيس ورق 📎 ✓' },
      { id: 'c3_2', label: '6 دبابيس' },
      { id: 'c3_3', label: '4 دبابيس' },
      { id: 'c3_4', label: '7 دبابيس' },
    ],
    explanation: 'توجد بالضبط 5 دبابيس ورق موزعة في اللوحة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_cnt_4',
    type: 'fast_pattern_count',
    title: 'عد دفاتر الملاحظات المدرسية 📓',
    prompt: 'كم عدد الدفاتر المدرسية 📓 الظاهرة بين الأدوات؟',
    category: 'دفاتر وقرطاسية',
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
      promptDetails: 'عد رمز الدفتر 📓 في كل صف',
    },
    options: [
      { id: 'c4_1', label: '6 دفاتر' },
      { id: 'c4_2', label: '7 دفاتر' },
      { id: 'c4_3', label: '9 دفاتر' },
      { id: 'c4_4', label: '8 دفاتر مدرسية 📓 ✓' },
    ],
    explanation: 'توجد 8 دفاتر موزعة بين الأدوات الأخرى.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 5. Shape Sorting (فرز ومطابقة وتصنيف الأشكال) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_sort_1',
    type: 'shape_sorting',
    title: 'فرز الأدوات حسب الشكل الدائري',
    prompt: 'أي مجموعة أدوات تحتوي فقط على أشكال دائرية ومستديرة دون زوايا حادة؟',
    category: 'تصنيف الأشكال',
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="flex justify-center items-center gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800">
        <div class="w-12 h-12 rounded-full border-2 border-dashed border-sky-400 flex items-center justify-center text-xs font-bold text-sky-300">مطلوب: دائري ⭕</div>
      </div>`,
      promptDetails: 'اختر المجموعة التي لا تحتوي على أي أضلاع حادة أو مستطيلات',
    },
    options: [
      { id: 'so1_1', label: 'مسطرة مثلثة 📐 وممحاة مستطيلة 🧼' },
      { id: 'so1_2', label: 'شريط لاصق دائري 🛞 وممحاة دائرية 🔘 وعدسة مكبرة 🔍 ✓' },
      { id: 'so1_3', label: 'دفتر ملاحظات 📓 ومقص حاد ✂️' },
      { id: 'so1_4', label: 'علبة ألوان خشبية 📦 ومسطرة مستقيمة 📏' },
    ],
    explanation: 'الشريط اللاصق والممحاة الدائرية والعدسة المكبرة كلها أدوات دائرية خالية من الزوايا الحادة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sort_2',
    type: 'shape_sorting',
    title: 'فرز الأدوات ذات الزوايا القائمة (90 درجة)',
    prompt: 'أي أداة من الأدوات التالية تحتوي على زوايا قائمة 90° هندسية دقيقة؟',
    category: 'هندسة وقياس',
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-amber-400 font-bold block mb-1">المعيار المطلوب:</span>
        <span class="text-lg text-white font-mono">زاوية قائمة 90° (Right Angle) 📐</span>
      </div>`,
      promptDetails: 'ابحث عن شكل يحتوي على تعامد تام',
    },
    options: [
      { id: 'so2_1', label: 'مسطرة زاوية قائمة مثلثة (مثلث 90°) ✓' },
      { id: 'so2_2', label: 'كرة أرضية جغرافية مجسمة 🌍' },
      { id: 'so2_3', label: 'طامس أخطاء بيضاوي' },
      { id: 'so2_4', label: 'منقلة نصف دائرية' },
    ],
    explanation: 'المسطرة المثلثة تحتوي على زاوية قائمة 90 درجة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sort_3',
    type: 'shape_sorting',
    title: 'تصنيف أدوات القياس والرسم الدقيق',
    prompt: 'أي مجموعة تضم أدوات تستخدم حصراً في القياس وحساب الأبعاد؟',
    category: 'أدوات قياس',
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-emerald-400 font-bold block mb-1">فئة التصنيف:</span>
        <span class="text-sm text-slate-200">أدوات القياس والحساب المترية 📏</span>
      </div>`,
      promptDetails: 'كل العناصر يجب أن تكون أدوات قياس',
    },
    options: [
      { id: 'so3_1', label: 'صمغ لاصق + مقص ورق' },
      { id: 'so3_2', label: 'ألوان شمعية + فرشاة رسم' },
      { id: 'so3_3', label: 'مسطرة مدرجة 📏 + منقلة زوايا 📐 + شريط قياس ⏱️ ✓' },
      { id: 'so3_4', label: 'حقيبة ظهر + مقلمة قماشية' },
    ],
    explanation: 'المسطرة والمنقلة وشريط القياس هي أدوات قياس دقيقة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sort_4',
    type: 'shape_sorting',
    title: 'فرز أدوات التلوين المائي',
    prompt: 'أي عنصر لا ينتمي إلى مجموعة أدوات الرسم بالألوان المائية؟',
    category: 'فنون ورسم',
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
      promptDetails: 'حدد العنصر الذي لا يستخدم في الرسم المائي',
    },
    options: [
      { id: 'so4_1', label: 'ريشة رسم ناعمة' },
      { id: 'so4_2', label: 'باليت خلط الألوان' },
      { id: 'so4_3', label: 'كوب ماء لغسيل الفرشاة' },
      { id: 'so4_4', label: 'دباسة أوراق مكتبية ثقيلة (عنصر دخيل) ✓' },
    ],
    explanation: 'الدباسة أداة مكتبية وليست من أدوات الرسم والتلوين المائي.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 6. Visual Memory (الذاكرة البصرية السريعة) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_mem_1',
    type: 'visual_memory',
    title: 'تذكر موقع الدباسة المدرسية 📎',
    prompt: 'في أي مربع كان موقع الدباسة المدرسية (📎)؟ [الصف العلوي A - B | الصف السفلي C - D]',
    category: 'الذاكرة البصرية',
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
      promptDetails: 'المربع C في الصف السفلي على اليمين',
    },
    options: [
      { id: 'm1_1', label: 'المربع A (أعلى يمين)' },
      { id: 'm1_2', label: 'المربع B (أعلى يسار)' },
      { id: 'm1_3', label: 'المربع C (أسفل يمين) ✓' },
      { id: 'm1_4', label: 'المربع D (أسفل يسار)' },
    ],
    explanation: 'كانت الدباسة المدرسية موضوعة في المربع C في الصف السفلي.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_mem_2',
    type: 'visual_memory',
    title: 'تذكر لون قلم الهايلايتر العلوي',
    prompt: 'ما كان لون قلم التحديد (هايلايتر) في الخانة العلوية؟',
    category: 'الذاكرة البصرية',
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
      promptDetails: 'تذكر درجة اللون الوردي الفاقع',
    },
    options: [
      { id: 'm2_1', label: 'وردي فاقع (Pink) ✓' },
      { id: 'm2_2', label: 'أخضر ليموني' },
      { id: 'm2_3', label: 'أزرق سماوي' },
      { id: 'm2_4', label: 'برتقالي داكن' },
    ],
    explanation: 'القلم المعروض كان باللون الوردي النيون.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_mem_3',
    type: 'visual_memory',
    title: 'تذكر رقم صندوق الهدية الذهبية 🎁',
    prompt: 'في أي صندوق من الصناديق الثلاثة كانت تختبئ الجائزة الذهبية؟',
    category: 'الذاكرة البصرية',
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="grid grid-cols-3 gap-2 p-3 bg-slate-900 rounded-2xl text-center">
        <div class="p-2 bg-slate-800 rounded-lg"><span class="text-xs text-slate-400 block">صندوق 1</span><span>📦</span></div>
        <div class="p-2 bg-amber-500/20 border border-amber-400 rounded-lg"><span class="text-xs text-amber-300 font-bold block">صندوق 2</span><span>🎁 جائزة</span></div>
        <div class="p-2 bg-slate-800 rounded-lg"><span class="text-xs text-slate-400 block">صندوق 3</span><span>📦</span></div>
      </div>`,
      promptDetails: 'الصندوق الأوسط رقم 2',
    },
    options: [
      { id: 'm3_1', label: 'الصندوق رقم [1]' },
      { id: 'm3_2', label: 'الصندوق رقم [2] الأوسط ✓' },
      { id: 'm3_3', label: 'الصندوق رقم [3]' },
      { id: 'm3_4', label: 'لا شيء في الصناديق' },
    ],
    explanation: 'الهدية كانت داخل الصندوق رقم 2 في المنتصف.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_mem_4',
    type: 'visual_memory',
    title: 'تذكر ترتيب وميض الرموز الثلاثة',
    prompt: 'ما هو الترتيب الصحيح لوميض الرموز: [1 ➔ 2 ➔ 3]؟',
    category: 'الذاكرة البصرية',
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
      promptDetails: 'مقص ثم قلم ثم ممحاة',
    },
    options: [
      { id: 'm4_1', label: 'قلم ➔ ممحاة ➔ مقص' },
      { id: 'm4_2', label: 'ممحاة ➔ مقص ➔ قلم' },
      { id: 'm4_3', label: 'مقص ➔ ممحاة ➔ قلم' },
      { id: 'm4_4', label: 'مقص ➔ قلم ➔ ممحاة ✓' },
    ],
    explanation: 'الترتيب كان: 1- مقص، 2- قلم، 3- ممحاة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 7. Missing Puzzle Piece (القطعة الناقصة من التركيب) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_miss_1',
    type: 'missing_puzzle_piece',
    title: 'القطعة المفقودة في لوحة الألوان الفنية',
    prompt: 'أي قطعة من الخيارات أدناه تكمل نمط التدرج اللوني في الخانة الفارغة (؟)؟',
    category: 'أدوات رسم وفنون',
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
      promptDetails: 'العمود الأوسط يتدرج من النيلي الفاتح (#818cf8) إلى الداكن',
    },
    options: [
      { id: 'mp1_1', label: 'مربع نيلي داكن (#3730a3) ✓' },
      { id: 'mp1_2', label: 'مربع برتقالي ناري' },
      { id: 'mp1_3', label: 'مربع أخضر غامق' },
      { id: 'mp1_4', label: 'مربع أزرق سماوي فاتح' },
    ],
    explanation: 'التدرج اللوني في العمود الأوسط يتطلب درجة الأزرق النيلي الداكن لإتمام التناسق.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_miss_2',
    type: 'missing_puzzle_piece',
    title: 'إكمال غلاف كتاب الرياضيات الهندسي',
    prompt: 'ما هي القطعة المناسبة لإكمال الزاوية الناقصة في غلاف الكتاب؟',
    category: 'كتب ومناهج',
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
      promptDetails: 'مربع الزاوية العلوية اليمنى باللون الأزرق الموشح',
    },
    options: [
      { id: 'mp2_1', label: 'قطعة دائرية صفراء' },
      { id: 'mp2_2', label: 'مثلث زاوية بلون أزرق نيلي متناسق ✓' },
      { id: 'mp2_3', label: 'قطعة خشبية بنية' },
      { id: 'mp2_4', label: 'حلقة معدنية' },
    ],
    explanation: 'القطعة النيلية المتناسقة تكمل زاوية الغلاف بدقة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_miss_3',
    type: 'missing_puzzle_piece',
    title: 'القطعة المفقودة من لوحة ألوان الباستيل',
    prompt: 'أي لون من الألوان يكمل التدرج الأفقي: [وردي فاتح ➔ خوخي ➔ ؟ ➔ أصفر]؟',
    category: 'ألوان وفنون',
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
      promptDetails: 'اللون الانتقالي بين الخوخي والأصفر',
    },
    options: [
      { id: 'mp3_1', label: 'أزرق كحلي داكن' },
      { id: 'mp3_2', label: 'بنفسجي باذنجاني' },
      { id: 'mp3_3', label: 'برتقالي فاتح مشمشي (Apricot) ✓' },
      { id: 'mp3_4', label: 'رمادي حجري' },
    ],
    explanation: 'اللون المشمشي الفاتح هو حلقة الوصل الطبيعية في تدرج الطيف.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_miss_4',
    type: 'missing_puzzle_piece',
    title: 'ترس المبراة الميكانيكية المفقود ⚙️',
    prompt: 'أي ترس ميكانيكي يتطابق قطره مع الفراغ المخصص لإدارة شفرة المبراة؟',
    category: 'أدوات مكتبية',
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
      promptDetails: 'ترس وسيط متوسط لنقل الحركة بين الترسين',
    },
    options: [
      { id: 'mp4_1', label: 'ترس فولاذي متوسط بـ 8 أسنان متناسقة ✓' },
      { id: 'mp4_2', label: 'قضيب حديدي مسطح' },
      { id: 'mp4_3', label: 'حبل مطاطي' },
      { id: 'mp4_4', label: 'مسمار لولبي فردي' },
    ],
    explanation: 'الترس ذو الأسنان الـ 8 ينقل الحركة بين الترس الكبير والترس الصغير بكفاءة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 8. One-Stroke Maze (المتاهة الذكية السريعة) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_maze_1',
    type: 'one_stroke_maze',
    title: 'مسار التوصيل السريع إلى مكتبة الشاطئ الازرق',
    prompt: 'أي مسار ملون (A، B، C، D) يربط البداية (🚩) بالمتجر (🏪) دون أن يعترضه أي حاجز أحمر (⛔)؟',
    category: 'ألعاب ذكاء',
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
      promptDetails: 'تتبع المسار الأزرق (C) لتجاوز جميع الحواجز بأمان',
    },
    options: [
      { id: 'mz1_1', label: 'المسار A (الوردي المتقطع)' },
      { id: 'mz1_2', label: 'المسار B (الأصفر السفلي)' },
      { id: 'mz1_3', label: 'المسار C (الأزرق المتدفق) ✓' },
      { id: 'mz1_4', label: 'المسار D (البنفسجي المغلق)' },
    ],
    explanation: 'المسار C (الأزرق) يمر بين الحاجز العلوي والحاجز السفلي بسلاسة دون اصطدام.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_maze_2',
    type: 'one_stroke_maze',
    title: 'المتاهة السريعة إلى الحقيبة المدرسية 🎒',
    prompt: 'أي المسارات الثلاثة (1 أو 2 أو 3) مفتوح بالكامل للوصول إلى الحقيبة دون أي حاجز؟',
    category: 'متاهات ومسارات',
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
      promptDetails: 'المسار 2 سالك ومباشر بدون عوائق',
    },
    options: [
      { id: 'mz2_1', label: 'المسار رقم [1]' },
      { id: 'mz2_2', label: 'المسار رقم [2] (المفتوح بالكامل) ✓' },
      { id: 'mz2_3', label: 'المسار رقم [3]' },
      { id: 'mz2_4', label: 'جميع المسارات مغلقة' },
    ],
    explanation: 'المسار رقم [2] هو المسار الوحيد الخالي من العوائق والحواجز المغلقة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_maze_3',
    type: 'one_stroke_maze',
    title: 'مسار توصيل القلم بالدفتر ✏️ ➔ 📓',
    prompt: 'أي خط يربط القلم بالدفتر دون أن يتقاطع مع الخطوط الأخرى؟',
    category: 'مسارات وتوصيل',
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
      promptDetails: 'المسار المباشر العلوي الأخضر',
    },
    options: [
      { id: 'mz3_1', label: 'المسار العلوي الأخضر (B) ✓' },
      { id: 'mz3_2', label: 'المسار المتعرج السفلي (C)' },
      { id: 'mz3_3', label: 'المسار المتقاطع الأوسط (A)' },
      { id: 'mz3_4', label: 'المسار المنحني الحلزوني (D)' },
    ],
    explanation: 'المسار العلوي الأخضر يربط النقطتين بسلاسة دون أي تقاطع.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_maze_4',
    type: 'one_stroke_maze',
    title: 'مسار خروج سيارة الشحن السريع 🚚',
    prompt: 'أي بوابة خروج من المستودع تؤدي مباشرة إلى الطريق السريع (طريق 50)؟',
    category: 'لوجستيات وتوصيل',
    difficulty: 'easy',
    timeLimitSeconds: 7,
    correctAnswerIndex: 3,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-slate-400 block mb-1">شاحنة التوصيل: 🚚</span>
        <span class="text-xs text-amber-400 font-bold">البوابة [D] متصلة بالطريق السريع مباشرة بدون إشارات</span>
      </div>`,
      promptDetails: 'البوابة D مفتوحة للشحن السريع',
    },
    options: [
      { id: 'mz4_1', label: 'البوابة [A] (مغلقة للصيانة)' },
      { id: 'mz4_2', label: 'البوابة [B] (مسار بطيء)' },
      { id: 'mz4_3', label: 'البوابة [C] (تحويل إجباري)' },
      { id: 'mz4_4', label: 'البوابة [D] (المسار المباشر السريع) ✓' },
    ],
    explanation: 'البوابة D هي المنفذ المباشر والسريع للشاحنة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 9. Order Sequence (ترتيب السلاسل والمقادير) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_seq_1',
    type: 'order_sequence',
    title: 'ترتيب الأدوات تصاعدياً حسب الطول 📏',
    prompt: 'رتب الأدوات التالية من الأقصر إلى الأطول: [ممحاة 🧼 (3cm) - قلم رصاص ✏️ (15cm) - مسطرة 📏 (30cm) - دبوس 📎 (1cm)]',
    category: 'ترتيب وقياسات',
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
      promptDetails: 'الترتيب من الأصغر 1cm إلى الأكبر 30cm',
    },
    options: [
      { id: 'sq1_1', label: 'دبوس (1cm) ➔ ممحاة (3cm) ➔ قلم (15cm) ➔ مسطرة (30cm) ✓' },
      { id: 'sq1_2', label: 'مسطرة ➔ قلم ➔ ممحاة ➔ دبوس' },
      { id: 'sq1_3', label: 'ممحاة ➔ دبوس ➔ قلم ➔ مسطرة' },
      { id: 'sq1_4', label: 'قلم ➔ مسطرة ➔ ممحاة ➔ دبوس' },
    ],
    explanation: 'الترتيب التصاعدي الصحيح يبدأ من الدبوس (1 سم) ثم الممحاة (3 سم) ثم القلم (15 سم) ثم المسطرة (30 سم).',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_seq_2',
    type: 'order_sequence',
    title: 'ترتيب خطوات تجليد وحماية الكتاب المدرسي 📚',
    prompt: 'ما هو الترتيب المنطقي لخطوات تجليد الكتاب؟',
    category: 'تجليد وقرطاسية',
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-amber-300 font-bold block mb-1">خطوات تجليد الدفاتر:</span>
        <span class="text-xs text-slate-300">القياس والقص ➔ التثبيت ➔ طي الزوايا ➔ وضع الاستيكر</span>
      </div>`,
      promptDetails: 'ابدأ دائماً بقياس وقص التجليد المناسب',
    },
    options: [
      { id: 'sq2_1', label: 'وضع الاستيكر ➔ قص التجليد ➔ قراءة الكتاب' },
      { id: 'sq2_2', label: 'قص التجليد حسب المقاس ➔ فرد الغلاف ➔ طي الزوايا ➔ وضع بطاقة الاسم ✓' },
      { id: 'sq2_3', label: 'طي الزوايا ➔ قص التجليد ➔ وضع الكتاب في الحقيبة' },
      { id: 'sq2_4', label: 'استخدام الكتاب مباشرة دون تجليد' },
    ],
    explanation: 'الخطوة الأولى هي القص ثم الفرد ثم الطي ثم إلصاق بطاقة الاسم.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_seq_3',
    type: 'order_sequence',
    title: 'ترتيب سماكة سن أقلام الحبر الجاف 🖊️',
    prompt: 'رتب خطوط أقلام الحبر من الأرفع (الأدق) إلى الأعظم سماكة:',
    category: 'أقلام وكتابة',
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
      promptDetails: '0.38 مم هو الأرفع و 1.0 مم هو الأعرض',
    },
    options: [
      { id: 'sq3_1', label: '1.0mm ➔ 0.7mm ➔ 0.5mm ➔ 0.38mm' },
      { id: 'sq3_2', label: '0.5mm ➔ 1.0mm ➔ 0.38mm ➔ 0.7mm' },
      { id: 'sq3_3', label: '0.38mm ➔ 0.5mm ➔ 0.7mm ➔ 1.0mm ✓' },
      { id: 'sq3_4', label: '0.7mm ➔ 0.38mm ➔ 1.0mm ➔ 0.5mm' },
    ],
    explanation: 'الترتيب التصاعدي الصحيح لسماكة السن هو من 0.38 ملم وصولاً إلى 1.0 ملم.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_seq_4',
    type: 'order_sequence',
    title: 'ترتيب سعة حافظات الأقلام (المقالم)',
    prompt: 'رتب حافظات الأقلام من الأصغر سعة إلى الأكبر سعة استيعابية:',
    category: 'مقالم وحافظات',
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-emerald-400 font-bold block mb-1">التدرج الحجمي:</span>
        <span class="text-xs text-slate-300">مقلمة قلم مفرد ➔ مقلمة سحاب واحد ➔ مقلمة طابقين ➔ صندوق أدوات</span>
      </div>`,
      promptDetails: 'المقلمة الفردية تحمل قلماً واحداً والصندوق يحمل 50+ أداة',
    },
    options: [
      { id: 'sq4_1', label: 'جراب قلم مفرد ➔ مقلمة جيب ➔ مقلمة طابقين ➔ صندوق تنظيم مكتبي ✓' },
      { id: 'sq4_2', label: 'صندوق تنظيم ➔ مقلمة طابقين ➔ جراب مفرد' },
      { id: 'sq4_3', label: 'مقلمة طابقين ➔ جراب مفرد ➔ صندوق تنظيم' },
      { id: 'sq4_4', label: 'مقلمة جيب ➔ صندوق تنظيم ➔ جراب مفرد' },
    ],
    explanation: 'التدرج يبدأ من الجراب الفردي وصولاً إلى الصندوق المكتبي المتكامل.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // 10. Reaction Speed (اختبار سرعة رد الفعل) - 4 Puzzles
  // =========================================================================
  {
    id: 'vp_rx_1',
    type: 'reaction_speed',
    title: 'استجابة سريعة للرمز الذهبي ✨',
    prompt: 'اضغط فوراً على الزر الذي يحتوي على الرمز الذهبي اللامع (⭐):',
    category: 'سرعة رد الفعل',
    difficulty: 'easy',
    timeLimitSeconds: 6,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="p-4 bg-slate-900 rounded-2xl border border-amber-500/40 text-center animate-pulse">
        <span class="text-xs text-amber-400 font-bold block mb-1">وميض فوري! حدد الرمز:</span>
        <span class="text-4xl">⭐</span>
      </div>`,
      promptDetails: 'اختر زر النجمة الذهبية بأقصى سرعة',
    },
    options: [
      { id: 'rx1_1', label: '🔹 زر المربع الأزرق' },
      { id: 'rx1_2', label: '⭐ زر النجمة الذهبية (المطابق للوميض) ✓' },
      { id: 'rx1_3', label: '🛑 زر الإيقاف الأحمر' },
      { id: 'rx1_4', label: '🟢 زر الدائرة الخضراء' },
    ],
    explanation: 'الرمز الذي ومض هو النجمة الذهبية ⭐.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_rx_2',
    type: 'reaction_speed',
    title: 'استجابة إشارة المرور الخضراء للانطلاق 🟢',
    prompt: 'الضوء أصبح أخضر الآن! اضغط على زر الانطلاق الفوري:',
    category: 'سرعة رد الفعل',
    difficulty: 'easy',
    timeLimitSeconds: 5,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="p-4 bg-slate-900 rounded-2xl border border-emerald-500/40 text-center animate-pulse">
        <span class="text-xs text-emerald-400 font-bold block mb-1">إشارة خضراء: انطلق الآن!</span>
        <span class="text-4xl">🟢</span>
      </div>`,
      promptDetails: 'اضغط على زر المرور الأخضر',
    },
    options: [
      { id: 'rx2_1', label: '🟢 زر المرور الأخضر (GO!) ✓' },
      { id: 'rx2_2', label: '🔴 زر التوقف الأحمر' },
      { id: 'rx2_3', label: '🟡 زر الاستعداد الأصفر' },
      { id: 'rx2_4', label: '⚪ زر الانتظار الأبيض' },
    ],
    explanation: 'الإشارة خضراء تتطلب الضغط الفوري على زر المرور الأخضر.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_rx_3',
    type: 'reaction_speed',
    title: 'وميض رمز البرق السريع ⚡',
    prompt: 'حدد زر البرق الأصفر الصاعق فور ظهوره:',
    category: 'سرعة رد الفعل',
    difficulty: 'easy',
    timeLimitSeconds: 5,
    correctAnswerIndex: 2,
    mainVisual: {
      svgContent: `<div class="p-4 bg-slate-900 rounded-2xl border border-yellow-500/40 text-center animate-pulse">
        <span class="text-xs text-yellow-400 font-bold block mb-1">صعقة سرعة!</span>
        <span class="text-4xl">⚡</span>
      </div>`,
      promptDetails: 'اختر زر صاعقة البرق ⚡',
    },
    options: [
      { id: 'rx3_1', label: '❄️ رمز الجليد' },
      { id: 'rx3_2', label: '🔥 رمز اللهب' },
      { id: 'rx3_3', label: '⚡ رمز البرق الأصفر السريع ✓' },
      { id: 'rx3_4', label: '💧 رمز قطرة الماء' },
    ],
    explanation: 'الرمز الظاهر هو صاعقة البرق ⚡.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_rx_4',
    type: 'reaction_speed',
    title: 'استجابة قلم الحبر الأزرق 🖊️',
    prompt: 'حدد زر قلم الحبر الأزرق فور ظهوره بين الأدوات:',
    category: 'سرعة رد الفعل',
    difficulty: 'easy',
    timeLimitSeconds: 5,
    correctAnswerIndex: 3,
    mainVisual: {
      svgContent: `<div class="p-4 bg-slate-900 rounded-2xl border border-sky-500/40 text-center animate-pulse">
        <span class="text-xs text-sky-400 font-bold block mb-1">أداة الكتابة ظهرت!</span>
        <span class="text-4xl">🖊️</span>
      </div>`,
      promptDetails: 'اختر زر قلم الحبر 🖊️ بأسرع رد فعل',
    },
    options: [
      { id: 'rx4_1', label: '📏 مسطرة قياس' },
      { id: 'rx4_2', label: '✂️ مقص ورق' },
      { id: 'rx4_3', label: '📌 دبوس لوحة' },
      { id: 'rx4_4', label: '🖊️ قلم حبر أزرق فاخر ✓' },
    ],
    explanation: 'الرمز الذي ظهر في الوميض هو قلم الحبر الأزرق 🖊️.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];
