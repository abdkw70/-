import React, { useState, useEffect } from 'react';
import { Layers, Trophy, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MemoryCardsGameModuleProps {
  game: any;
  onGameComplete: (score: number, metadata?: any) => Promise<any>;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const CARD_ITEMS = [
  { id: 'pen', icon: '🖊️', name: 'قلم حبر' },
  { id: 'notebook', icon: '📓', name: 'دفتر ملاحظات' },
  { id: 'scissors', icon: '✂️', name: 'مقص' },
  { id: 'backpack', icon: '🎒', name: 'حقيبة مدرسية' },
  { id: 'ruler', icon: '📐', name: 'مسطرة هندسية' },
  { id: 'crayon', icon: '🖍️', name: 'ألوان شمعية' },
];

export const MemoryCardsGameModule: React.FC<MemoryCardsGameModuleProps> = ({
  game,
  onGameComplete,
  onClose,
  showToast,
}) => {
  const { dir } = useLanguage();
  const [cards, setCards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);

  // Initialize and shuffle cards
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const deck = [...CARD_ITEMS, ...CARD_ITEMS].map((item, idx) => ({
      uid: idx,
      itemId: item.id,
      icon: item.icon,
      name: item.name,
    }));
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setIsFinished(false);
    setEarnedXp(null);
  };

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index)) return;
    const clickedCard = cards[index];
    if (matchedPairs.includes(clickedCard.itemId)) return;

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.itemId === secondCard.itemId) {
        // Match found
        const newMatches = [...matchedPairs, firstCard.itemId];
        setMatchedPairs(newMatches);
        setFlippedCards([]);

        if (newMatches.length === CARD_ITEMS.length) {
          handleWin(moves + 1);
        }
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleWin = async (totalMoves: number) => {
    setIsFinished(true);
    setSubmitting(true);
    // Fewer moves = higher XP
    const baseXp = game?.xpPerAction || 100;
    const bonus = Math.max(0, 30 - totalMoves) * 2;
    const finalXp = baseXp + bonus;

    try {
      const res = await onGameComplete(finalXp, { moves: totalMoves });
      if (res && res.success) {
        setEarnedXp(res.xpAwarded ?? finalXp);
      } else {
        showToast(res?.error || 'حدث خطأ أثناء احتساب النقاط', 'error');
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
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-black text-white">{game?.nameAr || 'لعبة الذاكرة'}</h2>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          إغلاق
        </button>
      </div>

      {!isFinished ? (
        <>
          <div className="flex items-center justify-between mb-4 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-xs font-bold text-slate-300">
              عدد الحركات: <strong className="text-amber-400">{moves}</strong>
            </span>
            <span className="text-xs font-bold text-emerald-400">
              الأزواج المكتشفة: {matchedPairs.length} / {CARD_ITEMS.length}
            </span>
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 my-4">
            {cards.map((card, idx) => {
              const isFlipped = flippedCards.includes(idx) || matchedPairs.includes(card.itemId);
              const isMatched = matchedPairs.includes(card.itemId);

              return (
                <button
                  key={card.uid}
                  onClick={() => handleCardClick(idx)}
                  className={`h-20 sm:h-24 rounded-2xl border flex items-center justify-center text-2xl transition-all transform duration-300 cursor-pointer ${
                    isFlipped
                      ? isMatched
                        ? 'bg-emerald-950/80 border-emerald-500 scale-95 opacity-90'
                        : 'bg-indigo-900 border-indigo-400 rotate-y-180'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
                  }`}
                >
                  {isFlipped ? (
                    <span className="animate-in zoom-in duration-200">{card.icon}</span>
                  ) : (
                    <Layers className="w-6 h-6 text-slate-600" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center mx-auto text-indigo-400 mb-2">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <h3 className="text-2xl font-black text-white">ممتاز! أكملت مطابقة الذاكرة 🧠</h3>
          <p className="text-xs text-slate-400">
            أنهيت مطابقة جميع الأوراق في <strong>{moves}</strong> حركة فقط.
          </p>

          <div className="p-4 rounded-2xl bg-slate-800 border border-indigo-400/30 max-w-xs mx-auto">
            <span className="text-xs text-slate-400 block mb-1">النقاط المكتسبة:</span>
            <span className="text-2xl font-black text-indigo-400">
              +{earnedXp ?? 100} XP
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer mt-4"
          >
            الانتقال للائحة المتصدرين
          </button>
        </div>
      )}
    </div>
  );
};
