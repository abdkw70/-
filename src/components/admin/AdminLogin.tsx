import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, ArrowLeft, Store } from 'lucide-react';
import * as api from '../../lib/api';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToStore }) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('يرجى إدخال رمز الدخول');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await api.verifyAdminPasscode(passcode.trim());
      if (res.success) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'رمز الدخول غير صحيح، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'clear') {
      setPasscode('');
      setError('');
    } else if (val === 'backspace') {
      setPasscode(prev => prev.slice(0, -1));
      setError('');
    } else if (passcode.length < 8) {
      setPasscode(prev => prev + val);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Store button */}
      <button
        onClick={onBackToStore}
        className="absolute top-6 right-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl transition-all hover:bg-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>العودة للمتجر</span>
      </button>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative z-10">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-sky-600/20">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              مركز التحكم والإدارة
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              مكتبة الشاطئ الازرق | BLUE BEACH STATIONERY
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-sky-950/60 border border-sky-800/50 text-sky-400 text-[11px] px-3 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>منطقة وصول محمية ومقيدة للمشرفين فقط</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              رمز الدخول السري (Passcode)
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={e => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="أدخل رمز الدخول..."
                className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-center text-lg font-bold tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 transition-colors"
                title={showPasscode ? 'إخفاء' : 'إظهار'}
              >
                {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-400 text-center font-medium animate-in fade-in">
                {error}
              </p>
            )}
          </div>

          {/* Quick numeric pin-pad for easy touchscreen/mobile access */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="py-3 bg-slate-800/60 hover:bg-slate-700 text-white font-bold text-base rounded-xl transition-all active:scale-95 border border-slate-700/50"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeypadPress('clear')}
              className="py-3 bg-slate-800/30 hover:bg-rose-950/40 text-rose-400 font-semibold text-xs rounded-xl transition-all active:scale-95 border border-slate-800"
            >
              مسح
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-3 bg-slate-800/60 hover:bg-slate-700 text-white font-bold text-base rounded-xl transition-all active:scale-95 border border-slate-700/50"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('backspace')}
              className="py-3 bg-slate-800/30 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs rounded-xl transition-all active:scale-95 border border-slate-800"
            >
              ⌫
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !passcode}
            className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-sky-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>تسجيل الدخول إلى مركز التحكم</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          نظام إدارة متجر مكتبة الشاطئ الازرق المتكامل v2.0
        </div>
      </div>
    </div>
  );
};
