import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, GripHorizontal, Mic, MicOff, Volume2, VolumeX, Square } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, useDragControls, useMotionValue, animate } from 'motion/react';

interface ChatbotProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onNavigate, currentPath = '' }) => {
  const { isRtl } = useLanguage();
  const { sessionId, storeSettings } = useCart();
  const { userProfile, user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [welcomeBubble, setWelcomeBubble] = useState<string | null>(null);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const chatRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string, productCards?: Product[] }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice feature states
  const [isListening, setIsListening] = useState(false);
  const [micLang, setMicLang] = useState<'ar'|'en'>(isRtl ? 'ar' : 'ar'); // Default to Arabic as requested
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Welcome Message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { role: 'model', content: isRtl ? 'مرحباً! أنا المساعد الذكي لمكتبة الشاطئ الأزرق 🌊📚، كيف يمكنني مساعدتك اليوم؟' : 'Hello! I am the AI shopping assistant for Blue Beach Stationery 🌊📚, how can I help you today?' }
      ]);
    }
  }, [isRtl, messages.length]);

  // Product Context & Auto-welcome
  const currentProductHandle = currentPath.startsWith('/product/') ? currentPath.replace('/product/', '') : undefined;
  const welcomedProductsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (currentProductHandle && storeSettings?.voiceAutoWelcomeEnabled !== false) {
      if (!welcomedProductsRef.current.has(currentProductHandle)) {
        welcomedProductsRef.current.add(currentProductHandle);
        const delay = (storeSettings?.voiceAutoWelcomeDelaySeconds ?? 3) * 1000;
        
        // Fetch dynamic AI welcome string for this product
        const timeout = setTimeout(async () => {
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
             if (data.suggestions && data.suggestions.length > 0) {
               setDynamicSuggestions(data.suggestions);
             }
             
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
        return () => clearTimeout(timeout);
      }
    }
  }, [currentProductHandle, isRtl, storeSettings, isSoundOn]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputValue(finalTranscript);
          // auto send when final
          sendMessageFromInput(finalTranscript);
        } else {
          setInputValue(interimTranscript);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          console.error('Speech recognition error:', event.error);
        }
        setIsListening(false);
      };
    }
  }, [isRtl]); // update language when isRtl changes

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = micLang === 'ar' ? 'ar-KW' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
        // Ensure any ongoing speech stops when we start listening
        stopSpeaking();
      } else {
        alert(isRtl ? 'متصفحك لا يدعم التعرف على الصوت' : 'Your browser does not support speech recognition');
      }
    }
  };

  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopSpeaking = () => {
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
      } catch (e) {}
      currentAudioSourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsSpeaking(false);
  };

  const speakText = async (text: string) => {
    // Clean text from emojis and markdown
    const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').replace(/\*\*/g, '');
    if (!cleanText) return;
    
    const isArabicText = /[\u0600-\u06FF]/.test(cleanText);
    const lang = isArabicText ? 'ar-SA' : 'en-US';

    stopSpeaking(); // Stop any ongoing speech

    setIsSpeaking(true);
    try {
      const res = await fetch('/api/ai-chat/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, lang })
      });
      const data = await res.json();
      
      if (data.audioData) {
        // Initialize AudioContext if not already initialized or if closed
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const audioBuffer = await audioContextRef.current.decodeAudioData(
          // Convert base64 to ArrayBuffer
          await fetch(`data:audio/wav;base64,${data.audioData}`).then(r => r.arrayBuffer())
        );
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
          setIsSpeaking(false);
        };
        currentAudioSourceRef.current = source;
        source.start(0);
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      console.error('TTS playback error', e);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (isOpen && chatRef.current && !chatRef.current.contains(e.target as Node)) {
        animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
        animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, x, y]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const sendMessageFromInput = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    const newMessages = [...messagesRef.current, { role: 'user' as const, content: textToSend }];
    setMessages(prev => [...prev, { role: 'user' as const, content: textToSend }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          sessionId,
          userId: userProfile?.id || user?.uid,
          userName: userProfile?.displayName || user?.displayName,
          currentProductHandle
        })
      });
      
      const data = await res.json();

      if (data.suggestions && data.suggestions.length > 0) {
        setDynamicSuggestions(data.suggestions);
      }

      if (data.error) {
         setMessages(prev => [...prev, { role: 'model', content: isRtl ? 'عذراً، خدمة المساعد الذكي غير متاحة حالياً.' : 'Sorry, the AI assistant is currently unavailable.' }]);
      } else {
         const responseText = data.response;
         setMessages(prev => [...prev, {
            role: 'model',
            content: responseText,
            productCards: data.productCards
          }]);
         
         if (isSoundOn) {
            speakText(responseText);
         }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: isRtl ? 'حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.' : 'Connection error, please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    sendMessageFromInput(inputValue);
  };

  const handleToggleSound = () => {
    setIsSoundOn(prev => {
      const next = !prev;
      if (next && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(utterance);
      }
      return next;
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    sendMessageFromInput(suggestion);
  };

  const generalSuggestionsAr = ["اقترح لي منتجًا", "ماذا يناسبني؟", "قارن المنتجات", "أرني البدائل", "ما المنتجات المخفضة؟", "ساعدني في اختيار منتج"];
  const generalSuggestionsEn = ["Recommend a product", "What suits me?", "Compare products", "Show alternatives", "Show discounted products", "Help me choose a product"];
  
  const productSuggestionsAr = ["أبي تفاصيل أكثر", "هل يناسبني؟", "ما الخيارات المتوفرة؟", "أضفه للسلة"];
  const productSuggestionsEn = ["More details", "Is it suitable for me?", "What are the options?", "Add to cart"];

  const suggestions = dynamicSuggestions.length > 0
    ? dynamicSuggestions
    : (currentProductHandle
       ? (isRtl ? productSuggestionsAr : productSuggestionsEn)
       : (isRtl ? generalSuggestionsAr : generalSuggestionsEn));

  if (storeSettings?.aiChatEnabled === false) return null;
  const isVoiceEnabled = storeSettings?.voiceAssistantEnabled !== false;

  return (
    <>
      {welcomeBubble && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          onClick={() => { setIsOpen(true); setWelcomeBubble(null); }}
          className={`fixed bottom-40 ${isRtl ? 'left-4' : 'right-4'} z-40 bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-64 cursor-pointer hover:shadow-2xl transition-all`}
        >
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium mt-1">{welcomeBubble}</p>
          </div>
          {/* Notification Indicator */}
          <span className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} flex h-2.5 w-2.5`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
          </span>
          {/* Pointer tail */}
          <div className={`absolute -bottom-2 ${isRtl ? 'left-8' : 'right-8'} w-4 h-4 bg-white dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-700 transform rotate-45`}></div>
        </motion.div>
      )}
      <button
        onClick={() => { setIsOpen(true); setWelcomeBubble(null); }}
        className={`fixed bottom-24 ${isRtl ? 'left-4' : 'right-4'} z-40 bg-sky-600 text-white p-3.5 rounded-full shadow-xl hover:bg-sky-700 transition-all hover:scale-110 cursor-pointer ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {isOpen && (
        <motion.div 
          ref={chatRef}
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          style={{ x, y, touchAction: "none" }}
          className={`fixed bottom-24 ${isRtl ? 'left-4' : 'right-4'} z-50 w-[380px] max-w-[calc(100vw-32px)] h-[600px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden`}
        >
          {/* Header */}
          <div 
            onPointerDown={(e) => dragControls.start(e)}
            className="bg-sky-600 text-white p-3 flex items-center justify-between shadow-sm cursor-move touch-none"
          >
            <div className="flex items-center gap-3">
              <GripHorizontal className="w-5 h-5 opacity-60 text-white" />
              <div className="bg-white/20 p-2 rounded-full pointer-events-none">
                <Bot className="w-5 h-5" />
              </div>
              <div className="pointer-events-none">
                <h3 className="font-bold text-sm">
                  {isRtl ? 'مساعد التسوق الذكي' : 'AI Shopping Assistant'}
                </h3>
                <p className="text-[10px] text-sky-100 opacity-90">
                  {isRtl ? 'مكتبة الشاطئ الأزرق' : 'Blue Beach Stationery'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isVoiceEnabled && (
                <button 
                  onPointerDown={(e) => e.stopPropagation()} 
                  onClick={() => setIsSoundOn(!isSoundOn)} 
                  className={`hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer ${isSoundOn ? 'text-white' : 'text-sky-200 opacity-70'}`}
                  title={isRtl ? "تشغيل/إيقاف الصوت" : "Toggle Sound"}
                >
                  {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              )}
              <button 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-2`}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-sky-600" />
                    </div>
                  )}
                  <div className={`max-w-[85%] p-3 text-sm whitespace-pre-wrap rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-sky-600 text-white rounded-br-sm' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
                {/* Render Product Cards if available */}
                {msg.productCards && msg.productCards.length > 0 && (
                  <div className={`flex gap-3 overflow-x-auto pb-4 pt-1 px-1 snap-x ${isRtl ? 'mr-10' : 'ml-10'}`}>
                    {msg.productCards.map(p => (
                      <div key={p.id} className="w-[220px] shrink-0 snap-center">
                        <ProductCard product={p} onNavigate={onNavigate || (() => {})} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-sky-600" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-3 rounded-2xl rounded-bl-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                </div>
              </div>
            )}
            
            {/* Quick Suggestions */}
            {!isLoading && (
              <div className={`flex flex-wrap gap-2 mt-4 ${isRtl ? 'pr-10' : 'pl-10'}`}>
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-medium transition-colors cursor-pointer text-start"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice active indicator & stop speaking */}
          {(isListening || isSpeaking) && (
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-sky-600 dark:text-sky-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                </span>
                {isListening ? (isRtl ? 'جاري الاستماع...' : 'Listening...') : (isRtl ? 'المساعد يتحدث...' : 'Assistant speaking...')}
              </div>
              {isSpeaking && (
                <button 
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  <Square className="w-3 h-3" />
                  {isRtl ? 'إيقاف' : 'Stop'}
                </button>
              )}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex gap-2" dir={isRtl ? 'rtl' : 'ltr'}>
              {isVoiceEnabled && (
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
                    className={`p-3 flex items-center justify-center transition-colors cursor-pointer ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              )}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isRtl ? 'اكتب أو تحدث للبحث...' : 'Type or speak to search...'}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className={`p-3 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                  isLoading || !inputValue.trim() 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
                    : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
                }`}
              >
                <Send className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};
