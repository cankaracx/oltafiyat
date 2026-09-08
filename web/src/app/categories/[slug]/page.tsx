import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { mainCategories, categories } from "@/lib/categories";
import { formatTRY } from "@/lib/format";
import { getSupabaseClient, type ProductRow, type StoreListingRow } from "@/lib/supabase";

export const revalidate = 43200;

const PAGE_SIZE = 24;

type CategoryPageProps = {
  params: { slug: string };
  searchParams: { sub?: string; sort?: string; page?: string };
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

async function getCategoryProducts(
  slug: string, subSlug?: string, sort = "newest", page = 1
): Promise<{ products: ProductWithLowest[]; catName: string; catDesc: string; mainCat: typeof mainCategories[0] | undefined; activeSubSlug: string | null; totalCount: number }> {
  const empty = { products: [], catName: "", catDesc: "", mainCat: undefined, activeSubSlug: null, totalCount: 0 };

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

  // Category name/description resolve from the static list above, so a page still
  // renders (with an empty product grid) even if Supabase isn't reachable/configured.
  const supabase = getSupabaseClient();
  if (!supabase) return { ...empty, catName, catDesc, mainCat, activeSubSlug };

  if (!targetSlugs.length) return { ...empty, catName, catDesc, mainCat, activeSubSlug };

  const { data: cats, error: catsError } = await supabase.from("categories").select("id, slug").in("slug", targetSlugs);
  if (catsError) {
    console.error("[getCategoryProducts] categories query failed:", catsError);
  }
  const catIds = cats?.map((c) => c.id) ?? [];
  if (!catIds.length) return { ...empty, catName, catDesc, mainCat, activeSubSlug };

  const from = (page - 1) * PAGE_SIZE;
  const { data: prods, count, error: prodsError } = await supabase
    .from("products")
    .select("id, title, brand, category_id, slug, created_at", { count: "exact" })
    .in("category_id", catIds)
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (prodsError) {
    console.error("[getCategoryProducts] products query failed:", prodsError);
  }

  const products = prods ?? [];
  const totalCount = count ?? 0;
  if (!products.length) return { products: [], catName, catDesc, mainCat, activeSubSlug, totalCount };

  const { data: listData, error: listError } = await supabase
    .from("store_listings")
    .select("id, product_id, store_name, raw_title, price, product_url, image_url, updated_at")
    .in("product_id", products.map((p) => p.id))
    .order("price", { ascending: true });

  if (listError) {
    console.error("[getCategoryProducts] store_listings query failed:", listError);
  }

  const listings = (listData ?? []) as StoreListingRow[];

  let merged: ProductWithLowest[] = products.map((p) => {
    const pl = listings.filter((l) => l.product_id === p.id);
    return {
      ...p,
      lowestPrice: pl[0]?.price ?? null,
      listingCount: pl.length,
      image_url: pl.find((l) => l.image_url)?.image_url ?? null
    };
  });

  if (sort === "price_asc") merged.sort((a, b) => (a.lowestPrice ?? Infinity) - (b.lowestPrice ?? Infinity));
  else if (sort === "price_desc") merged.sort((a, b) => (b.lowestPrice ?? -Infinity) - (a.lowestPrice ?? -Infinity));

  return { products: merged, catName, catDesc, mainCat, activeSubSlug, totalCount };
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

  const { products, catName, catDesc, mainCat, activeSubSlug, totalCount } =
    await getCategoryProducts(slug, sub, sort, page);

  if (!mainCat) notFound();

  const subCats   = categories.filter((c) => c.parentSlug === mainCat.slug);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const pageQ = (extra = "") =>
    `/categories/${slug}?${sub ? `sub=${sub}&` : ""}sort=${sort}${extra}`;

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
            href={`/categories/${mainCat.slug}?sort=${sort}`}
            className={`btn btn-sm ${!activeSubSlug ? "btn-blue" : ""}`}
          >
            Tümü
          </Link>
          {subCats.map((s) => (
            <Link
              key={s.slug}
              href={`/categories/${mainCat.slug}?sub=${s.slug}&sort=${sort}`}
              className={`btn btn-sm ${activeSubSlug === s.slug ? "btn-blue" : ""}`}
            >
              {s.name}
            </Link>
          ))}
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
                href={`/categories/${slug}?${sub ? `sub=${sub}&` : ""}sort=${opt.value}`}
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
      {products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
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
          <h2 className="text-lg font-bold text-[#1c2128]">Bu kategoride henüz ürün yok</h2>
          <p className="mt-2 text-sm text-[#57606a]">Scraper yeni veriler topladığında otomatik görünecektir.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Sayfalama" className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={pageQ(`&page=${page - 1}`)} className="btn">← Önceki</Link>
          )}
          <span className="px-4 py-2 text-sm text-[#57606a]">
            Sayfa {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={pageQ(`&page=${page + 1}`)} className="btn">Sonraki →</Link>
          )}
        </nav>
      )}
    </section>
  );
}
