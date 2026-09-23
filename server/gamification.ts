import fs from 'fs';
import path from 'path';
import {
  Season,
  GameConfig,
  XpRulesConfig,
  DailyChallengeConfig,
  UserXPRecord,
  XpTransaction,
  ActivityAuditLog,
  LeaderboardUserEntry,
  GamificationOverviewStats,
  UserProfile,
  UserWallet,
} from './types';
import { db } from './db';

const DATA_DIR = path.join(process.cwd(), 'data');
const XP_GAMIFICATION_FILE = path.join(DATA_DIR, 'xp_gamification.json');

export const LEVEL_THRESHOLDS = [
  0,       // Level 1
  200,     // Level 2
  500,     // Level 3
  1000,    // Level 4
  2000,    // Level 5
  3500,    // Level 6
  5500,    // Level 7
  8000,    // Level 8
  11000,   // Level 9
  15000,   // Level 10
  20000,   // Level 11
  26000,   // Level 12
  33000,   // Level 13
  41000,   // Level 14
  50000,   // Level 15
];

export function calculateLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  let lvl = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      lvl = i + 1;
    } else {
      break;
    }
  }
  if (totalXp >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) {
    const extra = totalXp - LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    lvl = LEVEL_THRESHOLDS.length + Math.floor(extra / 10000);
  }
  return lvl;
}

export function getXpProgressForLevel(totalXp: number): {
  currentLevel: number;
  currentLevelMinXp: number;
  nextLevelMinXp: number;
  xpInCurrentLevel: number;
  xpRequiredForNextLevel: number;
  progressPercent: number;
} {
  const currentLevel = calculateLevel(totalXp);
  const currentMin = currentLevel <= LEVEL_THRESHOLDS.length
    ? LEVEL_THRESHOLDS[currentLevel - 1]
    : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length) * 10000;

  const nextMin = currentLevel < LEVEL_THRESHOLDS.length
    ? LEVEL_THRESHOLDS[currentLevel]
    : currentMin + 10000;

  const xpInCurrentLevel = Math.max(0, totalXp - currentMin);
  const xpRequiredForNextLevel = Math.max(1, nextMin - currentMin);
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNextLevel) * 100));

  return {
    currentLevel,
    currentLevelMinXp: currentMin,
    nextLevelMinXp: nextMin,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    progressPercent,
  };
}

export interface GamificationDataStore {
  seasons: Season[];
  games: GameConfig[];
  xpRules: XpRulesConfig;
  dailyChallenges: DailyChallengeConfig[];
  userXp: Record<string, UserXPRecord>;
  xpTransactions: XpTransaction[];
  auditLogs: ActivityAuditLog[];
}

const defaultSeasons: Season[] = [
  {
    id: 'season_1',
    nameAr: 'الموسم الأول - Blue Beach Season #1',
    nameEn: 'Blue Beach Season #1',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-12-31T23:59:59.000Z',
    status: 'active',
    numberOfWinners: 3,
    prizeDescriptionAr: 'المركز الأول: قسيمة شراء بقيمة 50 د.ك + طقم أدوات فاخر. المركز الثاني: قسيمة 30 د.ك. المركز الثالث: قسيمة 20 د.ك.',
    prizeDescriptionEn: '1st Place: 50 KWD Gift Voucher + Luxury Stationery Set. 2nd Place: 30 KWD Voucher. 3rd Place: 20 KWD Voucher.',
    createdAt: new Date().toISOString(),
  },
];

const defaultGames: GameConfig[] = [
  {
    id: 'wheel_spin',
    enabled: true,
    nameAr: 'عجلة الحظ - Wheel of Fortune',
    nameEn: 'Wheel of Fortune',
    descriptionAr: 'أدر عجلة الحظ الموسمية واكسب نقاط XP لرفع ترتيبك في لائحة المتصدرين!',
    descriptionEn: 'Spin the seasonal wheel to earn XP points and boost your rank!',
    howToPlayAr: 'اضغط زر دوران العجلة. بعد انتهاء الدوران سيتم احتساب نقاط XP المستحقة وإضافتها فوراً.',
    howToPlayEn: 'Tap spin button. Once the wheel stops, your earned XP will be added immediately.',
    startButtonTextAr: 'أدر العجلة الآن',
    startButtonTextEn: 'Spin Wheel',
    icon: 'Disc',
    dailyAttemptsLimit: 5,
    xpPerAction: 100,
    sortOrder: 1,
    introEnabled: true,
  },
  {
    id: 'quiz_challenge',
    enabled: true,
    nameAr: 'تحدي المعلومات - Trivia Quiz',
    nameEn: 'Trivia Quiz',
    descriptionAr: 'أجب على الأسئلة السريعة عن القرطاسية والأدوات المكتبية واكسب XP!',
    descriptionEn: 'Answer quick trivia questions about stationery to earn XP!',
    howToPlayAr: 'اختر الإجابة الصحيحة للسؤال المعروض قبل انتهاء الوقت لاكتساب النقاط.',
    howToPlayEn: 'Select the correct answer for the displayed question before time expires.',
    startButtonTextAr: 'ابدأ التحدي',
    startButtonTextEn: 'Start Quiz',
    icon: 'HelpCircle',
    dailyAttemptsLimit: 5,
    xpPerAction: 80,
    sortOrder: 2,
    introEnabled: true,
  },
  {
    id: 'memory_cards',
    enabled: true,
    nameAr: 'لعبة الذاكرة - Memory Cards',
    nameEn: 'Memory Cards',
    descriptionAr: 'اقلب البطاقات وطابق أزواج المستلزمات المدرسية باحترافية!',
    descriptionEn: 'Flip cards and match school supply pairs skillfully!',
    howToPlayAr: 'افتح البطاقات واكتشف الأزواج المتشابهة من الأدوات بأسرح وقت وبأقل حركات.',
    howToPlayEn: 'Flip cards to find matching tool pairs with minimum moves and fastest time.',
    startButtonTextAr: 'ابدأ مطابقة البطاقات',
    startButtonTextEn: 'Match Cards',
    icon: 'Layers',
    dailyAttemptsLimit: 5,
    xpPerAction: 100,
    sortOrder: 3,
    introEnabled: true,
  },
  {
    id: 'stationery_catcher',
    enabled: true,
    nameAr: 'صائد القرطاسية - Stationery Catcher',
    nameEn: 'Stationery Catcher',
    descriptionAr: 'التقط الأقلام والدفاتر المتساقطة بسرعة قبل انتهاء الوقت لتضاعف XP!',
    descriptionEn: 'Catch falling pens and notebooks fast before timer ends to multiply XP!',
    howToPlayAr: 'حرك السلة لالتقاط القرطاسية المتساقطة واجمع أعلى نقاط خلال 15 ثانية.',
    howToPlayEn: 'Move the basket to catch falling supplies and gain maximum score in 15 seconds.',
    startButtonTextAr: 'اصطد القرطاسية',
    startButtonTextEn: 'Catch Supplies',
    icon: 'ShoppingBag',
    dailyAttemptsLimit: 5,
    xpPerAction: 120,
    sortOrder: 4,
    introEnabled: true,
  },
];

const defaultXpRules: XpRulesConfig = {
  dailyLoginXp: 50,
  productViewXp: 10,
  dailyProductBrowsingCap: 100,
  reviewXpAmount: 100,
  reviewMinCommentLength: 3,
  reviewXpEligibilityMode: 'ANY_PRODUCT',
  dailyXpCap: 5000,
  globalDailyGameAttempts: 10,
};

const defaultDailyChallenges: DailyChallengeConfig[] = [
  {
    id: 'c_login',
    titleAr: 'سجّل دخولك اليومي',
    titleEn: 'Daily Login',
    descriptionAr: 'افتح المتجر يومياً واحصل على نقاط الخبرة',
    descriptionEn: 'Visit the store daily to earn XP',
    type: 'DAILY_LOGIN',
    requiredCount: 1,
    xpReward: 50,
    enabled: true,
  },
  {
    id: 'c_game',
    titleAr: 'العب مباراة واحدة',
    titleEn: 'Play 1 Game',
    descriptionAr: 'شارك في أي لعبة من مركز الألعاب اليوم',
    descriptionEn: 'Play any game in the Games Center today',
    type: 'PLAY_GAME',
    requiredCount: 1,
    xpReward: 100,
    enabled: true,
  },
  {
    id: 'c_view',
    titleAr: 'تصفح 3 منتجات',
    titleEn: 'View 3 Products',
    descriptionAr: 'افتح تفاصيل 3 منتجات مختلفة لاكتشاف جديد المكتبة',
    descriptionEn: 'Open 3 product detail pages to discover items',
    type: 'VIEW_PRODUCTS',
    requiredCount: 3,
    xpReward: 50,
    enabled: true,
  },
  {
    id: 'c_review',
    titleAr: 'قيّم منتج اليوم',
    titleEn: 'Review Product Today',
    descriptionAr: 'اكتب تقييماً صادقاً لمنتج اشتريته واستمتع بـ XP',
    descriptionEn: 'Write a review for a product and earn XP',
    type: 'REVIEW_PRODUCT',
    requiredCount: 1,
    xpReward: 100,
    enabled: true,
  },
  {
    id: 'c_all',
    titleAr: 'إكمال جميع التحديات',
    titleEn: 'Complete All Challenges',
    descriptionAr: 'أكمل التحديات الأربعة اليومية واحصل على البونص الكبير',
    descriptionEn: 'Finish all 4 daily tasks for huge bonus XP',
    type: 'ALL_COMPLETE',
    requiredCount: 4,
    xpReward: 200,
    enabled: true,
  },
];

export class GamificationEngine {
  private data: GamificationDataStore;
  private isSaving: boolean = false;
  private pendingSave: boolean = false;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.data = this.load();
  }

  private load(): GamificationDataStore {
    try {
      if (fs.existsSync(XP_GAMIFICATION_FILE)) {
        const raw = fs.readFileSync(XP_GAMIFICATION_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          seasons: Array.isArray(parsed.seasons) && parsed.seasons.length > 0 ? parsed.seasons : defaultSeasons,
          games: Array.isArray(parsed.games) && parsed.games.length > 0 ? parsed.games : defaultGames,
          xpRules: { ...defaultXpRules, ...(parsed.xpRules || {}) },
          dailyChallenges: Array.isArray(parsed.dailyChallenges) && parsed.dailyChallenges.length > 0 ? parsed.dailyChallenges : defaultDailyChallenges,
          userXp: parsed.userXp || {},
          xpTransactions: Array.isArray(parsed.xpTransactions) ? parsed.xpTransactions : [],
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
        };
      }
    } catch (err) {
      console.error('Error reading xp_gamification.json, using defaults:', err);
    }
    return {
      seasons: defaultSeasons,
      games: defaultGames,
      xpRules: defaultXpRules,
      dailyChallenges: defaultDailyChallenges,
      userXp: {},
      xpTransactions: [],
      auditLogs: [],
    };
  }

  private save(): void {
    if (this.isSaving) {
      this.pendingSave = true;
      return;
    }
    this.isSaving = true;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${XP_GAMIFICATION_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, XP_GAMIFICATION_FILE);
    } catch (err) {
      console.error('Failed to save xp_gamification.json:', err);
    } finally {
      this.isSaving = false;
      if (this.pendingSave) {
        this.pendingSave = false;
        this.save();
      }
    }
  }

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  // --- Settings & XP Rules ---
  public getXpRules(): XpRulesConfig {
    return this.data.xpRules;
  }

  public updateXpRules(newRules: Partial<XpRulesConfig>): XpRulesConfig {
    this.data.xpRules = { ...this.data.xpRules, ...newRules };
    this.save();
    return this.data.xpRules;
  }

  // --- Seasons ---
  public getSeasons(): Season[] {
    return this.data.seasons;
  }

  public getActiveSeason(): Season {
    const nowIso = new Date().toISOString();
    const active = this.data.seasons.find(s => s.status === 'active' && s.startDate <= nowIso && s.endDate >= nowIso);
    if (active) return active;
    if (this.data.seasons.length > 0) return this.data.seasons[0];

    const fallback: Season = {
      id: `season_${Date.now()}`,
      nameAr: 'الموسم الحالي - Blue Beach',
      nameEn: 'Current Season - Blue Beach',
      startDate: new Date(Date.now() - 86400000).toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'active',
      numberOfWinners: 3,
      prizeDescriptionAr: 'جوائز عينية وقسائم شراء فاخرة للأوائل',
      prizeDescriptionEn: 'Prizes and shopping vouchers for top winners',
      createdAt: new Date().toISOString(),
    };
    this.data.seasons.unshift(fallback);
    this.save();
    return fallback;
  }

  public upsertSeason(seasonData: Partial<Season>): Season {
    if (seasonData.id) {
      const index = this.data.seasons.findIndex(s => s.id === seasonData.id);
      if (index !== -1) {
        this.data.seasons[index] = { ...this.data.seasons[index], ...seasonData };
        this.save();
        return this.data.seasons[index];
      }
    }
    const newSeason: Season = {
      id: seasonData.id || `season_${Date.now()}`,
      nameAr: seasonData.nameAr || 'موسم جديد',
      nameEn: seasonData.nameEn || 'New Season',
      startDate: seasonData.startDate || new Date().toISOString(),
      endDate: seasonData.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      status: seasonData.status || 'active',
      numberOfWinners: seasonData.numberOfWinners || 3,
      prizeDescriptionAr: seasonData.prizeDescriptionAr || 'جوائز الأوائل',
      prizeDescriptionEn: seasonData.prizeDescriptionEn || 'Top winners prizes',
      createdAt: new Date().toISOString(),
    };
    this.data.seasons.unshift(newSeason);
    this.save();
    return newSeason;
  }

  public lockSeasonResults(seasonId: string, adminUserId?: string): { success: boolean; season?: Season; top3?: any[]; error?: string } {
    const season = this.data.seasons.find(s => s.id === seasonId);
    if (!season) return { success: false, error: 'الموسم غير موجود' };

    const winners = this.getSeasonWinnersWithContact(seasonId, season.numberOfWinners || 3);
    season.status = 'completed';
    season.isLocked = true;
    season.lockedAt = new Date().toISOString();
    season.top3Winners = winners.map(w => ({
      ...w,
      confirmedAt: new Date().toISOString(),
    }));

    this.save();
    this.logAudit({
      userId: adminUserId || 'admin',
      activity: `اعتماد وفلق نتائج الموسم: ${season.nameAr}`,
      source: 'ADMIN',
      xp: 0,
      validationStatus: 'VALID',
      reason: 'Season locked and winners confirmed by Admin',
    });

    return { success: true, season, top3: winners };
  }

  // --- Games Config ---
  public getGames(includeDisabled = false): GameConfig[] {
    const list = includeDisabled ? this.data.games : this.data.games.filter(g => g.enabled);
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getGameById(gameId: string): GameConfig | undefined {
    return this.data.games.find(g => g.id === gameId);
  }

  public upsertGame(gameData: Partial<GameConfig>): GameConfig {
    if (gameData.id) {
      const idx = this.data.games.findIndex(g => g.id === gameData.id);
      if (idx !== -1) {
        this.data.games[idx] = { ...this.data.games[idx], ...gameData };
        this.save();
        return this.data.games[idx];
      }
    }
    const newGame: GameConfig = {
      id: gameData.id || `game_${Date.now()}`,
      enabled: gameData.enabled ?? true,
      nameAr: gameData.nameAr || 'لعبة جديدة',
      nameEn: gameData.nameEn || 'New Game',
      descriptionAr: gameData.descriptionAr || 'وصف اللعبة',
      descriptionEn: gameData.descriptionEn || 'Game description',
      howToPlayAr: gameData.howToPlayAr || 'طريقة اللعب',
      howToPlayEn: gameData.howToPlayEn || 'How to play',
      startButtonTextAr: gameData.startButtonTextAr || 'ابدأ اللعب',
      startButtonTextEn: gameData.startButtonTextEn || 'Start Playing',
      icon: gameData.icon || 'Gamepad2',
      dailyAttemptsLimit: gameData.dailyAttemptsLimit || 5,
      xpPerAction: gameData.xpPerAction || 100,
      sortOrder: gameData.sortOrder || this.data.games.length + 1,
      introEnabled: gameData.introEnabled ?? true,
    };
    this.data.games.push(newGame);
    this.save();
    return newGame;
  }

  public deleteGame(gameId: string): boolean {
    const initialLen = this.data.games.length;
    this.data.games = this.data.games.filter(g => g.id !== gameId);
    if (this.data.games.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- User XP Record ---
  public getUserXp(userId: string, displayName?: string): UserXPRecord {
    if (!this.data.userXp[userId]) {
      this.data.userXp[userId] = {
        userId,
        displayName: displayName || `مستخدم_${userId.substring(0, 5)}`,
        totalXp: 0,
        level: 1,
        seasonXp: {},
        dailyXp: {},
        dailyGameAttempts: {},
        dailyLogin: {},
        dailyProductBrowsingXp: {},
        dailyProductReviewXp: {},
        dailyChallengeProgress: {},
        updatedAt: new Date().toISOString(),
      };
      this.save();
    } else if (displayName && this.data.userXp[userId].displayName !== displayName && !this.data.userXp[userId].displayName.startsWith('مستخدم_')) {
      this.data.userXp[userId].displayName = displayName;
    }
    return this.data.userXp[userId];
  }

  // --- Central XP Award Method ---
  public awardXp(params: {
    userId: string;
    sourceType: 'GAME' | 'DAILY_LOGIN' | 'PRODUCT_VIEW' | 'PRODUCT_REVIEW' | 'PRODUCT_RATING' | 'DAILY_CHALLENGE' | 'OTHER_ALLOWED_ACTIVITY';
    sourceId: string;
    amount: number;
    metadata?: any;
    displayName?: string;
    ip?: string;
    userAgent?: string;
  }): {
    success: boolean;
    xpAwarded: number;
    totalXp: number;
    level: number;
    capReached: boolean;
    message: string;
  } {
    const { userId, sourceType, sourceId, amount, metadata, displayName, ip, userAgent } = params;
    const userRec = this.getUserXp(userId, displayName);
    const activeSeason = this.getActiveSeason();
    const today = this.getTodayKey();
    const rules = this.getXpRules();

    if (amount <= 0) {
      return { success: false, xpAwarded: 0, totalXp: userRec.totalXp, level: userRec.level, capReached: false, message: 'مقدار XP غير صالح' };
    }

    // Daily XP Cap Check
    const earnedToday = userRec.dailyXp[today] || 0;
    if (earnedToday >= rules.dailyXpCap) {
      this.logAudit({
        userId,
        activity: `حاول كسب XP (${amount}) لتجاوز الحد اليومي (${earnedToday}/${rules.dailyXpCap})`,
        source: sourceType,
        xp: 0,
        validationStatus: 'CAP_EXCEEDED',
        reason: 'Daily XP cap reached',
        ip,
        userAgent,
      });
      return {
        success: false,
        xpAwarded: 0,
        totalXp: userRec.totalXp,
        level: userRec.level,
        capReached: true,
        message: 'وصلت إلى الحد اليومي من XP، ارجع بكرة وكمل.',
      };
    }

    // Calculate actual allowed XP based on cap
    const allowedAmount = Math.min(amount, rules.dailyXpCap - earnedToday);
    const capReached = (earnedToday + allowedAmount) >= rules.dailyXpCap;

    userRec.totalXp += allowedAmount;
    userRec.seasonXp[activeSeason.id] = (userRec.seasonXp[activeSeason.id] || 0) + allowedAmount;
    userRec.dailyXp[today] = earnedToday + allowedAmount;
    userRec.level = calculateLevel(userRec.totalXp);
    userRec.updatedAt = new Date().toISOString();

    // Transaction Record
    const tx: XpTransaction = {
      id: `xp_tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      seasonId: activeSeason.id,
      sourceType,
      sourceId,
      amount: allowedAmount,
      timestamp: new Date().toISOString(),
      metadata,
      validationStatus: 'VALID',
    };
    this.data.xpTransactions.unshift(tx);

    this.logAudit({
      userId,
      activity: `تم كسب +${allowedAmount} XP من المصدر ${sourceType}:${sourceId}`,
      source: sourceType,
      xp: allowedAmount,
      validationStatus: 'VALID',
      reason: 'Server verified XP award',
      ip,
      userAgent,
    });

    this.save();

    return {
      success: true,
      xpAwarded: allowedAmount,
      totalXp: userRec.totalXp,
      level: userRec.level,
      capReached,
      message: `مبروك! حصلت على +${allowedAmount} XP`,
    };
  }

  // --- Activity Processors ---
  public processDailyLogin(userId: string, displayName?: string, ip?: string, userAgent?: string) {
    const today = this.getTodayKey();
    const userRec = this.getUserXp(userId, displayName);

    if (userRec.dailyLogin[today]) {
      return { success: false, isAlreadyClaimed: true, message: 'لقد حصلت على XP الدخول اليومي بالفعل اليوم' };
    }

    const rules = this.getXpRules();
    userRec.dailyLogin[today] = true;
    this.save();

    const award = this.awardXp({
      userId,
      sourceType: 'DAILY_LOGIN',
      sourceId: `login_${today}`,
      amount: rules.dailyLoginXp,
      displayName,
      ip,
      userAgent,
    });

    this.updateDailyChallengeProgress(userId, 'c_login');
    return { ...award, isAlreadyClaimed: false };
  }

  public processGamePlay(params: {
    userId: string;
    gameId: string;
    actionResult?: any;
    displayName?: string;
    ip?: string;
    userAgent?: string;
  }) {
    const { userId, gameId, actionResult, displayName, ip, userAgent } = params;
    const game = this.getGameById(gameId);
    if (!game || !game.enabled) {
      return { success: false, error: 'اللعبة غير مفعّلة حالياً' };
    }

    const activeSeason = this.getActiveSeason();
    if (activeSeason.status === 'completed' || activeSeason.isLocked) {
      return { success: false, error: 'الموسم المنتهي لا يقبل إضافة XP' };
    }

    const today = this.getTodayKey();
    const userRec = this.getUserXp(userId, displayName);
    const rules = this.getXpRules();

    if (!userRec.dailyGameAttempts[today]) {
      userRec.dailyGameAttempts[today] = {};
    }

    const gameAttempts = userRec.dailyGameAttempts[today][gameId] || 0;
    const totalGameAttemptsToday = Object.values(userRec.dailyGameAttempts[today]).reduce((a, b) => a + b, 0);

    if (gameAttempts >= game.dailyAttemptsLimit) {
      return { success: false, error: `وصلت للحد الأقصى اليومي لهذه اللعبة (${game.dailyAttemptsLimit} محاولات)` };
    }

    if (totalGameAttemptsToday >= rules.globalDailyGameAttempts) {
      return { success: false, error: `وصلت للحد اليومي العام لجميع الألعاب (${rules.globalDailyGameAttempts} محاولات)` };
    }

    // Increment attempt count
    userRec.dailyGameAttempts[today][gameId] = gameAttempts + 1;
    this.save();

    // Server-side authoritative XP calculation
    const xpAmount = game.xpPerAction || 100;

    const award = this.awardXp({
      userId,
      sourceType: 'GAME',
      sourceId: gameId,
      amount: xpAmount,
      metadata: actionResult,
      displayName,
      ip,
      userAgent,
    });

    this.updateDailyChallengeProgress(userId, 'c_game');

    return {
      ...award,
      game,
      remainingAttemptsThisGame: game.dailyAttemptsLimit - (gameAttempts + 1),
      remainingAttemptsGlobal: rules.globalDailyGameAttempts - (totalGameAttemptsToday + 1),
    };
  }

  public processProductView(userId: string, productId: string, displayName?: string, ip?: string, userAgent?: string) {
    const today = this.getTodayKey();
    const userRec = this.getUserXp(userId, displayName);
    const rules = this.getXpRules();

    // Idempotency check: check if already viewed this specific product today
    const alreadyViewedToday = this.data.xpTransactions.some(
      t => t.userId === userId && t.sourceType === 'PRODUCT_VIEW' && t.sourceId === productId && t.timestamp.startsWith(today)
    );
    if (alreadyViewedToday) {
      return { success: true, alreadyViewed: true, xpAwarded: 0, message: 'تم احتساب نقاط هذا المنتج سابقاً اليوم' };
    }

    const currentBrowsingXp = userRec.dailyProductBrowsingXp[today] || 0;
    if (currentBrowsingXp >= rules.dailyProductBrowsingCap) {
      return { success: false, capReached: true, message: 'وصلت إلى الحد اليومي من XP تصفح المنتجات (100 XP)' };
    }

    const awardAmount = Math.min(rules.productViewXp, rules.dailyProductBrowsingCap - currentBrowsingXp);
    userRec.dailyProductBrowsingXp[today] = currentBrowsingXp + awardAmount;
    this.save();

    const award = this.awardXp({
      userId,
      sourceType: 'PRODUCT_VIEW',
      sourceId: productId,
      amount: awardAmount,
      displayName,
      ip,
      userAgent,
    });

    this.updateDailyChallengeProgress(userId, 'c_view');
    return award;
  }

  public processProductReview(params: {
    userId: string;
    productId: string;
    reviewId?: string;
    rating: number;
    comment: string;
    displayName?: string;
    ip?: string;
    userAgent?: string;
  }) {
    const { userId, productId, reviewId, rating, comment, displayName, ip, userAgent } = params;
    const rules = this.getXpRules();
    const today = this.getTodayKey();
    const userRec = this.getUserXp(userId, displayName);

    // 1. Min comment length check
    const cleanComment = (comment || '').trim();
    if (cleanComment.length < rules.reviewMinCommentLength) {
      return {
        success: false,
        error: `التعليق قصير جداً. يجب أن يحتوي على ${rules.reviewMinCommentLength} أسطر/أحرف على الأقل للحصول على XP.`,
      };
    }

    // 2. Idempotency: check if already received XP for reviewing this product
    const effectiveReviewId = reviewId || `rev_${productId}_${userId}`;
    const alreadyReviewed = this.data.xpTransactions.some(
      t => t.userId === userId && t.sourceType === 'PRODUCT_REVIEW' && (t.sourceId === effectiveReviewId || (t.metadata && t.metadata.productId === productId))
    );

    if (alreadyReviewed) {
      return {
        success: false,
        isAlreadyClaimed: true,
        error: 'لقد حصلت على 100 XP لتقييم هذا المنتج سابقاً!',
      };
    }

    userRec.dailyProductReviewXp[today] = {
      xp: rules.reviewXpAmount,
      reviewId: effectiveReviewId,
      productId,
    };
    this.save();

    const award = this.awardXp({
      userId,
      sourceType: 'PRODUCT_REVIEW',
      sourceId: effectiveReviewId,
      amount: rules.reviewXpAmount,
      metadata: { productId, rating, commentLength: cleanComment.length },
      displayName,
      ip,
      userAgent,
    });

    this.updateDailyChallengeProgress(userId, 'c_review');
    return award;
  }

  // --- Daily Challenges Progress ---
  private updateDailyChallengeProgress(userId: string, challengeId: string) {
    const today = this.getTodayKey();
    const userRec = this.getUserXp(userId);
    if (!userRec.dailyChallengeProgress[today]) {
      userRec.dailyChallengeProgress[today] = {};
    }

    userRec.dailyChallengeProgress[today][challengeId] = true;

    // Check if all 4 individual challenges completed -> award bonus c_all
    const individualIds = ['c_login', 'c_game', 'c_view', 'c_review'];
    const allDone = individualIds.every(id => userRec.dailyChallengeProgress[today][id]);

    if (allDone && !userRec.dailyChallengeProgress[today]['c_all']) {
      userRec.dailyChallengeProgress[today]['c_all'] = true;
      const allChallenge = this.data.dailyChallenges.find(c => c.id === 'c_all');
      if (allChallenge && allChallenge.enabled) {
        this.awardXp({
          userId,
          sourceType: 'DAILY_CHALLENGE',
          sourceId: 'c_all',
          amount: allChallenge.xpReward,
        });
      }
    }
    this.save();
  }

  public getDailyChallengesStatus(userId: string): {
    challenges: Array<DailyChallengeConfig & { completed: boolean }>;
    allCompleted: boolean;
  } {
    const today = this.getTodayKey();
    const userRec = this.getUserXp(userId);
    const progressMap = userRec.dailyChallengeProgress[today] || {};

    const challenges = this.data.dailyChallenges.map(c => ({
      ...c,
      completed: Boolean(progressMap[c.id]),
    }));

    const allCompleted = Boolean(progressMap['c_all']);
    return { challenges, allCompleted };
  }

  // --- Leaderboard ---
  public getLeaderboard(seasonId?: string, limit = 50): LeaderboardUserEntry[] {
    const targetSeason = seasonId ? this.data.seasons.find(s => s.id === seasonId) : this.getActiveSeason();
    const sId = targetSeason ? targetSeason.id : 'season_1';

    const usersList = Object.values(this.data.userXp);

    // Sort by Season XP descending, then updatedAt ascending (earliest timestamp)
    usersList.sort((a, b) => {
      const xpA = a.seasonXp[sId] || 0;
      const xpB = b.seasonXp[sId] || 0;
      if (xpB !== xpA) return xpB - xpA;
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    });

    return usersList.slice(0, limit).map((u, idx) => ({
      rank: idx + 1,
      displayName: u.displayName || `مستخدم_${u.userId.substring(0, 5)}`,
      level: calculateLevel(u.totalXp),
      seasonXp: u.seasonXp[sId] || 0,
      userId: u.userId,
    }));
  }

  public getUserRankInfo(userId: string, seasonId?: string): {
    rank: number;
    seasonXp: number;
    totalXp: number;
    level: number;
    xpToNextRank: number | null;
  } {
    const targetSeason = seasonId ? this.data.seasons.find(s => s.id === seasonId) : this.getActiveSeason();
    const sId = targetSeason ? targetSeason.id : 'season_1';

    const fullList = this.getLeaderboard(sId, 1000);
    const userIndex = fullList.findIndex(e => e.userId === userId);

    const userRec = this.getUserXp(userId);
    const currentSeasonXp = userRec.seasonXp[sId] || 0;

    if (userIndex === -1) {
      return {
        rank: fullList.length + 1,
        seasonXp: currentSeasonXp,
        totalXp: userRec.totalXp,
        level: userRec.level,
        xpToNextRank: fullList.length > 0 ? (fullList[fullList.length - 1].seasonXp - currentSeasonXp + 10) : null,
      };
    }

    const rank = userIndex + 1;
    let xpToNextRank: number | null = null;
    if (userIndex > 0) {
      const prevUser = fullList[userIndex - 1];
      xpToNextRank = Math.max(10, prevUser.seasonXp - currentSeasonXp + 10);
    }

    return {
      rank,
      seasonXp: currentSeasonXp,
      totalXp: userRec.totalXp,
      level: userRec.level,
      xpToNextRank,
    };
  }

  // --- Winners for Admin ---
  public getSeasonWinnersWithContact(seasonId: string, limit = 3): Array<{
    rank: number;
    userId: string;
    displayName: string;
    email?: string;
    phone?: string;
    xp: number;
    level: number;
  }> {
    const leaderboard = this.getLeaderboard(seasonId, limit);
    const users = db.getOrders(); // or check user profile store

    return leaderboard.map(item => {
      const order = users.find(o => o.customerName === item.displayName);
      return {
        rank: item.rank,
        userId: item.userId,
        displayName: item.displayName,
        email: order?.customerEmail || `user_${item.userId.substring(0, 5)}@maktaba.kw`,
        phone: order?.customerPhone || '96590000000',
        xp: item.seasonXp,
        level: item.level,
      };
    });
  }

  // --- Audit Logs ---
  private logAudit(entry: Partial<ActivityAuditLog>) {
    const log: ActivityAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: entry.userId || 'guest',
      activity: entry.activity || 'نشاط غير محدد',
      source: entry.source || 'SYSTEM',
      xp: entry.xp || 0,
      date: new Date().toISOString(),
      validationStatus: entry.validationStatus || 'VALID',
      reason: entry.reason || '',
      ip: entry.ip,
      userAgent: entry.userAgent,
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
  }

  public getAuditLogs(): ActivityAuditLog[] {
    return this.data.auditLogs;
  }

  // --- Overview Stats for Admin Dashboard ---
  public getOverviewStats(): GamificationOverviewStats {
    const today = this.getTodayKey();
    const allUsers = Object.values(this.data.userXp);

    const dailyActivePlayers = allUsers.filter(u => u.dailyXp[today] && u.dailyXp[today] > 0).length;
    const gamesPlayedTotal = this.data.xpTransactions.filter(t => t.sourceType === 'GAME').length;
    const xpEarnedTotal = allUsers.reduce((sum, u) => sum + u.totalXp, 0);
    const reviewsSubmittedTotal = this.data.xpTransactions.filter(t => t.sourceType === 'PRODUCT_REVIEW').length;
    const xpFromReviewsTotal = this.data.xpTransactions.filter(t => t.sourceType === 'PRODUCT_REVIEW').reduce((s, t) => s + t.amount, 0);
    const productViewsFromGamification = this.data.xpTransactions.filter(t => t.sourceType === 'PRODUCT_VIEW').length;
    const dailyChallengeCompletions = this.data.xpTransactions.filter(t => t.sourceType === 'DAILY_CHALLENGE').length;

    // Top games by plays
    const gamePlaysMap: Record<string, number> = {};
    this.data.xpTransactions.filter(t => t.sourceType === 'GAME').forEach(t => {
      gamePlaysMap[t.sourceId] = (gamePlaysMap[t.sourceId] || 0) + 1;
    });

    const topGames = this.data.games.map(g => ({
      gameId: g.id,
      nameAr: g.nameAr,
      nameEn: g.nameEn,
      plays: gamePlaysMap[g.id] || 0,
    })).sort((a, b) => b.plays - a.plays);

    const userCount = Math.max(1, allUsers.length);

    return {
      dailyActivePlayers,
      gamesPlayedTotal,
      xpEarnedTotal,
      reviewsSubmittedTotal,
      xpFromReviewsTotal,
      productViewsFromGamification,
      dailyChallengeCompletions,
      leaderboardUsersCount: allUsers.length,
      seasonParticipationCount: allUsers.filter(u => Object.keys(u.seasonXp).length > 0).length,
      topGames,
      averageGamesPerUser: Number((gamesPlayedTotal / userCount).toFixed(1)),
      averageXpPerUser: Math.round(xpEarnedTotal / userCount),
    };
  }

  // --- Compatibility Helper Methods for DB User Profiles & Wallets ---
  public getUserProfile(userId: string, displayName?: string): UserProfile {
    const userXp = this.getUserXp(userId, displayName);
    const raw = (db as any).data;
    const cred = Object.values(raw.userCredentials || {}).find((c: any) => c.userId === userId) as any;
    const nowIso = new Date().toISOString();
    const totalGamePlays = Object.values(userXp.dailyGameAttempts || {}).reduce(
      (sum, day) => sum + Object.values(day).reduce((s, n) => s + n, 0),
      0
    );
    return {
      id: userId,
      email: cred?.email || '',
      displayName: displayName || cred?.displayName || userXp.displayName || 'عميل المتجر',
      phone: cred?.phone || '',
      role: cred?.role || 'user',
      xp: userXp.totalXp,
      currentTier: `المستوى ${userXp.level}`,
      challengesPlayed: totalGamePlays,
      challengesCompleted: totalGamePlays,
      correctAnswersCount: 0,
      wrongAnswersCount: 0,
      totalRewardsEarnedKwd: 0,
      totalRewardsUsedKwd: 0,
      dailyAttemptsDate: this.getTodayKey(),
      dailyAttemptsUsed: 0,
      unlockedAchievementIds: [],
      createdAt: userXp.updatedAt || nowIso,
      updatedAt: userXp.updatedAt || nowIso,
    };
  }

  public getUserWallet(userId: string): UserWallet {
    const raw = (db as any).data;
    if (!raw.wallets) raw.wallets = {};
    if (!raw.wallets[userId]) {
      raw.wallets[userId] = {
        userId,
        activeBalance: 0,
        usedBalance: 0,
        expiredBalance: 0,
        totalEarned: 0,
        items: [],
        transactions: [],
        lastUpdated: new Date().toISOString(),
      };
      db.save();
    }
    return raw.wallets[userId];
  }

  public addWalletReward(userId: string, amount: number, source: any, refId?: string, description?: string, txId?: string): any {
    const wallet = this.getUserWallet(userId);
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return null;

    const id = txId || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Idempotency check: if transaction with this id already processed, return existing
    const existingTx = wallet.transactions.find(t => t.id === id);
    if (existingTx) {
      return existingTx;
    }

    wallet.activeBalance = Number((wallet.activeBalance + numAmount).toFixed(3));
    wallet.totalEarned = Number((wallet.totalEarned + numAmount).toFixed(3));
    const now = new Date().toISOString();
    const tx = {
      id,
      userId,
      type: 'credit' as const,
      amount: Number(numAmount.toFixed(3)),
      balanceAfter: wallet.activeBalance,
      description: description || `إيداع رصيد محفظة (${source})`,
      createdAt: now,
    };
    wallet.transactions.unshift(tx);
    wallet.lastUpdated = now;
    db.save();
    return tx;
  }

  public deductWalletBalance(userId: string, amount: number, reason: string, txId?: string): { success: boolean; transaction?: any; error?: string } {
    const wallet = this.getUserWallet(userId);
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, error: 'المبلغ غير صالح للخصم' };
    }
    if (wallet.activeBalance < numAmount) {
      return { success: false, error: 'رصيد المحفظة غير كافٍ' };
    }

    const id = txId || `tx_ded_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const existingTx = wallet.transactions.find(t => t.id === id);
    if (existingTx) {
      return { success: true, transaction: existingTx };
    }

    wallet.activeBalance = Number((wallet.activeBalance - numAmount).toFixed(3));
    wallet.usedBalance = Number((wallet.usedBalance + numAmount).toFixed(3));
    const now = new Date().toISOString();
    const tx = {
      id,
      userId,
      type: 'debit' as const,
      amount: Number(numAmount.toFixed(3)),
      balanceAfter: wallet.activeBalance,
      description: reason || 'خصم رصيد من المحفظة',
      createdAt: now,
    };
    wallet.transactions.unshift(tx);
    wallet.lastUpdated = now;
    db.save();
    return { success: true, transaction: tx };
  }

  public updateUserProfile(userId: string, updates: any): UserProfile {
    const profile = this.getUserProfile(userId);
    const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() };
    if (updates.displayName) {
      const userXp = this.getUserXp(userId, updates.displayName);
      userXp.displayName = updates.displayName;
      this.save();
    }
    return updated;
  }

  public checkAccountByEmail(email: string): { exists: boolean; profile?: UserProfile } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const raw = (db as any).data;
    const cred = raw.userCredentials?.[cleanEmail] as any;
    if (cred) {
      const profile = this.getUserProfile(cred.userId, cred.displayName);
      return { exists: true, profile };
    }
    return { exists: false };
  }

  public syncUserProfile(userId: string, data: any, _ip?: string, _userAgent?: string): { profile: UserProfile; wallet: UserWallet } {
    const profile = this.getUserProfile(userId, data?.displayName);
    const wallet = this.getUserWallet(userId);
    return { profile, wallet };
  }

  public getSettings(): any {
    return {
      isEnabled: true,
      questionsPerChallenge: 10,
      timePerQuestionSeconds: 15,
      dailyAttemptsLimit: 3,
      rewardExpiryHours: 0,
      maxWalletUsagePercent: 50,
      autoShowChallengeOnEntry: false,
      autoShowFrequency: 'once_per_session',
      enableAchievements: true,
      enableLeaderboard: true,
      walletMinTopup: 5.0,
      walletMaxBalance: 100.0,
      tiers: [],
    };
  }

  public updateSettings(_settings: any): any {
    return this.getSettings();
  }

  public getQuestions(): any[] {
    return [];
  }

  public upsertQuestion(question: any): any {
    return question;
  }

  public deleteQuestion(_id: string): boolean {
    return true;
  }

  public getActiveSessionForUser(_userId: string): any {
    return { activeSession: null };
  }

  public startChallengeSession(_userId: string, _displayName?: string): any {
    return { success: false, error: 'تم استبدال نظام الألعاب القديم بنظام نقاط XP والمواسم.' };
  }

  public submitAnswer(..._args: any[]): any {
    return { success: false, error: 'تم استبدال نظام الألعاب القديم بنظام نقاط XP والمواسم.' };
  }

  public cancelChallengeSession(..._args: any[]): void {}

  public logSecurityEvent(event: any): void {
    this.logAudit({
      userId: event.userId || 'system',
      activity: event.action || 'SECURITY_EVENT',
      source: 'SECURITY',
      xp: event.reward || 0,
      reason: event.details || '',
      ip: event.ip,
      userAgent: event.userAgent,
    });
  }

  public getSecurityLogs(_userId?: string): any[] {
    return this.data.auditLogs.map(l => ({
      id: `sec_${l.id}`,
      userId: l.userId,
      ip: l.ip || '127.0.0.1',
      userAgent: l.userAgent || '',
      action: l.activity,
      result: l.validationStatus,
      details: l.reason,
      createdAt: l.date,
    }));
  }

  public getSecurityEvents(): any[] {
    return this.getSecurityLogs();
  }

  public getAllUsersSummary(): any[] {
    return Object.values(this.data.userXp).map(u => {
      const wallet = this.getUserWallet(u.userId);
      const totalPlays = Object.values(u.dailyGameAttempts || {}).reduce(
        (sum, day) => sum + Object.values(day).reduce((s, n) => s + n, 0),
        0
      );
      return {
        userId: u.userId,
        displayName: u.displayName,
        totalXp: u.totalXp,
        level: u.level,
        activeWalletBalance: wallet.activeBalance,
        challengesPlayed: totalPlays,
        lastActive: u.updatedAt,
      };
    });
  }

  public getAllUsers(): any[] {
    return this.getAllUsersSummary();
  }

  public getUserAdminDetail(userId: string): any {
    const profile = this.getUserProfile(userId);
    const wallet = this.getUserWallet(userId);
    const userXp = this.getUserXp(userId);
    return {
      profile,
      wallet,
      userXp,
      history: this.data.xpTransactions.filter(t => t.userId === userId),
    };
  }

  public getUserDetail(userId: string): any {
    return this.getUserAdminDetail(userId);
  }

  public getGamificationStats(): any {
    const overview = this.getOverviewStats();
    return {
      totalParticipants: overview.leaderboardUsersCount,
      totalGamesPlayed: overview.gamesPlayedTotal,
      totalXpGranted: overview.xpEarnedTotal,
      activeSeasonPlayers: overview.seasonParticipationCount,
    };
  }
}

export const gamificationEngine = new GamificationEngine();
