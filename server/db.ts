import fs from 'fs';
import path from 'path';
import { Product, Category, Order, Cart, Review, ImporterStats, ActivityLog, BackupRecord, UserAddress, Coupon, CouponUsage, DiscountStats, PromotionSettings } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  carts: Record<string, Cart>;
  reviews: Review[];
  addresses?: UserAddress[];
  coupons?: Coupon[];
  couponUsages?: CouponUsage[];
  importerStats: ImporterStats;
  activityLogs?: ActivityLog[];
  promotionSettings?: PromotionSettings;
  settings: {
    storeNameAr: string;
    storeNameEn: string;
    phone: string;
    whatsapp: string;
    email: string;
    instagram: string;
    mapsUrl: string;
    currency: string;
    freeShippingEnabled: boolean; // Dynamic ON/OFF controlled by Admin
    freeShippingThreshold: number; // in KWD, editable by Admin
    standardShippingFee: number; // in KWD, e.g. 2.000 KWD
    shippingFee?: number;
    announcementText: string;
    logoUrl: string;
  };
}

const defaultStats: ImporterStats = {
  status: 'idle',
  currentStep: 'لم يتم التشغيل بعد',
  totalDiscovered: 0,
  totalImported: 0,
  totalFailed: 0,
  totalImages: 0,
  totalPricesExtracted: 0,
  totalDiscountsFound: 0,
  totalCategories: 0,
  lastSyncAt: null,
  errorLogs: [],
  recentLogs: [],
  progressPercent: 0,
};

const defaultSettings = {
  storeNameAr: 'مكتبة الشاطئ الازرق',
  storeNameEn: 'Blue Beach Stationery',
  phone: '+96597123698',
  whatsapp: '+96597123698',
  email: 'bbstq8@gmail.com',
  instagram: 'https://instagram.com/maktaba_q8',
  mapsUrl: 'https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic',
  currency: 'د.ك',
  freeShippingEnabled: false,
  freeShippingThreshold: 20,
  standardShippingFee: 2,
  announcementText: 'توصيل سريع لجميع مناطق الكويت | الدفع نقداً عند الاستلام | خدمة الطلب عبر الواتساب: 97123698',
  logoUrl: 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png',
  aiChatEnabled: true,
  aiChatSystemPrompt: 'أنت مساعد ذكي متخصص في خدمة عملاء مكتبة الشاطئ الأزرق في الكويت. مهمتك الأساسية مساعدة العملاء في استكشاف المنتجات، أسعارها، وتقديم توصيات بناءً على احتياجاتهم وميزانيتهم. تعليمات صارمة: 1. يجب أن تكون جميع إجاباتك متعلقة حصرياً بمكتبة الشاطئ الأزرق ومنتجاتها. 2. إذا سألك المستخدم أي سؤال عام غير متعلق بالمكتبة أو الأدوات المدرسية، اعتذر بلطف ووجه الحديث للمنتجات. 3. استخدم أداة البحث عن المنتجات للوصول إلى معلومات دقيقة حول الأسعار والتوافر. 4. الأسعار بالدينار الكويتي (د.ك). 5. كن ودوداً واحترافياً واستخدم لغة عربية سليمة.',
};

const defaultPromotionSettings: PromotionSettings = {
  enabled: true,
  discountType: 'percentage',
  discountValue: 15,
  couponCode: 'WELCOME15',
  titleAr: 'هدية خاصة لك 🎁',
  titleEn: 'Special Gift For You 🎁',
  messageAr: 'مرحباً {name} 👋\nاحصل الآن على خصم {discount} واستخدم كود الخصم {code}',
  messageEn: 'Welcome {name} 👋\nGet {discount} off your order using code {code}',
  buttonTextAr: 'تسوق الآن',
  buttonTextEn: 'Shop Now',
  startAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  endAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  showToAuthenticatedUsers: true,
  showToGuests: true,
  delaySeconds: 1,
  frequency: 'session_once',
  updatedAt: new Date().toISOString(),
};

const defaultCoupons: Coupon[] = [
  {
    id: 'c_maktaba10',
    code: 'MAKTABA10',
    discountType: 'percentage',
    discountValue: 10,
    source: 'admin',
    isActive: true,
    usageCount: 0,
    descriptionAr: 'خصم 10% لعملاء مكتبة الشاطئ الازرق',
    descriptionEn: '10% discount for Blue Beach Stationery customers',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'c_welcome10',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    source: 'welcome',
    isActive: true,
    usageCount: 0,
    descriptionAr: 'كوبون ترحيبي 10% لجميع العملاء',
    descriptionEn: '10% welcome coupon for all shoppers',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'c_super15',
    code: 'SUPER15',
    discountType: 'percentage',
    discountValue: 15,
    source: 'promotion',
    minOrderAmount: 10,
    isActive: true,
    usageCount: 0,
    descriptionAr: 'خصم 15% على الطلبات من 10 د.ك وأكثر',
    descriptionEn: '15% discount on orders of 10 KWD and above',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'c_save1',
    code: 'SAVE1',
    discountType: 'fixed',
    discountValue: 1.0,
    source: 'admin',
    minOrderAmount: 5,
    isActive: true,
    usageCount: 0,
    descriptionAr: 'خصم 1.000 د.ك مباشر على الطلبات من 5 د.ك',
    descriptionEn: '1.000 KWD direct discount on orders from 5 KWD',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

class Database {
  private data: DatabaseSchema;
  private isSaving = false;
  private pendingSave = false;
  private lastModifiedAt: string = new Date().toISOString();
  private syncEvents: Array<{ id: string; action: string; type: string; title: string; timestamp: string }> = [
    {
      id: 'init_sync',
      action: 'sync_initialized',
      type: 'system',
      title: 'تم تهيئة المزامنة المباشرة مع قاعدة البيانات',
      timestamp: new Date().toISOString()
    }
  ];

  public recordSyncEvent(action: string, type: string, id: string, title: string): void {
    this.lastModifiedAt = new Date().toISOString();
    this.syncEvents.unshift({
      id: `${Date.now()}_${id}`,
      action,
      type,
      title,
      timestamp: this.lastModifiedAt
    });
    if (this.syncEvents.length > 50) {
      this.syncEvents = this.syncEvents.slice(0, 50);
    }
  }

  public getSyncStatus() {
    return {
      status: 'synced',
      lastSyncAt: this.lastModifiedAt,
      productsCount: this.data.products.length,
      categoriesCount: this.data.categories.length,
      activePaymentMethods: [
        { id: 'cash_on_delivery', nameAr: 'الدفع عند الاستلام', nameEn: 'Cash on Delivery', isEnabled: true },
        { id: 'whatsapp', nameAr: 'طلب ومتابعة عبر واتساب', nameEn: 'Order via WhatsApp', isEnabled: true }
      ],
      disabledPaymentMethods: [
        { id: 'knet', nameAr: 'كي نت (KNET)', isEnabled: false, note: 'غير مفعل حالياً في المتجر' },
        { id: 'credit_card', nameAr: 'بطاقة ائتمانية (Visa/Mastercard)', isEnabled: false, note: 'غير مفعل حالياً في المتجر' },
        { id: 'apple_pay', nameAr: 'أبل باي (Apple Pay)', isEnabled: false, note: 'غير مفعل حالياً في المتجر' }
      ],
      standardShippingFee: this.data.settings.standardShippingFee ?? 2,
      freeShippingEnabled: this.data.settings.freeShippingEnabled ?? false,
      freeShippingThreshold: this.data.settings.freeShippingThreshold ?? 20,
      returnsPolicy: 'إمكانية الاسترجاع أو الاستبدال خلال 14 يوماً من استلام الطلب شريطة أن تكون المنتجات بحالتها الأصلية غير مستخدمة مع الفاتورة',
      recentEvents: this.syncEvents.slice(0, 20)
    };
  }

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          products: Array.isArray(parsed.products) ? parsed.products : [],
          categories: Array.isArray(parsed.categories) ? parsed.categories : [],
          orders: Array.isArray(parsed.orders) ? parsed.orders : [],
          carts: parsed.carts || {},
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
          addresses: Array.isArray(parsed.addresses) ? parsed.addresses : [],
          coupons: Array.isArray(parsed.coupons) && parsed.coupons.length > 0 ? parsed.coupons : defaultCoupons,
          couponUsages: Array.isArray(parsed.couponUsages) ? parsed.couponUsages : [],
          importerStats: parsed.importerStats || defaultStats,
          activityLogs: Array.isArray(parsed.activityLogs) ? parsed.activityLogs : [],
          settings: { ...defaultSettings, ...(parsed.settings || {}) },
        };
      }
    } catch (err) {
      console.error('Error reading database file, initializing fresh store:', err);
    }

    return {
      products: [],
      categories: [],
      orders: [],
      carts: {},
      reviews: [],
      addresses: [],
      coupons: defaultCoupons,
      couponUsages: [],
      importerStats: defaultStats,
      activityLogs: [],
      settings: defaultSettings,
    };
  }

  public save(): void {
    if (this.isSaving) {
      this.pendingSave = true;
      return;
    }

    this.isSaving = true;
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error saving database:', err);
    } finally {
      this.isSaving = false;
      if (this.pendingSave) {
        this.pendingSave = false;
        this.save();
      }
    }
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id || p.handle === id || p.sku === id);
  }

  public setProducts(products: Product[]): void {
    this.data.products = products;
    this.save();
  }

  public upsertProduct(product: Product): void {
    const idx = this.data.products.findIndex(p => p.id === product.id || p.handle === product.handle);
    const title = typeof product.title === 'string' ? product.title : (product.title as any)?.ar || product.handle || product.id;
    if (idx >= 0) {
      this.data.products[idx] = { ...this.data.products[idx], ...product, updatedAt: new Date().toISOString() };
      this.recordSyncEvent('update', 'product', product.id, `تحديث منتج: ${title} (السعر: ${product.price} د.ك)`);
    } else {
      this.data.products.push({
        ...product,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.recordSyncEvent('create', 'product', product.id, `إضافة منتج جديد: ${title} (السعر: ${product.price} د.ك)`);
    }
    this.save();
  }

  public deleteProduct(id: string): boolean {
    const existing = this.data.products.find(p => p.id === id);
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      const title = existing ? (typeof existing.title === 'string' ? existing.title : (existing.title as any)?.ar || id) : id;
      this.recordSyncEvent('delete', 'product', id, `حذف منتج: ${title}`);
      this.save();
      return true;
    }
    return false;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public getCategoryById(idOrHandle: string): Category | undefined {
    return this.data.categories.find(c => c.id === idOrHandle || c.handle === idOrHandle || c.title === idOrHandle);
  }

  public setCategories(categories: Category[]): void {
    this.data.categories = categories;
    this.save();
  }

  public upsertCategory(category: Category): void {
    const idx = this.data.categories.findIndex(c => c.id === category.id || c.handle === category.handle);
    if (idx >= 0) {
      this.data.categories[idx] = { ...this.data.categories[idx], ...category };
    } else {
      this.data.categories.push(category);
    }
    this.save();
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id || c.handle === id);
    if (idx < 0) return null;

    const current = this.data.categories[idx];
    const oldTitle = current.title;
    const newTitle = updates.title ? updates.title.trim() : oldTitle;

    // If category title changed, update products that refer to this category to keep data integrity
    if (updates.title && newTitle !== oldTitle) {
      let changedCount = 0;
      this.data.products.forEach(p => {
        if (p.categoryId === current.id || p.categoryName === oldTitle) {
          p.categoryName = newTitle;
          p.categoryId = current.id;
          p.updatedAt = new Date().toISOString();
          changedCount++;
        }
      });
      if (changedCount > 0) {
        console.log(`Updated category name for ${changedCount} products from "${oldTitle}" to "${newTitle}"`);
      }
    }

    this.data.categories[idx] = {
      ...current,
      ...updates,
      id: current.id, // ID must remain immutable
      title: newTitle,
      titleEn: updates.titleEn !== undefined ? updates.titleEn.trim() : current.titleEn,
      displayOrder: updates.displayOrder !== undefined ? Number(updates.displayOrder) : current.displayOrder,
      isVisible: updates.isVisible !== undefined ? Boolean(updates.isVisible) : (current.isVisible !== false),
    };

    this.save();
    return this.data.categories[idx];
  }

  public reorderCategories(orderedIds: string[]): Category[] {
    const idMap = new Map<string, number>();
    orderedIds.forEach((id, index) => {
      idMap.set(id, index + 1);
    });

    this.data.categories.forEach(cat => {
      if (idMap.has(cat.id)) {
        cat.displayOrder = idMap.get(cat.id)!;
      }
    });

    this.data.categories.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    this.save();
    return this.data.categories;
  }

  public transferProducts(
    productIds: string[],
    targetCategoryId: string,
    targetCategoryTitle: string,
    subcategoryName?: string
  ): number {
    const idSet = new Set(productIds);
    let count = 0;
    const now = new Date().toISOString();

    this.data.products.forEach(p => {
      if (idSet.has(p.id)) {
        p.categoryId = targetCategoryId;
        p.categoryName = targetCategoryTitle;
        if (subcategoryName !== undefined) {
          p.subcategoryName = subcategoryName;
        }
        p.updatedAt = now;
        count++;
      }
    });

    if (count > 0) {
      this.save();
    }
    return count;
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id && c.handle !== id);
    if (this.data.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public addOrder(order: Order): void {
    this.data.orders.unshift(order);
    this.save();
  }

  public updateOrderStatus(orderId: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']): boolean {
    const order = this.data.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (order) {
      order.orderStatus = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      order.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  // --- Shipping Calculator (Server-Authoritative Source of Truth) ---
  public calculateShippingFee(subtotal: number, couponCode?: string): number {
    if (subtotal <= 0) return 0;

    // Coupon FREE bypasses standard fee if present
    if (couponCode === 'FREE') return 0;

    const settings = this.data.settings;
    const standardFee = typeof settings.standardShippingFee === 'number' ? settings.standardShippingFee : (typeof settings.shippingFee === 'number' ? settings.shippingFee : 2.0);

    // STRICT BUSINESS RULE:
    // If Free Shipping is OFF/disabled by admin, NO threshold grants free shipping!
    if (settings.freeShippingEnabled !== true) {
      return Number(standardFee.toFixed(3));
    }

    // Free Shipping is ON: Check dynamic threshold from database settings
    const threshold = typeof settings.freeShippingThreshold === 'number' ? settings.freeShippingThreshold : 20.0;
    if (subtotal >= threshold) {
      return 0;
    }

    return Number(standardFee.toFixed(3));
  }

  // --- Carts ---
  public getCart(sessionId: string): Cart {
    if (!this.data.carts[sessionId]) {
      this.data.carts[sessionId] = {
        id: sessionId,
        items: [],
        subtotal: 0,
        discount: 0,
        shippingFee: 0,
        total: 0,
        updatedAt: new Date().toISOString(),
      };
      this.save();
    } else {
      // Dynamic recalculation on access to guarantee that changing admin settings instantly reflects on active carts
      const cart = this.data.carts[sessionId];
      const subtotal = cart.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
      const shippingFee = this.calculateShippingFee(subtotal, cart.couponCode);
      const total = Math.max(0, subtotal - (cart.discount || 0) + shippingFee);

      cart.subtotal = Number(subtotal.toFixed(3));
      cart.shippingFee = Number(shippingFee.toFixed(3));
      cart.total = Number(total.toFixed(3));
      cart.updatedAt = new Date().toISOString();
    }
    return this.data.carts[sessionId];
  }

  public updateCart(sessionId: string, cart: Cart): void {
    // Recalculate totals server-side
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    const shippingFee = this.calculateShippingFee(subtotal, cart.couponCode);
    const total = Math.max(0, subtotal - (cart.discount || 0) + shippingFee);

    this.data.carts[sessionId] = {
      ...cart,
      id: sessionId,
      subtotal: Number(subtotal.toFixed(3)),
      shippingFee: Number(shippingFee.toFixed(3)),
      total: Number(total.toFixed(3)),
      updatedAt: new Date().toISOString(),
    };
    this.save();
  }

  // --- Addresses ---
  public getAddresses(userId?: string): UserAddress[] {
    if (!this.data.addresses) this.data.addresses = [];
    if (userId) {
      return this.data.addresses.filter(a => a.userId === userId);
    }
    return this.data.addresses;
  }

  public getAddressById(id: string): UserAddress | undefined {
    if (!this.data.addresses) this.data.addresses = [];
    return this.data.addresses.find(a => a.id === id);
  }

  public upsertAddress(address: Partial<UserAddress> & { userId: string }): UserAddress {
    if (!this.data.addresses) this.data.addresses = [];
    
    // If set to default, unset other defaults for this user
    if (address.isDefault) {
      this.data.addresses.forEach(a => {
        if (a.userId === address.userId) a.isDefault = false;
      });
    }

    const idx = this.data.addresses.findIndex(a => a.id === address.id);
    if (idx >= 0) {
      this.data.addresses[idx] = {
        ...this.data.addresses[idx],
        ...address,
        updatedAt: new Date().toISOString(),
      };
      this.save();
      return this.data.addresses[idx];
    } else {
      const isFirst = this.data.addresses.filter(a => a.userId === address.userId).length === 0;
      const newAddress: UserAddress = {
        id: address.id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: address.userId,
        title: address.title || 'عنوان التوصيل',
        customerName: address.customerName || 'عميل',
        customerPhone: address.customerPhone || '',
        governorate: address.governorate || 'حولي',
        area: address.area || '',
        block: address.block || '',
        street: address.street || '',
        avenue: address.avenue || '',
        building: address.building || '',
        floor: address.floor || '',
        apartment: address.apartment || '',
        notes: address.notes || '',
        isDefault: address.isDefault !== undefined ? address.isDefault : isFirst,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.addresses.unshift(newAddress);
      this.save();
      return newAddress;
    }
  }

  public deleteAddress(id: string, userId?: string): boolean {
    if (!this.data.addresses) this.data.addresses = [];
    const initialLen = this.data.addresses.length;
    this.data.addresses = this.data.addresses.filter(a => {
      if (a.id === id) {
        if (userId && a.userId !== userId) return true; // not allowed
        return false;
      }
      return true;
    });

    if (this.data.addresses.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public setDefaultAddress(id: string, userId: string): boolean {
    if (!this.data.addresses) this.data.addresses = [];
    let found = false;
    this.data.addresses.forEach(a => {
      if (a.userId === userId) {
        if (a.id === id) {
          a.isDefault = true;
          found = true;
        } else {
          a.isDefault = false;
        }
      }
    });
    if (found) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Real Coupon & Discount Engine ---
  public getCoupons(): Coupon[] {
    if (!this.data.coupons) this.data.coupons = defaultCoupons;
    return this.data.coupons;
  }

  public getCouponByCode(code: string): Coupon | undefined {
    if (!code) return undefined;
    const cleanCode = code.toUpperCase().trim();
    return this.getCoupons().find(c => c.code.toUpperCase() === cleanCode);
  }

  public createCoupon(coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'> & { id?: string }): Coupon {
    if (!this.data.coupons) this.data.coupons = defaultCoupons;
    const cleanCode = coupon.code.toUpperCase().trim();
    
    // Check if code already exists
    const existingIdx = this.data.coupons.findIndex(c => c.code.toUpperCase() === cleanCode);
    const now = new Date().toISOString();
    
    const newCoupon: Coupon = {
      id: coupon.id || `coup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      code: cleanCode,
      discountType: coupon.discountType || 'percentage',
      discountValue: Number(coupon.discountValue || 0),
      source: coupon.source || 'admin',
      minOrderAmount: coupon.minOrderAmount !== undefined ? Number(coupon.minOrderAmount) : undefined,
      maxDiscountAmount: coupon.maxDiscountAmount !== undefined ? Number(coupon.maxDiscountAmount) : undefined,
      usageLimit: coupon.usageLimit !== undefined ? Number(coupon.usageLimit) : undefined,
      usageCount: 0,
      isActive: coupon.isActive !== false,
      expiresAt: coupon.expiresAt,
      userId: coupon.userId,
      descriptionAr: coupon.descriptionAr,
      descriptionEn: coupon.descriptionEn,
      createdAt: now,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      this.data.coupons[existingIdx] = newCoupon;
    } else {
      this.data.coupons.unshift(newCoupon);
    }

    this.save();
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | undefined {
    if (!this.data.coupons) this.data.coupons = defaultCoupons;
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx < 0) return undefined;

    const existing = this.data.coupons[idx];
    const updated: Coupon = {
      ...existing,
      ...updates,
      code: updates.code ? updates.code.toUpperCase().trim() : existing.code,
      discountValue: updates.discountValue !== undefined ? Number(updates.discountValue) : existing.discountValue,
      updatedAt: new Date().toISOString(),
    };

    this.data.coupons[idx] = updated;
    this.save();
    return updated;
  }

  public deleteCoupon(id: string): boolean {
    if (!this.data.coupons) this.data.coupons = defaultCoupons;
    const initialLen = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter(c => c.id !== id);
    if (this.data.coupons.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Validate a coupon against subtotal and user context.
   * Note: Validating does NOT increment usage count or mark as used.
   */
  public validateCoupon(
    code: string,
    subtotal: number,
    userId?: string
  ): { valid: boolean; coupon?: Coupon; discountAmount: number; error?: string } {
    if (!code || typeof code !== 'string') {
      return { valid: false, discountAmount: 0, error: 'يرجى إدخال كود الخصم' };
    }

    const cleanCode = code.toUpperCase().trim();
    const coupon = this.getCouponByCode(cleanCode);

    if (!coupon) {
      return { valid: false, discountAmount: 0, error: 'كود الخصم غير موجود أو غير صالح' };
    }

    if (!coupon.isActive) {
      return { valid: false, discountAmount: 0, error: 'كود الخصم غير مفعّل حالياً' };
    }

    // Expiry check
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, error: 'انتهت صلاحية كود الخصم' };
    }

    // Single-user restriction check
    if (coupon.userId && userId && coupon.userId !== userId) {
      return { valid: false, discountAmount: 0, error: 'كود الخصم هذا مخصص لحساب آخر' };
    }

    // Minimum order amount
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        error: `الحد الأدنى لتطبيق هذا الكود هو ${coupon.minOrderAmount.toFixed(3)} د.ك (المجموع الحالي: ${subtotal.toFixed(3)} د.ك)`,
      };
    }

    // Usage limit check
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, error: 'تم استنفاد الحد الأقصى لاستخدام كود الخصم هذا' };
    }

    // Per-user one-time check if usageLimit === 1
    if (coupon.usageLimit === 1 && userId && this.data.couponUsages) {
      const alreadyUsedByUser = this.data.couponUsages.some(
        u => u.couponCode === cleanCode && u.userId === userId && u.status === 'applied_and_completed'
      );
      if (alreadyUsedByUser) {
        return { valid: false, discountAmount: 0, error: 'لقد قمت باستخدام كود الخصم هذا مسبقاً' };
      }
    }

    // Calculate real discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Number(((subtotal * coupon.discountValue) / 100).toFixed(3));
      if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      // Fixed
      discountAmount = Number(coupon.discountValue.toFixed(3));
    }

    // Discount cannot exceed subtotal
    discountAmount = Math.min(subtotal, Math.max(0, discountAmount));
    discountAmount = Number(discountAmount.toFixed(3));

    return {
      valid: true,
      coupon,
      discountAmount,
    };
  }

  /**
   * Record actual Coupon Usage once an order has been successfully placed.
   * Only called on successful checkout!
   */
  public recordCouponUsage(usageData: Omit<CouponUsage, 'id' | 'usedAt' | 'status'> & { status?: CouponUsage['status'] }): CouponUsage {
    if (!this.data.couponUsages) this.data.couponUsages = [];

    const newUsage: CouponUsage = {
      id: `cusage_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      couponId: usageData.couponId,
      couponCode: usageData.couponCode.toUpperCase().trim(),
      userId: usageData.userId,
      customerName: usageData.customerName,
      customerPhone: usageData.customerPhone,
      orderId: usageData.orderId,
      orderNumber: usageData.orderNumber,
      source: usageData.source,
      discountType: usageData.discountType,
      discountValue: usageData.discountValue,
      actualDiscountAmount: Number(usageData.actualDiscountAmount.toFixed(3)),
      subtotalBeforeDiscount: Number(usageData.subtotalBeforeDiscount.toFixed(3)),
      subtotalAfterDiscount: Number(usageData.subtotalAfterDiscount.toFixed(3)),
      shippingAmount: Number(usageData.shippingAmount.toFixed(3)),
      finalTotal: Number(usageData.finalTotal.toFixed(3)),
      usedAt: new Date().toISOString(),
      expiresAt: usageData.expiresAt,
      status: usageData.status || 'applied_and_completed',
    };

    this.data.couponUsages.unshift(newUsage);

    // Increment coupon usage count
    const coupon = this.getCouponByCode(usageData.couponCode);
    if (coupon) {
      coupon.usageCount = (coupon.usageCount || 0) + 1;
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        coupon.isActive = false;
      }
    }

    this.save();
    return newUsage;
  }

  public getCouponUsages(): CouponUsage[] {
    if (!this.data.couponUsages) this.data.couponUsages = [];
    return this.data.couponUsages;
  }

  public getDiscountStatistics(): DiscountStats {
    const usages = this.getCouponUsages().filter(u => u.status === 'applied_and_completed');
    
    let totalDiscountAmountKwd = 0;
    let gameDiscountsCount = 0;
    let gameDiscountsAmountKwd = 0;
    let wheelDiscountsCount = 0;
    let wheelDiscountsAmountKwd = 0;
    let adminDiscountsCount = 0;
    let adminDiscountsAmountKwd = 0;
    const uniqueCouponCodes = new Set<string>();

    for (const u of usages) {
      totalDiscountAmountKwd += u.actualDiscountAmount || 0;
      uniqueCouponCodes.add(u.couponCode);

      if (u.source === 'game') {
        gameDiscountsCount++;
        gameDiscountsAmountKwd += u.actualDiscountAmount || 0;
      } else if (u.source === 'fortune_wheel') {
        wheelDiscountsCount++;
        wheelDiscountsAmountKwd += u.actualDiscountAmount || 0;
      } else {
        adminDiscountsCount++;
        adminDiscountsAmountKwd += u.actualDiscountAmount || 0;
      }
    }

    return {
      totalDiscountAmountKwd: Number(totalDiscountAmountKwd.toFixed(3)),
      totalDiscountsCount: usages.length,
      uniqueCouponsUsedCount: uniqueCouponCodes.size,
      gameDiscountsCount,
      gameDiscountsAmountKwd: Number(gameDiscountsAmountKwd.toFixed(3)),
      wheelDiscountsCount,
      wheelDiscountsAmountKwd: Number(wheelDiscountsAmountKwd.toFixed(3)),
      adminDiscountsCount,
      adminDiscountsAmountKwd: Number(adminDiscountsAmountKwd.toFixed(3)),
      recentUsages: usages.slice(0, 15),
    };
  }

  // --- Reviews ---
  public getReviews(productId?: string): Review[] {
    if (productId) {
      return this.data.reviews.filter(r => r.productId === productId);
    }
    return this.data.reviews;
  }

  public addReview(review: Review): void {
    this.data.reviews.unshift(review);
    // Update product rating average
    const prodReviews = this.data.reviews.filter(r => r.productId === review.productId);
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const prod = this.data.products.find(p => p.id === review.productId);
    if (prod) {
      prod.rating = Number(avg.toFixed(1));
      prod.reviewsCount = prodReviews.length;
    }
    this.save();
  }

  // --- Importer Stats ---
  public getImporterStats(): ImporterStats {
    return this.data.importerStats;
  }

  public updateImporterStats(update: Partial<ImporterStats>): void {
    this.data.importerStats = {
      ...this.data.importerStats,
      ...update,
    };
    this.save();
  }

  public logImporterEvent(message: string, isError = false): void {
    const timestamp = new Date().toLocaleTimeString('ar-KW');
    const entry = `[${timestamp}] ${message}`;
    if (isError) {
      this.data.importerStats.errorLogs.unshift(entry);
      if (this.data.importerStats.errorLogs.length > 200) {
        this.data.importerStats.errorLogs.pop();
      }
    }
    this.data.importerStats.recentLogs.unshift(entry);
    if (this.data.importerStats.recentLogs.length > 300) {
      this.data.importerStats.recentLogs.pop();
    }
    this.save();
  }

  // --- Settings ---
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<DatabaseSchema['settings']>) {
    const updated = { ...this.data.settings, ...settings };
    if (typeof settings.standardShippingFee === 'number') {
      updated.shippingFee = settings.standardShippingFee;
    } else if (typeof settings.shippingFee === 'number' && typeof settings.standardShippingFee === 'undefined') {
      updated.standardShippingFee = settings.shippingFee;
    }
    this.data.settings = updated;
    this.recordSyncEvent('update', 'settings', 'store_settings', 'تحديث إعدادات المتجر العامة والشحن');
    this.save();
    this.logActivity('تحديث الإعدادات', 'settings', 'تم تعديل الإعدادات العامة للمتجر');
  }

  // --- Promotion Popup Settings ---
  public getPromotionSettings(): PromotionSettings {
    if (!this.data.promotionSettings) {
      this.data.promotionSettings = { ...defaultPromotionSettings };
      this.save();
    } else {
      // Ensure all fields are merged in case schema expands
      this.data.promotionSettings = { ...defaultPromotionSettings, ...this.data.promotionSettings };
    }
    return this.data.promotionSettings;
  }

  public updatePromotionSettings(settings: Partial<PromotionSettings>): PromotionSettings {
    const current = this.getPromotionSettings();
    const updated: PromotionSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    this.data.promotionSettings = updated;

    // Sync or create the Coupon in database automatically
    if (updated.couponCode) {
      const cleanCode = updated.couponCode.toUpperCase().trim();
      if (!this.data.coupons) this.data.coupons = defaultCoupons;
      
      const existingCoupon = this.data.coupons.find(c => c.code.toUpperCase() === cleanCode);
      const couponType = updated.discountType === 'percentage' ? 'percentage' : 'fixed';
      
      if (existingCoupon) {
        existingCoupon.discountType = couponType;
        existingCoupon.discountValue = Number(updated.discountValue) || 0;
        existingCoupon.isActive = updated.enabled;
        existingCoupon.expiresAt = updated.endAt || undefined;
        existingCoupon.descriptionAr = `كوبون خصم من العرض المنبثق (${updated.discountType === 'percentage' ? updated.discountValue + '%' : updated.discountValue + ' د.ك'})`;
        existingCoupon.descriptionEn = `Popup promotion discount coupon (${updated.discountType === 'percentage' ? updated.discountValue + '%' : updated.discountValue + ' KWD'})`;
        existingCoupon.updatedAt = new Date().toISOString();
      } else {
        this.data.coupons.push({
          id: `c_promo_${Date.now()}`,
          code: cleanCode,
          discountType: couponType,
          discountValue: Number(updated.discountValue) || 0,
          source: 'promotion',
          isActive: updated.enabled,
          usageCount: 0,
          expiresAt: updated.endAt || undefined,
          descriptionAr: `كوبون خصم من العرض المنبثق (${updated.discountType === 'percentage' ? updated.discountValue + '%' : updated.discountValue + ' د.ك'})`,
          descriptionEn: `Popup promotion discount coupon (${updated.discountType === 'percentage' ? updated.discountValue + '%' : updated.discountValue + ' KWD'})`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    this.save();
    this.logActivity('تحديث إعدادات العرض', 'settings', `تم تعديل كود العرض المنبثق: ${updated.couponCode} بقيمة ${updated.discountValue}`);
    return updated;
  }

  // --- Activity Logs ---
  public getActivityLogs(): ActivityLog[] {
    if (!this.data.activityLogs) {
      this.data.activityLogs = [];
    }
    return this.data.activityLogs;
  }

  public logActivity(
    action: string,
    category: ActivityLog['category'],
    details: string,
    status: ActivityLog['status'] = 'info'
  ): void {
    if (!this.data.activityLogs) {
      this.data.activityLogs = [];
    }
    const newLog: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      category,
      details,
      status,
      timestamp: new Date().toISOString(),
    };
    this.data.activityLogs.unshift(newLog);
    // Keep max 500 logs to prevent file bloat
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs.length = 500;
    }
    this.save();
  }

  public clearActivityLogs(): void {
    this.data.activityLogs = [];
    this.save();
    this.logActivity('مسح سجل النشاط', 'system', 'تم إفراغ سجل العمليات والنشاط', 'warning');
  }

  // --- Backups Management ---
  public createBackup(): BackupRecord {
    this.ensureDataDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_maktaba_q8_${timestamp}.json`;
    const filePath = path.join(BACKUPS_DIR, filename);

    const snapshot = {
      backupDate: new Date().toISOString(),
      version: '1.0.0',
      data: this.data,
    };

    const content = JSON.stringify(snapshot, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');

    const stat = fs.statSync(filePath);
    const record: BackupRecord = {
      id: filename,
      filename,
      createdAt: new Date().toISOString(),
      sizeBytes: stat.size,
      productsCount: this.data.products.length,
      categoriesCount: this.data.categories.length,
      ordersCount: this.data.orders.length,
    };

    this.logActivity('إنشاء نسخة احتياطية', 'backup', `تم إنشاء نسخة احتياطية: ${filename} بحجم ${(stat.size / 1024).toFixed(1)} KB (${this.data.products.length} منتج)`, 'success');
    return record;
  }

  public getBackups(): BackupRecord[] {
    this.ensureDataDir();
    try {
      const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json'));
      const records: BackupRecord[] = [];

      for (const file of files) {
        try {
          const filePath = path.join(BACKUPS_DIR, file);
          const stat = fs.statSync(filePath);
          const raw = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(raw);
          const data = parsed.data || parsed;

          records.push({
            id: file,
            filename: file,
            createdAt: parsed.backupDate || stat.mtime.toISOString(),
            sizeBytes: stat.size,
            productsCount: Array.isArray(data.products) ? data.products.length : 0,
            categoriesCount: Array.isArray(data.categories) ? data.categories.length : 0,
            ordersCount: Array.isArray(data.orders) ? data.orders.length : 0,
          });
        } catch (e) {
          console.error(`Error reading backup ${file}:`, e);
        }
      }

      return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('Error reading backups directory:', err);
      return [];
    }
  }

  public getBackupPath(filename: string): string | null {
    const safeFilename = path.basename(filename);
    const filePath = path.join(BACKUPS_DIR, safeFilename);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  public restoreBackup(filename: string): boolean {
    const filePath = this.getBackupPath(filename);
    if (!filePath) return false;

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      const dataToRestore: DatabaseSchema = parsed.data || parsed;

      if (!Array.isArray(dataToRestore.products) || dataToRestore.products.length === 0) {
        throw new Error('النسخة الاحتياطية غير صالحة أو لا تحتوي على منتجات');
      }

      // Overwrite current data
      this.data = {
        products: dataToRestore.products,
        categories: Array.isArray(dataToRestore.categories) ? dataToRestore.categories : this.data.categories,
        orders: Array.isArray(dataToRestore.orders) ? dataToRestore.orders : this.data.orders,
        carts: dataToRestore.carts || {},
        reviews: Array.isArray(dataToRestore.reviews) ? dataToRestore.reviews : this.data.reviews,
        importerStats: dataToRestore.importerStats || this.data.importerStats,
        activityLogs: Array.isArray(dataToRestore.activityLogs) ? dataToRestore.activityLogs : this.data.activityLogs || [],
        settings: { ...defaultSettings, ...(dataToRestore.settings || {}) },
      };

      this.save();
      this.logActivity('استعادة نسخة احتياطية', 'backup', `تم استعادة النسخة الاحتياطية: ${filename} بنجاح (${this.data.products.length} منتج)`, 'warning');
      return true;
    } catch (err) {
      console.error('Error restoring backup:', err);
      this.logActivity('فشل استعادة نسخة احتياطية', 'backup', `فشلت استعادة ${filename}: ${(err as any)?.message}`, 'error');
      return false;
    }
  }

  public deleteBackup(filename: string): boolean {
    const filePath = this.getBackupPath(filename);
    if (!filePath) return false;

    try {
      fs.unlinkSync(filePath);
      this.logActivity('حذف نسخة احتياطية', 'backup', `تم حذف ملف النسخة الاحتياطية: ${filename}`, 'info');
      return true;
    } catch (err) {
      console.error('Error deleting backup:', err);
      return false;
    }
  }

  public exportAllData(): DatabaseSchema {
    return this.data;
  }
}

export const db = new Database();
