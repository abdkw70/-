import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../db';
import { storeImporter, SyncMode } from '../importer';
import { Product, Order, Review, Category, ActivityLog } from '../types';
import { gamificationEngine, getXpProgressForLevel } from '../gamification';
import { authService } from '../authService';

import { aiChatRouter } from "./aiChat.js";

export const apiRouter = Router();

apiRouter.use("/ai-chat", aiChatRouter);

const ADMIN_PASSCODE = '7402';
const ADMIN_AUTH_TOKEN = 'mq_admin_7402_authenticated_session';

// Admin Auth Middleware
const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-admin-token'] as string;
  const passcode = req.headers['x-admin-passcode'] as string;

  if (token === ADMIN_AUTH_TOKEN || passcode === ADMIN_PASSCODE) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'غير مصرح لك بالدخول، يرجى إدخال رمز الدخول الصحيح لمركز التحكم',
  });
};

// Verify Admin Passcode Endpoint
apiRouter.post('/admin/verify', (req, res) => {
  const { passcode } = req.body;
  if (passcode === ADMIN_PASSCODE) {
    return res.json({
      success: true,
      token: ADMIN_AUTH_TOKEN,
      message: 'تم التحقق من رمز الدخول بنجاح',
    });
  }
  return res.status(401).json({
    success: false,
    error: 'رمز الدخول غير صحيح، يرجى المحاولة مرة أخرى',
  });
});

// ==========================================
// PRODUCTS ENDPOINTS
// ==========================================

apiRouter.get('/products', (req, res) => {
  try {
    let products = db.getProducts();

    const {
      q,
      category,
      subcategory,
      minPrice,
      maxPrice,
      inStock,
      hasDiscount,
      isFeatured,
      isBestSeller,
      isNewArrival,
      sort,
      page = '1',
      limit = '24',
    } = req.query;

    // Search
    if (typeof q === 'string' && q.trim()) {
      const searchTerms = q.toLowerCase().trim().split(/\s+/);
      products = products.filter(p => {
        const text = `${p.title} ${p.description || ''} ${p.sku || ''} ${p.categoryName || ''} ${p.subcategoryName || ''}`.toLowerCase();
        return searchTerms.every(term => text.includes(term));
      });
    }

    // Category filter
    if (typeof category === 'string' && category.trim() && category !== 'all' && category !== 'الكل') {
      const cat = category.trim();
      products = products.filter(p => p.categoryName === cat || p.categoryId === cat || p.subcategoryName === cat);
    }

    // Subcategory filter
    if (typeof subcategory === 'string' && subcategory.trim()) {
      const sub = subcategory.trim();
      products = products.filter(p => p.subcategoryName === sub);
    }

    // Price filters
    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) products = products.filter(p => p.price >= min);
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) products = products.filter(p => p.price <= max);
    }

    // Stock filter
    if (inStock === 'true') {
      products = products.filter(p => p.isInStock);
    }

    // Discount filter
    if (hasDiscount === 'true') {
      products = products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price);
    }

    // Featured / Best Seller / New Arrival
    if (isFeatured === 'true') {
      products = products.filter(p => p.isFeatured);
    }
    if (isBestSeller === 'true') {
      products = products.filter(p => p.isBestSeller);
    }
    if (isNewArrival === 'true') {
      products = products.filter(p => p.isNewArrival);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        products.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // Default popularity / priority
        break;
    }

    const total = products.length;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 24));
    const totalPages = Math.ceil(total / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(offset, offset + limitNum);

    res.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Search suggestions
apiRouter.get('/products/suggestions', (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.json({ success: true, suggestions: [] });
  }

  const term = q.toLowerCase().trim();
  const products = db.getProducts();
  const matched = products
    .filter(p => p.title.toLowerCase().includes(term) || (p.categoryName && p.categoryName.toLowerCase().includes(term)))
    .slice(0, 6)
    .map(p => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      price: p.price,
      image: p.images[0]?.src || '',
      categoryName: p.categoryName,
    }));

  res.json({ success: true, suggestions: matched });
});

// Single product by ID or handle
apiRouter.get('/products/:idOrHandle', (req, res) => {
  const { idOrHandle } = req.params;
  const decoded = decodeURIComponent(idOrHandle);
  const products = db.getProducts();

  const product = products.find(p => p.id === decoded || p.handle === decoded || p.title === decoded);

  if (!product) {
    return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
  }

  // Related products
  const related = products
    .filter(p => p.id !== product.id && (p.categoryName === product.categoryName || p.categoryId === product.categoryId))
    .slice(0, 8);

  res.json({
    success: true,
    product,
    relatedProducts: related,
  });
});

// ==========================================
// CATEGORIES & HOMEPAGE SECTIONS
// ==========================================

apiRouter.get('/categories', (req, res) => {
  const categories = db.getCategories();
  const products = db.getProducts();

  // Return only visible categories to public store, sorted by displayOrder
  const enriched = categories
    .filter(cat => cat.isVisible !== false)
    .map(cat => {
      const count = products.filter(p => p.categoryName === cat.title || p.categoryId === cat.id || p.subcategoryName === cat.title).length;
      return { ...cat, productCount: count };
    })
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

  res.json({ success: true, categories: enriched });
});

apiRouter.get('/featured', (req, res) => {
  const products = db.getProducts();
  const categories = db.getCategories();
  const settings = db.getSettings();

  const newArrivals = products.filter(p => p.isNewArrival || true).slice(0, 12);
  const bestSellers = products.filter(p => p.isBestSeller || true).slice(12, 24);
  const discounts = products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 12);

  // Group some category spotlights
  const bagProducts = products.filter(p => p.categoryName?.includes('الشنط')).slice(0, 8);
  const artProducts = products.filter(p => p.categoryName?.includes('رسم')).slice(0, 8);
  const schoolProducts = products.filter(p => p.categoryName?.includes('مدرسية')).slice(0, 8);
  const officeProducts = products.filter(p => p.categoryName?.includes('مكتبية')).slice(0, 8);

  const heroBanners = [
    {
      id: 'banner_1',
      title: 'مجموعة الشنط المدرسية الفاخرة',
      subtitle: 'أحدث التشكيلات لجميع المراحل الدراسية مع طقم كامل',
      buttonText: 'تسوق الشنط الآن',
      titleEn: 'Luxury School Backpacks Collection',
      subtitleEn: 'Latest sets for all school grades with matching accessories',
      buttonTextEn: 'Shop Backpacks Now',
      link: '/category/الشنط-المدرسية',
      image: 'https://assets.wuiltstore.com/cl47esml802x201draeqa6a8e_cl47dtprh02vx01dr79idcuyy_cl46uz56902cj01dr6n680o1g_cl406nbms00hn37706d4it5g5_Untitled-4.jpg',
      badge: 'وصل حديثاً',
      badgeEn: 'New Arrivals',
      color: 'from-blue-900/80 to-indigo-950/90',
    },
    {
      id: 'banner_2',
      title: 'عالم الرسم والفنون التشكيلية',
      subtitle: 'ألوان أكرليك، كانفس، ألوان فابر كاستل ومستلزمات الفنانين',
      buttonText: 'استكشف أدوات الرسم',
      titleEn: 'Fine Arts & Painting World',
      subtitleEn: 'Acrylic paints, stretched canvas, Faber-Castell and professional artist supplies',
      buttonTextEn: 'Explore Art Tools',
      link: '/category/لوحات-وادوات-رسم',
      image: 'https://assets.wuiltstore.com/cl3xaidjc00iq3772qujdgvr8_%25D9%2585%25D8%25AC%25D9%2585%25D9%2588%25D8%25B9%25D8%25A9_%25D8%25A7%25D8%25AF%25D9%2588%25D8%25A7%25D8%25AA_%25D8%25A7%25D9%2584%25D8%25B1%25D8%25B3%25D9%2585.jpg',
      badge: 'جودة فائقة',
      badgeEn: 'Premium Quality',
      color: 'from-amber-900/80 to-rose-950/90',
    },
    {
      id: 'banner_3',
      title: 'وسائل وألعاب تعليمية وتربوية',
      subtitle: 'تطوير مهارات الطفل، البزل، بطاقات الحروف والأرقام',
      buttonText: 'تسوق الأدوات التعليمية',
      titleEn: 'Educational & Learning Toys',
      subtitleEn: 'Skill-building puzzles, flashcards, letters, numbers, and creative STEM toys',
      buttonTextEn: 'Shop Educational Toys',
      link: '/category/الادوات-التعليمية',
      image: 'https://assets.wuiltstore.com/cl4pohysp0ez701gsdu3b9vjk_cl4poh53s0ez501gs8cpi15hn_cl46v23mk02ck01dr9lwkd9ai_cl46ue00602c301dr4o6maj78_cl3xbha3u00kp3772tro8vvsm_1607183030017267-19.jpg',
      badge: 'عروض حصرية',
      badgeEn: 'Exclusive Deals',
      color: 'from-emerald-900/80 to-teal-950/90',
    },
  ];

  res.json({
    success: true,
    heroBanners,
    newArrivals,
    bestSellers,
    discounts,
    categorySections: [
      { category: 'الشنط المدرسية', title: 'شنط المدارس والشخصيات', titleEn: 'School Bags & Character Backpacks', products: bagProducts },
      { category: 'لوحات وادوات رسم', title: 'أدوات ولوحات الرسم الاحترافية', titleEn: 'Professional Art Supplies & Canvases', products: artProducts },
      { category: 'الادوات المدرسية', title: 'القرطاسية والأدوات المدرسية', titleEn: 'Stationery & School Essentials', products: schoolProducts },
      { category: 'الادوات المكتبية', title: 'مستلزمات المكاتب والشركات', titleEn: 'Office Supplies & Corporate Stationery', products: officeProducts },
    ],
    settings,
  });
});

// ==========================================
// CART ENDPOINTS
// ==========================================

apiRouter.get('/cart/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const cart = db.getCart(sessionId);
  res.json({ success: true, cart });
});

apiRouter.post('/cart/:sessionId/add', (req, res) => {
  const { sessionId } = req.params;
  const { productId, variantId, quantity = 1 } = req.body;

  const product = db.getProductById(productId);
  if (!product) {
    return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
  }

  const cart = db.getCart(sessionId);
  const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
  const unitPrice = variant?.price || product.price;

  const optionsSummary = variant?.selectedOptions?.map(o => `${o.optionName}: ${o.valueName}`).join('، ');

  const existingIdx = cart.items.findIndex(i => i.productId === productId && (!variantId || i.variantId === variantId));

  if (existingIdx >= 0) {
    cart.items[existingIdx].quantity += Number(quantity);
  } else {
    cart.items.push({
      id: `cart_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      variantId: variant?.id,
      sku: variant?.sku || product.sku,
      title: product.title,
      handle: product.handle,
      image: (typeof variant?.image === 'string' ? variant.image : variant?.image?.src) || product.images[0]?.src || '',
      price: unitPrice,
      compareAtPrice: variant?.compareAtPrice || product.compareAtPrice,
      quantity: Number(quantity),
      selectedOptionsSummary: optionsSummary,
    });
  }

  db.updateCart(sessionId, cart);
  res.json({ success: true, cart: db.getCart(sessionId) });
});

apiRouter.post('/cart/:sessionId/update', (req, res) => {
  const { sessionId } = req.params;
  const { itemId, quantity } = req.body;

  const cart = db.getCart(sessionId);
  const qty = Number(quantity);

  if (qty <= 0) {
    cart.items = cart.items.filter(i => i.id !== itemId);
  } else {
    const item = cart.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = qty;
    }
  }

  db.updateCart(sessionId, cart);
  res.json({ success: true, cart: db.getCart(sessionId) });
});

apiRouter.post('/cart/:sessionId/remove', (req, res) => {
  const { sessionId } = req.params;
  const { itemId } = req.body;

  const cart = db.getCart(sessionId);
  cart.items = cart.items.filter(i => i.id !== itemId);

  db.updateCart(sessionId, cart);
  res.json({ success: true, cart: db.getCart(sessionId) });
});

apiRouter.post('/cart/:sessionId/coupon', (req, res) => {
  const { sessionId } = req.params;
  const { code, userId } = req.body;

  const cart = db.getCart(sessionId);
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, error: 'السلة فارغة، أضف منتجات قبل تطبيق كود الخصم' });
  }

  const cleanCode = (code || '').trim();
  if (!cleanCode) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال كود الخصم' });
  }

  const validation = db.validateCoupon(cleanCode, cart.subtotal, userId);
  if (!validation.coupon) {
    return res.status(400).json({ success: false, error: validation.error || 'كود الخصم غير صالح أو منتهي الصلاحية' });
  }

  // Save coupon code to cart and recalculate via central engine
  cart.couponCode = validation.coupon.code;
  db.updateCart(sessionId, cart);

  const updatedCart = db.getCart(sessionId);

  if (!validation.valid) {
    return res.json({
      success: true,
      eligible: false,
      message: validation.error || 'تم حفظ كود الخصم، أضف المزيد من المنتجات لتفعيله.',
      discountAmount: 0,
      remainingForMin: validation.remainingForMin || 0,
      coupon: validation.coupon,
      cart: updatedCart,
    });
  }

  res.json({
    success: true,
    eligible: true,
    message: validation.coupon.discountType === 'free_shipping'
      ? 'تم تفعيل التوصيل المجاني بنجاح!'
      : `تم تطبيق خصم ${updatedCart.discount.toFixed(3)} د.ك بنجاح!`,
    discountAmount: updatedCart.discount,
    coupon: validation.coupon,
    cart: updatedCart,
  });
});

apiRouter.delete('/cart/:sessionId/coupon', (req, res) => {
  const { sessionId } = req.params;
  const cart = db.getCart(sessionId);
  cart.couponCode = undefined;
  cart.discount = 0;
  cart.shippingFee = db.calculateShippingFee(cart.subtotal);
  cart.total = Number((cart.subtotal + cart.shippingFee).toFixed(3));
  db.updateCart(sessionId, cart);
  res.json({ success: true, message: 'تم إلغاء كود الخصم', cart: db.getCart(sessionId) });
});

// ==========================================
// CHECKOUT & ORDERS
// ==========================================

apiRouter.post('/checkout', (req, res) => {
  try {
    const {
      sessionId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      governorate,
      area,
      block,
      street,
      avenue,
      building,
      floor,
      notes,
      paymentMethod = 'cash_on_delivery',
      useWalletBalance = false,
      couponCode,
      freeCartToken,
      challengeDiscountToken,
    } = req.body;

    if (!customerName || !customerPhone || !governorate || !area || !block || !street) {
      return res.status(400).json({ success: false, error: 'يرجى استكمال جميع بيانات العميل والعنوان المطلوبة داخل دولة الكويت' });
    }

    const cart = db.getCart(sessionId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'سلة المشتريات فارغة' });
    }

    // Restrict payment method exclusively to Cash on Delivery or WhatsApp
    const safePaymentMethod = paymentMethod === 'whatsapp' ? 'whatsapp' : 'cash_on_delivery';

    const orderNumber = `MQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord_${Date.now()}`;
    const effectiveUserId = userId || sessionId;

    // Server-side recalculation of genuine product prices
    const verifiedItems = cart.items.map(item => {
      const prod = db.getProductById(item.productId);
      const variant = prod?.variants.find(v => v.id === item.variantId) || prod?.variants[0];
      const genuinePrice = variant?.price ?? prod?.price ?? item.price;
      const lineTotal = Number((genuinePrice * item.quantity).toFixed(3));
      return {
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku || variant?.sku || prod?.sku,
        title: prod?.title || item.title,
        handle: prod?.handle || item.handle,
        image: item.image || prod?.images[0]?.src || '',
        price: genuinePrice,
        quantity: item.quantity,
        lineTotal,
        selectedOptionsSummary: item.selectedOptionsSummary,
      };
    });

    const realSubtotal = Number(verifiedItems.reduce((acc, it) => acc + it.lineTotal, 0).toFixed(3));

    // Coupon validation on server-side
    let couponDiscount = 0;
    let validatedCoupon: any = null;
    const appliedCouponCode = (couponCode || cart.couponCode || '').trim();

    if (appliedCouponCode) {
      const cRes = db.validateCoupon(appliedCouponCode, realSubtotal, effectiveUserId);
      if (cRes.valid && cRes.coupon) {
        couponDiscount = cRes.discountAmount;
        validatedCoupon = cRes.coupon;
      }
    }

    // Apply wallet balance if opted in (applied on remaining subtotal after coupon)
    let walletDiscount = 0;
    const subtotalAfterCoupon = Math.max(0, realSubtotal - couponDiscount);
    if (useWalletBalance && effectiveUserId && subtotalAfterCoupon > 0) {
      const gamSettings = gamificationEngine.getXpRules();
      const userWallet = (db as any).getUserWallet ? (db as any).getUserWallet(effectiveUserId) : null;
      if (userWallet && userWallet.activeBalance > 0) {
        const eligibleAmount = Math.min(userWallet.activeBalance, subtotalAfterCoupon);
        if (eligibleAmount > 0) {
          walletDiscount = eligibleAmount;
        }
      }
    }

    // Shipping fee calculation strictly on server
    const isFreeShipping = validatedCoupon?.discountType === 'free_shipping' || appliedCouponCode.toUpperCase() === 'FREE';
    const serverShippingFee = isFreeShipping ? 0 : db.calculateShippingFee(realSubtotal, appliedCouponCode);

    const totalDiscount = Number((couponDiscount + walletDiscount).toFixed(3));
    const subtotalAfterDiscount = Number(Math.max(0, realSubtotal - couponDiscount).toFixed(3));
    const finalTotal = Number(Math.max(0, realSubtotal - totalDiscount + serverShippingFee).toFixed(3));

    let noteExtra = '';
    if (validatedCoupon) {
      noteExtra += ` [🎟️ كود الخصم: ${validatedCoupon.code} (-${couponDiscount.toFixed(3)} د.ك)]`;
    }
    if (walletDiscount > 0) {
      noteExtra += ` [💳 رصيد محفظة: -${walletDiscount.toFixed(3)} د.ك]`;
    }

    const order: Order = {
      id: orderId,
      orderNumber,
      customerName,
      customerEmail: customerEmail || 'customer@bluebeach-q8.com',
      customerPhone,
      governorate,
      area,
      block,
      street,
      avenue,
      building,
      floor,
      notes: notes ? `${notes}${noteExtra}` : (noteExtra ? noteExtra.trim() : undefined),
      paymentMethod: safePaymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      items: verifiedItems,
      subtotal: realSubtotal,
      shippingFee: serverShippingFee,
      discount: totalDiscount,
      total: finalTotal,
      currency: 'د.ك',
      couponCode: validatedCoupon?.code || (couponDiscount > 0 ? appliedCouponCode : undefined),
      discountSource: validatedCoupon?.source,
      discountType: validatedCoupon?.discountType || (couponDiscount > 0 ? 'percentage' : undefined),
      discountValue: validatedCoupon?.discountValue,
      actualDiscountAmount: couponDiscount,
      subtotalBeforeDiscount: realSubtotal,
      subtotalAfterDiscount,
      walletDiscount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addOrder(order);

    // Record Coupon Usage in history log
    if (validatedCoupon && couponDiscount > 0) {
      db.recordCouponUsage({
        couponId: validatedCoupon.id,
        couponCode: validatedCoupon.code,
        userId: effectiveUserId,
        customerName,
        customerPhone,
        orderId,
        orderNumber,
        source: validatedCoupon.source,
        discountType: validatedCoupon.discountType,
        discountValue: validatedCoupon.discountValue,
        actualDiscountAmount: couponDiscount,
        subtotalBeforeDiscount: realSubtotal,
        subtotalAfterDiscount,
        shippingAmount: serverShippingFee,
        finalTotal,
        expiresAt: validatedCoupon.expiresAt,
      });
    }

    // Empty user cart
    cart.items = [];
    cart.discount = 0;
    cart.couponCode = undefined;
    cart.total = 0;
    db.updateCart(sessionId, cart);

    res.json({
      success: true,
      order,
      subtotalBeforeDiscount: realSubtotal,
      actualDiscountAmount: couponDiscount,
      walletDiscount,
      subtotalAfterDiscount,
      shippingFee: serverShippingFee,
      finalTotal,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/orders', (req, res) => {
  const { phone, orderNumber, q } = req.query;
  let orders = db.getOrders();

  if (phone) {
    orders = orders.filter(o => o.customerPhone.includes(phone as string));
  }
  if (orderNumber) {
    orders = orders.filter(o => o.orderNumber === orderNumber || o.id === orderNumber);
  }
  if (q && typeof q === 'string') {
    const term = q.toLowerCase().trim();
    orders = orders.filter(o =>
      o.orderNumber.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerPhone.includes(term)
    );
  }

  res.json({ success: true, orders });
});

apiRouter.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
  }
  res.json({ success: true, order });
});

apiRouter.patch('/orders/:id/status', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;
  const success = db.updateOrderStatus(id, orderStatus, paymentStatus);
  if (!success) {
    return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
  }
  res.json({ success: true, order: db.getOrderById(id) });
});

// ==========================================
// REVIEWS
// ==========================================

apiRouter.get('/reviews/:productId', (req, res) => {
  const { productId } = req.params;
  const reviews = db.getReviews(productId);
  res.json({ success: true, reviews });
});

apiRouter.post('/reviews', (req, res) => {
  const { productId, authorName, rating, comment } = req.body;
  if (!productId || !authorName || !rating || !comment) {
    return res.status(400).json({ success: false, error: 'يرجى إكمال جميع حقول التقييم' });
  }

  const review: Review = {
    id: `rev_${Date.now()}`,
    productId,
    authorName,
    rating: Math.max(1, Math.min(5, Number(rating))),
    comment,
    isVerifiedPurchase: true,
    createdAt: new Date().toISOString(),
  };

  db.addReview(review);
  res.json({ success: true, review });
});

// ==========================================
// USER ADDRESSES API
// ==========================================

apiRouter.get('/user/addresses', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'guest';
    const addresses = db.getAddresses(userId);
    res.json({ success: true, addresses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/user/addresses', (req, res) => {
  try {
    const { userId, title, customerName, customerPhone, governorate, area, block, street, avenue, building, floor, apartment, notes, isDefault } = req.body;
    if (!customerName || !customerPhone || !block || !street || !building) {
      return res.status(400).json({ success: false, error: 'يرجى ملء جميع الحقول الأساسية للعنوان' });
    }

    const address = db.upsertAddress({
      id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || 'guest',
      title: title || 'المنزل',
      customerName,
      customerPhone,
      governorate: governorate || 'العاصمة',
      area: area || 'مدينة الكويت',
      block,
      street,
      avenue,
      building,
      floor,
      apartment,
      notes,
      isDefault: Boolean(isDefault),
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, address });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/user/addresses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.getAddressById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'العنوان غير موجود' });
    }

    const updated = db.upsertAddress({
      ...existing,
      ...req.body,
      id,
    });

    res.json({ success: true, address: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/user/addresses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string | undefined;
    const deleted = db.deleteAddress(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'العنوان غير موجود أو لا تملك صلاحية حذفه' });
    }
    res.json({ success: true, message: 'تم حذف العنوان بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/user/addresses/:id/default', (req, res) => {
  try {
    const { id } = req.params;
    const { userId = 'guest' } = req.body;
    const updated = db.setDefaultAddress(id, userId);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'العنوان غير موجود' });
    }
    res.json({ success: true, message: 'تم تعيين العنوان كافتراضي' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// WALLET MANAGEMENT API
// ==========================================

apiRouter.post('/wallet/topup', (req, res) => {
  try {
    const { userId = 'guest', amount, paymentMethod = 'knet' } = req.body;
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: 'المبلغ غير صالح' });
    }

    const gamSettings = gamificationEngine.getSettings();
    const minTopup = (gamSettings as any).walletMinTopup ?? 5.0;
    const maxBalance = (gamSettings as any).walletMaxBalance ?? 5.0;

    if (numericAmount < minTopup) {
      return res.status(400).json({ success: false, error: `الحد الأدنى للشحن هو ${minTopup.toFixed(3)} د.ك` });
    }

    const currentWallet = gamificationEngine.getUserWallet(userId);
    if (currentWallet.activeBalance + numericAmount > maxBalance) {
      return res.status(400).json({
        success: false,
        error: `الرصيد بعد الشحن سيصبح ${(currentWallet.activeBalance + numericAmount).toFixed(3)} د.ك وهو يتجاوز الحد الأقصى المسموح (${maxBalance.toFixed(3)} د.ك)`,
      });
    }

    // Add wallet reward item
    const rewardItem = gamificationEngine.addWalletReward(
      userId,
      numericAmount,
      'order' as any,
      `topup_${paymentMethod}_${Date.now()}`,
      `شحن رصيد المحفظة عبر ${paymentMethod === 'knet' ? 'كي نت (K-Net)' : 'البطاقة الائتمانية'}`
    );

    const updatedWallet = gamificationEngine.getUserWallet(userId);
    db.logActivity('شحن رصيد المحفظة', 'order', `قام العميل (${userId}) بشحن رصيده بقيمة ${numericAmount.toFixed(3)} د.ك`, 'success');

    res.json({
      success: true,
      wallet: updatedWallet,
      transaction: updatedWallet.transactions[0],
      message: `تم شحن رصيد ${numericAmount.toFixed(3)} د.ك إلى محفظتك بنجاح`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/admin/wallet/transactions', requireAdminAuth, (req, res) => {
  try {
    const raw = (db as any).data;
    const wallets = raw.wallets || {};
    const allTx: any[] = [];

    for (const [uid, wallet] of Object.entries(wallets as Record<string, any>)) {
      const profile = gamificationEngine.getUserProfile(uid);
      (wallet.transactions || []).forEach((tx: any) => {
        allTx.push({
          ...tx,
          userName: profile.displayName || 'عميل المتجر',
          userEmail: profile.email || '',
          userPhone: profile.phone || '',
        });
      });
    }

    allTx.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, transactions: allTx });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/wallet/adjust', requireAdminAuth, (req, res) => {
  try {
    const { userId, amount, type = 'credit', reason = 'تعديل إداري' } = req.body;
    const numAmount = Number(amount);
    if (!userId || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'بيانات التعديل غير مكتملة' });
    }

    const wallet = gamificationEngine.getUserWallet(userId);
    const now = new Date().toISOString();
    const txId = `tx_adj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (type === 'credit') {
      gamificationEngine.addWalletReward(
        userId,
        numAmount,
        'admin' as any,
        txId,
        `تعديل إداري (إيداع): ${reason}`,
        txId
      );
    } else {
      if (wallet.activeBalance < numAmount) {
        return res.status(400).json({ success: false, error: 'رصيد العميل غير كافٍ للخصم' });
      }
      wallet.activeBalance = Number((wallet.activeBalance - numAmount).toFixed(3));
      wallet.usedBalance = Number((wallet.usedBalance + numAmount).toFixed(3));
      wallet.transactions.unshift({
        id: txId,
        userId,
        type: 'debit',
        amount: Number(numAmount.toFixed(3)),
        balanceAfter: wallet.activeBalance,
        description: `تعديل إداري (خصم): ${reason}`,
        createdAt: now,
      });
      db.save();
    }

    const updatedWallet = gamificationEngine.getUserWallet(userId);
    db.logActivity('تعديل محفظة إداري', 'settings', `تم ${type === 'credit' ? 'إيداع' : 'خصم'} ${numAmount.toFixed(3)} د.ك للمستخدم (${userId}) - ${reason}`, 'warning');

    res.json({ success: true, wallet: updatedWallet, message: 'تم تعديل رصيد المحفظة بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ==========================================
// IMPORTER & SYNC STATION
// ==========================================

apiRouter.get('/importer/status', requireAdminAuth, (req, res) => {
  const stats = storeImporter.getStatus();
  res.json({ success: true, stats });
});

apiRouter.post('/importer/start', requireAdminAuth, async (req, res) => {
  const { mode = 'sync' } = req.body;
  // Trigger asynchronously so API responds immediately
  storeImporter.start(mode as SyncMode);
  res.json({ success: true, message: `تم إطلاق محرك المزامنة بنجاح في وضع: ${mode}` });
});

apiRouter.post('/importer/stop', requireAdminAuth, (req, res) => {
  storeImporter.stop();
  res.json({ success: true, message: 'تم إرسال أمر إيقاف المزامنة' });
});

// ==========================================
// ADMIN CONTROL CENTER ENDPOINTS
// ==========================================

// 1. Stats & Dashboard Overview
apiRouter.get('/admin/stats', requireAdminAuth, (req, res) => {
  const products = db.getProducts();
  const categories = db.getCategories();
  const orders = db.getOrders();
  const logs = db.getActivityLogs().slice(0, 10);
  const importerStats = db.getImporterStats();

  const totalSales = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
  const processingOrders = orders.filter(o => o.orderStatus === 'processing').length;
  const shippedOrders = orders.filter(o => o.orderStatus === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered' || o.orderStatus === 'completed').length;
  const cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled').length;

  const inStockProducts = products.filter(p => p.isInStock).length;
  const outOfStockProducts = products.filter(p => !p.isInStock).length;
  const discountedProducts = products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price).length;

  // Recent products modified or added
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 8);

  // Recent orders
  const recentOrders = orders.slice(0, 8);

  // Real-time Database Gamification & Wallet Stats
  const gamificationStats = gamificationEngine.getGamificationStats();
  const allUsers = gamificationEngine.getAllUsersSummary();
  const activeRewardsBalance = allUsers.reduce((sum, u) => sum + (u.activeWalletBalance || 0), 0);
  const challengeParticipantsCount = allUsers.filter(u => u.challengesPlayed > 0).length;

  res.json({
    success: true,
    stats: {
      totalProducts: products.length,
      inStockProducts,
      outOfStockProducts,
      discountedProducts,
      totalCategories: categories.length,
      totalOrders: orders.length,
      totalSales: Number(totalSales.toFixed(3)),
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRegisteredUsers: allUsers.length,
      totalChallengeParticipants: challengeParticipantsCount,
      totalChallengeRewardsGrantedKwd: gamificationStats.totalRewardsDistributedKwd,
      activeRewardsBalanceKwd: Number(activeRewardsBalance.toFixed(3)),
      totalRewardsUsedInOrdersKwd: gamificationStats.totalRewardsUsedInOrdersKwd,
      totalRewardsExpiredKwd: gamificationStats.totalRewardsExpiredKwd,
      lastSyncAt: importerStats.lastSyncAt,
      syncStatus: importerStats.status,
    },
    recentProducts,
    recentOrders,
    recentLogs: logs,
  });
});

// 2. Admin Products List with Advanced Filters & Pagination
apiRouter.get('/admin/products', requireAdminAuth, (req, res) => {
  try {
    let products = db.getProducts();

    const {
      q,
      category,
      subcategory,
      stockStatus,
      minPrice,
      maxPrice,
      hasDiscount,
      sort = 'updated',
      page = '1',
      limit = '25',
    } = req.query;

    // Search query
    if (typeof q === 'string' && q.trim()) {
      const searchTerms = q.toLowerCase().trim().split(/\s+/);
      products = products.filter(p => {
        const text = `${p.title} ${p.description || ''} ${p.sku || ''} ${p.id || ''} ${p.handle || ''} ${p.categoryName || ''} ${p.subcategoryName || ''}`.toLowerCase();
        return searchTerms.every(term => text.includes(term));
      });
    }

    // Category filter
    if (typeof category === 'string' && category.trim() && category !== 'all' && category !== 'الكل') {
      const cat = category.trim();
      products = products.filter(p => p.categoryName === cat || p.categoryId === cat || p.subcategoryName === cat);
    }

    // Subcategory filter
    if (typeof subcategory === 'string' && subcategory.trim()) {
      const sub = subcategory.trim();
      products = products.filter(p => p.subcategoryName === sub);
    }

    // Stock Status
    if (stockStatus === 'in_stock') {
      products = products.filter(p => p.isInStock);
    } else if (stockStatus === 'out_of_stock') {
      products = products.filter(p => !p.isInStock);
    }

    // Price filters
    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) products = products.filter(p => p.price >= min);
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) products = products.filter(p => p.price <= max);
    }

    // Discount
    if (hasDiscount === 'true') {
      products = products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        products.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
        break;
      case 'name_asc':
        products.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
        break;
      case 'name_desc':
        products.sort((a, b) => b.title.localeCompare(a.title, 'ar'));
        break;
      case 'stock_asc':
        products.sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0));
        break;
      case 'stock_desc':
        products.sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0));
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'updated':
      default:
        products.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        break;
    }

    const total = products.length;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(200, parseInt(limit as string, 10) || 25));
    const totalPages = Math.ceil(total / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(offset, offset + limitNum);

    res.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function normalizeProductImages(images: any[]): any[] {
  if (!Array.isArray(images)) return [];
  return images.map((img: any, idx: number) => {
    if (!img) return null;
    if (typeof img === 'string') {
      const src = img.trim();
      return src ? {
        id: `img_${Date.now()}_${idx}`,
        src,
        altText: '',
        isPrimary: idx === 0,
      } : null;
    }
    if (typeof img === 'object') {
      const src = (img.src || img.url || img.originalUrl || '').trim();
      if (!src) return null;
      return {
        id: img.id || `img_${Date.now()}_${idx}`,
        src,
        altText: img.altText || '',
        width: img.width,
        height: img.height,
        isPrimary: idx === 0 || Boolean(img.isPrimary),
      };
    }
    return null;
  }).filter(Boolean);
}

// 3. Update / Edit Product
apiRouter.patch('/admin/products/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id);
  const existingProduct = db.getProductById(decodedId);

  if (!existingProduct) {
    return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
  }

  const updates = req.body;
  const priceChanged = typeof updates.price === 'number' && updates.price !== existingProduct.price;
  const imagesChanged = Array.isArray(updates.images) && updates.images.length !== existingProduct.images.length;

  const updatedProduct: Product = {
    ...existingProduct,
    ...updates,
    id: existingProduct.id, // Immutable ID
    price: typeof updates.price === 'number' ? Number(updates.price) : existingProduct.price,
    compareAtPrice: updates.compareAtPrice !== undefined ? (updates.compareAtPrice ? Number(updates.compareAtPrice) : null) : existingProduct.compareAtPrice,
    stockQuantity: updates.stockQuantity !== undefined ? Number(updates.stockQuantity) : existingProduct.stockQuantity,
    isInStock: updates.isInStock !== undefined ? Boolean(updates.isInStock) : existingProduct.isInStock,
    images: Array.isArray(updates.images) ? normalizeProductImages(updates.images) : existingProduct.images,
    variants: Array.isArray(updates.variants) ? updates.variants : existingProduct.variants,
    updatedAt: new Date().toISOString(),
  };

  // Recalculate discount percentage if compareAtPrice exists
  if (updatedProduct.compareAtPrice && updatedProduct.compareAtPrice > updatedProduct.price) {
    const diff = updatedProduct.compareAtPrice - updatedProduct.price;
    updatedProduct.discountPercentage = Math.round((diff / updatedProduct.compareAtPrice) * 100);
  } else {
    updatedProduct.discountPercentage = null;
  }

  db.upsertProduct(updatedProduct);

  // Log activity
  if (priceChanged) {
    db.logActivity(
      'تعديل سعر منتج',
      'price',
      `تم تعديل سعر "${updatedProduct.title}" من ${existingProduct.price} د.ك إلى ${updatedProduct.price} د.ك`,
      'info'
    );
  } else if (imagesChanged) {
    db.logActivity(
      'تعديل صور منتج',
      'image',
      `تم تحديث صور منتج "${updatedProduct.title}" (إجمالي ${updatedProduct.images.length} صور)`,
      'info'
    );
  } else {
    db.logActivity(
      'تعديل منتج',
      'product',
      `تم حفظ تعديلات المنتج: "${updatedProduct.title}"`,
      'success'
    );
  }

  res.json({ success: true, product: updatedProduct });
});

// 4. Create New Product
apiRouter.post('/admin/products', requireAdminAuth, (req, res) => {
  const productData = req.body;
  if (!productData.title || typeof productData.price !== 'number') {
    return res.status(400).json({ success: false, error: 'اسم المنتج والسعر مطلوبان' });
  }

  const newId = productData.id || `Product_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const handle = productData.handle || productData.title.trim().replace(/[\s/\\?%*:|"<>]+/g, '-');

  const product: Product = {
    id: newId,
    title: productData.title.trim(),
    handle,
    price: Number(productData.price),
    compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : null,
    discountPercentage: productData.discountPercentage || null,
    currency: 'د.ك',
    sku: productData.sku ? String(productData.sku).trim() : null,
    description: productData.description || '',
    isInStock: productData.isInStock !== false,
    stockQuantity: Number(productData.stockQuantity !== undefined ? productData.stockQuantity : 10),
    categoryId: productData.categoryId || null,
    categoryName: productData.categoryName || 'الادوات المدرسية',
    subcategoryName: productData.subcategoryName || null,
    images: Array.isArray(productData.images) ? normalizeProductImages(productData.images) : [],
    variants: Array.isArray(productData.variants) ? productData.variants : [],
    isFeatured: Boolean(productData.isFeatured),
    isBestSeller: Boolean(productData.isBestSeller),
    isNewArrival: Boolean(productData.isNewArrival ?? true),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    const diff = product.compareAtPrice - product.price;
    product.discountPercentage = Math.round((diff / product.compareAtPrice) * 100);
  }

  db.upsertProduct(product);
  db.logActivity('إضافة منتج جديد', 'product', `تمت إضافة منتج جديد: "${product.title}" بسعر ${product.price} د.ك`, 'success');

  res.json({ success: true, product });
});

// 5. Delete Product
apiRouter.delete('/admin/products/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id);
  const existing = db.getProductById(decodedId);

  if (!existing) {
    return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
  }

  const deleted = db.deleteProduct(existing.id);
  if (deleted) {
    db.logActivity('حذف منتج', 'product', `تم حذف المنتج: "${existing.title}" (ID: ${existing.id})`, 'warning');
    return res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  }

  res.status(500).json({ success: false, error: 'فشل حذف المنتج' });
});

// 6. Upload Image Endpoint (Permanent local storage in /public/uploads)
apiRouter.post('/admin/upload-image', requireAdminAuth, (req, res) => {
  try {
    const { base64, filename, mimeType } = req.body;

    if (!base64 || typeof base64 !== 'string') {
      return res.status(400).json({ success: false, error: 'بيانات الصورة مفقودة أو غير صالحة' });
    }

    // Extract base64 clean data and mime type
    const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let buffer: Buffer;
    let extension = 'jpg';

    if (matches) {
      const type = matches[1];
      const dataStr = matches[2];
      buffer = Buffer.from(dataStr, 'base64');
      if (type.includes('png')) extension = 'png';
      else if (type.includes('webp')) extension = 'webp';
      else if (type.includes('gif')) extension = 'gif';
      else if (type.includes('svg')) extension = 'svg';
      else extension = 'jpg';
    } else {
      buffer = Buffer.from(base64, 'base64');
      if (mimeType?.includes('png')) extension = 'png';
      else if (mimeType?.includes('webp')) extension = 'webp';
    }

    // Size limit check (10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'حجم الصورة يتجاوز الحد المسموح به (10 ميجابايت)' });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeName = (filename || 'product_img').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const outputFilename = `${safeName}_${uniqueSuffix}.${extension}`;
    const filePath = path.join(uploadsDir, outputFilename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${outputFilename}`;
    db.logActivity('رفع صورة جديدة', 'image', `تم رفع وحفظ صورة منتج بنجاح: ${outputFilename} (${(buffer.length / 1024).toFixed(1)} KB)`);

    res.json({
      success: true,
      url: publicUrl,
      filename: outputFilename,
      sizeBytes: buffer.length,
    });
  } catch (err: any) {
    console.error('Image upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'فشل رفع الصورة' });
  }
});

// 7. Categories Management (With Core Protection)
apiRouter.get('/admin/categories', requireAdminAuth, (req, res) => {
  const categories = db.getCategories();
  const products = db.getProducts();

  const enriched = categories.map(cat => {
    const count = products.filter(p => p.categoryName === cat.title || p.categoryId === cat.id || p.subcategoryName === cat.title).length;
    return {
      ...cat,
      productCount: count,
      isProtected: true, // Mark all existing core categories as protected
    };
  });

  res.json({ success: true, categories: enriched });
});

// Safeguard against modifying or deleting core categories
apiRouter.delete('/admin/categories/:id', requireAdminAuth, (req, res) => {
  return res.status(403).json({
    success: false,
    error: 'الأقسام الأساسية الحالية محمية ولا يمكن حذفها للحفاظ على استقرار المنتجات الـ443 وتصنيفاتها.',
  });
});

apiRouter.patch('/admin/categories/:id', requireAdminAuth, (req, res) => {
  return res.status(403).json({
    success: false,
    error: 'الأقسام الأساسية الحالية محمية ضد التعديل أو إعادة التسمية للحفاظ على توافق روابط وتصنيفات المنتجات.',
  });
});

apiRouter.post('/admin/categories', requireAdminAuth, (req, res) => {
  const { title, handle } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'اسم القسم مطلوب' });
  }
  const category: Category = {
    id: `cat_custom_${Date.now()}`,
    title: title.trim(),
    handle: handle || title.trim().replace(/\s+/g, '-'),
    productCount: 0,
  };
  db.upsertCategory(category);
  db.logActivity('إضافة قسم جديد', 'settings', `تمت إضافة قسم جديد: "${category.title}"`);
  res.json({ success: true, category });
});

// 8. Orders Management
apiRouter.get('/admin/orders', requireAdminAuth, (req, res) => {
  const { status, q, page = '1', limit = '20' } = req.query;
  let orders = db.getOrders();

  if (status && status !== 'all' && status !== 'الكل') {
    orders = orders.filter(o => o.orderStatus === status);
  }

  if (q && typeof q === 'string' && q.trim()) {
    const term = q.toLowerCase().trim();
    orders = orders.filter(o =>
      o.orderNumber.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerPhone.includes(term) ||
      o.area.toLowerCase().includes(term)
    );
  }

  const total = orders.length;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
  const totalPages = Math.ceil(total / limitNum);
  const offset = (pageNum - 1) * limitNum;
  const paginatedOrders = orders.slice(offset, offset + limitNum);

  res.json({
    success: true,
    orders: paginatedOrders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  });
});

apiRouter.patch('/admin/orders/:id/status', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;
  const success = db.updateOrderStatus(id, orderStatus, paymentStatus);

  if (!success) {
    return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
  }

  const updatedOrder = db.getOrderById(id);
  db.logActivity(
    'تغيير حالة طلب',
    'order',
    `تم تحديث حالة الطلب #${updatedOrder?.orderNumber} إلى (${orderStatus}) وحالة الدفع إلى (${paymentStatus || updatedOrder?.paymentStatus})`,
    'info'
  );

  res.json({ success: true, order: updatedOrder });
});

// 9. Activity Logs
apiRouter.get('/admin/activity-logs', requireAdminAuth, (req, res) => {
  const { category, q, page = '1', limit = '50' } = req.query;
  let logs = db.getActivityLogs();

  if (category && category !== 'all') {
    logs = logs.filter(l => l.category === category);
  }

  if (q && typeof q === 'string' && q.trim()) {
    const term = q.toLowerCase().trim();
    logs = logs.filter(l => l.action.toLowerCase().includes(term) || l.details.toLowerCase().includes(term));
  }

  const total = logs.length;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, Math.min(200, parseInt(limit as string, 10) || 50));
  const totalPages = Math.ceil(total / limitNum);
  const offset = (pageNum - 1) * limitNum;
  const paginatedLogs = logs.slice(offset, offset + limitNum);

  res.json({
    success: true,
    logs: paginatedLogs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  });
});

apiRouter.delete('/admin/activity-logs', requireAdminAuth, (req, res) => {
  db.clearActivityLogs();
  res.json({ success: true, message: 'تم مسح سجل النشاط بنجاح' });
});

// 10. Backups & Restore
apiRouter.get('/admin/backups', requireAdminAuth, (req, res) => {
  const backups = db.getBackups();
  res.json({ success: true, backups });
});

apiRouter.post('/admin/backups/create', requireAdminAuth, (req, res) => {
  try {
    const backup = db.createBackup();
    res.json({ success: true, backup, message: 'تم إنشاء النسخة الاحتياطية بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/admin/backups/download/:filename', requireAdminAuth, (req, res) => {
  const { filename } = req.params;
  const filePath = db.getBackupPath(filename);

  if (!filePath) {
    return res.status(404).json({ success: false, error: 'ملف النسخة الاحتياطية غير موجود' });
  }

  res.download(filePath, filename);
});

apiRouter.post('/admin/backups/restore/:filename', requireAdminAuth, (req, res) => {
  const { filename } = req.params;
  const restored = db.restoreBackup(filename);

  if (!restored) {
    return res.status(500).json({ success: false, error: 'فشلت استعادة النسخة الاحتياطية' });
  }

  res.json({
    success: true,
    message: 'تمت استعادة النسخة الاحتياطية بنجاح وتحديث بيانات المتجر',
    stats: {
      productsCount: db.getProducts().length,
      categoriesCount: db.getCategories().length,
      ordersCount: db.getOrders().length,
    },
  });
});

apiRouter.delete('/admin/backups/:filename', requireAdminAuth, (req, res) => {
  const { filename } = req.params;
  const deleted = db.deleteBackup(filename);

  if (!deleted) {
    return res.status(404).json({ success: false, error: 'ملف النسخة الاحتياطية غير موجود' });
  }

  res.json({ success: true, message: 'تم حذف ملف النسخة الاحتياطية بنجاح' });
});

// 11. Full Store JSON Export
apiRouter.get('/admin/export', requireAdminAuth, (req, res) => {
  const data = db.exportAllData();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `maktaba_q8_full_export_${timestamp}.json`;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(JSON.stringify(data, null, 2));
});

// 12. Settings
apiRouter.get('/settings', (req, res) => {
  res.json({ success: true, settings: db.getSettings() });
});

apiRouter.get('/admin/settings', requireAdminAuth, (req, res) => {
  res.json({ success: true, settings: db.getSettings() });
});

apiRouter.post('/settings', requireAdminAuth, (req, res) => {
  db.updateSettings(req.body);
  res.json({ success: true, settings: db.getSettings() });
});

apiRouter.post('/admin/settings', requireAdminAuth, (req, res) => {
  db.updateSettings(req.body);
  res.json({ success: true, settings: db.getSettings() });
});

// PROMOTION POPUP ENDPOINTS
// Public active promotion check (Server-side date and status validation)
apiRouter.get('/promotions/active', (req, res) => {
  try {
    const promo = db.getPromotionSettings();
    if (!promo.enabled) {
      return res.json({ success: true, active: false, promotion: null, reason: 'disabled' });
    }

    const now = Date.now();
    if (promo.startAt) {
      const startTime = new Date(promo.startAt).getTime();
      if (!isNaN(startTime) && startTime > now) {
        return res.json({ success: true, active: false, promotion: null, reason: 'not_started' });
      }
    }

    if (promo.endAt) {
      const endTime = new Date(promo.endAt).getTime();
      if (!isNaN(endTime) && endTime < now) {
        return res.json({ success: true, active: false, promotion: null, reason: 'expired' });
      }
    }

    res.json({ success: true, active: true, promotion: promo });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error fetching active promotion' });
  }
});

// User Promotion Activation Route
apiRouter.post('/promotions/activate', (req, res) => {
  try {
    const { promotionId, couponCode, userId, sessionId } = req.body;
    const promo = db.getPromotionSettings();

    if (!promo.enabled) {
      return res.status(400).json({ success: false, error: 'العرض غير مفعّل حالياً' });
    }

    const now = Date.now();
    if (promo.startAt) {
      const startTime = new Date(promo.startAt).getTime();
      if (!isNaN(startTime) && startTime > now) {
        return res.status(400).json({ success: false, error: 'العرض لم يبدأ بعد' });
      }
    }

    if (promo.endAt) {
      const endTime = new Date(promo.endAt).getTime();
      if (!isNaN(endTime) && endTime < now) {
        return res.status(400).json({ success: false, error: 'انتهت صلاحية العرض' });
      }
    }

    // Activate promotion in database
    const activationResult = db.activatePromotion({
      promotionId: promotionId || 'current_promotion',
      couponCode: couponCode || promo.couponCode,
      userId,
      sessionId,
    });

    // Auto-attach coupon to cart if sessionId provided
    let updatedCart: any = null;
    if (sessionId) {
      const cart = db.getCart(sessionId, userId);
      cart.couponCode = promo.couponCode.toUpperCase().trim();
      db.updateCart(sessionId, cart);
      updatedCart = db.getCart(sessionId, userId);
    }

    res.json({
      success: true,
      isAlreadyActive: activationResult.isAlreadyActive,
      activation: activationResult.activation,
      promotion: promo,
      couponCode: promo.couponCode,
      cart: updatedCart,
      message: activationResult.isAlreadyActive
        ? 'العرض مفعّل بالفعل لحسابك'
        : 'تم تفعيل العرض بنجاح على حسابك وسلتك!',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'فشل تفعيل العرض' });
  }
});

// User Promotion Activation Check
apiRouter.get('/promotions/activations', (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const sessionId = req.query.sessionId as string | undefined;
    const activation = db.getActivePromotionActivation(userId, sessionId);
    res.json({ success: true, active: Boolean(activation), activation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Get Promotion Settings
apiRouter.get('/admin/promotions', requireAdminAuth, (req, res) => {
  try {
    const promo = db.getPromotionSettings();
    res.json({ success: true, promotion: promo });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error fetching promotion settings' });
  }
});

// Admin Update Promotion Settings
apiRouter.put('/admin/promotions', requireAdminAuth, (req, res) => {
  try {
    const { discountValue, discountType, couponCode, delaySeconds } = req.body;

    if (discountValue === undefined || discountValue === null || String(discountValue).trim() === '') {
      return res.status(400).json({ success: false, error: 'يرجى إدخال قيمة الخصم.' });
    }

    // Convert Arabic numerals if any
    const normalizedStr = String(discountValue)
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/[0-9]/g, d => '0123456789'.indexOf(d).toString())
      .replace(/,/g, '.');

    const numVal = Number(normalizedStr.trim());

    if (isNaN(numVal) || !isFinite(numVal)) {
      return res.status(400).json({ success: false, error: 'أدخل رقماً صحيحاً.' });
    }

    if (discountType === 'percentage') {
      if (numVal < 0) {
        return res.status(400).json({ success: false, error: 'يجب ألا تقل نسبة الخصم عن 0%.' });
      }
      if (numVal > 100) {
        return res.status(400).json({ success: false, error: 'لا يمكن أن تتجاوز نسبة الخصم 100%.' });
      }
    } else {
      if (numVal < 0) {
        return res.status(400).json({ success: false, error: 'لا يمكن أن تكون قيمة الخصم سالبة.' });
      }
    }

    if (couponCode && typeof couponCode === 'string' && !couponCode.trim()) {
      return res.status(400).json({ success: false, error: 'كود الخصم لا يمكن أن يكون فارغاً' });
    }

    if (typeof delaySeconds === 'number' && delaySeconds < 0) {
      return res.status(400).json({ success: false, error: 'وقت التأخير يجب أن يكون 0 أو أكثر' });
    }

    req.body.discountValue = numVal;

    const updated = db.updatePromotionSettings(req.body);
    res.json({ success: true, message: 'تم حفظ إعدادات العرض المنبثق والكوبون بنجاح!', promotion: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'تعذر حفظ إعدادات العرض' });
  }
});

// ==========================================
// COUPON & DISCOUNT MANAGEMENT ENDPOINTS
// ==========================================

// 1. Get all coupons (Admin & internal)
apiRouter.get('/coupons', (req, res) => {
  const coupons = db.getCoupons();
  res.json({ success: true, coupons });
});

// 2. Validate a coupon (Public / Client)
apiRouter.post('/coupons/validate', (req, res) => {
  const { code, subtotal, cartSubtotal, userId } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال كود الخصم' });
  }
  const effectiveSubtotal = Number(subtotal ?? cartSubtotal ?? 0);
  const result = db.validateCoupon(code, effectiveSubtotal, userId);
  res.json({ success: result.valid, ...result });
});

// 3. Create a coupon (Admin)
apiRouter.post('/coupons', requireAdminAuth, (req, res) => {
  try {
    const coupon = db.createCoupon(req.body);
    res.json({ success: true, coupon });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Update a coupon (Admin)
apiRouter.put('/coupons/:id', requireAdminAuth, (req, res) => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'الكوبون غير موجود' });
  }
  res.json({ success: true, coupon: updated });
});

// 5. Delete a coupon (Admin)
apiRouter.delete('/coupons/:id', requireAdminAuth, (req, res) => {
  const deleted = db.deleteCoupon(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'الكوبون غير موجود' });
  }
  res.json({ success: true, message: 'تم حذف الكوبون بنجاح' });
});

// 6. Get Coupon Usage History Log (Admin)
apiRouter.get('/coupons/usages', (req, res) => {
  const usages = db.getCouponUsages();
  res.json({ success: true, usages });
});

// 7. Get Discount Statistics and Analytics (Admin)
apiRouter.get('/coupons/stats', (req, res) => {
  const stats = db.getDiscountStatistics();
  res.json({ success: true, stats });
});

// Helper to extract client IP
const getClientIp = (req: any): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
};

// ==========================================
// NEW UNIFIED XP & GAMIFICATION ENDPOINTS
// ==========================================

// 1. User XP Status & Level Progress
apiRouter.get('/gamification/status', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'guest_user';
    const displayName = (req.query.displayName as string) || 'متسابق مكتبة الشاطئ الأزرق';

    const userXp = gamificationEngine.getUserXp(userId, displayName);
    const levelProgress = getXpProgressForLevel(userXp.totalXp);
    const activeSeason = gamificationEngine.getActiveSeason();
    const userRank = gamificationEngine.getUserRankInfo(userId, activeSeason.id);
    const dailyChallenges = gamificationEngine.getDailyChallengesStatus(userId);
    const xpRules = gamificationEngine.getXpRules();

    res.json({
      success: true,
      userXp,
      levelProgress,
      activeSeason,
      userRank,
      dailyChallenges,
      xpRules,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/xp/status', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'guest_user';
    const displayName = (req.query.displayName as string) || 'متسابق مكتبة الشاطئ الأزرق';

    const userXp = gamificationEngine.getUserXp(userId, displayName);
    const levelProgress = getXpProgressForLevel(userXp.totalXp);
    const activeSeason = gamificationEngine.getActiveSeason();
    const userRank = gamificationEngine.getUserRankInfo(userId, activeSeason.id);
    const dailyChallenges = gamificationEngine.getDailyChallengesStatus(userId);
    const xpRules = gamificationEngine.getXpRules();

    res.json({
      success: true,
      userXp,
      levelProgress,
      activeSeason,
      userRank,
      dailyChallenges,
      xpRules,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Claim Daily Login XP
apiRouter.post('/xp/daily-login', (req, res) => {
  try {
    const { userId, displayName } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'معرف المستخدم مطلوب' });
    }
    const ip = getClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || '';

    const result = gamificationEngine.processDailyLogin(userId, displayName, ip, userAgent);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Public Active Games List
apiRouter.get('/games', (req, res) => {
  try {
    const games = gamificationEngine.getGames(false);
    res.json({ success: true, games });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Play Game Action & Award XP
apiRouter.post('/games/play', (req, res) => {
  try {
    const { userId, gameId, actionResult, displayName } = req.body;
    if (!userId || !gameId) {
      return res.status(400).json({ success: false, error: 'بيانات اللعبة غير مكتملة' });
    }
    const ip = getClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || '';

    const result = gamificationEngine.processGamePlay({
      userId,
      gameId,
      actionResult,
      displayName,
      ip,
      userAgent,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Product View XP
apiRouter.post('/xp/product-view', (req, res) => {
  try {
    const { userId, productId, displayName } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ success: false, error: 'بيانات المنتج غير مكتملة' });
    }
    const ip = getClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || '';

    const result = gamificationEngine.processProductView(userId, productId, displayName, ip, userAgent);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Product Review XP
apiRouter.post('/xp/review', (req, res) => {
  try {
    const { userId, productId, reviewId, rating, comment, displayName } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ success: false, error: 'بيانات التقييم غير مكتملة' });
    }
    const ip = getClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || '';

    const result = gamificationEngine.processProductReview({
      userId,
      productId,
      reviewId,
      rating: Number(rating || 5),
      comment: comment || '',
      displayName,
      ip,
      userAgent,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Public Season Leaderboard (Privacy Safe: Omit phone and email)
apiRouter.get('/leaderboard', (req, res) => {
  try {
    const seasonId = req.query.seasonId as string;
    const limit = Number(req.query.limit || 50);

    const leaderboard = gamificationEngine.getLeaderboard(seasonId, limit);
    const activeSeason = gamificationEngine.getActiveSeason();

    res.json({
      success: true,
      leaderboard,
      activeSeason,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/gamification/leaderboard', (req, res) => {
  try {
    const seasonId = req.query.seasonId as string;
    const limit = Number(req.query.limit || 50);

    const leaderboard = gamificationEngine.getLeaderboard(seasonId, limit);
    const activeSeason = gamificationEngine.getActiveSeason();

    res.json({
      success: true,
      leaderboard,
      activeSeason,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ADMIN GAMIFICATION & XP CONTROL CENTER
// ==========================================

// 1. Overview Analytics
apiRouter.get('/admin/gamification/overview', requireAdminAuth, (req, res) => {
  try {
    const overview = gamificationEngine.getOverviewStats();
    res.json({ success: true, overview });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Seasons Management
apiRouter.get('/admin/gamification/seasons', requireAdminAuth, (req, res) => {
  try {
    const seasons = gamificationEngine.getSeasons();
    const activeSeason = gamificationEngine.getActiveSeason();
    res.json({ success: true, seasons, activeSeason });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/gamification/seasons', requireAdminAuth, (req, res) => {
  try {
    const season = gamificationEngine.upsertSeason(req.body);
    db.logActivity('إدارة المواسم', 'settings', `تم حفظ الموسم: ${season.nameAr}`, 'success');
    res.json({ success: true, season });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/gamification/seasons/:id/confirm-winners', requireAdminAuth, (req, res) => {
  try {
    const seasonId = req.params.id;
    const adminUserId = (req.body.adminUserId as string) || 'admin';
    const result = gamificationEngine.lockSeasonResults(seasonId, adminUserId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    db.logActivity('اعتماد الفائزين', 'settings', `تم فلق الموسم وإعلان الفائزين بنجاح (${seasonId})`, 'success');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Admin Games Management
apiRouter.get('/admin/gamification/games', requireAdminAuth, (req, res) => {
  try {
    const games = gamificationEngine.getGames(true);
    res.json({ success: true, games });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/gamification/games', requireAdminAuth, (req, res) => {
  try {
    const game = gamificationEngine.upsertGame(req.body);
    db.logActivity('إدارة الألعاب', 'settings', `تم حفظ إعدادات لعبة XP: ${game.nameAr}`, 'success');
    res.json({ success: true, game });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/gamification/games/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const game = gamificationEngine.upsertGame({ ...req.body, id });
    db.logActivity('تعديل لعبة', 'settings', `تم تحديث لعبة XP: ${game.nameAr}`, 'success');
    res.json({ success: true, game });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/gamification/games/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = gamificationEngine.deleteGame(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'اللعبة غير موجودة' });
    }
    db.logActivity('حذف لعبة', 'settings', `تم حذف اللعبة معرف: ${id}`, 'warning');
    res.json({ success: true, message: 'تم حذف اللعبة بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Admin XP Rules Settings
apiRouter.get('/admin/gamification/settings', requireAdminAuth, (req, res) => {
  try {
    const rules = gamificationEngine.getXpRules();
    res.json({ success: true, rules });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/gamification/settings', requireAdminAuth, (req, res) => {
  try {
    const rules = gamificationEngine.updateXpRules(req.body);
    db.logActivity('قواعد XP', 'settings', 'تم تحديث قواعد وسقوف نقاط XP والتقييمات', 'success');
    res.json({ success: true, rules, message: 'تم تحديث قواعد XP بنجاح' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. Activity Audit Logs
apiRouter.get('/admin/gamification/audit', requireAdminAuth, (req, res) => {
  try {
    const logs = gamificationEngine.getAuditLogs();
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// USER AUTH & PROFILE SYNC ENDPOINTS
// ==========================================

// 1. Sync User Profile from Client
apiRouter.post('/users/sync', (req, res) => {
  try {
    const { userId, email, displayName, phone, role, authProvider, avatarUrl, isExplicitUpdate } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'معرف المستخدم مطلوب' });
    }

    const ip = getClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || '';

    const { profile, wallet } = gamificationEngine.syncUserProfile(
      userId,
      { email, displayName, phone, role, authProvider, avatarUrl, isExplicitUpdate },
      ip,
      userAgent
    );

    res.json({
      success: true,
      profile,
      wallet,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get User Profile & Wallet Details
apiRouter.get('/users/profile', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'guest_user';
    const profile = gamificationEngine.getUserProfile(userId);
    const wallet = gamificationEngine.getUserWallet(userId);

    res.json({
      success: true,
      profile,
      wallet,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Check if user account exists in store (Used by safe in-app password recovery)
apiRouter.post('/auth/check-account', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, exists: false, error: 'البريد الإلكتروني مطلوب' });
    }
    const clean = email.trim().toLowerCase();
    const result = gamificationEngine.checkAccountByEmail(clean);
    const creds = authService.getCredentials();
    const exists = result.exists || Boolean(creds[clean]);

    res.json({
      success: true,
      exists,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, exists: false, error: err.message });
  }
});

// Register user with email and password
apiRouter.post('/auth/register', (req, res) => {
  try {
    const { email, password, displayName, phone } = req.body;
    const result = authService.registerUser(email, password, displayName, phone);
    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'فشل إنشاء الحساب',
    });
  }
});

// Log in user with email and password
apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const result = authService.loginUser(email, password);
    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      code: err.code || 'auth-failed',
      error: err.message || 'بيانات الدخول غير صحيحة',
    });
  }
});

// Verify Google recovery for in-app password reset
apiRouter.post('/auth/verify-google-recovery', (req, res) => {
  try {
    const { email, googleEmail } = req.body;
    const result = authService.verifyGoogleRecovery(email, googleEmail);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      code: err.code || 'verification-failed',
      error: err.message || 'فشل التحقق من ملكية الحساب',
    });
  }
});

// Reset password with recovery token
apiRouter.post('/auth/reset-password', (req, res) => {
  try {
    const { email, recoveryToken, newPassword } = req.body;
    const result = authService.resetUserPassword(email, recoveryToken, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      code: err.code || 'reset-failed',
      error: err.message || 'فشل تحديث كلمة المرور',
    });
  }
});

// Validate auth session
apiRouter.get('/auth/session', (req, res) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '') || (req.query.token as string);
    const result = authService.validateSession(token);
    res.json({
      success: result.valid,
      ...result,
    });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
});

// Destroy session
apiRouter.post('/auth/logout', (req, res) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '') || req.body?.token;
    if (token) {
      authService.destroySession(token);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Admin Users Listing
apiRouter.get('/admin/users', requireAdminAuth, (req, res) => {
  try {
    const users = gamificationEngine.getAllUsers();
    res.json({
      success: true,
      users,
      totalCount: users.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Admin User Detail
apiRouter.get('/admin/users/:userId', requireAdminAuth, (req, res) => {
  try {
    const { userId } = req.params;
    const detail = gamificationEngine.getUserDetail(userId);
    res.json({
      success: true,
      ...detail,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Admin Security Logs
apiRouter.get('/admin/security/logs', requireAdminAuth, (req, res) => {
  try {
    const logs = gamificationEngine.getSecurityEvents();
    res.json({
      success: true,
      logs,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. Public Gamification Settings
apiRouter.get('/gamification/settings', (req, res) => {
  try {
    const settings = gamificationEngine.getSettings();
    res.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1.5. Check Active Challenge Session
apiRouter.get('/gamification/challenge/active', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'guest_user';
    const activeData = gamificationEngine.getActiveSessionForUser(userId);
    res.json({
      success: true,
      ...activeData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Start Challenge Session
apiRouter.post('/gamification/challenge/start', (req, res) => {
  const ip = getClientIp(req);
  const userAgent = (req.headers['user-agent'] as string) || '';

  try {
    const { userId, displayName } = req.body;

    // Check user authentication
    if (!userId || userId === 'guest_user') {
      gamificationEngine.logSecurityEvent({
        userId: userId || 'anonymous',
        ip,
        userAgent,
        action: 'start_challenge_unauthorized',
        result: 'rejected',
        details: 'محاولة بدء تحدٍ بدون تسجيل دخول',
      });
      return res.status(401).json({
        success: false,
        requiresLogin: true,
        error: 'يرجى تسجيل الدخول أو إنشاء حساب لبدء التحدي وكسب المكافآت الحقيقية',
      });
    }

    const result = gamificationEngine.startChallengeSession(userId, displayName);

    gamificationEngine.logSecurityEvent({
      userId,
      challengeSessionId: result.session.id,
      ip,
      userAgent,
      action: 'start_challenge_session',
      result: 'success',
      details: `بدء جلسة تحدي جديدة: ${result.session.id}`,
    });

    res.json({
      success: true,
      sessionToken: result.session.sessionToken,
      sessionId: result.session.id,
      firstQuestion: result.firstQuestion,
      dailyAttemptsRemaining: result.dailyAttemptsRemaining,
      timeLimitSeconds: result.session.timeLimitSeconds,
    });
  } catch (err: any) {
    gamificationEngine.logSecurityEvent({
      userId: req.body?.userId || 'unknown',
      ip,
      userAgent,
      action: 'start_challenge_failed',
      result: 'error',
      details: err.message,
    });
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. Submit Answer
apiRouter.post('/gamification/challenge/answer', (req, res) => {
  const ip = getClientIp(req);
  const userAgent = (req.headers['user-agent'] as string) || '';

  try {
    const { sessionToken, questionId, selectedIndex, timeTakenSeconds } = req.body;

    if (!sessionToken || !questionId || typeof selectedIndex !== 'number') {
      return res.status(400).json({ success: false, error: 'بيانات الإجابة غير مكتملة' });
    }

    const result = gamificationEngine.submitAnswer(sessionToken, questionId, selectedIndex, timeTakenSeconds);

    if (result.rewardEarned > 0) {
      gamificationEngine.logSecurityEvent({
        userId: 'verified_session_user',
        questionId,
        ip,
        userAgent,
        action: 'answer_correct_rewarded',
        result: 'reward_granted',
        reward: result.rewardEarned,
        details: `مكافأة ${result.rewardEarned} د.ك و ${result.xpEarned} XP`,
      });
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    gamificationEngine.logSecurityEvent({
      userId: 'unknown',
      questionId: req.body?.questionId,
      ip,
      userAgent,
      action: 'answer_rejected_or_error',
      result: 'error',
      details: err.message,
    });
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Cancel Challenge Session
apiRouter.post('/gamification/challenge/cancel', (req, res) => {
  try {
    const { sessionToken, reason } = req.body;
    if (sessionToken) {
      gamificationEngine.cancelChallengeSession(sessionToken, reason || 'مغادرة صفحة التحدي');
    }
    res.json({ success: true, message: 'تم إلغاء التحدي لأنك غادرت صفحة التحدي.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. User Wallet Details
apiRouter.get('/gamification/wallet', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'guest_user';
    const wallet = gamificationEngine.getUserWallet(userId);

    // Decorate items with remaining time
    const itemsWithTiming = wallet.items.map(item => {
      const expTime = new Date(item.expiresAt).getTime();
      const diffMs = expTime - Date.now();
      const remainingHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
      const remainingMinutes = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
      const isExpiringSoon = item.status === 'active' && diffMs > 0 && diffMs < 6 * 60 * 60 * 1000;

      return {
        ...item,
        remainingHours,
        remainingMinutes,
        isExpiringSoon,
      };
    });

    res.json({
      success: true,
      wallet: {
        ...wallet,
        items: itemsWithTiming,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Achievements
apiRouter.get('/gamification/achievements', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'guest_user';
    const profile = gamificationEngine.getUserProfile(userId);
    const rawData = (db as any).data;
    const achievements = rawData.achievements || [];
    const unlockedSet = new Set(profile.unlockedAchievementIds || []);

    const decorated = achievements.map((ach: any) => ({
      ...ach,
      isUnlocked: unlockedSet.has(ach.id),
    }));

    res.json({
      success: true,
      achievements: decorated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Leaderboard
apiRouter.get('/gamification/leaderboard', (req, res) => {
  try {
    const leaderboard = gamificationEngine.getLeaderboard();
    res.json({
      success: true,
      leaderboard,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// GAMIFICATION ADMIN ENDPOINTS (Protected)
// ==========================================

// 1. Gamification Stats
apiRouter.get('/admin/gamification/stats', requireAdminAuth, (req, res) => {
  try {
    const stats = gamificationEngine.getGamificationStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Questions CRUD
apiRouter.get('/admin/gamification/questions', requireAdminAuth, (req, res) => {
  try {
    const questions = gamificationEngine.getQuestions();
    res.json({ success: true, questions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/gamification/questions', requireAdminAuth, (req, res) => {
  try {
    const question = gamificationEngine.upsertQuestion(req.body);
    res.json({ success: true, question, message: 'تم حفظ السؤال بنجاح' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/gamification/questions/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const question = gamificationEngine.upsertQuestion({ ...req.body, id });
    res.json({ success: true, question, message: 'تم تعديل السؤال بنجاح' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/gamification/questions/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = gamificationEngine.deleteQuestion(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'السؤال غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف السؤال بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Settings Management
apiRouter.get('/admin/gamification/settings', requireAdminAuth, (req, res) => {
  try {
    const settings = gamificationEngine.getSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/gamification/settings', requireAdminAuth, (req, res) => {
  try {
    const settings = gamificationEngine.updateSettings(req.body);
    res.json({ success: true, settings, message: 'تم تحديث إعدادات التحديات والمكافآت بنجاح' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Admin Manual Wallet Grant
apiRouter.post('/admin/wallet/grant', requireAdminAuth, (req, res) => {
  try {
    const { userId, amount, description, expiryHours } = req.body;
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, error: 'يرجى تحديد المستخدم والمبلغ الصحيح' });
    }

    const txId = `tx_adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const rewardItem = gamificationEngine.addWalletReward(
      userId,
      amount,
      'admin_bonus',
      txId,
      description || `مكافأة إدارية يدوية بقيمة ${amount.toFixed(3)} د.ك`,
      txId
    );

    if (!rewardItem) {
      return res.status(400).json({ success: false, error: 'فشلت إضافة الرصيد أو تكررت المعاملة' });
    }

    db.logActivity('إضافة رصيد يدوي', 'system', `تم منح رصيد يدوي بقيمة ${amount.toFixed(3)} د.ك للمستخدم (${userId}) لسبب: ${description || 'مكافأة إدارية'}`, 'success');

    const wallet = gamificationEngine.getUserWallet(userId);
    res.json({
      success: true,
      message: `تم إضافة ${amount.toFixed(3)} د.ك إلى محفظة المستخدم بنجاح`,
      wallet,
      rewardItem,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Admin Users Listing & Detail
apiRouter.get('/admin/users', requireAdminAuth, (req, res) => {
  try {
    const users = gamificationEngine.getAllUsersSummary();
    res.json({ success: true, users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/admin/users/:userId', requireAdminAuth, (req, res) => {
  try {
    const { userId } = req.params;
    const detail = gamificationEngine.getUserAdminDetail(userId);
    res.json({ success: true, ...detail });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Admin Manual User Bonus
apiRouter.post('/admin/users/:userId/bonus', requireAdminAuth, (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;
    const amountNum = typeof amount === 'number' ? amount : parseFloat(amount);

    if (!userId || isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ success: false, error: 'المبلغ غير صالح' });
    }

    const txId = `tx_adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const rewardItem = gamificationEngine.addWalletReward(
      userId,
      amountNum,
      'admin_bonus',
      txId,
      description || `مكافأة إدارية يدوية بقيمة ${amountNum.toFixed(3)} د.ك`,
      txId
    );

    if (!rewardItem) {
      return res.status(400).json({ success: false, error: 'فشلت إضافة الرصيد أو تكررت المعاملة' });
    }

    db.logActivity('إضافة رصيد يدوي', 'system', `تم منح رصيد يدوي بقيمة ${amountNum.toFixed(3)} د.ك للمستخدم (${userId}) لسبب: ${description || 'مكافأة إدارية'}`, 'success');

    const wallet = gamificationEngine.getUserWallet(userId);
    res.json({
      success: true,
      message: `تم منح ${amountNum.toFixed(3)} د.ك بنجاح`,
      wallet,
      rewardItem,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// DEPRECATED FREE CHALLENGE ROUTES (إلغاء النظام القديم واستبداله بنظام XP)
// =========================================================================

apiRouter.use(['/free-challenge*', '/admin/free-challenge*'], (req, res) => {
  res.status(410).json({
    success: false,
    deprecated: true,
    message: 'تم ملغاء نظام تحدي التسوق القديم بالكامل واستبداله بنظام XP والألعاب التنافسية الجديد.',
    redirectTo: '/games',
  });
});




