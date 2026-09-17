import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { ActivityLog } from '../../types';
import * as api from '../../lib/api';

interface AdminActivityLogsProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminActivityLogs: React.FC<AdminActivityLogsProps> = ({ showToast }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const fetchLogsList = async () => {
    setIsLoading(true);
    try {
      const res = await api.fetchAdminActivityLogs({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        q: searchQuery,
        page: currentPage,
        limit: pageSize,
      });

      if (res.success) {
        setLogs(res.logs);
        setTotalLogs(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل جلب سجل النشاط', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsList();
  }, [searchQuery, selectedCategory, currentPage, pageSize]);

  const handleClearLogs = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في مسح سجل النشاط؟')) return;
    try {
      const res = await api.clearAdminActivityLogs();
      if (res.success) {
        showToast('تم مسح سجل النشاط بنجاح', 'success');
        fetchLogsList();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل مسح السجل', 'error');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>سجل النشاط والتدقيق الأمني</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              {totalLogs} عملية مسجلة
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            سجل زمني مفصل يوثق جميع التعديلات على المنتجات والأسعار والصور والطلبات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogsList}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-white rounded-xl text-xs font-bold border border-rose-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح السجل</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ابحث في نص العملية أو التفاصيل..."
              className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">جميع أنواع العمليات</option>
              <option value="product">تعديل وإضافة المنتجات</option>
              <option value="price">تعديلات الأسعار</option>
              <option value="image">رفع وتعديل الصور</option>
              <option value="order">حالات الطلبات والمبيعات</option>
              <option value="backup">النسخ الاحتياطي والاستعادة</option>
              <option value="sync">المزامنة والاستيراد</option>
              <option value="settings">إعدادات المتجر</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-slate-500/30 border-t-slate-300 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">جاري تحميل سجل النشاط...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <History className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">لا توجد سجلات مطابقة</h3>
            <p className="text-xs text-slate-500">سجل النشاط فارغ أو لا توجد نتائج مطابقة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-bold uppercase">
                <tr>
                  <th className="p-4 w-12">الحالة</th>
                  <th className="p-4">نوع العملية</th>
                  <th className="p-4">التفاصيل</th>
                  <th className="p-4">القسم</th>
                  <th className="p-4 text-left">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : log.status === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : log.status === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Info className="w-4 h-4 text-sky-400" />
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap font-sans font-bold text-white">
                      {log.action}
                    </td>
                    <td className="p-4 font-sans text-slate-300">
                      {log.details}
                    </td>
                    <td className="p-4 whitespace-nowrap font-sans">
                      <span className="px-2 py-0.5 bg-slate-950 text-slate-400 rounded-md border border-slate-800 text-[10px]">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-left text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('ar-KW')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            صفحة <span className="font-bold text-white">{currentPage}</span> من{' '}
            <span className="font-bold text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
