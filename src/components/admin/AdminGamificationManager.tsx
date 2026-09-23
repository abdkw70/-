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

import {
  fetchAdminGamificationOverview,
  fetchAdminSeasons,
  fetchAdminGames,
  fetchAdminXpRules,
  fetchAdminAuditLogs,
  saveAdminSeason,
  saveAdminGame,
  saveAdminXpRules,
  grantAdminWalletReward,
  confirmSeasonWinners,
  fetchLeaderboard,
} from '../../lib/api';

interface AdminGamificationManagerProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  formatPrice: (p: number) => string;
}

export const AdminGamificationManager: React.FC<AdminGamificationManagerProps> = ({
  showToast,
  formatPrice,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'seasons' | 'games' | 'xprules' | 'leaderboard_rewards' | 'audit'>('overview');
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [games, setGames] = useState<GameConfig[]>([]);
  const [xpRules, setXpRules] = useState<XpRulesConfig | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Modals & Editing
  const [editingSeason, setEditingSeason] = useState<Partial<Season> | null>(null);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState<boolean>(false);
  const [editingGame, setEditingGame] = useState<Partial<GameConfig> | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Reward Grant Modal State
  const [rewardModalUser, setRewardModalUser] = useState<any | null>(null);
  const [rewardAmount, setRewardAmount] = useState<number>(5);
  const [rewardReason, setRewardReason] = useState<string>('مكافأة الفوز بالمركز المتقدم في ألعاب الموسم');

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, seasonsData, gamesData, rulesData, leaderData, auditData] = await Promise.all([
        fetchAdminGamificationOverview().catch(() => ({ success: false, overview: null })),
        fetchAdminSeasons().catch(() => ({ success: false, seasons: [], activeSeason: null })),
        fetchAdminGames().catch(() => ({ success: false, games: [] })),
        fetchAdminXpRules().catch(() => ({ success: false, rules: null })),
        fetchLeaderboard().catch(() => ({ success: false, leaderboard: [] })),
        fetchAdminAuditLogs().catch(() => ({ success: false, logs: [] })),
      ]);

      if (overviewData.success) setStats(overviewData.overview);
      if (seasonsData.success) setSeasons(seasonsData.seasons || []);
      if (gamesData.success) setGames(gamesData.games || []);
      if (rulesData.success) setXpRules(rulesData.rules);
      if (leaderData.success) setLeaderboard(leaderData.leaderboard || []);
      if (auditData.success) setAuditLogs(auditData.logs || []);
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
      const data = await saveAdminXpRules(xpRules);
      if (data.success) {
        showToast('تم حفظ قواعد وسقوف نقاط XP بنجاح', 'success');
        setXpRules(data.rules);
      } else {
        showToast('فشل حفظ القواعد', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ قواعد XP', 'error');
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
      const data = await saveAdminSeason(editingSeason);
      if (data.success) {
        showToast('تم حفظ بيانات الموسم بنجاح', 'success');
        setIsSeasonModalOpen(false);
        setEditingSeason(null);
        loadData();
      } else {
        showToast('فشل حفظ الموسم', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'خطأ بالاتصال بالسيرفر', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Game Config
  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame?.nameAr) return;
    setSaving(true);
    try {
      const data = await saveAdminGame(editingGame);
      if (data.success) {
        showToast('تم تحديث إعدادات اللعبة بنجاح', 'success');
        setIsGameModalOpen(false);
        setEditingGame(null);
        loadData();
      } else {
        showToast('فشل تحديث اللعبة', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'خطأ بالاتصال بالسيرفر', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Grant Reward to User
  const handleGrantReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardModalUser || !rewardAmount || rewardAmount <= 0) {
      showToast('يرجى تحديد مبلغ المكافأة الصحيح', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await grantAdminWalletReward({
        userId: rewardModalUser.userId,
        amount: rewardAmount,
        reason: rewardReason,
        source: 'ADMIN_LEADERBOARD_REWARD',
      });
      if (res.success) {
        showToast(res.message || 'تم إضافة المكافأة لمحفظة اللاعب بنجاح!', 'success');
        setRewardModalUser(null);
        loadData();
      } else {
        showToast('فشل إضافة المكافأة للمحفظة', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء منح المكافأة', 'error');
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
          { id: 'leaderboard_rewards', label: 'المتصدرين والمكافآت النقدية', icon: Award },
          { id: 'xprules', label: 'قواعد وسقوف XP', icon: Sliders },
          { id: 'audit', label: 'سجل الأنشطة والأمان', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
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

          {/* 4. LEADERBOARD & WALLET REWARDS */}
          {activeTab === 'leaderboard_rewards' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      لوحة المتصدرين وإضافة الجوائز المالية للمحفظة
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      قم باختيار الفائزين والمتصدرين لمنحهم جوائز ومكافآت نقدية تضاف فوراً إلى محفظتهم الإلكترونية لاستخدامها في الشراء.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-3">الترتيب</th>
                        <th className="p-3">اسم اللاعب</th>
                        <th className="p-3">مستوى XP</th>
                        <th className="p-3">إجمالي نقاط XP</th>
                        <th className="p-3">الجولات المكتملة</th>
                        <th className="p-3 text-center">إجراءات الجوائز</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                            لا يوجد نتائج متصدرين حتى الآن في هذا الموسم.
                          </td>
                        </tr>
                      ) : (
                        leaderboard.map((user, idx) => (
                          <tr key={user.userId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-black text-slate-800">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-xs ${
                                idx === 0 ? 'bg-amber-400 text-slate-950 shadow-sm' :
                                idx === 1 ? 'bg-slate-300 text-slate-900' :
                                idx === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-100 text-slate-700'
                              }`}>
                                #{idx + 1}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-800">
                              {user.displayName || user.userId}
                            </td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-[11px]">
                                المستوى {user.level || 1}
                              </span>
                            </td>
                            <td className="p-3 font-black text-amber-600">
                              {user.totalXp?.toLocaleString() || 0} XP
                            </td>
                            <td className="p-3 font-bold text-slate-600">
                              {user.gamesPlayed || 0} جولة
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => {
                                  setRewardModalUser(user);
                                  setRewardAmount(idx === 0 ? 10 : idx === 1 ? 5 : 2);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>إضافة مكافأة محفظة</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
      {/* Grant Wallet Reward Modal */}
      {rewardModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl border border-slate-100 text-right">
            <div className="flex items-center gap-2 text-emerald-600 font-bold border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-slate-800 text-base">منح مكافأة محفظة نقدية للمستخدم</h3>
            </div>

            <form onSubmit={handleGrantReward} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <span className="text-xs text-slate-500">المستخدم المستهدف:</span>
                <p className="font-extrabold text-slate-800 text-sm">
                  {rewardModalUser.displayName || rewardModalUser.userId}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                  <span>إجمالي XP: <strong className="text-amber-600">{rewardModalUser.totalXp}</strong></span>
                  <span>|</span>
                  <span>المستوى: <strong className="text-indigo-600">{rewardModalUser.level}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ المكافأة المستحق (بالدينار الكويتي KWD)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[1, 2, 5, 10].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRewardAmount(amt)}
                      className={`py-2 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                        rewardAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {amt} د.ك
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={rewardAmount}
                  onChange={e => setRewardAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                  placeholder="أدخل مبلغ مخصص..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب المكافأة / رسالة الإشعار للمستخدم</label>
                <textarea
                  rows={2}
                  required
                  value={rewardReason}
                  onChange={e => setRewardReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800"
                  placeholder="تمت إضافة مكافأة إلى محفظتك تقديرًا لفوزك ومشاركتك..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRewardModalUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>اعتماد وإيداع بالمحفظة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
