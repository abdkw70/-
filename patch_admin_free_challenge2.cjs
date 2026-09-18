const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminFreeChallenge.tsx', 'utf8');

// selectedGameForEdit.title
code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">اسم اللعبة \/ التحدي \*<\/label>\s*<input\s*type="text"\s*required\s*value=\{selectedGameForEdit\.title\}\s*onChange=\{\(e\) => setSelectedGameForEdit\(\{ \.\.\.selectedGameForEdit, title: e\.target\.value \}\)\}\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2\.5 font-bold"\s*placeholder="مثال: تحدي إكمال الأنماط الهندسية"\s*\/>/g,
  `<LocalizedInput label="اسم اللعبة / التحدي *" value={selectedGameForEdit.title as any} onChange={val => setSelectedGameForEdit({ ...selectedGameForEdit, title: val as any })} theme="light" />`
);

// selectedGameForEdit.description
code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">وصف اللعبة المختصر للمتسوق<\/label>\s*<textarea\s*rows=\{2\}\s*value=\{selectedGameForEdit\.description \|\| ''\}\s*onChange=\{\(e\) => setSelectedGameForEdit\(\{ \.\.\.selectedGameForEdit, description: e\.target\.value \}\)\}\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2\.5 font-medium"\s*placeholder="وصف مشوق يوضح طريقة التحدي"\s*\/>/g,
  `<LocalizedInput label="وصف اللعبة المختصر للمتسوق" value={selectedGameForEdit.description as any} onChange={val => setSelectedGameForEdit({ ...selectedGameForEdit, description: val as any })} type="textarea" theme="light" />`
);

// selectedGameForEdit.winMessage
code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">رسالة الفوز بالتحدي<\/label>\s*<input\s*type="text"\s*value=\{selectedGameForEdit\.winMessage \|\| ''\}\s*onChange=\{\(e\) => setSelectedGameForEdit\(\{ \.\.\.selectedGameForEdit, winMessage: e\.target\.value \}\)\}\s*placeholder="مبروك! لقد اجتزت التحدي وفزت بكوبون الخصم ومكافأة المحفظة!"\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2\.5 font-medium text-xs"\s*\/>/g,
  `<LocalizedInput label="رسالة الفوز بالتحدي" value={selectedGameForEdit.winMessage as any} onChange={val => setSelectedGameForEdit({ ...selectedGameForEdit, winMessage: val as any })} theme="light" />`
);

// selectedGameForEdit.lossMessage
code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">رسالة الخسارة وتدوير العجلة<\/label>\s*<input\s*type="text"\s*value=\{selectedGameForEdit\.lossMessage \|\| ''\}\s*onChange=\{\(e\) => setSelectedGameForEdit\(\{ \.\.\.selectedGameForEdit, lossMessage: e\.target\.value \}\)\}\s*placeholder="حظ أوفر! فزت بفرصة تدوير عجلة الحظ للحصول على خصم!"\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2\.5 font-medium text-xs"\s*\/>/g,
  `<LocalizedInput label="رسالة الخسارة وتدوير العجلة" value={selectedGameForEdit.lossMessage as any} onChange={val => setSelectedGameForEdit({ ...selectedGameForEdit, lossMessage: val as any })} theme="light" />`
);

fs.writeFileSync('src/components/admin/AdminFreeChallenge.tsx', code);
