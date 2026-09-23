
export type LocalizedText = string | { ar: string; en: string };

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
  name: string;
  nameAr?: string;
  nameEn?: string;
  values: string[] | ProductOptionValue[];
}

export interface ProductVariant {
  id: string;
  productId?: string;
  name?: string;
  title: LocalizedText;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
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
  title: LocalizedText;
  titleEn?: string;
  handle: string;
  originalUrl?: string;
  price: number;
  compareAtPrice?: number | null;
  discountPercentage?: number | null;
  currency: string;
  aiChatEnabled?: boolean;
  aiChatSystemPrompt?: string;
  sku?: string | null;
  type?: string;
  description: LocalizedText;
  descriptionEn?: string;
  isInStock: boolean;
  stockQuantity: number;
  categoryId?: string | null;
  categoryName?: string | null;
  subcategoryName?: string | null;
  images: any[];
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
  title: LocalizedText;
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
  title: LocalizedText;
  titleEn?: string;
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
  title: LocalizedText;
  handle: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal: number;
  selectedOptionsSummary?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  governorate: string;
  area: string;
  block: string;
  street: string;
  avenue?: string;
  building: string;
  floor?: string;
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
  discountSource?: 'store' | 'game' | 'fortune_wheel' | 'referral' | 'loyalty' | 'custom';
  discountType?: 'percentage' | 'fixed' | 'free_shipping';
  discountValue?: number;
  actualDiscountAmount?: number;
  subtotalBeforeDiscount?: number;
  subtotalAfterDiscount?: number;
  walletDiscount?: number;
  freeShoppingChallenge?: {
    challengeId?: string;
    rewardType?: 'free_cart' | 'discount_coupon' | 'discount_wheel' | 'mystery_box' | 'duel';
    discountAmount?: number;
    discountPercentage?: number;
    originalSubtotal?: number;
    voucherCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PromotionSettings {
  enabled: boolean;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  couponCode: string;
  minProductsValue?: number | null; // Minimum products subtotal required to activate discount
  enableMaxDiscount?: boolean; // Toggle for max discount ceiling
  maxDiscount?: number | null; // Max discount ceiling amount in KWD
  includeShipping?: boolean; // Default false (discount applies to products only)
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

export interface PromotionActivation {
  id: string;
  promotionId: string;
  couponCode: string;
  userId?: string;
  sessionId?: string;
  activatedAt: string;
  status: 'active' | 'used' | 'revoked';
  discountType: 'percentage' | 'fixed' | 'fixed_amount' | 'free_shipping';
  discountValue: number;
  minProductsValue?: number | null;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number; // percentage (e.g. 25 for 25%) or fixed amount in KWD (e.g. 2.500)
  minProductsValue?: number; // Minimum products subtotal required to use this coupon
  minSubtotal?: number; // Minimum cart subtotal required to use this coupon
  minOrderAmount?: number;
  maxDiscountAmount?: number; // Max ceiling discount in KWD if percentage
  includeShipping?: boolean; // Default false
  source: 'store' | 'game' | 'fortune_wheel' | 'referral' | 'loyalty' | 'custom' | 'promotion' | 'admin' | 'welcome' | 'challenge';
  isActive: boolean;
  usageLimit?: number; // total allowed uses (null = unlimited)
  usageCount: number; // times used so far
  expiresAt?: string; // ISO date string (null = no expiry)
  userId?: string; // If restricted to a specific user (e.g. won in challenge)
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
  discountType: string;
  discountValue: number;
  actualDiscountAmount: number;
  subtotalBeforeDiscount: number;
  subtotalAfterDiscount: number;
  shippingAmount: number;
  finalTotal: number;
  usedAt: string;
  expiresAt?: string;
}

export interface DiscountStats {
  totalCouponsCount: number;
  activeCouponsCount: number;
  totalUsagesCount: number;
  totalDiscountAmountKwd: number;
  totalSalesWithDiscountsKwd: number;
  averageDiscountKwd: number;
  sourceBreakdown: Record<string, { count: number; totalDiscountKwd: number }>;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase?: boolean;
  createdAt: string;
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

export interface StoreSettings {
  storeNameAr: string;
  storeNameEn: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  currency: string;
  aiChatEnabled?: boolean;
  aiChatSystemPrompt?: string;
  voiceAssistantEnabled?: boolean;
  voiceAutoWelcomeEnabled?: boolean;
  voiceAutoWelcomeTextAr?: string;
  voiceAutoWelcomeTextEn?: string;
  voiceAutoWelcomeDelaySeconds?: number;
  freeShippingEnabled?: boolean;
  freeShippingThreshold: number;
  standardShippingFee?: number;
  shippingFee?: number;
  announcementText: string;
  logoUrl?: string;
  googleMapsUrl?: string;
  enableOrders?: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  category: 'product' | 'price' | 'image' | 'order' | 'sync' | 'backup' | 'settings' | 'system' | string;
  details: string;
  status: 'success' | 'warning' | 'error' | 'info' | string;
  timestamp: string;
}

export interface BackupRecord {
  id?: string;
  filename: string;
  createdAt: string;
  sizeBytes?: number;
  sizeFormatted?: string;
  productsCount: number;
  categoriesCount: number;
  ordersCount: number;
}

// ==========================================
// GAMIFICATION, QUIZ & WALLET TYPES
// ==========================================

export interface Season {
  id: string;
  nameAr: string;
  nameEn: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed' | 'archived';
  numberOfWinners: number;
  prizeDescriptionAr: string;
  prizeDescriptionEn: string;
  top3Winners?: Array<{
    rank: number;
    userId: string;
    displayName: string;
    email?: string;
    phone?: string;
    xp: number;
    level: number;
    confirmedAt?: string;
    deliveredAt?: string;
  }>;
  isLocked?: boolean;
  lockedAt?: string;
  createdAt: string;
}

export interface GameConfig {
  id: string;
  enabled: boolean;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  howToPlayAr: string;
  howToPlayEn: string;
  startButtonTextAr: string;
  startButtonTextEn: string;
  icon: string;
  dailyAttemptsLimit: number;
  xpPerAction: number;
  sortOrder: number;
  introEnabled: boolean;
}

export interface XpRulesConfig {
  dailyLoginXp: number;
  productViewXp: number;
  dailyProductBrowsingCap: number;
  reviewXpAmount: number;
  reviewMinCommentLength: number;
  reviewXpEligibilityMode: 'PURCHASED_PRODUCTS_ONLY' | 'ANY_PRODUCT';
  dailyXpCap: number;
  globalDailyGameAttempts: number;
}

export interface DailyChallengeConfig {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  type: 'PLAY_GAME' | 'REVIEW_PRODUCT' | 'VIEW_PRODUCTS' | 'DAILY_LOGIN' | 'ALL_COMPLETE';
  requiredCount: number;
  xpReward: number;
  enabled: boolean;
}

export interface UserXPRecord {
  userId: string;
  displayName: string;
  totalXp: number;
  level: number;
  seasonXp: Record<string, number>;
  dailyXp: Record<string, number>;
  dailyGameAttempts: Record<string, Record<string, number>>;
  dailyLogin: Record<string, boolean>;
  dailyProductBrowsingXp: Record<string, number>;
  dailyProductReviewXp: Record<string, { xp: number; reviewId?: string; productId?: string }>;
  dailyChallengeProgress: Record<string, Record<string, boolean>>;
  updatedAt: string;
}

export interface XpTransaction {
  id: string;
  userId: string;
  seasonId: string;
  sourceType: 'GAME' | 'DAILY_LOGIN' | 'PRODUCT_VIEW' | 'PRODUCT_REVIEW' | 'PRODUCT_RATING' | 'DAILY_CHALLENGE' | 'OTHER_ALLOWED_ACTIVITY';
  sourceId: string;
  amount: number;
  timestamp: string;
  metadata?: any;
  validationStatus: 'VALID' | 'REJECTED' | 'CAP_EXCEEDED';
  reason?: string;
}

export interface ActivityAuditLog {
  id: string;
  userId: string;
  activity: string;
  source: string;
  xp: number;
  date: string;
  validationStatus: string;
  reason: string;
  ip?: string;
  userAgent?: string;
}

export interface LeaderboardUserEntry {
  rank: number;
  displayName: string;
  level: number;
  seasonXp: number;
  userId: string;
  isCurrentUser?: boolean;
}

export interface GamificationOverviewStats {
  dailyActivePlayers: number;
  gamesPlayedTotal: number;
  xpEarnedTotal: number;
  reviewsSubmittedTotal: number;
  xpFromReviewsTotal: number;
  productViewsFromGamification: number;
  dailyChallengeCompletions: number;
  leaderboardUsersCount: number;
  seasonParticipationCount: number;
  topGames: Array<{ gameId: string; nameAr: string; nameEn: string; plays: number }>;
  averageGamesPerUser: number;
  averageXpPerUser: number;
}

export interface QuizQuestion {
  id: string;
  question: LocalizedText;
  options: LocalizedText[];
  correctAnswerIndex?: number; // only present in admin responses
  rewardAmount: number; // in KWD e.g. 0.250, 0.500, 1.000
  xpAmount: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  timesShown: number;
  timesCorrect: number;
  timesIncorrect: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ClientQuestion {
  questionId: string;
  questionIndex: number;
  totalQuestions: number;
  question: LocalizedText;
  options: LocalizedText[];
  rewardAmount: number;
  xpAmount: number;
  timeLimitSeconds: number;
  questionStartedAt?: string;
  questionExpiresAt?: string;
  remainingSeconds?: number;
  serverTime?: string;
  category: string;
  difficulty: string;
}

export interface ChallengeSessionResult {
  sessionId: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  totalRewardEarned: number;
  totalXpEarned: number;
  totalQuestions: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  timeoutCount: number;
  currentTier?: string;
  newXp?: number;
  newTierUnlocked?: boolean;
}

export interface ChallengeActivityItem {
  id: string;
  userId: string;
  challengeSessionId: string;
  questionId: string;
  questionText?: string;
  result: 'correct' | 'wrong' | 'timeout' | 'rejected_duplicate';
  reward: number;
  xp: number;
  timestamp: string;
}

export interface WalletRewardItem {
  id: string;
  userId: string;
  amount: number;
  initialAmount: number;
  earnedAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired' | 'partially_used';
  source: 'challenge' | 'admin_bonus' | 'achievement';
  sourceId?: string;
  usedInOrderId?: string;
  remainingMinutes?: number;
  remainingHours?: number;
  isExpiringSoon?: boolean;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'expire';
  amount: number;
  balanceAfter: number;
  description: LocalizedText;
  referenceId?: string;
  createdAt: string;
}

export interface UserWallet {
  userId: string;
  activeBalance: number;
  usedBalance: number;
  expiredBalance: number;
  totalEarned: number;
  items: WalletRewardItem[];
  transactions: WalletTransaction[];
  nextExpiringItem?: WalletRewardItem | null;
  nextExpiringSeconds?: number;
  lastUpdated: string;
}

export interface UserTierLevel {
  id: string;
  name: string;
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
  currentTierDetails?: UserTierLevel;
  nextTierDetails?: UserTierLevel | null;
  xpForNextTier?: number;
  xpProgressPercent?: number;
  challengesPlayed: number;
  challengesCompleted: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  totalRewardsEarnedKwd: number;
  totalRewardsUsedKwd: number;
  dailyAttemptsDate: string;
  dailyAttemptsUsed: number;
  dailyAttemptsRemaining: number;
  unlockedAchievementIds: string[];
  lastLoginAt?: string;
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
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  requiredCondition: string;
  rewardXp: number;
  rewardKwd?: number;
  category: 'challenge' | 'orders' | 'levels' | 'general';
  isActive: boolean;
  isUnlocked?: boolean;
  unlockedAt?: string;
}

export interface GamificationSettings {
  isEnabled: boolean;
  questionsPerChallenge: number;
  timePerQuestionSeconds: number;
  dailyAttemptsLimit: number;
  rewardExpiryHours: number;
  maxWalletUsagePercent: number;
  autoShowChallengeOnEntry: boolean;
  autoShowFrequency: 'once_per_session' | 'always' | 'never';
  enableAchievements: boolean;
  enableLeaderboard: boolean;
  defaultRewardAmount: number;
  defaultXpPerCorrectAnswer: number;
  challengeCompletionBonusXp: number;
  tiers: UserTierLevel[];
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  tierName: string;
  badgeColor: string;
  xp: number;
  completedChallenges: number;
}

// ==========================================
// FREE SHOPPING CHALLENGE TYPES
// ==========================================

export type VisualPuzzleType =
  | 'silhouette_match'
  | 'fast_pattern_count'
  | 'one_stroke_maze'
  | 'missing_puzzle_piece'
  | 'visual_difference'
  | 'pattern_completion';

export interface VisualPuzzleClient {
  puzzleId: string;
  puzzleIndex: number;
  totalPuzzles: number;
  type: VisualPuzzleType;
  title: LocalizedText;
  prompt: LocalizedText;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mainVisual?: {
    svgContent?: string;
    imageUrl?: string;
    gridItems?: any[];
    promptDetails?: LocalizedText;
  };
  options: {
    id: string;
    label?: LocalizedText;
    svgContent?: string;
    imageUrl?: string;
    meta?: any;
  }[];
  timeLimitSeconds: number;
  startedAt: string;
  expiresAt: string;
  serverTime: string;
}

export interface FreeChallengeSettings {
  gameEnabled: boolean;
  maxCartValue: number;
  puzzlesPerChallenge: number;
  puzzleDurationSeconds: number;
  dailyAttemptsLimit: number;
  rewardPerCorrectAnswer?: number;
  wheelEligibilityThreshold?: number;
  challengeDiscountEnabled: boolean;
  challengeWinDiscountPercentage: number;
  freeCartEnabled?: boolean; // legacy compatibility
  shippingPolicy: 'standard' | 'free_shipping_on_win';
  discountWheelEnabled: boolean;
  discountWheelValues: number[];
  wheelProbabilities?: Record<number, number>;
  discountDurationMinutes: number;
  mysteryBoxEnabled: boolean;
  askFriendEnabled: boolean;
  referralEnabled: boolean;
  duelEnabled: boolean;
  flashChallengeEnabled: boolean;
  flashChallengeMultiplier: number;
  flashChallengeActive: boolean;
  adsEnabled: boolean;
  adProvider: 'simulated_web' | 'admob' | 'unity';
  liveWinnersTickerEnabled: boolean;
  targetWinRate: number;
}

export interface FreeChallengeRecentWinner {
  id: string;
  userName: string;
  rewardTitle: string;
  rewardType: 'free_cart' | 'discount_coupon' | 'discount_wheel' | 'mystery_box' | 'duel';
  discountPercentage?: number;
  amountKwd?: number;
  timestamp: string;
}

export interface FreeChallengeUserStatus {
  dailyAttemptsRemaining: number;
  maxDailyAttempts: number;
  activeWinCoupon?: {
    couponCode: string;
    discountPercentage: number;
    expiresAt: string;
    token: string;
  } | null;
  activeFreeVoucher?: {
    voucherCode: string;
    token: string;
    expiresAt: string;
    maxAllowedSubtotal: number;
  } | null;
  activeWheelDiscount: {
    percentage: number;
    token: string;
    expiresAt: string;
    couponCode?: string;
  } | null;
}


export interface UserAddress {
  id: string;
  userId: string;
  title: LocalizedText;
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

export interface WalletSettings {
  enabled: boolean;
  minTopupAmount: number; // default 5.000 KWD
  maxBalanceLimit: number; // default 5.000 KWD
  predefinedAmounts: number[]; // e.g. [5, 10, 20, 50]
  allowCustomAmount: boolean;
  rewardPerCorrectAnswer: number; // default 0.250 KWD
  fullChallengeWinReward: number; // default 1.000 KWD
  allowCheckoutUsage: boolean;
  maxCheckoutPercent: number; // e.g. 100% of product subtotal
}

export interface AddressSettings {
  allowMultipleAddresses: boolean;
  maxAddressesPerUser: number;
  requireAvenue: boolean;
  requireFloor: boolean;
}



