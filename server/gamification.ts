import {
  QuizQuestion,
  ChallengeSession,
  QuestionSessionState,
  ChallengeActivityItem,
  WalletRewardItem,
  WalletTransaction,
  UserWallet,
  UserProfile,
  UserTierLevel,
  Achievement,
  GamificationSettings,
  LeaderboardEntry,
} from './types';
import { db } from './db';

// ==========================================
// DEFAULT SEED DATA
// ==========================================

export const defaultTiers: UserTierLevel[] = [
  {
    id: 'tier_bronze',
    name: 'المستوى البرونزي',
    minXp: 0,
    badgeColor: 'text-amber-600',
    badgeBg: 'bg-amber-500/10 border-amber-600/30',
    iconName: 'Shield',
    perksDescription: 'مكافآت التحدي الأساسية والمشاركة في المسابقات اليومية',
  },
  {
    id: 'tier_silver',
    name: 'المستوى الفضي',
    minXp: 100,
    badgeColor: 'text-slate-300',
    badgeBg: 'bg-slate-300/10 border-slate-300/30',
    iconName: 'ShieldCheck',
    perksDescription: 'مكافآت XP إضافية وشارة التميز الفضية',
  },
  {
    id: 'tier_gold',
    name: 'المستوى الذهبي',
    minXp: 500,
    badgeColor: 'text-amber-400',
    badgeBg: 'bg-amber-400/10 border-amber-400/30',
    iconName: 'Crown',
    perksDescription: 'أولوية في تجهيز الطلبات وشارة التميز الذهبية',
  },
  {
    id: 'tier_platinum',
    name: 'المستوى البلاتيني',
    minXp: 1500,
    badgeColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-400/10 border-cyan-400/30',
    iconName: 'Sparkles',
    perksDescription: 'مكافآت حصرية وخصومات خاصة على تشكيلات مختارة',
  },
  {
    id: 'tier_diamond',
    name: 'المستوى الماسي',
    minXp: 5000,
    badgeColor: 'text-violet-400',
    badgeBg: 'bg-violet-400/10 border-violet-400/30',
    iconName: 'Gem',
    perksDescription: 'المرتبة العليا لكبار عملاء مكتبة الشاطئ الازرق مع أعلى رصيد XP',
  },
];

export const defaultAchievements: Achievement[] = [
  {
    id: 'ach_first_challenge',
    title: 'أول تحدٍ في المتجر',
    description: 'خضت أول تحدٍ في مسابقة تحدى واربح رصيدك',
    icon: 'PlayCircle',
    requiredCondition: 'إكمال أول تحدي',
    rewardXp: 50,
    category: 'challenge',
    isActive: true,
  },
  {
    id: 'ach_first_correct',
    title: 'إصابة الهدف',
    description: 'أجبت إجابة صحيحة لأول مرة في التحدي',
    icon: 'CheckCircle2',
    requiredCondition: 'إجابة صحيحة واحدة',
    rewardXp: 25,
    category: 'challenge',
    isActive: true,
  },
  {
    id: 'ach_10_correct',
    title: 'عقل متوقد',
    description: 'جمعت 10 إجابات صحيحة عبر التحديات',
    icon: 'Award',
    requiredCondition: '10 إجابات صحيحة',
    rewardXp: 150,
    category: 'challenge',
    isActive: true,
  },
  {
    id: 'ach_50_correct',
    title: 'نابغة القرطاسية',
    description: 'حققت 50 إجابة صحيحة بنجاح باهر',
    icon: 'Flame',
    requiredCondition: '50 إجابة صحيحة',
    rewardXp: 500,
    category: 'challenge',
    isActive: true,
  },
  {
    id: 'ach_silver_level',
    title: 'الوصول للمستوى الفضي',
    description: 'تجاوزت 100 نقطة XP وارتقيت للمستوى الفضي',
    icon: 'ShieldCheck',
    requiredCondition: 'بلوغ المستوى الفضي',
    rewardXp: 100,
    category: 'levels',
    isActive: true,
  },
  {
    id: 'ach_gold_level',
    title: 'ملك المعرفة الذهبي',
    description: 'تجاوزت 500 نقطة XP ونلت الشارة الذهبية',
    icon: 'Crown',
    requiredCondition: 'بلوغ المستوى الذهبي',
    rewardXp: 250,
    category: 'levels',
    isActive: true,
  },
  {
    id: 'ach_diamond_level',
    title: 'نخبة الماسيين',
    description: 'وصلت إلى قمة المستويات (المستوى الماسي)',
    icon: 'Gem',
    requiredCondition: 'بلوغ المستوى الماسي',
    rewardXp: 1000,
    category: 'levels',
    isActive: true,
  },
  {
    id: 'ach_wallet_first_order',
    title: 'المتسوق الذكي',
    description: 'أتممت أول طلب شراء باستخدام رصيد مكافآت التحدي',
    icon: 'ShoppingBag',
    requiredCondition: 'شراء باستخدام رصيد المحفظة',
    rewardXp: 100,
    category: 'orders',
    isActive: true,
  },
  {
    id: 'ach_earned_5kwd',
    title: 'جامع المكافآت',
    description: 'كسبت إجمالي 5.000 د.ك أو أكثر من رصيد التحديات',
    icon: 'Coins',
    requiredCondition: 'كسب 5 د.ك رصيد متجر',
    rewardXp: 300,
    category: 'challenge',
    isActive: true,
  },
];

export const defaultQuestions: QuizQuestion[] = [
  {
    id: 'q_1',
    question: 'ما هي عاصمة دولة الكويت؟',
    options: ['مدينة الكويت', 'الجهراء', 'الأحمدي', 'حولي'],
    correctAnswerIndex: 0,
    rewardAmount: 0.500,
    xpAmount: 25,
    category: 'الكويت وتاريخها',
    difficulty: 'easy',
    isActive: true,
    timesShown: 120,
    timesCorrect: 114,
    timesIncorrect: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_2',
    question: 'ما هو الرمز الكيميائي للرصاص المستخدم في أقلام الرصاص تاريخياً (مع العلم أنه جرافيت)؟',
    options: ['Pb', 'Fe', 'C (كربون/جرافيت)', 'Au'],
    correctAnswerIndex: 2,
    rewardAmount: 0.500,
    xpAmount: 30,
    category: 'قرطاسية وأدوات مكتبية',
    difficulty: 'medium',
    isActive: true,
    timesShown: 95,
    timesCorrect: 68,
    timesIncorrect: 27,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_3',
    question: 'ما هو المقاس القياسي لورق الطباعة المكتبي الأكثر استخداماً؟',
    options: ['A3', 'A4', 'A5', 'B5'],
    correctAnswerIndex: 1,
    rewardAmount: 0.250,
    xpAmount: 20,
    category: 'قرطاسية وأدوات مكتبية',
    difficulty: 'easy',
    isActive: true,
    timesShown: 140,
    timesCorrect: 132,
    timesIncorrect: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_4',
    question: 'في أي عام تم افتتاح أبراج الكويت رسمياً كمعلم حضاري؟',
    options: ['1979م', '1961م', '1985م', '1990م'],
    correctAnswerIndex: 0,
    rewardAmount: 0.500,
    xpAmount: 35,
    category: 'الكويت وتاريخها',
    difficulty: 'medium',
    isActive: true,
    timesShown: 88,
    timesCorrect: 62,
    timesIncorrect: 26,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_5',
    question: 'ما هي الأداة الهندسية المستخدمة لرسم الدوائر والأقواس بدقة؟',
    options: ['الفرجار', 'المنقلة', 'المثلث القائم', 'المسطرة'],
    correctAnswerIndex: 0,
    rewardAmount: 0.250,
    xpAmount: 20,
    category: 'قرطاسية وأدوات مكتبية',
    difficulty: 'easy',
    isActive: true,
    timesShown: 110,
    timesCorrect: 104,
    timesIncorrect: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_6',
    question: 'ما هو البحر أو المسطح المائي الذي تطل عليه سواحل دولة الكويت؟',
    options: ['الخليج العربي', 'بحر العرب', 'البحر الأحمر', 'خليج عمان'],
    correctAnswerIndex: 0,
    rewardAmount: 0.250,
    xpAmount: 20,
    category: 'الكويت وتاريخها',
    difficulty: 'easy',
    isActive: true,
    timesShown: 150,
    timesCorrect: 147,
    timesIncorrect: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_7',
    question: 'ما هي العملة الرسمية لدولة الكويت وتعتبر من أعلى العملات قيمة عالمياً؟',
    options: ['الدينار الكويتي', 'الريال', 'الدرهم', 'الليرة'],
    correctAnswerIndex: 0,
    rewardAmount: 0.250,
    xpAmount: 20,
    category: 'الكويت وتاريخها',
    difficulty: 'easy',
    isActive: true,
    timesShown: 160,
    timesCorrect: 158,
    timesIncorrect: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_8',
    question: 'ما هو النوع الشائع من الألوان المائية التي تجف بسرعة وتتميز بقوام بلاستيكي مرن؟',
    options: ['ألوان الأكريليك', 'ألوان الباستيل الزيتي', 'ألوان الجواش', 'الفحم النباتي'],
    correctAnswerIndex: 0,
    rewardAmount: 0.500,
    xpAmount: 30,
    category: 'قرطاسية وأدوات مكتبية',
    difficulty: 'medium',
    isActive: true,
    timesShown: 80,
    timesCorrect: 58,
    timesIncorrect: 22,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_9',
    question: 'ما هو أكبر كواكب المجموعة الشمسية حجماً وكتلة؟',
    options: ['المشتري', 'زحل', 'الأرض', 'نبتون'],
    correctAnswerIndex: 0,
    rewardAmount: 0.500,
    xpAmount: 25,
    category: 'علوم وتكنولوجيا',
    difficulty: 'easy',
    isActive: true,
    timesShown: 105,
    timesCorrect: 92,
    timesIncorrect: 13,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_10',
    question: 'كم عدد أحرف اللغة العربية الهجائية؟',
    options: ['28 حرفاً', '26 حرفاً', '30 حرفاً', '29 حرفاً'],
    correctAnswerIndex: 0,
    rewardAmount: 0.250,
    xpAmount: 20,
    category: 'لغة عربية',
    difficulty: 'easy',
    isActive: true,
    timesShown: 130,
    timesCorrect: 122,
    timesIncorrect: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_11',
    question: 'ما هو الجزء في الحاسوب المسؤول عن معالجة البيانات والعمليات الحسابية (عقل الجهاز)؟',
    options: ['المعالج (CPU)', 'القرص الصلب (HDD)', 'ذاكرة الوصول العشوائي (RAM)', 'الشاشة'],
    correctAnswerIndex: 0,
    rewardAmount: 0.500,
    xpAmount: 25,
    category: 'علوم وتكنولوجيا',
    difficulty: 'easy',
    isActive: true,
    timesShown: 90,
    timesCorrect: 82,
    timesIncorrect: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_12',
    question: 'ما هو مضاد كلمة "إيجاز" في اللغة العربية؟',
    options: ['إطناب وتفصيل', 'اختصار', 'بلاغة', 'صمت'],
    correctAnswerIndex: 0,
    rewardAmount: 0.500,
    xpAmount: 35,
    category: 'لغة عربية',
    difficulty: 'medium',
    isActive: true,
    timesShown: 75,
    timesCorrect: 52,
    timesIncorrect: 23,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_13',
    question: 'ما هي الجزيرة الكويتية الأكبر مساحة وغير المأهولة بالسكان وتشتهر بآثارها وموقعها الاستراتيجي؟',
    options: ['جزيرة بوبيان', 'جزيرة فيلكا', 'جزيرة وربة', 'جزيرة كبر'],
    correctAnswerIndex: 0,
    rewardAmount: 0.500,
    xpAmount: 35,
    category: 'الكويت وتاريخها',
    difficulty: 'medium',
    isActive: true,
    timesShown: 82,
    timesCorrect: 59,
    timesIncorrect: 23,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_14',
    question: 'ما هي الجزيرة الكويتية التاريخية الشهيرة بآثار الحضارة الدلمونية والإغريقية؟',
    options: ['جزيرة فيلكا', 'جزيرة قاروه', 'جزيرة أم المرادم', 'جزيرة عوهة'],
    correctAnswerIndex: 0,
    rewardAmount: 0.500,
    xpAmount: 30,
    category: 'الكويت وتاريخها',
    difficulty: 'easy',
    isActive: true,
    timesShown: 110,
    timesCorrect: 98,
    timesIncorrect: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_15',
    question: 'ما هي وحدة قياس كثافة وسماكة ورق الطباعة والمستندات؟',
    options: ['جم / متر مربع (GSM)', 'ملم مكعب', 'بوصة مربعة', 'ميكرومتر'],
    correctAnswerIndex: 0,
    rewardAmount: 0.750,
    xpAmount: 40,
    category: 'قرطاسية وأدوات مكتبية',
    difficulty: 'hard',
    isActive: true,
    timesShown: 60,
    timesCorrect: 34,
    timesIncorrect: 26,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_16',
    question: 'من هو مخترع المصباح الكهربائي العملي ومسجل آلاف براءات الاختراع؟',
    options: ['توماس إديسون', 'نيكولا تسلا', 'ألكسندر غراهام بيل', 'إسحاق نيوتن'],
    correctAnswerIndex: 0,
    rewardAmount: 0.500,
    xpAmount: 25,
    category: 'ثقافة عامة',
    difficulty: 'easy',
    isActive: true,
    timesShown: 95,
    timesCorrect: 85,
    timesIncorrect: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_17',
    question: 'ما هي درجة غليان الماء النقي تحت الضغط الجوي العادي؟',
    options: ['100 درجة مئوية', '90 درجة مئوية', '120 درجة مئوية', '80 درجة مئوية'],
    correctAnswerIndex: 0,
    rewardAmount: 0.250,
    xpAmount: 20,
    category: 'علوم وتكنولوجيا',
    difficulty: 'easy',
    isActive: true,
    timesShown: 120,
    timesCorrect: 115,
    timesIncorrect: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_18',
    question: 'ما هو الخط العربي الكلاسيكي المتميز بالحروف العريضة والهندسية والمستخدم في المصاحف القديمة؟',
    options: ['الخط الكوفي', 'خط الرقعة', 'خط النسخ', 'خط الديواني'],
    correctAnswerIndex: 0,
    rewardAmount: 0.500,
    xpAmount: 35,
    category: 'لغة عربية',
    difficulty: 'medium',
    isActive: true,
    timesShown: 70,
    timesCorrect: 49,
    timesIncorrect: 21,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_19',
    question: 'ما هو الاسم التاريخي الشهير لسور الكويت الذي شُيد لحماية المدينة وله بوابات باقية حتى اليوم؟',
    options: ['السور الثالث (1920م)', 'السور الأول', 'سور القرين', 'سور الشامية'],
    correctAnswerIndex: 0,
    rewardAmount: 0.500,
    xpAmount: 35,
    category: 'الكويت وتاريخها',
    difficulty: 'medium',
    isActive: true,
    timesShown: 78,
    timesCorrect: 53,
    timesIncorrect: 25,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_20',
    question: 'ما هي الأداة المكتبية المستخدمة لجمع وتثبيت الأوراق معاً باستخدام سلك معدني صغير؟',
    options: ['الدباسة (Stapler)', 'المثقاب (Puncher)', 'المقص', 'المشبك المغناطيسي'],
    correctAnswerIndex: 0,
    rewardAmount: 0.250,
    xpAmount: 20,
    category: 'قرطاسية وأدوات مكتبية',
    difficulty: 'easy',
    isActive: true,
    timesShown: 130,
    timesCorrect: 128,
    timesIncorrect: 2,
    createdAt: new Date().toISOString(),
  },
];

export const defaultGamificationSettings: GamificationSettings = {
  isEnabled: true,
  questionsPerChallenge: 10,
  timePerQuestionSeconds: 15,
  dailyAttemptsLimit: 3,
  rewardExpiryHours: 48,
  maxWalletUsagePercent: 50, // 50% max of cart total
  autoShowChallengeOnEntry: true,
  autoShowFrequency: 'once_per_session',
  enableAchievements: true,
  enableLeaderboard: true,
  defaultRewardAmount: 0.500,
  defaultXpPerCorrectAnswer: 25,
  challengeCompletionBonusXp: 100,
  tiers: defaultTiers,
};

// ==========================================
// GAMIFICATION ENGINE CLASS
// ==========================================

class GamificationEngine {
  private activeSessions: Map<string, ChallengeSession> = new Map();

  // Helper to ensure database arrays and settings exist
  private ensureSchema() {
    const rawData = (db as any).data;
    if (!Array.isArray(rawData.questions) || rawData.questions.length === 0) {
      rawData.questions = [...defaultQuestions];
      db.save();
    }
    if (!Array.isArray(rawData.achievements) || rawData.achievements.length === 0) {
      rawData.achievements = [...defaultAchievements];
      db.save();
    }
    if (!rawData.gamificationSettings) {
      rawData.gamificationSettings = { ...defaultGamificationSettings };
      db.save();
    }
    if (!rawData.userProfiles) {
      rawData.userProfiles = {};
      db.save();
    }
    if (!rawData.wallets) {
      rawData.wallets = {};
      db.save();
    }
    if (!rawData.challengeSessions) {
      rawData.challengeSessions = {};
      db.save();
    }
    if (!Array.isArray(rawData.challengeActivityLogs)) {
      rawData.challengeActivityLogs = [];
      db.save();
    }
    if (typeof rawData.rejectedOrDuplicateCount !== 'number') {
      rawData.rejectedOrDuplicateCount = 0;
      db.save();
    }
  }

  // --- Questions Management ---
  public getQuestions(): QuizQuestion[] {
    this.ensureSchema();
    return (db as any).data.questions || [];
  }

  public getQuestionById(id: string): QuizQuestion | undefined {
    return this.getQuestions().find(q => q.id === id);
  }

  public upsertQuestion(question: Partial<QuizQuestion>): QuizQuestion {
    this.ensureSchema();
    const questions: QuizQuestion[] = (db as any).data.questions;
    const existingIndex = questions.findIndex(q => q.id === question.id);

    if (existingIndex >= 0) {
      questions[existingIndex] = {
        ...questions[existingIndex],
        ...question,
        updatedAt: new Date().toISOString(),
      } as QuizQuestion;
      db.save();
      db.logActivity('تعديل سؤال في بنك الأسئلة', 'settings', `تم تعديل السؤال: "${question.question?.substring(0, 30)}..."`, 'info');
      return questions[existingIndex];
    } else {
      const newQuestion: QuizQuestion = {
        id: question.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        question: question.question || 'سؤال جديد',
        options: Array.isArray(question.options) && question.options.length >= 2 ? question.options : ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
        correctAnswerIndex: typeof question.correctAnswerIndex === 'number' ? question.correctAnswerIndex : 0,
        rewardAmount: typeof question.rewardAmount === 'number' ? question.rewardAmount : 0.500,
        xpAmount: typeof question.xpAmount === 'number' ? question.xpAmount : 25,
        category: question.category || 'ثقافة عامة',
        difficulty: question.difficulty || 'medium',
        isActive: question.isActive !== undefined ? question.isActive : true,
        timesShown: 0,
        timesCorrect: 0,
        timesIncorrect: 0,
        createdAt: new Date().toISOString(),
      };
      questions.unshift(newQuestion);
      db.save();
      db.logActivity('إضافة سؤال جديد', 'settings', `تمت إضافة سؤال جديد إلى بنك الأسئلة: "${newQuestion.question.substring(0, 30)}..."`, 'success');
      return newQuestion;
    }
  }

  public deleteQuestion(id: string): boolean {
    this.ensureSchema();
    const raw = (db as any).data;
    const initialLen = raw.questions.length;
    raw.questions = raw.questions.filter((q: QuizQuestion) => q.id !== id);
    if (raw.questions.length !== initialLen) {
      db.save();
      db.logActivity('حذف سؤال من بنك الأسئلة', 'settings', `تم حذف السؤال ذو المعرف: ${id}`, 'warning');
      return true;
    }
    return false;
  }

  // --- Settings Management ---
  public getSettings(): GamificationSettings {
    this.ensureSchema();
    return (db as any).data.gamificationSettings || defaultGamificationSettings;
  }

  public updateSettings(settings: Partial<GamificationSettings>): GamificationSettings {
    this.ensureSchema();
    const raw = (db as any).data;
    raw.gamificationSettings = {
      ...defaultGamificationSettings,
      ...raw.gamificationSettings,
      ...settings,
    };
    db.save();
    db.logActivity('تحديث إعدادات التحدي والمكافآت', 'settings', 'تم حفظ إعدادات نظام تحدى واربح بنجاح', 'success');
    return raw.gamificationSettings;
  }

  // --- User Profiles, Auth Sync & Management ---
  public syncUserProfile(
    userId: string,
    data: { email?: string; displayName?: string; phone?: string; role?: 'user' | 'admin'; authProvider?: 'google' | 'phone' | 'email' | 'guest'; avatarUrl?: string },
    ip = '127.0.0.1',
    userAgent = ''
  ): { profile: UserProfile; wallet: UserWallet } {
    this.ensureSchema();
    const raw = (db as any).data;
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const isSuperAdminEmail = Boolean(data.email && data.email.toLowerCase() === 'abdulrahmankw20@gmail.com');

    // Account deduplication check: If userId is new, look for existing account with same email or phone
    if (!raw.userProfiles[userId]) {
      const existingProfiles = Object.values(raw.userProfiles || {}) as UserProfile[];
      const matchedProfile = existingProfiles.find(p => {
        if (p.id === userId) return false;
        if (data.email && p.email && p.email.toLowerCase() === data.email.toLowerCase()) {
          return true;
        }
        if (data.phone && p.phone && p.phone.trim().replace(/\s+/g, '') === data.phone.trim().replace(/\s+/g, '')) {
          return true;
        }
        return false;
      });

      if (matchedProfile) {
        // Link new userId to the existing profile's wallet & history
        const oldWallet = raw.userWallets?.[matchedProfile.id];
        raw.userProfiles[userId] = {
          ...matchedProfile,
          id: userId,
          displayName: data.displayName || matchedProfile.displayName,
          email: matchedProfile.email || data.email || '',
          phone: data.phone || matchedProfile.phone || '',
          phoneNumber: data.phone || matchedProfile.phoneNumber || '',
          authProvider: (data.authProvider as any) || matchedProfile.authProvider || 'google',
          role: matchedProfile.role === 'admin' || isSuperAdminEmail ? 'admin' : 'user',
          lastLoginAt: now,
          lastIp: ip,
          userAgent,
          updatedAt: now,
        };

        // If matched profile had a wallet, link balance to this userId
        if (oldWallet && !raw.userWallets[userId]) {
          raw.userWallets[userId] = {
            ...oldWallet,
            userId,
            updatedAt: now,
          };
        }

        db.save();
        db.logActivity('دمج وتوثيق حساب', 'system', `تم ربط وتوثيق حساب المستخدم: ${raw.userProfiles[userId].displayName} (${data.authProvider || 'user'})`, 'success');
      } else {
        raw.userProfiles[userId] = {
          id: userId,
          displayName: data.displayName || 'عميل مكتبة الشاطئ الازرق',
          email: data.email || '',
          phone: data.phone || '',
          phoneNumber: data.phone || '',
          role: isSuperAdminEmail ? 'admin' : 'user',
          authProvider: data.authProvider || 'guest',
          avatarUrl: data.avatarUrl || '',
          xp: 0,
          currentTier: 'المستوى البرونزي',
          challengesPlayed: 0,
          challengesCompleted: 0,
          correctAnswersCount: 0,
          wrongAnswersCount: 0,
          totalRewardsEarnedKwd: 0,
          totalRewardsUsedKwd: 0,
          dailyAttemptsDate: today,
          dailyAttemptsUsed: 0,
          unlockedAchievementIds: [],
          lastLoginAt: now,
          lastIp: ip,
          userAgent,
          createdAt: now,
          updatedAt: now,
        };
        db.save();
        db.logActivity('تسجيل حساب جديد', 'system', `تم تسجيل حساب مستخدم جديد: ${data.displayName || data.email || userId} (${data.authProvider || 'guest'})`, 'success');
      }
    } else {
      const profile: UserProfile = raw.userProfiles[userId];
      if (data.displayName && (!profile.displayName || profile.displayName === 'عميل المتجر')) {
        profile.displayName = data.displayName;
      }
      if (data.email && !profile.email) {
        profile.email = data.email;
      }
      if (data.phone) {
        profile.phone = data.phone;
        profile.phoneNumber = data.phone;
      }
      if (isSuperAdminEmail) {
        profile.role = 'admin';
      }
      if (data.authProvider) profile.authProvider = data.authProvider;
      if (data.avatarUrl) profile.avatarUrl = data.avatarUrl;
      profile.lastLoginAt = now;
      profile.lastIp = ip;
      profile.userAgent = userAgent;
      profile.updatedAt = now;

      if (profile.dailyAttemptsDate !== today) {
        profile.dailyAttemptsDate = today;
        profile.dailyAttemptsUsed = 0;
      }
      db.save();
    }

    const updatedProfile = raw.userProfiles[userId];
    const wallet = this.getUserWallet(userId);
    return { profile: updatedProfile, wallet };
  }

  public getAllUsers(): any[] {
    this.ensureSchema();
    const raw = (db as any).data;
    const profiles: UserProfile[] = Object.values(raw.userProfiles || {});

    return profiles.map(p => {
      const wallet = this.getUserWallet(p.id);
      return {
        id: p.id,
        displayName: p.displayName || 'عميل المتجر',
        email: p.email || '-',
        phone: p.phone || p.phoneNumber || '-',
        role: p.role || 'user',
        currentTier: p.currentTier || 'المستوى البرونزي',
        xp: p.xp || 0,
        activeWalletBalance: wallet.activeBalance,
        totalRewardsEarnedKwd: p.totalRewardsEarnedKwd || wallet.totalEarned || 0,
        totalRewardsUsedKwd: p.totalRewardsUsedKwd || wallet.usedBalance || 0,
        challengesPlayed: p.challengesPlayed || 0,
        challengesCompleted: p.challengesCompleted || 0,
        correctAnswersCount: p.correctAnswersCount || 0,
        wrongAnswersCount: p.wrongAnswersCount || 0,
        lastLoginAt: p.lastLoginAt || p.updatedAt || p.createdAt,
        createdAt: p.createdAt,
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getUserDetail(userId: string): any {
    this.ensureSchema();
    const profile = this.getUserProfile(userId);
    const wallet = this.getUserWallet(userId);
    const raw = (db as any).data;
    const allActivities: ChallengeActivityItem[] = raw.challengeActivityLogs || [];
    const userActivities = allActivities.filter(a => a.userId === userId).slice(0, 50);

    return {
      profile,
      wallet,
      activities: userActivities,
    };
  }

  public logSecurityEvent(event: {
    userId: string;
    challengeSessionId?: string;
    questionId?: string;
    ip: string;
    userAgent?: string;
    action: string;
    result: string;
    reward?: number;
    details?: string;
  }): void {
    const raw = (db as any).data;
    if (!Array.isArray(raw.securityLogs)) {
      raw.securityLogs = [];
    }
    const logItem = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...event,
      timestamp: new Date().toISOString(),
    };
    raw.securityLogs.unshift(logItem);
    if (raw.securityLogs.length > 500) {
      raw.securityLogs = raw.securityLogs.slice(0, 500);
    }
    db.save();
  }

  public getSecurityEvents(): any[] {
    this.ensureSchema();
    const raw = (db as any).data;
    return raw.securityLogs || [];
  }

  public getUserProfile(userId: string, displayName = 'متسابق مكتبة الشاطئ الازرق'): UserProfile {
    this.ensureSchema();
    const raw = (db as any).data;
    const today = new Date().toISOString().split('T')[0];

    if (!raw.userProfiles[userId]) {
      raw.userProfiles[userId] = {
        id: userId,
        displayName,
        email: '',
        phone: '',
        phoneNumber: '',
        role: 'user',
        xp: 0,
        currentTier: 'المستوى البرونزي',
        challengesPlayed: 0,
        challengesCompleted: 0,
        correctAnswersCount: 0,
        wrongAnswersCount: 0,
        totalRewardsEarnedKwd: 0,
        totalRewardsUsedKwd: 0,
        dailyAttemptsDate: today,
        dailyAttemptsUsed: 0,
        unlockedAchievementIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.save();
    } else {
      // Check daily reset
      const profile: UserProfile = raw.userProfiles[userId];
      if (profile.dailyAttemptsDate !== today) {
        profile.dailyAttemptsDate = today;
        profile.dailyAttemptsUsed = 0;
        db.save();
      }
    }

    return raw.userProfiles[userId];
  }

  public checkAccountByEmail(email: string): { exists: boolean; profile?: Partial<UserProfile> } {
    if (!email) return { exists: false };
    const target = email.trim().toLowerCase();

    // Super admin account check
    if (target === 'abdulrahmankw20@gmail.com') {
      return {
        exists: true,
        profile: {
          email: target,
          role: 'admin',
          displayName: 'مدير المتجر'
        }
      };
    }

    this.ensureSchema();
    const raw = (db as any).data;
    if (!raw) return { exists: false };

    // 1. Check userCredentials (Store auth database)
    if (raw.userCredentials && raw.userCredentials[target]) {
      const cred = raw.userCredentials[target];
      return {
        exists: true,
        profile: {
          id: cred.userId,
          email: cred.email,
          displayName: cred.displayName,
          role: cred.role,
        }
      };
    }

    // 2. Check userProfiles (Store gamification & session profiles)
    if (raw.userProfiles) {
      const profiles = Object.values(raw.userProfiles) as UserProfile[];
      const found = profiles.find(p => p.email && p.email.trim().toLowerCase() === target);
      if (found) {
        return {
          exists: true,
          profile: {
            id: found.id,
            email: found.email,
            displayName: found.displayName,
            role: found.role
          }
        };
      }
    }

    return { exists: false };
  }

  public updateUserProfile(userId: string, update: Partial<UserProfile>): UserProfile {
    const profile = this.getUserProfile(userId);
    Object.assign(profile, update, { updatedAt: new Date().toISOString() });
    
    // Recalculate Tier
    const settings = this.getSettings();
    const sortedTiers = [...(settings.tiers || defaultTiers)].sort((a, b) => b.minXp - a.minXp);
    const matchedTier = sortedTiers.find(t => profile.xp >= t.minXp) || sortedTiers[sortedTiers.length - 1];
    if (matchedTier && profile.currentTier !== matchedTier.name) {
      profile.currentTier = matchedTier.name;
      db.logActivity('ترقية مستوى المستخدم', 'system', `المستخدم ${profile.displayName} ارتقى إلى ${matchedTier.name} برصيد ${profile.xp} XP`, 'success');
    }

    // Check achievement conditions
    this.checkUserAchievements(profile);

    db.save();
    return profile;
  }

  // --- Wallet Management & 48-Hour Expiry ---
  public getUserWallet(userId: string): UserWallet {
    this.ensureSchema();
    const raw = (db as any).data;
    const now = new Date();

    if (!raw.wallets[userId]) {
      raw.wallets[userId] = {
        userId,
        activeBalance: 0,
        usedBalance: 0,
        expiredBalance: 0,
        totalEarned: 0,
        items: [],
        transactions: [],
        lastUpdated: now.toISOString(),
      };
      db.save();
    }

    const wallet: UserWallet = raw.wallets[userId];

    // Recalculate active, expired, and used amounts
    let activeTotal = 0;
    let expiredTotal = 0;
    let usedTotal = 0;
    let totalEarned = 0;
    let hasExpiredChanges = false;

    wallet.items.forEach(item => {
      totalEarned += item.initialAmount || item.amount;
      const expDate = new Date(item.expiresAt);

      if (item.status === 'active' || item.status === 'partially_used') {
        if (now.getTime() >= expDate.getTime()) {
          // Expired!
          const expiredAmount = item.amount;
          item.status = 'expired';
          item.amount = 0;
          expiredTotal += expiredAmount;
          hasExpiredChanges = true;

          // Add transaction for expiry
          wallet.transactions.unshift({
            id: `tx_exp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            userId,
            type: 'expire',
            amount: expiredAmount,
            balanceAfter: 0, // will update below
            description: `انتهاء صلاحية مكافأة بقيمة ${expiredAmount.toFixed(3)} د.ك بعد مرور 48 ساعة`,
            referenceId: item.id,
            createdAt: now.toISOString(),
          });
        } else {
          activeTotal += item.amount;
        }
      } else if (item.status === 'expired') {
        expiredTotal += (item.initialAmount - item.amount);
      } else if (item.status === 'used') {
        usedTotal += item.initialAmount;
      }
    });

    wallet.activeBalance = Number(activeTotal.toFixed(3));
    wallet.usedBalance = Number(usedTotal.toFixed(3));
    wallet.expiredBalance = Number(expiredTotal.toFixed(3));
    wallet.totalEarned = Number(totalEarned.toFixed(3));
    wallet.lastUpdated = now.toISOString();

    if (hasExpiredChanges) {
      db.save();
      db.logActivity('انتهاء صلاحية مكافأة', 'order', `انتهت صلاحية رصيد مكافأة لمستخدم (${userId}) لمرور 48 ساعة`, 'warning');
    }

    return wallet;
  }

  public addWalletReward(
    userId: string,
    amount: number,
    source: WalletRewardItem['source'] = 'challenge',
    sourceId?: string,
    description = 'مكافأة إجابة صحيحة في التحدي',
    customTxId?: string
  ): WalletRewardItem | null {
    if (amount <= 0) return null;

    const wallet = this.getUserWallet(userId);
    const settings = this.getSettings();
    const expiryHours = settings.rewardExpiryHours || 48;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000).toISOString();

    const txId = customTxId || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Strict Idempotency Check: prevent duplicate transactions
    const alreadyExists = wallet.transactions.some(tx => tx.id === txId || (sourceId && tx.referenceId === sourceId));
    if (alreadyExists) {
      const raw = (db as any).data;
      raw.rejectedOrDuplicateCount = (raw.rejectedOrDuplicateCount || 0) + 1;
      db.save();
      return null;
    }

    const rewardItem: WalletRewardItem = {
      id: `rw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      amount: Number(amount.toFixed(3)),
      initialAmount: Number(amount.toFixed(3)),
      earnedAt: now.toISOString(),
      expiresAt,
      status: 'active',
      source,
      sourceId,
    };

    wallet.items.unshift(rewardItem);
    wallet.activeBalance = Number((wallet.activeBalance + amount).toFixed(3));
    wallet.totalEarned = Number((wallet.totalEarned + amount).toFixed(3));

    wallet.transactions.unshift({
      id: txId,
      userId,
      type: 'credit',
      amount: Number(amount.toFixed(3)),
      balanceAfter: wallet.activeBalance,
      description,
      referenceId: sourceId,
      createdAt: now.toISOString(),
    });

    // Update user profile total earnings
    const profile = this.getUserProfile(userId);
    profile.totalRewardsEarnedKwd = Number((profile.totalRewardsEarnedKwd + amount).toFixed(3));

    db.save();
    return rewardItem;
  }

  public deductWalletForOrder(userId: string, requestedAmount: number, orderId: string): { success: boolean; deductedAmount: number; remainingBalance: number } {
    const wallet = this.getUserWallet(userId);
    if (wallet.activeBalance <= 0 || requestedAmount <= 0) {
      return { success: false, deductedAmount: 0, remainingBalance: wallet.activeBalance };
    }

    const amountToDeduct = Math.min(wallet.activeBalance, requestedAmount);
    let remainingToDeduct = amountToDeduct;

    // Deduct FIFO (oldest active rewards first)
    const activeItems = wallet.items
      .filter(i => (i.status === 'active' || i.status === 'partially_used') && i.amount > 0)
      .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

    for (const item of activeItems) {
      if (remainingToDeduct <= 0) break;

      if (item.amount <= remainingToDeduct) {
        remainingToDeduct -= item.amount;
        item.amount = 0;
        item.status = 'used';
        item.usedInOrderId = orderId;
      } else {
        item.amount = Number((item.amount - remainingToDeduct).toFixed(3));
        item.status = 'partially_used';
        item.usedInOrderId = orderId;
        remainingToDeduct = 0;
      }
    }

    wallet.activeBalance = Number(Math.max(0, wallet.activeBalance - amountToDeduct).toFixed(3));
    wallet.usedBalance = Number((wallet.usedBalance + amountToDeduct).toFixed(3));

    wallet.transactions.unshift({
      id: `tx_ded_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: 'debit',
      amount: Number(amountToDeduct.toFixed(3)),
      balanceAfter: wallet.activeBalance,
      description: `استخدام رصيد مكافآت في الطلب #${orderId}`,
      referenceId: orderId,
      createdAt: new Date().toISOString(),
    });

    const profile = this.getUserProfile(userId);
    profile.totalRewardsUsedKwd = Number((profile.totalRewardsUsedKwd + amountToDeduct).toFixed(3));

    db.save();
    db.logActivity('استخدام رصيد المحفظة', 'order', `تم خصم ${amountToDeduct.toFixed(3)} د.ك من رصيد المستخدم للطلب #${orderId}`, 'info');

    return { success: true, deductedAmount: Number(amountToDeduct.toFixed(3)), remainingBalance: wallet.activeBalance };
  }

  // --- Challenge Session Engine (Anti-Cheat Server-side Validation) ---
  public getActiveSessionForUser(userId: string): {
    hasActiveSession: boolean;
    sessionToken?: string;
    sessionId?: string;
    currentQuestion?: any;
    dailyAttemptsRemaining?: number;
    timeLimitSeconds?: number;
    isCompleted?: boolean;
    sessionSummary?: any;
  } {
    this.ensureSchema();
    const settings = this.getSettings();
    const profile = this.getUserProfile(userId);
    const maxDaily = settings.dailyAttemptsLimit || 3;
    const dailyAttemptsRemaining = Math.max(0, maxDaily - profile.dailyAttemptsUsed);

    // Search activeSessions map and db
    for (const [token, session] of this.activeSessions.entries()) {
      if (session.userId === userId && session.status === 'active') {
        // Check if overall session expired
        const nowMs = Date.now();
        if (nowMs > new Date(session.expiresAt).getTime()) {
          session.status = 'expired';
          session.cancelledReason = 'انتهت صلاحية الجلسة بالكامل';
          this.activeSessions.delete(token);
          db.save();
          continue;
        }

        // Process any pending timed out questions up to now
        while (session.currentIndex < session.questionIds.length) {
          const qId = session.questionIds[session.currentIndex];
          const qState = session.questionStates[qId];
          const qExpiresMs = new Date(qState.questionExpiresAt).getTime();

          if (nowMs > qExpiresMs + 1000) {
            // This question has timed out while the user was away!
            qState.state = 'timeout';
            qState.selectedIndex = -1;
            qState.isCorrect = false;
            qState.rewardEarned = 0;
            qState.xpEarned = 0;
            qState.answeredAt = new Date(qExpiresMs).toISOString();

            if (!session.answers.some(a => a.questionId === qId)) {
              session.answers.push({
                questionId: qId,
                selectedIndex: -1,
                isCorrect: false,
                rewardEarned: 0,
                xpEarned: 0,
                state: 'timeout',
                answeredAt: qState.answeredAt,
              });
            }

            profile.wrongAnswersCount += 1;
            const rawQ = this.getQuestionById(qId);
            if (rawQ) {
              rawQ.timesIncorrect = (rawQ.timesIncorrect || 0) + 1;
            }

            this.logChallengeActivity({
              id: `act_to_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              userId: session.userId,
              challengeSessionId: session.id,
              questionId: qId,
              questionText: rawQ?.question,
              result: 'timeout',
              reward: 0,
              xp: 0,
              timestamp: new Date().toISOString(),
            });

            session.currentIndex += 1;
            if (session.currentIndex < session.questionIds.length) {
              const nextQId = session.questionIds[session.currentIndex];
              const nextQState = session.questionStates[nextQId];
              nextQState.state = 'active';
              nextQState.questionStartedAt = new Date().toISOString();
              nextQState.questionExpiresAt = new Date(Date.now() + (settings.timePerQuestionSeconds || 15) * 1000).toISOString();
              session.currentQuestionStartedAt = nextQState.questionStartedAt;
              session.currentQuestionExpiresAt = nextQState.questionExpiresAt;
            }
          } else {
            // Still active with remaining time!
            break;
          }
        }

        db.save();

        if (session.currentIndex >= session.questionIds.length) {
          session.status = 'completed';
          session.completedAt = new Date().toISOString();
          const bonusXp = settings.challengeCompletionBonusXp || 100;
          session.totalXpEarned += bonusXp;
          profile.xp += bonusXp;
          profile.challengesCompleted += 1;
          this.updateUserProfile(session.userId, {});
          this.activeSessions.delete(token);
          db.save();

          return {
            hasActiveSession: false,
            isCompleted: true,
            sessionSummary: {
              sessionId: session.id,
              status: 'completed',
              totalRewardEarned: session.totalRewardEarned,
              totalXpEarned: session.totalXpEarned,
              totalQuestions: session.questionIds.length,
              correctAnswersCount: session.answers.filter(a => a.state === 'correct').length,
              wrongAnswersCount: session.answers.filter(a => a.state === 'wrong').length,
              timeoutCount: session.answers.filter(a => a.state === 'timeout').length,
              currentTier: profile.currentTier,
              newXp: profile.xp,
              activeWalletBalance: this.getUserWallet(session.userId).activeBalance,
            },
          };
        }

        const currentQId = session.questionIds[session.currentIndex];
        const currentQ = this.getQuestionById(currentQId);
        const currentQState = session.questionStates[currentQId];

        if (currentQ && currentQState) {
          const remainingSec = Math.max(0, Math.ceil((new Date(currentQState.questionExpiresAt).getTime() - Date.now()) / 1000));
          const clientQ = this.formatQuestionForClient(
            currentQ,
            session.currentIndex,
            session.questionIds.length,
            session.timeLimitSeconds,
            currentQState.questionStartedAt,
            currentQState.questionExpiresAt,
            remainingSec,
            currentQState.shuffledOptions
          );

          return {
            hasActiveSession: true,
            sessionToken: token,
            sessionId: session.id,
            currentQuestion: clientQ,
            dailyAttemptsRemaining,
            timeLimitSeconds: session.timeLimitSeconds,
          };
        }
      }
    }

    return {
      hasActiveSession: false,
      dailyAttemptsRemaining,
    };
  }

  public startChallengeSession(
    userId: string,
    displayName = 'متسابق مكتبة الشاطئ الازرق'
  ): { session: ChallengeSession; firstQuestion: any; dailyAttemptsRemaining: number; timeLimitSeconds: number } {
    this.ensureSchema();
    const settings = this.getSettings();

    if (!settings.isEnabled) {
      throw new Error('نظام التحديات والمكافآت متوقف حالياً من قبل إدارة المتجر');
    }

    // First check if user already has an active ongoing session that can be resumed
    const activeCheck = this.getActiveSessionForUser(userId);
    if (activeCheck.hasActiveSession && activeCheck.currentQuestion && activeCheck.sessionToken) {
      const session = this.activeSessions.get(activeCheck.sessionToken)!;
      return {
        session,
        firstQuestion: activeCheck.currentQuestion,
        dailyAttemptsRemaining: activeCheck.dailyAttemptsRemaining || 0,
        timeLimitSeconds: session.timeLimitSeconds || 15,
      };
    }

    const profile = this.getUserProfile(userId, displayName);
    const maxDaily = settings.dailyAttemptsLimit || 3;

    if (profile.dailyAttemptsUsed >= maxDaily) {
      throw new Error(`لقد استنفدت محاولاتك اليومية (${maxDaily} محاولات). يرجى العودة غداً لتحدٍ جديد!`);
    }

    // Pick active questions randomly
    const activeQuestions = this.getQuestions().filter(q => q.isActive);
    if (activeQuestions.length === 0) {
      throw new Error('لا توجد أسئلة مفعلة حالياً في بنك الأسئلة');
    }

    const questionsCount = Math.min(settings.questionsPerChallenge || 10, activeQuestions.length);
    const shuffled = [...activeQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionsCount);

    const sessionId = `chal_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const sessionToken = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const startedAt = new Date().toISOString();
    const timeLimitSec = settings.timePerQuestionSeconds || 15;
    const expiresAt = new Date(Date.now() + (questionsCount * (timeLimitSec + 5) + 60) * 1000).toISOString();

    const now = Date.now();
    const firstQStartedAt = new Date(now).toISOString();
    const firstQExpiresAt = new Date(now + timeLimitSec * 1000).toISOString();

    const questionStates: Record<string, QuestionSessionState> = {};
    selected.forEach((q, idx) => {
      // Shuffle options for each question session so the client never knows the position
      const originalOptions = q.options || [];
      const originalCorrectIndex = q.correctAnswerIndex ?? 0;
      const indexed = originalOptions.map((opt, i) => ({ opt, isCorrect: i === originalCorrectIndex }));
      const shuffledIndexed = [...indexed].sort(() => 0.5 - Math.random());
      const shuffledOptions = shuffledIndexed.map(x => x.opt);
      const correctAnswerIndexInShuffled = shuffledIndexed.findIndex(x => x.isCorrect);

      if (idx === 0) {
        questionStates[q.id] = {
          questionId: q.id,
          state: 'active',
          questionStartedAt: firstQStartedAt,
          questionExpiresAt: firstQExpiresAt,
          rewardEarned: 0,
          xpEarned: 0,
          shuffledOptions,
          correctAnswerIndexInShuffled: correctAnswerIndexInShuffled !== -1 ? correctAnswerIndexInShuffled : 0,
        };
      } else {
        questionStates[q.id] = {
          questionId: q.id,
          state: 'locked',
          questionStartedAt: '',
          questionExpiresAt: '',
          rewardEarned: 0,
          xpEarned: 0,
          shuffledOptions,
          correctAnswerIndexInShuffled: correctAnswerIndexInShuffled !== -1 ? correctAnswerIndexInShuffled : 0,
        };
      }
    });

    const session: ChallengeSession = {
      id: sessionId,
      userId,
      sessionToken,
      startedAt,
      expiresAt,
      questionIds: selected.map(q => q.id),
      currentIndex: 0,
      timeLimitSeconds: timeLimitSec,
      currentQuestionStartedAt: firstQStartedAt,
      currentQuestionExpiresAt: firstQExpiresAt,
      questionStates,
      answers: [],
      totalRewardEarned: 0,
      totalXpEarned: 0,
      status: 'active',
    };

    this.activeSessions.set(sessionToken, session);
    const rawData = (db as any).data;
    rawData.challengeSessions[sessionId] = session;

    // Increment daily attempts
    profile.dailyAttemptsUsed += 1;
    profile.challengesPlayed += 1;
    db.save();

    db.logActivity('بدء تحدي جديد', 'system', `بدأ المستخدم (${profile.displayName}) جولة تحدٍ جديدة [${questionsCount} أسئلة - معرف الجلسة: ${sessionId}]`, 'info');

    // Update question shown count
    selected.forEach(q => {
      q.timesShown = (q.timesShown || 0) + 1;
    });
    db.save();

    const firstQState = questionStates[selected[0].id];
    const firstQ = this.formatQuestionForClient(
      selected[0],
      0,
      selected.length,
      session.timeLimitSeconds,
      firstQStartedAt,
      firstQExpiresAt,
      timeLimitSec,
      firstQState?.shuffledOptions
    );

    return {
      session,
      firstQuestion: firstQ,
      dailyAttemptsRemaining: Math.max(0, maxDaily - profile.dailyAttemptsUsed),
      timeLimitSeconds: session.timeLimitSeconds,
    };
  }

  public submitAnswer(
    sessionToken: string,
    questionId: string,
    selectedIndex: number,
    timeTakenSeconds = 0
  ): {
    success: boolean;
    isCorrect: boolean;
    isTimeout: boolean;
    rewardEarned: number;
    xpEarned: number;
    nextQuestion: any | null;
    isCompleted: boolean;
    sessionSummary?: any;
    message?: string;
  } {
    this.ensureSchema();
    const session = this.activeSessions.get(sessionToken);
    if (!session) {
      // Check if session was already completed
      const rawSessions = (db as any).data.challengeSessions || {};
      const completedSession = Object.values(rawSessions).find((s: any) => s.sessionToken === sessionToken) as ChallengeSession | undefined;
      if (completedSession && completedSession.status === 'completed') {
        const profile = this.getUserProfile(completedSession.userId);
        return {
          success: true,
          isCorrect: false,
          isTimeout: false,
          rewardEarned: 0,
          xpEarned: 0,
          nextQuestion: null,
          isCompleted: true,
          sessionSummary: {
            sessionId: completedSession.id,
            status: 'completed',
            totalRewardEarned: completedSession.totalRewardEarned,
            totalXpEarned: completedSession.totalXpEarned,
            totalQuestions: completedSession.questionIds.length,
            correctAnswersCount: completedSession.answers.filter(a => a.state === 'correct').length,
            wrongAnswersCount: completedSession.answers.filter(a => a.state === 'wrong').length,
            timeoutCount: completedSession.answers.filter(a => a.state === 'timeout').length,
            currentTier: profile.currentTier,
            newXp: profile.xp,
            activeWalletBalance: this.getUserWallet(completedSession.userId).activeBalance,
          },
        };
      }
      throw new Error('جلسة التحدي غير صالحة أو تم إنهاؤها مسبقاً');
    }

    if (session.status !== 'active') {
      throw new Error('هذه الجلسة غير نشطة أو مكتملة بالفعل');
    }

    const settings = this.getSettings();
    const profile = this.getUserProfile(session.userId);

    // Check overall session expiry
    if (Date.now() > new Date(session.expiresAt).getTime()) {
      session.status = 'expired';
      session.cancelledReason = 'انتهت صلاحية الجلسة';
      this.activeSessions.delete(sessionToken);
      db.save();
      throw new Error('انتهت صلاحية الجلسة المسموحة');
    }

    const currentQuestionId = session.questionIds[session.currentIndex];
    if (currentQuestionId !== questionId) {
      // If questionId corresponds to a previous question already answered:
      // Return previous result idempotently without re-rewarding!
      const previousState = session.questionStates[questionId];
      if (previousState && (previousState.state === 'correct' || previousState.state === 'wrong' || previousState.state === 'timeout')) {
        const raw = (db as any).data;
        raw.rejectedOrDuplicateCount = (raw.rejectedOrDuplicateCount || 0) + 1;
        this.logChallengeActivity({
          id: `act_dup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: session.userId,
          challengeSessionId: session.id,
          questionId,
          result: 'rejected_duplicate',
          reward: 0,
          xp: 0,
          timestamp: new Date().toISOString(),
        });
        db.save();

        const currentActiveQ = this.getQuestionById(currentQuestionId);
        const currentActiveState = session.questionStates[currentQuestionId];
        const remainingSec = currentActiveState
          ? Math.max(0, Math.ceil((new Date(currentActiveState.questionExpiresAt).getTime() - Date.now()) / 1000))
          : 0;

        return {
          success: true,
          isCorrect: previousState.isCorrect || false,
          isTimeout: previousState.state === 'timeout',
          rewardEarned: 0, // NO EXTRA REWARD
          xpEarned: 0,
          nextQuestion: currentActiveQ && currentActiveState
            ? this.formatQuestionForClient(
                currentActiveQ,
                session.currentIndex,
                session.questionIds.length,
                session.timeLimitSeconds,
                currentActiveState.questionStartedAt,
                currentActiveState.questionExpiresAt,
                remainingSec,
                currentActiveState.shuffledOptions
              )
            : null,
          isCompleted: false,
          message: 'تم تسجيل هذا السؤال مسبقاً',
        };
      }

      throw new Error('رقم السؤال غير مطابق لترتيب الجلسة الحالي');
    }

    const qState = session.questionStates[questionId];
    if (!qState) {
      throw new Error('حالة السؤال غير موجودة في الجلسة');
    }

    // IDEMPOTENCY CHECK: If already answered in this session
    if (qState.state === 'correct' || qState.state === 'wrong' || qState.state === 'timeout') {
      const raw = (db as any).data;
      raw.rejectedOrDuplicateCount = (raw.rejectedOrDuplicateCount || 0) + 1;
      this.logChallengeActivity({
        id: `act_dup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: session.userId,
        challengeSessionId: session.id,
        questionId,
        result: 'rejected_duplicate',
        reward: 0,
        xp: 0,
        timestamp: new Date().toISOString(),
      });
      db.save();

      return {
        success: true,
        isCorrect: qState.isCorrect || false,
        isTimeout: qState.state === 'timeout',
        rewardEarned: 0, // STRICTLY ZERO on re-submission
        xpEarned: 0,
        nextQuestion: null,
        isCompleted: session.currentIndex >= session.questionIds.length - 1,
        message: 'تم إرسال إجابة هذا السؤال مسبقاً',
      };
    }

    const question = this.getQuestionById(questionId);
    if (!question) {
      throw new Error('السؤال غير موجود في بنك الأسئلة');
    }

    // SERVER-SIDE TIMING VERIFICATION
    const nowMs = Date.now();
    const expiresMs = new Date(qState.questionExpiresAt).getTime();
    // 1000ms grace period for network latency
    const isTimeout = (nowMs > expiresMs + 1000) || selectedIndex === -1 || selectedIndex === null || selectedIndex === undefined;

    let isCorrect = false;
    let rewardEarned = 0;
    let xpEarned = 0;

    if (isTimeout) {
      // TIMEOUT OCCURRED: Reward MUST BE 0 regardless of selected option
      qState.state = 'timeout';
      qState.selectedIndex = -1;
      qState.isCorrect = false;
      qState.rewardEarned = 0;
      qState.xpEarned = 0;
      qState.answeredAt = new Date().toISOString();

      session.answers.push({
        questionId,
        selectedIndex: -1,
        isCorrect: false,
        rewardEarned: 0,
        xpEarned: 0,
        state: 'timeout',
        answeredAt: qState.answeredAt,
      });

      profile.wrongAnswersCount += 1;
      question.timesIncorrect = (question.timesIncorrect || 0) + 1;

      this.logChallengeActivity({
        id: `act_to_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: session.userId,
        challengeSessionId: session.id,
        questionId,
        questionText: question.question,
        result: 'timeout',
        reward: 0,
        xp: 0,
        timestamp: qState.answeredAt,
      });
    } else {
      // ANSWERED WITHIN TIME
      const expectedIndex = qState.correctAnswerIndexInShuffled !== undefined
        ? qState.correctAnswerIndexInShuffled
        : question.correctAnswerIndex;
      isCorrect = selectedIndex === expectedIndex;
      qState.selectedIndex = selectedIndex;
      qState.isCorrect = isCorrect;
      qState.answeredAt = new Date().toISOString();

      if (isCorrect) {
        qState.state = 'correct';
        // Calculate strictly from server settings/question
        rewardEarned = Number((question.rewardAmount || settings.defaultRewardAmount || 0.500).toFixed(3));
        xpEarned = question.xpAmount || settings.defaultXpPerCorrectAnswer || 25;
        qState.rewardEarned = rewardEarned;
        qState.xpEarned = xpEarned;

        const txId = `tx_rw_${session.id}_${questionId}_${Date.now()}`;
        qState.transactionId = txId;

        session.answers.push({
          questionId,
          selectedIndex,
          isCorrect: true,
          rewardEarned,
          xpEarned,
          state: 'correct',
          answeredAt: qState.answeredAt,
          transactionId: txId,
        });

        session.totalRewardEarned = Number((session.totalRewardEarned + rewardEarned).toFixed(3));
        session.totalXpEarned += xpEarned;

        profile.correctAnswersCount += 1;
        profile.xp += xpEarned;
        question.timesCorrect = (question.timesCorrect || 0) + 1;

        // Credit wallet idempotently with unique transaction reference
        this.addWalletReward(
          session.userId,
          rewardEarned,
          'challenge',
          session.id,
          `مكافأة الإجابة الصحيحة للسؤال: ${question.question.substring(0, 25)}...`
        );

        this.logChallengeActivity({
          id: txId,
          userId: session.userId,
          challengeSessionId: session.id,
          questionId,
          questionText: question.question,
          result: 'correct',
          reward: rewardEarned,
          xp: xpEarned,
          timestamp: qState.answeredAt,
        });
      } else {
        qState.state = 'wrong';
        qState.rewardEarned = 0;
        qState.xpEarned = 0;

        session.answers.push({
          questionId,
          selectedIndex,
          isCorrect: false,
          rewardEarned: 0,
          xpEarned: 0,
          state: 'wrong',
          answeredAt: qState.answeredAt,
        });

        profile.wrongAnswersCount += 1;
        question.timesIncorrect = (question.timesIncorrect || 0) + 1;

        this.logChallengeActivity({
          id: `act_wr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: session.userId,
          challengeSessionId: session.id,
          questionId,
          questionText: question.question,
          result: 'wrong',
          reward: 0,
          xp: 0,
          timestamp: qState.answeredAt,
        });
      }
    }

    this.updateUserProfile(session.userId, {}); // Tier evaluation & achievements

    // ADVANCE QUESTION OR COMPLETE
    session.currentIndex += 1;
    const isCompleted = session.currentIndex >= session.questionIds.length;

    let nextQuestion = null;
    let sessionSummary = undefined;

    if (!isCompleted) {
      const nextQId = session.questionIds[session.currentIndex];
      const nextQ = this.getQuestionById(nextQId);
      const nextQState = session.questionStates[nextQId];

      if (nextQ && nextQState) {
        const nextNow = Date.now();
        const nextTimeLimit = session.timeLimitSeconds || 15;
        nextQState.state = 'active';
        nextQState.questionStartedAt = new Date(nextNow).toISOString();
        nextQState.questionExpiresAt = new Date(nextNow + nextTimeLimit * 1000).toISOString();
        session.currentQuestionStartedAt = nextQState.questionStartedAt;
        session.currentQuestionExpiresAt = nextQState.questionExpiresAt;

        nextQuestion = this.formatQuestionForClient(
          nextQ,
          session.currentIndex,
          session.questionIds.length,
          session.timeLimitSeconds,
          nextQState.questionStartedAt,
          nextQState.questionExpiresAt,
          nextTimeLimit,
          nextQState.shuffledOptions
        );
      }
    } else {
      // Challenge Complete!
      session.status = 'completed';
      session.completedAt = new Date().toISOString();
      const completionBonusXp = settings.challengeCompletionBonusXp || 100;
      session.totalXpEarned += completionBonusXp;
      profile.xp += completionBonusXp;
      profile.challengesCompleted += 1;

      this.updateUserProfile(session.userId, {});
      this.activeSessions.delete(sessionToken);

      db.logActivity(
        'إكمال التحدي بنجاح',
        'system',
        `أكمل المستخدم (${profile.displayName}) التحدي برصيد ${session.totalRewardEarned.toFixed(3)} د.ك و ${session.totalXpEarned} XP [جلسة: ${session.id}]`,
        'success'
      );

      const wallet = this.getUserWallet(session.userId);
      sessionSummary = {
        sessionId: session.id,
        status: 'completed',
        totalRewardEarned: session.totalRewardEarned,
        totalXpEarned: session.totalXpEarned,
        totalQuestions: session.questionIds.length,
        correctAnswersCount: session.answers.filter(a => a.state === 'correct').length,
        wrongAnswersCount: session.answers.filter(a => a.state === 'wrong').length,
        timeoutCount: session.answers.filter(a => a.state === 'timeout').length,
        currentTier: profile.currentTier,
        newXp: profile.xp,
        activeWalletBalance: wallet.activeBalance,
      };
    }

    db.save();

    return {
      success: true,
      isCorrect,
      isTimeout,
      rewardEarned,
      xpEarned,
      nextQuestion,
      isCompleted,
      sessionSummary,
    };
  }

  public cancelChallengeSession(sessionToken: string, reason = 'مغادرة صفحة التحدي'): boolean {
    const session = this.activeSessions.get(sessionToken);
    if (session && session.status === 'active') {
      session.status = 'cancelled';
      session.cancelledReason = reason;
      this.activeSessions.delete(sessionToken);
      db.logActivity('إلغاء التحدي', 'system', `تم إلغاء جولة التحدي للمستخدم (${session.userId}) بسبب: ${reason}`, 'warning');
      db.save();
      return true;
    }
    return false;
  }

  // --- Log Challenge Activity ---
  private logChallengeActivity(item: ChallengeActivityItem): void {
    const raw = (db as any).data;
    if (!Array.isArray(raw.challengeActivityLogs)) {
      raw.challengeActivityLogs = [];
    }
    raw.challengeActivityLogs.unshift(item);
    // Keep last 500 items
    if (raw.challengeActivityLogs.length > 500) {
      raw.challengeActivityLogs = raw.challengeActivityLogs.slice(0, 500);
    }
  }

  // --- Client Safe Question Formatter ---
  private formatQuestionForClient(
    question: QuizQuestion,
    index: number,
    total: number,
    timeLimit: number,
    startedAt?: string,
    expiresAt?: string,
    remainingSeconds?: number,
    customOptions?: string[]
  ) {
    return {
      questionId: question.id,
      questionIndex: index + 1,
      totalQuestions: total,
      question: question.question,
      options: customOptions && customOptions.length > 0 ? customOptions : question.options,
      rewardAmount: question.rewardAmount,
      xpAmount: question.xpAmount,
      timeLimitSeconds: timeLimit,
      questionStartedAt: startedAt,
      questionExpiresAt: expiresAt,
      remainingSeconds: remainingSeconds !== undefined ? remainingSeconds : timeLimit,
      serverTime: new Date().toISOString(),
      category: question.category,
      difficulty: question.difficulty,
    };
  }

  // --- Achievements Checker ---
  private checkUserAchievements(profile: UserProfile): void {
    const achievements: Achievement[] = (db as any).data.achievements || [];
    const unlocked = new Set(profile.unlockedAchievementIds || []);

    achievements.forEach(ach => {
      if (unlocked.has(ach.id) || !ach.isActive) return;

      let meets = false;
      if (ach.id === 'ach_first_challenge' && profile.challengesPlayed >= 1) meets = true;
      if (ach.id === 'ach_first_correct' && profile.correctAnswersCount >= 1) meets = true;
      if (ach.id === 'ach_10_correct' && profile.correctAnswersCount >= 10) meets = true;
      if (ach.id === 'ach_50_correct' && profile.correctAnswersCount >= 50) meets = true;
      if (ach.id === 'ach_silver_level' && profile.xp >= 100) meets = true;
      if (ach.id === 'ach_gold_level' && profile.xp >= 500) meets = true;
      if (ach.id === 'ach_diamond_level' && profile.xp >= 5000) meets = true;
      if (ach.id === 'ach_earned_5kwd' && profile.totalRewardsEarnedKwd >= 5.0) meets = true;
      if (ach.id === 'ach_wallet_first_order' && profile.totalRewardsUsedKwd > 0) meets = true;

      if (meets) {
        unlocked.add(ach.id);
        profile.xp += ach.rewardXp || 0;
        if (ach.rewardKwd && ach.rewardKwd > 0) {
          this.addWalletReward(profile.id, ach.rewardKwd, 'achievement', ach.id, `مكافأة إنجاز: ${ach.title}`);
        }
        db.logActivity('فتح إنجاز جديد', 'system', `المستخدم (${profile.displayName}) حقق إنجاز: [${ach.title}]`, 'success');
      }
    });

    profile.unlockedAchievementIds = Array.from(unlocked);
  }

  // --- Leaderboard ---
  public getLeaderboard(): LeaderboardEntry[] {
    this.ensureSchema();
    const settings = this.getSettings();
    if (!settings.enableLeaderboard) return [];

    const raw = (db as any).data;
    const profiles: UserProfile[] = Object.values(raw.userProfiles || {});

    return profiles
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 20)
      .map((p, idx) => {
        const safeName = p.displayName.length > 3 ? `${p.displayName.substring(0, 6)}...` : p.displayName;
        const tier = settings.tiers?.find(t => t.name === p.currentTier) || defaultTiers[0];
        return {
          rank: idx + 1,
          displayName: safeName || `متسابق #${idx + 1}`,
          tierName: p.currentTier,
          badgeColor: tier.badgeColor,
          xp: p.xp,
          completedChallenges: p.challengesCompleted,
        };
      });
  }

  // --- Analytics & Statistics for Admin ---
  public getGamificationStats() {
    this.ensureSchema();
    const raw = (db as any).data;
    const questions: QuizQuestion[] = raw.questions || [];
    const profiles: UserProfile[] = Object.values(raw.userProfiles || {});
    const wallets: UserWallet[] = Object.values(raw.wallets || {});
    const activityLogs: ChallengeActivityItem[] = raw.challengeActivityLogs || [];
    const rejectedOrDuplicateCount: number = raw.rejectedOrDuplicateCount || 0;

    let totalRewardGranted = 0;
    let totalRewardUsed = 0;
    let totalRewardExpired = 0;

    wallets.forEach(w => {
      totalRewardGranted += w.totalEarned || 0;
      totalRewardUsed += w.usedBalance || 0;
      totalRewardExpired += w.expiredBalance || 0;
    });

    const totalCorrect = questions.reduce((sum, q) => sum + (q.timesCorrect || 0), 0);
    const totalIncorrect = questions.reduce((sum, q) => sum + (q.timesIncorrect || 0), 0);
    const totalShown = questions.reduce((sum, q) => sum + (q.timesShown || 0), 0);

    const totalTimeout = activityLogs.filter(a => a.result === 'timeout').length;
    const totalChallengesPlayed = profiles.reduce((sum, p) => sum + (p.challengesPlayed || 0), 0);
    const totalChallengesCompleted = profiles.reduce((sum, p) => sum + (p.challengesCompleted || 0), 0);
    const totalDailyAttempts = profiles.reduce((sum, p) => sum + (p.dailyAttemptsUsed || 0), 0);

    const mostSuccessfulQuestions = [...questions]
      .filter(q => (q.timesShown || 0) > 0)
      .sort((a, b) => ((b.timesCorrect || 0) / (b.timesShown || 1)) - ((a.timesCorrect || 0) / (a.timesShown || 1)))
      .slice(0, 5);

    const hardestQuestions = [...questions]
      .filter(q => (q.timesShown || 0) > 0)
      .sort((a, b) => ((b.timesIncorrect || 0) / (b.timesShown || 1)) - ((a.timesIncorrect || 0) / (a.timesShown || 1)))
      .slice(0, 5);

    const mostActiveUsers = [...profiles]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    return {
      totalChallengesPlayed,
      totalChallengesCompleted,
      totalParticipatingUsers: profiles.length,
      totalCorrectAnswers: totalCorrect,
      totalWrongAnswers: totalIncorrect,
      totalTimeoutAnswers: totalTimeout,
      correctRatePercent: totalShown > 0 ? Number(((totalCorrect / totalShown) * 100).toFixed(1)) : 0,
      totalRewardsDistributedKwd: Number(totalRewardGranted.toFixed(3)),
      totalRewardsUsedInOrdersKwd: Number(totalRewardUsed.toFixed(3)),
      totalRewardsExpiredKwd: Number(totalRewardExpired.toFixed(3)),
      totalRejectedOrDuplicateTransactions: rejectedOrDuplicateCount,
      totalDailyAttempts,
      totalXpEarned: profiles.reduce((sum, p) => sum + (p.xp || 0), 0),
      recentActivities: activityLogs.slice(0, 50),
      mostSuccessfulQuestions,
      hardestQuestions,
      mostActiveUsers,
    };
  }

  // --- Admin User Management Helpers ---
  public getAllUsersSummary(): any[] {
    this.ensureSchema();
    const raw = (db as any).data;
    const profiles: UserProfile[] = Object.values(raw.userProfiles || {});
    return profiles.map(p => {
      const wallet = this.getUserWallet(p.id);
      return {
        id: p.id,
        displayName: p.displayName || 'مستخدم',
        email: p.email,
        phone: p.phoneNumber,
        role: p.role || 'user',
        currentTier: p.currentTier || 'المستوى البرونزي',
        xp: p.xp || 0,
        activeWalletBalance: Number((wallet.activeBalance || 0).toFixed(3)),
        totalRewardsEarnedKwd: Number((wallet.totalEarned || 0).toFixed(3)),
        totalRewardsUsedKwd: Number((wallet.usedBalance || 0).toFixed(3)),
        challengesPlayed: p.challengesPlayed || 0,
        challengesCompleted: p.challengesCompleted || 0,
        lastLoginAt: p.lastLoginAt,
        createdAt: p.createdAt || new Date().toISOString(),
      };
    });
  }

  public getUserAdminDetail(userId: string) {
    this.ensureSchema();
    const profile = this.getUserProfile(userId);
    const wallet = this.getUserWallet(userId);
    const raw = (db as any).data;
    const activityLogs: ChallengeActivityItem[] = (raw.challengeActivityLogs || []).filter((a: any) => a.userId === userId);
    const achievements: Achievement[] = (raw.achievements || []).map((ach: Achievement) => ({
      ...ach,
      isUnlocked: (profile.unlockedAchievementIds || []).includes(ach.id),
    }));
    const orders = db.getOrders().filter(o => (profile.phoneNumber && o.customerPhone === profile.phoneNumber) || (profile.displayName && o.customerName.includes(profile.displayName)));

    return {
      profile,
      wallet,
      activityLogs,
      achievements,
      orders,
    };
  }
}

export const gamificationEngine = new GamificationEngine();

