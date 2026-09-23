import { calculatePromotionDiscount } from '../server/services/promotionEngine';
import { db } from '../server/db';

console.log('====================================================');
console.log('🧪 RUNNING DISCOUNTS & PROMOTIONS COMPREHENSIVE TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
    failedTests++;
  }
}

// --- TEST 1: Small order (0.150 KWD products + 2.000 KWD shipping) without min requirement ---
const t1 = calculatePromotionDiscount({
  productsSubtotal: 0.150,
  shippingFee: 2.000,
  coupon: {
    code: 'TEST1',
    discountType: 'fixed',
    discountValue: 0.150,
    includeShipping: false,
  },
});
assert(
  t1.discountAmount === 0.150 &&
  t1.effectiveShippingFee === 2.000 &&
  t1.finalTotal === 2.000,
  'TEST 1: Small order 0.150 KWD discount applies ONLY to products, leaving shipping 2.000 KWD intact'
);

// --- TEST 2: Subtotal < Minimum Products Value ---
const t2 = calculatePromotionDiscount({
  productsSubtotal: 0.150,
  shippingFee: 2.000,
  coupon: {
    code: 'MINTEST',
    discountType: 'percentage',
    discountValue: 15,
    minProductsValue: 5.000,
    includeShipping: false,
  },
});
assert(
  t2.eligible === false &&
  t2.discountAmount === 0 &&
  t2.remainingForMin === 4.850 &&
  t2.finalTotal === 2.150 &&
  t2.reasonAr?.includes('4.850'),
  'TEST 2: Subtotal below minimum order (0.150 < 5.000 KWD) rejects discount and outputs remaining 4.850 KWD'
);

// --- TEST 3: Subtotal >= Minimum Products Value ---
const t3 = calculatePromotionDiscount({
  productsSubtotal: 10.000,
  shippingFee: 2.000,
  coupon: {
    code: 'MINTEST',
    discountType: 'percentage',
    discountValue: 10,
    minProductsValue: 5.000,
    includeShipping: false,
  },
});
assert(
  t3.eligible === true &&
  t3.discountAmount === 1.000 &&
  t3.effectiveShippingFee === 2.000 &&
  t3.finalTotal === 11.000,
  'TEST 3: Subtotal above minimum order (10.000 >= 5.000 KWD) applies 10% discount (1.000 KWD) on products only'
);

// --- TEST 4: Subtotal exactly equal to Minimum Products Value ---
const t4 = calculatePromotionDiscount({
  productsSubtotal: 5.000,
  shippingFee: 2.000,
  coupon: {
    code: 'MINTEST',
    discountType: 'fixed',
    discountValue: 1.000,
    minProductsValue: 5.000,
    includeShipping: false,
  },
});
assert(
  t4.eligible === true &&
  t4.discountAmount === 1.000 &&
  t4.finalTotal === 6.000,
  'TEST 4: Subtotal exactly matching minimum order (5.000 KWD) successfully activates discount'
);

// --- TEST 5: Maximum Discount Ceiling ---
const t5 = calculatePromotionDiscount({
  productsSubtotal: 50.000,
  shippingFee: 2.000,
  coupon: {
    code: 'CAPTEST',
    discountType: 'percentage',
    discountValue: 20, // 20% of 50 = 10 KWD raw discount
    enableMaxDiscount: true,
    maxDiscount: 5.000, // Capped at 5 KWD
    includeShipping: false,
  },
});
assert(
  t5.eligible === true &&
  t5.discountAmount === 5.000 &&
  t5.finalTotal === 47.000,
  'TEST 5: Maximum discount ceiling caps 20% discount (10 KWD -> 5 KWD)'
);

// --- TEST 6: Fixed Amount Discount > Products Subtotal ---
const t6 = calculatePromotionDiscount({
  productsSubtotal: 2.000,
  shippingFee: 2.000,
  coupon: {
    code: 'BIGDISCOUNT',
    discountType: 'fixed',
    discountValue: 10.000, // 10 KWD discount on 2 KWD products
    includeShipping: false, // Shipping NOT included
  },
});
assert(
  t6.discountAmount === 2.000 &&
  t6.discountedProductsSubtotal === 0 &&
  t6.effectiveShippingFee === 2.000 &&
  t6.finalTotal === 2.000,
  'TEST 6: Fixed 10 KWD discount on 2 KWD products is capped at products subtotal (2.000 KWD), preserving 2.000 KWD shipping fee'
);

// --- TEST 7: includeShipping = false Boundary ---
const t7 = calculatePromotionDiscount({
  productsSubtotal: 3.000,
  shippingFee: 2.500,
  coupon: {
    code: 'NOSHIP',
    discountType: 'fixed',
    discountValue: 5.000,
    includeShipping: false,
  },
});
assert(
  t7.discountAmount === 3.000 &&
  t7.effectiveShippingFee === 2.500 &&
  t7.finalTotal === 2.500,
  'TEST 7: includeShipping=false guarantees shipping fee is NEVER reduced'
);

// --- TEST 8: includeShipping = true Boundary ---
const t8 = calculatePromotionDiscount({
  productsSubtotal: 3.000,
  shippingFee: 2.000,
  coupon: {
    code: 'WITHSHIP',
    discountType: 'fixed',
    discountValue: 4.500,
    includeShipping: true,
  },
});
assert(
  t8.discountAmount === 4.500 &&
  t8.discountedProductsSubtotal === 0 &&
  t8.effectiveShippingFee === 0.500 &&
  t8.finalTotal === 0.500,
  'TEST 8: includeShipping=true allows discount to cover products subtotal + partial shipping fee'
);

// --- TEST 9: Decimal Precision Test (0.150 KWD product, 0.100 KWD discount) ---
const t9 = calculatePromotionDiscount({
  productsSubtotal: 0.150,
  shippingFee: 2.000,
  coupon: {
    code: 'DECIMAL',
    discountType: 'fixed',
    discountValue: 0.100,
    includeShipping: false,
  },
});
assert(
  t9.discountAmount === 0.100 &&
  t9.discountedProductsSubtotal === 0.050 &&
  t9.effectiveShippingFee === 2.000 &&
  t9.finalTotal === 2.050,
  'TEST 9: Precision test (0.150 KWD products - 0.100 KWD discount + 2.000 KWD shipping = 2.050 KWD exact)'
);

// --- TEST 10 & 11: Dynamic Cart Recalculation on Item Add / Remove in DB ---
const testSession = `test_session_${Date.now()}`;

// Update Promotion settings in DB to require 5.000 KWD min
db.updatePromotionSettings({
  enabled: true,
  discountType: 'percentage',
  discountValue: 10,
  couponCode: 'DYNAMIC10',
  minProductsValue: 5.000,
  includeShipping: false,
});

// Step 1: Add item of 2.000 KWD (below min of 5.000 KWD)
db.updateCart(testSession, {
  id: testSession,
  items: [{ id: 'item1', productId: 'p1', title: 'Test Pen', price: 2.000, quantity: 1, lineTotal: 2.000 }],
  couponCode: 'DYNAMIC10',
  subtotal: 2.000,
  discount: 0,
  shippingFee: 2.000,
  total: 4.000,
  updatedAt: new Date().toISOString(),
});

const cartState1 = db.getCart(testSession);
assert(
  cartState1.discount === 0 && cartState1.total === 4.000,
  'TEST 10: Cart with 2.000 KWD < 5.000 KWD min keeps discount at 0.000 KWD'
);

// Step 2: Increase quantity to 3 (3 * 2.000 = 6.000 KWD >= 5.000 KWD min)
db.updateCart(testSession, {
  ...cartState1,
  items: [{ id: 'item1', productId: 'p1', title: 'Test Pen', price: 2.000, quantity: 3, lineTotal: 6.000 }],
});

const cartState2 = db.getCart(testSession);
assert(
  cartState2.discount === 0.600 && cartState2.total === 7.400,
  'TEST 11: Increasing cart to 6.000 KWD >= 5.000 KWD min dynamically activates 10% discount (0.600 KWD)'
);

// Step 3: Lower quantity back to 1 (2.000 KWD < 5.000 KWD min)
db.updateCart(testSession, {
  ...cartState2,
  items: [{ id: 'item1', productId: 'p1', title: 'Test Pen', price: 2.000, quantity: 1, lineTotal: 2.000 }],
});

const cartState3 = db.getCart(testSession);
assert(
  cartState3.discount === 0 && cartState3.total === 4.000,
  'TEST 10b: Lowering cart back below min automatically reverts discount to 0.000 KWD'
);

// --- TEST 12: validateCoupon Server Function ---
const valResMinFail = db.validateCoupon('DYNAMIC10', 0.150);
assert(
  valResMinFail.valid === false &&
  valResMinFail.discountAmount === 0 &&
  valResMinFail.remainingForMin === 4.850 &&
  valResMinFail.error?.includes('4.850'),
  'TEST 12: db.validateCoupon on 0.150 KWD returns valid=false with message "أضف 4.850 د.ك من المنتجات لتفعيل الخصم."'
);

// --- TEST 13: Promotion Activation Endpoint & Idempotency ---
const actUserSession = `sess_act_${Date.now()}`;
const testUserId = `user_123_${Date.now()}`;
const actResult1 = db.activatePromotion({
  promotionId: 'current_promotion',
  couponCode: 'DYNAMIC10',
  userId: testUserId,
  sessionId: actUserSession,
});

assert(
  actResult1.isAlreadyActive === false &&
  actResult1.activation.couponCode === 'DYNAMIC10' &&
  actResult1.activation.userId === testUserId,
  'TEST 13a: First activation call creates a DB promotion activation record'
);

const actResult2 = db.activatePromotion({
  promotionId: 'current_promotion',
  couponCode: 'DYNAMIC10',
  userId: testUserId,
  sessionId: actUserSession,
});

assert(
  actResult2.isAlreadyActive === true &&
  actResult2.activation.id === actResult1.activation.id,
  'TEST 13b: Duplicate activation call returns existing record without creating duplicates (Idempotency)'
);

// --- TEST 14: Auto-Attachment of Active Promotion on GetCart ---
const autoAttachSession = `sess_auto_${Date.now()}`;
db.activatePromotion({
  promotionId: 'current_promotion',
  couponCode: 'DYNAMIC10',
  userId: 'user_456',
  sessionId: autoAttachSession,
});

// Fetch cart before explicitly applying code - should auto-attach code from DB activation
const fetchedCartAuto = db.getCart(autoAttachSession, 'user_456');
assert(
  fetchedCartAuto.couponCode === 'DYNAMIC10',
  'TEST 14: getCart automatically retrieves and attaches active promotion code from DB activation'
);

// --- TEST 15: Admin Update Instant Cart Sync ---
db.updatePromotionSettings({
  enabled: true,
  discountType: 'percentage',
  discountValue: 20, // Updated from 10% to 20%
  couponCode: 'DYNAMIC10',
  minProductsValue: 5.000,
});

// The cart created in TEST 11 should now have 20% discount instead of 10%
const cartAfterAdminUpdate = db.getCart(testSession);
assert(
  cartAfterAdminUpdate.discount === 0.000, // Currently subtotal is 2.000 (< 5.000 KWD min)
  'TEST 15a: Cart subtotal 2.000 KWD < 5.000 KWD gets 0 discount after admin update'
);

// Increase subtotal to 10.000 KWD and check 20% discount
db.updateCart(testSession, {
  ...cartAfterAdminUpdate,
  items: [{ id: 'item1', productId: 'p1', title: 'Test Pen', price: 10.000, quantity: 1, lineTotal: 10.000 }],
});
const cartWithNewRate = db.getCart(testSession);
assert(
  cartWithNewRate.discount === 2.000, // 20% of 10 KWD = 2 KWD
  'TEST 15b: Admin update changing discount from 10% to 20% immediately applies 2.000 KWD discount on 10.000 KWD products'
);

// --- TEST 16: Order Creation Snapshot & Anti-Tampering ---
const snapshotSession = `sess_snap_${Date.now()}`;
db.updateCart(snapshotSession, {
  id: snapshotSession,
  items: [{ id: 'item1', productId: 'p1', title: 'Test Pen', price: 10.000, quantity: 1, lineTotal: 10.000 }],
  couponCode: 'DYNAMIC10',
  subtotal: 10.000,
  discount: 2.000,
  shippingFee: 2.000,
  total: 10.000,
  updatedAt: new Date().toISOString(),
});

// Simulate order creation on backend
const serverCalcDiscount = db.validateCoupon('DYNAMIC10', 10.000).discountAmount;
const serverShipping = db.calculateShippingFee(10.000, 'DYNAMIC10');
const serverFinalTotal = 10.000 - serverCalcDiscount + serverShipping;

const mockOrder = {
  id: `ord_test_${Date.now()}`,
  orderNumber: 'MQ-TEST-1001',
  customerName: 'Ahmad User',
  customerEmail: 'ahmad@example.com',
  customerPhone: '90001122',
  governorate: 'العاصمة',
  area: 'شرق',
  block: '1',
  street: 'شارع الهلال',
  paymentMethod: 'cash_on_delivery' as const,
  paymentStatus: 'pending' as const,
  orderStatus: 'pending' as const,
  items: [{ productId: 'p1', title: 'Test Pen', price: 10.000, quantity: 1, lineTotal: 10.000 }],
  subtotal: 10.000,
  shippingFee: serverShipping,
  discount: serverCalcDiscount,
  total: serverFinalTotal,
  couponCode: 'DYNAMIC10',
  discountType: 'percentage' as const,
  discountValue: 20,
  actualDiscountAmount: serverCalcDiscount,
  subtotalBeforeDiscount: 10.000,
  subtotalAfterDiscount: 8.000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

db.addOrder(mockOrder);
const savedOrder = db.getOrderById(mockOrder.id);

assert(
  savedOrder?.discount === 2.000 &&
  savedOrder?.total === 10.000 &&
  savedOrder?.actualDiscountAmount === 2.000,
  'TEST 16a: Order correctly stores backend-calculated discount (2.000 KWD) and final total (10.000 KWD)'
);

// Now Admin changes promotion settings to 50%
db.updatePromotionSettings({
  enabled: true,
  discountType: 'percentage',
  discountValue: 50,
  couponCode: 'DYNAMIC10',
});

// The previously placed order MUST keep its historical snapshot unchanged
const orderAfterAdminChange = db.getOrderById(mockOrder.id);
assert(
  orderAfterAdminChange?.discount === 2.000 &&
  orderAfterAdminChange?.total === 10.000,
  'TEST 16b: Historical Order Snapshot Invariant: Order retains original 2.000 KWD discount even after admin modifies promotion to 50%'
);

console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
}
