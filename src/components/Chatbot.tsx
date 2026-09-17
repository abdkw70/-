import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Chatbot: React.FC = () => {
  const { isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: isRtl ? 'مرحباً! أنا المساعد الذكي لمكتبة الشاطئ الأزرق 🌊📚، كيف يمكنني مساعدتك اليوم؟' : 'Hello! I am the AI assistant for Blue Beach Stationery 🌊📚, how can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: inputValue }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await res.json();
      if (data.error) {
         setMessages(prev => [...prev, { role: 'model', content: isRtl ? 'عذراً، خدمة المساعد الذكي غير متاحة حالياً.' : 'Sorry, the AI assistant is currently unavailable.' }]);
      } else {
         setMessages(prev => [...prev, { role: 'model', content: data.response }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: isRtl ? 'حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.' : 'Connection error, please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 ${isRtl ? 'left-4' : 'right-4'} z-40 bg-sky-600 text-white p-3.5 rounded-full shadow-xl hover:bg-sky-700 transition-all hover:scale-110 cursor-pointer ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {isOpen && (
        <div className={`fixed bottom-24 ${isRtl ? 'left-4' : 'right-4'} z-50 w-[360px] max-w-[calc(100vw-32px)] h-[500px] max-h-[70vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden`}>
          {/* Header */}
          <div className="bg-sky-600 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {isRtl ? 'المساعد الذكي' : 'AI Assistant'}
                </h3>
                <p className="text-[10px] text-sky-100 opacity-90">
                  {isRtl ? 'مكتبة الشاطئ الأزرق' : 'Blue Beach Stationery'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-sky-600" />
                  </div>
                )}
                <div className={`max-w-[75%] p-3 text-sm whitespace-pre-wrap rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-sky-600 text-white rounded-br-sm' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
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
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex gap-2" dir={isRtl ? 'rtl' : 'ltr'}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isRtl ? 'اكتب رسالتك هنا...' : 'Type your message...'}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                  isLoading || !inputValue.trim() 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
                    : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
                }`}
              >
                <Send className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
