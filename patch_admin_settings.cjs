const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminSettings.tsx', 'utf8');

const regex = /<textarea\s+value=\{settings\.aiChatSystemPrompt \|\| ''\}\s+onChange=\{e => setSettings\(\{ \.\.\.settings, aiChatSystemPrompt: e\.target\.value \}\)\}\s+rows=\{6\}\s+placeholder="أنت مساعد ذكي\.\.\."\s+className="w-full px-3\.5 py-2\.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"\s+\/>\s+<\/div>\s+<\/div>/;

const newSection = `<textarea
              value={settings.aiChatSystemPrompt || ''}
              onChange={e => setSettings({ ...settings, aiChatSystemPrompt: e.target.value })}
              rows={6}
              placeholder="أنت مساعد ذكي..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4">المساعد الصوتي</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">تفعيل المساعد الصوتي</h4>
                  <p className="text-[10px] text-slate-400 mt-1">تفعيل ميزة التحدث والاستماع داخل الشات</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.voiceAssistantEnabled !== false}
                    onChange={e => setSettings({ ...settings, voiceAssistantEnabled: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                  <span className="ms-3 text-xs font-medium text-slate-300">
                    {settings.voiceAssistantEnabled !== false ? 'مفعل' : 'معطل'}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">الترحيب التلقائي بالمنتج</h4>
                  <p className="text-[10px] text-slate-400 mt-1">إرسال رسالة ترحيبية عند فتح العميل لمنتج معين</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.voiceAutoWelcomeEnabled !== false}
                    onChange={e => setSettings({ ...settings, voiceAutoWelcomeEnabled: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">نص الترحيب بالمنتج (عربي)</label>
                <input
                  type="text"
                  value={settings.voiceAutoWelcomeTextAr || 'ممتاز، هذا المنتج متوفر حالياً. أقدر أساعدك إذا كان مناسب لاحتياجك.'}
                  onChange={e => setSettings({ ...settings, voiceAutoWelcomeTextAr: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">نص الترحيب بالمنتج (إنجليزي)</label>
                <input
                  type="text"
                  value={settings.voiceAutoWelcomeTextEn || 'Great, this product is currently available. I can help you see if it fits your needs.'}
                  onChange={e => setSettings({ ...settings, voiceAutoWelcomeTextEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  dir="ltr"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">مدة الانتظار قبل الترحيب (ثواني)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={settings.voiceAutoWelcomeDelaySeconds ?? 3}
                  onChange={e => setSettings({ ...settings, voiceAutoWelcomeDelaySeconds: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>`;

code = code.replace(regex, newSection);

fs.writeFileSync('src/components/admin/AdminSettings.tsx', code);
