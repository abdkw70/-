import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Trophy,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Shield,
  Coins,
  ChevronRight,
  X,
  Phone,
  Mail,
  Calendar,
  Eye,
  PlusCircle,
  Flame,
  Award
} from 'lucide-react';
import { AdminUserSummary, UserProfile, UserWallet, ChallengeActivityItem } from '../../types';

interface AdminUsersProps {
  passcode: string;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ passcode }) => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusDesc, setBonusDesc] = useState('');
  const [bonusSubmitting, setBonusSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-passcode': passcode },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [passcode]);

  const viewUserDetail = async (userId: string) => {
    setUserLoading(true);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        headers: { 'x-admin-passcode': passcode },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch user detail:', err);
    } finally {
      setUserLoading(false);
    }
  };

  const handleGrantBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser?.profile?.id || !bonusAmount) return;
    const amountNum = parseFloat(bonusAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setBonusSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(selectedUser.profile.id)}/bonus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': passcode,
        },
        body: JSON.stringify({
          amount: amountNum,
          description: bonusDesc || 'مكافأة ولاء من إدارة المتجر',
        }),
      });

      if (res.ok) {
        setActionSuccess('تمت إضافة المكافأة للمحفظة بنجاح!');
        setBonusAmount('');
        setBonusDesc('');
        viewUserDetail(selectedUser.profile.id);
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to grant bonus:', err);
    } finally {
      setBonusSubmitting(false);
    }
  };

  // KPIs
  const totalUsersCount = users.length;
  const challengePlayersCount = users.filter(u => u.challengesPlayed > 0).length;
  const totalDistributedKwd = users.reduce((sum, u) => sum + (u.totalRewardsEarnedKwd || 0), 0);
  const totalUsedKwd = users.reduce((sum, u) => sum + (u.totalRewardsUsedKwd || 0), 0);
  const totalActiveWalletBalance = users.reduce((sum, u) => sum + (u.activeWalletBalance || 0), 0);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        u.id.toLowerCase().includes(q);

      const matchesTier = selectedTier === 'all' || u.currentTier === selectedTier;

      return matchesSearch && matchesTier;
    });
  }, [users, searchQuery, selectedTier]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>إدارة حسابات المستخدمين والمشتركين</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة جميع حسابات العملاء المسجلين، أرصدة المحافظ، ومستويات ونشاط التحديات
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-slate-800">{totalUsersCount}</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">إجمالي المسجلين</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-slate-800">{challengePlayersCount}</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">المشاركون بالتحديات</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Coins className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-slate-800">{totalDistributedKwd.toFixed(3)} <span className="text-xs font-bold">د.ك</span></div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">إجمالي مكافآت التحدي</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-slate-800">{totalActiveWalletBalance.toFixed(3)} <span className="text-xs font-bold">د.ك</span></div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">الرصيد النشط حالياً</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-slate-800">{totalUsedKwd.toFixed(3)} <span className="text-xs font-bold">د.ك</span></div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">رصيد مستخدم بالطلبات</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، البريد الإلكتروني، أو الهاتف..."
            className="w-full pl-3 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="py-2.5 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 bg-white"
          >
            <option value="all">جميع المستويات</option>
            <option value="المستوى البرونزي">المستوى البرونزي</option>
            <option value="المستوى الفضي">المستوى الفضي</option>
            <option value="المستوى الذهبي">المستوى الذهبي</option>
            <option value="المستوى البلاتيني">المستوى البلاتيني</option>
            <option value="المستوى الماسي">المستوى الماسي</option>
          </select>
        </div>
      </div>

      {/* Users Table / Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>جاري تحميل بيانات المستخدمين...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>لا يوجد مستخدمون يطابقون شروط البحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">المستخدم</th>
                  <th className="py-3 px-4">البريد والهاتف</th>
                  <th className="py-3 px-4">المستوى و XP</th>
                  <th className="py-3 px-4">رصيد المحفظة النشط</th>
                  <th className="py-3 px-4">إجمالي المكافآت</th>
                  <th className="py-3 px-4">جولات التحدي</th>
                  <th className="py-3 px-4">آخر دخول</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0">
                          {u.displayName.charAt(0)}
                        </div>
                        <div>
                          <div>{u.displayName}</div>
                          {u.role === 'admin' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md mt-0.5">
                              <Shield className="w-2.5 h-2.5" />
                              مدير المتجر
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="text-[11px] font-medium text-slate-700">{u.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{u.phone !== '-' ? u.phone : 'غير محدد'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {u.currentTier}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold">{u.xp} XP</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {u.activeWalletBalance.toFixed(3)} د.ك
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{u.totalRewardsEarnedKwd.toFixed(3)} د.ك</div>
                      <div className="text-[10px] text-slate-400">مستهلك: {u.totalRewardsUsedKwd.toFixed(3)} د.ك</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{u.challengesPlayed} جولة</div>
                      <div className="text-[10px] text-emerald-600 font-medium">مكتمل: {u.challengesCompleted}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(u.lastLoginAt || u.createdAt).toLocaleDateString('ar-KW', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => viewUserDetail(u.id)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                        title="عرض الملف الكامل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-base shadow-md">
                  {selectedUser.profile.displayName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedUser.profile.displayName}</h3>
                  <p className="text-xs text-slate-400">{selectedUser.profile.email || selectedUser.profile.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
              {/* User Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-bold mb-0.5">رصيد المحفظة النشط</div>
                  <div className="text-base font-black text-emerald-600">{selectedUser.wallet.activeBalance.toFixed(3)} د.ك</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-bold mb-0.5">المستوى الحالي</div>
                  <div className="text-sm font-black text-amber-600">{selectedUser.profile.currentTier}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{selectedUser.profile.xp} XP</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-bold mb-0.5">إجمالي الأرباح</div>
                  <div className="text-sm font-black text-slate-800">{selectedUser.wallet.totalEarned.toFixed(3)} د.ك</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-bold mb-0.5">الجولات المكتملة</div>
                  <div className="text-sm font-black text-slate-800">{selectedUser.profile.challengesCompleted} / {selectedUser.profile.challengesPlayed}</div>
                </div>
              </div>

              {/* User Account Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-800 mb-2">معلومات الحساب:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <div><strong>معرف المستخدم (UID):</strong> <span className="font-mono text-[10px] text-slate-500">{selectedUser.profile.id}</span></div>
                  <div><strong>رقم الهاتف:</strong> {selectedUser.profile.phone || selectedUser.profile.phoneNumber || 'غير محدد'}</div>
                  <div><strong>تاريخ التسجيل:</strong> {new Date(selectedUser.profile.createdAt).toLocaleString('ar-KW')}</div>
                  <div><strong>آخر تسجيل دخول:</strong> {selectedUser.profile.lastLoginAt ? new Date(selectedUser.profile.lastLoginAt).toLocaleString('ar-KW') : 'غير متوفر'}</div>
                  <div><strong>آخر عنوان IP:</strong> <span className="font-mono">{selectedUser.profile.lastIp || '-'}</span></div>
                  <div><strong>الإجابات الصحيحة:</strong> {selectedUser.profile.correctAnswersCount || 0} إجابة</div>
                </div>
              </div>

              {/* Wallet Active Items (48h Expiry) */}
              <div>
                <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                  <span>أرصدة ومكافآت المحفظة الحالية ({selectedUser.wallet.items?.length || 0}):</span>
                </div>
                {(!selectedUser.wallet.items || selectedUser.wallet.items.length === 0) ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400">لا توجد مكافآت مسجلة في المحفظة حالياً</div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedUser.wallet.items.map((item: any) => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{item.amount.toFixed(3)} د.ك</div>
                          <div className="text-[10px] text-slate-400">
                            صالح حتى: {new Date(item.expiresAt).toLocaleString('ar-KW')}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                          item.status === 'used' ? 'bg-slate-200 text-slate-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {item.status === 'active' && 'نشط'}
                          {item.status === 'used' && 'مستخدم'}
                          {item.status === 'expired' && 'منتهي الصلاحية'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Challenge Activities */}
              <div>
                <div className="font-bold text-slate-800 mb-2">سجل نشاط التحديات الأخير:</div>
                {(!selectedUser.activities || selectedUser.activities.length === 0) ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400">لا يوجد سجل نشاط مسجل</div>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {selectedUser.activities.map((act: ChallengeActivityItem) => (
                      <div key={act.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                        <div className="truncate max-w-[280px]">
                          <span className="font-semibold text-slate-700">{act.questionText || act.questionId}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {act.result === 'correct' && (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              +{act.reward.toFixed(3)} د.ك
                            </span>
                          )}
                          {act.result === 'wrong' && (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              خطأ
                            </span>
                          )}
                          {act.result === 'timeout' && (
                            <span className="text-amber-600 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              انتهاء الوقت
                            </span>
                          )}
                          {act.result === 'rejected_duplicate' && (
                            <span className="text-purple-600 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              مكرر
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
