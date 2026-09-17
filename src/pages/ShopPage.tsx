import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Sparkles, Check, ChevronDown, Heart, Search, Grid, List } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import * as api from '../lib/api';

interface ShopPageProps {
  categories: Category[];
  initialParams?: { [key: string]: string | undefined };
  onNavigate: (path: string, query?: Record<string, string>) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  categories,
  initialParams,
  onNavigate,
}) => {
  const params = initialParams || {};
  const { wishlist } = useCart();
  const { dir, isRtl, language, t, translateCategory, formatPrice } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, totalPages: 1 });

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(params.category || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(params.subcategory || '');
  const [searchQuery, setSearchQuery] = useState<string>(params.q || '');
  const [minPrice, setMinPrice] = useState<string>(params.minPrice || '');
  const [maxPrice, setMaxPrice] = useState<string>(params.maxPrice || '');
  const [inStockOnly, setInStockOnly] = useState<boolean>(params.inStock === 'true');
  const [discountOnly, setDiscountOnly] = useState<boolean>(params.hasDiscount === 'true');
  const [isWishlistOnly, setIsWishlistOnly] = useState<boolean>(params.wishlist === 'true');
  const [sortBy, setSortBy] = useState<string>(params.sort || 'default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync initial params on change
  useEffect(() => {
    if (params.category) setSelectedCategory(params.category);
    if (params.subcategory) setSelectedSubcategory(params.subcategory);
    if (params.q !== undefined) setSearchQuery(params.q);
    if (params.hasDiscount !== undefined) setDiscountOnly(params.hasDiscount === 'true');
    if (params.wishlist !== undefined) setIsWishlistOnly(params.wishlist === 'true');
  }, [params.category, params.subcategory, params.q, params.hasDiscount, params.wishlist]);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const res = await api.fetchProducts({
          q: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          subcategory: selectedSubcategory || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          inStock: inStockOnly || undefined,
          hasDiscount: discountOnly || undefined,
          sort: sortBy,
          page: currentPage,
          limit: 24,
        });

        if (res.success) {
          let list = res.products;
          if (isWishlistOnly) {
            list = list.filter(p => wishlist.includes(p.id));
          }
          setProducts(list);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    minPrice,
    maxPrice,
    inStockOnly,
    discountOnly,
    isWishlistOnly,
    sortBy,
    currentPage,
    wishlist,
  ]);

  const rootCategories = categories.filter(c => !c.parentId);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setDiscountOnly(false);
    setIsWishlistOnly(false);
    setSortBy('default');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    Boolean(selectedSubcategory) ||
    Boolean(searchQuery) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    inStockOnly ||
    discountOnly ||
    isWishlistOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6" dir={dir}>
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isWishlistOnly
              ? (isRtl ? 'قائمة الرغبات والمفضلة' : 'My Wishlist & Favorites')
              : selectedCategory !== 'all'
              ? translateCategory(selectedCategory)
              : searchQuery
              ? (isRtl ? `نتائج البحث عن: "${searchQuery}"` : `Search results for: "${searchQuery}"`)
              : (isRtl ? 'جميع المنتجات' : 'All Products')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl
              ? `عرض ${products.length} من إجمالي ${pagination.total} منتج`
              : `Showing ${products.length} of ${pagination.total} products`}
          </p>
        </div>

        {/* Top Controls: Mobile filter trigger & Sort dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
          >
            <Filter className="w-4 h-4 text-sky-700" />
            <span>
              {isRtl
                ? `تصفية (${hasActiveFilters ? 'مفعل' : 'الكل'})`
                : `Filter (${hasActiveFilters ? 'Active' : 'All'})`}
            </span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              aria-label={t('shop.sort_by')}
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="default">{t('shop.sort_default')}</option>
              <option value="price_asc">{t('shop.sort_price_asc')}</option>
              <option value="price_desc">{t('shop.sort_price_desc')}</option>
              <option value="discount">{t('shop.sort_discount')}</option>
              <option value="newest">{t('shop.sort_newest')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
          <span className="font-bold text-slate-600">{t('shop.active_filters')}</span>

          {selectedCategory !== 'all' && (
            <span className="bg-sky-100 text-sky-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              {isRtl ? 'القسم: ' : 'Category: '} {translateCategory(selectedCategory)}
              <button onClick={() => setSelectedCategory('all')} className="hover:text-sky-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedSubcategory && (
            <span className="bg-sky-100 text-sky-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              {isRtl ? 'الفرع: ' : 'Subcategory: '} {selectedSubcategory}
              <button onClick={() => setSelectedSubcategory('')} className="hover:text-sky-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              {isRtl ? 'بحث: ' : 'Search: '} {searchQuery}
              <button onClick={() => setSearchQuery('')} className="hover:text-amber-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {discountOnly && (
            <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              {t('shop.discounts_only')}
              <button onClick={() => setDiscountOnly(false)} className="hover:text-rose-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              {t('shop.in_stock_only')}
              <button onClick={() => setInStockOnly(false)} className="hover:text-emerald-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {isWishlistOnly && (
            <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              {isRtl ? `المفضلة فقط (${wishlist.length})` : `Wishlist only (${wishlist.length})`}
              <button onClick={() => setIsWishlistOnly(false)} className="hover:text-rose-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetAllFilters}
            className={`text-rose-600 hover:text-rose-800 font-bold underline ${isRtl ? 'mr-auto' : 'ml-auto'} text-xs cursor-pointer`}
          >
            {t('shop.reset_filters')}
          </button>
        </div>
      )}

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-sky-700" />
              <span>{t('shop.filter')}</span>
            </h3>
            {hasActiveFilters && (
              <button onClick={resetAllFilters} className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer">
                {t('shop.clear_filters')}
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase">{t('shop.categories')}</h4>
            <div className={`space-y-1 max-h-60 overflow-y-auto ${isRtl ? 'pr-1' : 'pl-1'}`}>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('');
                  setCurrentPage(1);
                }}
                className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedCategory === 'all' ? 'bg-sky-50 text-sky-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{t('shop.all_categories')}</span>
              </button>

              {rootCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.title);
                    setSelectedSubcategory('');
                    setCurrentPage(1);
                  }}
                  className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === cat.title ? 'bg-sky-50 text-sky-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{translateCategory(cat.title)}</span>
                  {cat.productCount ? (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                      {cat.productCount}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase">{t('shop.price_range')}</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                value={minPrice}
                onChange={e => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t('shop.from')}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                step="0.1"
                min="0"
                value={maxPrice}
                onChange={e => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t('shop.to')}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
            </div>
          </div>

          {/* Checkbox toggles */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={discountOnly}
                onChange={e => {
                  setDiscountOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <span>{t('shop.discounts_only')}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => {
                  setInStockOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
              />
              <span>{t('shop.in_stock_only')}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isWishlistOnly}
                onChange={e => {
                  setIsWishlistOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <span>{isRtl ? `قائمة المفضلة (${wishlist.length})` : `Wishlist (${wishlist.length})`}</span>
            </label>
          </div>
        </div>

        {/* Products Grid Column */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
                  <div className="aspect-square bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">{t('shop.no_products')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {isRtl
                  ? 'جرّب تعديل الفلاتر أو البحث بكلمات أخرى للوصول إلى المستلزمات المطلوبة'
                  : 'Try adjusting filters or search with different keywords'}
              </p>
              <button
                onClick={resetAllFilters}
                className="bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors cursor-pointer"
              >
                {t('shop.reset_filters')}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-6">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                  >
                    {t('shop.pagination_prev')}
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - currentPage) <= 2)
                    .map((pageNum, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <React.Fragment key={pageNum}>
                          {prev && pageNum - prev > 1 && (
                            <span className="px-2 text-slate-400 text-xs">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-sky-700 text-white'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                  >
                    {t('shop.pagination_next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" dir={dir}>
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} max-w-xs w-full bg-white shadow-2xl p-5 flex flex-col justify-between overflow-y-auto`}>
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">{t('shop.filter')}</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700">{t('shop.categories')}</h4>
                <div className={`space-y-1 max-h-48 overflow-y-auto ${isRtl ? 'pr-1' : 'pl-1'}`}>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setCurrentPage(1);
                    }}
                    className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-2.5 py-1.5 rounded-lg text-xs font-semibold block cursor-pointer ${
                      selectedCategory === 'all' ? 'bg-sky-50 text-sky-800 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {t('shop.all_categories')}
                  </button>
                  {rootCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.title);
                        setCurrentPage(1);
                      }}
                      className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-2.5 py-1.5 rounded-lg text-xs font-semibold block cursor-pointer ${
                        selectedCategory === cat.title ? 'bg-sky-50 text-sky-800 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {translateCategory(cat.title)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discountOnly}
                    onChange={e => setDiscountOnly(e.target.checked)}
                    className="rounded text-rose-600 cursor-pointer"
                  />
                  <span>{t('shop.discounts_only')}</span>
                </label>
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => setInStockOnly(e.target.checked)}
                    className="rounded text-sky-600 cursor-pointer"
                  />
                  <span>{t('shop.in_stock_only')}</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-sky-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                {isRtl ? `تطبيق الفلاتر (${products.length} نتيجة)` : `Apply Filters (${products.length} results)`}
              </button>
              <button
                onClick={() => {
                  resetAllFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs cursor-pointer"
              >
                {t('shop.reset_filters')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
