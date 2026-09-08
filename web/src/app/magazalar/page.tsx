import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Store } from "lucide-react";
import { formatTRY } from "@/lib/format";
import { slugify } from "@/lib/slug";
import { getSupabaseClient } from "@/lib/supabase";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Mağazalar",
  description: "OltaFiyat'ın fiyatlarını takip ettiği tüm Türk balıkçılık mağazalarının listesi ve ürün kapsamı."
};

type StoreSummary = {
  name: string;
  slug: string;
  productCount: number;
  listingCount: number;
  lowestPrice: number;
  homepage: string | null;
};

function homepageOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

async function getStoreDirectory(): Promise<{ stores: StoreSummary[]; totalListings: number }> {
  const supabase = getSupabaseClient();
  const empty = { stores: [], totalListings: 0 };
  if (!supabase) return empty;

  const { data } = await supabase
    .from("store_listings")
    .select("store_name, product_id, price, product_url");

  const rows = data ?? [];
  if (rows.length === 0) return empty;

  const byStore = new Map<
    string,
    { productIds: Set<number>; listingCount: number; lowestPrice: number; sampleUrl: string }
  >();

  for (const row of rows) {
    const entry = byStore.get(row.store_name) ?? {
      productIds: new Set<number>(),
      listingCount: 0,
      lowestPrice: row.price,
      sampleUrl: row.product_url
    };
    entry.productIds.add(row.product_id);
    entry.listingCount += 1;
    if (row.price < entry.lowestPrice) entry.lowestPrice = row.price;
    byStore.set(row.store_name, entry);
  }

  const stores = Array.from(byStore.entries())
    .map(([name, v]) => ({
      name,
      slug: slugify(name),
      productCount: v.productIds.size,
      listingCount: v.listingCount,
      lowestPrice: v.lowestPrice,
      homepage: homepageOf(v.sampleUrl)
    }))
    .sort((a, b) => b.productCount - a.productCount);

  return { stores, totalListings: rows.length };
}

export default async function StoresPage() {
  const { stores, totalListings } = await getStoreDirectory();
  const supabaseReady = Boolean(getSupabaseClient());

  return (
    <section className="container-shell py-8">
      <div className="panel p-5 mb-6">
        <span className="badge-label mb-2 inline-block">Mağaza Dizini</span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1c2128]">Karşılaştırılan Mağazalar</h1>
        <p className="mt-1 text-sm text-[#57606a] leading-relaxed max-w-2xl">
          {stores.length > 0
            ? <>OltaFiyat şu an <strong className="text-[#1c2128]">{stores.length}</strong> mağazadan{" "}
                <strong className="text-[#1c2128]">{totalListings.toLocaleString("tr-TR")}</strong> fiyat kaydı topluyor.
                Listeler ürün kapsamına (mağazanın karşılaştırdığımız ürün sayısına) göre sıralanır.</>
            : "Mağaza verisi şu anda kullanılamıyor."}
        </p>
      </div>

      {!supabaseReady && (
        <div className="mb-4 panel border-[#fb8f44] bg-[#fff8c5] p-4 text-sm text-[#7d4e00]">
          Supabase bağlantısı kurulamadı. <code>.env.local</code> dosyasını kontrol et.
        </div>
      )}

      {stores.length > 0 ? (
        <div className="panel overflow-hidden">
          <div className="hidden sm:flex items-center gap-3 border-b border-[#e8ecf0] bg-[#f6f8fa] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#57606a]">
            <span className="w-8 shrink-0">#</span>
            <span className="flex-1">Mağaza</span>
            <span className="w-24 text-right shrink-0">Ürün</span>
            <span className="w-24 text-right shrink-0">Fiyat Kaydı</span>
            <span className="w-32 text-right shrink-0">En Düşük Fiyat</span>
            <span className="w-24 shrink-0" />
          </div>

          <div className="divide-y divide-[#e8ecf0]">
            {stores.map((store, index) => (
              <div
                key={store.name}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 hover:bg-[#f6f8fa] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f6f8fa] border border-[#d0d7de] text-xs font-bold text-[#57606a] sm:w-8">
                    {index + 1}
                  </span>
                  <Store size={15} className="text-[#57606a] shrink-0" aria-hidden />
                  <Link
                    href={`/magazalar/${store.slug}`}
                    className="text-sm font-semibold text-[#1c2128] hover:text-[#0969da] transition-colors truncate"
                  >
                    {store.name}
                  </Link>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-3 sm:w-[280px] shrink-0 text-sm">
                  <span className="sm:w-24 sm:text-right text-[#1c2128] font-medium">
                    {store.productCount.toLocaleString("tr-TR")}
                    <span className="sm:hidden text-[#57606a]"> ürün</span>
                  </span>
                  <span className="sm:w-24 sm:text-right text-[#57606a]">
                    {store.listingCount.toLocaleString("tr-TR")}
                    <span className="sm:hidden"> kayıt</span>
                  </span>
                  <span className="sm:w-32 sm:text-right price">{formatTRY(store.lowestPrice)}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0 sm:w-24 sm:justify-end">
                  <Link href={`/magazalar/${store.slug}`} className="btn btn-sm">
                    İncele
                  </Link>
                  {store.homepage && (
                    <a
                      href={store.homepage}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="btn btn-sm px-2"
                      aria-label={`${store.name} mağaza sitesine git`}
                      title="Mağaza sitesi"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        supabaseReady && (
          <div className="panel border-dashed p-12 text-center">
            <p className="text-4xl mb-4 opacity-30">🏬</p>
            <h2 className="text-lg font-bold text-[#1c2128]">Henüz mağaza verisi yok</h2>
            <p className="mt-2 text-sm text-[#57606a]">Scraper ilk fiyatları topladığında mağazalar burada listelenecek.</p>
          </div>
        )
      )}
    </section>
  );
}
