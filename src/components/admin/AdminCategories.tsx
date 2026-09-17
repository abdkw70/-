import React, { useState } from 'react';
import {
  FolderTree,
  ShieldCheck,
  Search,
  Package,
  Layers,
  Lock,
  ExternalLink,
  Info,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { Category, Product } from '../../types';

interface AdminCategoriesProps {
  categories: Category[];
  products: Product[];
  onSelectCategoryFilter: (categoryTitle: string) => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  products,
  onSelectCategoryFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<Category | null>(null);

  const filteredCategories = categories.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    c.handle.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>الأقسام والتصنيفات</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>محمية ضد الحذف والتعديل ({categories.length} قسم)</span>
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            استعراض هيكل الأقسام الـ84 للمتجر وتوزيع المنتجات الـ443 عليها
          </p>
        </div>
      </div>

      {/* Security Protection Notice */}
      <div className="bg-sky-950/40 border border-sky-800/50 rounded-3xl p-5 flex items-start gap-4">
        <div className="p-3 bg-sky-900/60 text-sky-400 rounded-2xl shrink-0 border border-sky-700/40">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="font-bold text-white text-sm">
            حماية استقرار شجرة الأقسام والتصنيفات الأساسية
          </h3>
          <p className="text-slate-300 leading-relaxed">
            تم قفل الأقسام الأساسية الحالية لمنع حدوث أي كسر في روابط التصنيفات أو فقدان ربط المنتجات الـ443. يمكنك استعراض جميع الأقسام والبحث فيها وعرض المنتجات التابعة لكل قسم مباشرة.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في أسماء الأقسام والتصنيفات..."
            className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map(category => {
          const categoryProducts = products.filter(
            p => p.categoryName === category.title || p.categoryId === category.id || p.subcategoryName === category.title
          );
          const count = categoryProducts.length;

          return (
            <div
              key={category.id}
              onClick={() => onSelectCategoryFilter(category.title)}
              className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-4 transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-sky-600/20 text-slate-400 group-hover:text-sky-400 flex items-center justify-center transition-colors">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 group-hover:text-sky-300 transition-colors">
                    {count} منتج
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-1">
                    {category.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
                    /{category.handle}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-sky-400 font-semibold">
                <span>استعراض منتجات القسم</span>
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">لا توجد أقسام تطابق كلمة البحث</h3>
          <p className="text-xs text-slate-500">جرب كتابة اسم قسم آخر</p>
        </div>
      )}
    </div>
  );
};
