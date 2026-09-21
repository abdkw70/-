import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Clock,
  AlertTriangle,
  Lock,
  UserX,
  FileCheck,
  Search
} from 'lucide-react';
import { SecurityLogEvent } from '../../types';

interface AdminSecurityLogsProps {
  passcode: string;
}

export const AdminSecurityLogs: React.FC<AdminSecurityLogsProps> = ({ passcode }) => {
  const [logs, setLogs] = useState<SecurityLogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/security/logs', {
        headers: { 'x-admin-passcode': passcode },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load security logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [passcode]);

  const filteredLogs = logs.filter(l => {
    if (filter === 'all') return true;
    if (filter === 'rejected' && (l.result === 'rejected' || l.result === 'error')) return true;
    if (filter === 'rewards' && l.result === 'reward_granted') return true;
    return true;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-500" />
            <span>سجل الأمان والحماية ومكافحة الاحتيال</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل كل العمليات الحساسة، محاولات الدخول بدون إذن، التحقق من عناوين IP والمكافآت الممنوحة
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث السجلات</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
            filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          جميع الأحداث ({logs.length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
            filter === 'rejected' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          المحاولات المحظورة والمرفوضة
        </button>
        <button
          onClick={() => setFilter('rewards')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
            filter === 'rewards' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          المكافآت الممنوحة
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>جاري تحميل سجلات الأمان...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-500" />
            <p>لا توجد سجلات أمان مسجلة حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-200">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">نوع الحدث والإجراء</th>
                  <th className="py-3 px-4">المستخدم المعني</th>
                  <th className="py-3 px-4">عنوان IP</th>
                  <th className="py-3 px-4">النتيجة</th>
                  <th className="py-3 px-4">التفاصيل</th>
                  <th className="py-3 px-4">التوقيت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        {log.result === 'rejected' || log.result === 'error' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : log.result === 'reward_granted' ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <FileCheck className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span>{log.action}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                      {log.userId}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.ip}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.result === 'reward_granted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        log.result === 'rejected' || log.result === 'error' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate text-[11px]">
                      {log.details || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[10px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('ar-KW')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
