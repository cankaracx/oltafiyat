import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PackageSearch, Search } from "lucide-react";
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
    <section className="container-shell py-14">
      <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-deepsea-700">Fiyat arama</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">Aradığınız ürünü yazın, en uygun mağazayı bulun.</h1>
        <form action="/search" className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="search-page-input" className="sr-only">Ürün adı</label>
          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-cyan-500">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              id="search-page-input"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Örn: rapala, lrf silikon, spin kamış"
              className="w-full bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <button type="submit" className="rounded-2xl bg-deepsea-900 px-7 py-4 font-black text-white transition hover:bg-deepsea-700">
            Ara
          </button>
        </form>
      </div>

      {!supabaseReady ? (
        <div className="mt-8 rounded-[2rem] border border-orange-200 bg-orange-50 p-6 text-orange-900">
          Supabase bağlantısı henüz ayarlanmadı. Vercel veya yerel ortamda NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini ekleyin.
        </div>
      ) : null}

      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-slate-950">
          {query ? `“${query}” için sonuçlar` : "Popüler bir ürün arayın"}
        </h2>
        {query ? <span className="text-sm font-bold text-slate-500">{results.length} ürün</span> : null}
      </div>

      {query && results.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {results.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-deepsea-900 group-hover:bg-lure group-hover:text-white">
                <PackageSearch className="h-6 w-6" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{product.brand || "Marka bilgisi yok"}</p>
              <h3 className="mt-3 line-clamp-2 min-h-14 text-lg font-black text-slate-950">{product.title}</h3>
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-lure">Lowest Price Found</p>
                <p className="mt-1 text-3xl font-black text-deepsea-900">{formatTRY(product.lowestPrice)}</p>
                <p className="mt-2 text-sm text-slate-500">{product.lowestStore ? `${product.lowestStore} mağazasında` : "Mağaza teklifi bekleniyor"}</p>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm font-bold text-slate-500">
                <span>{product.listingCount} fiyat teklifi</span>
                <span className="inline-flex items-center gap-1 text-deepsea-900">
                  Karşılaştır
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {query && results.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
          <PackageSearch className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-2xl font-black text-slate-950">Sonuç bulunamadı.</h2>
          <p className="mt-2 text-slate-600">Daha kısa bir ürün adı deneyin veya scraper’ın ilk veri toplamasını bekleyin.</p>
        </div>
      ) : null}
    </section>
  );
}