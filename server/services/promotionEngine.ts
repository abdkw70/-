export interface PromotionCalculationInput {
  productsSubtotal: number;
  shippingFee: number;
  coupon: {
    code: string;
    discountType: 'percentage' | 'fixed' | 'fixed_amount' | 'free_shipping';
    discountValue: number;
    minProductsValue?: number | null;
    minOrderAmount?: number | null;
    minSubtotal?: number | null;
    maxDiscountAmount?: number | null;
    maxDiscount?: number | null;
    enableMaxDiscount?: boolean;
    includeShipping?: boolean;
    isActive?: boolean;
    expiresAt?: string | null;
    usageLimit?: number | null;
    usageCount?: number;
    userId?: string | null;
  };
  userId?: string;
}

export interface PromotionCalculationResult {
  eligible: boolean;
  discountAmount: number;
  discountedProductsSubtotal: number;
  effectiveShippingFee: number;
  finalTotal: number;
  remainingForMin: number;
  reasonAr?: string;
  reasonEn?: string;
}

/**
 * Single Source of Truth Promotion & Discount Engine
 * Guarantees that discount applies EXCLUSIVELY to products subtotal
 * unless includeShipping is explicitly enabled.
 */
export function calculatePromotionDiscount(
  input: PromotionCalculationInput
): PromotionCalculationResult {
  const productsSubtotal = Number(Math.max(0, input.productsSubtotal || 0).toFixed(3));
  const shippingFee = Number(Math.max(0, input.shippingFee || 0).toFixed(3));
  const c = input.coupon;

  // 1. Check Minimum Products Value (BEFORE discount)
  const minValRaw = c.minProductsValue ?? c.minOrderAmount ?? c.minSubtotal ?? 0;
  const minVal = Number(Math.max(0, minValRaw).toFixed(3));

  if (minVal > 0 && productsSubtotal < minVal) {
    const remaining = Number((minVal - productsSubtotal).toFixed(3));
    return {
      eligible: false,
      discountAmount: 0,
      discountedProductsSubtotal: productsSubtotal,
      effectiveShippingFee: shippingFee,
      finalTotal: Number((productsSubtotal + shippingFee).toFixed(3)),
      remainingForMin: remaining,
      reasonAr: `أضف ${remaining.toFixed(3)} د.ك من المنتجات لتفعيل الخصم.`,
      reasonEn: `Add ${remaining.toFixed(3)} KWD more of products to activate discount.`,
    };
  }

  // 2. Base Discount Calculation
  let rawDiscount = 0;
  let effectiveShippingFee = shippingFee;

  const isPercentage = c.discountType === 'percentage';
  const isFreeShipping = c.discountType === 'free_shipping' || (c.code && c.code.toUpperCase() === 'FREE');

  if (isFreeShipping) {
    effectiveShippingFee = 0;
    rawDiscount = 0;
  } else if (isPercentage) {
    rawDiscount = (productsSubtotal * (c.discountValue || 0)) / 100;
  } else {
    // Fixed amount
    rawDiscount = c.discountValue || 0;
  }

  // 3. Cap Maximum Discount Ceiling (if set)
  let maxCap: number | null = null;
  if (typeof c.maxDiscountAmount === 'number' && c.maxDiscountAmount > 0) {
    maxCap = c.maxDiscountAmount;
  } else if (c.enableMaxDiscount && typeof c.maxDiscount === 'number' && c.maxDiscount > 0) {
    maxCap = c.maxDiscount;
  }

  if (maxCap !== null && maxCap > 0 && rawDiscount > maxCap) {
    rawDiscount = maxCap;
  }

  // 4. Products vs Shipping Discount Boundaries
  let finalDiscountAmount = 0;
  let discountedProductsSubtotal = productsSubtotal;

  const includeShipping = c.includeShipping === true;

  if (!includeShipping) {
    // Discount applies EXCLUSIVELY to products subtotal (NEVER to shipping)
    finalDiscountAmount = Math.min(productsSubtotal, Math.max(0, rawDiscount));
    finalDiscountAmount = Number(finalDiscountAmount.toFixed(3));
    discountedProductsSubtotal = Number((productsSubtotal - finalDiscountAmount).toFixed(3));
    effectiveShippingFee = shippingFee;
  } else {
    // Discount is allowed to cover shipping fee if enabled
    const maxTotalDiscount = productsSubtotal + shippingFee;
    finalDiscountAmount = Math.min(maxTotalDiscount, Math.max(0, rawDiscount));
    finalDiscountAmount = Number(finalDiscountAmount.toFixed(3));

    if (finalDiscountAmount <= productsSubtotal) {
      discountedProductsSubtotal = Number((productsSubtotal - finalDiscountAmount).toFixed(3));
      effectiveShippingFee = shippingFee;
    } else {
      discountedProductsSubtotal = 0;
      const leftoverDiscount = finalDiscountAmount - productsSubtotal;
      effectiveShippingFee = Number(Math.max(0, shippingFee - leftoverDiscount).toFixed(3));
    }
  }

  const finalTotal = Number((discountedProductsSubtotal + effectiveShippingFee).toFixed(3));

  return {
    eligible: true,
    discountAmount: finalDiscountAmount,
    discountedProductsSubtotal,
    effectiveShippingFee,
    finalTotal,
    remainingForMin: 0,
    reasonAr: isFreeShipping
      ? 'تم تفعيل التوصيل المجاني بنجاح!'
      : `تم تطبيق خصم ${finalDiscountAmount.toFixed(3)} د.ك بنجاح!`,
    reasonEn: isFreeShipping
      ? 'Free shipping applied successfully!'
      : `Applied ${finalDiscountAmount.toFixed(3)} KWD discount successfully!`,
  };
}
