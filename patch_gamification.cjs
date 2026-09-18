const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminGamificationManager.tsx', 'utf8');

// import LocalizedInput
code = code.replace(/import \{ QuizQuestion \} from '\.\.\/\.\.\/types';/, "import { QuizQuestion } from '../../types';\nimport { LocalizedInput } from './LocalizedInput';");

// Replace question text area
code = code.replace(
  /<div className="space-y-1">\s*<label className="font-bold text-white block">نص السؤال \*<\/label>\s*<textarea\s*rows=\{2\}\s*value=\{editingQuestion\.question \|\| ''\}\s*onChange=\{e => setEditingQuestion\(\{ \.\.\.editingQuestion, question: e\.target\.value \}\)\}\s*placeholder="اكتب نص السؤال هنا\.\.\."\s*className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"\s*\/>\s*<\/div>/g,
  `<LocalizedInput label="نص السؤال *" value={editingQuestion.question} onChange={val => setEditingQuestion({ ...editingQuestion, question: val })} type="textarea" />`
);

// We need to replace options input fields as well
// Let's replace the options map
const oldOptions = `{(editingQuestion.options || ['', '', '', '']).map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={editingQuestion.correctAnswerIndex === idx}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswerIndex: idx })}
                      className="w-4 h-4 accent-emerald-500"
                      title="حدد كإجابة صحيحة"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOptions = [...(editingQuestion.options || [])];
                        newOptions[idx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOptions });
                      }}
                      placeholder={\`الخيار \${idx + 1}\`}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}`;

const newOptions = `{(editingQuestion.options || [{ar:'',en:''}, {ar:'',en:''}, {ar:'',en:''}, {ar:'',en:''}]).map((opt, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                    <div className="pt-2">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={editingQuestion.correctAnswerIndex === idx}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswerIndex: idx })}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        title="حدد كإجابة صحيحة"
                      />
                    </div>
                    <div className="flex-1">
                      <LocalizedInput
                        label={\`الخيار \${idx + 1}\`}
                        value={opt as any}
                        onChange={val => {
                          const newOptions = [...(editingQuestion.options || [])];
                          newOptions[idx] = val;
                          setEditingQuestion({ ...editingQuestion, options: newOptions });
                        }}
                        theme="dark"
                      />
                    </div>
                  </div>
                ))}`;

code = code.replace(oldOptions, newOptions);

fs.writeFileSync('src/components/admin/AdminGamificationManager.tsx', code);
