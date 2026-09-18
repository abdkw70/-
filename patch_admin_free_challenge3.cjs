const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminFreeChallenge.tsx', 'utf8');

// title
code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">عنوان اللغز \*<\/label>\s*<input\s*type="text"\s*required\s*value=\{selectedPuzzleForEdit\.title\}\s*onChange=\{\(e\) => setSelectedPuzzleForEdit\(\{ \.\.\.selectedPuzzleForEdit, title: e\.target\.value \}\)\}\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2\.5 font-bold"\s*placeholder="مثال: مطابقة الأشكال المتشابهة"\s*\/>/g,
  `<LocalizedInput label="عنوان اللغز *" value={selectedPuzzleForEdit.title as any} onChange={val => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, title: val as any })} theme="light" />`
);

// prompt
code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">نص السؤال \/ المطلوب \*<\/label>\s*<textarea\s*required\s*rows=\{2\}\s*value=\{selectedPuzzleForEdit\.prompt\}\s*onChange=\{\(e\) => setSelectedPuzzleForEdit\(\{ \.\.\.selectedPuzzleForEdit, prompt: e\.target\.value \}\)\}\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2\.5 font-medium"\s*placeholder="مثال: ما هو الشكل الناقص في التسلسل التالي؟"\s*\/>/g,
  `<LocalizedInput label="نص السؤال / المطلوب *" value={selectedPuzzleForEdit.prompt as any} onChange={val => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, prompt: val as any })} type="textarea" theme="light" />`
);

// explanation
code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">معلومة إضافية أو تفسير للإجابة<\/label>\s*<input\s*type="text"\s*value=\{selectedPuzzleForEdit\.explanation \|\| ''\}\s*onChange=\{\(e\) => setSelectedPuzzleForEdit\(\{ \.\.\.selectedPuzzleForEdit, explanation: e\.target\.value \}\)\}\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2\.5 text-sm"\s*placeholder="يظهر بعد اختيار الإجابة"\s*\/>/g,
  `<LocalizedInput label="معلومة إضافية أو تفسير للإجابة" value={selectedPuzzleForEdit.explanation as any} onChange={val => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, explanation: val as any })} theme="light" />`
);

// options
const oldOptionsPattern = `{(selectedPuzzleForEdit.options || []).map((opt: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="puzzleCorrectOption"
                        checked={selectedPuzzleForEdit.correctAnswerIndex === idx}
                        onChange={() => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, correctAnswerIndex: idx })}
                        className="w-4 h-4 accent-amber-600 cursor-pointer"
                        title="حدد كإجابة صحيحة"
                      />
                      <input
                        type="text"
                        value={opt.label || ''}
                        onChange={(e) => {
                          const newOptions = [...(selectedPuzzleForEdit.options || [])];
                          newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                          setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, options: newOptions });
                        }}
                        placeholder={\`نص الخيار \${idx + 1}\`}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-medium focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  ))}`;

const newOptionsPattern = `{(selectedPuzzleForEdit.options || []).map((opt: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-200/50">
                      <div className="pt-2">
                        <input
                          type="radio"
                          name="puzzleCorrectOption"
                          checked={selectedPuzzleForEdit.correctAnswerIndex === idx}
                          onChange={() => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, correctAnswerIndex: idx })}
                          className="w-4 h-4 accent-amber-600 cursor-pointer"
                          title="حدد كإجابة صحيحة"
                        />
                      </div>
                      <div className="flex-1">
                        <LocalizedInput
                          label={\`نص الخيار \${idx + 1}\`}
                          value={opt.label as any}
                          onChange={val => {
                            const newOptions = [...(selectedPuzzleForEdit.options || [])];
                            newOptions[idx] = { ...newOptions[idx], label: val as any };
                            setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, options: newOptions });
                          }}
                          theme="light"
                        />
                      </div>
                    </div>
                  ))}`;
code = code.replace(oldOptionsPattern, newOptionsPattern);

fs.writeFileSync('src/components/admin/AdminFreeChallenge.tsx', code);
