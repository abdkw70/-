import React from 'react';

export const STORE_FALLBACK_IMAGE = 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png';

/**
 * Resolves a product image or image item into a valid image URL string.
 * Handles:
 * - Direct URL strings: "https://..."
 * - ProductImage objects: { src: "https://...", ... }
 * - Wuilt / Shopify / Custom objects: { url: "...", originalUrl: "..." }
 * - Product objects: { images: [{ src: "..." }] }
 * - Fallbacks with graceful onerror handling
 */
export function getProductImageUrl(img: any): string {
  if (!img) return STORE_FALLBACK_IMAGE;

  // If passed a Product object directly
  if (Array.isArray(img?.images)) {
    return getProductImageUrl(img.images[0]);
  }

  // If passed a string URL
  if (typeof img === 'string') {
    const trimmed = img.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
      return trimmed;
    }
    return trimmed || STORE_FALLBACK_IMAGE;
  }

  // If passed an image object
  if (typeof img === 'object') {
    if (typeof img.src === 'string' && img.src.trim()) return img.src.trim();
    if (typeof img.url === 'string' && img.url.trim()) return img.url.trim();
    if (typeof img.originalUrl === 'string' && img.originalUrl.trim()) return img.originalUrl.trim();
    if (typeof img.image === 'string' && img.image.trim()) return img.image.trim();
    if (typeof img.image === 'object' && img.image) return getProductImageUrl(img.image);
  }

  return STORE_FALLBACK_IMAGE;
}

/**
 * Extracts all image URLs as strings from a product's images array
 */
export function getProductImageUrls(images: any[] | undefined | null): string[] {
  if (!Array.isArray(images) || images.length === 0) {
    return [STORE_FALLBACK_IMAGE];
  }
  const urls = images.map(getProductImageUrl).filter(url => Boolean(url && url !== STORE_FALLBACK_IMAGE));
  return urls.length > 0 ? urls : [STORE_FALLBACK_IMAGE];
}

/**
 * Image onError fallback handler to prevent broken image icons
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target.src !== STORE_FALLBACK_IMAGE) {
    target.src = STORE_FALLBACK_IMAGE;
  }
}
