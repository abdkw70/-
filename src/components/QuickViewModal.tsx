import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Heart, Check, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface QuickViewModalProps {
  onNavigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ onNavigate }) => {
  const { quickViewProduct, closeQuickView, addItemToCart, formatPrice, isInWishlist, toggleWishlist } = useCart();
  const { t, isRtl, dir, translateCategory, translateProductTitle, translateOptionName, translateOptionValue } = useLanguage();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedImageIdx(0);
      setQuantity(1);
      if (quickViewProduct.options && quickViewProduct.options.length > 0) {
        const initialOpts: Record<string, string> = {};
        quickViewProduct.options.forEach(opt => {
          if (opt.values && opt.values.length > 0) {
            const firstVal = opt.values[0];
            initialOpts[opt.name] = typeof firstVal === 'string' ? firstVal : firstVal.name;
          }
        });
        setSelectedOptions(initialOpts);

        const matched = quickViewProduct.variants.find(v =>
          quickViewProduct.options?.every(opt =>
            v.selectedOptions?.some(so => so.optionName === opt.name && so.valueName === initialOpts[opt.name])
          )
        );
        if (matched) {
          setSelectedVariantId(matched.id);
        } else if (quickViewProduct.variants.length > 0) {
          setSelectedVariantId(quickViewProduct.variants[0].id);
        }
      } else if (quickViewProduct.variants.length > 0) {
        setSelectedVariantId(quickViewProduct.variants[0].id);
      }
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const productTitle = translateProductTitle(product);
  const productCategory = translateCategory(product.categoryName);

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  const currentPrice = selectedVariant?.price ?? product.price;
  const currentComparePrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const currentSku = selectedVariant?.sku || product.sku;
  const currentInStock = selectedVariant
    ? (selectedVariant.enabled !== false && selectedVariant.isInStock !== false && (selectedVariant.stock === undefined || selectedVariant.stock === null || selectedVariant.stock > 0 || product.isInStock !== false))
    : (product.isInStock !== false);

  const variantImgSrc = typeof selectedVariant?.image === 'string' 
    ? selectedVariant.image 
    : selectedVariant?.image?.src;
  
  const allImages = [...product.images];
  if (variantImgSrc && !allImages.some(img => img.src === variantImgSrc)) {
    allImages.unshift({
      id: `img_var_${selectedVariant?.id}`,
      src: variantImgSrc,
      altText: selectedVariant?.title || productTitle,
      isPrimary: true,
    });
  }

  const images = allImages.length > 0
    ? allImages
    : [{ id: '1', src: 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png', altText: productTitle }];

  const activeImage = images[selectedImageIdx] || images[0];

  const handleOptionSelect = (optionName: string, valueName: string) => {
    const newOptions = { ...selectedOptions, [optionName]: valueName };
    setSelectedOptions(newOptions);

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
      setTimeout(() => {
        setAddedSuccess(false);
        closeQuickView();
      }, 1200);
    } finally {
      setIsAdding(false);
    }
  };

  const isFavorite = isInWishlist(product.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir={dir}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeQuickView}
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 pt-safe pb-safe">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-4 sm:p-6 overflow-hidden max-h-[90dvh] overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-150">
          {/* Close button */}
          <button
            onClick={closeQuickView}
            className={`absolute top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10 cursor-pointer ${
              isRtl ? 'left-4' : 'right-4'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gallery Side */}
            <div className="space-y-3">
              <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center p-4 relative">
                <img
                  src={activeImage.src}
                  alt={productTitle}
                  className="w-full h-full object-contain mix-blend-multiply"
                />

                {product.discountPercentage && product.discountPercentage > 0 && (
                  <span className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                    {t('product.discount_off', '', { percent: product.discountPercentage })}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-14 h-14 rounded-lg border-2 overflow-hidden bg-slate-50 p-1 shrink-0 transition-all cursor-pointer ${
                        selectedImageIdx === idx ? 'border-sky-600 ring-2 ring-sky-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.src} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Side */}
            <div className={`flex flex-col justify-between space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                  {productCategory && (
                    <span className="bg-sky-50 text-sky-800 font-semibold px-2.5 py-0.5 rounded-md">
                      {productCategory}
                    </span>
                  )}
                  {currentSku && (
                    <span className="font-mono text-slate-500 italic text-[11px]">
                      {t('product.sku')}: {currentSku}
                    </span>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {productTitle}
                </h2>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-sky-800">
                    {formatPrice(currentPrice)}
                  </span>
                  {currentComparePrice && currentComparePrice > currentPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(currentComparePrice)}
                    </span>
                  )}
                </div>

                {/* Stock status */}
                <div className="mt-2 text-xs">
                  {currentInStock ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                      {t('product.in_stock')}
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold">{t('product.out_of_stock')}</span>
                  )}
                </div>

                {/* Options & Variants Selector */}
                {product.options && product.options.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {product.options.map(opt => {
                      const optNameTranslated = translateOptionName(opt.name);
                      return (
                        <div key={opt.id || opt.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">{optNameTranslated}:</span>
                            {selectedOptions[opt.name] && (
                              <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded text-[11px]">
                                {translateOptionValue(selectedOptions[opt.name])}
                              </span>
                            )}
                          </div>

                          {opt.values.length > 10 ? (
                            <select
                              value={selectedOptions[opt.name] || ''}
                              onChange={e => handleOptionSelect(opt.name, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
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
                            <div className="flex flex-wrap gap-1.5">
                              {opt.values.map((val: any) => {
                                const valName = typeof val === 'string' ? val : val.name;
                                const valKey = typeof val === 'string' ? val : (val.id || val.name);
                                const isSelected = selectedOptions[opt.name] === valName;
                                return (
                                  <button
                                    key={valKey}
                                    type="button"
                                    onClick={() => handleOptionSelect(opt.name, valName)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
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
                      );
                    })}
                  </div>
                ) : product.variants.length > 1 ? (
                  <div className="mt-4 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {t('product.select_variant')}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map(v => {
                        const isSelected = selectedVariantId === v.id;
                        const optVal = v.selectedOptions?.[0]?.valueName || v.title;
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span>{translateOptionValue(optVal)}</span>
                            {v.price !== product.price && (
                              <span className="mr-1 text-[10px] font-mono opacity-80">
                                ({formatPrice(v.price)})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Quantity */}
                <div className="mt-4 flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700">{t('product.quantity')}:</label>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-sm font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-800 min-w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-sm font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!currentInStock || isAdding}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      !currentInStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : addedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sky-700 hover:bg-sky-800 text-white shadow-md'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{t('product.added')}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{t('product.add_to_cart')}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                      isFavorite ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-500 hover:text-rose-600'
                    }`}
                    title={t('nav.wishlist')}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-600' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    closeQuickView();
                    onNavigate(`/product/${encodeURIComponent(product.handle || product.id)}`);
                  }}
                  className="w-full text-center text-xs font-bold text-sky-700 hover:text-sky-900 py-1.5 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{t('product.view_details')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
