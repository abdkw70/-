import React, { useState } from 'react';
import { Trophy, Wallet, Sparkles, CheckCircle, ArrowLeft, ArrowRight, ShoppingBag, Share2, Coins, Ticket, Copy, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useGamification } from '../../context/GamificationContext';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  voucherCode?: string;
  discountCoupon?: {
    couponCode: string;
    discountPercentage: number;
    token?: string;
    expiresAt?: string;
    rewardAmountKwd?: number;
  };
  cartSnapshotSubtotal?: number;
  mysteryProduct?: any;
  rewardAmount?: number;
  newWalletBalance?: number;
  onGoToCheckout: () => void;
  onClose: () => void;
}

export const FreeChallengeWinModal: React.FC<Props> = ({
  voucherCode,
  discountCoupon,
  rewardAmount = 1.0,
  newWalletBalance,
  onGoToCheckout,
  onClose,
}) => {
  const { wallet } = useGamification();
  const { applyCoupon } = useCart();
  const { dir, isRtl, language, t, formatPrice, storeName } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const finalCouponCode = discountCoupon?.couponCode || voucherCode || 'CHALLENGE-WIN';
  const discountPercent = discountCoupon?.discountPercentage || 25;
  const cashReward = discountCoupon?.rewardAmountKwd ?? rewardAmount;

  const displayBalance = typeof newWalletBalance === 'number' 
    ? newWalletBalance 
    : (wallet?.activeBalance ?? cashReward);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(finalCouponCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleApplyAndCheckout = async () => {
    if (finalCouponCode) {
      await applyCoupon(finalCouponCode);
    }
    onGoToCheckout();
  };

  const handleShare = () => {
    const title = isRtl
      ? `فزت بتحدي الألعاب والجوائز في ${storeName}!`
      : `I won the gaming challenge at ${storeName}!`;
    const text = isRtl
      ? `لقد فزت بكوبون خصم ${discountPercent}% بالإضافة إلى رصيد محفظة ${formatPrice(cashReward)} في ${storeName}! العب واربح:`
      : `I won a ${discountPercent}% discount coupon plus ${formatPrice(cashReward)} wallet credit at ${storeName}! Play and win:`;

    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center text-center p-2 text-white" dir={dir}>
      {/* Top Confetti & Glow Icon */}
      <div className="relative my-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/50 animate-bounce">
          <Trophy className="w-10 h-10 text-slate-950" />
        </div>
        <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-300 animate-spin" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black mb-2">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>{isRtl ? 'فوز ساحق 100% - إجابات صحيحة بالكامل' : '100% Victory - All Answers Correct!'}</span>
      </div>

      <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 mb-2">
        {isRtl ? '🎉 ألف مبروك! فزت بجميع الألغاز!' : '🎉 Congratulations! You won all puzzles!'}
      </h3>

      <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-4 leading-relaxed">
        {isRtl
          ? 'أثبتت سرعتك وذكاءك البصري الفائق! حصلت على كوبون الخصم الذهبي بالإضافة إلى إيداع نقدي في محفظتك.'
          : 'You proved your sharp focus and visual speed! You unlocked the golden discount coupon plus a cash reward in your wallet.'}
      </p>

      {/* Golden Discount Coupon Box */}
      <div className={`w-full max-w-sm bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-950 border-2 border-amber-400/80 rounded-2xl p-4 shadow-2xl mb-4 relative overflow-hidden ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-amber-300 font-bold block">
                {isRtl ? 'كوبون الخصم الفوري' : 'Instant Discount Coupon'}
              </span>
              <span className="text-lg font-black text-amber-200">
                {isRtl ? `خصم ${discountPercent}% على طلبك` : `${discountPercent}% OFF your order`}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md">
            {isRtl ? 'جاهز للاستخدام' : 'Ready to use'}
          </span>
        </div>

        {/* Coupon Code Strip */}
        <div className="flex items-center justify-between bg-slate-950/90 border border-dashed border-amber-400/50 rounded-xl p-2.5 mb-3">
          <span className="font-mono font-black text-lg tracking-widest text-amber-300 select-all px-2">
            {finalCouponCode}
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>{isRtl ? 'تم النسخ!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isRtl ? 'نسخ الكود' : 'Copy Code'}</span>
              </>
            )}
          </button>
        </div>

        {/* Wallet Credit Sub-block */}
        <div className="flex items-center justify-between bg-slate-800/80 rounded-xl p-3 border border-slate-700/80">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">
              {isRtl ? 'مكافأة المحفظة النقدية:' : 'Wallet Cash Reward:'}
            </span>
          </div>
          <span className="text-sm font-black text-emerald-400 font-mono">
            +{formatPrice(cashReward)} ({isRtl ? 'الرصيد: ' : 'Balance: '} {formatPrice(displayBalance)})
          </span>
        </div>

        <p className="text-[11px] text-amber-200/80 text-center mt-3 font-medium">
          {isRtl
            ? '💡 يتم تطبيق كود الخصم فوراً عند الدفع، ويمكنك أيضاً استخدام رصيد محفظتك معاً!'
            : '💡 Discount code applies at checkout, and you can combine it with your wallet balance!'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleApplyAndCheckout}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Ticket className="w-5 h-5" />
          <span>{isRtl ? 'تطبيق الكوبون وإتمام الشراء الآن' : 'Apply Coupon & Checkout Now'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            window.location.href = '/wallet';
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700 cursor-pointer"
        >
          <Wallet className="w-4 h-4 text-amber-400" />
          <span>{isRtl ? 'استعراض رصيد المحفظة النقدية' : 'View Wallet Balance'}</span>
        </button>

        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {shareCopied
                ? (isRtl ? 'تم النسخ بنجاح!' : 'Copied!')
                : (isRtl ? 'مشاركة الإنجاز' : 'Share Victory')}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800 cursor-pointer"
          >
            {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            <span>{isRtl ? 'إغلاق' : 'Close'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
