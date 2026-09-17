const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminSettings.tsx', 'utf8');

const aiSettingsHtml = `
        {/* AI Chatbot Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-sky-400">🤖</span> إعدادات المساعد الذكي (AI Chatbot)
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.aiChatEnabled !== false}
                onChange={e => setSettings({ ...settings, aiChatEnabled: e.target.checked })}
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
              <span className="ms-3 text-xs font-medium text-slate-300">
                {settings.aiChatEnabled !== false ? 'مفعل' : 'معطل'}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">تعليمات النظام (System Prompt)</label>
            <p className="text-[10px] text-slate-500 mb-2">هذه التعليمات توجه الذكاء الاصطناعي (Gemini) لكيفية التحدث مع العملاء. يمكنك تحديد نبرة الصوت وتوجيهه لعدم الإجابة على الأسئلة الخارجة عن تخصص المكتبة.</p>
            <textarea
              value={settings.aiChatSystemPrompt || ''}
              onChange={e => setSettings({ ...settings, aiChatSystemPrompt: e.target.value })}
              rows={6}
              placeholder="أنت مساعد ذكي..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
`;

content = content.replace('{/* Submit */}', aiSettingsHtml + '\n        {/* Submit */}');

fs.writeFileSync('src/components/admin/AdminSettings.tsx', content);
