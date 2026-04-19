/** Bundled asset — works offline and avoids blocked CDNs */
export const PRODUCT_IMAGE_PLACEHOLDER = '/images/products/placeholder.svg';

function apiOrigin(): string {
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const origin = raw.replace(/\/api\/?$/i, '').trim();
  return origin || 'http://localhost:5000';
}

/** Lab data sometimes stores labels (e.g. `lingerie`) instead of real file paths */
function looksLikeImageReference(u: string): boolean {
  if (/^https?:\/\//i.test(u)) return true;
  if (u.startsWith('/')) return true;
  return /\.(jpe?g|png|gif|webp|svg|avif)(\?|#|$)/i.test(u);
}

/**
 * Turn DB values into a browser-ready `src`.
 * - Full `https://…` URLs pass through (e.g. Groovy CDN / seed scripts).
 * - Paths starting with `/` are served by Vite from `frontend/public/` (e.g. `/images/products/…`).
 * - Bare filenames like `shirt.jpg` resolve against the API static folder (`backend/public/`).
 */
export function resolveProductImageUrl(url: string | null | undefined): string {
  const u = (url ?? '').trim();
  if (!u || !looksLikeImageReference(u)) return PRODUCT_IMAGE_PLACEHOLDER;
  if (/^https?:\/\//i.test(u)) return u;
  // Uploaded files are served by the API (`backend/public/uploads/...`)
  if (u.startsWith('/uploads/')) return `${apiOrigin()}${u}`;
  if (u.startsWith('/')) return u;
  return `${apiOrigin()}/${u}`;
}

export function productImageUrls(url: string | null | undefined): string[] {
  return [resolveProductImageUrl(url)];
}

/** Avoid infinite `onError` loops when swapping to the bundled placeholder */
export function fallbackProductImage(el: HTMLImageElement): void {
  if (el.dataset.fallback === '1') return;
  el.dataset.fallback = '1';
  el.src = PRODUCT_IMAGE_PLACEHOLDER;
}
