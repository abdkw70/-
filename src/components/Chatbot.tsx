import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  Loader2, 
  GripHorizontal, 
  ShoppingBag, 
  Check, 
  ExternalLink, 
  Sparkles, 
  RefreshCw,
  Tag,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, useDragControls } from 'motion/react';

interface ChatbotProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  productCards?: Product[];
}

interface SmartRecommendationData {
  recommendation: string;
  inChatPrompt: string;
  product: Product;
}

// ---------------- In-Chat Interactive Product Card ----------------
interface InChatProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
  onCloseChat?: () => void;
}

const InChatProductCard: React.FC<InChatProductCardProps> = ({ product, onNavigate, onCloseChat }) => {
  const { addItemToCart } = useCart();
  const { isRtl, formatPrice, translateProductTitle } = useLanguage();
  
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants[0].id;
    }
    return '';
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const comparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const hasDiscount = comparePrice && comparePrice > currentPrice;
  
  const isVariantInStock = selectedVariant 
    ? (selectedVariant.stock !== undefined ? selectedVariant.stock > 0 : selectedVariant.isInStock !== false)
    : product.isInStock;

  const imageSrc = product.images?.[0]?.src || 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png';
  const displayTitle = translateProductTitle(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isVariantInStock || isAdding) return;
    setIsAdding(true);
    try {
      await addItemToCart(product, selectedVariant, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2200);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleViewProduct = () => {
    const handle = product.handle || product.id;
    onNavigate(`/product/${encodeURIComponent(handle)}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="w-[230px] shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden text-start"
    >
      {/* Product Image & Badges */}
      <div 
        onClick={handleViewProduct}
        className="relative aspect-[4/3] w-full bg-slate-50 dark:bg-slate-900 overflow-hidden flex items-center justify-center p-2 cursor-pointer group"
      >
        <img
          src={imageSrc}
          alt={displayTitle}
          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Status Badges */}
        <div className={`absolute top-2 ${isRtl ? 'right-2' : 'left-2'} flex flex-col gap-1 items-start pointer-events-none`}>
          {hasDiscount && (
            <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
              {product.discountPercentage 
                ? `${isRtl ? 'خصم' : 'OFF'} ${product.discountPercentage}%` 
                : (isRtl ? 'عرض خاص' : 'Special Offer')}
            </span>
          )}
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs ${
            isVariantInStock ? 'bg-emerald-600/90 text-white' : 'bg-slate-700 text-white'
          }`}>
            {isVariantInStock ? (isRtl ? 'متوفر' : 'In Stock') : (isRtl ? 'نفذت الكمية' : 'Out of Stock')}
          </span>
        </div>
      </div>

      {/* Details & Variant Selection */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <h4 
            onClick={handleViewProduct}
            className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors"
          >
            {displayTitle}
          </h4>

          {/* Pricing */}
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-sky-700 dark:text-sky-400">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && comparePrice && (
              <span className="text-[10px] text-slate-400 line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
        </div>

        {/* Variant selector if multiple variants exist */}
        {product.variants && product.variants.length > 1 && (
          <div className="space-y-1">
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {isRtl ? 'اختر المقاس / اللون:' : 'Choose Size / Color:'}
            </label>
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="w-full text-[11px] py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {product.variants.map((v) => {
                const vTitle = typeof v.title === 'string' ? v.title : (isRtl ? v.title?.ar : v.title?.en) || v.name || v.id;
                const vStock = v.stock !== undefined ? v.stock > 0 : v.isInStock !== false;
                return (
                  <option key={v.id} value={v.id} disabled={!vStock}>
                    {vTitle} {v.price ? `(${formatPrice(v.price)})` : ''} {!vStock ? ` - (${isRtl ? 'غير متوفر' : 'Sold out'})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            onClick={handleViewProduct}
            className="w-full py-1.5 px-2 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            <span>{isRtl ? 'عرض' : 'View'}</span>
          </button>

          <button
            onClick={handleAddToCart}
            disabled={!isVariantInStock || isAdding}
            className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              !isVariantInStock
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-sky-600 text-white hover:bg-sky-700 shadow-xs active:scale-95'
            }`}
          >
            {isAdding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تم!' : 'Added!'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isRtl ? 'أضف' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ---------------- Main Smart Chatbot Component ----------------
export const Chatbot: React.FC<ChatbotProps> = ({ onNavigate = () => {}, currentPath = '' }) => {
  const { isRtl, formatPrice, translateProductTitle } = useLanguage();
  const { sessionId, storeSettings } = useCart();
  const { userProfile, user } = useAuth();
  
  // UI & Positioning states
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  const dragControls = useDragControls();
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Dynamic Drag Boundaries based on viewport, chat dimensions, safe areas & orientation
  const [dragBounds, setDragBounds] = useState({ top: -350, bottom: 40, left: -500, right: 10 });

  const calculateDragBounds = useCallback(() => {
    if (typeof window === 'undefined') return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isSm = vw >= 640;
    setIsMobile(!isSm);

    if (!isSm) {
      setDragBounds({ top: 0, bottom: 0, left: 0, right: 0 });
      return;
    }

    // Default or measured dimensions
    const rect = chatRef.current?.getBoundingClientRect();
    const currentW = rect?.width || (isExpanded ? 440 : 360);
    const currentH = rect?.height || (isExpanded ? 600 : 480);

    const safeMargin = 16;
    const bottomOffset = 96; // 6rem from bottom
    const sideOffset = 24; // 1.5rem from left/right
    const topNavSafety = 75; // keep safely below top header

    // Maximum distance chat can travel upwards without penetrating top margin
    const maxUp = Math.min(0, -(vh - bottomOffset - currentH - topNavSafety));
    // Maximum distance chat can travel downwards without penetrating bottom margin
    const maxDown = Math.max(0, bottomOffset - safeMargin);

    if (isRtl) {
      // Anchored at left: 24px
      const maxLeft = -(sideOffset - safeMargin); // ~ -8px
      const maxRight = Math.max(0, vw - sideOffset - currentW - safeMargin);
      setDragBounds({
        top: maxUp,
        bottom: maxDown,
        left: maxLeft,
        right: maxRight
      });
    } else {
      // Anchored at right: 24px
      const maxRight = sideOffset - safeMargin; // ~ 8px
      const maxLeft = Math.min(0, -(vw - sideOffset - currentW - safeMargin));
      setDragBounds({
        top: maxUp,
        bottom: maxDown,
        left: maxLeft,
        right: maxRight
      });
    }
  }, [isExpanded, isRtl]);

  // Responsive device listener & boundary updater
  useEffect(() => {
    calculateDragBounds();
    window.addEventListener('resize', calculateDragBounds);
    window.addEventListener('orientationchange', calculateDragBounds);
    return () => {
      window.removeEventListener('resize', calculateDragBounds);
      window.removeEventListener('orientationchange', calculateDragBounds);
    };
  }, [calculateDragBounds]);

  // Smart Mini-Recommendation Floating Bubble
  const [floatingRec, setFloatingRec] = useState<SmartRecommendationData | null>(null);

  // Session context tracking
  const recentHandlesRef = useRef<string[]>([]);
  const recommendedHandlesRef = useRef<Set<string>>(new Set());

  // Messages & Input
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef<boolean>(false);
  const activeChatAbortRef = useRef<AbortController | null>(null);
  const hasInitializedWelcomeRef = useRef(false);

  // Extract current product handle if on a product page
  const currentProductHandle = currentPath.startsWith('/product/') 
    ? decodeURIComponent(currentPath.replace('/product/', '').split('?')[0])
    : undefined;

  // Extract current category handle if on category page
  const currentCategoryHandle = currentPath.startsWith('/category/')
    ? decodeURIComponent(currentPath.replace('/category/', '').split('?')[0])
    : (currentPath.includes('category=') ? new URLSearchParams(currentPath.split('?')[1] || '').get('category') || undefined : undefined);

  // Track product browsing history in session
  useEffect(() => {
    if (currentProductHandle) {
      if (!recentHandlesRef.current.includes(currentProductHandle)) {
        recentHandlesRef.current = [currentProductHandle, ...recentHandlesRef.current].slice(0, 10);
      }
    }
  }, [currentProductHandle]);

  // Outside click handler: Snap chat smoothly back to origin position (0, 0)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      // If click was outside both the chat window and the trigger button
      if (
        chatRef.current && 
        !chatRef.current.contains(target) && 
        buttonRef.current && 
        !buttonRef.current.contains(target)
      ) {
        if (chatPosition.x !== 0 || chatPosition.y !== 0) {
          setChatPosition({ x: 0, y: 0 });
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, chatPosition]);

  // When opening chat, ensure it starts at its docking origin and medium comfortable size
  const handleOpenChat = () => {
    setChatPosition({ x: 0, y: 0 });
    setIsExpanded(false);
    setIsOpen(true);
  };

  // Close chat and reset to initial compact state
  const handleCloseChat = () => {
    setChatPosition({ x: 0, y: 0 });
    setIsExpanded(false);
    setIsOpen(false);
  };

  // Initialize initial greeting
  useEffect(() => {
    if (!hasInitializedWelcomeRef.current && messages.length === 0) {
      hasInitializedWelcomeRef.current = true;
      const customerName = userProfile?.displayName || user?.displayName;
      let initialGreeting = '';
      
      if (isRtl) {
        initialGreeting = customerName 
          ? `يا هلا فيك يا ${customerName} 👋 بمكتبة الشاطئ الأزرق! شلون أقدر أساعدك اليوم في اختياراتك وتجهيزاتك؟`
          : `يا هلا فيك بمكتبة الشاطئ الأزرق 👋! أنا مساعدك الذكي للتسوق، متصل مباشرة ببيانات ومخزون المتجر لمساعدتك في العثور على أي منتج أو مقاس بدقة.`;
      } else {
        initialGreeting = customerName
          ? `Hello ${customerName} 👋 Welcome to Blue Beach Stationery! How can I help you with your supplies today?`
          : `Hello and welcome to Blue Beach Stationery 👋! I am your smart shopping assistant, connected live to the store catalog.`;
      }

      setMessages([{ role: 'model', content: initialGreeting }]);
    }
  }, [userProfile, user, isRtl]);

  // Smart Mini-Recommendation on Product Page (Debounced, non-intrusive, no duplicate)
  useEffect(() => {
    if (!currentProductHandle) {
      setFloatingRec(null);
      return;
    }

    // Don't show if already recommended in this session
    if (recommendedHandlesRef.current.has(currentProductHandle)) {
      setFloatingRec(null);
      return;
    }

    // Debounce by 2.5 seconds to avoid spamming fast clickers
    const timer = setTimeout(async () => {
      if (isOpen) return; // If chat is already open, do not show floating bubble

      try {
        const res = await fetch('/api/ai-chat/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productHandle: currentProductHandle,
            recentProductHandles: recentHandlesRef.current,
            currentLanguage: isRtl ? 'ar' : 'en'
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.recommendation && data.product) {
            setFloatingRec(data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch recommendation:', err);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentProductHandle, isRtl, isOpen]);

  // When user clicks "[شوف التوصية]", expand it directly into the chat conversation
  const handleAdoptRecommendationIntoChat = () => {
    if (!floatingRec) return;

    const rec = floatingRec;
    setFloatingRec(null);
    recommendedHandlesRef.current.add(rec.product.handle);

    // Open chat at origin in default medium size
    setChatPosition({ x: 0, y: 0 });
    setIsExpanded(false);
    setIsOpen(true);

    // Append to messages stream
    setMessages(prev => [
      ...prev,
      {
        role: 'model',
        content: rec.inChatPrompt,
        productCards: [rec.product]
      }
    ]);
  };

  // Scroll to bottom on updates
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const messagesRef = useRef(messages);
  useEffect(() => { 
    messagesRef.current = messages; 
  }, [messages]);

  // Send message to AI endpoint
  const sendMessageFromInput = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;
    
    if (isSendingRef.current || isLoading) {
      return;
    }
    isSendingRef.current = true;
    setIsLoading(true);

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messagesRef.current, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    if (activeChatAbortRef.current) {
      try { activeChatAbortRef.current.abort(); } catch (_) {}
    }
    const controller = new AbortController();
    activeChatAbortRef.current = controller;

    const clientRequestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let timedOut = false;

    try {
      const timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 35000);

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ 
          requestId: clientRequestId,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          sessionId,
          userId: userProfile?.id || user?.uid,
          userName: userProfile?.displayName || user?.displayName,
          currentProductHandle,
          currentCategoryHandle,
          recentProductHandles: recentHandlesRef.current,
          recommendedProductHandles: Array.from(recommendedHandlesRef.current),
          currentLanguage: isRtl ? 'ar' : 'en'
        })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const serverError = errData.message || (isRtl 
          ? 'عذراً يا الغالي، حدث خطأ بسيط بالاتصال، تفضل اسألني مرة ثانية وسأجاوبك فوراً.'
          : 'Connection error, please ask again.');
        setMessages(prev => [...prev, { role: 'model', content: serverError }]);
        return;
      }

      const data = await res.json().catch(() => ({}));
      const responseText = data.response;
      
      if (responseText) {
        setMessages(prev => [...prev, {
          role: 'model',
          content: responseText,
          productCards: data.productCards
        }]);

        if (data.suggestions && data.suggestions.length > 0) {
          setDynamicSuggestions(data.suggestions);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'model',
          content: isRtl 
            ? 'تفضل بأي استفسار وحاضر أساعدك بكل حب!' 
            : 'How else can I assist you with our stationery catalog?'
        }]);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || activeChatAbortRef.current?.signal.aborted) {
        if (timedOut) {
          setMessages(prev => [...prev, {
            role: 'model',
            content: isRtl ? 'استغرقت الاستجابة وقتاً طويلاً، يرجى إعادة المحاولة.' : 'Request timed out, please try again.'
          }]);
        }
        return;
      }
      console.error('[AI Chat Client Error]:', err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: isRtl ? 'تعذر إرسال الرسالة، يرجى المحاولة مرة أخرى.' : 'Could not send message, please try again.' 
      }]);
    } finally {
      isSendingRef.current = false;
      setIsLoading(false);
      activeChatAbortRef.current = null;
    }
  };

  const sendMessage = () => {
    sendMessageFromInput(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessageFromInput(suggestion);
  };

  // Category-specific quick actions
  const getCategorySuggestions = (cat: string | undefined): string[] => {
    if (!cat) return [];
    const lower = cat.toLowerCase();
    if (lower.includes('bag') || lower.includes('شنط') || lower.includes('حقائب')) {
      return isRtl 
        ? ['للابتدائي', 'للمتوسط', 'شنط خفيفة', 'للكتب الكثيرة', 'أبي الأرخص']
        : ['Elementary', 'Middle School', 'Lightweight', 'High Capacity', 'Lowest Price'];
    }
    if (lower.includes('office') || lower.includes('stationery') || lower.includes('مكتب')) {
      return isRtl
        ? ['ملفات ومنظمات', 'أدوات مكتبية أساسية', 'دفاتر ومذكرات', 'ستاندات مكتب']
        : ['Folders & Binders', 'Office Essentials', 'Notebooks', 'Desk Stands'];
    }
    if (lower.includes('art') || lower.includes('رسم') || lower.includes('لوحات')) {
      return isRtl
        ? ['ألوان وفرش', 'لوحات كانفس', 'ستاندات عرض', 'أدوات هندسية']
        : ['Paints & Brushes', 'Canvas Boards', 'Display Stands', 'Geometry Tools'];
    }
    if (lower.includes('book') || lower.includes('قصص') || lower.includes('كتب')) {
      return isRtl
        ? ['قصص أطفال', 'كتب تعليمية', 'دفاتر تلوين']
        : ['Children Stories', 'Educational Books', 'Coloring Books'];
    }
    return [];
  };

  // General fallback suggestions
  const generalSuggestionsAr = [
    'اقترح لي منتجاً',
    'أبي ستاند لكتاب A4',
    'شنط وأدوات مدرسية',
    'أقلام ودفاتر مميزة',
    'عروض وخصومات اليوم',
    'طرق الدفع والتوصيل'
  ];
  const generalSuggestionsEn = [
    'Recommend a product',
    'Looking for an A4 book stand',
    'School bags & supplies',
    'Premium pens & notebooks',
    'Today\'s special offers',
    'Payment & Delivery'
  ];
  
  const productSuggestionsAr = [
    'شنو تفاصيل ومقاسات المنتج؟',
    'هل متوفر ألوان أو خيارات ثانية؟',
    'أضف هذا المنتج للسلة',
    'اقترح لي منتجات مشابهة'
  ];
  const productSuggestionsEn = [
    'Product details and sizes?',
    'Are other colors available?',
    'Add this product to cart',
    'Suggest similar items'
  ];

  const categorySuggestions = getCategorySuggestions(currentCategoryHandle);

  const suggestions = dynamicSuggestions.length > 0
    ? dynamicSuggestions
    : (currentProductHandle
        ? (isRtl ? productSuggestionsAr : productSuggestionsEn)
        : (categorySuggestions.length > 0 
            ? categorySuggestions 
            : (isRtl ? generalSuggestionsAr : generalSuggestionsEn)));

  if (storeSettings?.aiChatEnabled === false) return null;

  return (
    <>
      {/* Floating Smart Mini-Recommendation Card (Non-intrusive, real data) */}
      {floatingRec && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.94 }}
          className={`fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] sm:bottom-24 ${
            isRtl 
              ? 'left-[max(0.75rem,env(safe-area-inset-left,0.75rem))] sm:left-20' 
              : 'right-[max(0.75rem,env(safe-area-inset-right,0.75rem))] sm:right-20'
          } z-40 bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xl border border-sky-100 dark:border-slate-800 w-[min(320px,calc(100vw-24px))] max-w-[calc(100vw-24px)]`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Header of the recommendation */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">
                {isRtl ? 'توصية ذكية مبنية على المنتج' : 'Smart Recommendation'}
              </span>
            </div>
            <button
              onClick={() => {
                recommendedHandlesRef.current.add(floatingRec.product.handle);
                setFloatingRec(null);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full transition-colors cursor-pointer"
              aria-label={isRtl ? 'إغلاق' : 'Close'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Thumbnail & Rationale */}
          <div className="flex gap-2.5 items-start">
            <img
              src={floatingRec.product.images?.[0]?.src || 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png'}
              alt={translateProductTitle(floatingRec.product)}
              className="w-12 h-12 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-1 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h5 className="text-[11px] font-bold text-slate-800 dark:text-white truncate">
                {translateProductTitle(floatingRec.product)}
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                {floatingRec.recommendation}
              </p>
            </div>
          </div>

          {/* CTA: Expands into Chat */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black text-sky-700 dark:text-sky-400">
              {formatPrice(floatingRec.product.price)}
            </span>
            <button
              onClick={handleAdoptRecommendationIntoChat}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>{isRtl ? 'شوف التوصية بالشات' : 'View in Chat'}</span>
              {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </motion.div>
      )}

      {/* Floating Open Chat Button */}
      <button
        ref={buttonRef}
        onClick={handleOpenChat}
        className={`fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] md:bottom-6 ${
          isRtl 
            ? 'left-[max(0.75rem,env(safe-area-inset-left,0.75rem))] md:left-6' 
            : 'right-[max(0.75rem,env(safe-area-inset-right,0.75rem))] md:right-6'
        } z-50 bg-sky-700 hover:bg-sky-800 text-white p-3.5 min-w-[52px] min-h-[52px] rounded-full shadow-2xl ring-2 ring-white/80 transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center touch-manipulation ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label={isRtl ? 'فتح المحادثة مع المساعد الذكي' : 'Open Shopping Assistant'}
        title={isRtl ? 'مساعد التسوق الذكي' : 'Smart Shopping Assistant'}
      >
        <MessageCircle className="w-6 h-6" />
        {/* Subtle breathing live sync indicator */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white dark:border-slate-900"></span>
        </span>
      </button>

      {/* Main Floating Shopping Assistant Card */}
      {isOpen && (
        <motion.div 
          ref={chatRef}
          drag={!isMobile}
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0.05}
          dragConstraints={dragBounds}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1 
          }}
          transition={{ type: "spring", damping: 26, stiffness: 360 }}
          className={`fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] sm:bottom-24 ${
            isRtl 
              ? 'left-[max(0.75rem,env(safe-area-inset-left,0.75rem))] sm:left-6' 
              : 'right-[max(0.75rem,env(safe-area-inset-right,0.75rem))] sm:right-6'
          } z-[45] transition-[width,height] duration-200 ease-out flex flex-col bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden ${
            isExpanded
              ? 'w-[calc(100vw-24px)] max-w-[420px] sm:w-[440px] sm:max-w-[calc(100vw-32px)] h-[calc(100dvh-95px)] max-h-[calc(100dvh-85px)] sm:h-[600px] sm:max-h-[calc(100vh-100px)]'
              : 'w-[calc(100vw-24px)] max-w-[360px] sm:w-[360px] sm:max-w-[calc(100vw-32px)] h-[460px] max-h-[calc(100dvh-130px)] sm:h-[480px] sm:max-h-[calc(100vh-120px)]'
          }`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Header (Drag area on desktop, controls and status) */}
          <div 
            onPointerDown={(e) => {
              if (!isMobile) dragControls.start(e);
            }}
            className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 text-white px-3.5 py-3 flex items-center justify-between shadow-sm select-none sm:cursor-grab sm:active:cursor-grabbing"
          >
            <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-xs shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5 truncate">
                  <span className="truncate">{isRtl ? 'مساعد التسوق الذكي' : 'Smart Shopping Assistant'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <p className="text-[10px] text-sky-100 opacity-90 truncate">
                    {isRtl ? 'متصل بقاعدة بيانات المتجر' : 'Connected to Store Truth'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              {/* Drag Handle on desktop */}
              <div
                onPointerDown={(e) => {
                  if (!isMobile) dragControls.start(e);
                }}
                className="hidden sm:flex items-center justify-center p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 cursor-grab active:cursor-grabbing transition-colors"
                title={isRtl ? 'سحب وتحريك النافذة' : 'Drag window'}
              >
                <GripHorizontal className="w-4 h-4" />
              </div>

              {/* Expand / Minimize Toggle */}
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? (isRtl ? 'استعادة الحجم الطبيعي' : 'Restore normal size') : (isRtl ? 'تكبير النافذة' : 'Expand window')}
                aria-label={isExpanded ? (isRtl ? 'استعادة الحجم الطبيعي' : 'Restore normal size') : (isRtl ? 'تكبير النافذة' : 'Expand window')}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={handleCloseChat}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                aria-label={isRtl ? 'إغلاق المحادثة' : 'Close chat'}
                title={isRtl ? 'إغلاق' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2.5 items-start`}>
                  {msg.role === 'model' && (
                    <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap rounded-2xl shadow-xs ${
                    msg.role === 'user' 
                      ? 'bg-sky-600 text-white rounded-br-xs font-medium' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/60 rounded-bl-xs'
                  }`}>
                    {msg.content}
                  </div>
                </div>

                {/* In-Chat Interactive Product Cards Carousel */}
                {msg.productCards && msg.productCards.length > 0 && (
                  <div className={`pt-1 pb-2 ${isRtl ? 'mr-9' : 'ml-9'}`}>
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {isRtl ? 'المنتجات المقترحة:' : 'Recommended Products:'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {msg.productCards.length} {isRtl ? 'منتجات' : 'items'}
                      </span>
                    </div>

                    <div className="flex gap-2.5 overflow-x-auto pb-2 pt-0.5 px-0.5 snap-x scrollbar-thin">
                      {msg.productCards.map((p) => (
                        <div key={p.id} className="snap-center">
                          <InChatProductCard 
                            product={p} 
                            onNavigate={onNavigate} 
                            onCloseChat={handleCloseChat}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Loading visual state */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start gap-2.5 items-center"
              >
                <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 px-3.5 py-2.5 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-xs font-medium">
                    {isRtl ? 'جاري فحص قاعدة بيانات المتجر...' : 'Querying store database...'}
                  </span>
                </div>
              </motion.div>
            )}
            
            {/* Contextual Quick Actions (Suggestions) */}
            {!isLoading && suggestions.length > 0 && (
              <div className={`pt-2 ${isRtl ? 'pr-9' : 'pl-9'} space-y-1.5`}>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-sky-500" />
                  <span>{isRtl ? 'خيارات سريعة مقترحة' : 'Quick Actions'}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 bg-white hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 rounded-full text-[11px] font-medium shadow-2xs hover:shadow-xs transition-all cursor-pointer text-start active:scale-95"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Text Input Area (Strictly text only, no mic/sound) */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    if (!isLoading && !isSendingRef.current && inputValue.trim()) {
                      sendMessage();
                    }
                  }
                }}
                placeholder={isRtl ? 'اكتب استفسارك أو ابحث عن منتج...' : 'Type your inquiry or search products...'}
                className="flex-1 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className={`p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isLoading || !inputValue.trim() 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                    : 'bg-sky-600 text-white hover:bg-sky-700 shadow-xs active:scale-95'
                }`}
                title={isRtl ? 'إرسال' : 'Send'}
                aria-label={isRtl ? 'إرسال الرسالة' : 'Send message'}
              >
                <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};
