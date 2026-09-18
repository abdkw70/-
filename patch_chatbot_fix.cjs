const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

// 1. Add Mic Lang State
code = code.replace(
  /const \[isListening, setIsListening\] = useState\(false\);/,
  `const [isListening, setIsListening] = useState(false);\n  const [micLang, setMicLang] = useState<'ar'|'en'>(isRtl ? 'ar' : 'ar'); // Default to Arabic as requested`
);

// 2. Fix Audio unlock
code = code.replace(
  /const handleSuggestionClick = \(suggestion: string\) => \{/,
  `const handleToggleSound = () => {
    setIsSoundOn(prev => {
      const next = !prev;
      if (next && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(utterance);
      }
      return next;
    });
  };

  const handleSuggestionClick = (suggestion: string) => {`
);

// 3. Use handleToggleSound
code = code.replace(
  /onClick=\{() => setIsSoundOn\(!isSoundOn\)\}/,
  'onClick={handleToggleSound}'
);

// 4. Use micLang for recognition
code = code.replace(
  /recognitionRef\.current\.lang = isRtl \? 'ar-SA' : 'en-US';/,
  `recognitionRef.current.lang = micLang === 'ar' ? 'ar-KW' : 'en-US';`
);

// 5. Update utterance lang
code = code.replace(
  /utterance\.lang = isRtl \? 'ar-SA' : 'en-US';/,
  `// Auto-detect based on text content (Arabic vs English)
    const isArabicText = /[\\u0600-\\u06FF]/.test(cleanText);
    utterance.lang = isArabicText ? 'ar-SA' : 'en-US';`
);

// 6. Add Mic Lang Toggle button in UI
const inputSectionRegex = /\{isVoiceEnabled && \(\s*<button\s*onClick=\{toggleListening\}(.|\n)*?<\/button>\s*\)\}/;
const micButton = `{isVoiceEnabled && (
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setMicLang(prev => prev === 'ar' ? 'en' : 'ar')}
                    className="px-2 text-[10px] font-bold text-slate-500 hover:text-sky-600 transition-colors"
                    title={isRtl ? 'تغيير لغة الميكروفون' : 'Change Mic Language'}
                  >
                    {micLang === 'ar' ? 'AR' : 'EN'}
                  </button>
                  <button
                    onClick={toggleListening}
                    className={\`p-3 flex items-center justify-center transition-colors cursor-pointer \${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }\`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              )}`;
              
code = code.replace(inputSectionRegex, micButton);

fs.writeFileSync('src/components/Chatbot.tsx', code);
