import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { formatTRY } from "@/lib/format";
import { getSupabaseClient, type ProductRow, type StoreListingRow } from "@/lib/supabase";
import { sanitizeSearchTokens, toFtsQuery, toOrFilter } from "@/lib/search";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ürün Ara",
  description: "Balık avı ürünlerinde mağazalar arası fiyat karşılaştırması yapın."
};

const PAGE_SIZE = 24;

type SearchPageProps = {
  searchParams: { q?: string; sort?: string; page?: string };
};

type SearchResult = ProductRow & {
  lowestPrice: number | null;
  lowestStore: string | null;
  listingCount: number;
  image_url: string | null;
};

function normalizeQuery(v: string | undefined) {
  return (v ?? "").trim().replace(/\s+/g, " ");
}

async function searchProducts(query: string, sortBy?: string): Promise<SearchResult[]> {
  if (!query) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const clean = query.replace(/[%_]/g, "");
  const words = sanitizeSearchTokens(clean);
  if (!words.length) return [];

  let productsRes;
  if (words.length > 1) {
    const fts = toFtsQuery(words);
    productsRes = await supabase
      .from("products")
      .select("id, title, brand, category_id, slug, created_at")
      .textSearch("title", fts, { config: "simple" })
      .limit(200);
    if (!productsRes.data || productsRes.data.length < 5) {
      productsRes = await supabase
        .from("products")
        .select("id, title, brand, category_id, slug, created_at")
        .or(toOrFilter(words))
        .limit(200);
    }
  } else {
    productsRes = await supabase
      .from("products")
      .select("id, title, brand, category_id, slug, created_at")
      .or(toOrFilter(words))
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

  const scored = products.map((product) => {
    const tl = `${product.brand ?? ""} ${product.title}`.toLowerCase();
    let score = words.reduce((acc, w) => {
      const wl = w.toLowerCase();
      return acc + (tl.includes(wl) ? 10 : 0) + (tl.startsWith(wl) ? 5 : 0);
    }, 0);
    const pl = listings.filter((l) => l.product_id === product.id);
    const img = pl.find((l) => l.image_url)?.image_url ?? null;
    return {
      product: {
        ...product,
        lowestPrice: pl[0]?.price ?? null,
        lowestStore: pl[0]?.store_name ?? null,
        listingCount: pl.length,
        image_url: img
      },
      score
    };
  });

  if (sortBy === "price_asc") scored.sort((a, b) => (a.product.lowestPrice ?? Infinity) - (b.product.lowestPrice ?? Infinity));
  else if (sortBy === "price_desc") scored.sort((a, b) => (b.product.lowestPrice ?? -Infinity) - (a.product.lowestPrice ?? -Infinity));
  else if (sortBy === "newest") scored.sort((a, b) => new Date(b.product.created_at).getTime() - new Date(a.product.created_at).getTime());
  else scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.product);
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

  const all = await searchProducts(query, sort);
  const total = all.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const results = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const supabaseReady = Boolean(getSupabaseClient());

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

      {/* Results header */}
      {query && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <p className="text-sm text-[#57606a]">
            {total > 0
              ? <><strong className="text-[#1c2128]">{total}</strong> sonuç &mdash; &ldquo;{query}&rdquo;</>
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
                    href={`/search?q=${encodeURIComponent(query)}&sort=${opt.value}`}
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
          <h2 className="text-lg font-bold text-[#1c2128]">Sonuç bulunamadı</h2>
          <p className="mt-2 text-sm text-[#57606a] max-w-sm mx-auto">
            &ldquo;{query}&rdquo; için eşleşen ürün yok. Daha kısa veya genel bir terim dene.
          </p>
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
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["lrf", "spin", "surf", "rapala", "jighead"].map((term) => (
              <Link key={term} href={`/search?q=${term}`} className="btn text-xs">
                {term}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Sayfalama" className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/search?q=${encodeURIComponent(query)}&sort=${sort}&page=${page - 1}`} className="btn">
              ← Önceki
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-[#57606a]">Sayfa {page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/search?q=${encodeURIComponent(query)}&sort=${sort}&page=${page + 1}`} className="btn">
              Sonraki →
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
