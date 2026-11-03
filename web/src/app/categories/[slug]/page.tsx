import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { mainCategories, categories } from "@/lib/categories";
import { formatTRY } from "@/lib/format";
import { getSupabaseClient, type ProductRow, type StoreListingRow } from "@/lib/supabase";
import {
  buildBrandFacets,
  filterByBrands,
  filterByPriceRange,
  parseBrandsParam,
  parsePriceParam
} from "@/lib/filters";

export const revalidate = 43200;

const PAGE_SIZE = 24;
// A single sub-category tops out well under this even at full 23-store scraper capacity.
// Fetching the whole set (instead of a DB-side page) is what lets price/brand filtering and
// price sorting apply across the full category rather than just whichever 24 rows landed on
// the current page.
const MAX_CATEGORY_PRODUCTS = 1000;

type CategoryPageProps = {
  params: { slug: string };
  searchParams: { sub?: string; sort?: string; page?: string; brand?: string; min?: string; max?: string };
};

type ProductWithLowest = ProductRow & {
  lowestPrice: number | null;
  listingCount: number;
  image_url: string | null;
};

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const main = mainCategories.find((c) => c.slug === params.slug);
  const sub  = categories.find((c) => c.slug === params.slug);
  if (!main && !sub) return { title: "Kategori bulunamadı" };
  const cat = main ?? sub!;
  return { title: cat.name, description: cat.description };
}

// Fetches every product in the (sub-)category, unsorted and unfiltered by brand/price — the
// page component applies sort, price/brand filters, and pagination afterwards so they work
// against the whole category instead of just one page's worth of rows.
async function getCategoryProducts(
  slug: string, subSlug?: string
): Promise<{ products: ProductWithLowest[]; catName: string; catDesc: string; mainCat: typeof mainCategories[0] | undefined; activeSubSlug: string | null }> {
  const supabase = getSupabaseClient();
  const empty = { products: [], catName: "", catDesc: "", mainCat: undefined, activeSubSlug: null };
  if (!supabase) return empty;

  let mainCat = mainCategories.find((c) => c.slug === slug);
  let subCat  = categories.find((c) => c.slug === slug);
  if (!mainCat && subCat) mainCat = mainCategories.find((c) => c.slug === subCat!.parentSlug);
  if (!mainCat && !subCat) return { ...empty, catName: "Bilinmeyen Kategori" };

  const catName = mainCat ? mainCat.name : subCat!.name;
  const catDesc = mainCat ? mainCat.description : subCat!.description;

  let targetSlugs: string[] = [];
  let activeSubSlug: string | null = null;

  if (subSlug) {
    targetSlugs = [subSlug];
    activeSubSlug = subSlug;
  } else if (mainCat) {
    targetSlugs = categories.filter((c) => c.parentSlug === mainCat!.slug).map((c) => c.slug);
  } else if (subCat) {
    targetSlugs = [subCat.slug];
    activeSubSlug = subCat.slug;
  }

  if (!targetSlugs.length) return { ...empty, catName, catDesc, mainCat, activeSubSlug };

  const { data: cats } = await supabase.from("categories").select("id, slug").in("slug", targetSlugs);
  const catIds = cats?.map((c) => c.id) ?? [];
  if (!catIds.length) return { ...empty, catName, catDesc, mainCat, activeSubSlug };

  const { data: prods } = await supabase
    .from("products")
    .select("id, title, brand, category_id, slug, created_at")
    .in("category_id", catIds)
    .order("created_at", { ascending: false })
    .limit(MAX_CATEGORY_PRODUCTS);

  const products = prods ?? [];
  if (!products.length) return { products: [], catName, catDesc, mainCat, activeSubSlug };

  const { data: listData } = await supabase
    .from("store_listings")
    .select("id, product_id, store_name, raw_title, price, product_url, image_url, updated_at")
    .in("product_id", products.map((p) => p.id))
    .order("price", { ascending: true });

  const listings = (listData ?? []) as StoreListingRow[];

  const merged: ProductWithLowest[] = products.map((p) => {
    const pl = listings.filter((l) => l.product_id === p.id);
    return {
      ...p,
      lowestPrice: pl[0]?.price ?? null,
      listingCount: pl.length,
      image_url: pl.find((l) => l.image_url)?.image_url ?? null
    };
  });

  return { products: merged, catName, catDesc, mainCat, activeSubSlug };
}

function sortCategoryProducts(products: ProductWithLowest[], sort: string): ProductWithLowest[] {
  const copy = [...products];
  if (sort === "price_asc") copy.sort((a, b) => (a.lowestPrice ?? Infinity) - (b.lowestPrice ?? Infinity));
  else if (sort === "price_desc") copy.sort((a, b) => (b.lowestPrice ?? -Infinity) - (a.lowestPrice ?? -Infinity));
  else copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return copy;
}

const SORT_OPTIONS = [
  { value: "newest",     label: "En Yeni" },
  { value: "price_asc",  label: "En Ucuz" },
  { value: "price_desc", label: "En Pahalı" }
];

export default async function CategoryDetailPage({ params, searchParams }: CategoryPageProps) {
  const slug = params.slug;
  const sub  = searchParams.sub;
  const sort = searchParams.sort || "newest";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const minPrice = parsePriceParam(searchParams.min);
  const maxPrice = parsePriceParam(searchParams.max);
  const selectedBrands = parseBrandsParam(searchParams.brand);

  const { products: allProducts, catName, catDesc, mainCat, activeSubSlug } =
    await getCategoryProducts(slug, sub);

  if (!mainCat) notFound();

  const priceFiltered = filterByPriceRange(allProducts, { min: minPrice, max: maxPrice });
  const brandFacets = buildBrandFacets(priceFiltered);
  const filtered = filterByBrands(priceFiltered, selectedBrands);
  const products = sortCategoryProducts(filtered, sort);

  const subCats   = categories.filter((c) => c.parentSlug === mainCat.slug);
  const totalCount = products.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const pagedProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasActiveFilters = selectedBrands.length > 0 || minPrice !== undefined || maxPrice !== undefined;

  // Builds a /categories/[slug] URL carrying every active filter plus this link's overrides.
  const buildHref = (overrides: Partial<Record<"sub" | "sort" | "brand" | "min" | "max" | "page", string>>) => {
    const next = {
      sub: sub ?? "",
      sort,
      brand: selectedBrands.join(","),
      min: minPrice !== undefined ? String(minPrice) : "",
      max: maxPrice !== undefined ? String(maxPrice) : "",
      page: "",
      ...overrides
    };
    const params = new URLSearchParams();
    if (next.sub) params.set("sub", next.sub);
    if (next.sort && next.sort !== "newest") params.set("sort", next.sort);
    if (next.brand) params.set("brand", next.brand);
    if (next.min) params.set("min", next.min);
    if (next.max) params.set("max", next.max);
    if (next.page) params.set("page", next.page);
    const qs = params.toString();
    return `/categories/${slug}${qs ? `?${qs}` : ""}`;
  };

  const toggleBrandHref = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    return buildHref({ brand: next.join(",") });
  };

  return (
    <section className="container-shell py-8">

      {/* Breadcrumb */}
      <Link href="/categories" className="mb-6 inline-flex items-center gap-1 text-sm text-[#57606a] hover:text-[#0969da] transition-colors">
        <ChevronLeft size={14} /> Kategoriler
      </Link>

      {/* Category header */}
      <div className="panel p-5 mb-6">
        <span className="badge-label mb-2 inline-block">Ana Kategori</span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1c2128]">{catName}</h1>
        <p className="mt-1 text-sm text-[#57606a] leading-relaxed max-w-2xl">{catDesc}</p>
      </div>

      {/* Sub-category tabs */}
      {subCats.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <Link
            href={buildHref({ sub: "" })}
            className={`btn btn-sm ${!activeSubSlug ? "btn-blue" : ""}`}
          >
            Tümü
          </Link>
          {subCats.map((s) => (
            <Link
              key={s.slug}
              href={buildHref({ sub: s.slug })}
              className={`btn btn-sm ${activeSubSlug === s.slug ? "btn-blue" : ""}`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      {/* Brand + price filters */}
      {allProducts.length > 0 && (
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

            <form action={`/categories/${slug}`} className="flex items-end gap-2 shrink-0">
              {sub && <input type="hidden" name="sub" value={sub} />}
              {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
              {selectedBrands.length > 0 && <input type="hidden" name="brand" value={selectedBrands.join(",")} />}
              <div>
                <label htmlFor="min-price" className="block text-[10px] font-bold uppercase tracking-widest text-[#57606a] mb-2">En az ₺</label>
                <input
                  id="min-price" name="min" type="number" min={0} inputMode="decimal"
                  defaultValue={minPrice ?? ""} placeholder="0" className="input w-24 text-sm"
                />
              </div>
              <div>
                <label htmlFor="max-price" className="block text-[10px] font-bold uppercase tracking-widest text-[#57606a] mb-2">En çok ₺</label>
                <input
                  id="max-price" name="max" type="number" min={0} inputMode="decimal"
                  defaultValue={maxPrice ?? ""} placeholder="∞" className="input w-24 text-sm"
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

      {/* Sort + count bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <p className="text-sm text-[#57606a]">
          <strong className="text-[#1c2128]">{totalCount}</strong> ürün
          {page > 1 && ` — sayfa ${page} / ${totalPages}`}
        </p>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Product grid */}
      {pagedProducts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pagedProducts.map((product) => (
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
                <h2 className="text-sm font-semibold text-[#1c2128] line-clamp-2 leading-snug min-h-10 group-hover:text-[#0969da] transition-colors">
                  {product.title}
                </h2>
                <div className="mt-3 flex items-end justify-between border-t border-[#e8ecf0] pt-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#57606a]">En düşük fiyat</p>
                    <p className="price mt-0.5 text-xl">
                      {product.lowestPrice !== null ? formatTRY(product.lowestPrice) : "—"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#0969da]">İncele →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="panel border-dashed p-12 text-center">
          <p className="text-4xl mb-4 opacity-30">📦</p>
          <h2 className="text-lg font-bold text-[#1c2128]">
            {hasActiveFilters ? "Filtrelere uyan ürün yok" : "Bu kategoride henüz ürün yok"}
          </h2>
          <p className="mt-2 text-sm text-[#57606a]">
            {hasActiveFilters
              ? "Marka veya fiyat aralığını genişletmeyi dene."
              : "Scraper yeni veriler topladığında otomatik görünecektir."}
          </p>
          {hasActiveFilters && (
            <Link href={buildHref({ brand: "", min: "", max: "" })} className="btn mt-4">
              Filtreleri temizle
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Sayfalama" className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={buildHref({ page: String(page - 1) })} className="btn">← Önceki</Link>
          )}
          <span className="px-4 py-2 text-sm text-[#57606a]">
            Sayfa {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildHref({ page: String(page + 1) })} className="btn">Sonraki →</Link>
          )}
        </nav>
      )}
    </section>
  );
}
