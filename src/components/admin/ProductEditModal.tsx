import React, { useState } from 'react';
import {
  X,
  Upload,
  Trash2,
  Star,
  Plus,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Layers,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Info,
  DollarSign,
  Tag,
  Pencil,
} from 'lucide-react';
import { Product, Category, ProductVariant } from '../../types';
import * as api from '../../lib/api';

interface ProductEditModalProps {
  product: Partial<Product> | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: Product) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  categories,
  isOpen,
  onClose,
  onSaved,
  showToast,
}) => {
  if (!isOpen) return null;

  const isNew = !product?.id;

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    id: product?.id,
    title: product?.title || '',
    handle: product?.handle || '',
    price: product?.price ?? 0,
    compareAtPrice: product?.compareAtPrice ?? undefined,
    sku: product?.sku || '',
    description: product?.description || '',
    isInStock: product?.isInStock !== false,
    stockQuantity: product?.stockQuantity ?? 10,
    categoryId: product?.categoryId || (categories[0]?.id || ''),
    categoryName: product?.categoryName || (categories[0]?.title || 'الادوات المدرسية'),
    subcategoryName: product?.subcategoryName || '',
    images: Array.isArray(product?.images) ? [...product.images] : [],
    variants: Array.isArray(product?.variants) ? JSON.parse(JSON.stringify(product.variants)) : [],
    options: Array.isArray(product?.options) ? JSON.parse(JSON.stringify(product.options)) : [],
    isFeatured: Boolean(product?.isFeatured),
    isBestSeller: Boolean(product?.isBestSeller),
    isNewArrival: Boolean(product?.isNewArrival ?? true),
  });

  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'variants'>('info');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Product Options state
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState('');

  // Add new variant state
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant> & { imageStr?: string }>({
    title: '',
    price: formData.price ?? 0,
    compareAtPrice: undefined,
    sku: '',
    stockQuantity: 10,
    isInStock: true,
    imageStr: '',
  });
  const [showAddVariant, setShowAddVariant] = useState(false);

  // Edit existing variant state
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingVariantData, setEditingVariantData] = useState<Partial<ProductVariant> & { imageStr?: string }>({});

  const handlePriceChange = (val: number) => {
    const compare = formData.compareAtPrice;
    let disc: number | null = null;
    if (compare && compare > val) {
      disc = Math.round(((compare - val) / compare) * 100);
    }
    setFormData(prev => ({
      ...prev,
      price: val,
      discountPercentage: disc,
    }));
  };

  const handleComparePriceChange = (val?: number) => {
    const price = formData.price || 0;
    let disc: number | null = null;
    if (val && val > price) {
      disc = Math.round(((val - price) / val) * 100);
    }
    setFormData(prev => ({
      ...prev,
      compareAtPrice: val,
      discountPercentage: disc,
    }));
  };

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);

        const base64 = await base64Promise;
        const res = await api.uploadAdminImage(base64, file.name, file.type);
        if (res.success && res.url) {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), res.url],
          }));
          uploadedCount++;
        }
      } catch (err: any) {
        showToast(`فشل رفع ${file.name}: ${err.message}`, 'error');
      }
    }

    setIsUploading(false);
    if (uploadedCount > 0) {
      showToast(`تم رفع وحفظ ${uploadedCount} صورة بنجاح`, 'success');
    }
    e.target.value = '';
  };

  // Add Image via direct URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), imageUrlInput.trim()],
    }));
    setImageUrlInput('');
    showToast('تمت إضافة رابط الصورة', 'info');
  };

  // Delete Image
  const handleDeleteImage = (index: number) => {
    setFormData(prev => {
      const copy = [...(prev.images || [])];
      copy.splice(index, 1);
      return { ...prev, images: copy };
    });
  };

  // Set as Primary Image
  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const copy = [...(prev.images || [])];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return { ...prev, images: copy };
    });
    showToast('تم تعيين الصورة كصورة رئيسية للمنتج', 'info');
  };

  // Move Image Order
  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const copy = [...(prev.images || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, images: copy };
    });
  };

  // Manage Product Options
  const handleAddOption = () => {
    if (!newOptionName.trim()) {
      showToast('يرجى كتابة اسم الخاصية (مثال: اللون أو الحجم)', 'error');
      return;
    }
    const valuesArray = newOptionValues
      .split(/[,،]/)
      .map(v => v.trim())
      .filter(Boolean);
    if (valuesArray.length === 0) {
      showToast('يرجى كتابة خيار واحد على الأقل مفصولاً بفاصلة (مثال: أحمر، أزرق)', 'error');
      return;
    }

    const createdOpt = {
      id: `opt_${Date.now()}`,
      name: newOptionName.trim(),
      values: valuesArray,
    };

    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), createdOpt],
    }));
    setNewOptionName('');
    setNewOptionValues('');
    showToast('تمت إضافة خاصية المنتج بنجاح', 'success');
  };

  const handleDeleteOption = (optId: string) => {
    setFormData(prev => ({
      ...prev,
      options: (prev.options || []).filter(o => o.id !== optId),
    }));
  };

  // Add Variant
  const handleAddVariant = () => {
    if (!newVariant.title?.trim()) {
      showToast('يرجى كتابة اسم النوع / الخيار', 'error');
      return;
    }

    const createdVariant: ProductVariant = {
      id: `var_${Date.now()}`,
      title: newVariant.title.trim(),
      price: typeof newVariant.price === 'number' ? newVariant.price : (formData.price || 0),
      compareAtPrice: newVariant.compareAtPrice || undefined,
      sku: newVariant.sku?.trim() || undefined,
      stockQuantity: newVariant.stockQuantity ?? 10,
      isInStock: newVariant.isInStock !== false,
      image: newVariant.imageStr?.trim() ? newVariant.imageStr.trim() : undefined,
    };

    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), createdVariant],
    }));

    setNewVariant({
      title: '',
      price: formData.price ?? 0,
      compareAtPrice: undefined,
      sku: '',
      stockQuantity: 10,
      isInStock: true,
      imageStr: '',
    });
    setShowAddVariant(false);
    showToast('تمت إضافة النوع/الخيار بنجاح', 'success');
  };

  // Edit Existing Variant
  const handleStartEditVariant = (variant: ProductVariant) => {
    setEditingVariantId(variant.id);
    const imgStr = typeof variant.image === 'string' ? variant.image : variant.image?.src || '';
    setEditingVariantData({
      title: variant.title,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice ?? undefined,
      sku: variant.sku || '',
      stockQuantity: variant.stockQuantity ?? 10,
      isInStock: variant.isInStock !== false,
      imageStr: imgStr,
    });
  };

  const handleSaveVariantEdit = (varId: string) => {
    if (!editingVariantData.title?.trim()) {
      showToast('يرجى إدخال اسم الخيار', 'error');
      return;
    }

    setFormData(prev => ({
      ...prev,
      variants: (prev.variants || []).map(v => {
        if (v.id === varId) {
          return {
            ...v,
            title: editingVariantData.title!.trim(),
            price: typeof editingVariantData.price === 'number' ? editingVariantData.price : v.price,
            compareAtPrice: editingVariantData.compareAtPrice !== undefined ? editingVariantData.compareAtPrice : v.compareAtPrice,
            sku: editingVariantData.sku !== undefined ? editingVariantData.sku : v.sku,
            stockQuantity: editingVariantData.stockQuantity !== undefined ? Number(editingVariantData.stockQuantity) : (v.stockQuantity ?? 10),
            isInStock: editingVariantData.isInStock !== undefined ? editingVariantData.isInStock : v.isInStock,
            image: editingVariantData.imageStr?.trim() ? editingVariantData.imageStr.trim() : undefined,
          };
        }
        return v;
      }),
    }));

    setEditingVariantId(null);
    setEditingVariantData({});
    showToast('تم حفظ تعديل الخيار بنجاح', 'success');
  };

  const handleCancelVariantEdit = () => {
    setEditingVariantId(null);
    setEditingVariantData({});
  };

  // Delete Variant
  const handleDeleteVariant = (varId: string) => {
    setFormData(prev => ({
      ...prev,
      variants: (prev.variants || []).filter(v => v.id !== varId),
    }));
  };

  // Form Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      showToast('اسم المنتج مطلوب', 'error');
      return;
    }

    if (formData.price === undefined || formData.price < 0) {
      showToast('سعر المنتج غير صالح', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        const res = await api.saveAdminProduct(formData);
        if (res.success) {
          showToast(`تمت إضافة المنتج "${res.product.title}" بنجاح`, 'success');
          onSaved(res.product);
          onClose();
        }
      } else {
        const res = await api.updateAdminProduct(formData.id!, formData);
        if (res.success) {
          showToast(`تم حفظ تعديلات المنتج "${res.product.title}" بنجاح`, 'success');
          onSaved(res.product);
          onClose();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المنتج', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isNew ? 'إضافة منتج جديد' : `تعديل المنتج: ${formData.title}`}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isNew ? 'أدخل تفاصيل وسعر وصور المنتج الجديد' : `معرف المنتج: ${formData.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/20 px-6 gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            البيانات الأساسية والأسعار
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'images'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>إدارة الصور</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
              {formData.images?.length || 0}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'variants'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>الأشكال والخيارات (Variants)</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
              {formData.variants?.length || 0}
            </span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 flex-1 space-y-6">
          {/* TAB 1: Basic Info & Prices */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Title & Handle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    اسم المنتج <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: دفتر سلك مسطر 100 ورقة"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    الرمز التعريفي SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="مثال: BK-9021"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Price & Compare Price & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    السعر الحالي (د.ك) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    value={formData.price}
                    onChange={e => handlePriceChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    السعر قبل الخصم (اختياري)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.compareAtPrice ?? ''}
                    onChange={e => handleComparePriceChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="سعر المقارنة..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    نسبة الخصم المحسوبة
                  </label>
                  <div className="px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm font-bold text-rose-400">
                    {formData.discountPercentage ? `%${formData.discountPercentage} خصم` : 'لا يوجد خصم'}
                  </div>
                </div>
              </div>

              {/* Categories & Subcategories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    القسم الرئيسي
                  </label>
                  <select
                    value={formData.categoryName || ''}
                    onChange={e => {
                      const selectedCat = categories.find(c => c.title === e.target.value);
                      setFormData({
                        ...formData,
                        categoryName: e.target.value,
                        categoryId: selectedCat?.id || formData.categoryId,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.title}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    القسم الفرعي
                  </label>
                  <input
                    type="text"
                    value={formData.subcategoryName || ''}
                    onChange={e => setFormData({ ...formData, subcategoryName: e.target.value })}
                    placeholder="مثال: أقلام حبر جاف"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Stock & Availability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    الكمية في المخزن
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-6">
                  <div>
                    <span className="text-xs font-bold text-white block">حالة التوفر للطلب</span>
                    <span className="text-[11px] text-slate-400">
                      {formData.isInStock ? 'المنتج متاح للبيع في المتجر' : 'غير متوفر حالياً (نفذت الكمية)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isInStock: !formData.isInStock })}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      formData.isInStock ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        formData.isInStock ? 'left-1' : 'right-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Badges / Flags */}
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 bg-slate-950/40 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-950">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-sky-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-slate-300">منتج مميز</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-950/40 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-950">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="rounded text-indigo-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-slate-300">الأكثر مبيعاً</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-950/40 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-950">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={e => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-slate-300">وصل حديثاً</span>
                </label>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  الوصف والمواصفات
                </label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أدخل وصف المنتج وتفاصيل الاستخدام..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Images Management */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              {/* Upload Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Upload Button */}
                <div className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-6 text-center bg-slate-950/40 transition-colors flex flex-col items-center justify-center space-y-3">
                  <Upload className="w-8 h-8 text-sky-400" />
                  <div>
                    <h3 className="text-xs font-bold text-white">رفع صور من جهازك</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      يمكنك تحديد عدة صور معاً (PNG, JPG, WebP)
                    </p>
                  </div>
                  <label className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-md shadow-sky-600/20">
                    <span>{isUploading ? 'جاري الرفع...' : 'اختيار ملفات الصور'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Add Image by URL */}
                <div className="border border-slate-800 rounded-2xl p-6 bg-slate-950/40 space-y-3 flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span>أو إضافة رابط صورة خارجي</span>
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={e => setImageUrlInput(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Images Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                  <span>الصور المرفقة ({formData.images?.length || 0})</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    الصورة الأولى هي الصورة الرئيسية المعروضة بالمتجر
                  </span>
                </h3>

                {(!formData.images || formData.images.length === 0) ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                    لا توجد صور لهذا المنتج بعد. قم برفع صور أو إضافة روابط.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-2xl overflow-hidden border p-2 bg-slate-950 group flex flex-col justify-between ${
                          idx === 0 ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-800'
                        }`}
                      >
                        {/* Primary Badge */}
                        {idx === 0 && (
                          <div className="absolute top-3 right-3 bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" />
                            <span>رئيسية</span>
                          </div>
                        )}

                        <div className="aspect-square bg-white rounded-xl overflow-hidden p-2 flex items-center justify-center">
                          <img
                            src={imgUrl}
                            alt={`صورة ${idx + 1}`}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Image Actions */}
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 gap-1">
                          <div className="flex items-center gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                title="تحريك لأعلى"
                                onClick={() => handleMoveImage(idx, 'up')}
                                className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded-lg"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {idx < formData.images!.length - 1 && (
                              <button
                                type="button"
                                title="تحريك لأسفل"
                                onClick={() => handleMoveImage(idx, 'down')}
                                className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded-lg"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {idx !== 0 && (
                              <button
                                type="button"
                                title="تعيين كصورة رئيسية"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="p-1 text-sky-400 hover:text-sky-300 bg-slate-900 rounded-lg"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            title="حذف الصورة"
                            onClick={() => handleDeleteImage(idx)}
                            className="p-1 text-rose-400 hover:text-rose-300 bg-rose-950/40 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Variants & Options Management */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              {/* Product Options Section */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <h3 className="text-xs font-bold text-white">خصائص المنتج الرئيسية (Options)</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    مثل: اللون، الحجم، نوع الغلاف
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="اسم الخاصية (مثال: اللون)"
                      value={newOptionName}
                      onChange={e => setNewOptionName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="القيم مفصولة بفاصلة (مثال: أحمر، أزرق، أسود)"
                      value={newOptionValues}
                      onChange={e => setNewOptionValues(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة خاصية</span>
                  </button>
                </div>

                {/* Display Defined Options */}
                {formData.options && formData.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                    {formData.options.map(opt => (
                      <div
                        key={opt.id}
                        className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200"
                      >
                        <span className="font-bold text-sky-400">{opt.name}:</span>
                        <span className="text-slate-300">
                          {Array.isArray(opt.values)
                            ? opt.values.map(v => typeof v === 'string' ? v : v.name).join('، ')
                            : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteOption(opt.id)}
                          className="text-slate-500 hover:text-rose-400 cursor-pointer"
                          title="حذف الخاصية"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Variants Section Header */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <span>أشكال وخيارات البيع (Product Variants)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    كل شكل له سعر خاص، رمز SKU، مخزون محدد، وصورة مخصصة تظهر للعميل عند اختياره.
                  </p>
                </div>
                {!showAddVariant && (
                  <button
                    type="button"
                    onClick={() => setShowAddVariant(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة شكل / خيار</span>
                  </button>
                )}
              </div>

              {/* Add Variant Form Card */}
              {showAddVariant && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة شكل أو خيار جديد للمنتج</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddVariant(false)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300">
                        اسم الشكل / الخيار <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: لون أزرق ملكي - مقاس A4"
                        value={newVariant.title}
                        onChange={e => setNewVariant({ ...newVariant, title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-300">رمز المنتج SKU</label>
                      <input
                        type="text"
                        placeholder="مثال: SKU-BL-A4"
                        value={newVariant.sku || ''}
                        onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-300">
                        السعر الفعلي (د.ك) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={newVariant.price}
                        onChange={e => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-300">السعر قبل الخصم (د.ك)</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="اختياري"
                        value={newVariant.compareAtPrice ?? ''}
                        onChange={e => setNewVariant({ ...newVariant, compareAtPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-300">الكمية في المخزون</label>
                      <input
                        type="number"
                        min="0"
                        value={newVariant.stockQuantity}
                        onChange={e => setNewVariant({ ...newVariant, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Image selection for Variant */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-bold text-slate-300">
                      صورة هذا الشكل / الخيار (تظهر عند اختياره في المتجر)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      {formData.images && formData.images.length > 0 && (
                        <select
                          value={newVariant.imageStr || ''}
                          onChange={e => setNewVariant({ ...newVariant, imageStr: e.target.value })}
                          className="w-full sm:w-1/2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white cursor-pointer"
                        >
                          <option value="">-- اختر من صور المنتج المرفوعة --</option>
                          {formData.images.map((img, idx) => (
                            <option key={idx} value={img}>
                              صورة رقم {idx + 1}
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        type="url"
                        placeholder="أو ضع رابط صورة مخصص (URL)"
                        value={newVariant.imageStr || ''}
                        onChange={e => setNewVariant({ ...newVariant, imageStr: e.target.value })}
                        className="w-full sm:w-1/2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    {newVariant.imageStr && (
                      <div className="w-12 h-12 bg-white rounded-lg p-1 border border-slate-700 overflow-hidden mt-1">
                        <img src={newVariant.imageStr} alt="Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddVariant(false)}
                      className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      تأكيد وإضافة الخيار
                    </button>
                  </div>
                </div>
              )}

              {/* Variants List with Full Inline Editing */}
              {(!formData.variants || formData.variants.length === 0) ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  لا توجد خيارات فرعية لهذا المنتج بعد. المنتج يباع كخيار قياسي واحد.
                </div>
              ) : (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                  {formData.variants.map((v, i) => {
                    const isEditing = editingVariantId === v.id;
                    const vImg = typeof v.image === 'string' ? v.image : v.image?.src;

                    if (isEditing) {
                      return (
                        <div key={v.id || i} className="p-4 bg-slate-900/90 border-r-4 border-sky-500 space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sky-400">تعديل بيانات الشكل: {v.title}</span>
                            <span className="text-[10px] text-slate-500">ID: {v.id}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1">اسم الخيار</label>
                              <input
                                type="text"
                                value={editingVariantData.title || ''}
                                onChange={e => setEditingVariantData({ ...editingVariantData, title: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1">رمز SKU</label>
                              <input
                                type="text"
                                value={editingVariantData.sku || ''}
                                onChange={e => setEditingVariantData({ ...editingVariantData, sku: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1">السعر (د.ك)</label>
                              <input
                                type="number"
                                step="0.001"
                                min="0"
                                value={editingVariantData.price ?? 0}
                                onChange={e => setEditingVariantData({ ...editingVariantData, price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-emerald-400 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1">السعر قبل الخصم</label>
                              <input
                                type="number"
                                step="0.001"
                                min="0"
                                value={editingVariantData.compareAtPrice ?? ''}
                                onChange={e => setEditingVariantData({ ...editingVariantData, compareAtPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1">المخزون</label>
                              <input
                                type="number"
                                min="0"
                                value={editingVariantData.stockQuantity ?? 10}
                                onChange={e => setEditingVariantData({ ...editingVariantData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                              />
                            </div>
                            <div className="flex items-center pt-4">
                              <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
                                <input
                                  type="checkbox"
                                  checked={editingVariantData.isInStock !== false}
                                  onChange={e => setEditingVariantData({ ...editingVariantData, isInStock: e.target.checked })}
                                  className="w-4 h-4 rounded text-sky-600 bg-slate-950 border-slate-700"
                                />
                                <span>متوفر في المخزون</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">رابط صورة الخيار</label>
                            <div className="flex gap-2">
                              {formData.images && formData.images.length > 0 && (
                                <select
                                  value={editingVariantData.imageStr || ''}
                                  onChange={e => setEditingVariantData({ ...editingVariantData, imageStr: e.target.value })}
                                  className="w-1/3 px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                                >
                                  <option value="">-- اختر من صور المنتج --</option>
                                  {formData.images.map((img, idx) => (
                                    <option key={idx} value={img}>صورة {idx + 1}</option>
                                  ))}
                                </select>
                              )}
                              <input
                                type="url"
                                placeholder="أو اكتب رابط الصورة..."
                                value={editingVariantData.imageStr || ''}
                                onChange={e => setEditingVariantData({ ...editingVariantData, imageStr: e.target.value })}
                                className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={handleCancelVariantEdit}
                              className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveVariantEdit(v.id)}
                              className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>حفظ التعديل</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={v.id || i} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          {vImg ? (
                            <div className="w-10 h-10 bg-white rounded-xl p-1 border border-slate-700 overflow-hidden shrink-0">
                              <img src={vImg} alt={v.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{v.title}</span>
                              {v.sku && (
                                <span className="bg-slate-800 text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded">
                                  {v.sku}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="font-bold text-emerald-400">{v.price} د.ك</span>
                              {v.compareAtPrice && (
                                <span className="line-through text-slate-500">{v.compareAtPrice} د.ك</span>
                              )}
                              <span>•</span>
                              <span>المخزون: {v.stockQuantity ?? 10}</span>
                              <span>•</span>
                              <span className={v.isInStock ? 'text-emerald-400' : 'text-rose-400'}>
                                {v.isInStock ? 'متوفر' : 'غير متوفر'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditVariant(v)}
                            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="تعديل هذا الخيار"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(v.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="حذف الخيار"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer Submit Buttons */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-600/25 disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isNew ? 'إضافة المنتج إلى المتجر' : 'حفظ التعديلات'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
