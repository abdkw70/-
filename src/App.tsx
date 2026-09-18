import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { GamificationProvider, useGamification } from './context/GamificationContext';
import { FreeChallengeProvider } from './context/FreeChallengeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { ChallengeModal } from './components/gamification/ChallengeModal';
import { EntryChallengeBanner } from './components/gamification/EntryChallengeBanner';
import { FreeChallengeModal } from './components/freeChallenge/FreeChallengeModal';
import { LiveWinnersTicker } from './components/freeChallenge/LiveWinnersTicker';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { WalletPage } from './pages/WalletPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PolicyPages } from './pages/PolicyPages';
import { Chatbot } from "./components/Chatbot";
import { Category } from './types';
import * as api from './lib/api';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCart();
  const { dir, isRtl } = useLanguage();

  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed bottom-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none ${
        isRtl ? 'left-5' : 'right-5'
      }`}
      dir={dir}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200 ${
            t.type === 'error'
              ? 'bg-rose-900 text-rose-100 border-rose-800'
              : t.type === 'info'
              ? 'bg-slate-900 text-slate-100 border-slate-800'
              : 'bg-emerald-900 text-emerald-100 border-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : t.type === 'info' ? (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{t.message}</span>
          </div>

          <button
            onClick={() => removeToast(t.id)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

const MainApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const { isChallengeModalOpen, closeChallengeModal, openChallengeModal } = useGamification();

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.fetchCategories();
        if (res.success) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  // Handle direct navigation to /challenge
  useEffect(() => {
    if (currentPath === '/challenge') {
      openChallengeModal();
    }
  }, [currentPath, openChallengeModal]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      const search = new URLSearchParams(window.location.search);
      const params: Record<string, string> = {};
      search.forEach((val, key) => {
        params[key] = val;
      });
      setQueryParams(params);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, query?: Record<string, string>) => {
    let url = path;
    if (query && Object.keys(query).length > 0) {
      const search = new URLSearchParams(query);
      url = `${path}?${search.toString()}`;
    }

    window.history.pushState({}, '', url);
    setCurrentPath(path);
    setQueryParams(query || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching
  const renderCurrentView = () => {
    if (currentPath === '/' || currentPath === '' || currentPath === '/challenge') {
      return <HomePage categories={categories} onNavigate={navigate} />;
    }

    if (currentPath === '/shop') {
      return <ShopPage categories={categories} initialParams={queryParams} onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/category/')) {
      const handle = decodeURIComponent(currentPath.replace('/category/', ''));
      const cat = categories.find(c => c.handle === handle || c.title === handle);
      const catName = cat ? cat.title : handle.replace(/-/g, ' ');
      return (
        <ShopPage
          categories={categories}
          initialParams={{ ...queryParams, category: catName }}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath.startsWith('/product/')) {
      const idOrHandle = currentPath.replace('/product/', '');
      return <ProductDetailPage idOrHandle={idOrHandle} onNavigate={navigate} />;
    }

    if (currentPath === '/cart') {
      return <CartPage onNavigate={navigate} />;
    }

    if (currentPath === '/checkout') {
      return <CheckoutPage onNavigate={navigate} />;
    }

    if (currentPath === '/wallet') {
      return <WalletPage onNavigate={p => navigate(p.startsWith('/') ? p : `/${p}`)} />;
    }

    if (currentPath === '/login' || currentPath === '/register') {
      return (
        <LoginPage
          onNavigate={navigate}
          initialMode={currentPath === '/register' ? 'register' : 'login'}
        />
      );
    }

    if (currentPath === '/account' || currentPath === '/levels' || currentPath === '/profile') {
      return <AccountPage onNavigate={p => navigate(p.startsWith('/') ? p : `/${p}`)} />;
    }

    if (currentPath.startsWith('/order-confirmation/')) {
      const orderId = currentPath.replace('/order-confirmation/', '');
      return <OrderConfirmationPage orderId={orderId} onNavigate={navigate} />;
    }

    if (currentPath === '/track-order') {
      return <OrderTrackingPage onNavigate={navigate} />;
    }

    if (currentPath === '/admin') {
      return <AdminDashboard onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/policy/')) {
      const type = currentPath.replace('/policy/', '') as 'refund' | 'privacy' | 'terms' | 'shipping';
      return <PolicyPages type={type} onNavigate={navigate} />;
    }

    // Default fallback
    return <HomePage categories={categories} onNavigate={navigate} />;
  };

  const { dir } = useLanguage();
  const isAdminRoute = currentPath === '/admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900 selection:bg-sky-500 selection:text-white" dir={dir}>
      <div>
        {!isAdminRoute && <LiveWinnersTicker />}
        {!isAdminRoute && <EntryChallengeBanner />}
        {!isAdminRoute && <Header categories={categories} currentPath={currentPath} onNavigate={navigate} />}
        <main className={isAdminRoute ? "min-h-screen" : "min-h-[70vh]"}>{renderCurrentView()}</main>
      </div>

      {!isAdminRoute && <Footer categories={categories} onNavigate={navigate} />}
      {!isAdminRoute && <Chatbot onNavigate={navigate} currentPath={currentPath} />}

      {/* Global Modals & Drawers */}
      {!isAdminRoute && <CartDrawer onNavigate={navigate} />}
      {!isAdminRoute && <QuickViewModal onNavigate={navigate} />}
      {!isAdminRoute && <AuthModal />}
      {!isAdminRoute && (
        <ChallengeModal
          isOpen={isChallengeModalOpen}
          onClose={closeChallengeModal}
          onNavigateToShop={() => navigate('/shop')}
        />
      )}
      {!isAdminRoute && <FreeChallengeModal onNavigate={navigate} />}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <GamificationProvider>
            <FreeChallengeProvider>
              <MainApp />
            </FreeChallengeProvider>
          </GamificationProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
