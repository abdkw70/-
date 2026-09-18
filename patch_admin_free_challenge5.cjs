const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminFreeChallenge.tsx', 'utf8');

const oldOptionsPattern = `{(selectedPuzzleForEdit.options || []).map((opt: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={selectedPuzzleForEdit.correctAnswerIndex === idx}
                      onChange={() => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, correctAnswerIndex: idx })}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={opt.label || ''}
                      onChange={(e) => {
                        const newOpts = [...selectedPuzzleForEdit.options];
                        newOpts[idx] = { ...newOpts[idx], label: e.target.value };
                        setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, options: newOpts });
                      }}
                      placeholder={\`الخيار \${idx + 1}\`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-xs"
                    />
                  </div>
                ))}`;

const newOptionsPattern = `{(selectedPuzzleForEdit.options || []).map((opt: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-200/50">
                    <div className="pt-2">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={selectedPuzzleForEdit.correctAnswerIndex === idx}
                        onChange={() => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, correctAnswerIndex: idx })}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
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
