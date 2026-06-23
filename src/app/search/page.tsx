import type { Metadata } from "next";
import Link from "next/link";
import { formatTRY } from "@/lib/format";
import { getSupabaseClient, type ProductRow, type StoreListingRow } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Ürün Ara",
  description: "Balık avı ürünlerinde mağazalar arası fiyat karşılaştırması yapın."
};

type SearchPageProps = {
  searchParams: {
    q?: string;
  };
};

type SearchResult = ProductRow & {
  lowestPrice: number | null;
  lowestStore: string | null;
  listingCount: number;
};

function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const safeQuery = query.replace(/[%_]/g, "");
  const productsResponse = await supabase
    .from("products")
    .select("id, title, brand, category_id, slug, created_at")
    .or(`title.ilike.%${safeQuery}%,brand.ilike.%${safeQuery}%`)
    .order("created_at", { ascending: false })
    .limit(40);

  const products = productsResponse.data ?? [];
  const productIds = products.map((product) => product.id);
  if (productIds.length === 0) {
    return [];
  }

  const listingsResponse = await supabase
    .from("store_listings")
    .select("id, product_id, store_name, raw_title, price, product_url, image_url, updated_at")
    .in("product_id", productIds)
    .order("price", { ascending: true });

  const listings = (listingsResponse.data ?? []) as StoreListingRow[];

  return products.map((product) => {
    const productListings = listings.filter((listing) => listing.product_id === product.id);
    const lowestListing = productListings[0];
    return {
      ...product,
      lowestPrice: lowestListing?.price ?? null,
      lowestStore: lowestListing?.store_name ?? null,
      listingCount: productListings.length
    };
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = normalizeQuery(searchParams.q);
  const results = await searchProducts(query);
  const supabaseReady = Boolean(getSupabaseClient());

  return (
    <section className="container-shell py-10">
      <div className="gh-panel p-4 sm:p-5">
        <div className="gh-label mb-3">Fiyat arama</div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#24292f]">Ürün adı, model veya kategori ara.</h1>
        <form action="/search" className="mt-5 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="search-page-input" className="sr-only">Ürün adı</label>
          <input id="search-page-input" name="q" type="search" defaultValue={query} placeholder="Örn: surf kamış, spin makine, lrf silikon" className="gh-input" />
          <button type="submit" className="gh-button gh-button-primary whitespace-nowrap">
            Ara
          </button>
        </form>
      </div>

      {!supabaseReady ? (
        <div className="mt-4 gh-panel border-[#fb8f44] bg-[#fff8c5] p-4 text-sm text-[#7d4e00]">
          Supabase bağlantısı henüz ayarlanmadı. Vercel veya yerel ortamda NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini ekleyin.
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-4 border-b border-[#d0d7de] pb-3">
        <h2 className="text-lg font-semibold text-[#24292f]">
          {query ? `“${query}” için sonuçlar` : "Popüler bir ürün arayın"}
        </h2>
        {query ? <span className="text-sm text-[#57606a]">{results.length} ürün</span> : null}
      </div>

      {query && results.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {results.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="gh-panel block p-4 hover:border-[#0969da]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#57606a]">{product.brand || "Marka yok"}</p>
              <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-semibold text-[#0969da]">{product.title}</h3>
              <div className="mt-4 border-t border-[#d8dee4] pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#57606a]">Lowest Price Found</p>
                <p className="mt-1 text-2xl font-semibold text-[#1a7f37]">{formatTRY(product.lowestPrice)}</p>
                <p className="mt-1 text-sm text-[#57606a]">{product.lowestStore ? `${product.lowestStore} mağazasında` : "Mağaza teklifi bekleniyor"}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-[#57606a]">
                <span>{product.listingCount} fiyat teklifi</span>
                <span className="font-semibold text-[#0969da]">Karşılaştır</span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {query && results.length === 0 ? (
        <div className="mt-4 gh-panel border-dashed p-8 text-center">
          <h2 className="text-xl font-semibold text-[#24292f]">Sonuç bulunamadı.</h2>
          <p className="mt-2 text-sm text-[#57606a]">Daha kısa bir ürün adı deneyin veya scraper’ın ilk veri toplamasını bekleyin.</p>
        </div>
      ) : null}
    </section>
  );
}