import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { formatTRY } from "@/lib/format";
import { getSupabaseClient, type ProductRow, type StoreListingRow } from "@/lib/supabase";
import {
  buildBrandFacets,
  filterByBrands,
  filterByPriceRange,
  parseBrandsParam,
  parsePriceParam
} from "@/lib/filters";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ürün Ara",
  description: "Balık avı ürünlerinde mağazalar arası fiyat karşılaştırması yapın."
};

const PAGE_SIZE = 24;

type SearchPageProps = {
  searchParams: { q?: string; sort?: string; page?: string; brand?: string; min?: string; max?: string };
};

type SearchResult = ProductRow & {
  lowestPrice: number | null;
  lowestStore: string | null;
  listingCount: number;
  image_url: string | null;
  relevanceScore: number;
};

function normalizeQuery(v: string | undefined) {
  return (v ?? "").trim().replace(/\s+/g, " ");
}

// Returns every match for the query, unsorted and unfiltered by brand/price — the page
// component applies those afterwards so facet counts and pagination stay consistent.
async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const clean = query.replace(/[%_]/g, "");
  const words = clean.split(/\s+/).filter((w) => w.length > 0);
  if (!words.length) return [];

  let productsRes;
  if (words.length > 1) {
    const fts = words.map((w) => `'${w}'`).join(" & ");
    productsRes = await supabase
      .from("products")
      .select("id, title, brand, category_id, slug, created_at")
      .textSearch("title", fts, { config: "simple" })
      .limit(200);
    if (!productsRes.data || productsRes.data.length < 5) {
      const or = words.map((w) => `title.ilike.%${w}%,brand.ilike.%${w}%`).join(",");
      productsRes = await supabase
        .from("products")
        .select("id, title, brand, category_id, slug, created_at")
        .or(or)
        .limit(200);
    }
  } else {
    productsRes = await supabase
      .from("products")
      .select("id, title, brand, category_id, slug, created_at")
      .or(`title.ilike.%${clean}%,brand.ilike.%${clean}%`)
      .limit(200);
  }

  const products = productsRes.data ?? [];
  const ids = products.map((p) => p.id);
  if (!ids.length) return [];

  const { data: listingsData } = await supabase
    .from("store_listings")
    .select("id, product_id, store_name, raw_title, price, product_url, image_url, updated_at")
    .in("product_id", ids)
    .order("price", { ascending: true });

  const listings = (listingsData ?? []) as StoreListingRow[];

  const scored: SearchResult[] = products.map((product) => {
    const tl = `${product.brand ?? ""} ${product.title}`.toLowerCase();
    const relevanceScore = words.reduce((acc, w) => {
      const wl = w.toLowerCase();
      return acc + (tl.includes(wl) ? 10 : 0) + (tl.startsWith(wl) ? 5 : 0);
    }, 0);
    const pl = listings.filter((l) => l.product_id === product.id);
    const img = pl.find((l) => l.image_url)?.image_url ?? null;
    return {
      ...product,
      lowestPrice: pl[0]?.price ?? null,
      lowestStore: pl[0]?.store_name ?? null,
      listingCount: pl.length,
      image_url: img,
      relevanceScore
    };
  });

  return scored;
}

function sortResults(results: SearchResult[], sortBy: string): SearchResult[] {
  const copy = [...results];
  if (sortBy === "price_asc") copy.sort((a, b) => (a.lowestPrice ?? Infinity) - (b.lowestPrice ?? Infinity));
  else if (sortBy === "price_desc") copy.sort((a, b) => (b.lowestPrice ?? -Infinity) - (a.lowestPrice ?? -Infinity));
  else if (sortBy === "newest") copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  else copy.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return copy;
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Alaka Düzeyi" },
  { value: "price_asc",  label: "En Ucuz" },
  { value: "price_desc", label: "En Pahalı" },
  { value: "newest",     label: "En Yeni" }
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = normalizeQuery(searchParams.q);
  const sort = searchParams.sort || "relevance";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const minPrice = parsePriceParam(searchParams.min);
  const maxPrice = parsePriceParam(searchParams.max);
  const selectedBrands = parseBrandsParam(searchParams.brand);

  const matched = await searchProducts(query);
  const priceFiltered = filterByPriceRange(matched, { min: minPrice, max: maxPrice });
  const brandFacets = buildBrandFacets(priceFiltered);
  const filtered = filterByBrands(priceFiltered, selectedBrands);
  const all = sortResults(filtered, sort);

  const total = all.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const results = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const supabaseReady = Boolean(getSupabaseClient());
  const hasActiveFilters = selectedBrands.length > 0 || minPrice !== undefined || maxPrice !== undefined;

  // Builds a /search URL carrying every active filter plus whatever this specific link overrides.
  const buildHref = (overrides: Partial<Record<"sort" | "brand" | "min" | "max" | "page", string>>) => {
    const params = new URLSearchParams();
    params.set("q", query);
    const next = {
      sort,
      brand: selectedBrands.join(","),
      min: minPrice !== undefined ? String(minPrice) : "",
      max: maxPrice !== undefined ? String(maxPrice) : "",
      page: "",
      ...overrides
    };
    if (next.sort && next.sort !== "relevance") params.set("sort", next.sort);
    if (next.brand) params.set("brand", next.brand);
    if (next.min) params.set("min", next.min);
    if (next.max) params.set("max", next.max);
    if (next.page) params.set("page", next.page);
    return `/search?${params.toString()}`;
  };

  const toggleBrandHref = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    return buildHref({ brand: next.join(",") });
  };

  return (
    <section className="container-shell py-8">

      {/* Search bar */}
      <div className="panel p-5 mb-6">
        <form action="/search" className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="search-q" className="sr-only">Ürün ara</label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Ürün, marka veya model ara…"
            className="input flex-1 text-[15px]"
            autoComplete="off"
          />
          {sort && sort !== "relevance" && <input type="hidden" name="sort" value={sort} />}
          <button type="submit" className="btn btn-primary px-7">Ara</button>
        </form>
      </div>

      {!supabaseReady && (
        <div className="mb-4 panel border-[#fb8f44] bg-[#fff8c5] p-4 text-sm text-[#7d4e00]">
          Supabase bağlantısı kurulamadı. <code>.env.local</code> dosyasını kontrol et.
        </div>
      )}

      {/* Brand + price filters */}
      {query && matched.length > 0 && (
        <div className="panel p-4 mb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {brandFacets.length > 0 && (
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#57606a] mb-2">Marka</p>
                <div className="flex flex-wrap gap-1.5">
                  {brandFacets.map(({ brand, count }) => {
                    const active = selectedBrands.includes(brand);
                    return (
                      <Link
                        key={brand}
                        href={toggleBrandHref(brand)}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                          active
                            ? "border-[#0969da] bg-[#ddf4ff] text-[#0550ae]"
                            : "border-[#d0d7de] bg-[#f6f8fa] text-[#57606a] hover:border-[#0969da]/50 hover:text-[#1c2128]"
                        }`}
                      >
                        {brand}
                        <span className={active ? "text-[#0550ae]/70" : "text-[#8b949e]"}>{count}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <form action="/search" className="flex items-end gap-2 shrink-0">
              <input type="hidden" name="q" value={query} />
              {sort !== "relevance" && <input type="hidden" name="sort" value={sort} />}
              {selectedBrands.length > 0 && <input type="hidden" name="brand" value={selectedBrands.join(",")} />}
              <div>
                <label htmlFor="min-price" className="block text-[10px] font-bold uppercase tracking-widest text-[#57606a] mb-2">En az ₺</label>
                <input
                  id="min-price"
                  name="min"
                  type="number"
                  min={0}
                  inputMode="decimal"
                  defaultValue={minPrice ?? ""}
                  placeholder="0"
                  className="input w-24 text-sm"
                />
              </div>
              <div>
                <label htmlFor="max-price" className="block text-[10px] font-bold uppercase tracking-widest text-[#57606a] mb-2">En çok ₺</label>
                <input
                  id="max-price"
                  name="max"
                  type="number"
                  min={0}
                  inputMode="decimal"
                  defaultValue={maxPrice ?? ""}
                  placeholder="∞"
                  className="input w-24 text-sm"
                />
              </div>
              <button type="submit" className="btn btn-sm">Uygula</button>
              {hasActiveFilters && (
                <Link href={buildHref({ brand: "", min: "", max: "" })} className="btn btn-sm">Temizle</Link>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Results header */}
      {query && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <p className="text-sm text-[#57606a]">
            {total > 0
              ? <><strong className="text-[#1c2128]">{total}</strong> sonuç &mdash; &ldquo;{query}&rdquo;</>
              : hasActiveFilters
                ? "Filtrelere uyan sonuç yok"
                : `"${query}" için sonuç bulunamadı`}
          </p>

          {total > 0 && (
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={13} className="text-[#57606a]" />
              <span className="text-sm text-[#57606a]">Sıralama:</span>
              <div className="flex rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-0.5 gap-0.5">
                {SORT_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildHref({ sort: opt.value, page: "" })}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      sort === opt.value
                        ? "bg-white text-[#1c2128] shadow-sm border border-[#d0d7de]"
                        : "text-[#57606a] hover:text-[#1c2128]"
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="panel group flex flex-col hover:shadow-md hover:border-[#0969da]/40 transition-all"
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden rounded-t-[10px] bg-[#f6f8fa] border-b border-[#e8ecf0] flex items-center justify-center">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-4xl opacity-15">🎣</span>
                )}
                {product.listingCount > 1 && (
                  <span className="absolute top-2 right-2 badge badge-blue">
                    {product.listingCount} mağaza
                  </span>
                )}
                {product.brand && (
                  <span className="absolute top-2 left-2 badge">{product.brand}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 justify-between p-3.5">
                <h3 className="text-sm font-semibold text-[#1c2128] line-clamp-2 leading-snug min-h-10 group-hover:text-[#0969da] transition-colors">
                  {product.title}
                </h3>
                <div className="mt-3 flex items-end justify-between border-t border-[#e8ecf0] pt-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#57606a]">En düşük fiyat</p>
                    <p className="price mt-0.5 text-xl">{formatTRY(product.lowestPrice)}</p>
                    <p className="text-xs text-[#57606a] mt-0.5 truncate max-w-[140px]">
                      {product.lowestStore ?? "—"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#0969da]">İncele →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {query && total === 0 && (
        <div className="panel border-dashed p-12 text-center">
          <p className="text-4xl mb-4 opacity-30">🔍</p>
          <h2 className="text-lg font-bold text-[#1c2128]">
            {hasActiveFilters ? "Filtrelere uyan ürün yok" : "Sonuç bulunamadı"}
          </h2>
          <p className="mt-2 text-sm text-[#57606a] max-w-sm mx-auto">
            {hasActiveFilters
              ? "Marka veya fiyat aralığını genişletmeyi dene."
              : <>&ldquo;{query}&rdquo; için eşleşen ürün yok. Daha kısa veya genel bir terim dene.</>}
          </p>
          {hasActiveFilters && (
            <Link href={buildHref({ brand: "", min: "", max: "" })} className="btn mt-4">
              Filtreleri temizle
            </Link>
          )}
        </div>
      )}

      {/* No query */}
      {!query && (
        <div className="panel border-dashed p-12 text-center">
          <p className="text-4xl mb-4 opacity-30">🎣</p>
          <h2 className="text-lg font-bold text-[#1c2128]">Ne aramak istersin?</h2>
          <p className="mt-2 text-sm text-[#57606a] max-w-sm mx-auto leading-relaxed">
            Marka + ürün tipi kombinasyonu dene:<br />
            <strong className="text-[#0969da]">Daiwa Spin</strong>,{" "}
            <strong className="text-[#0969da]">Savage Gear Silikon</strong>,{" "}
            <strong className="text-[#0969da]">Okuma Surf</strong>
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Sayfalama" className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={buildHref({ page: String(page - 1) })} className="btn">
              ← Önceki
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-[#57606a]">Sayfa {page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={buildHref({ page: String(page + 1) })} className="btn">
              Sonraki →
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
