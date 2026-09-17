import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Tag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Product, Category } from '../../types';
import * as api from '../../lib/api';

interface AdminProductsProps {
  categories: Category[];
  onOpenEditModal: (product?: Product) => void;
  onViewProductInStore: (handle: string) => void;
  formatPrice: (price: number) => string;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  categories,
  onOpenEditModal,
  onViewProductInStore,
  formatPrice,
  showToast,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(443);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [sortOption, setSortOption] = useState('updated');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Deletion modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.fetchAdminProducts({
        q: searchQuery,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        stockStatus: stockStatus !== 'all' ? stockStatus : undefined,
        hasDiscount: hasDiscount ? true : undefined,
        sort: sortOption,
        page: currentPage,
        limit: pageSize,
      });

      if (res.success) {
        setProducts(res.products);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل جلب قائمة المنتجات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, stockStatus, hasDiscount, sortOption, currentPage, pageSize]);

  // Handle Quick Stock Toggle
  const handleToggleStock = async (product: Product) => {
    try {
      const updatedInStock = !product.isInStock;
      const res = await api.updateAdminProduct(product.id, { isInStock: updatedInStock });
      if (res.success) {
        setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, isInStock: updatedInStock } : p)));
        showToast(
          updatedInStock ? `تم تعيين "${product.title}" كمتوفر بالمخزن` : `تم تعيين "${product.title}" كغير متوفر`,
          'info'
        );
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة المخزون', 'error');
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteAdminProduct(productToDelete.id);
      if (res.success) {
        showToast(`تم حذف المنتج "${productToDelete.title}" بنجاح`, 'success');
        setProductToDelete(null);
        fetchProducts();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المنتج', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>إدارة المنتجات والأسعار</span>
            <span className="text-xs bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-500/30">
              {totalCount} منتج
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            البحث في المنتجات الـ443، تعديل الأسعار والعروض، إدارة الصور والأشكال والتوفر
          </p>
        </div>

        <button
          onClick={() => onOpenEditModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-600/20 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
              placeholder="ابحث بالاسم، الكود SKU، أو الوصف..."
              className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                مسح
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">جميع الأقسام ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.title}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockStatus}
              onChange={e => {
                setStockStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">جميع حالات التوفر</option>
              <option value="in_stock">متوفر بالمخزن فقط</option>
              <option value="out_of_stock">غير متوفر (نفذت الكمية)</option>
            </select>
          </div>
        </div>

        {/* Secondary filters & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setHasDiscount(!hasDiscount);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                hasDiscount
                  ? 'bg-rose-950/60 border-rose-600 text-rose-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>المنتجات المخفضة فقط</span>
            </button>

            {(searchQuery || selectedCategory !== 'all' || stockStatus !== 'all' || hasDiscount) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setStockStatus('all');
                  setHasDiscount(false);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-xs underline cursor-pointer"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">الترتيب:</span>
            <select
              value={sortOption}
              onChange={e => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="updated">آخر تعديل (الأحدث أولاً)</option>
              <option value="newest">تاريخ الإضافة</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
              <option value="discount">أعلى نسبة خصم</option>
              <option value="name_asc">الاسم (أ - ي)</option>
              <option value="stock_asc">الكمية (الأقل أولاً)</option>
              <option value="stock_desc">الكمية (الأعلى أولاً)</option>
            </select>

            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="10">10 لكل صفحة</option>
              <option value="25">25 لكل صفحة</option>
              <option value="50">50 لكل صفحة</option>
              <option value="100">100 لكل صفحة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">جاري جلب المنتجات...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">لا توجد منتجات مطابقة لخيارات البحث</h3>
            <p className="text-xs text-slate-500">جرب تغيير كلمات البحث أو إعادة ضبط الفلاتر</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-bold uppercase">
                <tr>
                  <th className="p-4 w-16">الصورة</th>
                  <th className="p-4">اسم المنتج والبيانات</th>
                  <th className="p-4">القسم</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">الخصم</th>
                  <th className="p-4">المخزون والتوفر</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map(product => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Thumbnail Image */}
                    <td className="p-4">
                      <div className="w-12 h-12 bg-white rounded-xl overflow-hidden p-1 border border-slate-800 flex items-center justify-center shrink-0">
                        <img
                          src={product.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                          alt={product.title}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </td>

                    {/* Title & Details */}
                    <td className="p-4 max-w-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-2">
                          {product.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          {product.sku && <span>SKU: {product.sku}</span>}
                          <span>• {product.images?.length || 0} صور</span>
                          {product.variants && product.variants.length > 0 && (
                            <span className="text-indigo-400">
                              • {product.variants.length} خيارات
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 bg-slate-950 text-slate-300 rounded-lg border border-slate-800 font-medium text-[11px]">
                        {product.categoryName || 'عام'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="font-bold text-emerald-400 text-sm">
                          {formatPrice(product.price)}
                        </div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div className="text-[11px] text-slate-500 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Discount Badge */}
                    <td className="p-4 whitespace-nowrap">
                      {product.discountPercentage ? (
                        <span className="inline-block px-2 py-0.5 bg-rose-950/80 text-rose-400 border border-rose-800 rounded-full text-[10px] font-bold">
                          %{product.discountPercentage} خصم
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Stock & Availability */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            product.isInStock
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60'
                              : 'bg-rose-950/60 text-rose-400 border-rose-800 hover:bg-rose-900/60'
                          }`}
                        >
                          {product.isInStock ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>متوفر ({product.stockQuantity ?? 10})</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>غير متوفر</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 whitespace-nowrap text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEditModal(product)}
                          className="p-2 bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                          title="تعديل المنتج والأسعار والصور"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onViewProductInStore(product.handle || product.id)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-400 rounded-xl transition-colors cursor-pointer"
                          title="معاينة المنتج في المتجر"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-2 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                          title="حذف المنتج"
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

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            عرض الصفحة <span className="font-bold text-white">{currentPage}</span> من{' '}
            <span className="font-bold text-white">{totalPages}</span> (إجمالي{' '}
            <span className="font-bold text-white">{totalCount}</span> منتج)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pNum: number;
              if (totalPages <= 5) {
                pNum = i + 1;
              } else if (currentPage <= 3) {
                pNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pNum = totalPages - 4 + i;
              } else {
                pNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-8 h-8 rounded-xl font-bold transition-colors cursor-pointer ${
                    currentPage === pNum
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 text-rose-400 border border-rose-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">تأكيد حذف المنتج</h3>
              <p className="text-xs text-slate-400">
                هل أنت متأكد من رغبتك في حذف المنتج "{productToDelete.title}"؟
              </p>
              <p className="text-[11px] text-rose-400 font-semibold mt-2">
                تنبيه: يمكنك استرجاع المنتج لاحقاً من قسم "النسخ الاحتياطي" إذا كان لديك نسخة محفوظة.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، احذف المنتج'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
