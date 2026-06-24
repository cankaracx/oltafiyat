import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatTRY } from "@/lib/format";
import { getSupabaseClient, type ProductRow, type StoreListingRow } from "@/lib/supabase";

export const revalidate = 3600; // 1 saat — aramalar sık değişebilir

export const metadata: Metadata = {
  title: "Ürün Ara",
  description: "Balık avı ürünlerinde mağazalar arası fiyat karşılaştırması yapın."
};

const PAGE_SIZE = 24;

type SearchPageProps = {
  searchParams: {
    q?: string;
    sort?: string;
    page?: string;
  };
};

type SearchResult = ProductRow & {
  lowestPrice: number | null;
  lowestStore: string | null;
  listingCount: number;
  image_url: string | null;
};

function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

async function searchProducts(query: string, sortBy?: string): Promise<SearchResult[]> {
  if (!query) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const cleanQuery = query.replace(/[%_]/g, "");
  const words = cleanQuery.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) {
    return [];
  }

  let productsResponse;

  if (words.length > 1) {
    // 1. Try Full-Text Search (FTS) matching ALL words
    const ftsQuery = words.map((w) => `'${w}'`).join(" & ");
    productsResponse = await supabase
      .from("products")
      .select("id, title, brand, category_id, slug, created_at")
      .textSearch("title", ftsQuery, { config: "simple" })
      .limit(100);

    // 2. Fallback to broad ILIKE matching ANY of the words if FTS yielded very few results
    if (!productsResponse.data || productsResponse.data.length < 5) {
      const orQuery = words.map((w) => `title.ilike.%${w}%,brand.ilike.%${w}%`).join(",");
      productsResponse = await supabase
        .from("products")
        .select("id, title, brand, category_id, slug, created_at")
        .or(orQuery)
        .limit(100);
    }
  } else {
    // Single word search
    productsResponse = await supabase
      .from("products")
      .select("id, title, brand, category_id, slug, created_at")
      .or(`title.ilike.%${cleanQuery}%,brand.ilike.%${cleanQuery}%`)
      .limit(100);
  }

  const products = productsResponse.data ?? [];
  const productIds = products.map((product) => product.id);

  if (productIds.length === 0) {
    return [];
  }

  // Fetch all store listings for these products
  const listingsResponse = await supabase
    .from("store_listings")
    .select("id, product_id, store_name, raw_title, price, product_url, image_url, updated_at")
    .in("product_id", productIds)
    .order("price", { ascending: true });

  const listings = (listingsResponse.data ?? []) as StoreListingRow[];

  // Relevance ranking in-memory based on keyword matching density
  const scoredProducts = products.map((product) => {
    const titleAndBrand = `${product.brand ?? ""} ${product.title}`.toLowerCase();
    let score = 0;

    words.forEach((word) => {
      const w = word.toLowerCase();
      if (titleAndBrand.includes(w)) {
        score += 10; // Matched keyword
        if (titleAndBrand.startsWith(w)) {
          score += 5; // Starts with keyword (highly relevant)
        }
      }
    });

    const productListings = listings.filter((listing) => listing.product_id === product.id);
    const lowestListing = productListings[0];
    const image_url = productListings.find((l) => l.image_url)?.image_url ?? null;

    return {
      product: {
        ...product,
        lowestPrice: lowestListing?.price ?? null,
        lowestStore: lowestListing?.store_name ?? null,
        listingCount: productListings.length,
        image_url: image_url
      },
      score: score
    };
  });

  // Sort by search relevance score first, then apply user sorting if requested
  if (sortBy === "price_asc") {
    scoredProducts.sort((a, b) => {
      if (a.product.lowestPrice === null) return 1;
      if (b.product.lowestPrice === null) return -1;
      return a.product.lowestPrice - b.product.lowestPrice;
    });
  } else if (sortBy === "price_desc") {
    scoredProducts.sort((a, b) => {
      if (a.product.lowestPrice === null) return 1;
      if (b.product.lowestPrice === null) return -1;
      return b.product.lowestPrice - a.product.lowestPrice;
    });
  } else if (sortBy === "newest") {
    scoredProducts.sort((a, b) => new Date(b.product.created_at).getTime() - new Date(a.product.created_at).getTime());
  } else {
    // Default: Sort by relevance score descending
    scoredProducts.sort((a, b) => b.score - a.score);
  }

  return scoredProducts.map((sp) => sp.product);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = normalizeQuery(searchParams.q);
  const currentSort = searchParams.sort || "relevance";
  const currentPage = Math.max(1, Number(searchParams.page) || 1);
  const allResults = await searchProducts(query, currentSort);
  const totalCount = allResults.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const results = allResults.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const supabaseReady = Boolean(getSupabaseClient());

  return (
    <section className="container-shell py-10">
      <div className="gh-panel p-5 sm:p-6 mb-8">
        <div className="gh-label mb-3">Akıllı Fiyat Arama</div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#24292f]">Fiyat Karşılaştır</h1>
        <p className="mt-2 text-sm text-[#57606a]">Türkiye balıkçılık e-ticaret sitelerindeki milyonlarca ürünü model, marka veya kategori ile anında arayın.</p>
        <form action="/search" className="mt-5 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="search-page-input" className="sr-only">Ürün adı</label>
          <input
            id="search-page-input"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Örn: shimano spin makine, fujin lrf kamış, savage gear jig"
            className="gh-input flex-1"
          />
          {currentSort && currentSort !== "relevance" ? (
            <input type="hidden" name="sort" value={currentSort} />
          ) : null}
          <button type="submit" className="gh-button gh-button-primary whitespace-nowrap px-6">
            Ara
          </button>
        </form>
      </div>

      {!supabaseReady ? (
        <div className="mb-6 gh-panel border-[#fb8f44] bg-[#fff8c5] p-4 text-sm text-[#7d4e00]">
          Supabase bağlantısı henüz ayarlanmadı. Lütfen `.env.local` dosyasını yapılandırın.
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#d0d7de] pb-4 mb-6 gap-4">
        <h2 className="text-xl font-semibold text-[#24292f]">
          {query ? `“${query}” için arama sonuçları` : "Keşfetmeye başlayın"}
        </h2>
        {query && results.length > 0 ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#57606a]">{totalCount} ürün bulundu</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#57606a] whitespace-nowrap">Sırala:</span>
              <div className="flex gap-1 bg-[#f6f8fa] p-1 rounded-md border border-[#d0d7de]">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&sort=relevance`}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    currentSort === "relevance" ? "bg-white text-[#24292f] shadow-sm border border-[#d0d7de]" : "text-[#57606a] hover:text-[#24292f]"
                  }`}
                >
                  Alaka Düzeyi
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&sort=newest`}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    currentSort === "newest" ? "bg-white text-[#24292f] shadow-sm border border-[#d0d7de]" : "text-[#57606a] hover:text-[#24292f]"
                  }`}
                >
                  En Yeni
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&sort=price_asc`}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    currentSort === "price_asc" ? "bg-white text-[#24292f] shadow-sm border border-[#d0d7de]" : "text-[#57606a] hover:text-[#24292f]"
                  }`}
                >
                  En Ucuz
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&sort=price_desc`}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    currentSort === "price_desc" ? "bg-white text-[#24292f] shadow-sm border border-[#d0d7de]" : "text-[#57606a] hover:text-[#24292f]"
                  }`}
                >
                  En Pahalı
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {query && results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="gh-panel flex flex-col justify-between p-4 hover:border-[#0969da] group transition-all">
              <div>
                {/* Product Image Thumbnail */}
                <div className="w-full h-44 bg-white border border-[#e1e4e8] rounded-md mb-4 overflow-hidden flex items-center justify-center p-3 relative">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
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

                <p className="text-xs font-semibold uppercase tracking-wide text-[#57606a]">{product.brand || "Markasız"}</p>
                <h3 className="mt-1 line-clamp-2 min-h-12 text-base font-semibold text-[#0969da] group-hover:underline">{product.title}</h3>
              </div>

              <div>
                <div className="mt-4 border-t border-[#d8dee4] pt-3 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#57606a]">En Düşük Fiyat</p>
                    <p className="mt-0.5 text-2xl font-semibold text-[#1a7f37]">{formatTRY(product.lowestPrice)}</p>
                    <p className="text-xs text-[#57606a] mt-0.5 truncate max-w-[180px]">
                      {product.lowestStore ? `${product.lowestStore} mağazasında` : "Fiyat bekleniyor"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="border border-[#d0d7de] bg-[#f6f8fa] px-2.5 py-1 text-xs font-semibold text-[#57606a] inline-block rounded-sm">
                      {product.listingCount} teklif
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {query && totalCount === 0 ? (
        <div className="gh-panel border-dashed p-10 text-center bg-[#fafbfc]">
          <h2 className="text-xl font-semibold text-[#24292f]">Aradığınız kriterlere uygun sonuç bulunamadı.</h2>
          <p className="mt-2 text-sm text-[#57606a]">Anahtar kelimelerin doğru yazıldığından emin olun veya daha genel terimler deneyin (örn. "spin" yerine sadece marka yazın).</p>
        </div>
      ) : null}

      {query && totalPages > 1 ? (
        <nav aria-label="Sayfalama" className="mt-8 flex items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&sort=${currentSort}&page=${currentPage - 1}`}
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
              href={`/search?q=${encodeURIComponent(query)}&sort=${currentSort}&page=${currentPage + 1}`}
              className="gh-button px-4 py-2 text-sm font-semibold"
              aria-label="Sonraki sayfa"
            >
              Sonraki &rarr;
            </Link>
          ) : null}
        </nav>
      ) : null}

      {!query ? (
        <div className="gh-panel p-10 text-center bg-[#fafbfc] border-dashed">
          <h2 className="text-lg font-semibold text-[#24292f]">Hızlı Arama İpuçları</h2>
          <p className="mt-2 text-sm text-[#57606a] max-w-xl mx-auto leading-relaxed">
            Marka ve ürün tipini bir arada aratarak en iyi sonuçlara ulaşabilirsiniz. <br />
            Örneğin: <strong className="text-[#0969da]">"Daiwa Spin"</strong>, <strong className="text-[#0969da]">"Savage Gear Silikon"</strong> veya <strong className="text-[#0969da]">"Okuma Surf"</strong>.
          </p>
        </div>
      ) : null}
    </section>
  );
}
