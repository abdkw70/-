import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Product, Category, Order, ImporterStats } from '../types';
import * as api from '../lib/api';
import { Menu, Store, ExternalLink } from 'lucide-react';

import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminCategories } from '../components/admin/AdminCategories';
import { AdminOrders } from '../components/admin/AdminOrders';
import { AdminSync } from '../components/admin/AdminSync';
import { AdminActivityLogs } from '../components/admin/AdminActivityLogs';
import { AdminBackups } from '../components/admin/AdminBackups';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminGamificationManager } from '../components/admin/AdminGamificationManager';
import { AdminFreeChallenge } from '../components/admin/AdminFreeChallenge';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminSecurityLogs } from '../components/admin/AdminSecurityLogs';
import { ProductEditModal } from '../components/admin/ProductEditModal';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { formatPrice, showToast } = useCart();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(api.getAdminToken()));
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Shared Data
  const [stats, setStats] = useState<any>(null);
  const [importerStats, setImporterStats] = useState<ImporterStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProductsForCategories, setAllProductsForCategories] = useState<Product[]>([]);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Partial<Product> | null>(null);

  // Load Main Data
  const loadDashboardData = async () => {
    if (!api.getAdminToken()) return;
    try {
      const [statsRes, impRes, catRes, prodsRes] = await Promise.all([
        api.fetchAdminStats(),
        api.fetchImporterStatus(),
        api.fetchCategories(),
        api.fetchProducts({ limit: 1000 }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
        setRecentProducts(statsRes.recentProducts || []);
        setRecentOrders(statsRes.recentOrders || []);
        setRecentLogs(statsRes.recentLogs || []);
      }
      if (impRes.success) {
        setImporterStats(impRes.stats);
      }
      if (catRes.success) {
        setCategories(catRes.categories);
      }
      if (prodsRes.success) {
        setAllProductsForCategories(prodsRes.products);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      if (err.message && err.message.includes('غير مصرح')) {
        api.clearAdminToken();
        setIsAuthenticated(false);
        showToast('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً', 'error');
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  // Importer polling if running
  useEffect(() => {
    let interval: any;
    if (isAuthenticated && importerStats?.status === 'running') {
      interval = setInterval(async () => {
        try {
          const res = await api.fetchImporterStatus();
          if (res.success) {
            setImporterStats(res.stats);
            if (res.stats.status !== 'running') {
              loadDashboardData();
            }
          }
        } catch {
          // ignore
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated, importerStats?.status]);

  const handleLogout = () => {
    api.clearAdminToken();
    setIsAuthenticated(false);
    showToast('تم تسجيل الخروج وقفل مركز التحكم', 'info');
  };

  const handleOpenProductModal = (product?: Product) => {
    setSelectedProductForEdit(product || null);
    setIsProductModalOpen(true);
  };

  const handleProductSaved = (savedProduct: Product) => {
    loadDashboardData();
  };

  // If not authenticated, show secure passkey lockscreen
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onSuccess={() => {
          setIsAuthenticated(true);
          showToast('مرحباً بك في مركز التحكم', 'success');
        }}
        onBackToStore={() => onNavigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans" dir="rtl">
      {/* Mobile Admin Header Bar */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 pt-safe">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-xl bg-slate-800/90 hover:bg-slate-800 transition-colors cursor-pointer touch-manipulation"
            aria-label="فتح القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-white">مركز التحكم</span>
              <span className="block text-[10px] text-slate-400">مكتبة الشاطئ الازرق</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/')}
          className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
        >
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          <span>المتجر</span>
        </button>
      </header>

      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        onViewStore={() => onNavigate('/')}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        stats={{
          totalProducts: stats?.totalProducts ?? 443,
          pendingOrders: stats?.pendingOrders ?? 0,
          syncStatus: importerStats?.status,
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 overflow-y-auto md:max-h-dvh pb-12 sm:pb-8">
        <div className="max-w-7xl mx-auto space-y-6 min-w-0">
          {activeTab === 'overview' && (
            <AdminOverview
              stats={stats}
              recentProducts={recentProducts}
              recentOrders={recentOrders}
              recentLogs={recentLogs}
              onNavigateTab={setActiveTab}
              onOpenProductModal={handleOpenProductModal}
              formatPrice={formatPrice}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts
              categories={categories}
              onOpenEditModal={handleOpenProductModal}
              onViewProductInStore={handle => onNavigate(`/product/${handle}`)}
              formatPrice={formatPrice}
              showToast={showToast}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories
              categories={categories}
              products={allProductsForCategories}
              onSelectCategoryFilter={categoryTitle => {
                setActiveTab('products');
              }}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              formatPrice={formatPrice}
              showToast={showToast}
            />
          )}

          {activeTab === 'freeChallenge' && (
            <AdminFreeChallenge />
          )}

          {activeTab === 'gamification' && (
            <AdminGamificationManager
              formatPrice={formatPrice}
              showToast={showToast}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsers passcode={api.getAdminToken() || ''} />
          )}

          {activeTab === 'security' && (
            <AdminSecurityLogs passcode={api.getAdminToken() || ''} />
          )}

          {activeTab === 'sync' && (
            <AdminSync
              importerStats={importerStats}
              onRefreshStats={loadDashboardData}
              showToast={showToast}
            />
          )}

          {activeTab === 'logs' && (
            <AdminActivityLogs showToast={showToast} />
          )}

          {activeTab === 'backups' && (
            <AdminBackups
              onDatabaseRestored={loadDashboardData}
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings showToast={showToast} />
          )}
        </div>
      </main>

      {/* Product Edit / Create Modal */}
      <ProductEditModal
        isOpen={isProductModalOpen}
        product={selectedProductForEdit}
        categories={categories}
        onClose={() => setIsProductModalOpen(false)}
        onSaved={handleProductSaved}
        showToast={showToast}
      />
    </div>
  );
};
