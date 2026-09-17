import React, { useState, useEffect } from 'react';
import { CheckCircle2, Printer, ArrowLeft, ArrowRight, Package, MapPin, CreditCard, ShieldCheck, MessageCircle, ExternalLink } from 'lucide-react';
import { Order } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import * as api from '../lib/api';

interface OrderConfirmationPageProps {
  orderId: string;
  onNavigate: (path: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderId, onNavigate }) => {
  const { dir, isRtl, storeName, formatPrice, t } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await api.fetchOrderById(orderId);
        if (res.success) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center" dir={dir}>
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-bold text-slate-700">
          {isRtl ? 'جاري تحميل بيانات وتفاصيل الطلب...' : 'Loading order details...'}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4" dir={dir}>
        <h2 className="text-lg font-bold text-slate-800">
          {isRtl ? 'تعذر العثور على الطلب' : 'Order not found'}
        </h2>
        <button
          onClick={() => onNavigate('/')}
          className="bg-sky-700 text-white font-bold py-2 px-6 rounded-xl text-xs cursor-pointer"
        >
          {t('nav.home')}
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppContact = () => {
    const msg = encodeURIComponent(
      isRtl
        ? `مرحباً ${storeName}، أستفسر عن طلبي رقم: *${order.orderNumber}* باسم *${order.customerName}*.`
        : `Hello ${storeName}, I am inquiring about my order number: *${order.orderNumber}* for *${order.customerName}*.`
    );
    window.open(`https://wa.me/96597123698?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" dir={dir}>
      {/* Success Header Card */}
      <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-6 sm:p-8 text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-900">
          {isRtl ? `شكراً لتسوقك من ${storeName}!` : `Thank you for shopping with ${storeName}!`}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
          {isRtl
            ? 'تم استلام طلبك بنجاح وجاري تجهيزه للشحن والتوصيل. سنقوم بالتواصل معك عبر الهاتف أو الواتساب لتأكيد موعد التسليم.'
            : 'Your order has been received successfully and is being prepared for shipment. We will contact you via phone or WhatsApp to coordinate delivery.'}
        </p>

        <div className="inline-block bg-white px-4 py-2 rounded-xl border border-emerald-200 text-xs font-mono font-bold text-slate-800 shadow-2xs mt-2">
          {isRtl ? 'رقم الطلب: ' : 'Order #: '}
          <span className="text-sky-800 font-extrabold">{order.orderNumber}</span>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {/* Customer & Address details */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100 text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="space-y-1">
            <span className="font-bold text-slate-400 block uppercase">
              {isRtl ? 'بيانات العميل:' : 'Customer Information:'}
            </span>
            <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
            <p className="text-slate-600 font-mono" dir="ltr">{order.customerPhone}</p>
            {order.customerEmail && <p className="text-slate-500">{order.customerEmail}</p>}
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-400 block uppercase">
              {isRtl ? 'عنوان التوصيل (الكويت):' : 'Delivery Address (Kuwait):'}
            </span>
            <p className="text-slate-800 font-bold">
              {isRtl ? `محافظة ${order.governorate} - منطقة ${order.area}` : `${order.governorate} - ${order.area}`}
            </p>
            <p className="text-slate-600">
              {isRtl
                ? `قطعة ${order.block}، شارع ${order.street}${order.avenue ? `، جادة ${order.avenue}` : ''}، بناية/منزل ${order.building}${order.floor ? `، دور ${order.floor}` : ''}`
                : `Block ${order.block}, Street ${order.street}${order.avenue ? `, Avenue ${order.avenue}` : ''}, Building ${order.building}${order.floor ? `, Floor ${order.floor}` : ''}`}
            </p>
          </div>
        </div>

        {/* Payment info */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-sky-700" />
            <span className="font-semibold text-slate-700">{isRtl ? 'طريقة الدفع:' : 'Payment Method:'}</span>
            <span className="font-bold text-slate-900">
              {order.paymentMethod === 'whatsapp'
                ? (isRtl ? 'الطلب عبر الواتساب' : 'WhatsApp Order')
                : (isRtl ? 'الدفع نقداً عند الاستلام (كاش)' : 'Cash on Delivery (COD)')}
            </span>
          </div>

          <div>
            <span className="font-semibold text-slate-700">{isRtl ? 'حالة الطلب: ' : 'Order Status: '}</span>
            <span className="font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
              {isRtl ? 'قيد التجهيز والتوصيل' : 'Processing & Delivery'}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h3 className={`text-xs font-bold text-slate-700 uppercase ${isRtl ? 'text-right' : 'text-left'}`}>
            {isRtl ? 'الأصناف المطلوبة' : 'Ordered Items'}
          </h3>
          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png'}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1 shrink-0"
                  />
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <span className="text-[11px] text-slate-500">
                      {isRtl
                        ? `الكمية: ${item.quantity} × ${formatPrice(item.price)}`
                        : `Qty: ${item.quantity} × ${formatPrice(item.price)}`}
                    </span>
                  </div>
                </div>
                <span className="font-extrabold text-sky-900">{formatPrice(item.lineTotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>{t('cart.subtotal')}:</span>
            <span className="font-bold text-slate-900">{formatPrice(order.subtotal)}</span>
          </div>

          {order.discount ? (
            <div className="flex items-center justify-between text-emerald-600 font-bold">
              <span>{t('cart.discount')}:</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <span>{t('cart.shipping_fee')}:</span>
            <span className="font-bold text-slate-900">
              {order.shippingFee === 0 ? <span className="text-emerald-600">{t('cart.free_shipping')}</span> : formatPrice(order.shippingFee)}
            </span>
          </div>

          <div className="flex items-center justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
            <span>{t('cart.total')}:</span>
            <span className="text-sky-900 text-lg">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isRtl ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
          </button>

          <button
            onClick={handleWhatsAppContact}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isRtl ? 'متابعة الطلب عبر واتساب (+965 97123698)' : 'Track on WhatsApp (+965 97123698)'}</span>
          </button>

          <a
            href="https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-sky-700" />
            <span>{isRtl ? 'موقع الفرع (خرائط جوجل)' : 'Store Location (Google Maps)'}</span>
          </a>

          <button
            onClick={() => onNavigate('/')}
            className={`${isRtl ? 'mr-auto' : 'ml-auto'} bg-sky-700 hover:bg-sky-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer`}
          >
            {t('cart.continue_shopping')}
          </button>
        </div>
      </div>
    </div>
  );
};
