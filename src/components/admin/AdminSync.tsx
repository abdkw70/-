import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  Clock,
  Zap,
  Tag,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ImporterStats } from '../../types';
import * as api from '../../lib/api';

interface AdminSyncProps {
  importerStats: ImporterStats | null;
  onRefreshStats: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminSync: React.FC<AdminSyncProps> = ({
  importerStats,
  onRefreshStats,
  showToast,
}) => {
  const [selectedMode, setSelectedMode] = useState<'sync' | 'check' | 'full'>('sync');
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const isRunning = importerStats?.status === 'running';

  const handleStartSync = async () => {
    setIsStarting(true);
    try {
      const res = await api.startImporter(selectedMode);
      if (res.success) {
        showToast(res.message, 'success');
        onRefreshStats();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تشغيل محرك المزامنة', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopSync = async () => {
    setIsStopping(true);
    try {
      const res = await api.stopImporter();
      if (res.success) {
        showToast(res.message, 'info');
        onRefreshStats();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إيقاف المزامنة', 'error');
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>محطة المزامنة والاستيراد</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                isRunning
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{isRunning ? 'المحرك يعمل حالياً...' : 'المحرك في وضع الاستعداد'}</span>
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مزامنة المنتجات وتحديث الأسعار والمخزون تلقائياً بأمان تام مع الحفاظ على المنتجات الـ443
          </p>
        </div>

        <button
          onClick={onRefreshStats}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Control Panel Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Mode Selector */}
          <div className="space-y-2 flex-1">
            <label className="block text-xs font-bold text-white">اختر وضع المزامنة:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => !isRunning && setSelectedMode('sync')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedMode === 'sync'
                    ? 'bg-sky-950/60 border-sky-500 text-white shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Zap className="w-4 h-4 text-sky-400" />
                  <span>تحديث الأسعار والمخزون</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  تحديث سريع ودقيق للأسعار الحالية دون المساس بهيكل المتجر.
                </p>
              </div>

              <div
                onClick={() => !isRunning && setSelectedMode('check')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedMode === 'check'
                    ? 'bg-sky-950/60 border-sky-500 text-white shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>فحص وإضافة المنتجات الجديدة</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  البحث عن أي منتجات جديدة وإضافتها دون تعديل المنتجات السابقة.
                </p>
              </div>

              <div
                onClick={() => !isRunning && setSelectedMode('full')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedMode === 'full'
                    ? 'bg-sky-950/60 border-sky-500 text-white shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  <span>مزامنة شاملة متكاملة</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  فحص كامل وشامل لجميع الصفحات والصور والأسعار.
                </p>
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="shrink-0 flex items-center gap-3">
            {isRunning ? (
              <button
                onClick={handleStopSync}
                disabled={isStopping}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-rose-600/25 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Square className="w-4 h-4" />
                <span>{isStopping ? 'جاري الإيقاف...' : 'إيقاف المزامنة فوراً'}</span>
              </button>
            ) : (
              <button
                onClick={handleStartSync}
                disabled={isStarting}
                className="px-6 py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-sky-600/25 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4" />
                <span>{isStarting ? 'جاري الإطلاق...' : 'بدء تشغيل المزامنة'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Progress bar if running */}
        {isRunning && (
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-sky-500/30">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>جاري استيراد وتحديث المنتجات...</span>
              </span>
              <span className="font-mono text-slate-400">
                {importerStats?.totalDiscovered ? `${importerStats.totalImported} / ${importerStats.totalDiscovered}` : `${importerStats?.totalImported || 0} تم استيرادها`}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{
                  width: importerStats?.totalDiscovered
                    ? `${Math.min(100, Math.round((importerStats.totalImported / importerStats.totalDiscovered) * 100))}%`
                    : '100%',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <div className="text-[11px] text-slate-400">إجمالي المكتشف</div>
          <div className="text-xl font-bold text-white">
            {importerStats?.totalDiscovered ?? 443}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <div className="text-[11px] text-slate-400">تم الاستيراد</div>
          <div className="text-xl font-bold text-emerald-400">
            {importerStats?.totalImported ?? 443}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <div className="text-[11px] text-slate-400">الصور المحفوظة</div>
          <div className="text-xl font-bold text-sky-400">
            {importerStats?.totalImages ?? 443}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <div className="text-[11px] text-slate-400">عروض الخصم</div>
          <div className="text-xl font-bold text-rose-400">
            {importerStats?.discountsFound ?? 0}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <div className="text-[11px] text-slate-400">الأسعار المستخرجة</div>
          <div className="text-xl font-bold text-indigo-400">
            {importerStats?.pricesExtracted ?? 443}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <div className="text-[11px] text-slate-400">حالات الفشل</div>
          <div className="text-xl font-bold text-slate-400">
            {importerStats?.totalFailed ?? 0}
          </div>
        </div>
      </div>

      {/* Live Logs Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>سجل عمليات المزامنة المباشر</span>
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">
            {importerStats?.lastSyncAt ? `آخر مزامنة: ${new Date(importerStats.lastSyncAt).toLocaleString('ar-KW')}` : 'لم تتم مزامنة مؤخراً'}
          </span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-72 overflow-y-auto space-y-1.5 font-mono text-xs text-right">
          {(!importerStats?.logs || importerStats.logs.length === 0) ? (
            <div className="text-slate-600 text-center py-6 text-xs">
              سجل العمليات فارغ حالياً. اضغط على "بدء تشغيل المزامنة" لمتابعة الأنشطة.
            </div>
          ) : (
            importerStats.logs.slice().reverse().map((log, i) => (
              <div key={i} className="text-slate-300 py-1 border-b border-slate-900 text-[11px]">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
