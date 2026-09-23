import React, { useState, useEffect } from 'react';
import { HelpCircle, Timer, CheckCircle2, XCircle, Trophy, ArrowRight, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface QuizGameModuleProps {
  game: any;
  onGameComplete: (score: number, metadata?: any) => Promise<any>;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const QUIZ_QUESTIONS = [
  {
    question: 'أي من التالية تُستخدم لرسم زوايا دقيقة ومستقيمة؟',
    options: ['المنقلة والمسطرة', 'الفرجار فقط', 'الممحاة', 'قلم الرصاص HB'],
    correctIndex: 0,
  },
  {
    question: 'ما هو سمك سن القلم المفضل عادة للكتابة الدقيقة جداً؟',
    options: ['0.38 مم', '1.0 مم', '2.0 مم', '0.7 مم'],
    correctIndex: 0,
  },
  {
    question: 'ما هو حجم الورق القياسي المستخدم للطباعة والدفاتر المدرسية اليومية؟',
    options: ['A4', 'A3', 'A1', 'A5'],
    correctIndex: 0,
  },
  {
    question: 'ما هي درجة تظليل قلم الرصاص الأكثر توازناً للرسم والكتابة؟',
    options: ['2B', '6B', '4H', 'HB'],
    correctIndex: 3,
  },
  {
    question: 'ما نوع الأوراق التي تمنع تسرب حبر أقلام التظليل (Highlighters)؟',
    options: ['ورق ثقيل 100 جم/م2', 'ورق خفيف 60 جم/م2', 'ورق شفاف', 'ورق صحف'],
    correctIndex: 0,
  },
];

export const QuizGameModule: React.FC<QuizGameModuleProps> = ({
  game,
  onGameComplete,
  onClose,
  showToast,
}) => {
  const { dir } = useLanguage();
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);

  const currentQ = QUIZ_QUESTIONS[currentQuestionIdx];

  useEffect(() => {
    if (isFinished || isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIdx, isAnswered, isFinished]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      nextQuestion();
    }, 1200);
  };

  const nextQuestion = () => {
    if (currentQuestionIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsFinished(true);
    setSubmitting(true);
    const calculatedXp = Math.round(((score + (selectedOption === currentQ?.correctIndex ? 1 : 0)) / QUIZ_QUESTIONS.length) * (game?.xpPerAction || 80));
    try {
      const res = await onGameComplete(calculatedXp, {
        correctAnswers: score,
        totalQuestions: QUIZ_QUESTIONS.length,
      });
      if (res && res.success) {
        setEarnedXp(res.xpAwarded ?? calculatedXp);
      } else {
        showToast(res?.error || 'حدث خطأ أثناء احتساب نقاط التحدي', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تسليم نتيجة التحدي', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full mx-auto shadow-2xl border border-slate-800 text-right relative overflow-hidden" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-sky-400" />
          <h2 className="text-xl font-black text-white">{game?.nameAr || 'تحدي المعلومات'}</h2>
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
          {/* Progress & Timer Bar */}
          <div className="flex items-center justify-between mb-4 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-xs font-extrabold text-sky-400">
              السؤال {currentQuestionIdx + 1} من {QUIZ_QUESTIONS.length}
            </span>
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm">
              <Timer className="w-4 h-4 animate-pulse" />
              <span>{timeLeft} ثانية</span>
            </div>
          </div>

          {/* Question Box */}
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/80 mb-6">
            <h3 className="font-extrabold text-base text-slate-100 leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQ.options.map((opt, idx) => {
              let optStyle = 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750 hover:border-sky-500';
              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  optStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-black';
                } else if (idx === selectedOption) {
                  optStyle = 'bg-rose-950 border-rose-500 text-rose-200';
                } else {
                  optStyle = 'bg-slate-800/40 border-slate-800 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl border text-right font-bold text-sm transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && idx === currentQ.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* Finished Screen */
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 mb-2">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <h3 className="text-2xl font-black text-white">أحسنت! أتممت التحدي 🏆</h3>
          <p className="text-xs text-slate-400">
            أجبت على {score} من أصل {QUIZ_QUESTIONS.length} أسئلة بشكل صحيح.
          </p>

          <div className="p-4 rounded-2xl bg-slate-800 border border-amber-400/30 max-w-xs mx-auto">
            <span className="text-xs text-slate-400 block mb-1">النقاط التي كسبتها:</span>
            <span className="text-2xl font-black text-amber-400">
              +{earnedXp ?? Math.round((score / QUIZ_QUESTIONS.length) * 80)} XP
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer mt-4"
          >
            الانتقال للائحة المتصدرين
          </button>
        </div>
      )}
    </div>
  );
};
