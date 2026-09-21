import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Phone,
  MessageCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  FileText,
  User,
  CreditCard,
  Layers,
  Eye,
} from 'lucide-react';
import { Order } from '../../types';
import * as api from '../../lib/api';
import { getProductImageUrl, handleImageError } from '../../lib/imageHelper';

interface AdminOrdersProps {
  formatPrice: (price: number) => string;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  formatPrice,
  showToast,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrdersList = async () => {
    setIsLoading(true);
    try {
      const res = await api.fetchAdminOrders({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        q: searchQuery,
        page: currentPage,
        limit: pageSize,
      });

      if (res.success) {
        setOrders(res.orders);
        setTotalOrders(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل جلب قائمة الطلبات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, [searchQuery, selectedStatus, currentPage, pageSize]);

  // Status Updater
  const handleUpdateStatus = async (orderId: string, newOrderStatus: string, newPaymentStatus?: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.updateAdminOrderStatus(orderId, newOrderStatus, newPaymentStatus);
      if (res.success) {
        showToast(`تم تحديث حالة الطلب #${res.order.orderNumber} بنجاح`, 'success');
        setSelectedOrder(res.order);
        setOrders(prev => prev.map(o => (o.id === orderId ? res.order : o)));
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة الطلب', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Generate WhatsApp Message Link for Customer
  const generateCustomerWhatsAppUrl = (order: Order) => {
    let cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 8) {
      cleanPhone = '965' + cleanPhone;
    }

    const itemsSummary = order.items
      .map(item => `• ${item.title} ${item.selectedOptionsSummary ? `(${item.selectedOptionsSummary})` : ''} - العدد: ${item.quantity} - السعر: ${item.price * item.quantity} د.ك`)
      .join('\n');

    const msg = `مرحباً ${order.customerName} 👋
نشكرك على تسوقك من مكتبة الشاطئ الازرق (Blue Beach Stationery).

تفاصيل طلبك رقم: #${order.orderNumber}
الحالة الحالية: ${
      order.orderStatus === 'pending'
        ? 'قيد المراجعة'
        : order.orderStatus === 'processing'
        ? 'قيد التجهيز والتغليف'
        : order.orderStatus === 'shipped'
        ? 'خرج مع مندوب التوصيل'
        : order.orderStatus === 'delivered'
        ? 'تم التوصيل بنجاح'
        : order.orderStatus
    }

المنتجات:
${itemsSummary}

المجموع الإجمالي: ${order.total} د.ك
عنوان التوصيل: ${order.governorate} - ${order.area} - ق ${order.block} - ش ${order.street}

إذا كان لديك أي استفسار يسعدنا دائماً خدمتك!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>إدارة الطلبات والمبيعات</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {totalOrders} طلب
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            متابعة حالة الطلبات، تغيير حالات التجهيز والشحن، وتجهيز رسائل الواتساب وطباعة الفواتير
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ابحث برقم الطلب، اسم العميل، رقم الهاتف، أو المنطقة..."
              className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">بانتظار المراجعة (Pending)</option>
              <option value="processing">قيد التجهيز (Processing)</option>
              <option value="shipped">تم الشحن / مع المندوب (Shipped)</option>
              <option value="delivered">تم التوصيل (Delivered)</option>
              <option value="cancelled">ملغي (Cancelled)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">جاري جلب الطلبات...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">لا توجد طلبات مطابقة</h3>
            <p className="text-xs text-slate-500">جرب تغيير حالة الفلتر أو البحث</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-bold uppercase">
                  <tr>
                    <th className="p-4">رقم الطلب</th>
                    <th className="p-4">العميل والتواصل</th>
                    <th className="p-4">العنوان والمنطقة</th>
                    <th className="p-4">المنتجات</th>
                    <th className="p-4">الإجمالي</th>
                    <th className="p-4">طريقة الدفع</th>
                    <th className="p-4">حالة الطلب</th>
                    <th className="p-4 text-left">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map(order => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order Number & Date */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white group-hover:text-sky-400 transition-colors">
                            #{order.orderNumber}
                          </span>
                          <div className="text-[10px] text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString('ar-KW', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">{order.customerName}</span>
                          <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                            {order.customerPhone}
                          </span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="p-4">
                        <div className="text-[11px] text-slate-300">
                          <span>{order.area}</span>
                          <span className="text-slate-500 mr-1">({order.governorate})</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 bg-slate-950 text-slate-300 rounded-md border border-slate-800 text-[10px] font-bold">
                          {order.items.length} منتجات
                        </span>
                      </td>

                      {/* Total */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-emerald-400 text-sm">
                          {formatPrice(order.total)}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-[11px] text-slate-300">
                          {order.paymentMethod === 'whatsapp'
                            ? 'طلب عبر الواتساب'
                            : order.paymentMethod === 'cod'
                            ? 'دفع عند الاستلام'
                            : 'كي نت / إلكتروني'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            order.orderStatus === 'completed' || order.orderStatus === 'delivered'
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                              : order.orderStatus === 'processing'
                              ? 'bg-sky-950/80 text-sky-400 border-sky-800'
                              : order.orderStatus === 'shipped'
                              ? 'bg-purple-950/80 text-purple-400 border-purple-800'
                              : order.orderStatus === 'cancelled'
                              ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                              : 'bg-amber-950/80 text-amber-400 border-amber-800'
                          }`}
                        >
                          {order.orderStatus === 'pending'
                            ? 'بانتظار المراجعة'
                            : order.orderStatus === 'processing'
                            ? 'قيد التجهيز'
                            : order.orderStatus === 'shipped'
                            ? 'تم الشحن'
                            : order.orderStatus === 'delivered'
                            ? 'تم التوصيل'
                            : order.orderStatus === 'cancelled'
                            ? 'ملغي'
                            : order.orderStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 whitespace-nowrap text-left">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          معاينة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="lg:hidden divide-y divide-slate-800/80">
              {orders.map(order => (
                <div key={order.id} className="p-4 space-y-3 bg-slate-900/90">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">#{order.orderNumber}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('ar-KW', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        order.orderStatus === 'completed' || order.orderStatus === 'delivered'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                          : order.orderStatus === 'processing'
                          ? 'bg-sky-950/80 text-sky-400 border-sky-800'
                          : order.orderStatus === 'shipped'
                          ? 'bg-purple-950/80 text-purple-400 border-purple-800'
                          : order.orderStatus === 'cancelled'
                          ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                          : 'bg-amber-950/80 text-amber-400 border-amber-800'
                      }`}
                    >
                      {order.orderStatus === 'pending'
                        ? 'بانتظار المراجعة'
                        : order.orderStatus === 'processing'
                        ? 'قيد التجهيز'
                        : order.orderStatus === 'shipped'
                        ? 'تم الشحن'
                        : order.orderStatus === 'delivered'
                        ? 'تم التوصيل'
                        : order.orderStatus === 'cancelled'
                        ? 'ملغي'
                        : order.orderStatus}
                    </span>
                  </div>

                  {/* Customer Details */}
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{order.customerName}</span>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-[11px] font-mono text-sky-400 hover:underline flex items-center gap-1"
                        dir="ltr"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.customerPhone}</span>
                      </a>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>العنوان: {order.area} ({order.governorate})</span>
                      <span className="text-[10px] text-slate-500">{order.items.length} منتجات</span>
                    </div>
                  </div>

                  {/* Total & Action */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div>
                      <span className="block text-[10px] text-slate-400">إجمالي الطلب:</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {formatPrice(order.total)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="py-2.5 px-4 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 rounded-xl text-xs font-bold flex items-center gap-1.5 min-h-[44px] cursor-pointer touch-manipulation"
                    >
                      <Eye className="w-4 h-4" />
                      <span>تفاصيل الطلب</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            عرض الصفحة <span className="font-bold text-white">{currentPage}</span> من{' '}
            <span className="font-bold text-white">{totalPages}</span> (إجمالي{' '}
            <span className="font-bold text-white">{totalOrders}</span> طلب)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Details & Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    تفاصيل الطلب #{selectedOrder.orderNumber}
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedOrder.orderStatus === 'delivered'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : selectedOrder.orderStatus === 'processing'
                        ? 'bg-sky-950 text-sky-400 border-sky-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  تاريخ الإنشاء:{' '}
                  {new Date(selectedOrder.createdAt).toLocaleString('ar-KW')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* WhatsApp Customer Button */}
                <a
                  href={generateCustomerWhatsAppUrl(selectedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="إرسال رسالة واتساب للعميل بتفاصيل الطلب"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تواصل واتساب</span>
                </a>

                <button
                  onClick={() => window.print()}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                  title="طباعة الفاتورة"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              {/* Status Update Controls */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    تحديث حالة الطلب
                  </label>
                  <select
                    value={selectedOrder.orderStatus}
                    disabled={isUpdatingStatus}
                    onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value, selectedOrder.paymentStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="pending">بانتظار المراجعة (Pending)</option>
                    <option value="processing">قيد التجهيز والتغليف (Processing)</option>
                    <option value="shipped">تم الشحن / مع المندوب (Shipped)</option>
                    <option value="delivered">تم التوصيل بنجاح (Delivered)</option>
                    <option value="cancelled">ملغي (Cancelled)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    حالة الدفع
                  </label>
                  <select
                    value={selectedOrder.paymentStatus}
                    disabled={isUpdatingStatus}
                    onChange={e => handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="pending">معلق (Pending)</option>
                    <option value="paid">مدفوع بالكامل (Paid)</option>
                    <option value="failed">فشل الدفع (Failed)</option>
                  </select>
                </div>
              </div>

              {/* Customer and Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                  <h3 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>بيانات العميل</span>
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">الاسم:</span>
                      <span className="font-bold text-white">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">رقم الهاتف:</span>
                      <a
                        href={`tel:${selectedOrder.customerPhone}`}
                        className="font-bold text-sky-400 hover:underline"
                        dir="ltr"
                      >
                        {selectedOrder.customerPhone}
                      </a>
                    </div>
                    {selectedOrder.customerEmail && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">البريد الإلكتروني:</span>
                        <span className="text-slate-300">{selectedOrder.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                  <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>عنوان التوصيل</span>
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">المحافظة والمنطقة:</span>
                      <span className="font-bold text-white">
                        {selectedOrder.governorate} - {selectedOrder.area}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      قطعة: {selectedOrder.block} • شارع: {selectedOrder.street}
                      {selectedOrder.avenue ? ` • جادة: ${selectedOrder.avenue}` : ''}
                      {selectedOrder.building ? ` • مبنى: ${selectedOrder.building}` : ''}
                      {selectedOrder.floor ? ` • دور/شقة: ${selectedOrder.floor}` : ''}
                    </div>
                    {selectedOrder.notes && (
                      <div className="p-2 bg-slate-900 rounded-lg text-amber-300 text-[11px]">
                        ملاحظات العميل: {selectedOrder.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                  <span>المنتجات المطلوبة ({selectedOrder.items.length})</span>
                </h3>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImageUrl(item.image)}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-700/70 shrink-0"
                          referrerPolicy="no-referrer"
                          onError={handleImageError}
                          loading="lazy"
                        />
                        <div>
                          <h4 className="font-bold text-white">{item.title}</h4>
                          <div className="text-[11px] text-slate-400">
                            {item.selectedOptionsSummary && <span className="text-sky-400">{item.selectedOptionsSummary} • </span>}
                            <span>الكمية: {item.quantity}</span>
                            <span> • السعر الفردي: {formatPrice(item.price)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="font-bold text-emerald-400 text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Financial Totals */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>المجموع الفرعي للمنتجات:</span>
                  <span className="text-white font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold">
                    <span>خصم الكوبون:</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>رسوم التوصيل:</span>
                  <span className="text-white font-semibold">{formatPrice(selectedOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>المبلغ الإجمالي المستحق:</span>
                  <span className="text-emerald-400">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
