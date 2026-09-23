import React, { useState, useRef } from 'react';
import { Disc, Sparkles, Trophy, RotateCw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface WheelGameModuleProps {
  game: any;
  onGameComplete: (score: number, metadata?: any) => Promise<any>;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const WHEEL_SLICES = [
  { label: '50 XP', xp: 50, color: '#0284c7' },
  { label: '80 XP', xp: 80, color: '#f59e0b' },
  { label: '100 XP', xp: 100, color: '#10b981' },
  { label: '60 XP', xp: 60, color: '#6366f1' },
  { label: '120 XP', xp: 120, color: '#ec4899' },
  { label: '70 XP', xp: 70, color: '#8b5cf6' },
  { label: '150 XP', xp: 150, color: '#ef4444' },
  { label: '90 XP', xp: 90, color: '#14b8a6' },
];

export const WheelGameModule: React.FC<WheelGameModuleProps> = ({
  game,
  onGameComplete,
  onClose,
  showToast,
}) => {
  const { dir } = useLanguage();
  const [spinning, setSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [result, setResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSpin = async () => {
    if (spinning || submitting) return;
    setSpinning(true);
    setResult(null);

    // Pick a random slice index
    const selectedIdx = Math.floor(Math.random() * WHEEL_SLICES.length);
    const sliceAngle = 360 / WHEEL_SLICES.length;
    // Calculate final rotation so selected slice aligns with top pointer (270 deg)
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const targetDegree = rotation + (extraRounds * 360) + (360 - (selectedIdx * sliceAngle)) - (sliceAngle / 2);

    setRotation(targetDegree);

    setTimeout(async () => {
      setSpinning(false);
      const wonSlice = WHEEL_SLICES[selectedIdx];
      setSubmitting(true);
      try {
        const res = await onGameComplete(wonSlice.xp, { sliceIndex: selectedIdx, sliceLabel: wonSlice.label });
        if (res && res.success) {
          setResult({
            xp: res.xpAwarded ?? wonSlice.xp,
            message: `تهانينا! حصلت على ${res.xpAwarded ?? wonSlice.xp} نقاط XP!`,
          });
        } else {
          showToast(res?.error || 'حدث خطأ أثناء احتساب النقاط', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'فشل تسليم نتيجة الجولة', 'error');
      } finally {
        setSubmitting(false);
      }
    }, 4000);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full mx-auto shadow-2xl border border-slate-800 text-center relative overflow-hidden" dir={dir}>
      {/* Background glow */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Disc className="w-6 h-6 text-amber-400 animate-spin-slow" />
          <h2 className="text-xl font-black text-white">{game?.nameAr || 'عجلة الحظ'}</h2>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          إغلاق
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-6">
        أدر العجلة واكسب نقاط XP لرفع مستوى حسابك والمنافسة في لائحة متصدرين الموسم!
      </p>

      {/* Wheel Visual Container */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-4 flex items-center justify-center">
        {/* Top Pointer */}
        <div className="absolute -top-3 z-30 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-md" />

        {/* Outer Ring */}
        <div className="w-full h-full rounded-full border-8 border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.3)] relative overflow-hidden flex items-center justify-center">
          {/* Rotating SVG Wheel */}
          <div
            className="w-full h-full rounded-full transition-transform ease-out duration-[4000ms]"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {WHEEL_SLICES.map((slice, i) => {
                const angle = 360 / WHEEL_SLICES.length;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;

                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                const textAngle = startAngle + angle / 2;
                const textX = 50 + 32 * Math.cos((Math.PI * textAngle) / 180);
                const textY = 50 + 32 * Math.sin((Math.PI * textAngle) / 180);

                return (
                  <g key={i}>
                    <path
                      d={`M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`}
                      fill={slice.color}
                      stroke="#0f172a"
                      strokeWidth="0.8"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="#ffffff"
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                    >
                      {slice.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Knob */}
          <div className="absolute w-14 h-14 rounded-full bg-slate-900 border-4 border-amber-400 flex items-center justify-center z-20 shadow-lg">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="my-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-center gap-2 font-black text-base text-amber-300 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>+{result.xp} XP!</span>
          </div>
          <p className="text-xs font-bold">{result.message}</p>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={handleSpin}
          disabled={spinning || submitting}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {spinning ? (
            <>
              <RotateCw className="w-5 h-5 animate-spin" />
              <span>جاري دوران العجلة...</span>
            </>
          ) : submitting ? (
            <span>جاري تسجيل النقاط...</span>
          ) : (
            <>
              <Disc className="w-5 h-5" />
              <span>أدر العجلة الآن</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
