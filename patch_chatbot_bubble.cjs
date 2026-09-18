const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

// 1. Add welcomeBubble state
code = code.replace(
  /const \[isOpen, setIsOpen\] = useState\(false\);/,
  `const [isOpen, setIsOpen] = useState(false);\n  const [welcomeBubble, setWelcomeBubble] = useState<string | null>(null);`
);

// 2. Modify setTimeout behavior
const oldTimeout = `const timeout = setTimeout(() => {
          const welcomeMsg = isRtl ? textAr : textEn;
          setMessages(prev => [...prev, { role: 'model', content: welcomeMsg }]);
          setIsOpen(true);
          if (isSoundOn) {
            speakText(welcomeMsg);
          }
        }, delay);`;
        
const newTimeout = `const timeout = setTimeout(() => {
          const welcomeMsg = isRtl ? textAr : textEn;
          setMessages(prev => {
            // Prevent duplicate welcome messages in history
            if (prev.length > 0 && prev[prev.length - 1].content === welcomeMsg) return prev;
            return [...prev, { role: 'model', content: welcomeMsg }];
          });
          
          if (!isOpen) {
             setWelcomeBubble(welcomeMsg);
             setTimeout(() => setWelcomeBubble(null), 10000); // auto-hide bubble after 10s
          }
          
          if (isSoundOn) {
            speakText(welcomeMsg);
          }
        }, delay);`;

code = code.replace(oldTimeout, newTimeout);

// 3. Render the bubble and fix button onClick
const oldButton = `<button
        onClick={() => setIsOpen(true)}
        className={\`fixed bottom-24 \${isRtl ? 'left-4' : 'right-4'} z-40 bg-sky-600 text-white p-3.5 rounded-full shadow-xl hover:bg-sky-700 transition-all hover:scale-110 cursor-pointer \${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}\`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>`;

const newButtonAndBubble = `{welcomeBubble && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          onClick={() => { setIsOpen(true); setWelcomeBubble(null); }}
          className={\`fixed bottom-40 \${isRtl ? 'left-4' : 'right-4'} z-40 bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-64 cursor-pointer hover:shadow-2xl transition-all\`}
        >
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium mt-1">{welcomeBubble}</p>
          </div>
          {/* Notification Indicator */}
          <span className={\`absolute top-2 \${isRtl ? 'left-2' : 'right-2'} flex h-2.5 w-2.5\`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
          </span>
          {/* Pointer tail */}
          <div className={\`absolute -bottom-2 \${isRtl ? 'left-8' : 'right-8'} w-4 h-4 bg-white dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-700 transform rotate-45\`}></div>
        </motion.div>
      )}
      <button
        onClick={() => { setIsOpen(true); setWelcomeBubble(null); }}
        className={\`fixed bottom-24 \${isRtl ? 'left-4' : 'right-4'} z-40 bg-sky-600 text-white p-3.5 rounded-full shadow-xl hover:bg-sky-700 transition-all hover:scale-110 cursor-pointer \${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}\`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>`;

code = code.replace(oldButton, newButtonAndBubble);

fs.writeFileSync('src/components/Chatbot.tsx', code);
