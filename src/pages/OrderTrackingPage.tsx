import React, { useState } from 'react';
import { Search, Package, CheckCircle2, Clock, Truck, ShieldAlert, Phone } from 'lucide-react';
import { Order } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import * as api from '../lib/api';

export const OrderTrackingPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { dir, isRtl, language, formatPrice, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await api.fetchOrders({ q: query.trim() });
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg">
            {isRtl ? 'تم التسليم' : 'Delivered'}
          </span>
        );
      case 'shipped':
        return (
          <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-1 rounded-lg">
            {isRtl ? 'مع مندوب التوصيل' : 'Out for Delivery'}
          </span>
        );
      case 'processing':
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg">
            {isRtl ? 'جاري تجهيز الطلب' : 'Processing Order'}
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
            {isRtl ? 'قيد المراجعة' : 'Under Review'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" dir={dir}>
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-3">
          <Package className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isRtl ? 'تتبع حالة طلبك' : 'Track Your Order'}
        </h1>
        <p className="text-xs text-slate-500">
          {isRtl
            ? 'أدخل رقم الطلب (مثال: MQ-2026-1234) أو رقم الهاتف المستخدم عند الشراء لمعرفة حالة شحنتك'
            : 'Enter your order number (e.g. MQ-2026-1234) or phone number to check shipment status'}
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isRtl ? 'رقم الطلب أو رقم الهاتف...' : 'Order number or phone...'}
            className={`w-full ${isRtl ? 'pl-3 pr-10' : 'pr-3 pl-10'} py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 shadow-xs`}
          />
          <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-2xl text-xs transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          {loading ? (isRtl ? 'جاري البحث...' : 'Searching...') : (isRtl ? 'تتبع الآن' : 'Track Now')}
        </button>
      </form>

      {/* Search Results */}
      {searched && (
        <div className="space-y-4 pt-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900">
                {isRtl ? 'لم يتم العثور على طلبات مطابقة' : 'No matching orders found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isRtl
                  ? 'يرجى التأكد من كتابة رقم الطلب بالشكل الصحيح أو التواصل مع خدمة العملاء للمساعدة.'
                  : 'Please check your order number or contact customer support for assistance.'}
              </p>
              <a
                href="https://wa.me/96597123698"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>{isRtl ? 'مساعدة عبر واتساب (+965 97123698)' : 'WhatsApp Support (+965 97123698)'}</span>
              </a>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">
                      {isRtl ? 'رقم الطلب:' : 'Order Number:'}
                    </span>
                    <span className="text-base font-extrabold text-sky-900">{order.orderNumber}</span>
                  </div>
                  <div>{getStatusBadge(order.orderStatus)}</div>
                </div>

                {/* Progress Visual */}
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                  <div className={`p-2 rounded-xl ${order.orderStatus ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-slate-50 text-slate-400'}`}>
                    {isRtl ? '1. استلام الطلب' : '1. Order Placed'}
                  </div>
                  <div className={`p-2 rounded-xl ${['processing', 'shipped', 'delivered'].includes(order.orderStatus) ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-slate-50 text-slate-400'}`}>
                    {isRtl ? '2. جاري التجهيز' : '2. Processing'}
                  </div>
                  <div className={`p-2 rounded-xl ${['shipped', 'delivered'].includes(order.orderStatus) ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-slate-50 text-slate-400'}`}>
                    {isRtl ? '3. مع المندوب' : '3. Out for Delivery'}
                  </div>
                  <div className={`p-2 rounded-xl ${order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
                    {isRtl ? '4. تم التسليم' : '4. Delivered'}
                  </div>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div>
                    <span className="font-bold text-slate-500 block">
                      {isRtl ? 'المستلم:' : 'Recipient:'}
                    </span>
                    <p className="text-slate-800 font-bold">{order.customerName}</p>
                    <p className="text-slate-600 font-mono" dir="ltr">{order.customerPhone}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block">
                      {isRtl ? 'وجهة التوصيل:' : 'Delivery Address:'}
                    </span>
                    <p className="text-slate-800 font-bold">
                      {isRtl ? `محافظة ${order.governorate} - ${order.area}` : `${order.governorate} - ${order.area}`}
                    </p>
                    <p className="text-slate-600">
                      {isRtl ? `قطعة ${order.block}، شارع ${order.street}` : `Block ${order.block}, Street ${order.street}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-500">
                    {isRtl ? 'إجمالي الطلب:' : 'Order Total:'}
                  </span>
                  <span className="text-sm font-extrabold text-sky-900">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
