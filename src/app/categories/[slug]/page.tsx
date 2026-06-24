import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mainCategories, categories } from "@/lib/categories";
import { formatTRY } from "@/lib/format";
import { getSupabaseClient, type ProductRow, type StoreListingRow } from "@/lib/supabase";

const PAGE_SIZE = 24;

type CategoryPageProps = {
  params: {
    slug: string;
  };
  searchParams: {
    sub?: string;
    sort?: string;
    page?: string;
  };
};

type ProductWithLowest = ProductRow & {
  lowestPrice: number | null;
  listingCount: number;
  image_url: string | null;
};

export const revalidate = 43200; // 12 saat

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const mainCat = mainCategories.find((item) => item.slug === params.slug);
  const subCat = categories.find((item) => item.slug === params.slug);

  if (!mainCat && !subCat) {
    return { title: "Kategori bulunamadı" };
  }

  return {
    title: mainCat ? mainCat.name : subCat!.name,
    description: mainCat ? mainCat.description : subCat!.description
  };
}

async function getCategoryProducts(
  categorySlug: string,
  selectedSubSlug?: string,
  sortBy?: string,
  page = 1
): Promise<{ products: ProductWithLowest[]; mainCategoryName: string; mainCategoryDesc: string; isMain: boolean; activeSubSlug: string | null; totalCount: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { products: [], mainCategoryName: "", mainCategoryDesc: "", isMain: false, activeSubSlug: null, totalCount: 0 };
  }

  // 1. Identify if slug is main category or subcategory
  let mainCat = mainCategories.find((c) => c.slug === categorySlug);
  let subCat = categories.find((c) => c.slug === categorySlug);

  if (!mainCat && subCat) {
    // If it's a subcategory direct URL, find its main category
    mainCat = mainCategories.find((c) => c.slug === subCat!.parentSlug);
  }

  if (!mainCat && !subCat) {
    return { products: [], mainCategoryName: "Bilinmeyen Kategori", mainCategoryDesc: "", isMain: false, activeSubSlug: null, totalCount: 0 };
  }

  const categoryName = mainCat ? mainCat.name : subCat!.name;
  const categoryDesc = mainCat ? mainCat.description : subCat!.description;
  const isMain = !!mainCat;

  // 2. Determine target category IDs for querying
  let targetSubSlugs: string[] = [];
  let activeSubSlug: string | null = null;

  if (selectedSubSlug) {
    targetSubSlugs = [selectedSubSlug];
    activeSubSlug = selectedSubSlug;
  } else if (mainCat) {
    // Use all subcategories of this main category
    const subCategories = categories.filter((c) => c.parentSlug === mainCat!.slug);
    targetSubSlugs = subCategories.map((c) => c.slug);
  } else if (subCat) {
    // Single subcategory
    targetSubSlugs = [subCat.slug];
    activeSubSlug = subCat.slug;
  }

  if (targetSubSlugs.length === 0) {
    return { products: [], mainCategoryName: categoryName, mainCategoryDesc: categoryDesc, isMain, activeSubSlug, totalCount: 0 };
  }

  // Fetch category IDs from database
  const categoriesResponse = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", targetSubSlugs);
  const categoryIds = categoriesResponse.data?.map((c) => c.id) ?? [];

  if (categoryIds.length === 0) {
    return { products: [], mainCategoryName: categoryName, mainCategoryDesc: categoryDesc, isMain, activeSubSlug, totalCount: 0 };
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // 3. Query products with pagination
  const productsResponse = await supabase
    .from("products")
    .select("id, title, brand, category_id, slug, created_at", { count: "exact" })
    .in("category_id", categoryIds)
    .order("created_at", { ascending: false })
    .range(from, to);

  const products = productsResponse.data ?? [];
  const totalCount = productsResponse.count ?? 0;
  const productIds = products.map((product) => product.id);

  if (productIds.length === 0) {
    return { products: [], mainCategoryName: categoryName, mainCategoryDesc: categoryDesc, isMain, activeSubSlug, totalCount };
  }

  // 4. Query listings for these products
  const listingsResponse = await supabase
    .from("store_listings")
    .select("id, product_id, store_name, raw_title, price, product_url, image_url, updated_at")
    .in("product_id", productIds)
    .order("price", { ascending: true });

  const listings = (listingsResponse.data ?? []) as StoreListingRow[];

  // 5. Merge listings into products to find lowest price and image
  let mergedProducts: ProductWithLowest[] = products.map((product) => {
    const productListings = listings.filter((listing) => listing.product_id === product.id);
    const lowestListing = productListings[0];
    const image_url = productListings.find((l) => l.image_url)?.image_url ?? null;

    return {
      ...product,
      lowestPrice: lowestListing?.price ?? null,
      listingCount: productListings.length,
      image_url: image_url
    };
  });

  // 6. Sort in-memory
  if (sortBy === "price_asc") {
    mergedProducts.sort((a, b) => {
      if (a.lowestPrice === null) return 1;
      if (b.lowestPrice === null) return -1;
      return a.lowestPrice - b.lowestPrice;
    });
  } else if (sortBy === "price_desc") {
    mergedProducts.sort((a, b) => {
      if (a.lowestPrice === null) return 1;
      if (b.lowestPrice === null) return -1;
      return b.lowestPrice - a.lowestPrice;
    });
  } else {
    // Default or "newest": Sort by created_at descending
    mergedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return {
    products: mergedProducts,
    mainCategoryName: categoryName,
    mainCategoryDesc: categoryDesc,
    isMain,
    activeSubSlug,
    totalCount
  };
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryPageProps) {
  const currentSlug = params.slug;
  const selectedSub = searchParams.sub;
  const currentSort = searchParams.sort || "newest";
  const currentPage = Math.max(1, Number(searchParams.page) || 1);

  const { products, mainCategoryName, mainCategoryDesc, isMain, activeSubSlug, totalCount } = await getCategoryProducts(
    currentSlug,
    selectedSub,
    currentSort,
    currentPage
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Determine main category mapping
  let mainCat = mainCategories.find((c) => c.slug === currentSlug);
  if (!mainCat) {
    const subCat = categories.find((c) => c.slug === currentSlug);
    if (subCat) {
      mainCat = mainCategories.find((c) => c.slug === subCat.parentSlug);
    }
  }

  if (!mainCat) {
    notFound();
  }

  // Get all subcategories for filtering tabs
  const subCats = categories.filter((c) => c.parentSlug === mainCat!.slug);

  return (
    <section className="container-shell py-10">
      <Link href="/categories" className="mb-5 inline-flex text-sm font-semibold text-[#0969da] hover:underline">
        &larr; Tüm kategorilere dön
      </Link>

      <div className="gh-panel p-6 mb-8">
        <div className="gh-label mb-3">Ana Kategori</div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#24292f]">{mainCategoryName}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#57606a]">{mainCategoryDesc}</p>
      </div>

      {/* Subcategory Filtering Tabs */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#24292f] mb-3">Alt Kategori Filtrele:</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/categories/${mainCat.slug}${currentSort ? `?sort=${currentSort}` : ""}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              !activeSubSlug
                ? "bg-[#0969da] text-white border-[#0969da]"
                : "bg-[#f6f8fa] text-[#57606a] border-[#d0d7de] hover:bg-[#f3f4f6]"
            }`}
          >
            Tüm {mainCat.name} ({categories.filter(c => c.parentSlug === mainCat!.slug).reduce((acc, c) => acc, 0) || "Hepsi"})
          </Link>
          {subCats.map((sub) => (
            <Link
              key={sub.slug}
              href={`/categories/${mainCat!.slug}?sub=${sub.slug}${currentSort ? `&sort=${currentSort}` : ""}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeSubSlug === sub.slug
                  ? "bg-[#0969da] text-white border-[#0969da]"
                  : "bg-[#f6f8fa] text-[#57606a] border-[#d0d7de] hover:bg-[#f3f4f6]"
              }`}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#d0d7de] pb-4 mb-6 gap-4">
        <div>
          <span className="text-sm text-[#57606a] font-medium">
            {totalCount} ürün listeleniyor — sayfa {currentPage} / {totalPages || 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#57606a] whitespace-nowrap">Sıralama:</span>
          <div className="flex gap-1 bg-[#f6f8fa] p-1 rounded-md border border-[#d0d7de]">
            <Link
              href={`/categories/${currentSlug}?${selectedSub ? `sub=${selectedSub}&` : ""}sort=newest`}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                currentSort === "newest" ? "bg-white text-[#24292f] shadow-sm border border-[#d0d7de]" : "text-[#57606a] hover:text-[#24292f]"
              }`}
            >
              En Yeni
            </Link>
            <Link
              href={`/categories/${currentSlug}?${selectedSub ? `sub=${selectedSub}&` : ""}sort=price_asc`}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                currentSort === "price_asc" ? "bg-white text-[#24292f] shadow-sm border border-[#d0d7de]" : "text-[#57606a] hover:text-[#24292f]"
              }`}
            >
              En Ucuz
            </Link>
            <Link
              href={`/categories/${currentSlug}?${selectedSub ? `sub=${selectedSub}&` : ""}sort=price_desc`}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                currentSort === "price_desc" ? "bg-white text-[#24292f] shadow-sm border border-[#d0d7de]" : "text-[#57606a] hover:text-[#24292f]"
              }`}
            >
              En Pahalı
            </Link>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="gh-panel flex flex-col justify-between p-4 hover:border-[#0969da] transition-colors group">
            <div>
              {/* Product Image Thumbnail */}
              <div className="w-full h-44 bg-white border border-[#e1e4e8] rounded-md mb-4 overflow-hidden flex items-center justify-center p-3 relative">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <span className="text-xs text-[#57606a] italic">Görsel Yok</span>
                )}
                {product.brand ? (
                  <span className="absolute top-2 left-2 z-10 bg-[#f6f8fa] border border-[#d0d7de] text-[#24292f] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded">
                    {product.brand}
                  </span>
                ) : null}
              </div>

              <span className="text-xs font-semibold text-[#57606a] uppercase tracking-wide">
                {product.brand || "Marka Bilgisi Yok"}
              </span>
              <h2 className="mt-1 line-clamp-2 min-h-12 text-base font-semibold text-[#0969da] group-hover:underline">
                {product.title}
              </h2>
            </div>

            <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#d8dee4] pt-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#57606a]">En Düşük Fiyat</p>
                <p className="text-2xl font-semibold text-[#1a7f37]">
                  {product.lowestPrice !== null ? formatTRY(product.lowestPrice) : "Fiyat Bekleniyor"}
                </p>
              </div>
              <span className="border border-[#d0d7de] bg-[#f6f8fa] px-2.5 py-1 text-xs font-semibold text-[#57606a]">
                {product.listingCount} teklif
              </span>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-6 gh-panel border-dashed p-8 text-center bg-[#fafbfc]">
          <h2 className="text-xl font-semibold text-[#24292f]">Bu kategoride henüz ürün yok.</h2>
          <p className="mt-2 text-sm text-[#57606a]">Scraper yeni veriler topladığında burası otomatik dolacaktır.</p>
        </div>
      ) : null}

      {totalPages > 1 ? (
        <nav aria-label="Sayfalama" className="mt-8 flex items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={`/categories/${currentSlug}?${selectedSub ? `sub=${selectedSub}&` : ""}sort=${currentSort}&page=${currentPage - 1}`}
              className="gh-button px-4 py-2 text-sm font-semibold"
              aria-label="Önceki sayfa"
            >
              &larr; Önceki
            </Link>
          ) : null}

          <span className="px-4 py-2 text-sm text-[#57606a]">
            Sayfa {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`/categories/${currentSlug}?${selectedSub ? `sub=${selectedSub}&` : ""}sort=${currentSort}&page=${currentPage + 1}`}
              className="gh-button px-4 py-2 text-sm font-semibold"
              aria-label="Sonraki sayfa"
            >
              Sonraki &rarr;
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
