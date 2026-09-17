import React, { useState } from 'react';
import { Eye, Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addItemToCart, openQuickView, isInWishlist, toggleWishlist } = useCart();
  const { dir, isRtl, language, t, formatPrice, translateCategory, translateProductTitle } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images[0]?.src || 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png';
  const secondaryImage = product.images[1]?.src || primaryImage;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.isInStock || isAdding) return;

    setIsAdding(true);
    try {
      await addItemToCart(product, undefined, 1);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickView(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const isFavorite = isInWishlist(product.id);
  const displayTitle = translateProductTitle(product);
  const displayCategory = translateCategory(product.categoryName);

  return (
    <div
      onClick={() => onNavigate(`/product/${encodeURIComponent(product.handle || product.id)}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl border border-slate-100/80 hover:border-sky-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
      dir={dir}
    >
      {/* Top Media Container */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-3">
        {/* Badges */}
        <div className={`absolute top-2.5 ${isRtl ? 'right-2.5' : 'left-2.5'} z-10 flex flex-col gap-1 items-start pointer-events-none`}>
          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {t('product.discount_off', `خصم ${product.discountPercentage}%`, { percent: product.discountPercentage })}
            </span>
          ) : null}

          {product.isNewArrival && !product.discountPercentage && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {t('nav.new_arrivals', 'وصل حديثاً')}
            </span>
          )}

          {!product.isInStock && (
            <span className="bg-slate-800/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
              {t('product.out_of_stock', 'نفذت الكمية')}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 ${isRtl ? 'left-2.5' : 'right-2.5'} z-10 p-2 rounded-full backdrop-blur-xs transition-all ${
            isFavorite
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 text-slate-400 hover:text-rose-600 hover:bg-white'
          } shadow-xs`}
          title={isFavorite ? (isRtl ? 'إزالة من المفضلة' : 'Remove from Wishlist') : (isRtl ? 'إضافة إلى المفضلة' : 'Add to Wishlist')}
          aria-label={t('nav.wishlist', 'المفضلة')}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Product Images with subtle cross-fade */}
        <img
          src={isHovered && secondaryImage !== primaryImage ? secondaryImage : primaryImage}
          alt={displayTitle}
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Quick View Button on Hover */}
        <button
          onClick={handleQuickView}
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap z-10"
        >
          <Eye className="w-3.5 h-3.5 text-sky-700" />
          <span>{t('product.quick_view', 'معاينة سريعة')}</span>
        </button>
      </div>

      {/* Product Content Details */}
      <div className={`p-3.5 flex flex-col flex-1 justify-between gap-3 ${isRtl ? 'text-right' : 'text-left'}`}>
        <div>
          {/* Category Tag */}
          {displayCategory && (
            <span className="inline-block text-[11px] font-medium text-slate-400 mb-1 truncate max-w-full">
              {displayCategory}
            </span>
          )}

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors">
            {displayTitle}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Price Container */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-sky-800">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[11px] text-slate-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            {product.variants.length > 1 && (
              <span className="text-[10px] text-slate-500">
                {language === 'ar' ? 'متعدد الخيارات' : 'Options Available'}
              </span>
            )}
          </div>

          {/* Add to Cart Icon Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.isInStock || isAdding}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
              !product.isInStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : addedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-700 hover:text-white active:scale-95'
            }`}
            title={product.isInStock ? t('product.add_to_cart', 'أضف للسلة') : t('product.out_of_stock', 'غير متوفر')}
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'ar' ? 'أضيف!' : 'Added!'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'ar' ? 'أضف' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
