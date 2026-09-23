import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem, Product, StoreSettings } from '../types';
import * as api from '../lib/api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CartContextType {
  cart: Cart | null;
  storeSettings: StoreSettings | null;
  refreshSettings: () => Promise<void>;
  sessionId: string;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addItemToCart: (product: Product, variantId?: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCouponCode: (code: string) => Promise<string>;
  applyCoupon: (code: string) => Promise<string>;
  removeCouponCode: () => Promise<void>;
  removeCoupon: () => Promise<void>;
  totalItemsCount: number;
  formatPrice: (amount: number | null | undefined) => string;
  // Quick View
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getSessionId(): string {
  let id = localStorage.getItem('mq_session_id');
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('mq_session_id', id);
  }
  return id;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mq_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  const sessionId = getSessionId();

  const refreshSettings = useCallback(async () => {
    try {
      const res = await api.fetchStoreSettings();
      if (res.success && res.settings) {
        setStoreSettings(res.settings);
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
    }
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const [cartRes] = await Promise.all([
        api.fetchCart(sessionId),
        refreshSettings(),
      ]);
      if (cartRes.success) {
        setCart(cartRes.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, refreshSettings]);

  useEffect(() => {
    loadCart();

    const handlePromoUpdated = () => {
      loadCart();
    };
    window.addEventListener('promotion-updated', handlePromoUpdated);
    return () => {
      window.removeEventListener('promotion-updated', handlePromoUpdated);
    };
  }, [loadCart]);

  const addItemToCart = async (product: Product, variantId?: string, quantity = 1) => {
    try {
      const res = await api.addToCart(sessionId, {
        productId: product.id,
        variantId,
        quantity,
      });
      if (res.success) {
        setCart(res.cart);
        setIsCartOpen(true);
        showToast(`تمت إضافة "${product.title}" إلى سلة المشتريات`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'تعذر إضافة المنتج إلى السلة', 'error');
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await api.updateCartItem(sessionId, { itemId, quantity });
      if (res.success) {
        setCart(res.cart);
      }
    } catch (err: any) {
      showToast(err.message || 'تعذر تحديث الكمية', 'error');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await api.removeCartItem(sessionId, itemId);
      if (res.success) {
        setCart(res.cart);
        showToast('تم حذف المنتج من السلة', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'تعذر حذف المنتج', 'error');
    }
  };

  const applyCouponCode = async (code: string): Promise<string> => {
    try {
      const res = await api.applyCoupon(sessionId, code);
      if (res.success) {
        setCart(res.cart);
        const toastType = res.eligible === false ? 'info' : 'success';
        showToast(res.message, toastType);
        return res.message;
      }
      throw new Error('فشل تطبيق الكود');
    } catch (err: any) {
      showToast(err.message || 'كود الخصم غير صالح', 'error');
      throw err;
    }
  };

  const removeCouponCode = async (): Promise<void> => {
    try {
      const res = await api.removeCoupon(sessionId);
      if (res.success) {
        setCart(res.cart);
        showToast(res.message || 'تم إلغاء كود الخصم', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'تعذر إلغاء كود الخصم', 'error');
    }
  };

  const formatPrice = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) return '٠.٠٠٠ د.ك';
    // Clean KWD format with 3 decimal places
    const formatted = Number(amount).toFixed(3);
    return `${formatted} د.ك`;
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('mq_wishlist', JSON.stringify(next));
      showToast(prev.includes(productId) ? 'تمت إزالة المنتج من المفضلة' : 'تمت إضافة المنتج إلى المفضلة', 'info');
      return next;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const totalItemsCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        storeSettings,
        refreshSettings,
        sessionId,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addItemToCart,
        updateItemQuantity,
        removeItem,
        applyCouponCode,
        applyCoupon: applyCouponCode,
        removeCouponCode,
        removeCoupon: removeCouponCode,
        totalItemsCount,
        formatPrice,
        quickViewProduct,
        openQuickView: (p: Product) => setQuickViewProduct(p),
        closeQuickView: () => setQuickViewProduct(null),
        wishlist,
        toggleWishlist,
        isInWishlist,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
