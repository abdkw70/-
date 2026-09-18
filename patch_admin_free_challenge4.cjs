const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminFreeChallenge.tsx', 'utf8');

// prompt
code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">نص السؤال \/ التوجيه للمتسابق \*<\/label>\s*<textarea\s*rows=\{2\}\s*required\s*value=\{selectedPuzzleForEdit\.prompt\}\s*onChange=\{\(e\) => setSelectedPuzzleForEdit\(\{ \.\.\.selectedPuzzleForEdit, prompt: e\.target\.value \}\)\}\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2\.5 font-medium"\s*placeholder="مثال: حدد العنصر المختلف"\s*\/>/g,
  `<LocalizedInput label="نص السؤال / التوجيه للمتسابق *" value={selectedPuzzleForEdit.prompt as any} onChange={val => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, prompt: val as any })} type="textarea" theme="light" />`
);

// options
const oldOptionsPattern = `{(selectedPuzzleForEdit.options || []).map((opt: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="puzzleOption"
                      checked={selectedPuzzleForEdit.correctAnswerIndex === idx}
                      onChange={() => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, correctAnswerIndex: idx })}
                      className="w-4 h-4 accent-amber-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={opt.label || ''}
                      onChange={(e) => {
                        const newOpts = [...selectedPuzzleForEdit.options];
                        newOpts[idx] = { ...newOpts[idx], label: e.target.value };
                        setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, options: newOpts });
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-medium focus:border-amber-500 focus:outline-none"
                      placeholder={\`الخيار \${idx + 1}\`}
                    />
                  </div>
                ))}`;

const newOptionsPattern = `{(selectedPuzzleForEdit.options || []).map((opt: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-200/50">
                    <div className="pt-2">
                      <input
                        type="radio"
                        name="puzzleOption"
                        checked={selectedPuzzleForEdit.correctAnswerIndex === idx}
                        onChange={() => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, correctAnswerIndex: idx })}
                        className="w-4 h-4 accent-amber-600 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <LocalizedInput
                        label={\`الخيار \${idx + 1}\`}
                        value={opt.label as any}
                        onChange={val => {
                          const newOpts = [...selectedPuzzleForEdit.options];
                          newOpts[idx] = { ...newOpts[idx], label: val as any };
                          setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, options: newOpts });
                        }}
                        theme="light"
                      />
                    </div>
                  </div>
                ))}`;

code = code.replace(oldOptionsPattern, newOptionsPattern);

fs.writeFileSync('src/components/admin/AdminFreeChallenge.tsx', code);
