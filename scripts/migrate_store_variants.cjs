const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '..', 'data', 'store.json');
const backupPath = path.join(__dirname, '..', 'data', 'store.backup-before-variants.json');
const rawPath = path.join(__dirname, 'wuilt_all_products_raw.json');

const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const rawProducts = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

// Backup existing store
fs.writeFileSync(backupPath, JSON.stringify(storeData, null, 2));
console.log('Backed up store to:', backupPath);

const rawById = new Map();
const rawByHandle = new Map();
rawProducts.forEach(p => {
  rawById.set(p.id, p);
  if (p.handle) {
    rawByHandle.set(p.handle, p);
    rawByHandle.set(decodeURIComponent(p.handle).trim(), p);
  }
});

let updatedCount = 0;
let variantsAddedCount = 0;

storeData.products = storeData.products.map(sp => {
  const r = rawById.get(sp.id) || rawByHandle.get(sp.handle) || rawByHandle.get(decodeURIComponent(sp.handle || '').trim());
  if (!r) return sp;

  updatedCount++;

  // Map options
  const options = (r.options || []).map((o, optIdx) => ({
    id: o.id || `opt_${optIdx}`,
    name: o.name,
    values: (o.values || []).map((v, valIdx) => ({
      id: v.id || `val_${optIdx}_${valIdx}`,
      name: v.name,
    }))
  }));

  // Map variants
  let variants = [];
  if (r.variants?.nodes && r.variants.nodes.length > 0) {
    variants = r.variants.nodes.map((v, idx) => {
      const price = v.price?.amount != null ? Number(v.price.amount) : (r.initialPrice?.amount != null ? Number(r.initialPrice.amount) : sp.price);
      const compareAtPrice = v.compareAtPrice?.amount != null ? Number(v.compareAtPrice.amount) : null;
      const qty = v.quantity != null ? Number(v.quantity) : (r.isInStock ? 50 : 0);
      const isInStock = qty > 0 && r.isInStock !== false;

      // Extract title from selected options if default title is an id
      let title = v.title;
      const selOpts = (v.selectedOptions || []).map(so => ({
        optionName: so.option?.name || '',
        valueName: so.value?.name || '',
      }));

      if (!title || title.startsWith('cl') || title.startsWith('cm')) {
        title = selOpts.map(so => so.valueName).filter(Boolean).join(' / ') || `خيار ${idx + 1}`;
      }

      return {
        id: v.id || `${sp.id}_v_${idx}`,
        productId: sp.id,
        title,
        sku: v.sku || null,
        price,
        compareAtPrice,
        stock: qty,
        quantity: qty,
        stockQuantity: qty,
        isInStock,
        enabled: true,
        sortOrder: idx,
        image: v.image?.src || (sp.images?.[0]?.src || null),
        selectedOptions: selOpts,
      };
    });
  }

  // If product has no variants from Wuilt, ensure at least one simple variant
  if (variants.length === 0) {
    variants = [{
      id: `${sp.id}_default`,
      productId: sp.id,
      title: 'الافتراضي',
      sku: sp.sku || null,
      price: sp.price,
      compareAtPrice: sp.compareAtPrice || null,
      stock: sp.stockQuantity || 50,
      quantity: sp.stockQuantity || 50,
      stockQuantity: sp.stockQuantity || 50,
      isInStock: sp.isInStock,
      enabled: true,
      sortOrder: 0,
      image: sp.images?.[0]?.src || null,
      selectedOptions: [],
    }];
  }

  // Update primary product SKU if first variant has sku
  const primarySku = variants.find(v => v.sku)?.sku || sp.sku || null;

  if (variants.length > 1 || options.length > 0) {
    variantsAddedCount++;
  }

  return {
    ...sp,
    sku: primarySku,
    options,
    variants,
    hasVariants: variants.length > 1,
    type: variants.length > 1 ? 'VARIABLE' : 'SIMPLE',
  };
});

fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2));
console.log(`Successfully migrated ${updatedCount} products!`);
console.log(`${variantsAddedCount} products now have rich options and variants.`);
