import { db } from './db';
import { Product, Category, ProductImage, ProductVariant } from './types';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

export type SyncMode = 'sync' | 'check' | 'full';

class StoreImporter {
  private isRunning = false;
  private abortRequested = false;

  public getStatus() {
    return db.getImporterStats();
  }

  public stop() {
    if (this.isRunning) {
      this.abortRequested = true;
      db.updateImporterStats({ status: 'stopped', currentStep: 'تم إيقاف المزامنة يدويًا' });
      db.logImporterEvent('تم طلب إيقاف عملية المزامنة.');
    }
  }

  public async start(mode: SyncMode = 'sync'): Promise<void> {
    if (this.isRunning) {
      db.logImporterEvent('عملية المزامنة جارية بالفعل.');
      return;
    }

    this.isRunning = true;
    this.abortRequested = false;

    const modeLabels: Record<SyncMode, string> = {
      sync: 'مزامنة وتحديث البيانات (Sync Now)',
      check: 'فحص التغييرات والمقارنة دون تعديل (Check Changes)',
      full: 'مزامنة شاملة وكاملة للكتالوج (Full Sync)',
    };

    db.updateImporterStats({
      status: 'running',
      currentStep: `بدء عملية [${modeLabels[mode]}] من المصدر المعتمد: https://maktaba-q8.com/ar`,
      errorLogs: mode === 'full' ? [] : db.getImporterStats().errorLogs,
      recentLogs: [],
      progressPercent: 5,
    });

    db.logImporterEvent(`🚀 بدء تشغيل محرك المزامنة - الوضع: [${modeLabels[mode]}]...`);

    try {
      // Step 1: Discover and sync Categories & Menus
      db.updateImporterStats({ currentStep: 'استخراج وتحديث شجرة الأقسام والتصنيفات الأصلية...', progressPercent: 10 });
      const categories = await this.discoverCategories();
      db.logImporterEvent(`✅ تم فحص واستخراج ${categories.length} قسم وتصنيف رئيسي وفرعي.`);

      // Step 2: Discover all products from Shop pagination and Sitemap
      db.updateImporterStats({ currentStep: 'فحص روابط وكتالوج المنتجات من المتجر...', progressPercent: 20 });
      const discoveredMap = new Map<string, any>();

      await this.scanShopPages(discoveredMap);
      db.logImporterEvent(`🔍 تم فحص صفحات المتجر، إجمالي المنتجات المكتشفة: ${discoveredMap.size}`);

      if (mode === 'full' || discoveredMap.size === 0) {
        await this.scanSitemap(discoveredMap);
        db.logImporterEvent(`🔍 فحص خريطة الموقع Sitemap، الإجمالي النهائي المكتشف: ${discoveredMap.size} منتج`);
      }

      db.updateImporterStats({
        totalDiscovered: discoveredMap.size,
        progressPercent: 30,
        currentStep: mode === 'check' ? 'مقارنة المنتجات واكتشاف التغييرات...' : 'معالجة المنتجات وتحديث الأسعار والصور...',
      });

      // Step 3: Compare & update products with detailed change tracking
      const productList = Array.from(discoveredMap.values());
      const existingProducts = db.getProducts();
      const existingMap = new Map<string, Product>();
      existingProducts.forEach(p => {
        existingMap.set(p.id, p);
        if (p.handle) existingMap.set(p.handle, p);
      });

      let addedCount = 0;
      let updatedPriceCount = 0;
      let updatedDataCount = 0;
      let unchangedCount = 0;
      let failedCount = 0;
      let totalImages = 0;
      let totalPrices = 0;
      let totalDiscounts = 0;

      for (let i = 0; i < productList.length; i++) {
        if (this.abortRequested) {
          db.logImporterEvent('⚠️ تم إيقاف العملية بناء على طلب المستخدم.');
          break;
        }

        const rawProduct = productList[i];
        try {
          const product = this.normalizeProduct(rawProduct, categories);
          if (product && product.price >= 0) {
            const existing = existingMap.get(product.id) || (product.handle ? existingMap.get(product.handle) : undefined);

            if (!existing) {
              // Brand new product
              addedCount++;
              db.logImporterEvent(`✨ [منتج جديد مكتشف]: "${product.title}" - السعر: ${product.price.toFixed(3)} د.ك`);
              if (mode !== 'check') {
                db.upsertProduct(product);
              }
            } else {
              // Check for price difference
              const priceDiff = Math.abs(existing.price - product.price) > 0.001;
              const comparePriceDiff = (existing.compareAtPrice || null) !== (product.compareAtPrice || null);
              const stockDiff = existing.isInStock !== product.isInStock;
              const imagesDiff = existing.images.length !== product.images.length;

              if (priceDiff) {
                updatedPriceCount++;
                db.logImporterEvent(
                  `💰 [تغيير سعر]: "${product.title}" - السعر الحالي: ${existing.price.toFixed(3)} د.ك ← السعر الجديد: ${product.price.toFixed(3)} د.ك`
                );
              }

              if (stockDiff) {
                db.logImporterEvent(
                  `📦 [تغيير حالة المخزون]: "${product.title}" - أصبح ${product.isInStock ? 'متوفر' : 'نفذت الكمية'}`
                );
              }

              if (imagesDiff) {
                db.logImporterEvent(
                  `🖼️ [تحديث الصور]: "${product.title}" - ${product.images.length} صورة مستخرجة`
                );
              }

              if (priceDiff || comparePriceDiff || stockDiff || imagesDiff) {
                updatedDataCount++;
                if (mode !== 'check') {
                  // Safely update product without losing custom attributes
                  const mergedProduct: Product = {
                    ...existing,
                    ...product,
                    id: existing.id,
                    createdAt: existing.createdAt,
                    updatedAt: new Date().toISOString(),
                  };
                  db.upsertProduct(mergedProduct);
                }
              } else {
                unchangedCount++;
              }
            }

            totalImages += product.images.length;
            totalPrices++;
            if (product.compareAtPrice && product.compareAtPrice > product.price) {
              totalDiscounts++;
            }
          } else {
            failedCount++;
            db.logImporterEvent(`⚠️ تعذر استخراج السعر الصحيح للمنتج: ${rawProduct.title || rawProduct.handle}`, true);
          }
        } catch (err: any) {
          failedCount++;
          db.logImporterEvent(`❌ خطأ أثناء معالجة المنتج ${rawProduct.title || 'غير معروف'}: ${err.message}`, true);
        }

        const progressPercent = Math.min(98, Math.round(30 + ((i + 1) / productList.length) * 68));
        db.updateImporterStats({
          totalImported: db.getProducts().length,
          totalFailed: failedCount,
          totalImages,
          totalPricesExtracted: totalPrices,
          totalDiscountsFound: totalDiscounts,
          progressPercent,
          currentStep: `جاري فحص وتحديث المنتجات (${i + 1} / ${productList.length}): ${rawProduct.title || ''}`,
        });

        if (i % 25 === 0) {
          await new Promise(r => setTimeout(r, 40));
        }
      }

      // Final Step: Update category product counts
      if (mode !== 'check') {
        this.updateCategoryCounts();
      }

      const summaryText =
        mode === 'check'
          ? `🔍 اكتمل فحص التغييرات! تم رصد: (${addedCount} منتج جديد، ${updatedPriceCount} تعديل أسعار، ${updatedDataCount} تحديثات، ${unchangedCount} مطابق تماماً).`
          : `🎉 اكتملت المزامنة بنجاح! تم حفظ وتحديث الكتالوج (${db.getProducts().length} منتج، ${addedCount} جديد، ${updatedDataCount} تم تحديثه).`;

      db.updateImporterStats({
        status: 'completed',
        currentStep: summaryText,
        totalDiscovered: discoveredMap.size,
        totalImported: db.getProducts().length,
        totalCategories: db.getCategories().length,
        lastSyncAt: new Date().toISOString(),
        progressPercent: 100,
      });

      db.logImporterEvent(summaryText);

    } catch (error: any) {
      console.error('Importer error:', error);
      db.updateImporterStats({
        status: 'error',
        currentStep: `حدث خطأ أثناء المزامنة: ${error.message}`,
      });
      db.logImporterEvent(`❌ خطأ فادح أثناء المزامنة: ${error.message}`, true);
    } finally {
      this.isRunning = false;
      this.abortRequested = false;
    }
  }

  private async fetchRSC(url: string): Promise<string> {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en;q=0.9',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url} (status ${res.status})`);
    }

    const html = await res.text();
    const pushMatches = [...html.matchAll(/self\.__next_f\.push\(\[(\d+),\s*([\s\S]*?)\]\)/g)];
    let combined = '';
    for (const m of pushMatches) {
      try {
        const parsed = JSON.parse('[' + m[2] + ']');
        if (typeof parsed[0] === 'string') combined += parsed[0];
      } catch (e) {
        combined += m[2];
      }
    }
    return combined;
  }

  private async discoverCategories(): Promise<Category[]> {
    try {
      const combined = await this.fetchRSC('https://maktaba-q8.com/ar');
      const items: any[] = [];
      const regex = /\{[^{}]*\"__typename\":\"StoreMenuItem\"[^{}]*\}/g;
      let match;
      while ((match = regex.exec(combined)) !== null) {
        try {
          items.push(JSON.parse(match[0]));
        } catch (e) {}
      }

      const categories: Category[] = [];

      // Known category visuals and icons from original store
      const categoryVisuals: Record<string, string> = {
        'الشنط المدرسية': 'https://assets.wuiltstore.com/cl47esml802x201draeqa6a8e_cl47dtprh02vx01dr79idcuyy_cl46uz56902cj01dr6n680o1g_cl406nbms00hn37706d4it5g5_Untitled-4.jpg',
        'لوحات وادوات رسم': 'https://assets.wuiltstore.com/cl3xaidjc00iq3772qujdgvr8_%25D9%2585%25D8%25AC%25D9%2585%25D9%2588%25D8%25B9%25D8%25A9_%25D8%25A7%25D8%25AF%25D9%2588%25D8%25A7%25D8%25AA_%25D8%25A7%25D9%2584%25D8%25B1%25D8%25B3%25D9%2585.jpg',
        'الادوات التعليمية': 'https://assets.wuiltstore.com/cl4pohysp0ez701gsdu3b9vjk_cl4poh53s0ez501gs8cpi15hn_cl46v23mk02ck01dr9lwkd9ai_cl46ue00602c301dr4o6maj78_cl3xbha3u00kp3772tro8vvsm_1607183030017267-19.jpg',
        'الادوات المدرسية': 'https://assets.wuiltstore.com/cl4pnxfnp0ey501gsceuga130_cl4pnud270exn01gs4lgi9p4e_cl3xb36od00jl377246bsvypq__25D9_2585_25D8_25AC_25D9_2585_25D8_25A9__25D8_25A7_25D9_2584_25D8_25AF_25D9_2581_25D8_25A7_25D8_25AA_25D8_25B1__25D8_25A7_25D9_2584_25D8_25AA_25D8_25B9_25D9_2584_25D9_258A_25D9_2585_25D9_258A_25D8_25A9.jpg',
        'الادوات المكتبية': 'https://assets.wuiltstore.com/cl40b81yb00xw3772l5zum1f6_H26ebbdfc7cb34d239b9b17a0012d383dy.jpg',
        'الكماليات والديكور': 'https://assets.wuiltstore.com/cl3xd4o7j00n43772rjq04qe6_azqwdz1628481450596.jpg',
        'العروض والخصومات': 'https://assets.wuiltstore.com/cl47jjyxw032e01drgjlyab62_cl47jj7c803py3572ptfz7f2f_fx991es_2.png',
        'وصل حديثا': 'https://assets.wuiltstore.com/cmlscgmf604m701gn4v27guo8_WhatsApp_Image_2026-02-17_at_6.53.15_PM__1_.webp',
        'قسم المنتجات الرقمية': 'https://assets.wuiltstore.com/cl4mr4d8608so01gs6s4tbx4k_cl4mqwkn400e83772u8tfquia__D8_A8_D8_B7_D8_A7_D9_82_D8_A9__D8_A7_D9_84_D8_B7_D9_81_D9_84__D8_A7_D8_AD_D8_B1_D9_81.jpg',
      };

      for (const item of items) {
        if (!item.title || item.title === 'الرئيسية' || item.title === 'سياسة الاسترجاع') continue;

        const slug = item.title.trim().replace(/\s+/g, '-');
        const parentItem = items.find(p => p.id === item.parentId);

        const category: Category = {
          id: item.id || `cat_${slug}`,
          title: item.title.trim(),
          handle: slug,
          parentId: item.parentId ? (parentItem?.id || item.parentId) : null,
          image: categoryVisuals[item.title.trim()] || null,
          displayOrder: categories.length + 1,
          productCount: 0,
        };

        categories.push(category);
        db.upsertCategory(category);
      }

      // Ensure essential top categories exist
      const defaultRoots = [
        'الشنط المدرسية',
        'لوحات وادوات رسم',
        'الادوات التعليمية',
        'الادوات المدرسية',
        'الادوات المكتبية',
        'الكماليات والديكور',
        'العروض والخصومات',
        'وصل حديثا',
      ];

      for (const rootTitle of defaultRoots) {
        if (!categories.some(c => c.title === rootTitle)) {
          const rootCat: Category = {
            id: `cat_${rootTitle.replace(/\s+/g, '-')}`,
            title: rootTitle,
            handle: rootTitle.replace(/\s+/g, '-'),
            parentId: null,
            image: categoryVisuals[rootTitle] || null,
            displayOrder: categories.length + 1,
            productCount: 0,
          };
          categories.push(rootCat);
          db.upsertCategory(rootCat);
        }
      }

      return categories;
    } catch (err: any) {
      db.logImporterEvent(`تعذر جلب الأقسام من RSC: ${err.message}`, true);
      return db.getCategories();
    }
  }

  private async scanShopPages(discoveredMap: Map<string, any>): Promise<void> {
    let page = 1;
    let consecutiveEmpty = 0;

    while (page <= 30 && consecutiveEmpty < 2) {
      if (this.abortRequested) break;

      try {
        const combined = await this.fetchRSC(`https://maktaba-q8.com/ar/shop?page=${page}`);
        const products = this.extractProductsFromRSC(combined);

        if (products.length === 0) {
          consecutiveEmpty++;
        } else {
          consecutiveEmpty = 0;
          for (const prod of products) {
            if (prod && prod.id) {
              discoveredMap.set(prod.id, prod);
            }
          }
          db.logImporterEvent(`الصفحة ${page}: تم استخراج ${products.length} منتج (الإجمالي: ${discoveredMap.size})`);
        }

        page++;
      } catch (err: any) {
        db.logImporterEvent(`خطأ في فحص صفحة المتجر ${page}: ${err.message}`, true);
        page++;
      }
    }
  }

  private async scanSitemap(discoveredMap: Map<string, any>): Promise<void> {
    try {
      const res = await fetch('https://maktaba-q8.com/sitemap.xml', {
        headers: { 'User-Agent': USER_AGENT },
      });
      if (!res.ok) return;

      const xml = await res.text();
      const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
      const productUrls = locs.filter(u => u.includes('/product/'));

      db.logImporterEvent(`تم العثور على ${productUrls.length} رابط منتج في sitemap.xml`);

      // For any product handle not yet in discoveredMap, try to fetch it
      const existingHandles = new Set(Array.from(discoveredMap.values()).map(p => p.handle));

      for (const pUrl of productUrls) {
        if (this.abortRequested) break;

        const handle = decodeURIComponent(pUrl.split('/').pop() || '');
        if (!existingHandles.has(handle)) {
          try {
            const cleanUrl = pUrl.replace('https://maktaba-q8.com/', 'https://maktaba-q8.com/ar/');
            const combined = await this.fetchRSC(cleanUrl);
            const prods = this.extractProductsFromRSC(combined);
            for (const p of prods) {
              if (p && p.id && !discoveredMap.has(p.id)) {
                discoveredMap.set(p.id, p);
                existingHandles.add(p.handle);
              }
            }
          } catch (e) {}
        }
      }
    } catch (err: any) {
      db.logImporterEvent(`خطأ أثناء قراءة sitemap: ${err.message}`, true);
    }
  }

  private extractProductsFromRSC(rsc: string): any[] {
    const products: any[] = [];
    let startPos = 0;

    while (true) {
      const startIdx = rsc.indexOf('"products":[{', startPos);
      if (startIdx === -1) break;

      const arrayStart = startIdx + '"products":'.length;
      let depth = 0;
      let endIdx = -1;
      let inString = false;
      let escape = false;

      for (let i = arrayStart; i < rsc.length; i++) {
        const char = rsc[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === '\\') {
          escape = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '[' || char === '{') depth++;
          else if (char === ']' || char === '}') {
            depth--;
            if (depth === 0) {
              endIdx = i + 1;
              break;
            }
          }
        }
      }

      if (endIdx !== -1) {
        try {
          const parsed = JSON.parse(rsc.slice(arrayStart, endIdx));
          if (Array.isArray(parsed)) {
            for (const p of parsed) {
              if (p && p.__typename === 'Product' && p.id) {
                products.push(p);
              }
            }
          }
        } catch (e) {}
      }

      startPos = startIdx + 12;
    }

    return products;
  }

  private normalizeProduct(raw: any, categories: Category[]): Product | null {
    if (!raw || !raw.id || !raw.title) return null;

    const variantsNodes = raw.variants?.nodes || [];
    const firstVariant = variantsNodes[0] || {};

    // REAL PRICE EXTRACTION:
    // Extract actual money amount from variant price object
    let realPrice = 0;
    if (typeof firstVariant.price?.amount === 'number') {
      realPrice = Number(firstVariant.price.amount);
    } else if (raw.initialPrice?.amount) {
      realPrice = Number(raw.initialPrice.amount);
    } else if (typeof raw.price === 'number') {
      realPrice = raw.price;
    }

    // Compare at price (old price / original price before discount)
    let compareAtPrice: number | null = null;
    if (typeof firstVariant.compareAtPrice?.amount === 'number' && firstVariant.compareAtPrice.amount > realPrice) {
      compareAtPrice = Number(firstVariant.compareAtPrice.amount);
    } else if (raw.discount?.amount && realPrice > 0) {
      compareAtPrice = Number((realPrice + Number(raw.discount.amount)).toFixed(3));
    }

    // Discount percentage
    let discountPercentage: number | null = null;
    if (compareAtPrice && compareAtPrice > realPrice && realPrice > 0) {
      discountPercentage = Math.round(((compareAtPrice - realPrice) / compareAtPrice) * 100);
    }

    // Extract all images
    const images: ProductImage[] = [];
    const seenSrcs = new Set<string>();

    if (Array.isArray(raw.images)) {
      for (const img of raw.images) {
        if (img && img.src && !seenSrcs.has(img.src)) {
          seenSrcs.add(img.src);
          images.push({
            id: img.id || `img_${images.length + 1}`,
            src: img.src,
            altText: img.altText || raw.title,
            width: img.width,
            height: img.height,
            isPrimary: images.length === 0,
          });
        }
      }
    }

    // If variant has a unique image
    if (firstVariant.image?.src && !seenSrcs.has(firstVariant.image.src)) {
      images.push({
        id: firstVariant.image.id || `img_var_${images.length + 1}`,
        src: firstVariant.image.src,
        altText: raw.title,
        isPrimary: images.length === 0,
      });
    }

    // Normalized variants
    const variants: ProductVariant[] = [];
    for (const v of variantsNodes) {
      const vPrice = typeof v.price?.amount === 'number' ? Number(v.price.amount) : realPrice;
      const vCompare = typeof v.compareAtPrice?.amount === 'number' ? Number(v.compareAtPrice.amount) : null;
      
      const selectedOpts = (v.selectedOptions || []).map((o: any) => ({
        optionName: o.option?.name || 'الخيار',
        valueName: o.value?.name || o.title || '',
      }));

      variants.push({
        id: v.id || `var_${variants.length + 1}`,
        title: v.title || raw.title,
        sku: v.sku || null,
        price: vPrice,
        compareAtPrice: vCompare,
        quantity: typeof v.quantity === 'number' ? v.quantity : 10,
        isInStock: v.quantity === undefined || v.quantity > 0,
        selectedOptions: selectedOpts,
        image: v.image ? { id: v.image.id, src: v.image.src, altText: raw.title } : null,
      });
    }

    // Assign categories based on keywords & title
    const { categoryName, subcategoryName, categoryId } = this.detectCategory(raw.title, categories);

    // Stock
    const isInStock = raw.isInStock !== false && (firstVariant.quantity === undefined || firstVariant.quantity > 0);
    const stockQuantity = typeof firstVariant.quantity === 'number' ? firstVariant.quantity : (isInStock ? 25 : 0);

    // Generate rich clean Arabic description
    let description = raw.description || '';
    if (!description || description.trim().length < 5) {
      description = `${raw.title} - متوفر بجودة عالية في متجر مكتبة الشاطئ الازرق. مناسب للاستخدام المدرسي والمكتبي والشخصي مع توصيل سريع لكافة مناطق الكويت.`;
    }

    return {
      id: raw.id,
      title: raw.title.trim(),
      handle: raw.handle || raw.title.trim().replace(/\s+/g, '-'),
      originalUrl: `https://maktaba-q8.com/ar/product/all/${encodeURIComponent(raw.handle || raw.title)}`,
      price: Number(realPrice.toFixed(3)),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice.toFixed(3)) : null,
      discountPercentage,
      currency: 'KWD',
      sku: firstVariant.sku || raw.id.replace('Product_', 'SKU-'),
      type: raw.type || 'SIMPLE',
      description,
      isInStock,
      stockQuantity,
      categoryId,
      categoryName,
      subcategoryName,
      images,
      variants: variants.length > 0 ? variants : [{
        id: `var_${raw.id}`,
        title: 'الافتراضي',
        price: realPrice,
        compareAtPrice,
        quantity: stockQuantity,
        isInStock,
      }],
      isFeatured: Math.random() > 0.8,
      isBestSeller: Math.random() > 0.85,
      isNewArrival: Math.random() > 0.8,
      rating: 4.8 + Number((Math.random() * 0.2).toFixed(1)),
      reviewsCount: Math.floor(Math.random() * 18) + 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private detectCategory(title: string, categories: Category[]): { categoryName: string; subcategoryName?: string; categoryId?: string } {
    const t = title.toLowerCase();

    if (t.includes('شنط') || t.includes('شنطة') || t.includes('حقيبة') || t.includes('ترولي') || t.includes('فروزن') || t.includes('سبايدرمان') || t.includes('ماوس')) {
      const cat = categories.find(c => c.title === 'الشنط المدرسية');
      return { categoryName: 'الشنط المدرسية', subcategoryName: t.includes('ولادي') ? 'شنط شخصيات ولادي' : (t.includes('بناتي') ? 'شنط شخصيات بناتي' : 'شنط جميع المراحل'), categoryId: cat?.id };
    }
    if (t.includes('رسم') || t.includes('الوان') || t.includes('لوحة') || t.includes('اكرلك') || t.includes('فابر كاستل') || t.includes('كانفس') || t.includes('فرشاة') || t.includes('فلين')) {
      const cat = categories.find(c => c.title === 'لوحات وادوات رسم');
      return { categoryName: 'لوحات وادوات رسم', subcategoryName: t.includes('لوح') ? 'لوحات بيضاء مغناطيس' : 'ادوات الرسم والتصميم الهندسي', categoryId: cat?.id };
    }
    if (t.includes('تعليم') || t.includes('تربوي') || t.includes('بزل') || t.includes('حساب') || t.includes('وسيلة') || t.includes('بطاق')) {
      const cat = categories.find(c => c.title === 'الادوات التعليمية');
      return { categoryName: 'الادوات التعليمية', subcategoryName: t.includes('لعبة') || t.includes('العاب') ? 'العاب تربوية' : 'وسائل تعليمية', categoryId: cat?.id };
    }
    if (t.includes('مكتب') || t.includes('دباس') || t.includes('حاسبة') || t.includes('ختم') || t.includes('ملف') || t.includes('ستاند') || t.includes('غلاف') || t.includes('كتر') || t.includes('مشرط')) {
      const cat = categories.find(c => c.title === 'الادوات المكتبية');
      return { categoryName: 'الادوات المكتبية', subcategoryName: t.includes('حاسبة') ? 'الة حاسبة' : 'اكسسوارت المكتب وملحقاتها', categoryId: cat?.id };
    }
    if (t.includes('قلم') || t.includes('براية') || t.includes('محاية') || t.includes('دفتر') || t.includes('مسطرة') || t.includes('هندسة') || t.includes('جلاد') || t.includes('مدرسي')) {
      const cat = categories.find(c => c.title === 'الادوات المدرسية');
      return { categoryName: 'الادوات المدرسية', subcategoryName: t.includes('قلم') ? 'اقلام الرصاص والحبر' : 'برايات ومحايات', categoryId: cat?.id };
    }
    if (t.includes('ديكور') || t.includes('هدية') || t.includes('درع') || t.includes('حصالة') || t.includes('ميدالية') || t.includes('زينة')) {
      const cat = categories.find(c => c.title === 'الكماليات والديكور');
      return { categoryName: 'الكماليات والديكور', subcategoryName: 'التغليف والديكور', categoryId: cat?.id };
    }

    return { categoryName: 'الادوات المدرسية', subcategoryName: 'عام', categoryId: categories[0]?.id };
  }

  private updateCategoryCounts() {
    const products = db.getProducts();
    const categories = db.getCategories();

    for (const cat of categories) {
      const count = products.filter(p => p.categoryName === cat.title || p.categoryId === cat.id || p.subcategoryName === cat.title).length;
      cat.productCount = count;
      db.upsertCategory(cat);
    }
  }
}

export const storeImporter = new StoreImporter();
