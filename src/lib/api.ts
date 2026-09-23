import {
  Product,
  Category,
  Cart,
  Order,
  Review,
  ImporterStats,
  StoreSettings,
  QuizQuestion,
  ClientQuestion,
  UserWallet,
  UserProfile,
  Achievement,
  GamificationSettings,
  LeaderboardEntry,
  PromotionSettings,
  PromotionActivation,
} from '../types';

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductDetailResponse {
  success: boolean;
  product: Product;
  relatedProducts: Product[];
}

export interface FeaturedResponse {
  success: boolean;
  heroBanners: {
    id: string;
    title: string;
    subtitle: string;
    buttonText: string;
    link: string;
    image: string;
    badge: string;
    color: string;
  }[];
  newArrivals: Product[];
  bestSellers: Product[];
  discounts: Product[];
  categorySections: {
    category: string;
    title: string;
    products: Product[];
  }[];
  settings: StoreSettings;
}

export async function fetchProducts(params: {
  q?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val));
    }
  });

  const res = await fetch(`/api/products?${searchParams.toString()}`);
  if (!res.ok) throw new Error('فشل جلب المنتجات');
  return res.json();
}

export async function fetchProductSuggestions(q: string): Promise<{ id: string; title: string; handle: string; price: number; image: string; categoryName?: string }[]> {
  if (!q.trim()) return [];
  const res = await fetch(`/api/products/suggestions?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.suggestions || [];
}

export async function fetchProductDetail(idOrHandle: string): Promise<ProductDetailResponse> {
  const res = await fetch(`/api/products/${encodeURIComponent(idOrHandle)}`);
  if (!res.ok) throw new Error('فشل جلب تفاصيل المنتج');
  return res.json();
}

export async function fetchCategories(): Promise<{ success: boolean; categories: Category[] }> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('فشل جلب الأقسام');
  return res.json();
}

export async function fetchFeatured(): Promise<FeaturedResponse> {
  const res = await fetch('/api/featured');
  if (!res.ok) throw new Error('فشل جلب البيانات المميزة');
  return res.json();
}

// Cart
export async function fetchCart(sessionId: string): Promise<{ success: boolean; cart: Cart }> {
  const res = await fetch(`/api/cart/${sessionId}`);
  if (!res.ok) throw new Error('فشل جلب سلة المشتريات');
  return res.json();
}

export async function addToCart(sessionId: string, data: { productId: string; variantId?: string; quantity: number }): Promise<{ success: boolean; cart: Cart }> {
  const res = await fetch(`/api/cart/${sessionId}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل إضافة المنتج إلى السلة');
  return res.json();
}

export async function updateCartItem(sessionId: string, data: { itemId: string; quantity: number }): Promise<{ success: boolean; cart: Cart }> {
  const res = await fetch(`/api/cart/${sessionId}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تحديث الكمية');
  return res.json();
}

export async function removeCartItem(sessionId: string, itemId: string): Promise<{ success: boolean; cart: Cart }> {
  const res = await fetch(`/api/cart/${sessionId}/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
  });
  if (!res.ok) throw new Error('فشل إزالة المنتج من السلة');
  return res.json();
}

export async function applyCoupon(sessionId: string, code: string): Promise<{ success: boolean; eligible?: boolean; message: string; cart: Cart; discountAmount?: number; remainingForMin?: number }> {
  const res = await fetch(`/api/cart/${sessionId}/coupon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'كود الخصم غير صالح');
  return data;
}

export async function removeCoupon(sessionId: string): Promise<{ success: boolean; message: string; cart: Cart }> {
  const res = await fetch(`/api/cart/${sessionId}/coupon`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل إلغاء كود الخصم');
  return data;
}

// Checkout
export async function submitCheckout(data: any): Promise<{ success: boolean; order: Order }> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'فشل إتمام الطلب');
  return result;
}

// Orders
export async function fetchOrders(query?: { phone?: string; orderNumber?: string; q?: string }): Promise<{ success: boolean; orders: Order[] }> {
  const params = new URLSearchParams();
  if (query?.phone) params.append('phone', query.phone);
  if (query?.orderNumber) params.append('orderNumber', query.orderNumber);
  if (query?.q) params.append('q', query.q);

  const res = await fetch(`/api/orders?${params.toString()}`);
  if (!res.ok) throw new Error('فشل جلب الطلبات');
  return res.json();
}

export async function fetchOrderById(id: string): Promise<{ success: boolean; order: Order }> {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error('الطلب غير موجود');
  return res.json();
}

export async function updateOrderStatus(id: string, orderStatus: string, paymentStatus?: string): Promise<{ success: boolean; order: Order }> {
  const res = await fetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify({ orderStatus, paymentStatus }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'فشل تحديث حالة الطلب');
  return data;
}

// Reviews
export async function fetchReviews(productId: string): Promise<{ success: boolean; reviews: Review[] }> {
  const res = await fetch(`/api/reviews/${productId}`);
  if (!res.ok) return { success: true, reviews: [] };
  return res.json();
}

export async function submitReview(data: { productId: string; authorName: string; rating: number; comment: string }): Promise<{ success: boolean; review: Review }> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل إرسال التقييم');
  return res.json();
}

// Importer
export function getAdminAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('mq_admin_token') || localStorage.getItem('mq_admin_token') || '';
  return token ? { 'x-admin-token': token } : {};
}

export function setAdminToken(token: string) {
  sessionStorage.setItem('mq_admin_token', token);
}

export function getAdminToken(): string | null {
  return sessionStorage.getItem('mq_admin_token');
}

export function clearAdminToken() {
  sessionStorage.removeItem('mq_admin_token');
  localStorage.removeItem('mq_admin_token');
}

export async function verifyAdminPasscode(passcode: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const res = await fetch('/api/admin/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'رمز الدخول غير صحيح');
  }
  if (data.token) {
    setAdminToken(data.token);
  }
  return data;
}

export async function fetchImporterStatus(): Promise<{ success: boolean; stats: ImporterStats }> {
  const res = await fetch('/api/importer/status', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب حالة المزامنة');
  return res.json();
}

export async function startImporter(mode: 'sync' | 'check' | 'full' = 'sync'): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/importer/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify({ mode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تشغيل المزامنة');
  return data;
}

export async function stopImporter(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/importer/stop', {
    method: 'POST',
    headers: { ...getAdminAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل إيقاف المزامنة');
  return data;
}

// Admin stats & actions
export async function fetchAdminStats(): Promise<{
  success: boolean;
  stats: any;
  recentProducts: Product[];
  recentOrders: Order[];
  recentLogs: any[];
}> {
  const res = await fetch('/api/admin/stats', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب إحصائيات الإدارة');
  return res.json();
}

export async function fetchAdminProducts(params: {
  q?: string;
  category?: string;
  subcategory?: string;
  stockStatus?: string;
  minPrice?: number;
  maxPrice?: number;
  hasDiscount?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val));
    }
  });

  const res = await fetch(`/api/admin/products?${searchParams.toString()}`, {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب قائمة المنتجات');
  return res.json();
}

export async function updateAdminProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; product: Product }> {
  const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تحديث بيانات المنتج');
  return data;
}

export async function saveAdminProduct(product: Partial<Product>): Promise<{ success: boolean; product: Product }> {
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حفظ المنتج');
  return data;
}

export async function deleteAdminProduct(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAdminAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حذف المنتج');
  return data;
}

export async function uploadAdminImage(base64: string, filename?: string, mimeType?: string): Promise<{ success: boolean; url: string; filename: string }> {
  const res = await fetch('/api/admin/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify({ base64, filename, mimeType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل رفع الصورة');
  return data;
}

export async function fetchAdminCategories(): Promise<{ success: boolean; categories: (Category & { isProtected?: boolean })[] }> {
  const res = await fetch('/api/admin/categories', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب قائمة الأقسام');
  return res.json();
}

export async function fetchAdminOrders(params: {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  success: boolean;
  orders: Order[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val));
    }
  });

  const res = await fetch(`/api/admin/orders?${searchParams.toString()}`, {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب قائمة الطلبات');
  return res.json();
}

export async function updateAdminOrderStatus(
  id: string,
  orderStatus: string,
  paymentStatus?: string
): Promise<{ success: boolean; order: Order }> {
  const res = await fetch(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify({ orderStatus, paymentStatus }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تحديث حالة الطلب');
  return data;
}

export async function fetchAdminActivityLogs(params: {
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  success: boolean;
  logs: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val));
    }
  });

  const res = await fetch(`/api/admin/activity-logs?${searchParams.toString()}`, {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب سجل النشاط');
  return res.json();
}

export async function clearAdminActivityLogs(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/admin/activity-logs', {
    method: 'DELETE',
    headers: { ...getAdminAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل مسح سجل النشاط');
  return data;
}

export async function fetchAdminBackups(): Promise<{ success: boolean; backups: any[] }> {
  const res = await fetch('/api/admin/backups', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب قائمة النسخ الاحتياطية');
  return res.json();
}

export async function createAdminBackup(): Promise<{ success: boolean; backup: any; message: string }> {
  const res = await fetch('/api/admin/backups/create', {
    method: 'POST',
    headers: { ...getAdminAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل إنشاء النسخة الاحتياطية');
  return data;
}

export async function restoreAdminBackup(filename: string): Promise<{ success: boolean; message: string; stats?: any }> {
  const res = await fetch(`/api/admin/backups/restore/${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: { ...getAdminAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل استعادة النسخة الاحتياطية');
  return data;
}

export async function deleteAdminBackup(filename: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/backups/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
    headers: { ...getAdminAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حذف ملف النسخة الاحتياطية');
  return data;
}

export async function fetchStoreSettings(): Promise<{ success: boolean; settings: StoreSettings }> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('فشل جلب إعدادات المتجر');
  return res.json();
}

export async function fetchAdminSettings(): Promise<{ success: boolean; settings: StoreSettings }> {
  const res = await fetch('/api/admin/settings', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب إعدادات المتجر');
  return res.json();
}

export async function saveAdminSettings(settings: Partial<StoreSettings>): Promise<{ success: boolean; settings: StoreSettings }> {
  const res = await fetch('/api/admin/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حفظ الإعدادات');
  return data;
}

// ==========================================
// GAMIFICATION CLIENT APIS
// ==========================================

export async function fetchGamificationStatus(
  userId: string,
  displayName?: string
): Promise<{
  success: boolean;
  profile: UserProfile;
  wallet: UserWallet;
  settings: GamificationSettings;
}> {
  const params = new URLSearchParams({ userId });
  if (displayName) params.append('displayName', displayName);

  const res = await fetch(`/api/gamification/status?${params.toString()}`);
  if (!res.ok) throw new Error('فشل جلب بيانات التحدي والمحفظة');
  return res.json();
}

export async function checkActiveChallenge(userId: string): Promise<{
  success: boolean;
  hasActiveSession: boolean;
  sessionToken?: string;
  sessionId?: string;
  currentQuestion?: ClientQuestion;
  dailyAttemptsRemaining?: number;
  timeLimitSeconds?: number;
  isCompleted?: boolean;
  sessionSummary?: any;
}> {
  const res = await fetch(`/api/gamification/challenge/active?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) return { success: false, hasActiveSession: false };
  return res.json();
}

export async function startChallenge(
  userId: string,
  displayName?: string
): Promise<{
  success: boolean;
  sessionToken: string;
  sessionId: string;
  firstQuestion: ClientQuestion;
  dailyAttemptsRemaining: number;
  timeLimitSeconds: number;
}> {
  const res = await fetch('/api/gamification/challenge/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, displayName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل بدء التحدي');
  return data;
}

export async function submitChallengeAnswer(
  sessionToken: string,
  questionId: string,
  selectedIndex: number,
  timeTakenSeconds = 0
): Promise<{
  success: boolean;
  isCorrect: boolean;
  isTimeout?: boolean;
  isDuplicate?: boolean;
  rewardEarned: number;
  xpEarned: number;
  nextQuestion: ClientQuestion | null;
  isCompleted: boolean;
  sessionSummary?: any;
}> {
  const res = await fetch('/api/gamification/challenge/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken, questionId, selectedIndex, timeTakenSeconds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل إرسال الإجابة');
  return data;
}

export async function cancelChallenge(sessionToken: string, reason?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/gamification/challenge/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken, reason }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchWalletDetails(userId: string): Promise<{ success: boolean; wallet: UserWallet }> {
  const res = await fetch(`/api/gamification/wallet?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('فشل جلب تفاصيل المحفظة');
  return res.json();
}

export async function fetchAchievements(userId: string): Promise<{ success: boolean; achievements: Achievement[] }> {
  const res = await fetch(`/api/gamification/achievements?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('فشل جلب الإنجازات');
  return res.json();
}

export async function fetchLeaderboard(): Promise<{ success: boolean; leaderboard: LeaderboardEntry[] }> {
  const res = await fetch('/api/gamification/leaderboard');
  if (!res.ok) throw new Error('فشل جلب لوحة المتصدرين');
  return res.json();
}

// Admin Gamification
export async function fetchAdminGamificationStats(): Promise<{ success: boolean; stats: any }> {
  const res = await fetch('/api/admin/gamification/stats', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب إحصائيات التحديات والمكافآت');
  return res.json();
}

export async function fetchAdminQuestions(): Promise<{ success: boolean; questions: QuizQuestion[] }> {
  const res = await fetch('/api/admin/gamification/questions', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب بنك الأسئلة');
  return res.json();
}

export async function saveAdminQuestion(question: Partial<QuizQuestion>): Promise<{ success: boolean; question: QuizQuestion; message: string }> {
  const isEdit = !!question.id;
  const url = isEdit ? `/api/admin/gamification/questions/${encodeURIComponent(question.id!)}` : '/api/admin/gamification/questions';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify(question),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حفظ السؤال');
  return data;
}

export async function deleteAdminQuestion(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/gamification/questions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAdminAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حذف السؤال');
  return data;
}

export async function fetchAdminGamificationSettings(): Promise<{ success: boolean; settings: GamificationSettings }> {
  const res = await fetch('/api/admin/gamification/settings', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب إعدادات التحديات والمكافآت');
  return res.json();
}

export async function saveAdminGamificationSettings(settings: Partial<GamificationSettings>): Promise<{ success: boolean; settings: GamificationSettings; message: string }> {
  const res = await fetch('/api/admin/gamification/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حفظ إعدادات التحديات والمكافآت');
  return data;
}

// ==========================================
// FREE SHOPPING CHALLENGE ADMIN API
// ==========================================

export async function fetchFreeChallengeAdminSettings(): Promise<{ success: boolean; settings: any }> {
  const res = await fetch('/api/admin/free-challenge/settings', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب إعدادات تحدي التسوق المجاني');
  return res.json();
}

export async function updateFreeChallengeAdminSettings(settings: any): Promise<{ success: boolean; settings: any }> {
  const res = await fetch('/api/admin/free-challenge/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حفظ إعدادات تحدي التسوق المجاني');
  return data;
}

export async function fetchFreeChallengeAdminPuzzles(): Promise<{ success: boolean; puzzles: any[] }> {
  const res = await fetch('/api/admin/free-challenge/puzzles', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب بنك الألغاز البصرية');
  return res.json();
}

export async function saveFreeChallengeAdminPuzzle(puzzle: any): Promise<{ success: boolean; puzzle: any }> {
  const isEdit = Boolean(puzzle.id);
  const url = isEdit ? `/api/admin/free-challenge/puzzles/${encodeURIComponent(puzzle.id)}` : '/api/admin/free-challenge/puzzles';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify(puzzle),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حفظ اللغز البصري');
  return data;
}

export async function deleteFreeChallengeAdminPuzzle(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/free-challenge/puzzles/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAdminAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حذف اللغز البصري');
  return data;
}

export async function fetchFreeChallengeSecurityLogs(): Promise<{ success: boolean; logs: any[] }> {
  const res = await fetch('/api/admin/free-challenge/security-logs', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب سجلات أمان التحدي');
  return res.json();
}

export async function fetchFreeChallengeAnalytics(): Promise<{ success: boolean; analytics: any }> {
  const res = await fetch('/api/admin/free-challenge/analytics', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب إحصائيات التحدي');
  return res.json();
}

// 10 Games Framework Public APIs
export async function fetchFreeChallengeGames(): Promise<{ success: boolean; games: any[] }> {
  const res = await fetch('/api/free-challenge/games');
  if (!res.ok) throw new Error('فشل جلب قائمة ألعاب التحدي');
  return res.json();
}

export async function fetchFreeChallengeTicker(): Promise<{ success: boolean; tickerSettings: any; winners: any[] }> {
  const res = await fetch('/api/free-challenge/ticker');
  if (!res.ok) throw new Error('فشل جلب بيانات شريط الفائزين');
  return res.json();
}

// 10 Games Framework Admin APIs
export async function fetchFreeChallengeAdminGames(): Promise<{ success: boolean; games: any[] }> {
  const res = await fetch('/api/admin/free-challenge/games', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب قائمة الألعاب من لوحة التحكم');
  return res.json();
}

export async function saveFreeChallengeAdminGame(game: any): Promise<{ success: boolean; game: any }> {
  const isEdit = Boolean(game.id);
  const url = isEdit ? `/api/admin/free-challenge/games/${encodeURIComponent(game.id)}` : '/api/admin/free-challenge/games';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify(game),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حفظ إعدادات اللعبة');
  return data;
}

export async function deleteFreeChallengeAdminGame(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/free-challenge/games/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAdminAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حذف اللعبة');
  return data;
}

export async function reorderFreeChallengeAdminGames(orderedIds: string[]): Promise<{ success: boolean; games: any[] }> {
  const res = await fetch('/api/admin/free-challenge/games/reorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify({ orderedIds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل إعادة ترتيب الألعاب');
  return data;
}

export async function updateFreeChallengeAdminTicker(tickerSettings: any): Promise<{ success: boolean; tickerSettings: any }> {
  const res = await fetch('/api/admin/free-challenge/ticker', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify(tickerSettings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تحديث إعدادات شريط الفائزين');
  return data;
}

// ==========================================
// USER ADDRESSES API
// ==========================================

export async function fetchUserAddresses(userId: string): Promise<{ success: boolean; addresses: any[] }> {
  try {
    const res = await fetch(`/api/user/addresses?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return { success: true, addresses: [] };
    return res.json();
  } catch {
    return { success: true, addresses: [] };
  }
}

export async function saveUserAddress(address: any): Promise<{ success: boolean; address: any; error?: string }> {
  const isEdit = Boolean(address.id);
  const url = isEdit ? `/api/user/addresses/${encodeURIComponent(address.id)}` : '/api/user/addresses';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حفظ العنوان');
  return data;
}

export async function deleteUserAddress(id: string, userId?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/user/addresses/${encodeURIComponent(id)}${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حذف العنوان');
  return data;
}

export async function setDefaultUserAddress(id: string, userId: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/user/addresses/${encodeURIComponent(id)}/default`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تعيين العنوان كافتراضي');
  return data;
}

// ==========================================
// WALLET MANAGEMENT API
// ==========================================

export async function topUpWallet(userId: string, amount: number, paymentMethod = 'knet'): Promise<{ success: boolean; wallet: any; transaction: any; error?: string }> {
  const res = await fetch('/api/wallet/topup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount, paymentMethod }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل شحن المحفظة');
  return data;
}

export async function fetchAdminWalletTransactions(): Promise<{ success: boolean; transactions: any[] }> {
  const res = await fetch('/api/admin/wallet/transactions', {
    headers: { ...getAdminAuthHeaders() },
  });
  if (!res.ok) throw new Error('فشل جلب سجل حركات المحفظة');
  return res.json();
}

export async function adminAdjustWallet(userId: string, amount: number, type: 'credit' | 'debit', reason: string): Promise<{ success: boolean; wallet: any; error?: string }> {
  const res = await fetch('/api/admin/wallet/adjust', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify({ userId, amount, type, reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تعديل رصيد المحفظة');
  return data;
}

// Check if user account exists in store (for in-app password recovery)
export async function checkAccountDetailed(email: string): Promise<{ exists: boolean; error?: string }> {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) return { exists: false, error: 'يرجى إدخال البريد الإلكتروني' };

    const res = await fetch('/api/auth/check-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { exists: false, error: data.error || 'حدث خطأ في الخادم أثناء التحقق من الحساب' };
    }
    return { exists: Boolean(data.exists) };
  } catch (err: any) {
    console.error('Error checking account existence:', err);
    return { exists: false, error: 'تعذر الاتصال بالخادم، يرجى التأكد من اتصال الإنترنت والمحاولة مجدداً' };
  }
}

export async function checkAccountExists(email: string): Promise<boolean> {
  const result = await checkAccountDetailed(email);
  return result.exists;
}

export async function registerWithEmailApi(data: {
  email: string;
  password: string;
  displayName?: string;
  phone?: string;
}): Promise<{
  success: boolean;
  user: { uid: string; email: string; displayName: string; phone: string; role: 'user' | 'admin' };
  profile: UserProfile;
  wallet: UserWallet;
  token: string;
}> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'فشل إنشاء الحساب');
  }
  return json;
}

export async function loginWithEmailApi(data: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  user: { uid: string; email: string; displayName: string; phone: string; role: 'user' | 'admin' };
  profile: UserProfile;
  wallet: UserWallet;
  token: string;
}> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    const err: any = new Error(json.error || 'بيانات الدخول غير صحيحة');
    err.code = json.code;
    throw err;
  }
  return json;
}

export async function verifyGoogleRecoveryApi(data: {
  email?: string;
  googleEmail: string;
}): Promise<{
  success: boolean;
  recoveryToken: string;
  email: string;
}> {
  const res = await fetch('/api/auth/verify-google-recovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    const err: any = new Error(json.error || 'فشل التحقق من ملكية الحساب');
    err.code = json.code;
    throw err;
  }
  return json;
}

export async function resetPasswordApi(data: {
  email: string;
  recoveryToken: string;
  newPassword: string;
}): Promise<{
  success: boolean;
  message: string;
  email: string;
}> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    const err: any = new Error(json.error || 'فشل تحديث كلمة المرور');
    err.code = json.code;
    throw err;
  }
  return json;
}

export async function checkSessionApi(token: string): Promise<{
  success: boolean;
  user?: { uid: string; email: string; displayName: string; phone: string; role: 'user' | 'admin' };
  profile?: UserProfile;
  wallet?: UserWallet;
}> {
  try {
    const res = await fetch(`/api/auth/session?token=${encodeURIComponent(token)}`);
    if (!res.ok) return { success: false };
    return res.json();
  } catch {
    return { success: false };
  }
}

// ==========================================
// PROMOTION POPUP API FUNCTIONS
// ==========================================

export async function fetchActivePromotion(): Promise<{
  success: boolean;
  active: boolean;
  promotion: PromotionSettings | null;
  reason?: string;
}> {
  try {
    const res = await fetch('/api/promotions/active');
    if (!res.ok) return { success: false, active: false, promotion: null };
    return res.json();
  } catch {
    return { success: false, active: false, promotion: null };
  }
}

export async function activatePromotion(data: {
  promotionId?: string;
  couponCode?: string;
  userId?: string;
  sessionId?: string;
}): Promise<{
  success: boolean;
  isAlreadyActive?: boolean;
  activation?: PromotionActivation;
  promotion?: PromotionSettings;
  couponCode?: string;
  cart?: Cart;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/promotions/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || 'فشل تفعيل العرض' };
    }
    return json;
  } catch (err: any) {
    return { success: false, error: err.message || 'خطأ أثناء الاتصال بالخادم لتفعيل العرض' };
  }
}

export async function fetchAdminPromotions(): Promise<{
  success: boolean;
  promotion?: PromotionSettings;
  error?: string;
}> {
  try {
    const res = await fetch('/api/admin/promotions', {
      headers: { ...getAdminAuthHeaders() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'فشل جلب إعدادات العرض');
    }
    return json;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminPromotions(data: Partial<PromotionSettings>): Promise<{
  success: boolean;
  message?: string;
  promotion?: PromotionSettings;
  error?: string;
}> {
  try {
    const res = await fetch('/api/admin/promotions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'فشل حفظ إعدادات العرض');
    }
    return json;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


