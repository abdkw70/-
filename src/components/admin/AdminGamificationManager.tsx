import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Save,
  RefreshCw,
  Search,
  Filter,
  Sliders,
  Sparkles,
  HelpCircle,
  Clock,
  Coins,
  Shield,
  Layers,
  Crown,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { QuizQuestion, GamificationSettings } from '../../types';
import * as api from '../../lib/api';

interface AdminGamificationManagerProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  formatPrice: (p: number) => string;
}

export const AdminGamificationManager: React.FC<AdminGamificationManagerProps> = ({
  showToast,
  formatPrice,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'settings' | 'tiers' | 'analytics'>('questions');
  const [stats, setStats] = useState<any>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [settings, setSettings] = useState<GamificationSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Question Modal / Editor
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuizQuestion> | null>(null);
  const [savingQuestion, setSavingQuestion] = useState<boolean>(false);

  // Load Data
  const loadGamificationData = async () => {
    setLoading(true);
    try {
      const [statsRes, questionsRes, settingsRes] = await Promise.all([
        api.fetchAdminGamificationStats(),
        api.fetchAdminQuestions(),
        api.fetchAdminGamificationSettings(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (questionsRes.success) setQuestions(questionsRes.questions);
      if (settingsRes.success) setSettings(settingsRes.settings);
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل بيانات نظام التحديات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGamificationData();
  }, []);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    try {
      const res = await api.saveAdminGamificationSettings(settings);
      if (res.success) {
        showToast('تم حفظ إعدادات نظام التحديات والمكافآت بنجاح', 'success');
        setSettings(res.settings);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الإعدادات', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Open New Question Modal
  const handleOpenAddQuestion = () => {
    setEditingQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      category: 'قرطاسية وأدوات مكتبية',
      explanation: '',
      difficulty: 'medium',
      isActive: true,
    });
    setIsQuestionModalOpen(true);
  };

  // Open Edit Question Modal
  const handleOpenEditQuestion = (q: QuizQuestion) => {
    setEditingQuestion({ ...q });
    setIsQuestionModalOpen(true);
  };

  // Save Question (Create or Update)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    if (!editingQuestion.question?.trim()) {
      showToast('يرجى كتابة نص السؤال', 'error');
      return;
    }

    const opts = (editingQuestion.options || []).map(o => o.trim());
    if (opts.length < 2 || opts.some(o => !o)) {
      showToast('يرجى ملء جميع خيارات الإجابة', 'error');
      return;
    }

    setSavingQuestion(true);
    try {
      const res = await api.saveAdminQuestion(editingQuestion);
      if (res.success) {
        showToast(editingQuestion.id ? 'تم تعديل السؤال بنجاح' : 'تمت إضافة السؤال بنجاح إلى بنك الأسئلة', 'success');
        setIsQuestionModalOpen(false);
        loadGamificationData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ السؤال', 'error');
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السؤال من بنك الأسئلة؟')) return;
    try {
      const res = await api.deleteAdminQuestion(id);
      if (res.success) {
        showToast('تم حذف السؤال بنجاح', 'success');
        setQuestions(prev => prev.filter(q => q.id !== id));
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حذف السؤال', 'error');
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some(o => o.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || q.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categoriesList = Array.from(new Set(questions.map(q => q.category).filter(Boolean)));

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header & Main Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>إدارة نظام "تحدّى واربح" والمستويات</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  settings?.isEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {settings?.isEnabled ? 'النظام مفعّل' : 'النظام معطل'}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              التحكم في بنك الأسئلة، المكافآت الفورية، صلاحية الرصيد، ونسب الخصم
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadGamificationData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="btn_admin_add_question"
            onClick={handleOpenAddQuestion}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سؤال جديد</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">إجمالي التحديات الملعوبة</div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.totalChallengesPlayed ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">المكافآت الموزعة للعملاء</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {(stats?.totalRewardsDistributedKwd ?? 0).toFixed(3)} <span className="text-xs">د.ك</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">الرصيد المستخدم في الطلبات</div>
          <div className="text-2xl font-black text-indigo-400 font-mono">
            {(stats?.totalRewardsUsedInOrdersKwd ?? 0).toFixed(3)} <span className="text-xs">د.ك</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">إجمالي بنك الأسئلة</div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {stats?.totalQuestions ?? questions.length}{' '}
            <span className="text-xs text-slate-400">({stats?.activeQuestions ?? questions.filter(q => q.isActive).length} نشط)</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('questions')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>بنك الأسئلة ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>إعدادات المكافآت والقواعد</span>
        </button>

        <button
          onClick={() => setActiveTab('tiers')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tiers'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>مستويات ورتب العملاء</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>التحليلات وسجل الحماية</span>
        </button>
      </div>

      {/* 1. QUESTIONS BANK TAB */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث في نصوص وخيارات الأسئلة..."
                className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full sm:w-60 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع التصنيفات ({questions.length})</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({questions.filter(q => q.category === cat).length})
                </option>
              ))}
            </select>
          </div>

          {/* Questions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-800/80">
              {filteredQuestions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850/50 transition-colors">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-sm text-white leading-snug">{q.question}</h3>
                    </div>

                    {/* Options list preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                            oIdx === q.correctAnswerIndex
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-slate-800/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-[10px] shrink-0 font-mono">
                            {oIdx + 1}
                          </span>
                          <span className="truncate">{opt}</span>
                          {oIdx === q.correctAnswerIndex && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mr-auto" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                        {q.category}
                      </span>
                      <span>•</span>
                      <span>الصعوبة: {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'hard' ? 'صعب' : 'متوسط'}</span>
                      {q.explanation && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-xs text-slate-500">التفسير: {q.explanation}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 sm:self-center">
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      title="تعديل السؤال"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title="حذف السؤال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <HelpCircle className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs">لم يتم العثور على أي أسئلة مطابقة للبحث.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SETTINGS TAB */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">إعدادات مسابقة "تحدّى واربح" وقواعد الرصيد</h3>
              <p className="text-xs text-slate-400">تخصيص قيم المكافأة المالية، صلاحية المحفظة، والحدود اليومية</p>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Master Toggle */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">تفعيل نظام "تحدّى واربح" في المتجر</span>
                <span className="text-slate-400">إظهار أزرار التحدي ومحفظة الرصيد لجميع الزوار</span>
              </div>
              <input
                type="checkbox"
                checked={settings.isEnabled}
                onChange={e => setSettings({ ...settings, isEnabled: e.target.checked })}
                className="w-5 h-5 rounded accent-amber-500"
              />
            </div>

            {/* Entry Banner Toggle */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">عرض شريط التحدي الترحيبي عند الدخول</span>
                <span className="text-slate-400">إظهار دعوة المشاركة في أعلى الصفحة الرئيسية</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoShowChallengeOnEntry}
                onChange={e => setSettings({ ...settings, autoShowChallengeOnEntry: e.target.checked })}
                className="w-5 h-5 rounded accent-amber-500"
              />
            </div>

            {/* Reward Per Correct Answer */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">قيمة المكافأة لكل إجابة صحيحة (د.ك)</label>
              <input
                type="number"
                step="0.050"
                min="0.100"
                max="5.000"
                value={settings.defaultRewardAmount ?? 0.5}
                onChange={e => setSettings({ ...settings, defaultRewardAmount: parseFloat(e.target.value) || 0.5 })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400">مثال: 0.500 د.ك تعطي المتسابق حتى 5.000 د.ك عند إجابة 10 أسئلة</span>
            </div>

            {/* Time Limit Per Question */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">المدة الزمنية لكل سؤال (بالثواني)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={settings.timePerQuestionSeconds ?? 15}
                onChange={e => setSettings({ ...settings, timePerQuestionSeconds: parseInt(e.target.value) || 15 })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400">الافتراضي: 15 ثانية لكل سؤال لضمان سرعة التفاعل وعدم الغش</span>
            </div>

            {/* Questions Per Session */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">عدد الأسئلة في كل جلسة تحدٍ</label>
              <input
                type="number"
                min="5"
                max="20"
                value={settings.questionsPerChallenge ?? 10}
                onChange={e => setSettings({ ...settings, questionsPerChallenge: parseInt(e.target.value) || 10 })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Reward Expiry Hours */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">مدة صلاحية رصيد المكافأة (بالساعات)</label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.rewardExpiryHours}
                onChange={e => setSettings({ ...settings, rewardExpiryHours: parseInt(e.target.value) || 48 })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400">الافتراضي: 48 ساعة لتحفيز العميل على سرعة الشراء وإتمام الطلب</span>
            </div>

            {/* Max Wallet Usage Percentage */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">الحد الأقصى لنسبة استخدام الرصيد من قيمة الطلب (%)</label>
              <input
                type="number"
                min="10"
                max="100"
                value={settings.maxWalletUsagePercent}
                onChange={e => setSettings({ ...settings, maxWalletUsagePercent: parseInt(e.target.value) || 50 })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400">الافتراضي: 50% (أي لا يتجاوز الخصم نصف إجمالي السلة)</span>
            </div>

            {/* Daily Attempts Limit */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">الحد الأقصى للمحاولات اليومية لكل مستخدم</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.dailyAttemptsLimit}
                onChange={e => setSettings({ ...settings, dailyAttemptsLimit: parseInt(e.target.value) || 3 })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </form>
      )}

      {/* 3. TIERS TAB */}
      {activeTab === 'tiers' && settings && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-base">مستويات ورتب المتسابقين</h3>
          <p className="text-xs text-slate-400">سلم الرتب المبني على نقاط الخبرة المكتسبة (XP) ومزايا كل فئة</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {settings.tiers.map(tier => (
              <div key={tier.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{tier.name}</span>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-700">
                    يبدأ من {tier.minXp} XP
                  </span>
                </div>
                <p className="text-xs text-slate-300">{tier.perksDescription}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ANALYTICS & ACTIVITY LOGS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Detailed KPIs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">إجمالي التحديات</div>
              <div className="text-xl font-black text-white font-mono">{stats?.totalChallengesPlayed ?? 0}</div>
              <div className="text-[10px] text-slate-500">{stats?.totalParticipatingUsers ?? 0} متسابق نشط</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">التحديات المكتملة</div>
              <div className="text-xl font-black text-emerald-400 font-mono">{stats?.totalChallengesCompleted ?? 0}</div>
              <div className="text-[10px] text-emerald-500/80">
                {stats?.totalChallengesPlayed ? Math.round(((stats.totalChallengesCompleted || 0) / stats.totalChallengesPlayed) * 100) : 0}% نسبة الإكمال
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">الإجابات الصحيحة</div>
              <div className="text-xl font-black text-teal-400 font-mono">{stats?.totalCorrectAnswers ?? 0}</div>
              <div className="text-[10px] text-teal-500/80">{stats?.correctRatePercent ?? 0}% دقة الإجابات</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">الإجابات الخاطئة</div>
              <div className="text-xl font-black text-rose-400 font-mono">{stats?.totalWrongAnswers ?? 0}</div>
              <div className="text-[10px] text-rose-500/80">إجابة غير صحيحة</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">انتهاء الوقت (Timeout)</div>
              <div className="text-xl font-black text-amber-400 font-mono">{stats?.totalTimeoutAnswers ?? 0}</div>
              <div className="text-[10px] text-amber-500/80">تجاوز الـ15 ثانية (مكافأة 0)</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">المكافآت الموزعة</div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {(stats?.totalRewardsDistributedKwd ?? 0).toFixed(3)} <span className="text-xs">د.ك</span>
              </div>
              <div className="text-[10px] text-slate-500">تم إضافتها للمحافظ</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">المكافآت المستخدمة</div>
              <div className="text-xl font-black text-indigo-400 font-mono">
                {(stats?.totalRewardsUsedInOrdersKwd ?? 0).toFixed(3)} <span className="text-xs">د.ك</span>
              </div>
              <div className="text-[10px] text-indigo-400/80">خصومات في سلة الشراء</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">المكافآت المنتهية (48 ساعة)</div>
              <div className="text-xl font-black text-slate-400 font-mono">
                {(stats?.totalRewardsExpiredKwd ?? 0).toFixed(3)} <span className="text-xs">د.ك</span>
              </div>
              <div className="text-[10px] text-slate-500">انقضت مدة الصلاحية</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">محاولات مكررة تم منعها</div>
              <div className="text-xl font-black text-sky-400 font-mono">{stats?.totalRejectedOrDuplicateTransactions ?? 0}</div>
              <div className="text-[10px] text-sky-400/80">حماية Idempotency نشطة</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">المحاولات اليومية المستهلكة</div>
              <div className="text-xl font-black text-purple-400 font-mono">{stats?.totalDailyAttempts ?? 0}</div>
              <div className="text-[10px] text-purple-400/80">بحد أقصى {settings?.dailyAttemptsLimit || 3} يومياً</div>
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">سجل نشاط وحماية التحديات</h3>
                <p className="text-xs text-slate-400">سجل فوري بجميع العمليات، نتائج الأسئلة، المكافآت ومعاملات الحماية</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">آخر 50 نشاط</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 px-3 font-semibold">المتسابق (User ID)</th>
                    <th className="pb-3 px-3 font-semibold">معرف الجلسة (Session ID)</th>
                    <th className="pb-3 px-3 font-semibold">السؤال (Question ID)</th>
                    <th className="pb-3 px-3 font-semibold text-center">النتيجة (Result)</th>
                    <th className="pb-3 px-3 font-semibold text-left">المكافأة المضافة</th>
                    <th className="pb-3 px-3 font-semibold text-left">الوقت (Timestamp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(!stats?.recentActivities || stats.recentActivities.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        لا توجد سجلات نشاط حتى الآن
                      </td>
                    </tr>
                  ) : (
                    stats.recentActivities.map((act: any, idx: number) => {
                      const isCorrect = act.result === 'correct';
                      const isTimeout = act.result === 'timeout';
                      const isDuplicate = act.result === 'rejected_duplicate';
                      const isWrong = act.result === 'wrong';

                      return (
                        <tr key={act.id || idx} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3 px-3 font-mono text-slate-300 max-w-[140px] truncate" title={act.userId}>
                            {act.userId}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400 max-w-[160px] truncate" title={act.challengeSessionId}>
                            {act.challengeSessionId}
                          </td>
                          <td className="py-3 px-3 max-w-[200px] truncate text-slate-300" title={act.questionText || act.questionId}>
                            <span className="font-mono text-slate-400 ml-1.5">{act.questionId}</span>
                            {act.questionText && <span className="text-slate-400">({act.questionText})</span>}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCorrect
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isTimeout
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : isDuplicate
                                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {isCorrect ? 'صحيحة (Correct)' : isTimeout ? 'انتهاء وقت (Timeout)' : isDuplicate ? 'مكرر مرفوض (Duplicate)' : 'خاطئة (Wrong)'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-left font-mono font-bold">
                            {act.reward > 0 ? (
                              <span className="text-emerald-400">+{Number(act.reward).toFixed(3)} د.ك</span>
                            ) : (
                              <span className="text-slate-500">0.000 د.ك</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-left font-mono text-slate-400 text-[11px]">
                            {new Date(act.timestamp).toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Question Create/Edit Modal */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">
                {editingQuestion.id ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-white block">نص السؤال *</label>
                <textarea
                  rows={2}
                  value={editingQuestion.question || ''}
                  onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  placeholder="اكتب نص السؤال هنا..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="font-bold text-white block">خيارات الإجابة (حدد الإجابة الصحيحة) *</label>
                {(editingQuestion.options || ['', '', '', '']).map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={editingQuestion.correctAnswerIndex === idx}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswerIndex: idx })}
                      className="w-4 h-4 accent-emerald-500"
                      title="حدد كإجابة صحيحة"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...(editingQuestion.options || ['', '', '', ''])];
                        newOpts[idx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      placeholder={`الخيار ${idx + 1}...`}
                      className={`w-full px-3 py-2 bg-slate-800 border rounded-xl text-xs text-white focus:outline-none ${
                        editingQuestion.correctAnswerIndex === idx
                          ? 'border-emerald-500/80 bg-emerald-950/20'
                          : 'border-slate-700'
                      }`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-white block">التصنيف</label>
                  <input
                    type="text"
                    value={editingQuestion.category || ''}
                    onChange={e => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                    placeholder="مثال: تاريخ الكويت"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white block">مستوى الصعوبة</label>
                  <select
                    value={editingQuestion.difficulty || 'medium'}
                    onChange={e => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white block">تفسير أو معلومة إضافية (اختياري)</label>
                <input
                  type="text"
                  value={editingQuestion.explanation || ''}
                  onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  placeholder="يظهر للمتسابق بعد الإجابة..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  {savingQuestion ? 'جاري الحفظ...' : 'حفظ السؤال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
