import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingBag,
  Check,
  Phone,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  ChevronRight,
  ChevronLeft,
  Share2,
  AlertCircle,
  Clock,
  Sparkles,
  MessageCircle,
  MapPin,
  Layers,
} from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from '../components/ProductCard';
import * as api from '../lib/api';

interface ProductDetailPageProps {
  idOrHandle: string;
  onNavigate: (path: string, query?: Record<string, string>) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ idOrHandle, onNavigate }) => {
  const { addItemToCart, isInWishlist, toggleWishlist, showToast } = useCart();
  const {
    t,
    dir,
    isRtl,
    language,
    storeName,
    translateCategory,
    translateProductTitle,
    translateOptionName,
    translateOptionValue,
    formatPrice,
  } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Review Form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await api.fetchProductDetail(idOrHandle);
        if (res.success) {
          const prod: Product = res.product;
          setProduct(prod);
          setRelatedProducts(res.relatedProducts || []);

          // Initialize selected options & variant
          if (prod.options && prod.options.length > 0) {
            const initialOpts: Record<string, string> = {};
            prod.options.forEach(opt => {
              if (opt.values && opt.values.length > 0) {
                const firstVal = opt.values[0];
                initialOpts[opt.name] = typeof firstVal === 'string' ? firstVal : firstVal.name;
              }
            });
            setSelectedOptions(initialOpts);

            // Find matching variant
            const matched = prod.variants.find(v =>
              prod.options?.every(opt =>
                v.selectedOptions?.some(so => so.optionName === opt.name && so.valueName === initialOpts[opt.name])
              )
            );
            if (matched) {
              setSelectedVariantId(matched.id);
            } else if (prod.variants.length > 0) {
              setSelectedVariantId(prod.variants[0].id);
            }
          } else if (prod.variants.length > 0) {
            setSelectedVariantId(prod.variants[0].id);
          }

          // Fetch reviews
          const revRes = await api.fetchReviews(prod.id);
          if (revRes.success) {
            setReviews(revRes.reviews);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [idOrHandle]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-slate-100 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-100 rounded w-1/3" />
            <div className="h-10 bg-slate-100 rounded w-3/4" />
            <div className="h-8 bg-slate-100 rounded w-1/4" />
            <div className="h-24 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4" dir={dir}>
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {isRtl ? 'عذراً، هذا المنتج غير متوفر' : 'Sorry, this product is unavailable'}
        </h2>
        <p className="text-xs text-slate-500">
          {isRtl ? 'ربما تم حذف المنتج أو تعديل رابطه' : 'The product might have been deleted or the link modified'}
        </p>
        <button
          onClick={() => onNavigate('/shop')}
          className="bg-sky-700 hover:bg-sky-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer"
        >
          {isRtl ? 'العودة إلى المتجر' : 'Return to Shop'}
        </button>
      </div>
    );
  }

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  const currentPrice = selectedVariant?.price ?? product.price;
  const currentComparePrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const currentSku = selectedVariant?.sku || product.sku;
  const currentInStock = selectedVariant
    ? (selectedVariant.stock !== undefined ? selectedVariant.stock > 0 : (selectedVariant.enabled !== false && product.isInStock))
    : product.isInStock;

  const variantImgSrc = typeof selectedVariant?.image === 'string' 
    ? selectedVariant.image 
    : selectedVariant?.image?.src;
  
  const allImages = [...product.images];
  if (variantImgSrc && !allImages.some(img => img.src === variantImgSrc)) {
    allImages.unshift({
      id: `img_var_${selectedVariant?.id}`,
      src: variantImgSrc,
      altText: selectedVariant?.title || product.title,
      isPrimary: true,
    });
  }

  const images = allImages.length > 0
    ? allImages
    : [{ id: '1', src: 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png', altText: product.title }];

  const activeImage = images[selectedImageIdx] || images[0];

  const handleOptionSelect = (optionName: string, valueName: string) => {
    if (!product) return;
    const newOptions = { ...selectedOptions, [optionName]: valueName };
    setSelectedOptions(newOptions);

    // Find variant that matches all current selections
    const matched = product.variants.find(v => {
      if (!v.selectedOptions || v.selectedOptions.length === 0) return false;
      return Object.entries(newOptions).every(([optName, valName]) =>
        v.selectedOptions?.some(so => so.optionName === optName && so.valueName === valName)
      );
    });

    if (matched) {
      setSelectedVariantId(matched.id);
      const vImg = typeof matched.image === 'string' ? matched.image : matched.image?.src;
      if (vImg) {
        const foundIdx = images.findIndex(img => img.src === vImg);
        if (foundIdx >= 0) {
          setSelectedImageIdx(foundIdx);
        }
      }
    }
  };

  const handleAddToCart = async () => {
    if (!currentInStock || isAdding) return;
    setIsAdding(true);
    try {
      await addItemToCart(product, selectedVariantId, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!currentInStock) return;
    await addItemToCart(product, selectedVariantId, quantity);
    onNavigate('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const variantTitle = selectedVariant ? ` (${selectedVariant.title})` : '';
    const localizedTitle = translateProductTitle(product);
    const message = encodeURIComponent(
      isRtl
        ? `مرحباً ${storeName}، أود الاستفسار والطلب للمنتج التالي:\n\n*المنتج:* ${localizedTitle}${variantTitle}\n*السعر:* ${formatPrice(currentPrice)}\n*الكمية:* ${quantity}\n\nيرجى تأكيد التوفر والتوصيل داخل دولة الكويت.`
        : `Hello ${storeName}, I would like to order the following product:\n\n*Product:* ${localizedTitle}${variantTitle}\n*Price:* ${formatPrice(currentPrice)}\n*Quantity:* ${quantity}\n\nPlease confirm availability and delivery within Kuwait.`
    );
    window.open(`https://wa.me/96597123698?text=${message}`, '_blank');
  };

  const handleShare = () => {
    const localizedTitle = translateProductTitle(product);
    if (navigator.share) {
      navigator.share({
        title: localizedTitle,
        text: isRtl ? `تصفح "${localizedTitle}" في ${storeName}` : `Check out "${localizedTitle}" at ${storeName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(isRtl ? 'تم نسخ رابط المنتج إلى الحافظة بنجاح' : 'Product link copied to clipboard', 'success');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await api.submitReview({
        productId: product.id,
        authorName: reviewerName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (res.success) {
        setReviews(prev => [res.review, ...prev]);
        setReviewerName('');
        setReviewComment('');
        showToast(isRtl ? 'شكراً لك! تم نشر تقييمك بنجاح' : 'Thank you! Your review has been posted', 'success');
      }
    } catch (err: any) {
      showToast(err.message || (isRtl ? 'فشل إرسال التقييم' : 'Failed to submit review'), 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isFavorite = isInWishlist(product.id);
  const localizedTitle = translateProductTitle(product);
  const localizedCategory = product.categoryName ? translateCategory(product.categoryName) : '';

  const BreadcrumbSep = isRtl ? (
    <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
  ) : (
    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10" dir={dir}>
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium flex-wrap">
        <button onClick={() => onNavigate('/')} className="hover:text-sky-700 cursor-pointer">
          {t('nav.home')}
        </button>
        {BreadcrumbSep}
        <button onClick={() => onNavigate('/shop')} className="hover:text-sky-700 cursor-pointer">
          {t('nav.shop')}
        </button>
        {product.categoryName && (
          <>
            {BreadcrumbSep}
            <button
              onClick={() => onNavigate('/shop', { category: product.categoryName || '' })}
              className="hover:text-sky-700 cursor-pointer"
            >
              {localizedCategory}
            </button>
          </>
        )}
        {BreadcrumbSep}
        <span className="text-slate-900 font-bold truncate max-w-xs">{localizedTitle}</span>
      </nav>

      {/* Main Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 p-6 relative flex items-center justify-center shadow-xs">
            <img
              src={activeImage.src}
              alt={localizedTitle}
              className="w-full h-full object-contain mix-blend-multiply transition-all duration-300"
            />

            {/* Badges */}
            <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} flex flex-col gap-1.5`}>
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                  {isRtl ? `وفر ${product.discountPercentage}%` : `Save ${product.discountPercentage}%`}
                </span>
              )}
              {product.isNewArrival && (
                <span className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                  {t('common.new_badge')}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} flex items-center gap-2`}>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-600 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
                title={t('product.share')}
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full bg-white/80 hover:bg-white shadow-md backdrop-blur-xs transition-colors cursor-pointer ${
                  isFavorite ? 'text-rose-600' : 'text-slate-400 hover:text-rose-600'
                }`}
                title={t('common.wishlist')}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 rounded-2xl border-2 overflow-hidden bg-slate-50 p-1.5 shrink-0 transition-all cursor-pointer ${
                    selectedImageIdx === idx
                      ? 'border-sky-600 ring-2 ring-sky-100 shadow-sm'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.src} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Buy Controls */}
        <div className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
              {product.categoryName && (
                <button
                  onClick={() => onNavigate('/shop', { category: product.categoryName || '' })}
                  className="bg-sky-50 text-sky-800 font-bold px-3 py-1 rounded-lg hover:bg-sky-100 transition-colors cursor-pointer"
                >
                  {localizedCategory}
                </button>
              )}
              {currentSku && (
                <span className="font-mono text-slate-500 text-xs italic">
                  {isRtl ? `رقم المنتج: ${currentSku}` : `SKU: ${currentSku}`}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
              {localizedTitle}
            </h1>
          </div>

          {/* Price Container */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">{t('product.price')}:</span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-sky-900">
                  {formatPrice(currentPrice)}
                </span>
                {currentComparePrice && currentComparePrice > currentPrice && (
                  <span className="text-sm sm:text-base text-slate-400 line-through">
                    {formatPrice(currentComparePrice)}
                  </span>
                )}
              </div>
            </div>

            <div>
              {currentInStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {t('product.in_stock')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1.5 rounded-xl">
                  {t('product.out_of_stock')}
                </span>
              )}
            </div>
          </div>

          {/* Options & Variants Selector */}
          {product.options && product.options.length > 0 ? (
            <div className="space-y-4 pt-1">
              {product.options.map(opt => (
                <div key={opt.id || opt.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{translateOptionName(opt.name)}:</span>
                    {selectedOptions[opt.name] && (
                      <span className="font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-md text-[11px]">
                        {translateOptionValue(selectedOptions[opt.name])}
                      </span>
                    )}
                  </div>

                  {opt.values.length > 10 ? (
                    <select
                      value={selectedOptions[opt.name] || ''}
                      onChange={e => handleOptionSelect(opt.name, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      {opt.values.map((val: any) => {
                        const valName = typeof val === 'string' ? val : val.name;
                        const valKey = typeof val === 'string' ? val : (val.id || val.name);
                        return (
                          <option key={valKey} value={valName}>
                            {translateOptionValue(valName)}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val: any) => {
                        const valName = typeof val === 'string' ? val : val.name;
                        const valKey = typeof val === 'string' ? val : (val.id || val.name);
                        const isSelected = selectedOptions[opt.name] === valName;
                        return (
                          <button
                            key={valKey}
                            type="button"
                            onClick={() => handleOptionSelect(opt.name, valName)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            {translateOptionValue(valName)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {currentSku && (
                <div className="text-xs text-slate-500 italic font-medium pt-1">
                  {isRtl ? `رقم المنتج: ${currentSku}` : `SKU: ${currentSku}`}
                </div>
              )}
            </div>
          ) : product.variants.length > 1 ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>{t('product.select_variant')}:</span>
                </label>
                {selectedVariant && (
                  <span className="text-xs font-bold text-sky-700">
                    {translateOptionValue(selectedVariant.title)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.variants.map(v => {
                  const isSelected = selectedVariantId === v.id;
                  const isAvailable = v.stock !== undefined ? v.stock > 0 : v.enabled !== false && product.isInStock;
                  const displayTitle = translateOptionValue(v.selectedOptions?.[0]?.valueName || v.title);

                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        const vImg = typeof v.image === 'string' ? v.image : v.image?.src;
                        if (vImg) {
                          const fIdx = images.findIndex(img => img.src === vImg);
                          if (fIdx >= 0) setSelectedImageIdx(fIdx);
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : isAvailable
                          ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                          : 'border-slate-200 bg-slate-100 text-slate-400 opacity-60'
                      }`}
                    >
                      <span>{displayTitle}</span>
                      {v.price !== product.price && (
                        <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                          isSelected ? 'bg-slate-800 text-sky-300' : 'bg-sky-100/70 text-sky-800'
                        }`}>
                          {formatPrice(v.price)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {currentSku && (
                <div className="text-xs text-slate-500 italic font-medium pt-1">
                  {isRtl ? `رقم المنتج: ${currentSku}` : `SKU: ${currentSku}`}
                </div>
              )}
            </div>
          ) : (
            currentSku && (
              <div className="text-xs text-slate-500 italic font-medium">
                {isRtl ? `رقم المنتج: ${currentSku}` : `SKU: ${currentSku}`}
              </div>
            )
          )}

          {/* Quantity Counter */}
          <div className="flex items-center gap-4">
            <label className="text-xs font-bold text-slate-800">{t('product.quantity')}:</label>
            <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 text-sm font-bold transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="px-4 py-1.5 text-sm font-bold text-slate-900 min-w-10 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 text-sm font-bold transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Purchase Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!currentInStock || isAdding}
                className={`flex-1 py-3.5 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  !currentInStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sky-700 hover:bg-sky-800 text-white hover:shadow-lg'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>{t('product.added')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>{t('product.add_to_cart')}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!currentInStock}
                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-6 rounded-2xl text-sm transition-all shadow-xs cursor-pointer text-center"
              >
                {t('product.buy_now')}
              </button>
            </div>

            {/* Direct WhatsApp Ordering & Store Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsAppOrder}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isRtl ? 'طلب عبر واتساب (97123698 965+)' : 'Order via WhatsApp (+965 97123698)'}</span>
              </button>

              <a
                href="https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic"
                target="_blank"
                rel="noreferrer"
                className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-center"
              >
                <MapPin className="w-4 h-4 text-sky-700" />
                <span>{isRtl ? 'زيارة المتجر (خرائط جوجل)' : 'Visit Store (Google Maps)'}</span>
              </a>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Truck className="w-4 h-4 text-sky-700 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">
                {isRtl ? 'توصيل سريع' : 'Fast Delivery'}
              </span>
              <span className="text-[10px] text-slate-500">
                {isRtl ? 'لكافة مناطق الكويت' : 'All Kuwait areas'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">
                {isRtl ? 'منتج أصلي 100%' : '100% Original'}
              </span>
              <span className="text-[10px] text-slate-500">
                {isRtl ? 'أعلى معايير الجودة' : 'Highest standards'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <RotateCcw className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">
                {isRtl ? 'استبدال سهل' : 'Easy Exchange'}
              </span>
              <span className="text-[10px] text-slate-500">
                {isRtl ? 'خلال 14 يوماً' : 'Within 14 days'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Reviews Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
            {t('product.description')}
          </h2>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {product.description ||
              (isRtl
                ? 'منتج أصلي ومميز من مكتبة الشاطئ الازرق، يلبي كافة احتياجاتكم المدرسية والمكتبية.'
                : 'Genuine and premium product from Blue Beach Stationery, meeting all your school and office needs.')}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('product.reviews')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl ? 'شاركنا تجربتك وتقييمك لهذا المنتج' : 'Share your feedback and rating for this product'}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-extrabold text-amber-800">5.0 / 5</span>
              <span className="text-[11px] text-amber-600 font-medium">
                ({reviews.length} {isRtl ? 'تقييم' : 'reviews'})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-3">
              {reviews.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                  {isRtl ? 'كن أول من يقيّم هذا المنتج!' : 'Be the first to review this product!'}
                </div>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{rev.authorName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                            {isRtl ? 'مشتري مؤكد' : 'Verified Buyer'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(rev.createdAt).toLocaleDateString(language === 'ar' ? 'ar-KW' : 'en-US')}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Review Form */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3.5 h-fit">
              <h4 className="text-xs font-bold text-slate-800">
                {isRtl ? 'أضف تقييمك' : 'Add Your Review'}
              </h4>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isRtl ? 'الاسم الكريم:' : 'Your Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={e => setReviewerName(e.target.value)}
                    placeholder={isRtl ? 'مثال: أحمد الكندري' : 'e.g. Ahmed Al-Kandari'}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isRtl ? 'درجة التقييم:' : 'Rating:'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isRtl ? 'التعليق / الملاحظات:' : 'Review / Comments:'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder={isRtl ? 'اكتب تجربتك مع المنتج...' : 'Share your experience with this product...'}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {isSubmittingReview
                    ? (isRtl ? 'جاري النشر...' : 'Submitting...')
                    : (isRtl ? 'إرسال التقييم' : 'Submit Review')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">{t('product.related_products')}</h2>
            <button
              onClick={() => onNavigate('/shop', { category: product.categoryName || '' })}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
            >
              {isRtl ? 'عرض المزيد من هذا القسم' : 'View more in this category'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
