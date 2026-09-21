import React from 'react';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  HardDriveDownload,
  ShieldCheck,
  Tag,
  Layers,
  Sparkles,
  Users,
  Award,
  Wallet,
  Coins,
  Gift,
} from 'lucide-react';
import { Product, Order } from '../../types';
import { AdminTab } from './AdminSidebar';
import { getProductImageUrl, handleImageError } from '../../lib/imageHelper';

interface AdminOverviewProps {
  stats: any;
  recentProducts: Product[];
  recentOrders: Order[];
  recentLogs: any[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenProductModal: (product?: Product) => void;
  formatPrice: (price: number) => string;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  recentProducts,
  recentOrders,
  recentLogs,
  onNavigateTab,
  onOpenProductModal,
  formatPrice,
}) => {
  const primaryCards = [
    {
      title: 'إجمالي المنتجات',
      value: stats?.totalProducts ?? 0,
      subtitle: `${stats?.inStockProducts ?? 0} متوفر بالمخزن`,
      icon: Package,
      color: 'from-sky-500/20 to-blue-600/20 text-sky-400 border-sky-500/30',
      action: () => onNavigateTab('products'),
    },
    {
      title: 'إجمالي الطلبات',
      value: stats?.totalOrders ?? 0,
      subtitle: `${stats?.pendingOrders ?? 0} بانتظار المراجعة`,
      icon: ShoppingBag,
      color: 'from-indigo-500/20 to-purple-600/20 text-indigo-400 border-indigo-500/30',
      action: () => onNavigateTab('orders'),
    },
    {
      title: 'إجمالي المبيعات المؤكدة',
      value: `${(stats?.totalSales ?? 0).toFixed(3)} د.ك`,
      subtitle: 'طلبات مكتملة ومدفوعة',
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30',
      action: () => onNavigateTab('orders'),
    },
    {
      title: 'المنتجات المخفضة',
      value: stats?.discountedProducts ?? 0,
      subtitle: 'منتجات عليها عروض سعرية',
      icon: Tag,
      color: 'from-rose-500/20 to-orange-600/20 text-rose-400 border-rose-500/30',
      action: () => onNavigateTab('products'),
    },
  ];

  const gamificationCards = [
    {
      title: 'إجمالي المستخدمين المسجلين',
      value: stats?.totalRegisteredUsers ?? 0,
      subtitle: 'حسابات نشطة في النظام',
      icon: Users,
      color: 'from-blue-500/20 to-cyan-600/20 text-blue-400 border-blue-500/30',
      action: () => onNavigateTab('users'),
    },
    {
      title: 'المشاركون بالتحديات',
      value: stats?.totalChallengeParticipants ?? 0,
      subtitle: 'مستخدمون خاضوا الألعاب',
      icon: Award,
      color: 'from-amber-500/20 to-yellow-600/20 text-amber-400 border-amber-500/30',
      action: () => onNavigateTab('freeChallenge'),
    },
    {
      title: 'إجمالي مكافآت الألعاب الموزعة',
      value: `${(stats?.totalChallengeRewardsGrantedKwd ?? 0).toFixed(3)} د.ك`,
      subtitle: 'مكتسبة من الألغاز والتحديات',
      icon: Coins,
      color: 'from-purple-500/20 to-fuchsia-600/20 text-purple-400 border-purple-500/30',
      action: () => onNavigateTab('gamification'),
    },
    {
      title: 'الرصيد النشط حالياً في المحافظ',
      value: `${(stats?.activeRewardsBalanceKwd ?? 0).toFixed(3)} د.ك`,
      subtitle: `${(stats?.totalRewardsUsedInOrdersKwd ?? 0).toFixed(3)} د.ك مستخدم بالطلبات`,
      icon: Wallet,
      color: 'from-emerald-500/20 to-green-600/20 text-emerald-400 border-emerald-500/30',
      action: () => onNavigateTab('users'),
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-sky-900/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>لوحة التحكم المباشرة والبيانات اللحظية</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              مرحباً بك في مركز إدارة متجر مكتبة الشاطئ الازرق
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              بيانات حية ومباشرة من قاعدة البيانات لجميع المنتجات، الطلبات، المحافظ والمكافآت، والتحديات التفاعلية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenProductModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-600/20 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>

            <button
              onClick={() => onNavigateTab('sync')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-sky-400" />
              <span>محطة المزامنة</span>
            </button>

            <button
              onClick={() => onNavigateTab('backups')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <HardDriveDownload className="w-4 h-4 text-indigo-400" />
              <span>نسخ احتياطي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-sky-400" />
          <span>المؤشرات الأساسية للمتجر والمبيعات</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={card.action}
                className={`p-5 rounded-2xl bg-slate-900/80 border ${card.color} transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                  <div className="p-2 rounded-xl bg-slate-800/80 group-hover:bg-slate-800 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white tracking-tight mb-1">
                  {card.value}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{card.subtitle}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gamification & Wallet Live Metrics Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-amber-400" />
          <span>مؤشرات المستخدمين ومحفظة المكافآت والألعاب (مباشر من قاعدة البيانات)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gamificationCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={card.action}
                className={`p-5 rounded-2xl bg-slate-900/80 border ${card.color} transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                  <div className="p-2 rounded-xl bg-slate-800/80 group-hover:bg-slate-800 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white tracking-tight mb-1">
                  {card.value}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{card.subtitle}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Orders & Recently Updated Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">أحدث الطلبات</h2>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
            >
              عرض الكل
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              لا توجد طلبات مسجلة حتى الآن
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.slice(0, 5).map(order => (
                <div
                  key={order.id}
                  onClick={() => onNavigateTab('orders')}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {order.customerName}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {order.customerPhone} • {order.area} • {order.items.length} منتجات
                    </div>
                  </div>

                  <div className="text-left space-y-1">
                    <div className="text-xs font-bold text-emerald-400">
                      {formatPrice(order.total)}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        order.orderStatus === 'completed' || order.orderStatus === 'delivered'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : order.orderStatus === 'processing'
                          ? 'bg-sky-950 text-sky-400 border-sky-800'
                          : order.orderStatus === 'shipped'
                          ? 'bg-purple-950 text-purple-400 border-purple-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {order.orderStatus === 'pending'
                        ? 'جديد'
                        : order.orderStatus === 'processing'
                        ? 'قيد التجهيز'
                        : order.orderStatus === 'shipped'
                        ? 'تم الشحن'
                        : order.orderStatus === 'delivered'
                        ? 'تم التوصيل'
                        : order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Modified / Added Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white">المنتجات المحدثة مؤخراً</h2>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
            >
              إدارة المنتجات ({stats?.totalProducts ?? 443})
            </button>
          </div>

          <div className="space-y-2.5">
            {recentProducts.slice(0, 5).map(prod => (
              <div
                key={prod.id}
                onClick={() => onOpenProductModal(prod)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={getProductImageUrl(prod.images?.[0])}
                    alt={prod.title}
                    className="w-11 h-11 rounded-lg object-contain bg-white shrink-0 p-1 border border-slate-700/70"
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                    loading="lazy"
                  />
                  <div className="overflow-hidden space-y-0.5">
                    <h3 className="text-xs font-bold text-white truncate group-hover:text-sky-400 transition-colors">
                      {prod.title}
                    </h3>
                    <div className="text-[10px] text-slate-400 truncate">
                      {prod.categoryName || 'عام'} {prod.sku ? `• SKU: ${prod.sku}` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-left shrink-0 mr-2">
                  <div className="text-xs font-bold text-white">
                    {formatPrice(prod.price)}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      prod.isInStock ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {prod.isInStock ? 'متوفر' : 'نفذت الكمية'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white">سجل العمليات الأخير</h2>
          </div>
          <button
            onClick={() => onNavigateTab('logs')}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
          >
            سجل التدقيق الكامل
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            لا توجد سجلات نشاط حديثة
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {recentLogs.slice(0, 4).map(log => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200">{log.action}</div>
                  <div className="text-[11px] text-slate-400">{log.details}</div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
