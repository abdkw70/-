const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

// 1. Update quick suggestions
code = code.replace(
  /const productSuggestionsAr = \[.*?\];/,
  'const productSuggestionsAr = ["أبي تفاصيل أكثر", "هل يناسبني؟", "ما الخيارات المتوفرة؟", "أضفه للسلة"];'
);
code = code.replace(
  /const productSuggestionsEn = \[.*?\];/,
  'const productSuggestionsEn = ["More details", "Is it suitable for me?", "What are the options?", "Add to cart"];'
);

// 2. Modify speakText for better TTS (rate and pitch)
const oldSpeakText = `const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean text from emojis and markdown for speech
    const cleanText = text.replace(/([\\u2700-\\u27BF]|[\\uE000-\\uF8FF]|\\uD83C[\\uDC00-\\uDFFF]|\\uD83D[\\uDC00-\\uDFFF]|[\\u2011-\\u26FF]|\\uD83E[\\uDD10-\\uDDFF])/g, '').replace(/\\*\\*/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    // Auto-detect based on text content (Arabic vs English)
    const isArabicText = /[\\u0600-\\u06FF]/.test(cleanText);
    utterance.lang = isArabicText ? 'ar-SA' : 'en-US';
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(v => v.lang.includes(utterance.lang) && (v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Premium')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else {
        const anyLangVoice = voices.find(v => v.lang.includes(utterance.lang));
        if (anyLangVoice) utterance.voice = anyLangVoice;
      }
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };`;
  
const newSpeakText = `const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean text from emojis and markdown for speech
    const cleanText = text.replace(/([\\u2700-\\u27BF]|[\\uE000-\\uF8FF]|\\uD83C[\\uDC00-\\uDFFF]|\\uD83D[\\uDC00-\\uDFFF]|[\\u2011-\\u26FF]|\\uD83E[\\uDD10-\\uDDFF])/g, '').replace(/\\*\\*/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    // Auto-detect based on text content (Arabic vs English)
    const isArabicText = /[\\u0600-\\u06FF]/.test(cleanText);
    utterance.lang = isArabicText ? 'ar-SA' : 'en-US';
    
    // Adjust rate and pitch for a more lively, natural human voice (not robotic flat)
    utterance.rate = 1.15; // Slightly faster for energy
    utterance.pitch = 1.05; // Slightly higher pitch for friendliness
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(v => v.lang.includes(utterance.lang) && (v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Premium') || v.name.includes('Natural')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else {
        const anyLangVoice = voices.find(v => v.lang.includes(utterance.lang));
        if (anyLangVoice) utterance.voice = anyLangVoice;
      }
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };`;

code = code.replace(oldSpeakText, newSpeakText);

// 3. Update useEffect for auto-welcome to call the backend AI for dynamic message
const oldWelcomeEffect = /const textAr = storeSettings\?\.voiceAutoWelcomeTextAr[\s\S]*?return \(\) => clearTimeout\(timeout\);\n\s*\}/;

const newWelcomeEffect = `
        const delay = (storeSettings?.voiceAutoWelcomeDelaySeconds ?? 3) * 1000;
        
        // Fetch dynamic AI welcome string for this product
        setTimeout(async () => {
           try {
             const res = await fetch('/api/ai-chat', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ 
                 isAutoWelcome: true, 
                 currentProductHandle 
               })
             });
             const data = await res.json();
             const welcomeMsg = data.response || (isRtl ? 'يا هلا! تبيني أساعدك بهالمنتج؟' : 'Hello! Need help with this product?');
             
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
           } catch(e) {
             console.error('Auto welcome fetch error:', e);
           }
        }, delay);
      }`;

code = code.replace(oldWelcomeEffect, newWelcomeEffect);

fs.writeFileSync('src/components/Chatbot.tsx', code);
