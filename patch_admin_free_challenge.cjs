const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminFreeChallenge.tsx', 'utf8');

// import LocalizedInput
code = code.replace(/import \{ VisualPuzzleClient, GameConfig, FreeChallengeSettings, TickerSettings \} from '\.\.\/\.\.\/types';/, "import { VisualPuzzleClient, GameConfig, FreeChallengeSettings, TickerSettings } from '../../types';\nimport { LocalizedInput } from './LocalizedInput';");

// Game title and description
code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">اسم اللعبة \/ التحدي \*<\/label>\s*<input\s*type="text"\s*value=\{editingGame\.title \|\| ''\}\s*onChange=\{e => setEditingGame\(\{ \.\.\.editingGame, title: e\.target\.value \}\)\}\s*className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"\s*placeholder="أدخل اسم اللعبة"\s*\/>/g,
  `<LocalizedInput label="اسم اللعبة / التحدي *" value={editingGame.title} onChange={val => setEditingGame({ ...editingGame, title: val })} theme="light" />`
);

code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">وصف اللعبة \*<\/label>\s*<textarea\s*rows=\{2\}\s*value=\{editingGame\.description \|\| ''\}\s*onChange=\{e => setEditingGame\(\{ \.\.\.editingGame, description: e\.target\.value \}\)\}\s*className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"\s*placeholder="أدخل وصف اللعبة"\s*\/>/g,
  `<LocalizedInput label="وصف اللعبة *" value={editingGame.description} onChange={val => setEditingGame({ ...editingGame, description: val })} type="textarea" theme="light" />`
);

// Game win message, loss message, timeout message
code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">رسالة الفوز بالتحدي<\/label>\s*<input\s*type="text"\s*value=\{editingGame\.winMessage \|\| ''\}\s*onChange=\{e => setEditingGame\(\{ \.\.\.editingGame, winMessage: e\.target\.value \}\)\}\s*className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"\s*\/>/g,
  `<LocalizedInput label="رسالة الفوز بالتحدي" value={editingGame.winMessage} onChange={val => setEditingGame({ ...editingGame, winMessage: val })} theme="light" />`
);

code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">رسالة الخسارة وتدوير العجلة<\/label>\s*<input\s*type="text"\s*value=\{editingGame\.lossMessage \|\| ''\}\s*onChange=\{e => setEditingGame\(\{ \.\.\.editingGame, lossMessage: e\.target\.value \}\)\}\s*className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"\s*\/>/g,
  `<LocalizedInput label="رسالة الخسارة وتدوير العجلة" value={editingGame.lossMessage} onChange={val => setEditingGame({ ...editingGame, lossMessage: val })} theme="light" />`
);

// Puzzle title, prompt, explanation
code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">عنوان اللغز \*<\/label>\s*<input\s*type="text"\s*value=\{editingPuzzle\.title \|\| ''\}\s*onChange=\{e => setEditingPuzzle\(\{ \.\.\.editingPuzzle, title: e\.target\.value \}\)\}\s*className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"\s*\/>/g,
  `<LocalizedInput label="عنوان اللغز *" value={editingPuzzle.title} onChange={val => setEditingPuzzle({ ...editingPuzzle, title: val })} theme="light" />`
);

code = code.replace(
  /<label className="font-bold text-slate-700 block mb-1">نص السؤال \/ المطلوب \*<\/label>\s*<textarea\s*rows=\{2\}\s*value=\{editingPuzzle\.prompt \|\| ''\}\s*onChange=\{e => setEditingPuzzle\(\{ \.\.\.editingPuzzle, prompt: e\.target\.value \}\)\}\s*className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"\s*\/>/g,
  `<LocalizedInput label="نص السؤال / المطلوب *" value={editingPuzzle.prompt} onChange={val => setEditingPuzzle({ ...editingPuzzle, prompt: val })} type="textarea" theme="light" />`
);

// Puzzle options
const oldOptionsPattern = `{(editingPuzzle.options || []).map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="puzzleCorrectOption"
                      checked={editingPuzzle.correctAnswerIndex === idx}
                      onChange={() => setEditingPuzzle({ ...editingPuzzle, correctAnswerIndex: idx })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <input
                      type="text"
                      value={opt.label || ''}
                      onChange={e => {
                        const newOptions = [...(editingPuzzle.options || [])];
                        newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                        setEditingPuzzle({ ...editingPuzzle, options: newOptions });
                      }}
                      placeholder={\`نص الخيار \${idx + 1}\`}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}`;

const newOptionsPattern = `{(editingPuzzle.options || []).map((opt, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-200/50">
                    <div className="pt-2">
                      <input
                        type="radio"
                        name="puzzleCorrectOption"
                        checked={editingPuzzle.correctAnswerIndex === idx}
                        onChange={() => setEditingPuzzle({ ...editingPuzzle, correctAnswerIndex: idx })}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <LocalizedInput
                        label={\`الخيار \${idx + 1}\`}
                        value={opt.label as any}
                        onChange={val => {
                          const newOptions = [...(editingPuzzle.options || [])];
                          newOptions[idx] = { ...newOptions[idx], label: val };
                          setEditingPuzzle({ ...editingPuzzle, options: newOptions });
                        }}
                        theme="light"
                      />
                    </div>
                  </div>
                ))}`;
code = code.replace(oldOptionsPattern, newOptionsPattern);


fs.writeFileSync('src/components/admin/AdminFreeChallenge.tsx', code);
