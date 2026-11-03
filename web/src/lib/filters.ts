// Shared brand/price filtering used by both the search page and category pages.
// Kept framework-free so it can run against any array of priced products.

export type PriceFilter = {
  min?: number;
  max?: number;
};

export type Priced = { lowestPrice: number | null };
export type Branded = { brand: string | null };

export type BrandFacet = { brand: string; count: number };

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseBrandsParam(value: string | string[] | undefined): string[] {
  const raw = firstValue(value);
  if (!raw) return [];
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (trimmed) seen.add(trimmed);
  }
  return Array.from(seen);
}

export function parsePriceParam(value: string | string[] | undefined): number | undefined {
  const raw = firstValue(value);
  if (!raw) return undefined;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function matchesPriceRange(price: number | null, filter: PriceFilter): boolean {
  if (filter.min === undefined && filter.max === undefined) return true;
  if (price === null) return false;
  if (filter.min !== undefined && price < filter.min) return false;
  if (filter.max !== undefined && price > filter.max) return false;
  return true;
}

export function filterByPriceRange<T extends Priced>(items: T[], filter: PriceFilter): T[] {
  if (filter.min === undefined && filter.max === undefined) return items;
  return items.filter((item) => matchesPriceRange(item.lowestPrice, filter));
}

export function filterByBrands<T extends Branded>(items: T[], brands: string[]): T[] {
  if (brands.length === 0) return items;
  const wanted = new Set(brands);
  return items.filter((item) => item.brand !== null && wanted.has(item.brand));
}

// Facet counts are computed from the price-filtered set (not the brand-filtered one) so
// toggling one brand on/off doesn't make the other brand options disappear from the list.
export function buildBrandFacets<T extends Branded>(items: T[]): BrandFacet[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (!item.brand) continue;
    counts.set(item.brand, (counts.get(item.brand) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand, "tr"));
}

export function getPriceBounds<T extends Priced>(items: T[]): { min: number; max: number } | null {
  let min = Infinity;
  let max = -Infinity;
  for (const item of items) {
    if (item.lowestPrice === null) continue;
    if (item.lowestPrice < min) min = item.lowestPrice;
    if (item.lowestPrice > max) max = item.lowestPrice;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min, max };
}
