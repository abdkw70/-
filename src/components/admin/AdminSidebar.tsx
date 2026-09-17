import React from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  RefreshCw,
  History,
  HardDriveDownload,
  Settings,
  LogOut,
  ExternalLink,
  Store,
  ShieldCheck,
  ChevronLeft,
  Award,
  Users,
  ShieldAlert,
  Gift,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'freeChallenge'
  | 'gamification'
  | 'users'
  | 'security'
  | 'sync'
  | 'logs'
  | 'backups'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onViewStore: () => void;
  stats?: {
    totalProducts?: number;
    pendingOrders?: number;
    syncStatus?: string;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  onViewStore,
  stats,
}) => {
  const navItems = [
    {
      id: 'overview' as AdminTab,
      label: 'الرئيسية والإحصائيات',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'products' as AdminTab,
      label: 'إدارة المنتجات والأسعار',
      icon: Package,
      badge: stats?.totalProducts ? `${stats.totalProducts}` : null,
    },
    {
      id: 'categories' as AdminTab,
      label: 'الأقسام والتصنيفات',
      icon: FolderTree,
      badge: 'محمي',
    },
    {
      id: 'orders' as AdminTab,
      label: 'إدارة الطلبات والمبيعات',
      icon: ShoppingBag,
      badge: stats?.pendingOrders && stats.pendingOrders > 0 ? `${stats.pendingOrders}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'freeChallenge' as AdminTab,
      label: 'تحدّي التسوق المجاني',
      icon: Gift,
      badge: 'PRO',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'gamification' as AdminTab,
      label: 'تحدّى واربح والمستويات',
      icon: Award,
      badge: 'جديد',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'users' as AdminTab,
      label: 'المستخدمين والحسابات',
      icon: Users,
      badge: null,
    },
    {
      id: 'security' as AdminTab,
      label: 'سجل الأمان والحماية',
      icon: ShieldAlert,
      badge: null,
    },
    {
      id: 'sync' as AdminTab,
      label: 'محطة المزامنة والاستيراد',
      icon: RefreshCw,
      badge: stats?.syncStatus === 'running' ? 'نشط' : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse',
    },
    {
      id: 'logs' as AdminTab,
      label: 'سجل النشاط والتدقيق',
      icon: History,
      badge: null,
    },
    {
      id: 'backups' as AdminTab,
      label: 'النسخ الاحتياطي والأمان',
      icon: HardDriveDownload,
      badge: null,
    },
    {
      id: 'settings' as AdminTab,
      label: 'إعدادات المتجر وبيانات التواصل',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0" dir="rtl">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white truncate">
                مكتبة الشاطئ الازرق
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="truncate">مركز التحكم المشرف</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white border-white/30' : 'bg-slate-800 text-slate-300 border-slate-700')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
        <button
          onClick={onViewStore}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-sky-400" />
            <span>عرض المتجر المباشر</span>
          </div>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>قفل مركز التحكم وتسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};
