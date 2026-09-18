import React, { useState, useEffect } from 'react';
import {
  Gift,
  Sparkles,
  Trophy,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Sliders,
  Award,
  Flame,
  Users,
  Tv,
  Gamepad2,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Percent,
  Check,
  Palette,
  Volume2,
  Zap,
  Target,
  Layers,
  Compass,
  Search,
  Filter,
  RotateCw,
  RefreshCw,
  ShoppingBag,
  Info,
  CheckCheck,
} from 'lucide-react';
import * as api from '../../lib/api';
import { VisualPuzzleRenderer } from '../freeChallenge/VisualPuzzleRenderer';
import { LocalizedInput } from './LocalizedInput';

export const AdminFreeChallenge: React.FC = () => {
  const [subTab, setSubTab] = useState<'games' | 'wheel' | 'settings' | 'ticker' | 'puzzles' | 'analytics' | 'security'>('games');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Search & Filters
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [gameStatusFilter, setGameStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [gamePlacementFilter, setGamePlacementFilter] = useState<string>('all');
  const [puzzleSearchQuery, setPuzzleSearchQuery] = useState('');
  const [puzzleFilterType, setPuzzleFilterType] = useState<string>('all');

  // 10 Games Framework State
  const [games, setGames] = useState<any[]>([]);
  const [selectedGameForEdit, setSelectedGameForEdit] = useState<any | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  // Wheel State (Dedicated & Comprehensive)
  const [wheelSettings, setWheelSettings] = useState<{
    enabled: boolean;
    slices: number[];
    probabilities: Record<number, number>;
    durationMinutes: number;
    minCartValue: number;
    maxDiscountKwd: number;
    title: string;
    description: string;
  }>({
    enabled: true,
    slices: [5, 10, 15, 20, 25],
    probabilities: { 5: 40, 10: 30, 15: 20, 20: 8, 25: 2 },
    durationMinutes: 10,
    minCartValue: 1.0,
    maxDiscountKwd: 5.0,
    title: 'تعبك ماراح عالفاضي \n لف العجله وشوف حضك',
    description: 'نظام المكافآت يمنحك خصماً فورياً حقيقياً على سلتك تقديراً لمشاركتك المتميزة!',
  });
  const [newSliceValue, setNewSliceValue] = useState<number>(5);
  const [newSliceProb, setNewSliceProb] = useState<number>(20);

  // Ticker State
  const [tickerSettings, setTickerSettings] = useState<any>({
    enabled: true,
    speed: 'normal',
    intervalSeconds: 4,
    speedSeconds: 25,
    bgColor: 'from-slate-950 via-amber-950/40 to-slate-950',
    textColor: 'text-amber-300',
    backgroundColor: '#0f172a',
    showAvatar: true,
    showPrizeAmount: true,
    showTimestamp: true,
    customPrefixText: '🎉 مبروك للفائزين الجدد بالتحدي:',
    customItems: [
      '🔥 تحدى سرعتك وذكاءك الآن في 10 ألعاب حصرية واربح كوبونات خصم إضافية لطلبك!',
      '🚚 توصيل سريع لجميع مناطق ومحافظات دولة الكويت خلال 24 ساعة فقط',
      '🎁 فائزون جدد كل ساعة بجوائز فورية وكوبونات خصم نقدية',
    ],
  });
  const [newTickerText, setNewTickerText] = useState('');

  // Settings State
  const [settings, setSettings] = useState<any>({
    gameEnabled: true,
    maxCartValue: 15,
    dailyAttemptsLimit: 2,
    puzzlesPerChallenge: 4,
    puzzleDurationSeconds: 8,
    challengeDiscountEnabled: true,
    challengeWinDiscountPercentage: 25,
    freeCartEnabled: true,
    shippingPolicy: 'standard',
    discountWheelEnabled: true,
    discountWheelValues: [10, 15, 20, 25, 30],
    discountDurationMinutes: 10,
    mysteryBoxEnabled: true,
    mysteryBoxMinSpend: 5,
    duelEnabled: true,
    flashChallengeEnabled: true,
    flashChallengeMultiplier: 1.5,
    adsEnabled: true,
    adProvider: 'simulated_web',
    liveWinnersTickerEnabled: true,
    targetWinRate: 35,
  });

  // Puzzles State
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [selectedPuzzleForEdit, setSelectedPuzzleForEdit] = useState<any | null>(null);
  const [isPuzzleModalOpen, setIsPuzzleModalOpen] = useState(false);

  // Analytics & Security
  const [analytics, setAnalytics] = useState<any>(null);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);

  // Preview puzzle in modal
  const [previewPuzzle, setPreviewPuzzle] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gamesRes, tickerRes, settRes, puzRes, anaRes, secRes] = await Promise.all([
        api.fetchFreeChallengeAdminGames().catch(() => ({ success: false, games: [] })),
        api.fetchFreeChallengeTicker().catch(() => ({ success: false, tickerSettings: null, winners: [] })),
        api.fetchFreeChallengeAdminSettings().catch(() => ({ success: false, settings: null })),
        api.fetchFreeChallengeAdminPuzzles().catch(() => ({ success: false, puzzles: [] })),
        api.fetchFreeChallengeAnalytics().catch(() => ({ success: false, analytics: null })),
        api.fetchFreeChallengeSecurityLogs().catch(() => ({ success: false, logs: [] })),
      ]);

      if (gamesRes.success && gamesRes.games) {
        setGames(gamesRes.games);
      }
      if (tickerRes.success && tickerRes.tickerSettings) {
        setTickerSettings(tickerRes.tickerSettings);
      }
      if (settRes.success && settRes.settings) {
        setSettings(settRes.settings);
        if (settRes.settings.tickerSettings) {
          setTickerSettings(settRes.settings.tickerSettings);
        }
        if (settRes.settings.discountWheelValues) {
          setWheelSettings((prev) => ({
            ...prev,
            enabled: settRes.settings.discountWheelEnabled ?? true,
            slices: settRes.settings.discountWheelValues || [5, 10, 15, 20, 25],
            probabilities: settRes.settings.wheelProbabilities || { 5: 40, 10: 30, 15: 20, 20: 8, 25: 2 },
            durationMinutes: settRes.settings.discountDurationMinutes || 10,
          }));
        }
      }
      if (puzRes.success && puzRes.puzzles) {
        setPuzzles(puzRes.puzzles);
      }
      if (anaRes.success && anaRes.analytics) {
        setAnalytics(anaRes.analytics);
      }
      if (secRes.success && secRes.logs) {
        setSecurityLogs(secRes.logs);
      }
    } catch (err: any) {
      setMsg({ text: 'فشل تحميل بيانات التحدي والألعاب', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-dismiss message after 4s
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  // --- Games Actions ---
  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameForEdit) return;
    setSaving(true);
    try {
      const res = await api.saveFreeChallengeAdminGame(selectedGameForEdit);
      if (res.success) {
        setMsg({ text: 'تم حفظ إعدادات اللعبة بنجاح!', type: 'success' });
        setIsGameModalOpen(false);
        setSelectedGameForEdit(null);
        const gamesRes = await api.fetchFreeChallengeAdminGames();
        if (gamesRes.success) setGames(gamesRes.games);
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'فشل حفظ اللعبة', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleGame = async (game: any) => {
    const updated = { ...game, enabled: !game.enabled };
    try {
      const res = await api.saveFreeChallengeAdminGame(updated);
      if (res.success) {
        setGames((prev) => prev.map((g) => (g.id === game.id ? updated : g)));
        setMsg({
          text: `تم ${updated.enabled ? 'تفعيل' : 'تعطيل'} لعبة "${game.title}" بنجاح`,
          type: 'success',
        });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'فشل تغيير حالة اللعبة', type: 'error' });
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه اللعبة بالكامل؟')) return;
    try {
      const res = await api.deleteFreeChallengeAdminGame(id);
      if (res.success) {
        setGames((prev) => prev.filter((g) => g.id !== id));
        setMsg({ text: 'تم حذف اللعبة بنجاح', type: 'success' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'فشل حذف اللعبة', type: 'error' });
    }
  };

  const handleMoveGame = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= games.length) return;

    const newGames = [...games];
    const [moved] = newGames.splice(index, 1);
    newGames.splice(newIdx, 0, moved);
    setGames(newGames);

    try {
      const orderedIds = newGames.map((g) => g.id);
      await api.reorderFreeChallengeAdminGames(orderedIds);
    } catch (err: any) {
      setMsg({ text: 'فشل حفظ الترتيب', type: 'error' });
    }
  };

  // --- Wheel Settings Actions ---
  const handleAddWheelSlice = () => {
    if (newSliceValue <= 0 || newSliceValue > 100) return;
    if (wheelSettings.slices.includes(newSliceValue)) {
      setMsg({ text: 'نسبة الخصم هذه مضافة مسبقاً في العجلة', type: 'error' });
      return;
    }
    const updatedSlices = [...wheelSettings.slices, newSliceValue].sort((a, b) => a - b);
    const updatedProbs = { ...wheelSettings.probabilities, [newSliceValue]: newSliceProb || 20 };
    setWheelSettings({ ...wheelSettings, slices: updatedSlices, probabilities: updatedProbs });
    setHasUnsavedChanges(true);
  };

  const handleRemoveWheelSlice = (sliceVal: number) => {
    if (wheelSettings.slices.length <= 2) {
      setMsg({ text: 'يجب أن تحتوي عجلة الحظ على قسمين على الأقل', type: 'error' });
      return;
    }
    const updatedSlices = wheelSettings.slices.filter((s) => s !== sliceVal);
    const updatedProbs = { ...wheelSettings.probabilities };
    delete updatedProbs[sliceVal];
    setWheelSettings({ ...wheelSettings, slices: updatedSlices, probabilities: updatedProbs });
    setHasUnsavedChanges(true);
  };

  const handleUpdateSliceProbability = (sliceVal: number, probVal: number) => {
    const updatedProbs = { ...wheelSettings.probabilities, [sliceVal]: probVal };
    setWheelSettings({ ...wheelSettings, probabilities: updatedProbs });
    setHasUnsavedChanges(true);
  };

  const handleSaveWheelSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        discountWheelEnabled: wheelSettings.enabled,
        discountWheelValues: wheelSettings.slices,
        wheelProbabilities: wheelSettings.probabilities,
        discountDurationMinutes: wheelSettings.durationMinutes,
      };

      const res = await api.updateFreeChallengeAdminSettings(updatedSettings);
      if (res.success) {
        setSettings(res.settings);
        setHasUnsavedChanges(false);
        setMsg({ text: 'تم حفظ وتطبيق إعدادات عجلة الحظ والاحتمالات بنجاح!', type: 'success' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'فشل حفظ إعدادات العجلة', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // --- General Settings Actions ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateFreeChallengeAdminSettings(settings);
      if (res.success) {
        setSettings(res.settings);
        setHasUnsavedChanges(false);
        setMsg({ text: 'تم حفظ جميع إعدادات التحدي بنجاح!', type: 'success' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'فشل حفظ الإعدادات', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // --- Ticker Actions ---
  const handleSaveTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateFreeChallengeAdminTicker(tickerSettings);
      if (res.success) {
        setTickerSettings(res.tickerSettings);
        setHasUnsavedChanges(false);
        setMsg({ text: 'تم تحديث شريط الفائزين المباشر بنجاح!', type: 'success' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'فشل حفظ شريط الفائزين', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTickerItem = () => {
    if (!newTickerText.trim()) return;
    const current = tickerSettings.customItems || [];
    setTickerSettings({
      ...tickerSettings,
      customItems: [...current, newTickerText.trim()],
    });
    setNewTickerText('');
    setHasUnsavedChanges(true);
  };

  const handleRemoveTickerItem = (index: number) => {
    const current = tickerSettings.customItems || [];
    setTickerSettings({
      ...tickerSettings,
      customItems: current.filter((_: any, i: number) => i !== index),
    });
    setHasUnsavedChanges(true);
  };

  // --- Puzzles Actions ---
  const handleSavePuzzle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPuzzleForEdit) return;
    setSaving(true);
    try {
      const res = await api.saveFreeChallengeAdminPuzzle(selectedPuzzleForEdit);
      if (res.success) {
        setMsg({ text: 'تم حفظ اللغز البصري بنجاح!', type: 'success' });
        setIsPuzzleModalOpen(false);
        setSelectedPuzzleForEdit(null);
        const puzRes = await api.fetchFreeChallengeAdminPuzzles();
        if (puzRes.success) setPuzzles(puzRes.puzzles);
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'فشل حفظ اللغز', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePuzzle = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا اللغز من البنك؟')) return;
    try {
      const res = await api.deleteFreeChallengeAdminPuzzle(id);
      if (res.success) {
        setPuzzles((prev) => prev.filter((p) => p.id !== id));
        setMsg({ text: 'تم حذف اللغز بنجاح', type: 'success' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'فشل حذف اللغز', type: 'error' });
    }
  };

  // Filtered Games
  const filteredGames = games.filter((g) => {
    const matchesSearch =
      !gameSearchQuery ||
      g.title?.toLowerCase().includes(gameSearchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(gameSearchQuery.toLowerCase()) ||
      g.type?.toLowerCase().includes(gameSearchQuery.toLowerCase());

    const matchesStatus =
      gameStatusFilter === 'all' ? true : gameStatusFilter === 'active' ? g.enabled : !g.enabled;

    const matchesPlacement =
      gamePlacementFilter === 'all' ? true : g.placement === gamePlacementFilter;

    return matchesSearch && matchesStatus && matchesPlacement;
  });

  // Filtered Puzzles
  const filteredPuzzles = puzzles.filter((p) => {
    const matchesType = puzzleFilterType === 'all' || p.type === puzzleFilterType;
    const matchesSearch =
      !puzzleSearchQuery ||
      p.title?.toLowerCase().includes(puzzleSearchQuery.toLowerCase()) ||
      p.prompt?.toLowerCase().includes(puzzleSearchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(puzzleSearchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4" dir="rtl">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-700">جاري تحميل إعدادات وتحديات المتجر الشاملة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl" id="admin_free_challenge_root">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/70 to-slate-900 rounded-3xl p-5 sm:p-6 text-white border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>مركز التحكم الموحد للألعاب والتحديات التفاعلية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              إدارة ألعاب تحدي التسوق المجاني وعجلة الحظ
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              تحكم كامل في الألعاب الـ10، مؤقتات الإجابة، نسب الخصومات، عجلة الترضية للخاسرين، شريط الفائزين المباشر، وبنك الألغاز البصرية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="px-3.5 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث</span>
            </button>
            <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-black">
              {games.filter((g) => g.enabled).length} ألعاب نشطة من {games.length}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Alert Banner */}
      {msg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 shadow-sm ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
        </div>
      )}

      {/* SubTabs Horizontal Navigation - Responsive Scrolling */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs overflow-x-auto scrollbar-none flex items-center gap-1.5">
        <button
          onClick={() => setSubTab('games')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'games'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>الألعاب والأنماط الـ10 ({games.length})</span>
        </button>

        <button
          onClick={() => setSubTab('wheel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'wheel'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <RotateCw className="w-4 h-4" />
          <span>عجلة الحظ والترضية 🎁</span>
        </button>

        <button
          onClick={() => setSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'settings'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>شروط السلة والمؤقتات</span>
        </button>

        <button
          onClick={() => setSubTab('ticker')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'ticker'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>شريط الفائزين المباشر</span>
        </button>

        <button
          onClick={() => setSubTab('puzzles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'puzzles'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>بنك الألغاز البصرية ({puzzles.length})</span>
        </button>

        <button
          onClick={() => setSubTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'analytics'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>الإحصائيات والجوائز</span>
        </button>

        <button
          onClick={() => setSubTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'security'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>كشف الغش والأمان ({securityLogs.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. GAMES TAB */}
      {/* ========================================================================= */}
      {subTab === 'games' && (
        <div className="space-y-6" id="admin_games_tab">
          {/* Action Bar: Search, Filters, Add New Game */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث عن لعبة أو نوع اللغز..."
                  value={gameSearchQuery}
                  onChange={(e) => setGameSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={gameStatusFilter}
                onChange={(e: any) => setGameStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">النشطة فقط</option>
                <option value="inactive">المعطلة فقط</option>
              </select>

              {/* Placement Filter */}
              <select
                value={gamePlacementFilter}
                onChange={(e) => setGamePlacementFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="all">كل أماكن الظهور</option>
                <option value="home">الرئيسية فقط</option>
                <option value="cart">السلة فقط</option>
                <option value="dedicated">صفحة التحديات المخصصة</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSelectedGameForEdit({
                  id: '',
                  type: 'visual_difference',
                  title: '',
                  description: '',
                  icon: 'Eye',
                  enabled: true,
                  displayOrder: games.length + 1,
                  placement: 'all',
                  timerSeconds: 8,
                  questionsPerRound: 4,
                  dailyAttemptsLimit: 2,
                  rewardType: 'discount_coupon',
                  rewardAmount: 25, // 25% discount coupon
                  rewardXp: 50,
                  difficulty: 'medium',
                  optionsCount: 4,
                  autoAdvanceOnTimeout: true,
                  cooldownMinutes: 0,
                  minCartValue: 1.0,
                  maxCartValue: 15.0,
                  minUserLevel: 'المستوى البرونزي',
                  allowNewUsers: true,
                  allowRegularUsers: true,
                  allowVipUsers: true,
                  maxDailyWinners: 100,
                  targetWinRate: 35,
                  winMessage: 'مبروك! لقد اجتزت التحدي وفزت بكوبون الخصم الذهبي ومكافأة المحفظة!',
                  lossMessage: 'حظ أوفر! لقد فزت بفرصة تدوير عجلة الحظ للحصول على خصم!',
                  timeoutMessage: 'انتهى الوقت المحدد للإجابة!',
                });
                setIsGameModalOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة لعبة / نمط جديد</span>
            </button>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGames.map((game, index) => (
              <div
                key={game.id}
                className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between shadow-xs ${
                  game.enabled
                    ? 'border-slate-200/80 hover:border-amber-400'
                    : 'border-slate-200 bg-slate-50/70 opacity-80'
                }`}
              >
                <div>
                  {/* Top Bar: Order, Type, and Quick Switch */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 text-xs font-black flex items-center justify-center font-mono">
                        #{game.displayOrder || index + 1}
                      </span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {game.type}
                      </span>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={game.enabled}
                        onChange={() => handleToggleGame(game)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span className={`text-[11px] font-bold ${game.enabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {game.enabled ? 'نشط' : 'معطل'}
                      </span>
                    </label>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-black text-sm text-slate-900 mb-1">{game.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{game.description}</p>

                  {/* Parameters Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center mb-4 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">المؤقت</span>
                      <span className="font-black text-slate-800 font-mono">{game.timerSeconds || 8}s</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">المراحل</span>
                      <span className="font-black text-slate-800 font-mono">{game.questionsPerRound || 4}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">المحاولات</span>
                      <span className="font-black text-slate-800 font-mono">{game.dailyAttemptsLimit || 2}/يوم</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] mb-4">
                    <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-lg font-bold">
                      أقصى سلة: {game.maxCartValue || 15} د.ك
                    </span>
                    <span className="bg-sky-50 text-sky-800 border border-sky-200/60 px-2 py-0.5 rounded-lg font-bold">
                      الصعوبة: {game.difficulty || 'medium'}
                    </span>
                  </div>
                </div>

                {/* Footer Controls: Move Up/Down, Edit, Delete */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveGame(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                      title="تحريك لأعلى"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveGame(index, 'down')}
                      disabled={index === games.length - 1}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                      title="تحريك لأسفل"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedGameForEdit({ ...game });
                        setIsGameModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="حذف اللعبة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FORTUNE WHEEL & LOSS COMPENSATION TAB (NEW DEDICATED SECTION) */}
      {/* ========================================================================= */}
      {subTab === 'wheel' && (
        <form onSubmit={handleSaveWheelSettings} className="space-y-6" id="admin_wheel_tab">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Slices & Expiry Settings */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                      <RotateCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">نظام عجلة الحظ لتعويض الخاسرين</h3>
                      <p className="text-xs text-slate-500">تدوير تلقائي عند الخسارة لمنح كوبون خصم زمني حقيقي يرفع معدل إتمام الطلبات</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={wheelSettings.enabled}
                      onChange={(e) => {
                        setWheelSettings({ ...wheelSettings, enabled: e.target.checked });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-black text-slate-800">
                      {wheelSettings.enabled ? 'مفعلة' : 'معطلة'}
                    </span>
                  </label>
                </div>

                {/* Slices Manager */}
                <div className="space-y-3">
                  <label className="font-bold text-slate-800 text-xs block">
                    شرائح ونسب الخصومات داخل العجلة (%)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    يتم اختيار النسبة عشوائياً وتثبيتها من الخادم وتوليد توكن خصم صالح لفترة محددة
                  </p>

                  <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <div className="grid grid-cols-12 text-[11px] font-bold text-slate-500 pb-1 border-b border-slate-200 px-2">
                      <span className="col-span-4">نسبة الخصم</span>
                      <span className="col-span-6">احتمال الظهور (%)</span>
                      <span className="col-span-2 text-left">إجراء</span>
                    </div>

                    {wheelSettings.slices.map((slice) => (
                      <div
                        key={slice}
                        className="grid grid-cols-12 items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-black text-slate-800"
                      >
                        <div className="col-span-4 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                          <span className="text-amber-600 font-mono text-sm">{slice}%</span>
                        </div>

                        <div className="col-span-6 flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={wheelSettings.probabilities?.[slice] ?? 20}
                            onChange={(e) => handleUpdateSliceProbability(slice, Number(e.target.value))}
                            className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-xs text-center focus:border-amber-500 outline-none"
                          />
                          <span className="text-[10px] text-slate-400 font-normal">% احتمال</span>
                        </div>

                        <div className="col-span-2 text-left">
                          <button
                            type="button"
                            onClick={() => handleRemoveWheelSlice(slice)}
                            className="text-slate-400 hover:text-rose-600 font-bold p-1 rounded-md hover:bg-rose-50 transition-colors"
                            title="حذف هذه الشريحة"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Slice */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <div className="relative w-28">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newSliceValue}
                        onChange={(e) => setNewSliceValue(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-xs text-center"
                        placeholder="النسبة %"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                    </div>

                    <div className="relative w-28">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newSliceProb}
                        onChange={(e) => setNewSliceProb(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-xs text-center"
                        placeholder="الاحتمال %"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">احتمال%</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddWheelSlice}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>إضافة شريحة</span>
                    </button>
                  </div>
                </div>

                {/* Duration & Thresholds */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="font-bold text-slate-700 block text-xs mb-1">
                      مدة صلاحية كود الخصم بالدقائق (Countdown)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={wheelSettings.durationMinutes}
                      onChange={(e) => {
                        setWheelSettings({ ...wheelSettings, durationMinutes: Number(e.target.value) });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">الافتراضي 10 دقائق لتشجيع العميل على إتمام الدفع فوراً</p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block text-xs mb-1">
                      الحد الأدنى لقيمة السلة للتأهل (د.ك)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={wheelSettings.minCartValue}
                      onChange={(e) => {
                        setWheelSettings({ ...wheelSettings, minCartValue: Number(e.target.value) });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Wheel Simulator Preview */}
            <div className="bg-slate-950 text-white rounded-3xl border border-amber-500/30 p-6 shadow-xl flex flex-col items-center justify-between text-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold mb-3 border border-amber-400/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>معاينة حية لشكل العجلة</span>
                </span>
                <h4 className="font-bold text-sm text-slate-200 mb-1">عجلة الخصومات التفاعلية</h4>
                <p className="text-[11px] text-slate-400 mb-4">
                  تحتوي حالياً على {wheelSettings.slices.length} شرائح بنسب متدرجة
                </p>
              </div>

              {/* Graphic Wheel Preview */}
              <div className="relative w-44 h-44 my-3 flex items-center justify-center">
                <div className="absolute -top-2.5 z-20 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-amber-400" />
                <div
                  className="w-full h-full rounded-full border-4 border-amber-400 shadow-xl overflow-hidden relative"
                  style={{
                    background: 'conic-gradient(#3b82f6 0deg 72deg, #8b5cf6 72deg 144deg, #10b981 144deg 216deg, #f59e0b 216deg 288deg, #ec4899 288deg 360deg)',
                  }}
                >
                  {wheelSettings.slices.map((slice, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-full text-center text-white font-extrabold text-[10px] drop-shadow-md pt-1.5"
                      style={{
                        transform: `rotate(${i * (360 / wheelSettings.slices.length) + (180 / wheelSettings.slices.length)}deg)`,
                      }}
                    >
                      %{slice}
                    </div>
                  ))}
                </div>
                <div className="absolute w-10 h-10 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center z-10">
                  <Gift className="w-4 h-4 text-amber-400" />
                </div>
              </div>

              <div className="w-full pt-4 border-t border-slate-800/80">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات عجلة الحظ'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. CART CONDITIONS & MASTER SETTINGS TAB */}
      {/* ========================================================================= */}
      {subTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6" id="admin_settings_tab">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Control */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>التحكم العام وشروط السلة</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div>
                    <span className="font-bold text-slate-800 block">تفعيل ميزة تحدي التسوق المجاني</span>
                    <span className="text-[11px] text-slate-500">إظهار التحدي في السلة والشاشات الرئيسية</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.gameEnabled}
                    onChange={(e) => setSettings({ ...settings, gameEnabled: e.target.checked })}
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    الحد الأقصى لقيمة السلة المؤهلة (د.ك)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={settings.maxCartValue || 15}
                    onChange={(e) => setSettings({ ...settings, maxCartValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">السلات التي تتجاوز هذا المبلغ لن يظهر لها زر التحدي</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    الحد الأقصى لعدد المحاولات اليومية لكل مستخدم
                  </label>
                  <input
                    type="number"
                    value={settings.dailyAttemptsLimit || 2}
                    onChange={(e) => setSettings({ ...settings, dailyAttemptsLimit: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    عدد الألغاز/الأسئلة في كل جولة
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.puzzlesPerChallenge || 4}
                    onChange={(e) => setSettings({ ...settings, puzzlesPerChallenge: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">الافتراضي 4 أسئلة في الجولة الواحدة</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    مكافأة الإجابة الصحيحة الواحدة (د.ك)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    value={settings.rewardPerCorrectAnswer ?? 0.25}
                    onChange={(e) => setSettings({ ...settings, rewardPerCorrectAnswer: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">المبلغ المكتسب في المحفظة لكل إجابة صحيحة (مثال: 0.250 د.ك)</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    الحد الأدنى للأرباح للتأهل لعجلة الحظ (د.ك)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={settings.wheelEligibilityThreshold ?? 0.5}
                    onChange={(e) => setSettings({ ...settings, wheelEligibilityThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">المستخدم الذي يربح هذا المبلغ أو أكثر يتأهل للف العجلة عند الخسارة (مثال: 0.500 د.ك)</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    مدة الإجابة على كل لغز بالثواني (الافتراضي 8 ثوانٍ)
                  </label>
                  <input
                    type="number"
                    value={settings.puzzleDurationSeconds || 8}
                    onChange={(e) => setSettings({ ...settings, puzzleDurationSeconds: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Special Modes Control */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>أوضاع اللعب الخاصة وسياسة الشحن</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div>
                    <span className="font-bold text-slate-800 block">تفعيل صندوق المفاجآت (Mystery Box)</span>
                    <span className="text-[11px] text-slate-500">تمكين التحدي للفوز بمنتج عشوائي دون سلة</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.mysteryBoxEnabled}
                    onChange={(e) => setSettings({ ...settings, mysteryBoxEnabled: e.target.checked })}
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div>
                    <span className="font-bold text-slate-800 block">تفعيل مبارزات التسوق 1v1</span>
                    <span className="text-[11px] text-slate-500">تحدي مباشر بين صديقين للحصول على خصم 25%</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.duelEnabled}
                    onChange={(e) => setSettings({ ...settings, duelEnabled: e.target.checked })}
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div>
                    <span className="font-bold text-slate-800 block">شحن مجاني للفائز بالسلة</span>
                    <span className="text-[11px] text-slate-500">إعفاء الفائزين من رسوم التوصيل عند الفوز</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.shippingPolicy === 'free_shipping_on_win'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shippingPolicy: e.target.checked ? 'free_shipping_on_win' : 'standard',
                      })
                    }
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات بالكامل'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 4. LIVE WINNERS TICKER TAB */}
      {/* ========================================================================= */}
      {subTab === 'ticker' && (
        <form onSubmit={handleSaveTicker} className="space-y-6" id="admin_ticker_tab">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-amber-600" />
                  <span>تخصيص شريط الفائزين المباشر (Live Winners Ticker)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  عرض الفائزين الجدد بالتحدي لحظياً لبث الحماس والثقة لدى المتسوقين
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={tickerSettings.enabled}
                  onChange={(e) => setTickerSettings({ ...tickerSettings, enabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
                <span className="text-xs font-black text-slate-800">
                  {tickerSettings.enabled ? 'مفعل' : 'معطل'}
                </span>
              </label>
            </div>

            {/* Custom items broadcasts */}
            <div className="space-y-3">
              <label className="font-bold text-slate-800 text-xs block">
                رسائل الإعلان الترويجية المخصصة في الشريط:
              </label>
              <div className="space-y-2">
                {(tickerSettings.customItems || []).map((item: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs font-bold text-slate-800"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTickerItem(idx)}
                      className="text-slate-400 hover:text-rose-600 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="أدخل رسالة ترويجية أو إعلان جديد للشريط..."
                  value={newTickerText}
                  onChange={(e) => setNewTickerText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddTickerItem}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>إضافة</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات الشريط'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 5. PUZZLES BANK TAB */}
      {/* ========================================================================= */}
      {subTab === 'puzzles' && (
        <div className="space-y-6" id="admin_puzzles_tab">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث في بنك الألغاز..."
                  value={puzzleSearchQuery}
                  onChange={(e) => setPuzzleSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              {/* Filter */}
              <select
                value={puzzleFilterType}
                onChange={(e) => setPuzzleFilterType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="all">جميع الأنواع ({puzzles.length})</option>
                <option value="visual_difference">اختلاف الألوان والمواقع (visual_difference)</option>
                <option value="silhouette_match">مطابقة الظل (silhouette_match)</option>
                <option value="pattern_completion">إكمال النمط (pattern_completion)</option>
                <option value="fast_pattern_count">العد السريع (fast_pattern_count)</option>
                <option value="shape_sorting">فرز الأشكال (shape_sorting)</option>
                <option value="visual_memory">الذاكرة البصرية (visual_memory)</option>
                <option value="missing_puzzle_piece">القطعة الناقصة (missing_puzzle_piece)</option>
                <option value="one_stroke_maze">المتاهة السريعة (one_stroke_maze)</option>
                <option value="order_sequence">ترتيب السلاسل (order_sequence)</option>
                <option value="reaction_speed">سرعة رد الفعل (reaction_speed)</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSelectedPuzzleForEdit({
                  id: '',
                  title: '',
                  prompt: '',
                  type: 'visual_difference',
                  category: 'قرطاسية ومستلزمات',
                  difficulty: 'easy',
                  timeLimitSeconds: 8,
                  correctAnswerIndex: 0,
                  options: [
                    { id: 'opt_1', label: 'الخيار الصحيح' },
                    { id: 'opt_2', label: 'خيار خاطئ 1' },
                    { id: 'opt_3', label: 'خيار خاطئ 2' },
                    { id: 'opt_4', label: 'خيار خاطئ 3' },
                  ],
                  mainVisual: {
                    svgContent: '<div class="text-center p-4 text-3xl">🖍️ 📐 ✂️</div>',
                    promptDetails: 'حدد العنصر المختلف',
                  },
                  explanation: 'تفسير الإجابة الصحيحة',
                  isActive: true,
                });
                setIsPuzzleModalOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة لغز بصري جديد</span>
            </button>
          </div>

          {/* Puzzles List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPuzzles.map((puz) => (
              <div
                key={puz.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-xs hover:border-amber-400 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                      {puz.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{puz.timeLimitSeconds || 8}s</span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 mb-1">{puz.title}</h4>
                  <p className="text-[11px] text-slate-500 mb-3">{puz.prompt}</p>

                  {/* Render Visual Preview */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl mb-3 overflow-hidden text-center min-h-[90px] flex items-center justify-center">
                    <VisualPuzzleRenderer puzzle={puz} />
                  </div>

                  <div className="text-[10px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>الإجابة الصحيحة: {puz.options?.[puz.correctAnswerIndex]?.label || 'الخيار 1'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
                  <button
                    onClick={() => setPreviewPuzzle(puz)}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة تفاعلية</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedPuzzleForEdit({ ...puz });
                        setIsPuzzleModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePuzzle(puz.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ANALYTICS & WINNERS TAB */}
      {/* ========================================================================= */}
      {subTab === 'analytics' && (
        <div className="space-y-6" id="admin_analytics_tab">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">إجمالي محاولات التحدي</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{analytics?.totalChallengesStarted || 142}</span>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">عدد الفائزين بالسلة المجانية</span>
              <span className="text-2xl font-black text-emerald-600 font-mono">{analytics?.totalWon || 24}</span>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">نسبة الفوز الإجمالية</span>
              <span className="text-2xl font-black text-amber-600 font-mono">{analytics?.winRatePercentage || '16.9'}%</span>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">الطلبات المجانية الممنوحة</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{analytics?.freeOrdersCount || 24} طلب</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SECURITY & ANTI-CHEAT TAB */}
      {/* ========================================================================= */}
      {subTab === 'security' && (
        <div className="space-y-6" id="admin_security_tab">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>سجل كشف الغش والتأمين (Anti-Cheat Security Logs)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  رصد محاولات تغيير التبويب، فتح أدوات المطورين، التخمين العشوائي السريع، أو إعادة المحاولة
                </p>
              </div>
            </div>

            {securityLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                لا توجد سجلات أمان مسجلة حالياً - النظام يعمل بكفاءة وأمان تام
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {securityLogs.map((log: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800">{log.eventType || 'حدث أمني'}: </span>
                        <span className="text-slate-600">{log.details}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('ar-KW') : 'الآن'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAME EDIT / ADD MODAL */}
      {/* ========================================================================= */}
      {isGameModalOpen && selectedGameForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl" id="game_edit_modal">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-amber-600" />
                <span>{selectedGameForEdit.id ? 'تعديل إعدادات اللعبة' : 'إضافة لعبة جديدة للمتجر'}</span>
              </h3>
              <button
                onClick={() => setIsGameModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveGame} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <LocalizedInput label="اسم اللعبة / التحدي *" value={selectedGameForEdit.title as any} onChange={val => setSelectedGameForEdit({ ...selectedGameForEdit, title: val as any })} theme="light" />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع اللغز البصري المعتمد *</label>
                  <select
                    value={selectedGameForEdit.type}
                    onChange={(e) => setSelectedGameForEdit({ ...selectedGameForEdit, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="visual_difference">اختلاف الألوان والمواقع (visual_difference)</option>
                    <option value="silhouette_match">مطابقة الظل مع الأصل (silhouette_match)</option>
                    <option value="pattern_completion">إكمال النمط الهندسي (pattern_completion)</option>
                    <option value="fast_pattern_count">العد السريع والتركيز (fast_pattern_count)</option>
                    <option value="shape_sorting">فرز وتصنيف الأشكال (shape_sorting)</option>
                    <option value="visual_memory">الذاكرة البصرية السريعة (visual_memory)</option>
                    <option value="missing_puzzle_piece">القطعة الناقصة من التركيب (missing_puzzle_piece)</option>
                    <option value="one_stroke_maze">المتاهة السريعة (one_stroke_maze)</option>
                    <option value="order_sequence">ترتيب السلاسل والمقادير (order_sequence)</option>
                    <option value="reaction_speed">سرعة رد الفعل (reaction_speed)</option>
                  </select>
                </div>
              </div>

              <div>
                <LocalizedInput label="وصف اللعبة المختصر للمتسوق" value={selectedGameForEdit.description as any} onChange={val => setSelectedGameForEdit({ ...selectedGameForEdit, description: val as any })} type="textarea" theme="light" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المؤقت (ثواني) *</label>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={selectedGameForEdit.timerSeconds ?? 8}
                    onChange={(e) => setSelectedGameForEdit({ ...selectedGameForEdit, timerSeconds: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-center text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">عدد الألغاز بالدورة *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={selectedGameForEdit.questionsPerRound ?? 4}
                    onChange={(e) => setSelectedGameForEdit({ ...selectedGameForEdit, questionsPerRound: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-center text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الحد اليومي للمحاولات *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={selectedGameForEdit.dailyAttemptsLimit ?? 2}
                    onChange={(e) => setSelectedGameForEdit({ ...selectedGameForEdit, dailyAttemptsLimit: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-center text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">أقصى قيمة سلة (د.ك) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={selectedGameForEdit.maxCartValue ?? 15}
                    onChange={(e) => setSelectedGameForEdit({ ...selectedGameForEdit, maxCartValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-center text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">مستوى الصعوبة</label>
                  <select
                    value={selectedGameForEdit.difficulty || 'medium'}
                    onChange={(e: any) => setSelectedGameForEdit({ ...selectedGameForEdit, difficulty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs"
                  >
                    <option value="easy">سهل (Easy)</option>
                    <option value="medium">متوسط (Medium)</option>
                    <option value="hard">صعب وتحدي (Hard)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">نقاط الخبرة (XP) عند الفوز</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={selectedGameForEdit.rewardXp ?? 50}
                    onChange={(e) => setSelectedGameForEdit({ ...selectedGameForEdit, rewardXp: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs text-center font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">أماكن ظهور اللعبة</label>
                  <select
                    value={selectedGameForEdit.placement || 'all'}
                    onChange={(e) => setSelectedGameForEdit({ ...selectedGameForEdit, placement: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs"
                  >
                    <option value="all">كل الأماكن (الرئيسية والسلة والتحديات)</option>
                    <option value="cart">سلة التسوق فقط</option>
                    <option value="home">الصفحة الرئيسية فقط</option>
                    <option value="dedicated">صفحة الألعاب المخصصة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <LocalizedInput label="رسالة الفوز بالتحدي" value={selectedGameForEdit.winMessage as any} onChange={val => setSelectedGameForEdit({ ...selectedGameForEdit, winMessage: val as any })} theme="light" />
                </div>
                <div>
                  <LocalizedInput label="رسالة الخسارة وتدوير العجلة" value={selectedGameForEdit.lossMessage as any} onChange={val => setSelectedGameForEdit({ ...selectedGameForEdit, lossMessage: val as any })} theme="light" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div>
                  <span className="font-bold text-slate-800 block">تفعيل هذه اللعبة في المتجر</span>
                  <span className="text-[11px] text-slate-500">إظهار اللعبة للجمهور وإتاحة دخول تحديها</span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedGameForEdit.enabled}
                  onChange={(e) => setSelectedGameForEdit({ ...selectedGameForEdit, enabled: e.target.checked })}
                  className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGameModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ اللعبة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PUZZLE EDIT / ADD MODAL */}
      {/* ========================================================================= */}
      {isPuzzleModalOpen && selectedPuzzleForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl" id="puzzle_edit_modal">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>{selectedPuzzleForEdit.id ? 'تعديل بيانات اللغز البصري' : 'إضافة لغز بصري جديد'}</span>
              </h3>
              <button
                onClick={() => setIsPuzzleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSavePuzzle} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <LocalizedInput label="عنوان اللغز *" value={selectedPuzzleForEdit.title as any} onChange={val => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, title: val as any })} theme="light" />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع اللغز *</label>
                  <select
                    value={selectedPuzzleForEdit.type}
                    onChange={(e) => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="visual_difference">اختلاف الألوان والمواقع (visual_difference)</option>
                    <option value="silhouette_match">مطابقة الظل مع الأصل (silhouette_match)</option>
                    <option value="pattern_completion">إكمال النمط الهندسي (pattern_completion)</option>
                    <option value="fast_pattern_count">العد السريع والتركيز (fast_pattern_count)</option>
                    <option value="shape_sorting">فرز وتصنيف الأشكال (shape_sorting)</option>
                    <option value="visual_memory">الذاكرة البصرية السريعة (visual_memory)</option>
                    <option value="missing_puzzle_piece">القطعة الناقصة من التركيب (missing_puzzle_piece)</option>
                    <option value="one_stroke_maze">المتاهة السريعة (one_stroke_maze)</option>
                    <option value="order_sequence">ترتيب السلاسل والمقادير (order_sequence)</option>
                    <option value="reaction_speed">سرعة رد الفعل (reaction_speed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">نص السؤال / التوجيه للمتسابق *</label>
                <textarea
                  rows={2}
                  required
                  value={selectedPuzzleForEdit.prompt}
                  onChange={(e) => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, prompt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  placeholder="مثال: حدد العنصر الذي لا ينتمي للمجموعة التالية بأسرع وقت"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  كود العرض البصري (SVG / HTML / الرموز التعبيرية)
                </label>
                <textarea
                  rows={4}
                  value={selectedPuzzleForEdit.mainVisual?.svgContent || ''}
                  onChange={(e) =>
                    setSelectedPuzzleForEdit({
                      ...selectedPuzzleForEdit,
                      mainVisual: {
                        ...selectedPuzzleForEdit.mainVisual,
                        svgContent: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl p-2.5"
                  placeholder="<svg ...> أو <div class='text-4xl text-center'>🖍️ 📐</div>"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">خيارات الإجابة وتحديد الخيار الصحيح:</label>
                {(selectedPuzzleForEdit.options || []).map((opt: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-200/50">
                    <div className="pt-2">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={selectedPuzzleForEdit.correctAnswerIndex === idx}
                        onChange={() => setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, correctAnswerIndex: idx })}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <LocalizedInput
                        label={`الخيار ${idx + 1}`}
                        value={opt.label as any}
                        onChange={val => {
                          const newOpts = [...selectedPuzzleForEdit.options];
                          newOpts[idx] = { ...newOpts[idx], label: val as any };
                          setSelectedPuzzleForEdit({ ...selectedPuzzleForEdit, options: newOpts });
                        }}
                        theme="light"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPuzzleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ اللغز'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PUZZLE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewPuzzle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border border-amber-400/40 rounded-3xl max-w-lg w-full p-6 text-white text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-amber-400 font-mono">{previewPuzzle.type}</span>
              <button
                onClick={() => setPreviewPuzzle(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <h3 className="text-base font-black">{previewPuzzle.title}</h3>
            <p className="text-xs text-slate-300">{previewPuzzle.prompt}</p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 my-3">
              <VisualPuzzleRenderer puzzle={previewPuzzle} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {previewPuzzle.options?.map((opt: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center font-bold ${
                    idx === previewPuzzle.correctAnswerIndex
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {opt.label}
                  {idx === previewPuzzle.correctAnswerIndex && ' ✓ (الصحيحة)'}
                </div>
              ))}
            </div>

            <button
              onClick={() => setPreviewPuzzle(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
