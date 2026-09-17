import { CartItem, Product } from './types';

export type VisualPuzzleType =
  | 'visual_difference'
  | 'silhouette_match'
  | 'pattern_completion'
  | 'fast_pattern_count'
  | 'shape_sorting'
  | 'visual_memory'
  | 'missing_puzzle_piece'
  | 'one_stroke_maze'
  | 'order_sequence'
  | 'reaction_speed';

export interface VisualPuzzle {
  id: string;
  gameId?: string;
  type: VisualPuzzleType;
  title: string;
  prompt: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  timeLimitSeconds?: number;
  // Options & Content
  options: {
    id: string;
    label?: string;
    svgContent?: string;
    imageUrl?: string;
    meta?: any;
  }[];
  correctAnswerIndex: number;
  mainVisual?: {
    svgContent?: string;
    imageUrl?: string;
    gridItems?: any[];
    promptDetails?: string;
    memoryCards?: { id: string; front: string; back: string }[];
    sequenceItems?: any[];
    mazePath?: string;
    targetSpeedMs?: number;
  };
  explanation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GameConfig {
  id: string;
  type: VisualPuzzleType;
  title: string;
  description: string;
  icon: string;
  bannerImage?: string;
  enabled: boolean;
  displayOrder: number;
  placement: 'all' | 'home' | 'cart' | 'dedicated';
  timerSeconds: number; // e.g. 5, 8, 10, 15, 30
  questionsPerRound: number; // e.g. 3, 4, 5, 7
  dailyAttemptsLimit: number; // e.g. 1, 2, 3, 5, 10
  rewardType: 'discount_coupon' | 'kwd_wallet' | 'discount_wheel' | 'xp_only' | 'free_cart';
  rewardAmount: number; // in KWD e.g. 0.500 or 100% cart
  rewardXp: number; // e.g. 50
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  optionsCount: number; // 2 to 4
  autoAdvanceOnTimeout: boolean;
  cooldownMinutes: number;
  minCartValue: number;
  maxCartValue: number;
  minUserLevel: string; // e.g. 'المستوى البرونزي'
  allowNewUsers: boolean;
  allowRegularUsers: boolean;
  allowVipUsers: boolean;
  startDate?: string | null;
  endDate?: string | null;
  activeDays?: number[]; // 0-6
  activeHours?: { start: number; end: number } | null;
  maxDailyWinners: number;
  targetWinRate: number;
  winMessage: string;
  lossMessage: string;
  timeoutMessage: string;
}

export interface TickerSettings {
  enabled: boolean;
  speed: 'slow' | 'normal' | 'fast';
  intervalSeconds: number;
  bgColor: string;
  textColor: string;
  accentColor: string;
  position: 'top' | 'header' | 'bottom';
  demoMode: boolean; // include sample verified winner notifications if recent winners < 5
  customItems: string[];
}

export interface FreeChallengeSettings {
  gameEnabled: boolean;
  maxCartValue: number; // in KWD, e.g. 15.000 KWD
  puzzlesPerChallenge: number; // e.g. 4 or 5
  puzzleDurationSeconds: number; // e.g. 8 to 10 seconds
  dailyAttemptsLimit: number; // e.g. 2 attempts per user per day
  rewardPerCorrectAnswer?: number; // e.g. 0.250 KWD per correct answer (dynamic)
  wheelEligibilityThreshold?: number; // e.g. 0.500 KWD threshold to earn fortune wheel
  challengeDiscountEnabled: boolean;
  challengeWinDiscountPercentage: number; // e.g. 25 for 25% discount coupon on full win
  shippingPolicy: 'standard';
  discountWheelEnabled: boolean;
  discountWheelValues: number[]; // e.g. [5, 10, 15, 20, 25]
  wheelProbabilities?: Record<number, number>; // e.g. { 5: 40, 10: 30, 15: 20, 20: 8, 25: 2 }
  discountDurationMinutes: number; // e.g. 10 minutes
  mysteryBoxEnabled: boolean;
  askFriendEnabled: boolean;
  referralEnabled: boolean;
  duelEnabled: boolean;
  flashChallengeEnabled: boolean;
  flashChallengeMultiplier: number;
  flashChallengeActive: boolean;
  flashChallengeEndAt?: string;
  adsEnabled: boolean;
  adProvider: 'simulated_web' | 'admob' | 'unity';
  liveWinnersTickerEnabled: boolean;
  tickerSettings?: TickerSettings;
  targetWinRate: number; // for analytics display
}

export interface CartSnapshot {
  snapshotId: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  createdAt: string;
}

export interface PuzzleSessionState {
  puzzleId: string;
  startedAt: string;
  expiresAt: string;
  answeredAt?: string;
  selectedIndex?: number;
  isCorrect?: boolean;
  timeTakenSeconds?: number;
  shuffledOptionsIndices?: number[]; // maps client display index to original puzzle option index
  shuffledOptionsForClient?: any[];
}

export interface FreeChallengeSession {
  sessionId: string;
  sessionToken: string;
  userId: string;
  displayName: string;
  startedAt: string;
  expiresAt: string;
  status: 'active' | 'won' | 'lost' | 'timeout' | 'expired' | 'cancelled';
  cartSnapshot: CartSnapshot | null;
  puzzleIds: string[];
  currentPuzzleIndex: number;
  puzzleStates: Record<string, PuzzleSessionState>;
  mode: 'challenge' | 'mystery_box' | 'duel' | 'practice';
  mysteryBoxDetails?: {
    categoryId: string;
    categoryName: string;
    product: Product;
  };
  duelId?: string;
  result?: {
    won: boolean;
    completedCount: number;
    totalPuzzles: number;
    totalTimeSeconds: number;
    rewardAmount?: number;
    newWalletBalance?: number;
    discountCoupon?: {
      couponCode: string;
      discountPercentage: number;
      expiresAt: string;
      token: string;
    };
    discountWon?: {
      percentage: number;
      token: string;
      couponCode?: string;
      expiresAt: string;
      spunAt: string;
    };
  };
  securityData: {
    ip?: string;
    userAgent?: string;
    tabSwitchesCount: number;
    visibilityHiddenSeconds: number;
    events: string[];
  };
}

export interface FreeChallengeSecurityLog {
  id: string;
  timestamp: string;
  userId: string;
  sessionId?: string;
  eventType:
    | 'INVALID_ANSWER'
    | 'EXPIRED_SESSION'
    | 'TIMEOUT'
    | 'DUPLICATE_SUBMISSION'
    | 'RATE_LIMIT'
    | 'VISIBILITY_CHANGE'
    | 'CART_TAMPERING'
    | 'VOUCHER_TAMPERING'
    | 'REPLAY_ATTEMPT'
    | 'UNAUTHORIZED_ACCESS';
  details: string;
  severity: 'info' | 'warning' | 'danger';
  ip?: string;
}

export interface RecentWinner {
  id: string;
  userName: string;
  rewardTitle: string;
  rewardType: 'discount_coupon' | 'discount_wheel' | 'mystery_box' | 'duel' | 'free_cart';
  discountPercentage?: number;
  amountKwd?: number;
  timestamp: string;
}

export interface DuelMatch {
  id: string;
  duelCode: string;
  creatorUserId: string;
  creatorName: string;
  creatorScore: number;
  creatorTimeSeconds: number;
  creatorCompleted: boolean;
  opponentUserId?: string;
  opponentName?: string;
  opponentScore?: number;
  opponentTimeSeconds?: number;
  opponentCompleted?: boolean;
  status: 'waiting' | 'in_progress' | 'completed' | 'expired';
  winnerUserId?: string;
  puzzleIds: string[];
  createdAt: string;
  expiresAt: string;
}

export interface ReferralRecord {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  referredName: string;
  bonusType: 'extra_time' | 'extra_attempt';
  bonusValue: number; // e.g. +5 seconds
  claimed: boolean;
  createdAt: string;
}

export interface FreeChallengeAnalytics {
  totalChallengesStarted: number;
  totalWon: number;
  totalLost: number;
  totalTimeouts: number;
  winRatePercentage: number;
  freeOrdersCount: number;
  discountOrdersCount: number;
  averageChallengeDurationSeconds: number;
  averagePuzzleSeconds: number;
  mysteryBoxOpensCount: number;
  duelsCount: number;
  referralsCount: number;
  adCompletionsCount: number;
}
