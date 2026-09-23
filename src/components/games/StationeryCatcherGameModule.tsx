import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Trophy, Play, Pause, RotateCw, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface StationeryCatcherGameModuleProps {
  game: any;
  onGameComplete: (score: number, metadata?: any) => Promise<any>;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ITEMS_TYPES = [
  { icon: '🖊️', pts: 10, name: 'قلم حبر' },
  { icon: '📓', pts: 15, name: 'دفتر' },
  { icon: '✂️', pts: 20, name: 'مقص' },
  { icon: '🎨', pts: 25, name: 'ألوان' },
  { icon: '💣', pts: -15, name: 'قنبلة' },
];

export const StationeryCatcherGameModule: React.FC<StationeryCatcherGameModuleProps> = ({
  game,
  onGameComplete,
  onClose,
  showToast,
}) => {
  const { dir } = useLanguage();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [basketX, setBasketX] = useState<number>(50); // percentage 0-100
  const [fallingItems, setFallingItems] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Start game loop
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(15);
    setFallingItems([]);
    setIsFinished(false);
    setEarnedXp(null);
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, isFinished]);

  // Spawn falling items
  useEffect(() => {
    if (!isPlaying || isFinished) return;
    const spawner = setInterval(() => {
      const randomType = ITEMS_TYPES[Math.floor(Math.random() * ITEMS_TYPES.length)];
      const newItem = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10, // 10% - 90%
        y: 0,
        type: randomType,
      };
      setFallingItems(prev => [...prev.slice(-8), newItem]);
    }, 600);
    return () => clearInterval(spawner);
  }, [isPlaying, isFinished]);

  // Animation frame for falling items and collision detection with basket
  useEffect(() => {
    if (!isPlaying || isFinished) return;
    const anim = requestAnimationFrame(() => {
      setFallingItems(prev => {
        const next: any[] = [];
        prev.forEach(item => {
          const newY = item.y + 3.5;
          // Check collision near basket (y > 80% and x near basketX)
          if (newY >= 80 && newY <= 92 && Math.abs(item.x - basketX) < 15) {
            setScore(s => Math.max(0, s + item.type.pts));
          } else if (newY < 100) {
            next.push({ ...item, y: newY });
          }
        });
        return next;
      });
    });
    return () => cancelAnimationFrame(anim);
  }, [fallingItems, isPlaying, isFinished, basketX]);

  // Touch & Mouse Movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isPlaying) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(10, Math.min(90, x)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isPlaying) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(10, Math.min(90, x)));
  };

  const finishGame = async () => {
    setIsPlaying(false);
    setIsFinished(true);
    setSubmitting(true);

    const calculatedXp = Math.min(200, Math.max(30, Math.round(score * 1.2)));

    try {
      const res = await onGameComplete(calculatedXp, { caughtScore: score });
      if (res && res.success) {
        setEarnedXp(res.xpAwarded ?? calculatedXp);
      } else {
        showToast(res?.error || 'حدث خطأ أثناء احتساب نقاط اللعبة', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تسليم نتيجة اللعبة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full mx-auto shadow-2xl border border-slate-800 text-right relative overflow-hidden" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-pink-400" />
          <h2 className="text-xl font-black text-white">{game?.nameAr || 'صائد القرطاسية'}</h2>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          إغلاق
        </button>
      </div>

      {!isPlaying && !isFinished ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-20 h-20 rounded-full bg-pink-500/20 border-2 border-pink-400 flex items-center justify-center mx-auto text-pink-400 mb-2">
            <ShoppingBag className="w-10 h-10 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-white">التقط أكبر قدر من أدوات القرطاسية!</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            حرك السلة يميناً ويساراً لالتقاط الأقلام والدفاتر وتجنب القنابل خلال 15 ثانية!
          </p>
          <button
            onClick={startGame}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black text-base rounded-2xl shadow-xl transition-all cursor-pointer mt-4"
          >
            ابدأ صيد القرطاسية الآن 🚀
          </button>
        </div>
      ) : isPlaying ? (
        <>
          {/* Top Info */}
          <div className="flex items-center justify-between mb-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-xs font-bold text-slate-300">
              النقاط: <strong className="text-pink-400 text-base">{score}</strong>
            </span>
            <span className="text-xs font-bold text-amber-400">
              الوقت المتبقي: {timeLeft}s
            </span>
          </div>

          {/* Game Canvas Container */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative w-full h-72 bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl border-2 border-pink-500/30 overflow-hidden touch-none cursor-crosshair select-none"
          >
            {/* Falling Items */}
            {fallingItems.map(item => (
              <div
                key={item.id}
                className="absolute text-2xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                {item.type.icon}
              </div>
            ))}

            {/* Catcher Basket */}
            <div
              className="absolute bottom-2 h-10 w-20 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 border-2 border-amber-300 shadow-[0_0_15px_rgba(236,72,153,0.5)] flex items-center justify-center text-xl transform -translate-x-1/2 transition-all duration-75"
              style={{ left: `${basketX}%` }}
            >
              🧺
            </div>
          </div>
        </>
      ) : (
        /* Finished State */
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-pink-500/20 border-2 border-pink-400 flex items-center justify-center mx-auto text-pink-400 mb-2">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <h3 className="text-2xl font-black text-white">انتهى الجولة! صيد محترف 🎯</h3>
          <p className="text-xs text-slate-400">
            جمعت <strong>{score}</strong> نقطة من القرطاسية.
          </p>

          <div className="p-4 rounded-2xl bg-slate-800 border border-pink-400/30 max-w-xs mx-auto">
            <span className="text-xs text-slate-400 block mb-1">النقاط المكتسبة:</span>
            <span className="text-2xl font-black text-pink-400">
              +{earnedXp ?? score} XP
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-pink-600 hover:bg-pink-500 text-white font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer mt-4"
          >
            الانتقال للائحة المتصدرين
          </button>
        </div>
      )}
    </div>
  );
};
