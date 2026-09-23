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
  Sliders,
  Sparkles,
  Clock,
  Shield,
  Layers,
  Crown,
  TrendingUp,
  Gamepad2,
  Calendar,
  FileText,
  Activity,
  UserCheck,
  Zap,
} from 'lucide-react';
import { Season, GameConfig, XpRulesConfig, DailyChallengeConfig } from '../../types';

interface AdminGamificationManagerProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  formatPrice: (p: number) => string;
}

export const AdminGamificationManager: React.FC<AdminGamificationManagerProps> = ({
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'seasons' | 'games' | 'xprules' | 'challenges' | 'audit'>('overview');
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [games, setGames] = useState<GameConfig[]>([]);
  const [xpRules, setXpRules] = useState<XpRulesConfig | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallengeConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Modals & Editing
  const [editingSeason, setEditingSeason] = useState<Partial<Season> | null>(null);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState<boolean>(false);
  const [editingGame, setEditingGame] = useState<Partial<GameConfig> | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, seasonsRes, gamesRes, rulesRes, challengesRes, auditRes] = await Promise.all([
        fetch('/api/admin/xp/stats').then(r => r.json()),
        fetch('/api/seasons').then(r => r.json()),
        fetch('/api/games').then(r => r.json()),
        fetch('/api/admin/xp/rules').then(r => r.json()),
        fetch('/api/admin/xp/challenges').then(r => r.json()),
        fetch('/api/admin/xp/audit').then(r => r.json()),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (seasonsRes.success) setSeasons(seasonsRes.seasons || []);
      if (gamesRes.success) setGames(gamesRes.games || []);
      if (rulesRes.success) setXpRules(rulesRes.xpRules);
      if (challengesRes.success) setDailyChallenges(challengesRes.challenges || []);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
    } catch (err: any) {
      showToast('فشل تحميل بيانات نظام XP والفعاليات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save XP Rules
  const handleSaveXpRules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!xpRules) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/xp/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(xpRules),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ قواعد وسقوف نقاط XP بنجاح', 'success');
        setXpRules(data.xpRules);
      } else {
        showToast(data.error || 'فشل حفظ القواعد', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ أثناء حفظ قواعد XP', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Season
  const handleSaveSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeason?.nameAr || !editingSeason.startDate || !editingSeason.endDate) {
      showToast('يرجى تعبئة الحقول الأساسية للموسم', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSeason),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ بيانات الموسم بنجاح', 'success');
        setIsSeasonModalOpen(false);
        setEditingSeason(null);
        loadData();
      } else {
        showToast(data.error || 'فشل حفظ الموسم', 'error');
      }
    } catch (err) {
      showToast('خطأ بالاتصال بالسيرفر', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Game Config
  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/games/${editingGame.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGame),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم تحديث إعدادات اللعبة بنجاح', 'success');
        setIsGameModalOpen(false);
        setEditingGame(null);
        loadData();
      } else {
        showToast(data.error || 'فشل تحديث اللعبة', 'error');
      }
    } catch (err) {
      showToast('خطأ بالاتصال بالسيرفر', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
            <Zap className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-black text-slate-800">إدارة نظام الألعاب والمواسم (XP Center)</h1>
          </div>
          <p className="text-sm text-slate-500">
            نظام التنافس بالنقاط والمواسم ولوحة المتصدرين. النقاط (XP) هي نقاط خبرة تنافسية وليست رصيداً مالياً.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'لوحة الإحصائيات', icon: TrendingUp },
          { id: 'seasons', label: 'المواسم والجوائز', icon: Crown },
          { id: 'games', label: 'الألعاب المصغرة', icon: Gamepad2 },
          { id: 'xprules', label: 'قواعد وسقوف XP', icon: Sliders },
          { id: 'challenges', label: 'المهام اليومية', icon: Award },
          { id: 'audit', label: 'سجل الأنشطة والأمان', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold">جاري تحميل بيانات نظام الألعاب...</div>
      ) : (
        <>
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 font-bold text-xs">اللاعبون النشطون اليوم</span>
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-800">{stats.dailyActivePlayers || 0}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 font-bold text-xs">إجمالي جولات اللعب</span>
                    <Gamepad2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-800">{stats.gamesPlayedTotal || 0}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 font-bold text-xs">مجموع نقاط XP الممنوحة</span>
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-amber-600">{(stats.xpEarnedTotal || 0).toLocaleString()} XP</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 font-bold text-xs">تقييمات المنتجات المكتملة</span>
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-800">{stats.reviewsSubmittedTotal || 0}</div>
                </div>
              </div>

              {/* Top Games Overview */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-indigo-600" />
                  الألعاب الأكثر لعباً
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(stats.topGames || []).map((tg: any) => (
                    <div key={tg.gameId} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">{tg.nameAr}</span>
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-3 py-1 rounded-full">{tg.plays} جولة</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. SEASONS */}
          {activeTab === 'seasons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-lg">مواسم التنافس والجوائز</h3>
                <button
                  onClick={() => {
                    setEditingSeason({
                      nameAr: 'موسم جديد',
                      nameEn: 'New Season',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                      status: 'upcoming',
                      numberOfWinners: 3,
                      prizeDescriptionAr: 'جوائز عينية وقسائم شراء للأوائل',
                      prizeDescriptionEn: 'Prizes for winners',
                    });
                    setIsSeasonModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm"
                >
                  <Plus className="w-4 h-4" />
                  إضافة موسم جديد
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seasons.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        <h4 className="font-black text-slate-800">{s.nameAr}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status === 'active' ? 'الموسم الحالي' : s.status === 'upcoming' ? 'قادم' : 'منتهي'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div>من: {new Date(s.startDate).toLocaleDateString('ar-KW')}</div>
                      <div>إلى: {new Date(s.endDate).toLocaleDateString('ar-KW')}</div>
                    </div>

                    <p className="text-sm text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                      🏆 <span className="font-bold">الجوائز:</span> {s.prizeDescriptionAr} ({s.numberOfWinners} فائزين)
                    </p>

                    <button
                      onClick={() => {
                        setEditingSeason(s);
                        setIsSeasonModalOpen(true);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      تعديل بيانات الموسم
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. GAMES */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 text-lg">الألعاب المصغرة المعروضة بالمركز</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {games.map(g => (
                  <div key={g.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{g.icon || '🎮'}</span>
                        <h4 className="font-black text-slate-800">{g.nameAr}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        g.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {g.enabled ? 'مفعلة' : 'معطلة'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{g.descriptionAr}</p>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <span>الحد اليومي: <strong className="text-slate-800">{g.dailyAttemptsLimit} جولات</strong></span>
                      <span>XP/جولة: <strong className="text-amber-600">+{g.xpPerAction} XP</strong></span>
                    </div>

                    <button
                      onClick={() => {
                        setEditingGame(g);
                        setIsGameModalOpen(true);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      ضبط إعدادات اللعبة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. XP RULES */}
          {activeTab === 'xprules' && xpRules && (
            <form onSubmit={handleSaveXpRules} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 max-w-3xl">
              <h3 className="font-black text-slate-800 text-lg border-b border-slate-100 pb-3">قواعد وسقوف نقاط XP اليومية</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">XP عند تسجيل الدخول اليومي</label>
                  <input
                    type="number"
                    value={xpRules.dailyLoginXp}
                    onChange={e => setXpRules({ ...xpRules, dailyLoginXp: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">XP عند تصفح كل منتج</label>
                  <input
                    type="number"
                    value={xpRules.productViewXp}
                    onChange={e => setXpRules({ ...xpRules, productViewXp: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">XP عند إضافة تقييم منتج</label>
                  <input
                    type="number"
                    value={xpRules.reviewXpAmount}
                    onChange={e => setXpRules({ ...xpRules, reviewXpAmount: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السقف الأقصى اليومي لنقاط XP</label>
                  <input
                    type="number"
                    value={xpRules.dailyXpCap}
                    onChange={e => setXpRules({ ...xpRules, dailyXpCap: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  حفظ القواعد والسقوف
                </button>
              </div>
            </form>
          )}

          {/* 5. AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-black text-slate-800 text-lg">سجل عمليات XP الممنوحة والتحقق</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">المستخدم</th>
                      <th className="p-3">النشاط</th>
                      <th className="p-3">المصدر</th>
                      <th className="p-3">XP</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.slice(0, 30).map((log: any) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 text-slate-500">{new Date(log.date).toLocaleString('ar-KW')}</td>
                        <td className="p-3 font-bold text-slate-800">{log.userId}</td>
                        <td className="p-3 text-slate-700">{log.activity}</td>
                        <td className="p-3 font-bold text-indigo-600">{log.source}</td>
                        <td className="p-3 font-black text-amber-600">+{log.xp} XP</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            log.validationStatus === 'VALID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.validationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Season Edit Modal */}
      {isSeasonModalOpen && editingSeason && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-xl border border-slate-100 text-right">
            <h3 className="font-black text-slate-800 text-lg">تعديل / إضافة موسم تنافسي</h3>
            <form onSubmit={handleSaveSeason} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموسم بالعربية</label>
                <input
                  type="text"
                  required
                  value={editingSeason.nameAr || ''}
                  onChange={e => setEditingSeason({ ...editingSeason, nameAr: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    required
                    value={editingSeason.startDate ? editingSeason.startDate.split('T')[0] : ''}
                    onChange={e => setEditingSeason({ ...editingSeason, startDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ النهاية</label>
                  <input
                    type="date"
                    required
                    value={editingSeason.endDate ? editingSeason.endDate.split('T')[0] : ''}
                    onChange={e => setEditingSeason({ ...editingSeason, endDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف الجوائز بالعربية</label>
                <textarea
                  rows={2}
                  value={editingSeason.prizeDescriptionAr || ''}
                  onChange={e => setEditingSeason({ ...editingSeason, prizeDescriptionAr: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSeasonModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                >
                  حفظ الموسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Game Edit Modal */}
      {isGameModalOpen && editingGame && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-xl border border-slate-100 text-right">
            <h3 className="font-black text-slate-800 text-lg">ضبط إعدادات اللعبة ({editingGame.nameAr})</h3>
            <form onSubmit={handleSaveGame} className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <span className="text-xs font-bold text-slate-800">تفعيل اللعبة للجميع</span>
                <input
                  type="checkbox"
                  checked={Boolean(editingGame.enabled)}
                  onChange={e => setEditingGame({ ...editingGame, enabled: e.target.checked })}
                  className="w-5 h-5 accent-indigo-600 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الحد اليومي للجولات</label>
                  <input
                    type="number"
                    value={editingGame.dailyAttemptsLimit ?? 3}
                    onChange={e => setEditingGame({ ...editingGame, dailyAttemptsLimit: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">XP لكل جولة</label>
                  <input
                    type="number"
                    value={editingGame.xpPerAction ?? 50}
                    onChange={e => setEditingGame({ ...editingGame, xpPerAction: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGameModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                >
                  حفظ الإعدادات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
