import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from './db';
import { gamificationEngine } from './gamification';
import { Product, Cart, CartItem } from './types';
import {
  VisualPuzzle,
  VisualPuzzleType,
  FreeChallengeSettings,
  FreeChallengeSession,
  CartSnapshot,
  FreeChallengeSecurityLog,
  RecentWinner,
  DuelMatch,
  ReferralRecord,
  FreeChallengeAnalytics,
  GameConfig,
  TickerSettings,
} from './freeChallengeTypes';
import { allInitialPuzzles } from './initialPuzzles';

const DATA_DIR = path.join(process.cwd(), 'data');
const CHALLENGE_FILE = path.join(DATA_DIR, 'free_challenge.json');

export interface FreeChallengeStorage {
  settings: FreeChallengeSettings;
  games: GameConfig[];
  puzzles: VisualPuzzle[];
  sessions: Record<string, FreeChallengeSession>;
  securityLogs: FreeChallengeSecurityLog[];
  recentWinners: RecentWinner[];
  duels: Record<string, DuelMatch>;
  referrals: ReferralRecord[];
  activeDiscounts: Record<string, {
    token: string;
    userId: string;
    percentage: number;
    expiresAt: string;
    isUsed: boolean;
    orderId?: string;
  }>;
  freeCartVouchers: Record<string, {
    voucherCode: string;
    token: string;
    userId: string;
    cartSnapshotId: string;
    maxAllowedSubtotal: number;
    expiresAt: string;
    isUsed: boolean;
    orderId?: string;
  }>;
  dailyUserAttempts: Record<string, { date: string; attemptsCount: number }>;
}

export const defaultTickerSettings: TickerSettings = {
  enabled: true,
  speed: 'normal',
  intervalSeconds: 4,
  bgColor: 'from-slate-950 via-amber-950/40 to-slate-950',
  textColor: 'text-amber-300',
  accentColor: 'text-amber-400',
  position: 'top',
  demoMode: true,
  customItems: [
    '🔥 تحدى سرعتك وذكاءك الآن في 10 ألعاب حصرية واربح كوبونات خصم إضافية لطلبك!',
    '🚚 توصيل سريع لجميع مناطق ومحافظات دولة الكويت خلال 24 ساعة فقط',
    '🎁 فائزون جدد كل ساعة بجوائز فورية وكوبونات خصم نقدية',
  ],
};

const defaultSettings: FreeChallengeSettings = {
  gameEnabled: true,
  maxCartValue: 15.0, // Default 15.000 KWD
  puzzlesPerChallenge: 4,
  puzzleDurationSeconds: 8,
  dailyAttemptsLimit: 1, // Default 1 daily attempt (customizable in admin)
  rewardPerCorrectAnswer: 0.250, // Default 0.250 KWD (customizable in admin)
  wheelEligibilityThreshold: 0.500, // Default 0.500 KWD (customizable in admin)
  challengeDiscountEnabled: true,
  challengeWinDiscountPercentage: 25,
  shippingPolicy: 'standard',
  discountWheelEnabled: true,
  discountWheelValues: [5, 10, 15, 20, 25],
  wheelProbabilities: {
    5: 40,
    10: 30,
    15: 20,
    20: 8,
    25: 2,
  },
  discountDurationMinutes: 10,
  mysteryBoxEnabled: true,
  askFriendEnabled: true,
  referralEnabled: true,
  duelEnabled: true,
  flashChallengeEnabled: true,
  flashChallengeMultiplier: 1.5,
  flashChallengeActive: false,
  adsEnabled: true,
  adProvider: 'simulated_web',
  liveWinnersTickerEnabled: true,
  tickerSettings: defaultTickerSettings,
  targetWinRate: 35,
};

export const defaultGames: GameConfig[] = [
  {
    id: 'g_visual_diff',
    type: 'visual_difference',
    title: { ar: "اختلاف الصورة والبحث عن المختلف", en: "Spot the Difference" },
    description: { ar: "حدد العنصر المختلف أو الفارق بين العناصر المعروضة بأعلى دقة وتركيز بصري.", en: "Identify the different element or spot the difference with high accuracy and visual focus." },
    icon: 'Eye',
    bannerImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=60',
    enabled: true,
    displayOrder: 1,
    placement: 'all',
    timerSeconds: 8,
    questionsPerRound: 4,
    dailyAttemptsLimit: 2,
    rewardType: 'discount_coupon',
    rewardAmount: 25,
    rewardXp: 50,
    difficulty: 'medium',
    optionsCount: 4,
    autoAdvanceOnTimeout: true,
    cooldownMinutes: 0,
    minCartValue: 1.0,
    maxCartValue: 15.0,
    minUserLevel: 'المستوى البرونزي',
    allowNewUsers: true,
    allowRegularUsers: true,
    allowVipUsers: true,
    maxDailyWinners: 100,
    targetWinRate: 35,
    winMessage: 'تهانينا! لقد رصدت جميع الفروقات بدقة وحصلت على كوبون خصم 25% على طلبك!',
    lossMessage: 'للأسف لم تكن الإجابة صحيحة، لا تحزن فلقد فزت بفرصة تدوير عجلة الحظ!',
    timeoutMessage: 'انتهى الوقت المحدد للإجابة! تدرب أكثر لتزيد من سرعتك.',
  },
  {
    id: 'g_shadow_match',
    type: 'silhouette_match',
    title: { ar: "مطابقة الظلال الدقيقة", en: "Exact Silhouette Match" },
    description: { ar: "قارن تفاصيل الأشكال وظلالها الدقيقة واختر الظل المطابق بنسبة 100%.", en: "Compare shapes and their accurate silhouettes and select the 100% matching shadow." },
    icon: 'Layers',
    bannerImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60',
    enabled: true,
    displayOrder: 2,
    placement: 'all',
    timerSeconds: 8,
    questionsPerRound: 4,
    dailyAttemptsLimit: 2,
    rewardType: 'discount_coupon',
    rewardAmount: 25,
    rewardXp: 50,
    difficulty: 'medium',
    optionsCount: 4,
    autoAdvanceOnTimeout: true,
    cooldownMinutes: 0,
    minCartValue: 1.0,
    maxCartValue: 15.0,
    minUserLevel: 'المستوى البرونزي',
    allowNewUsers: true,
    allowRegularUsers: true,
    allowVipUsers: true,
    maxDailyWinners: 100,
    targetWinRate: 35,
    winMessage: 'رائع! نظرك حاد وطابقت جميع الظلال بنجاح وحصلت على كوبون خصم 25%!',
    lossMessage: 'حظاً أوفر في المرة القادمة، جرب عجلة الحظ الآن.',
    timeoutMessage: 'الوقت انتهى، حاول مرة أخرى بسرعة أعلى.',
  },
  {
    id: 'g_pattern_match',
    type: 'pattern_completion',
    title: { ar: "إكمال الأنماط الهندسية", en: "Geometric Pattern Completion" },
    description: { ar: "اكتشف التسلسل المنطقي وأكمل النمط الرياضي أو البصري الناقص بدقة.", en: "Discover the logical sequence and accurately complete the missing visual or mathematical pattern." },
    icon: 'Grid',
    bannerImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=60',
    enabled: true,
    displayOrder: 3,
    placement: 'all',
    timerSeconds: 10,
    questionsPerRound: 4,
    dailyAttemptsLimit: 2,
    rewardType: 'discount_coupon',
    rewardAmount: 25,
    rewardXp: 60,
    difficulty: 'medium',
    optionsCount: 4,
    autoAdvanceOnTimeout: true,
    cooldownMinutes: 0,
    minCartValue: 1.0,
    maxCartValue: 15.0,
    minUserLevel: 'المستوى البرونزي',
    allowNewUsers: true,
    allowRegularUsers: true,
    allowVipUsers: true,
    maxDailyWinners: 100,
    targetWinRate: 35,
    winMessage: 'عبقري! لقد حللت جميع الأنماط المنطقية واستحققت كوبون الخصم الذهبي 25%!',
    lossMessage: 'النمط كان يحتاج تدقيقاً إضافياً، دور عجلة الخصومات الآن.',
    timeoutMessage: 'نفد الوقت المخصص للتفكير في النمط.',
  },
  {
    id: 'g_fast_count',
    type: 'fast_pattern_count',
    title: { ar: "تحدي العد والتركيز السريع", en: "Fast Counting and Focus Challenge" },
    description: { ar: "قم بإحصاء عدد الأدوات والعناصر المحددة المعروضة بأسرع وقت ممكن.", en: "Count the number of specified tools and elements displayed as quickly as possible." },
    icon: 'Hash',
    bannerImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=60',
    enabled: true,
    displayOrder: 4,
    placement: 'all',
    timerSeconds: 7,
    questionsPerRound: 4,
    dailyAttemptsLimit: 2,
    rewardType: 'discount_coupon',
    rewardAmount: 25,
    rewardXp: 45,
    difficulty: 'easy',
    optionsCount: 4,
    autoAdvanceOnTimeout: true,
    cooldownMinutes: 0,
    minCartValue: 1.0,
    maxCartValue: 15.0,
    minUserLevel: 'المستوى البرونزي',
    allowNewUsers: true,
    allowRegularUsers: true,
    allowVipUsers: true,
    maxDailyWinners: 100,
    targetWinRate: 40,
    winMessage: 'سرعة ودقة فائقة في العد! مبروك كوبون خصم 25% الفوري!',
    lossMessage: 'العدد لم يكن دقيقاً، العب عجلة الحظ لربح كوبون فوري.',
    timeoutMessage: 'انتهت الثواني المتاحة للعد السريع.',
  },
  {
    id: 'g_shape_sort',
    type: 'shape_sorting',
    title: { ar: "فرز ومطابقة الأشكال", en: "Shape Sorting and Matching" },
    description: { ar: "رتب وفرز الأشكال والأدوات الهندسية وفق قواعد التصنيف واللون.", en: "Sort and arrange geometric shapes and tools according to sorting rules and color." },
    icon: 'Boxes',
    bannerImage: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=600&auto=format&fit=crop&q=60',
    enabled: true,
    displayOrder: 5,
    placement: 'all',
    timerSeconds: 8,
    questionsPerRound: 4,
    dailyAttemptsLimit: 2,
    rewardType: 'discount_coupon',
    rewardAmount: 25,
    rewardXp: 50,
    difficulty: 'medium',
    optionsCount: 4,
    autoAdvanceOnTimeout: true,
    cooldownMinutes: 0,
    minCartValue: 1.0,
    maxCartValue: 15.0,
    minUserLevel: 'المستوى البرونزي',
    allowNewUsers: true,
    allowRegularUsers: true,
    allowVipUsers: true,
    maxDailyWinners: 100,
    targetWinRate: 35,
    winMessage: 'ترتيب وتنظيم مذهل! فزت بكوبون الخصم بنجاح تام!',
    lossMessage: 'خطأ في فرز الأشكال، حظاً أوفر في الجولة القادمة.',
    timeoutMessage: 'انتهى وقت فرز الأشكال.',
  },
  {
    id: 'g_visual_memory',
    type: 'visual_memory',
    title: { ar: "الذاكرة البصرية السريعة", en: "Fast Visual Memory" },
    description: { ar: "احفظ مواقع الرموز والأدوات والبطاقات واسترجعها بعد إخفائها.", en: "Memorize the locations of symbols, tools, and cards and recall them after they are hidden." },
    icon: 'Brain',
    bannerImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=60',
    enabled: true,
    displayOrder: 6,
    placement: 'all',
    timerSeconds: 10,
    questionsPerRound: 4,
    dailyAttemptsLimit: 2,
    rewardType: 'discount_coupon',
    rewardAmount: 25,
    rewardXp: 65,
    difficulty: 'hard',
    optionsCount: 4,
    autoAdvanceOnTimeout: true,
    cooldownMinutes: 0,
    minCartValue: 1.0,
    maxCartValue: 15.0,
    minUserLevel: 'المستوى البرونزي',
    allowNewUsers: true,
    allowRegularUsers: true,
    allowVipUsers: true,
    maxDailyWinners: 80,
    targetWinRate: 30,
    winMessage: 'ذاكرة حديدية خارقة! استحققت كوبون خصم 25% بكل جدارة!',
    lossMessage: 'الذاكرة خانتك هذه المرة، تفضل بخصم عجلة الحظ.',
    timeoutMessage: 'انتهى وقت تذكر البطاقات.',
  },
  {
    id: 'g_missing_piece',
    type: 'missing_puzzle_piece',
    title: { ar: "القطعة الناقصة من التركيب", en: "The Missing Puzzle Piece" },
    description: { ar: "اختر القطعة الهندسية المناسبة تماماً لإكمال الصورة أو اللوحة الفنية.", en: "Choose the perfectly matching geometric piece to complete the picture or artwork." },
    icon: 'Puzzle',
    bannerImage: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=60',
    enabled: true,
    displayOrder: 7,
    placement: 'all',
    timerSeconds: 8,
    questionsPerRound: 4,
    dailyAttemptsLimit: 2,
    rewardType: 'discount_coupon',
    rewardAmount: 25,
    rewardXp: 50,
    difficulty: 'medium',
    optionsCount: 4,
    autoAdvanceOnTimeout: true,
    cooldownMinutes: 0,
    minCartValue: 1.0,
    maxCartValue: 15.0,
    minUserLevel: 'المستوى البرونزي',
    allowNewUsers: true,
    allowRegularUsers: true,
    allowVipUsers: true,
    maxDailyWinners: 100,
    targetWinRate: 35,
    winMessage: 'تطابق القطع متكامل! اكتملت اللوحة وفزت بكوبون الخصم 25%!',
    lossMessage: 'القطعة المختارة غير متطابقة، جرب عجلة الحظ.',
    timeoutMessage: 'انتهت المهلة المتاحة لاختيار القطعة.',
  },
  {
    id: 'g_fast_maze',
    type: 'one_stroke_maze',
    title: { ar: "المتاهة الذكية السريعة", en: "Fast Smart Maze" },
    description: 'اختر المسار الصحيح المفتوح للوصول من نقطة البداية إلى الهدف دون انقطاع.',
    icon: 'Compass',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=60',
    enabled: true,
    displayOrder: 8,
    placement: 'all',
    timerSeconds: 8,
    questionsPerRound: 4,
    dailyAttemptsLimit: 2,
    rewardType: 'discount_coupon',
    rewardAmount: 25,
    rewardXp: 55,
    difficulty: 'medium',
    optionsCount: 4,
    autoAdvanceOnTimeout: true,
    cooldownMinutes: 0,
    minCartValue: 1.0,
    maxCartValue: 15.0,
    minUserLevel: 'المستوى البرونزي',
    allowNewUsers: true,
    allowRegularUsers: true,
    allowVipUsers: true,
    maxDailyWinners: 100,
    targetWinRate: 35,
    winMessage: 'خرجت من المتاهة بنجاح باهر وفي وقت قياسي! مبروك كوبون 25%!',
    lossMessage: 'المسار كان مسدوداً، تفضل بفرصة عجلة التخفيضات.',
    timeoutMessage: 'انتهى وقت حل المتاهة.',
  },
  {
    id: 'g_order_sequence',
    type: 'order_sequence',
    title: 'ترتيب السلاسل والمقادير',
    description: 'رتب العناصر والكميات تصاعدياً أو تنازلياً حسب الحجم أو القيمة المنطقية.',
    icon: 'ArrowUpDown',
    bannerImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=60',
    enabled: true,
    displayOrder: 9,
    placement: 'all',
    timerSeconds: 8,
    questionsPerRound: 4,
    dailyAttemptsLimit: 2,
    rewardType: 'discount_coupon',
    rewardAmount: 25,
    rewardXp: 50,
    difficulty: 'medium',
    optionsCount: 4,
    autoAdvanceOnTimeout: true,
    cooldownMinutes: 0,
    minCartValue: 1.0,
    maxCartValue: 15.0,
    minUserLevel: 'المستوى البرونزي',
    allowNewUsers: true,
    allowRegularUsers: true,
    allowVipUsers: true,
    maxDailyWinners: 100,
    targetWinRate: 35,
    winMessage: 'ترتيب متسلسل ممتاز وصحيح 100%! مبروك كوبون 25%!',
    lossMessage: 'الترتيب غير صحيح، استمتع بخصم عجلة الحظ.',
    timeoutMessage: 'انتهى وقت الترتيب المتسلسل.',
  },
  {
    id: 'g_reaction_speed',
    type: 'reaction_speed',
    title: 'اختبار سرعة رد الفعل',
    description: 'اضغط على الإشارة الصحيحة فور وميضها لقياس سرعة استجابتك البصرية والبديهية.',
    icon: 'Zap',
    bannerImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=60',
    enabled: true,
    displayOrder: 10,
    placement: 'all',
    timerSeconds: 6,
    questionsPerRound: 4,
    dailyAttemptsLimit: 3,
    rewardType: 'discount_coupon',
    rewardAmount: 25,
    rewardXp: 40,
    difficulty: 'easy',
    optionsCount: 4,
    autoAdvanceOnTimeout: true,
    cooldownMinutes: 0,
    minCartValue: 1.0,
    maxCartValue: 15.0,
    minUserLevel: 'المستوى البرونزي',
    allowNewUsers: true,
    allowRegularUsers: true,
    allowVipUsers: true,
    maxDailyWinners: 120,
    targetWinRate: 45,
    winMessage: 'رد فعل برق خاطف! استجابة سريعة ومتقنة استحققت بها كوبون 25%!',
    lossMessage: 'كانت الاستجابة متأخرة أو خاطئة، جرب عجلة الحظ.',
    timeoutMessage: 'فاتتك إشارة الاستجابة السريعة.',
  },
];

// Seed visual puzzles
const initialPuzzles: VisualPuzzle[] = [
  // 1. Silhouette Matching (تطابق الظل)
  {
    id: 'vp_sil_1',
    type: 'silhouette_match',
    title: 'تطابق ظل قلم الحبر الفاخر',
    prompt: 'أي من الأدوات التالية يتطابق ظلها تماماً مع الشكل المعروض؟',
    category: 'أقلام وأدوات كتابة',
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 100 100" class="w-24 h-24 text-slate-900 fill-current mx-auto filter drop-shadow-md">
        <path d="M45 10 L55 10 L58 45 L54 85 L50 95 L46 85 L42 45 Z M47 25 L53 25 M48 55 L52 55" />
        <circle cx="50" cy="95" r="2" fill="#000" />
      </svg>`,
      promptDetails: 'انتبه لطول السن المعدني واستقامة الهيكل',
    },
    options: [
      {
        id: 'opt_1',
        label: 'قلم ريشة كلاسيكي رفيع',
        svgContent: `<svg viewBox="0 0 80 80" class="w-12 h-12 mx-auto"><path d="M35 10 L45 10 L48 45 L44 85 L40 95 L36 85 L32 45 Z" fill="#0284c7"/></svg>`,
      },
      {
        id: 'opt_2',
        label: 'قلم تحديد عريض (هايلايتر)',
        svgContent: `<svg viewBox="0 0 80 80" class="w-12 h-12 mx-auto"><rect x="25" y="15" width="30" height="50" rx="6" fill="#f59e0b"/><polygon points="30,65 50,65 40,80" fill="#d97706"/></svg>`,
      },
      {
        id: 'opt_3',
        label: 'قلم رصاص خ شبي مع ممحاة',
        svgContent: `<svg viewBox="0 0 80 80" class="w-12 h-12 mx-auto"><rect x="34" y="25" width="12" height="45" fill="#10b981"/><polygon points="34,25 46,25 40,10" fill="#f43f5e"/><rect x="34" y="70" width="12" height="8" rx="2" fill="#ec4899"/></svg>`,
      },
      {
        id: 'opt_4',
        label: 'فرشاة رسم مائية بيضاوية',
        svgContent: `<svg viewBox="0 0 80 80" class="w-12 h-12 mx-auto"><path d="M38 75 L42 75 L43 35 L40 10 L37 35 Z" fill="#8b5cf6"/><circle cx="40" cy="12" r="6" fill="#6d28d9"/></svg>`,
      },
    ],
    explanation: 'الشكل المعروض هو ظل قلم حبر كلاسيكي بسن حاد وتصميم متناسق.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_sil_2',
    type: 'silhouette_match',
    title: 'تطابق ظل حقيبة الظهر المدرسية',
    prompt: 'حدد الحقيبة المدرسية المطابقة لظل الشكل بالكامل:',
    category: 'شنط وحقائب مدرسية',
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 100 100" class="w-24 h-24 text-slate-950 fill-current mx-auto filter drop-shadow-md">
        <path d="M28 35 C28 20, 72 20, 72 35 L76 80 C76 86, 70 90, 64 90 L36 90 C30 90, 24 86, 24 80 Z M38 20 C38 12, 62 12, 62 20 M32 50 L68 50 L66 75 L34 75 Z" />
      </svg>`,
      promptDetails: 'قارن المقبض العلوي وجيب السحاب الأمامي المستطيل',
    },
    options: [
      {
        id: 'opt_1',
        label: 'حقيبة كتف جانبية',
        svgContent: `<svg viewBox="0 0 80 80" class="w-12 h-12 mx-auto"><rect x="15" y="30" width="50" height="35" rx="8" fill="#ec4899"/><path d="M20 30 C20 10, 60 10, 60 30" stroke="#be185d" stroke-width="4" fill="none"/></svg>`,
      },
      {
        id: 'opt_2',
        label: 'حقيبة ظهر مقوسة بجيب عريض',
        svgContent: `<svg viewBox="0 0 80 80" class="w-12 h-12 mx-auto"><path d="M24 30 C24 16, 56 16, 56 30 L60 70 C60 75, 55 78, 50 78 L30 78 C25 78, 20 75, 20 70 Z" fill="#3b82f6"/><rect x="26" y="44" width="28" height="20" rx="3" fill="#1d4ed8"/></svg>`,
      },
      {
        id: 'opt_3',
        label: 'حافظة لابتوب مستطيلة',
        svgContent: `<svg viewBox="0 0 80 80" class="w-12 h-12 mx-auto"><rect x="12" y="24" width="56" height="40" rx="4" fill="#64748b"/><rect x="30" y="16" width="20" height="8" rx="2" fill="#334155"/></svg>`,
      },
      {
        id: 'opt_4',
        label: 'حقيبة ترولي بعجلات',
        svgContent: `<svg viewBox="0 0 80 80" class="w-12 h-12 mx-auto"><rect x="22" y="25" width="36" height="45" rx="6" fill="#10b981"/><circle cx="26" cy="74" r="4" fill="#047857"/><circle cx="54" cy="74" r="4" fill="#047857"/></svg>`,
      },
    ],
    explanation: 'الحقيبة ذات المقبض القوسي والجيب الأمامي العريض هي التطابق الدقيق.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 2. Fast Pattern Count (عد الأنماط السريع)
  {
    id: 'vp_cnt_1',
    type: 'fast_pattern_count',
    title: 'تحدي عد أقلام التحديد الخضراء 🟢',
    prompt: 'كم عدد أقلام التحديد الخضراء (الزمردية) الظاهرة في اللوحة؟',
    category: 'قرطاسية وألوان',
    difficulty: 'easy',
    timeLimitSeconds: 7,
    correctAnswerIndex: 2, // 7 أقلام
    mainVisual: {
      gridItems: [
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'highlighter', color: '#f59e0b', label: 'برتقالي' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'pencil', color: '#3b82f6', label: 'أزرق' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'highlighter', color: '#ef4444', label: 'أحمر' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'eraser', color: '#8b5cf6', label: 'بنفسجي' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'highlighter', color: '#f59e0b', label: 'برتقالي' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
        { icon: 'highlighter', color: '#10b981', label: 'أخضر' },
      ],
      promptDetails: 'عد بسرعة أقلام التحديد الخضراء فقط وتجاهل الألوان الأخرى',
    },
    options: [
      { id: 'c1', label: '5 أقلام' },
      { id: 'c2', label: '6 أقلام' },
      { id: 'c3', label: '7 أقلام خضراء ✓' },
      { id: 'c4', label: '8 أقلام' },
    ],
    explanation: 'توجد بالضبط 7 أقلام تحديد باللون الأخضر داخل الشبكة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_cnt_2',
    type: 'fast_pattern_count',
    title: 'عد نجوم التميز الذهبية ⭐',
    prompt: 'ما هو عدد النجوم الذهبية اللامعة ذات 5 رؤوس في المشهد؟',
    category: 'أدوات تعليمية',
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1, // 6 نجوم
    mainVisual: {
      gridItems: [
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'circle', color: '#3b82f6', label: 'دائرة زرقاء' },
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'square', color: '#ec4899', label: 'مربع وردي' },
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'triangle', color: '#10b981', label: 'مثلث أخضر' },
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'star', color: '#94a3b8', label: 'نجمة رمادية' },
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'circle', color: '#eab308', label: 'قرص أصفر' },
        { icon: 'star', color: '#eab308', label: 'نجمة ذهبية' },
        { icon: 'diamond', color: '#6366f1', label: 'معين نيلي' },
      ],
      promptDetails: 'احذر النجوم الرمادية أو الأقراص الصفراء!',
    },
    options: [
      { id: 'c1', label: '5 نجوم' },
      { id: 'c2', label: '6 نجوم ذهبية ✓' },
      { id: 'c3', label: '7 نجوم' },
      { id: 'c4', label: '8 نجوم' },
    ],
    explanation: 'هناك 6 نجوم ذهبية وواحدة رمادية ورمز دائري أصفر.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 3. One-Stroke Maze / Route (مسار الخط الواحد)
  {
    id: 'vp_mze_1',
    type: 'one_stroke_maze',
    title: 'مسار التوصيل السريع إلى مكتبة الشاطئ الازرق',
    prompt: 'أي مسار ملون (A، B، C، D) يربط البداية (🚩) بالمتجر (🏪) دون أن يعترضه أي حاجز أحمر (⛔)؟',
    category: 'ألعاب ذكاء',
    difficulty: 'medium',
    timeLimitSeconds: 9,
    correctAnswerIndex: 2, // المسار C (الأزرق)
    mainVisual: {
      svgContent: `<svg viewBox="0 0 200 120" class="w-full max-w-xs mx-auto rounded-xl bg-slate-900 p-2 shadow-inner">
        <!-- Start & End Points -->
        <circle cx="20" cy="60" r="10" fill="#22c55e" />
        <text x="20" y="64" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">🚩</text>
        
        <circle cx="180" cy="60" r="12" fill="#0284c7" />
        <text x="180" y="65" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">🏪</text>

        <!-- Blockers -->
        <rect x="70" y="15" width="12" height="30" rx="3" fill="#ef4444" />
        <text x="76" y="33" font-size="8" fill="#fff" text-anchor="middle">⛔</text>

        <rect x="120" y="75" width="12" height="35" rx="3" fill="#ef4444" />
        <text x="126" y="95" font-size="8" fill="#fff" text-anchor="middle">⛔</text>

        <!-- Paths -->
        <!-- Path A: Red - hits top blocker -->
        <path d="M20 60 Q50 25 70 25 L100 25 Q140 25 180 60" fill="none" stroke="#f43f5e" stroke-width="3" stroke-dasharray="3,3" opacity="0.6"/>
        
        <!-- Path B: Yellow - hits bottom blocker -->
        <path d="M20 60 Q50 95 120 90 L180 60" fill="none" stroke="#eab308" stroke-width="3" stroke-dasharray="3,3" opacity="0.6"/>

        <!-- Path C: Blue (Correct) - winds safely through center -->
        <path d="M20 60 Q50 85 95 70 Q140 40 180 60" fill="none" stroke="#38bdf8" stroke-width="4"/>

        <!-- Path D: Purple - looped dead end -->
        <path d="M20 60 Q60 110 90 100 Q100 70 70 60" fill="none" stroke="#a855f7" stroke-width="3" stroke-dasharray="3,3" opacity="0.6"/>
      </svg>`,
      promptDetails: 'تتبع المسار الأزرق (C) لتجاوز جميع الحواجز بأمان',
    },
    options: [
      { id: 'opt_A', label: 'المسار A (الوردي المتقطع)' },
      { id: 'opt_B', label: 'المسار B (الأصفر السفلي)' },
      { id: 'opt_C', label: 'المسار C (الأزرق المتدفق) ✓' },
      { id: 'opt_D', label: 'المسار D (البنفسجي المغلق)' },
    ],
    explanation: 'المسار C (الأزرق) يمر بين الحاجز العلوي والحاجز السفلي بسلاسة دون اصطدام.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 4. Missing Puzzle Piece (القطعة المفقودة)
  {
    id: 'vp_ms_1',
    type: 'missing_puzzle_piece',
    title: 'القطعة المفقودة في لوحة الألوان الفنية',
    prompt: 'أي قطعة من الخيارات أدناه تكمل نمط التدرج اللوني في الخانة الفارغة (؟)؟',
    category: 'أدوات رسم وفنون',
    difficulty: 'medium',
    timeLimitSeconds: 9,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 150 150" class="w-36 h-36 mx-auto rounded-2xl border-2 border-slate-700 bg-slate-900 p-2">
        <rect x="10" y="10" width="40" height="40" rx="6" fill="#38bdf8"/>
        <rect x="55" y="10" width="40" height="40" rx="6" fill="#818cf8"/>
        <rect x="100" y="10" width="40" height="40" rx="6" fill="#c084fc"/>

        <rect x="10" y="55" width="40" height="40" rx="6" fill="#0284c7"/>
        <rect x="55" y="55" width="40" height="40" rx="6" fill="#4f46e5"/>
        <rect x="100" y="55" width="40" height="40" rx="6" fill="#9333ea"/>

        <rect x="10" y="100" width="40" height="40" rx="6" fill="#0369a1"/>
        <rect x="55" y="100" width="40" height="40" rx="6" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,4" fill="#1e293b"/>
        <text x="75" y="126" font-size="18" font-weight="extrabold" fill="#fbbf24" text-anchor="middle">؟</text>

        <rect x="100" y="100" width="40" height="40" rx="6" fill="#6b21a8"/>
      </svg>`,
      promptDetails: 'العمود الأوسط يتدرج من النيلي الفاتح (#818cf8) إلى المتوسط (#4f46e5) وصولاً إلى الداكن',
    },
    options: [
      {
        id: 'p1',
        label: 'مربع نيلي داكن (#3730a3) ✓',
        svgContent: `<svg viewBox="0 0 40 40" class="w-10 h-10 mx-auto"><rect width="40" height="40" rx="6" fill="#3730a3"/></svg>`,
      },
      {
        id: 'p2',
        label: 'مربع برتقالي ناري',
        svgContent: `<svg viewBox="0 0 40 40" class="w-10 h-10 mx-auto"><rect width="40" height="40" rx="6" fill="#ea580c"/></svg>`,
      },
      {
        id: 'p3',
        label: 'مربع أخضر غامق',
        svgContent: `<svg viewBox="0 0 40 40" class="w-10 h-10 mx-auto"><rect width="40" height="40" rx="6" fill="#047857"/></svg>`,
      },
      {
        id: 'p4',
        label: 'مربع أزرق سماوي فاتح',
        svgContent: `<svg viewBox="0 0 40 40" class="w-10 h-10 mx-auto"><rect width="40" height="40" rx="6" fill="#7dd3fc"/></svg>`,
      },
    ],
    explanation: 'التدرج اللوني في العمود الأوسط يتطلب درجة الأزرق النيلي الداكن لإتمام التناسق.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 5. Visual Difference (العثور على الاختلاف)
  {
    id: 'vp_diff_1',
    type: 'visual_difference',
    title: 'اكتشاف العنصر المختلف على طاولة المكتب',
    prompt: 'قارن بين اللوحتين؛ ما هو العنصر الذي تم استبداله في اللوحة اليسرى (B)؟',
    category: 'أدوات مكتبية',
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 3, // المبراة
    mainVisual: {
      svgContent: `<div class="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        <div class="border border-sky-400/40 rounded-2xl p-2.5 bg-slate-900 text-center">
          <span class="text-[10px] text-sky-400 font-bold block mb-1">اللوحة الأصلية (A)</span>
          <div class="flex justify-around items-center h-16 bg-slate-800/80 rounded-xl px-2">
            <span title="دفتر">📓</span>
            <span title="مقص">✂️</span>
            <span title="ممحاة">🧼</span>
            <span title="دباسة">📎</span>
          </div>
        </div>
        <div class="border border-amber-400/40 rounded-2xl p-2.5 bg-slate-900 text-center">
          <span class="text-[10px] text-amber-400 font-bold block mb-1">اللوحة المعدلة (B)</span>
          <div class="flex justify-around items-center h-16 bg-slate-800/80 rounded-xl px-2">
            <span title="دفتر">📓</span>
            <span title="مقص">✂️</span>
            <span title="مبراة">✏️</span>
            <span title="دباسة">📎</span>
          </div>
        </div>
      </div>`,
      promptDetails: 'دقق في العنصر الثالث من اليمين في كل لوحة',
    },
    options: [
      { id: 'd1', label: 'تم تغيير الدفتر' },
      { id: 'd2', label: 'تم تغيير المقص' },
      { id: 'd3', label: 'تم تغيير الدباسة' },
      { id: 'd4', label: 'تم استبدال الممحاة بقلم رصاص / مبراة ✓' },
    ],
    explanation: 'في اللوحة الأولى توجد الممحاة (🧼) بينما تم استبدالها في اللوحة الثانية بالقلم (✏️).',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 6. Pattern Completion (إكمال النمط البصري)
  {
    id: 'vp_pat_1',
    type: 'pattern_completion',
    title: 'إكمال متتالية الأشكال الهندسية للأدوات',
    prompt: 'ما هو الشكل الهندسي التالي الذي يكمل المتتالية المنطقية؟ [دائرة 1️⃣ → مربع 4️⃣ → سداسي 6️⃣ → ثماني 8️⃣ → ؟]',
    category: 'أدوات هندسية',
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1, // مضلع عشري (10 أضلاع)
    mainVisual: {
      svgContent: `<div class="flex items-center justify-center gap-2 py-3 bg-slate-900 rounded-2xl border border-slate-800">
        <div class="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-xs font-bold text-sky-300">○ (0)</div>
        <span class="text-slate-500 font-bold">→</span>
        <div class="w-10 h-10 bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-xs font-bold text-indigo-300">□ (4)</div>
        <span class="text-slate-500 font-bold">→</span>
        <div class="w-10 h-10 bg-purple-500/20 border border-purple-400 flex items-center justify-center text-xs font-bold text-purple-300">⬡ (6)</div>
        <span class="text-slate-500 font-bold">→</span>
        <div class="w-10 h-10 bg-pink-500/20 border border-pink-400 flex items-center justify-center text-xs font-bold text-pink-300">🛑 (8)</div>
        <span class="text-slate-500 font-bold">→</span>
        <div class="w-10 h-10 bg-amber-500/30 border-2 border-dashed border-amber-400 flex items-center justify-center text-sm font-extrabold text-amber-300 animate-pulse">؟</div>
      </div>`,
      promptDetails: 'زيادة متتالية بمقدار +2 في عدد الأضلاع بعد المربع (4 → 6 → 8 → 10)',
    },
    options: [
      { id: 'opt_1', label: 'مثلث (3 أضلاع)' },
      { id: 'opt_2', label: 'مضلع عشري Decagon (10 أضلاع) ✓' },
      { id: 'opt_3', label: 'نجمة خماسية (5 أضلاع)' },
      { id: 'opt_4', label: 'مربع إضافي' },
    ],
    explanation: 'تزيد الأضلاع بمقدار 2 في كل خطوة (4, 6, 8, 10)، وبالتالي الشكل القادم هو ذو 10 أضلاع.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vp_pat_2',
    type: 'pattern_completion',
    title: 'إكمال دوران مسطرة الهندسة 📐',
    prompt: 'المسطرة تدور باتجاه عقارب الساعة بمقدار 90 درجة كل خطوة؛ ما هو الوضع التالي؟',
    category: 'أدوات هندسية',
    difficulty: 'easy',
    timeLimitSeconds: 7,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="flex items-center justify-center gap-3 py-2 bg-slate-900 rounded-2xl">
        <span class="text-2xl transform rotate-0">📐</span>
        <span class="text-slate-500">→</span>
        <span class="text-2xl transform rotate-90">📐</span>
        <span class="text-slate-500">→</span>
        <span class="text-2xl transform rotate-180">📐</span>
        <span class="text-slate-500">→</span>
        <span class="text-2xl text-amber-400 font-extrabold">؟</span>
      </div>`,
      promptDetails: '0° ثم 90° ثم 180° ثم ...',
    },
    options: [
      { id: 'p1', label: 'دوران 270° (نحو اليسار) ✓' },
      { id: 'p2', label: 'دوران 45°' },
      { id: 'p3', label: 'عودة إلى 0° مباشرة' },
      { id: 'p4', label: 'دوران معكوس' },
    ],
    explanation: 'الدوران بمقدار 90 درجة بعد 180 درجة يصل إلى 270 درجة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 7. Fast Pattern Count (العد السريع)
  {
    id: 'vp_cnt_1',
    type: 'fast_pattern_count',
    title: 'عد أقلام التمييز الصفراء 🖍️',
    prompt: 'كم عدد أقلام التمييز الصفراء الموزعة في اللوحة؟',
    category: 'أقلام وأدوات',
    difficulty: 'easy',
    timeLimitSeconds: 7,
    correctAnswerIndex: 2, // 5 أقلام
    mainVisual: {
      svgContent: `<div class="grid grid-cols-4 gap-2.5 p-3 bg-slate-900 rounded-2xl max-w-xs mx-auto border border-slate-800">
        <div class="h-10 bg-amber-400/20 border border-amber-400 rounded-lg flex items-center justify-center text-lg font-bold">🖍️</div>
        <div class="h-10 bg-sky-500/20 border border-sky-400 rounded-lg flex items-center justify-center text-lg font-bold">📏</div>
        <div class="h-10 bg-amber-400/20 border border-amber-400 rounded-lg flex items-center justify-center text-lg font-bold">🖍️</div>
        <div class="h-10 bg-purple-500/20 border border-purple-400 rounded-lg flex items-center justify-center text-lg font-bold">✂️</div>
        <div class="h-10 bg-rose-500/20 border border-rose-400 rounded-lg flex items-center justify-center text-lg font-bold">📌</div>
        <div class="h-10 bg-amber-400/20 border border-amber-400 rounded-lg flex items-center justify-center text-lg font-bold">🖍️</div>
        <div class="h-10 bg-emerald-500/20 border border-emerald-400 rounded-lg flex items-center justify-center text-lg font-bold">📓</div>
        <div class="h-10 bg-amber-400/20 border border-amber-400 rounded-lg flex items-center justify-center text-lg font-bold">🖍️</div>
        <div class="h-10 bg-sky-500/20 border border-sky-400 rounded-lg flex items-center justify-center text-lg font-bold">📏</div>
        <div class="h-10 bg-amber-400/20 border border-amber-400 rounded-lg flex items-center justify-center text-lg font-bold">🖍️</div>
        <div class="h-10 bg-indigo-500/20 border border-indigo-400 rounded-lg flex items-center justify-center text-lg font-bold">📎</div>
        <div class="h-10 bg-rose-500/20 border border-rose-400 rounded-lg flex items-center justify-center text-lg font-bold">📌</div>
      </div>`,
      promptDetails: 'ابحث عن رمز القلم 🖍️ بالخلفية الصفراء',
    },
    options: [
      { id: 'c1', label: '3 أقلام' },
      { id: 'c2', label: '4 أقلام' },
      { id: 'c3', label: '5 أقلام تمييز صفراء ✓' },
      { id: 'c4', label: '6 أقلام' },
    ],
    explanation: 'يوجد 5 أقلام تمييز صفراء موزعة في المربعات.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 8. Shape Sorting (ترتيب الأشكال)
  {
    id: 'vp_sort_1',
    type: 'shape_sorting',
    title: 'فرز الأدوات حسب الشكل الهندسي',
    prompt: 'أي مجموعة أدوات تحتوي فقط على أشكال دائرية ومستديرة؟',
    category: 'تصنيف الأشكال',
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 1,
    mainVisual: {
      svgContent: `<div class="flex justify-center items-center gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800">
        <div class="w-12 h-12 rounded-full border-2 border-dashed border-sky-400 flex items-center justify-center text-xs font-bold text-sky-300">مطلوب: دائري ⭕</div>
      </div>`,
      promptDetails: 'اختر المجموعة التي لا تحتوي على أي أضلاع حادة أو مستطيلات',
    },
    options: [
      { id: 's1', label: 'مسطرة مثلثة 📐 وممحاة مستطيلة 🧼' },
      { id: 's2', label: 'شريط لاصق دائري 🛞 وممحاة دائرية 🔘 وعدسة مكبرة 🔍 ✓' },
      { id: 's3', label: 'دفتر ملاحظات 📓 ومقص حاد ✂️' },
      { id: 's4', label: 'علبة ألوان خشبية 📦 ومسطرة مستقيمة 📏' },
    ],
    explanation: 'الشريط اللاصق والممحاة الدائرية والعدسة المكبرة كلها أدوات دائرية خالية من الزوايا الحادة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 9. Visual Memory (الذاكرة البصرية)
  {
    id: 'vp_mem_1',
    type: 'visual_memory',
    title: 'تذكر موقع الدباسة المدرسية 📎',
    prompt: 'في أي مربع كان موقع الدباسة المدرسية (📎)؟ [الصف العلوي A - B | الصف السفلي C - D]',
    category: 'الذاكرة البصرية',
    difficulty: 'medium',
    timeLimitSeconds: 10,
    correctAnswerIndex: 2, // المربع C (أسفل يمين)
    mainVisual: {
      svgContent: `<div class="grid grid-cols-2 gap-3 p-3 bg-slate-900 rounded-2xl max-w-xs mx-auto border border-slate-800 text-center">
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700"><span class="text-xs text-slate-400 block mb-1">المربع A</span><span class="text-xl">📓 دفتر</span></div>
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700"><span class="text-xs text-slate-400 block mb-1">المربع B</span><span class="text-xl">✂️ مقص</span></div>
        <div class="p-3 bg-amber-500/20 rounded-xl border border-amber-500/50"><span class="text-xs text-amber-400 block mb-1 font-bold">المربع C</span><span class="text-xl">📎 دباسة</span></div>
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700"><span class="text-xs text-slate-400 block mb-1">المربع D</span><span class="text-xl">📐 مسطرة</span></div>
      </div>`,
      promptDetails: 'المربع C في الصف السفلي على اليمين',
    },
    options: [
      { id: 'm1', label: 'المربع A (أعلى يمين)' },
      { id: 'm2', label: 'المربع B (أعلى يسار)' },
      { id: 'm3', label: 'المربع C (أسفل يمين) ✓' },
      { id: 'm4', label: 'المربع D (أسفل يسار)' },
    ],
    explanation: 'كانت الدباسة المدرسية موضوعة في المربع C في الصف السفلي.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 10. Missing Puzzle Piece (القطعة الناقصة)
  {
    id: 'vp_miss_1',
    type: 'missing_puzzle_piece',
    title: 'إيجاد القطعة المفقودة من لوحة الألوان 🎨',
    prompt: 'ما هي القطعة المفقودة لإكمال اللوحة الهندسية المتناسقة؟',
    category: 'تركيب وقطع',
    difficulty: 'medium',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<svg viewBox="0 0 120 80" class="w-44 h-28 mx-auto bg-slate-900 rounded-2xl p-2 border border-slate-800">
        <rect x="5" y="5" width="50" height="30" rx="4" fill="#38bdf8"/>
        <rect x="65" y="5" width="50" height="30" rx="4" fill="#818cf8"/>
        <rect x="5" y="45" width="50" height="30" rx="4" fill="#0284c7"/>
        <rect x="65" y="45" width="50" height="30" rx="4" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3,3" fill="#1e293b"/>
        <text x="90" y="65" fill="#fbbf24" font-size="14" font-weight="bold" text-anchor="middle">؟</text>
      </svg>`,
      promptDetails: 'النمط اللوني الأفقي يربط بين الأزرق الفاتح والبنفسجي، والسفلي بين الأزرق الغامق والبنفسجي الغامق',
    },
    options: [
      { id: 'mp1', label: 'مستطيل بنفسجي نيلي غامق (#4338ca) ✓' },
      { id: 'mp2', label: 'دائرة حمراء ساطعة' },
      { id: 'mp3', label: 'مستطيل أخضر فاتح' },
      { id: 'mp4', label: 'مثلث برتقالي' },
    ],
    explanation: 'القطعة المفقودة تكمل العمود الأيمن المتدرج من البنفسجي الفاتح إلى البنفسجي الغامق.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 11. One-Stroke Maze (المتاهة السريعة)
  {
    id: 'vp_maze_1',
    type: 'one_stroke_maze',
    title: 'المتاهة السريعة إلى الحقيبة المدرسية 🎒',
    prompt: 'أي المسارات الثلاثة (1 أو 2 أو 3) مفتوح بالكامل للوصول إلى الحقيبة دون أي حاجز؟',
    category: 'متاهات ومسارات',
    difficulty: 'medium',
    timeLimitSeconds: 9,
    correctAnswerIndex: 1, // مسار 2
    mainVisual: {
      svgContent: `<div class="p-3 bg-slate-900 rounded-2xl border border-slate-800 max-w-sm mx-auto">
        <div class="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
          <span>نقطة البداية: 🚶‍♂️</span>
          <span>الهدف: 🎒 الحقيبة</span>
        </div>
        <div class="space-y-2 text-xs">
          <div class="p-1.5 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center justify-between text-rose-300">
            <span>مسار [1]: يمين ➔ أعلى ➔ (جدار مسدود ⛔)</span>
          </div>
          <div class="p-1.5 bg-emerald-950/40 border border-emerald-500/60 rounded-lg flex items-center justify-between text-emerald-300 font-bold">
            <span>مسار [2]: مستقيم ➔ دوران يسار ➔ طريق مفتوح ✅</span>
          </div>
          <div class="p-1.5 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center justify-between text-rose-300">
            <span>مسار [3]: أسفل ➔ دوران يمين ➔ (حاجز مغلق ⛔)</span>
          </div>
        </div>
      </div>`,
      promptDetails: 'المسار 2 سالك ومباشر بدون عوائق',
    },
    options: [
      { id: 'mz1', label: 'المسار رقم [1]' },
      { id: 'mz2', label: 'المسار رقم [2] (المفتوح بالكامل) ✓' },
      { id: 'mz3', label: 'المسار رقم [3]' },
      { id: 'mz4', label: 'جميع المسارات مغلقة' },
    ],
    explanation: 'المسار رقم [2] هو المسار الوحيد الخالي من العوائق والحواجز المغلقة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 12. Order Sequence (ترتيب السلاسل)
  {
    id: 'vp_seq_1',
    type: 'order_sequence',
    title: 'ترتيب الأدوات تصاعدياً حسب الطول 📏',
    prompt: 'رتب الأدوات التالية من الأقصر إلى الأطول: [ممحاة 🧼 (3cm) - قلم رصاص ✏️ (15cm) - مسطرة 📏 (30cm) - دبوس 📎 (1cm)]',
    category: 'ترتيب وقياسات',
    difficulty: 'easy',
    timeLimitSeconds: 8,
    correctAnswerIndex: 0,
    mainVisual: {
      svgContent: `<div class="flex justify-around items-center p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        <div><span class="text-xl">📎</span><span class="text-[10px] text-slate-400 block">1cm</span></div>
        <div><span class="text-xl">🧼</span><span class="text-[10px] text-slate-400 block">3cm</span></div>
        <div><span class="text-xl">✏️</span><span class="text-[10px] text-slate-400 block">15cm</span></div>
        <div><span class="text-xl">📏</span><span class="text-[10px] text-slate-400 block">30cm</span></div>
      </div>`,
      promptDetails: 'الترتيب من الأصغر 1cm إلى الأكبر 30cm',
    },
    options: [
      { id: 'sq1', label: 'دبوس (1cm) ➔ ممحاة (3cm) ➔ قلم (15cm) ➔ مسطرة (30cm) ✓' },
      { id: 'sq2', label: 'مسطرة ➔ قلم ➔ ممحاة ➔ دبوس' },
      { id: 'sq3', label: 'ممحاة ➔ دبوس ➔ قلم ➔ مسطرة' },
      { id: 'sq4', label: 'قلم ➔ مسطرة ➔ ممحاة ➔ دبوس' },
    ],
    explanation: 'الترتيب التصاعدي الصحيح يبدأ من الدبوس (1 سم) ثم الممحاة (3 سم) ثم القلم (15 سم) ثم المسطرة (30 سم).',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // 13. Reaction Speed (سرعة رد الفعل)
  {
    id: 'vp_rx_1',
    type: 'reaction_speed',
    title: 'استجابة سريعة للرمز الذهبي ✨',
    prompt: 'اضغط فوراً على الزر الذي يحتوي على الرمز الذهبي اللامع (⭐):',
    category: 'سرعة رد الفعل',
    difficulty: 'easy',
    timeLimitSeconds: 6,
    correctAnswerIndex: 1, // الخيار الثاني
    mainVisual: {
      svgContent: `<div class="p-4 bg-slate-900 rounded-2xl border border-amber-500/40 text-center animate-pulse">
        <span class="text-xs text-amber-400 font-bold block mb-1">وميض فوري! حدد الرمز:</span>
        <span class="text-4xl">⭐</span>
      </div>`,
      promptDetails: 'اختر زر النجمة الذهبية بأقصى سرعة',
    },
    options: [
      { id: 'rx1', label: '🔹 زر المربع الأزرق' },
      { id: 'rx2', label: '⭐ زر النجمة الذهبية (المطابق للوميض) ✓' },
      { id: 'rx3', label: '🛑 زر الإيقاف الأحمر' },
      { id: 'rx4', label: '🟢 زر الدائرة الخضراء' },
    ],
    explanation: 'الرمز الذي ومض هو النجمة الذهبية ⭐.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const initialWinners: RecentWinner[] = [
  {
    id: 'win_1',
    userName: 'فاطمة م.',
    rewardTitle: 'فازت بكوبون خصم 25% ومكافأة رصيد 1.000 د.ك',
    rewardType: 'discount_coupon',
    discountPercentage: 25,
    amountKwd: 1.0,
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'win_2',
    userName: 'عبد الرحمن ك.',
    rewardTitle: 'حصل على كود خصم 30% من عجلة الحظ',
    rewardType: 'discount_wheel',
    discountPercentage: 30,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'win_3',
    userName: 'سارة العازمي',
    rewardTitle: 'فازت بصندوق الغموض (حقيبة مدرسية بريميوم)',
    rewardType: 'mystery_box',
    amountKwd: 4.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    id: 'win_4',
    userName: 'يوسف خ.',
    rewardTitle: 'فاز في مبارزة التسوق 1v1 وحصل على خصم 25%',
    rewardType: 'duel',
    discountPercentage: 25,
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
  },
];

class FreeChallengeEngine {
  private data: FreeChallengeStorage;
  private isSaving = false;
  private pendingSave = false;

  constructor() {
    this.ensureDir();
    this.data = this.loadData();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): FreeChallengeStorage {
    const mergePuzzles = (existing: VisualPuzzle[]): VisualPuzzle[] => {
      const map = new Map<string, VisualPuzzle>();
      for (const p of allInitialPuzzles) map.set(p.id, p);
      if (Array.isArray(existing)) {
        for (const e of existing) {
          if (e && e.id) map.set(e.id, { ...(map.get(e.id) || {}), ...e });
        }
      }
      return Array.from(map.values());
    };

    const mergeGames = (existing: GameConfig[]): GameConfig[] => {
      const map = new Map<string, GameConfig>();
      for (const g of defaultGames) map.set(g.id, g);
      if (Array.isArray(existing)) {
        for (const e of existing) {
          if (e && e.id) map.set(e.id, { ...(map.get(e.id) || {}), ...e });
        }
      }
      return Array.from(map.values());
    };

    try {
      if (fs.existsSync(CHALLENGE_FILE)) {
        const raw = fs.readFileSync(CHALLENGE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          settings: { ...defaultSettings, ...(parsed.settings || {}) },
          games: mergeGames(parsed.games),
          puzzles: mergePuzzles(parsed.puzzles),
          sessions: parsed.sessions || {},
          securityLogs: Array.isArray(parsed.securityLogs) ? parsed.securityLogs : [],
          recentWinners: Array.isArray(parsed.recentWinners) && parsed.recentWinners.length > 0 ? parsed.recentWinners : initialWinners,
          duels: parsed.duels || {},
          referrals: Array.isArray(parsed.referrals) ? parsed.referrals : [],
          activeDiscounts: parsed.activeDiscounts || {},
          freeCartVouchers: parsed.freeCartVouchers || {},
          dailyUserAttempts: parsed.dailyUserAttempts || {},
        };
      }
    } catch (err) {
      console.error('Error loading free challenge file:', err);
    }

    return {
      settings: defaultSettings,
      games: defaultGames,
      puzzles: allInitialPuzzles,
      sessions: {},
      securityLogs: [],
      recentWinners: initialWinners,
      duels: {},
      referrals: [],
      activeDiscounts: {},
      freeCartVouchers: {},
      dailyUserAttempts: {},
    };
  }

  public save(): void {
    if (this.isSaving) {
      this.pendingSave = true;
      return;
    }

    this.isSaving = true;
    try {
      this.ensureDir();
      const tmp = `${CHALLENGE_FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmp, CHALLENGE_FILE);
    } catch (err) {
      console.error('Error saving free challenge data:', err);
    } finally {
      this.isSaving = false;
      if (this.pendingSave) {
        this.pendingSave = false;
        this.save();
      }
    }
  }

  // --- Games Management (10 Games Framework) ---
  public getGames(includeDisabled = false): GameConfig[] {
    if (!Array.isArray(this.data.games) || this.data.games.length === 0) {
      this.data.games = defaultGames;
      this.save();
    }
    const sorted = [...this.data.games].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    if (includeDisabled) return sorted;
    return sorted.filter(g => g.enabled);
  }

  public getGameById(id: string): GameConfig | undefined {
    return this.getGames(true).find(g => g.id === id);
  }

  public upsertGame(game: Partial<GameConfig> & { title: string; type: VisualPuzzleType }): GameConfig {
    const id = game.id || `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullGame: GameConfig = {
      id,
      type: game.type,
      title: game.title,
      description: game.description || '',
      icon: game.icon || 'Sparkles',
      bannerImage: game.bannerImage,
      enabled: game.enabled !== undefined ? game.enabled : true,
      displayOrder: game.displayOrder ?? (this.data.games.length + 1),
      placement: game.placement || 'all',
      timerSeconds: game.timerSeconds || 8,
      questionsPerRound: game.questionsPerRound || 4,
      dailyAttemptsLimit: game.dailyAttemptsLimit || 2,
      rewardType: game.rewardType || 'free_cart',
      rewardAmount: game.rewardAmount || 15.0,
      rewardXp: game.rewardXp || 50,
      difficulty: game.difficulty || 'medium',
      optionsCount: game.optionsCount || 4,
      autoAdvanceOnTimeout: game.autoAdvanceOnTimeout !== undefined ? game.autoAdvanceOnTimeout : true,
      cooldownMinutes: game.cooldownMinutes || 0,
      minCartValue: game.minCartValue || 1.0,
      maxCartValue: game.maxCartValue || 15.0,
      minUserLevel: game.minUserLevel,
      allowNewUsers: game.allowNewUsers !== undefined ? game.allowNewUsers : true,
      allowRegularUsers: game.allowRegularUsers !== undefined ? game.allowRegularUsers : true,
      allowVipUsers: game.allowVipUsers !== undefined ? game.allowVipUsers : true,
      maxDailyWinners: game.maxDailyWinners || 100,
      targetWinRate: game.targetWinRate || 35,
      winMessage: game.winMessage,
      lossMessage: game.lossMessage,
      timeoutMessage: game.timeoutMessage,
      startDate: game.startDate,
      endDate: game.endDate,
      activeDays: game.activeDays,
    };

    if (!Array.isArray(this.data.games)) this.data.games = [];
    const idx = this.data.games.findIndex(g => g.id === id);
    if (idx >= 0) {
      this.data.games[idx] = fullGame;
    } else {
      this.data.games.push(fullGame);
    }
    this.save();
    return fullGame;
  }

  public deleteGame(id: string): boolean {
    if (!Array.isArray(this.data.games)) return false;
    const initialLen = this.data.games.length;
    this.data.games = this.data.games.filter(g => g.id !== id);
    if (this.data.games.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public reorderGames(orderedIds: string[]): GameConfig[] {
    if (!Array.isArray(this.data.games)) this.data.games = defaultGames;
    const map = new Map(this.data.games.map(g => [g.id, g]));
    const reordered: GameConfig[] = [];
    orderedIds.forEach((id, idx) => {
      const g = map.get(id);
      if (g) {
        g.displayOrder = idx + 1;
        reordered.push(g);
        map.delete(id);
      }
    });
    // Add remaining
    map.forEach(g => {
      g.displayOrder = reordered.length + 1;
      reordered.push(g);
    });
    this.data.games = reordered;
    this.save();
    return this.data.games;
  }

  // --- Settings ---
  public getSettings(): FreeChallengeSettings {
    return this.data.settings;
  }

  public updateSettings(update: Partial<FreeChallengeSettings>): FreeChallengeSettings {
    this.data.settings = { ...this.data.settings, ...update };
    this.save();
    this.logSecurity('UNAUTHORIZED_ACCESS', 'تم تحديث إعدادات تحدي التسوق المجاني من الإدارة', 'info');
    return this.data.settings;
  }

  // --- Puzzles Management ---
  public getPuzzles(includeInactive = false): VisualPuzzle[] {
    if (includeInactive) return this.data.puzzles;
    return this.data.puzzles.filter(p => p.isActive);
  }

  public getPuzzleById(id: string): VisualPuzzle | undefined {
    return this.data.puzzles.find(p => p.id === id);
  }

  public upsertPuzzle(puzzle: Partial<VisualPuzzle> & { title: string; prompt: string; type: VisualPuzzleType }): VisualPuzzle {
    const id = puzzle.id || `vp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullPuzzle: VisualPuzzle = {
      id,
      type: puzzle.type,
      title: puzzle.title,
      prompt: puzzle.prompt,
      category: puzzle.category || 'عام',
      difficulty: puzzle.difficulty || 'medium',
      timeLimitSeconds: puzzle.timeLimitSeconds,
      options: puzzle.options || [],
      correctAnswerIndex: puzzle.correctAnswerIndex ?? 0,
      mainVisual: puzzle.mainVisual,
      explanation: puzzle.explanation,
      isActive: puzzle.isActive !== undefined ? puzzle.isActive : true,
      createdAt: puzzle.createdAt || new Date().toISOString(),
    };

    const idx = this.data.puzzles.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.data.puzzles[idx] = fullPuzzle;
    } else {
      this.data.puzzles.unshift(fullPuzzle);
    }
    this.save();
    return fullPuzzle;
  }

  public deletePuzzle(id: string): boolean {
    const initialLen = this.data.puzzles.length;
    this.data.puzzles = this.data.puzzles.filter(p => p.id !== id);
    if (this.data.puzzles.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Daily Attempts Tracking ---
  private getTodayKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  public getUserDailyAttempts(userId: string): { attemptsUsed: number; maxAllowed: number; remaining: number } {
    const today = this.getTodayKey();
    const entry = this.data.dailyUserAttempts[userId];
    const maxAllowed = this.data.settings.dailyAttemptsLimit || 2;

    if (!entry || entry.date !== today) {
      return { attemptsUsed: 0, maxAllowed, remaining: maxAllowed };
    }

    const remaining = Math.max(0, maxAllowed - entry.attemptsCount);
    return { attemptsUsed: entry.attemptsCount, maxAllowed, remaining };
  }

  private incrementUserDailyAttempt(userId: string): void {
    const today = this.getTodayKey();
    const entry = this.data.dailyUserAttempts[userId];
    if (!entry || entry.date !== today) {
      this.data.dailyUserAttempts[userId] = { date: today, attemptsCount: 1 };
    } else {
      this.data.dailyUserAttempts[userId].attemptsCount += 1;
    }
    this.save();
  }

  // --- Start Challenge Session ---
  public startChallengeSession(params: {
    userId: string;
    displayName?: string;
    sessionId?: string;
    mode?: 'challenge' | 'mystery_box' | 'duel' | 'practice';
    mysteryCategoryId?: string;
    gameId?: string;
    ip?: string;
    userAgent?: string;
  }): {
    success: boolean;
    error?: string;
    sessionToken?: string;
    sessionId?: string;
    firstPuzzle?: any;
    cartSnapshot?: CartSnapshot | null;
    settings?: any;
    game?: GameConfig;
  } {
    if (!this.data.settings.gameEnabled) {
      return { success: false, error: 'تحدي الألغاز والمسابقات البصرية متوقف مؤقتاً لأعمال الصيانة' };
    }

    const { userId, displayName = 'مستخدم المتجر', sessionId: clientCartSessionId, mode = 'challenge', gameId, ip, userAgent } = params;

    let selectedGame: GameConfig | undefined = undefined;
    if (gameId) {
      selectedGame = this.getGameById(gameId);
      if (selectedGame && !selectedGame.enabled) {
        return { success: false, error: 'هذه اللعبة متوقفة حالياً بقرار من إدارة المتجر' };
      }
    }

    // Check daily limits
    if (mode !== 'practice') {
      const maxAllowed = selectedGame?.dailyAttemptsLimit || this.data.settings.dailyAttemptsLimit || 2;
      const { attemptsUsed } = this.getUserDailyAttempts(userId);
      if (attemptsUsed >= maxAllowed) {
        return {
          success: false,
          error: `لقد استنفدت الحد اليومي المسموح من المحاولات (${maxAllowed} محاولات يومياً). تفضل بالعودة غداً!`,
        };
      }
    }

    // Prepare Cart Snapshot if cart is present
    let cartSnapshot: CartSnapshot | null = null;
    if (clientCartSessionId) {
      const userCart = db.getCart(clientCartSessionId);
      if (userCart && userCart.items.length > 0) {
        cartSnapshot = {
          snapshotId: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          items: JSON.parse(JSON.stringify(userCart.items)),
          subtotal: userCart.subtotal,
          total: userCart.total,
          createdAt: new Date().toISOString(),
        };
      }
    }

    // Mystery Box Mode Selection
    let mysteryBoxDetails: FreeChallengeSession['mysteryBoxDetails'] = undefined;
    if (mode === 'mystery_box') {
      const allProducts = db.getProducts().filter(p => p.isInStock && p.price > 0 && p.price <= (selectedGame?.maxCartValue || this.data.settings.maxCartValue || 15));
      let pool = allProducts;
      if (params.mysteryCategoryId) {
        pool = allProducts.filter(p => p.categoryId === params.mysteryCategoryId || p.categoryName?.includes(params.mysteryCategoryId!));
      }
      if (pool.length === 0) pool = allProducts;
      const chosenProduct = pool[Math.floor(Math.random() * pool.length)] || allProducts[0];

      if (chosenProduct) {
        mysteryBoxDetails = {
          categoryId: params.mysteryCategoryId || 'general',
          categoryName: chosenProduct.categoryName || 'قرطاسية ومستلزمات',
          product: chosenProduct,
        };
      }
    }

    // Pick active puzzles - if gameId is provided, filter by game.type
    const allActivePuzzles = this.getPuzzles(false);
    let candidatePuzzles = allActivePuzzles;
    if (selectedGame) {
      const typeMatches = allActivePuzzles.filter(p => p.type === selectedGame!.type);
      if (typeMatches.length > 0) {
        candidatePuzzles = typeMatches;
      }
    }

    if (candidatePuzzles.length === 0) {
      return { success: false, error: 'لا توجد ألغاز متوفرة لهذه اللعبة حالياً' };
    }

    // Shuffle and pick N puzzles (default 4 questions per round)
    const targetCount = selectedGame?.questionsPerRound || this.data.settings.puzzlesPerChallenge || 4;
    let pool = [...candidatePuzzles];
    if (pool.length < targetCount && allActivePuzzles.length >= targetCount) {
      const existingIds = new Set(pool.map(p => p.id));
      const remaining = allActivePuzzles.filter(p => !existingIds.has(p.id));
      pool.push(...remaining.slice(0, targetCount - pool.length));
    }
    const count = Math.min(targetCount, pool.length);
    const shuffledPuzzles = [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
    const puzzleIds = shuffledPuzzles.map(p => p.id);

    const now = new Date();
    const challengeSessionId = `fchal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionToken = `ftok_${crypto.randomBytes(16).toString('hex')}`;

    const defaultDuration = selectedGame?.timerSeconds || this.data.settings.puzzleDurationSeconds || 8;
    const firstPuzzleDuration = shuffledPuzzles[0].timeLimitSeconds || defaultDuration;
    const firstPuzzleExpiresAt = new Date(now.getTime() + firstPuzzleDuration * 1000).toISOString();

    // Prepare puzzle session states with shuffled options
    const puzzleStates: Record<string, any> = {};
    shuffledPuzzles.forEach((p, idx) => {
      // Shuffle options and record mapping
      const originalOptions = p.options || [];
      const originalCorrect = p.correctAnswerIndex ?? 0;
      const indexed = originalOptions.map((opt, i) => ({ opt, originalIndex: i, isCorrect: i === originalCorrect }));
      const shuffled = [...indexed].sort(() => 0.5 - Math.random());
      const shuffledOptionsForClient = shuffled.map(s => s.opt);
      const shuffledOptionsIndices = shuffled.map(s => s.originalIndex);

      puzzleStates[p.id] = {
        puzzleId: p.id,
        startedAt: idx === 0 ? now.toISOString() : '',
        expiresAt: idx === 0 ? firstPuzzleExpiresAt : '',
        shuffledOptionsIndices,
        shuffledOptionsForClient,
      };
    });

    const newSession: FreeChallengeSession = {
      sessionId: challengeSessionId,
      sessionToken,
      userId,
      displayName,
      startedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(), // 15 mins total session life
      status: 'active',
      cartSnapshot,
      puzzleIds,
      currentPuzzleIndex: 0,
      puzzleStates,
      mode,
      mysteryBoxDetails,
      securityData: {
        ip,
        userAgent,
        tabSwitchesCount: 0,
        visibilityHiddenSeconds: 0,
        events: [`بدء جلسة التحدي - لعبة: ${selectedGame?.title || 'عام'} - وضع: ${mode}`],
      },
    };

    this.data.sessions[sessionToken] = newSession;
    if (mode !== 'practice') {
      this.incrementUserDailyAttempt(userId);
    }
    this.save();

    // Format first puzzle safely for client (NO correct answer revealed)
    const firstPuz = shuffledPuzzles[0];
    const firstPuzClient = this.formatPuzzleForClient(
      firstPuz,
      0,
      count,
      firstPuzzleDuration,
      now.toISOString(),
      firstPuzzleExpiresAt,
      puzzleStates[firstPuz.id].shuffledOptionsForClient
    );

    return {
      success: true,
      sessionToken,
      sessionId: challengeSessionId,
      firstPuzzle: firstPuzClient,
      cartSnapshot,
      game: selectedGame,
      settings: {
        puzzleDurationSeconds: selectedGame?.timerSeconds || this.data.settings.puzzleDurationSeconds,
        discountWheelEnabled: this.data.settings.discountWheelEnabled,
        discountWheelValues: this.data.settings.discountWheelValues,
        adsEnabled: this.data.settings.adsEnabled,
        adProvider: this.data.settings.adProvider,
      },
    };
  }

  // --- Submit Puzzle Answer ---
  public submitAnswer(params: {
    sessionToken: string;
    puzzleId: string;
    selectedIndex: number;
    timeTakenSeconds?: number;
  }): {
    success: boolean;
    isCorrect?: boolean;
    isTimeout?: boolean;
    isCompleted?: boolean;
    nextPuzzle?: any;
    result?: FreeChallengeSession['result'];
    mysteryBoxProduct?: Product;
    error?: string;
  } {
    const { sessionToken, puzzleId, selectedIndex } = params;
    const session = this.data.sessions[sessionToken];

    if (!session) {
      this.logSecurity('INVALID_ANSWER', `محاولة إرسال إجابة بتوكن غير صالح: ${sessionToken}`, 'warning');
      return { success: false, error: 'جلسة التحدي غير موجودة أو منتهية' };
    }

    if (session.status !== 'active') {
      return { success: false, error: `جلسة التحدي ليست نشطة (الحالة الحالية: ${session.status})` };
    }

    const currentPuzzleId = session.puzzleIds[session.currentPuzzleIndex];
    if (currentPuzzleId !== puzzleId) {
      this.logSecurity('REPLAY_ATTEMPT', `عدم تطابق رقم اللغز المطلوب مع الحالي للمستخدم: ${session.userId}`, 'danger');
      return { success: false, error: 'طلب غير متزامن مع اللغز الحالي' };
    }

    const puzzle = this.getPuzzleById(puzzleId);
    const pState = session.puzzleStates[puzzleId];
    if (!puzzle || !pState) {
      return { success: false, error: 'بيانات اللغز مفقودة' };
    }

    const serverNow = Date.now();
    const expiresTimestamp = new Date(pState.expiresAt).getTime();
    // 2-second grace period for latency
    const isTimeout = serverNow > expiresTimestamp + 2000;

    // Validate answer using mapping
    const originalOptionIndex = pState.shuffledOptionsIndices?.[selectedIndex] ?? selectedIndex;
    const isCorrect = !isTimeout && originalOptionIndex === puzzle.correctAnswerIndex;

    pState.answeredAt = new Date().toISOString();
    pState.selectedIndex = selectedIndex;
    pState.isCorrect = isCorrect;
    pState.timeTakenSeconds = Math.max(1, Math.round((serverNow - new Date(pState.startedAt).getTime()) / 1000));

    if (isTimeout) {
      session.status = 'timeout';
      this.logSecurity('TIMEOUT', `انتهى وقت اللغز ${puzzle.title} للمستخدم ${session.displayName}`, 'info');
      this.finalizeLoss(session);
      this.save();
      return {
        success: true,
        isCorrect: false,
        isTimeout: true,
        isCompleted: true,
        result: session.result,
      };
    }

    if (!isCorrect) {
      // WRONG ANSWER -> LOSS
      session.status = 'lost';
      this.finalizeLoss(session);
      this.save();
      return {
        success: true,
        isCorrect: false,
        isTimeout: false,
        isCompleted: true,
        result: session.result,
      };
    }

    // CORRECT ANSWER -> Advance or Win
    const nextIdx = session.currentPuzzleIndex + 1;
    if (nextIdx < session.puzzleIds.length) {
      // Advance to next puzzle
      session.currentPuzzleIndex = nextIdx;
      const nextPuzId = session.puzzleIds[nextIdx];
      const nextPuz = this.getPuzzleById(nextPuzId);
      const defaultDuration = this.data.settings.puzzleDurationSeconds || 8;
      const duration = nextPuz?.timeLimitSeconds || defaultDuration;

      const nextStart = new Date().toISOString();
      const nextExpire = new Date(Date.now() + duration * 1000).toISOString();

      session.puzzleStates[nextPuzId].startedAt = nextStart;
      session.puzzleStates[nextPuzId].expiresAt = nextExpire;
      this.save();

      const nextPuzClient = this.formatPuzzleForClient(
        nextPuz!,
        nextIdx,
        session.puzzleIds.length,
        duration,
        nextStart,
        nextExpire,
        session.puzzleStates[nextPuzId].shuffledOptionsForClient
      );

      return {
        success: true,
        isCorrect: true,
        isTimeout: false,
        isCompleted: false,
        nextPuzzle: nextPuzClient,
      };
    } else {
      // WINNER! Solved all visual puzzles
      session.status = 'won';
      this.finalizeWin(session);
      this.save();

      return {
        success: true,
        isCorrect: true,
        isTimeout: false,
        isCompleted: true,
        result: session.result,
        mysteryBoxProduct: session.mysteryBoxDetails?.product,
      };
    }
  }

  // --- Finalize Win / Loss Logic ---
  private finalizeWin(session: FreeChallengeSession): void {
    const totalPuzzles = session.puzzleIds.length;
    const totalTimeSeconds = Object.values(session.puzzleStates).reduce((sum, p) => sum + (p.timeTakenSeconds || 0), 0);

    const winPercentage = this.data.settings.challengeWinDiscountPercentage || 25;
    const couponCode = `WIN${winPercentage}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const voucherToken = `wincoup_${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours validity

    // Create real coupon in store database
    db.createCoupon({
      code: couponCode,
      discountType: 'percentage',
      discountValue: winPercentage,
      source: 'game',
      isActive: true,
      usageLimit: 1,
      expiresAt,
      userId: session.userId,
      descriptionAr: `كوبون فوز التحدي البصري بنسبة ${winPercentage}%`,
      descriptionEn: `Visual challenge victory coupon ${winPercentage}% off`,
    });

    // Credit rewards to user wallet dynamically based on settings (e.g. 4 * 0.250 = 1.000 KWD)
    const rewardPerQ = this.data.settings.rewardPerCorrectAnswer ?? 0.250;
    const rewardAmt = Number((totalPuzzles * rewardPerQ).toFixed(3));
    let newBal = 0;
    try {
      gamificationEngine.addWalletReward(
        session.userId,
        rewardAmt,
        'challenge',
        session.sessionId,
        `جائزة الفوز الكامل في التحدي (${totalPuzzles}/${totalPuzzles} إجابات صحيحة)`
      );
      const userWallet = gamificationEngine.getUserWallet(session.userId);
      newBal = userWallet.activeBalance;

      // Update XP & stats in user profile
      const userProfile = gamificationEngine.getUserProfile(session.userId, session.displayName);
      userProfile.challengesCompleted = (userProfile.challengesCompleted || 0) + 1;
      userProfile.challengesPlayed = (userProfile.challengesPlayed || 0) + 1;
      userProfile.correctAnswersCount = (userProfile.correctAnswersCount || 0) + totalPuzzles;
      userProfile.xp = (userProfile.xp || 0) + 100;
      gamificationEngine.updateUserProfile(session.userId, userProfile);
    } catch (e) {
      console.error('Error crediting wallet for win:', e);
    }

    session.result = {
      won: true,
      completedCount: totalPuzzles,
      totalPuzzles,
      totalTimeSeconds,
      rewardAmount: rewardAmt,
      newWalletBalance: newBal,
      discountCoupon: {
        couponCode,
        discountPercentage: winPercentage,
        expiresAt,
        token: voucherToken,
      },
    };

    // Add to Live Winners Ticker (Anonymized display name)
    const shortName = session.displayName ? session.displayName.split(' ')[0] : 'متسابق متميز';

    this.data.recentWinners.unshift({
      id: `rw_${Date.now()}`,
      userName: shortName,
      rewardTitle: `فاز بـ ${rewardAmt.toFixed(3)} د.ك وكوبون خصم ${winPercentage}% في تحدي الألغاز`,
      rewardType: 'discount_coupon',
      amountKwd: rewardAmt,
      discountPercentage: winPercentage,
      timestamp: new Date().toISOString(),
    });

    if (this.data.recentWinners.length > 50) this.data.recentWinners.pop();
  }

  private finalizeLoss(session: FreeChallengeSession): void {
    const completedCount = Object.values(session.puzzleStates).filter(p => p.isCorrect).length;
    const totalPuzzles = session.puzzleIds.length;
    const totalTimeSeconds = Object.values(session.puzzleStates).reduce((sum, p) => sum + (p.timeTakenSeconds || 0), 0);

    const rewardPerQ = this.data.settings.rewardPerCorrectAnswer ?? 0.250;
    const partialReward = Number((completedCount * rewardPerQ).toFixed(3));
    let newBal = 0;

    try {
      if (partialReward > 0) {
        gamificationEngine.addWalletReward(
          session.userId,
          partialReward,
          'challenge',
          session.sessionId,
          `مكافأة الإجابات الصحيحة في التحدي (${completedCount}/${totalPuzzles} إجابات)`
        );
        const userWallet = gamificationEngine.getUserWallet(session.userId);
        newBal = userWallet.activeBalance;
      }

      const userProfile = gamificationEngine.getUserProfile(session.userId, session.displayName);
      userProfile.challengesPlayed = (userProfile.challengesPlayed || 0) + 1;
      userProfile.correctAnswersCount = (userProfile.correctAnswersCount || 0) + completedCount;
      userProfile.wrongAnswersCount = (userProfile.wrongAnswersCount || 0) + 1;
      userProfile.xp = (userProfile.xp || 0) + (completedCount * 15);
      gamificationEngine.updateUserProfile(session.userId, userProfile);
    } catch (e) {
      console.error('Error updating user profile on loss:', e);
    }

    // Pick discount percentage using admin-configured slices and weighted probabilities
    const wheelValues = this.data.settings.discountWheelValues || [5, 10, 15, 20, 25];
    const probs = this.data.settings.wheelProbabilities || { 5: 40, 10: 30, 15: 20, 20: 8, 25: 2 };

    let totalWeight = 0;
    wheelValues.forEach(val => {
      totalWeight += (probs[val] ?? 20);
    });

    let randomVal = Math.random() * (totalWeight || 100);
    let pickedPercentage = wheelValues[0] || 20;

    for (const val of wheelValues) {
      const weight = probs[val] ?? 20;
      if (randomVal < weight) {
        pickedPercentage = val;
        break;
      }
      randomVal -= weight;
    }

    const wheelCouponCode = `WHEEL${pickedPercentage}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const durationMins = this.data.settings.discountDurationMinutes || 10;
    const expiresAt = new Date(Date.now() + durationMins * 60 * 1000).toISOString();
    const discountToken = `fdisc_${crypto.randomBytes(16).toString('hex')}`;

    // Create real coupon in store database
    db.createCoupon({
      code: wheelCouponCode,
      discountType: 'percentage',
      discountValue: pickedPercentage,
      source: 'fortune_wheel',
      isActive: true,
      usageLimit: 1,
      expiresAt,
      userId: session.userId,
      descriptionAr: `كوبون عجلة الحظ بنسبة ${pickedPercentage}%`,
      descriptionEn: `Fortune wheel coupon ${pickedPercentage}% off`,
    });

    this.data.activeDiscounts[discountToken] = {
      token: discountToken,
      userId: session.userId,
      percentage: pickedPercentage,
      expiresAt,
      isUsed: false,
    };

    session.result = {
      won: false,
      completedCount,
      totalPuzzles,
      totalTimeSeconds,
      rewardAmount: partialReward,
      newWalletBalance: newBal,
      discountWon: {
        percentage: pickedPercentage,
        token: discountToken,
        couponCode: wheelCouponCode,
        expiresAt,
        spunAt: new Date().toISOString(),
      },
    };

    // Add to Live Winners Ticker (Anonymized)
    const shortName = session.displayName ? session.displayName.split(' ')[0] : 'متسوق';
    this.data.recentWinners.unshift({
      id: `rw_${Date.now()}`,
      userName: shortName,
      rewardTitle: `حصل على خصم فوري ${pickedPercentage}% من عجلة الحظ`,
      rewardType: 'discount_wheel',
      discountPercentage: pickedPercentage,
      timestamp: new Date().toISOString(),
    });

    if (this.data.recentWinners.length > 50) this.data.recentWinners.pop();
  }

  // --- Validate Free Cart Voucher for Checkout ---
  public validateAndConsumeFreeCartVoucher(token: string, userId: string, orderNumber: string): {
    valid: boolean;
    discountAmount: number;
    error?: string;
  } {
    const voucher = this.data.freeCartVouchers[token];
    if (!voucher) {
      this.logSecurity('VOUCHER_TAMPERING', `محاولة استخدام توكن سلة مجانية غير صالح: ${token}`, 'danger');
      return { valid: false, discountAmount: 0, error: 'كوبون السلة المجانية غير صالح أو تم التلاعب به' };
    }

    if (voucher.isUsed) {
      this.logSecurity('VOUCHER_TAMPERING', `محاولة إعادة استخدام توكن سلة مجانية مستخدم مسبقاً: ${token}`, 'danger');
      return { valid: false, discountAmount: 0, error: 'تم استخدام كوبون السلة المجانية مسبقاً' };
    }

    if (new Date(voucher.expiresAt).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, error: 'انتهت صلاحية كوبون السلة المجانية' };
    }

    // Mark as used
    voucher.isUsed = true;
    voucher.orderId = orderNumber;
    this.save();

    return { valid: true, discountAmount: voucher.maxAllowedSubtotal };
  }

  // --- Validate Wheel Discount Token for Checkout ---
  public validateAndConsumeDiscountToken(token: string, userId: string, orderNumber: string): {
    valid: boolean;
    percentage: number;
    error?: string;
  } {
    const disc = this.data.activeDiscounts[token];
    if (!disc) {
      return { valid: false, percentage: 0, error: 'كود خصم العجلة غير موجود أو غير صالح' };
    }

    if (disc.isUsed) {
      return { valid: false, percentage: 0, error: 'تم استخدام كود الخصم هذا مسبقاً' };
    }

    if (new Date(disc.expiresAt).getTime() < Date.now()) {
      return { valid: false, percentage: 0, error: 'انتهت صلاحية كود الخصم الزمني' };
    }

    disc.isUsed = true;
    disc.orderId = orderNumber;
    this.save();

    return { valid: true, percentage: disc.percentage };
  }

  // --- Format Puzzle safely for Client ---
  private formatPuzzleForClient(
    puzzle: VisualPuzzle,
    index: number,
    total: number,
    timeLimit: number,
    startedAt: string,
    expiresAt: string,
    customOptions?: any[]
  ) {
    return {
      puzzleId: puzzle.id,
      puzzleIndex: index + 1,
      totalPuzzles: total,
      type: puzzle.type,
      title: puzzle.title,
      prompt: puzzle.prompt,
      category: puzzle.category,
      difficulty: puzzle.difficulty,
      mainVisual: puzzle.mainVisual,
      options: customOptions || puzzle.options,
      timeLimitSeconds: timeLimit,
      startedAt,
      expiresAt,
      serverTime: new Date().toISOString(),
    };
  }

  // --- 1v1 Shopping Duel Management ---
  public createDuel(params: { userId: string; userName: string }): DuelMatch {
    const duelCode = `DUEL-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `duel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Pick 3 identical puzzles for both players
    const active = this.getPuzzles(false);
    const puzzles = [...active].sort(() => 0.5 - Math.random()).slice(0, 3).map(p => p.id);

    const match: DuelMatch = {
      id,
      duelCode,
      creatorUserId: params.userId,
      creatorName: params.userName,
      creatorScore: 0,
      creatorTimeSeconds: 0,
      creatorCompleted: false,
      status: 'waiting',
      puzzleIds: puzzles,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    this.data.duels[id] = match;
    this.save();
    return match;
  }

  public getDuel(idOrCode: string): DuelMatch | undefined {
    return Object.values(this.data.duels).find(d => d.id === idOrCode || d.duelCode === idOrCode);
  }

  // --- Live Winners ---
  public getRecentWinners(): RecentWinner[] {
    return this.data.recentWinners;
  }

  // --- Security Logs ---
  public logSecurity(
    eventType: FreeChallengeSecurityLog['eventType'],
    details: string,
    severity: FreeChallengeSecurityLog['severity'] = 'info',
    userId = 'system',
    ip?: string
  ): void {
    const log: FreeChallengeSecurityLog = {
      id: `fsec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId,
      eventType,
      details,
      severity,
      ip,
    };
    this.data.securityLogs.unshift(log);
    if (this.data.securityLogs.length > 500) {
      this.data.securityLogs.pop();
    }
    this.save();
  }

  public getSecurityLogs(): FreeChallengeSecurityLog[] {
    return this.data.securityLogs;
  }

  public clearSecurityLogs(): void {
    this.data.securityLogs = [];
    this.save();
  }

  // --- Analytics ---
  public getAnalytics(): FreeChallengeAnalytics {
    const allSessions = Object.values(this.data.sessions);
    const wonCount = allSessions.filter(s => s.status === 'won').length;
    const lostCount = allSessions.filter(s => s.status === 'lost').length;
    const timeoutCount = allSessions.filter(s => s.status === 'timeout').length;
    const total = allSessions.length;

    const usedFreeVouchers = Object.values(this.data.freeCartVouchers).filter(v => v.isUsed).length;
    const usedDiscounts = Object.values(this.data.activeDiscounts).filter(d => d.isUsed).length;

    return {
      totalChallengesStarted: total,
      totalWon: wonCount,
      totalLost: lostCount,
      totalTimeouts: timeoutCount,
      winRatePercentage: total > 0 ? Math.round((wonCount / total) * 100) : 0,
      freeOrdersCount: usedFreeVouchers,
      discountOrdersCount: usedDiscounts,
      averageChallengeDurationSeconds: 24,
      averagePuzzleSeconds: 6,
      mysteryBoxOpensCount: allSessions.filter(s => s.mode === 'mystery_box').length,
      duelsCount: Object.keys(this.data.duels).length,
      referralsCount: this.data.referrals.length,
      adCompletionsCount: Math.round(total * 0.85),
    };
  }
}

export const freeChallengeEngine = new FreeChallengeEngine();
