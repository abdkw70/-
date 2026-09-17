import React, { useState, useEffect } from 'react';
import {
  HardDriveDownload,
  Download,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Plus,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BackupRecord } from '../../types';
import * as api from '../../lib/api';

interface AdminBackupsProps {
  onDatabaseRestored: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminBackups: React.FC<AdminBackupsProps> = ({
  onDatabaseRestored,
  showToast,
}) => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Restore Modal
  const [backupToRestore, setBackupToRestore] = useState<BackupRecord | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Delete Modal
  const [backupToDelete, setBackupToDelete] = useState<BackupRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBackupsList = async () => {
    setIsLoading(true);
    try {
      const res = await api.fetchAdminBackups();
      if (res.success) {
        setBackups(res.backups);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل جلب قائمة النسخ الاحتياطية', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupsList();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const res = await api.createAdminBackup();
      if (res.success) {
        showToast(res.message || 'تم إنشاء النسخة الاحتياطية بنجاح', 'success');
        fetchBackupsList();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء النسخة الاحتياطية', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!backupToRestore) return;
    setIsRestoring(true);
    try {
      const res = await api.restoreAdminBackup(backupToRestore.filename);
      if (res.success) {
        showToast(res.message || 'تمت استعادة البيانات بنجاح', 'success');
        setBackupToRestore(null);
        onDatabaseRestored();
      }
    } catch (err: any) {
      showToast(err.message || 'فشلت استعادة النسخة الاحتياطية', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!backupToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteAdminBackup(backupToDelete.filename);
      if (res.success) {
        showToast('تم حذف ملف النسخة الاحتياطية بنجاح', 'info');
        setBackupToDelete(null);
        fetchBackupsList();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حذف ملف النسخة', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportJSON = () => {
    window.location.href = '/api/admin/export';
    showToast('جاري تصدير وتحميل ملف بيانات المتجر...', 'info');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>النسخ الاحتياطي وحماية البيانات</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {backups.length} نسخة محفوظة
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            إنشاء نقاط استعادة لقاعدة البيانات، تصدير ملفات المتجر، واسترجاع البيانات بضغطة زر
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>تصدير ملف المتجر JSON</span>
          </button>

          <button
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية فورية'}</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-3xl p-5 flex items-start gap-4">
        <div className="p-3 bg-indigo-900/60 text-indigo-400 rounded-2xl shrink-0 border border-indigo-700/40">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="font-bold text-white text-sm">
            حماية بيانات المتجر الـ443 منتجاً
          </h3>
          <p className="text-slate-300 leading-relaxed">
            يتم حفظ النسخ الاحتياطية تلقائياً في السيرفر المحلي. نوصي بتنزيل نسخة بصيغة JSON على جهازك من وقت لآخر لضمان أمان تام وسهولة النقل عند الحاجة.
          </p>
        </div>
      </div>

      {/* Backups List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">جاري فحص النسخ الاحتياطية...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <FileJson className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">لا توجد نسخ احتياطية محفوظة بعد</h3>
            <p className="text-xs text-slate-500">اضغط على زر "إنشاء نسخة احتياطية فورية" لإنشاء أول نسخة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-bold uppercase">
                <tr>
                  <th className="p-4">اسم الملف</th>
                  <th className="p-4">تاريخ الإنشاء</th>
                  <th className="p-4">حجم الملف</th>
                  <th className="p-4">المنتجات</th>
                  <th className="p-4">الأقسام</th>
                  <th className="p-4">الطلبات</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {backups.map(backup => (
                  <tr key={backup.filename} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                      {backup.filename}
                    </td>
                    <td className="p-4 text-slate-300 whitespace-nowrap">
                      {new Date(backup.createdAt).toLocaleString('ar-KW')}
                    </td>
                    <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                      {backup.sizeFormatted}
                    </td>
                    <td className="p-4 font-bold text-sky-400 whitespace-nowrap">
                      {backup.productsCount}
                    </td>
                    <td className="p-4 text-slate-300 whitespace-nowrap">
                      {backup.categoriesCount}
                    </td>
                    <td className="p-4 text-emerald-400 whitespace-nowrap">
                      {backup.ordersCount}
                    </td>
                    <td className="p-4 whitespace-nowrap text-left">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/admin/backups/download/${encodeURIComponent(backup.filename)}`}
                          download
                          className="p-2 bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer inline-flex items-center"
                          title="تحميل الملف إلى جهازك"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => setBackupToRestore(backup)}
                          className="p-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                          title="استعادة هذه النسخة"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setBackupToDelete(backup)}
                          className="p-2 bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-300 rounded-xl transition-colors cursor-pointer"
                          title="حذف ملف النسخة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {backupToRestore && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">تأكيد استعادة النسخة الاحتياطية</h3>
              <p className="text-xs text-slate-300">
                هل ترغب في استرجاع قاعدة البيانات من الملف "{backupToRestore.filename}"؟
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 mt-2 space-y-1 text-right">
                <div>• عدد المنتجات: <span className="text-white font-bold">{backupToRestore.productsCount}</span></div>
                <div>• عدد الأقسام: <span className="text-white font-bold">{backupToRestore.categoriesCount}</span></div>
                <div>• عدد الطلبات: <span className="text-white font-bold">{backupToRestore.ordersCount}</span></div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setBackupToRestore(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isRestoring ? 'جاري الاستعادة...' : 'تأكيد واسترجاع البيانات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {backupToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">تأكيد حذف ملف النسخة</h3>
              <p className="text-xs text-slate-300">
                هل أنت متأكد من حذف الملف "{backupToDelete.filename}"؟ لن يمكن استرجاع هذا الملف بعد حذفه.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setBackupToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، احذف الملف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
