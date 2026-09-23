export interface ProductImage {
  id: string;
  src: string;
  altText?: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
}

export interface ProductOptionValue {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  colorCode?: string;
  image?: string;
}

export interface ProductOptionType {
  id: string;
  name: string; // e.g. 'اللون' / 'Color', 'المقاس' / 'Size', 'رقم الصنف' / 'Model Code'
  nameAr?: string;
  nameEn?: string;
  values: string[] | ProductOptionValue[];
}

export interface ProductVariant {
  id: string;
  productId?: string;
  name?: string;
  title: string;
  sku?: string | null;
  price: number; // in KWD
  compareAtPrice?: number | null; // in KWD
  stock?: number;
  quantity?: number;
  stockQuantity?: number;
  isInStock?: boolean;
  enabled?: boolean;
  sortOrder?: number;
  selectedOptions?: {
    optionName: string;
    valueName: string;
  }[];
  image?: ProductImage | string | null;
  additionalImages?: (ProductImage | string)[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  title: string;
  titleEn?: string;
  handle: string; // slug
  originalUrl?: string;
  price: number; // Main display price in KWD (e.g. 0.350, 5.000)
  compareAtPrice?: number | null; // Original price before discount
  discountPercentage?: number | null;
  currency: string;
  aiChatEnabled?: boolean;
  aiChatSystemPrompt?: string; // 'KWD'
  sku?: string | null;
  type?: string; // 'SIMPLE' | 'VARIABLE'
  description: string;
  descriptionEn?: string;
  isInStock: boolean;
  stockQuantity: number;
  categoryId?: string | null;
  categoryName?: string | null;
  subcategoryName?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  options?: ProductOptionType[];
  hasVariants?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  title: string;
  titleEn?: string;
  handle: string;
  parentId?: string | null;
  icon?: string | null;
  image?: string | null;
  displayOrder?: number;
  productCount?: number;
  description?: string;
  descriptionEn?: string;
  isVisible?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  sku?: string;
  title: string;
  handle: string;
  image: string;
  price: number;
  compareAtPrice?: number | null;
  quantity: number;
  selectedOptionsSummary?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  sku?: string;
  title: string;
  handle: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal: number;
  selectedOptionsSummary?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. MQ-2026-8941
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  governorate: string; // المحافظة
  area: string; // المنطقة
  block: string; // القطعة
  street: string; // الشارع
  avenue?: string; // الجادة
  building: string; // المنزل / العمارة
  floor?: string; // الدور / الشقة
  notes?: string;
  paymentMethod: 'knet' | 'credit_card' | 'apple_pay' | 'cash_on_delivery' | 'whatsapp';
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  currency: string;
  aiChatEnabled?: boolean;
  aiChatSystemPrompt?: string;
  couponCode?: string;
  discountSource?: 'game' | 'fortune_wheel' | 'admin' | 'welcome' | 'promotion' | 'referral' | 'loyalty' | 'custom' | 'challenge';
  discountType?: 'percentage' | 'fixed' | 'free_shipping';
  discountValue?: number;
  actualDiscountAmount?: number;
  subtotalBeforeDiscount?: number;
  subtotalAfterDiscount?: number;
  walletDiscount?: number;
  freeShoppingChallenge?: {
    challengeId?: string;
    rewardType?: 'discount_coupon' | 'discount_wheel' | 'mystery_box' | 'duel' | 'free_cart';
    discountAmount?: number;
    discountPercentage?: number;
    originalSubtotal?: number;
    voucherCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  isVerifiedPurchase?: boolean;
  createdAt: string;
}

export interface StoreSettings {
  storeNameAr: string;
  storeNameEn: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  mapsUrl?: string;
  currency: string;
  aiChatEnabled?: boolean;
  aiChatSystemPrompt?: string;
  freeShippingEnabled?: boolean;
  freeShippingThreshold: number;
  standardShippingFee: number;
  shippingFee?: number;
  announcementText: string;
  logoUrl: string;
}

// ==========================================
// GAMIFICATION, QUIZ & WALLET TYPES
// ==========================================

export type LocalizedText = string | { ar: string; en: string };

export interface QuizQuestion {
  id: string;
  question: LocalizedText;
  options: LocalizedText[]; // 2 to 4 options
  correctAnswerIndex: number; // 0-based index, kept server-side
  rewardAmount: number; // in KWD e.g. 0.250, 0.500, 1.000
  xpAmount: number; // e.g. 25, 50, 100
  category: LocalizedText; // 'قرطاسية وأدوات مكتبية' | 'الكويت وتاريخها' | 'ثقافة عامة' | 'لغة عربية' | 'علوم وتكنولوجيا'
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  timesShown: number;
  timesCorrect: number;
  timesIncorrect: number;
  createdAt: string;
  updatedAt?: string;
}

export interface QuestionSessionState {
  questionId: string;
  state: 'active' | 'correct' | 'wrong' | 'timeout' | 'locked';
  questionStartedAt: string;
  questionExpiresAt: string;
  selectedIndex?: number;
  isCorrect?: boolean;
  rewardEarned: number;
  xpEarned: number;
  shuffledOptions?: LocalizedText[];
  correctAnswerIndexInShuffled?: number;
  answeredAt?: string;
  transactionId?: string;
}

export interface ChallengeSession {
  id: string; // unique challengeSessionId
  userId: string;
  sessionToken: string;
  startedAt: string;
  expiresAt: string;
  questionIds: string[];
  currentIndex: number;
  timeLimitSeconds: number;
  currentQuestionStartedAt: string;
  currentQuestionExpiresAt: string;
  questionStates: Record<string, QuestionSessionState>;
  answers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
    rewardEarned: number;
    xpEarned: number;
    state: 'correct' | 'wrong' | 'timeout';
    answeredAt: string;
    transactionId?: string;
  }[];
  totalRewardEarned: number;
  totalXpEarned: number;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  cancelledReason?: string;
  completedAt?: string;
}

export interface ChallengeActivityItem {
  id: string;
  userId: string;
  challengeSessionId: string;
  questionId: string;
  questionText?: LocalizedText;
  result: 'correct' | 'wrong' | 'timeout' | 'rejected_duplicate';
  reward: number;
  xp: number;
  timestamp: string;
}

export interface WalletRewardItem {
  id: string;
  userId: string;
  amount: number; // in KWD e.g. 0.500
  initialAmount: number;
  earnedAt: string;
  expiresAt: string; // 48 hours after earnedAt
  status: 'active' | 'used' | 'expired' | 'partially_used';
  source: 'challenge' | 'admin_bonus' | 'achievement';
  sourceId?: string;
  usedInOrderId?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'expire';
  amount: number; // in KWD
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface UserWallet {
  userId: string;
  activeBalance: number; // computed from non-expired active items
  usedBalance: number;
  expiredBalance: number;
  totalEarned: number;
  items: WalletRewardItem[];
  transactions: WalletTransaction[];
  lastUpdated: string;
}

export interface UserTierLevel {
  id: string;
  name: string; // 'برونزي' | 'فضي' | 'ذهبي' | 'بلاتيني' | 'ماسي'
  minXp: number;
  badgeColor: string;
  badgeBg: string;
  iconName: string;
  perksDescription: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  role?: 'user' | 'admin';
  xp: number;
  currentTier: string;
  challengesPlayed: number;
  challengesCompleted: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  totalRewardsEarnedKwd: number;
  totalRewardsUsedKwd: number;
  dailyAttemptsDate: string; // YYYY-MM-DD
  dailyAttemptsUsed: number;
  unlockedAchievementIds: string[];
  lastLoginAt?: string;
  lastIp?: string;
  userAgent?: string;
  authProvider?: 'email' | 'google' | 'phone' | 'guest';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityLogEvent {
  id: string;
  userId: string;
  challengeSessionId?: string;
  questionId?: string;
  ip: string;
  userAgent?: string;
  action: string;
  result: string;
  reward?: number;
  details?: string;
  timestamp: string;
}

export interface AdminUserSummary {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  role: string;
  currentTier: string;
  xp: number;
  activeWalletBalance: number;
  totalRewardsEarnedKwd: number;
  totalRewardsUsedKwd: number;
  challengesPlayed: number;
  challengesCompleted: number;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredCondition: string;
  rewardXp: number;
  rewardKwd?: number;
  category: 'challenge' | 'orders' | 'levels' | 'general';
  isActive: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  tierName: string;
  badgeColor: string;
  xp: number;
  completedChallenges: number;
}

export interface GamificationSettings {
  isEnabled: boolean;
  questionsPerChallenge: number; // default 10
  timePerQuestionSeconds: number; // default 15
  dailyAttemptsLimit: number; // default 3
  rewardExpiryHours: number; // default 48
  maxWalletUsagePercent: number; // default 50 (50%)
  autoShowChallengeOnEntry: boolean;
  autoShowFrequency: 'once_per_session' | 'always' | 'never';
  enableAchievements: boolean;
  enableLeaderboard: boolean;
  defaultRewardAmount: number; // default 0.500 KWD
  defaultXpPerCorrectAnswer: number; // default 25 XP
  challengeCompletionBonusXp: number; // default 100 XP
  tiers: UserTierLevel[];
}

export interface ImporterStats {
  status: 'idle' | 'running' | 'completed' | 'error' | 'stopped';
  currentStep: string;
  totalDiscovered: number;
  totalImported: number;
  totalFailed: number;
  totalImages: number;
  totalPricesExtracted: number;
  totalDiscountsFound: number;
  totalCategories: number;
  lastSyncAt: string | null;
  errorLogs: string[];
  recentLogs: string[];
  progressPercent: number;
}

export interface UserAddress {
  id: string;
  userId: string;
  title: string; // e.g. "المنزل", "العمل"
  customerName: string;
  customerPhone: string;
  governorate: string;
  area: string;
  block: string;
  street: string;
  avenue?: string;
  building: string;
  floor?: string;
  apartment?: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  category: 'product' | 'price' | 'image' | 'order' | 'sync' | 'backup' | 'settings' | 'system';
  details: string;
  status: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
}

export interface BackupRecord {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  productsCount: number;
  categoriesCount: number;
  ordersCount: number;
}

// ==========================================
// REAL COUPON & DISCOUNT ENGINE TYPES
// ==========================================

export interface PromotionSettings {
  enabled: boolean;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  couponCode: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  buttonTextAr: string;
  buttonTextEn: string;
  startAt?: string | null;
  endAt?: string | null;
  showToAuthenticatedUsers: boolean;
  showToGuests: boolean;
  delaySeconds: number;
  frequency: 'every_visit' | 'session_once' | 'daily_once' | 'user_once' | 'until_closed';
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string; // e.g. "MAKTABA10", "WIN25-X8K", "WHEEL15-K9L"
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number; // e.g. 10 for 10% or 1.000 for 1 KWD (or 0 for free_shipping)
  source: 'game' | 'fortune_wheel' | 'admin' | 'welcome' | 'promotion' | 'referral' | 'loyalty' | 'custom' | 'challenge';
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number; // max total usage count allowed, e.g. 1 for single-use game/wheel vouchers
  usageCount: number; // times actually used in completed orders
  isActive: boolean;
  expiresAt?: string;
  userId?: string; // if tied to a specific user
  descriptionAr?: string;
  descriptionEn?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  couponCode: string;
  userId?: string;
  customerName?: string;
  customerPhone?: string;
  orderId: string;
  orderNumber: string;
  source: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  actualDiscountAmount: number;
  subtotalBeforeDiscount: number;
  subtotalAfterDiscount: number;
  shippingAmount: number;
  finalTotal: number;
  usedAt: string;
  expiresAt?: string;
  status: 'applied_and_completed' | 'cancelled';
}

export interface DiscountStats {
  totalDiscountAmountKwd: number;
  totalDiscountsCount: number;
  uniqueCouponsUsedCount: number;
  gameDiscountsCount: number;
  gameDiscountsAmountKwd: number;
  wheelDiscountsCount: number;
  wheelDiscountsAmountKwd: number;
  adminDiscountsCount: number;
  adminDiscountsAmountKwd: number;
  recentUsages: CouponUsage[];
}

