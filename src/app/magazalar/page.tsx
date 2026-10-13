import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Store } from "lucide-react";
import { formatDateTime, formatTRY } from "@/lib/format";
import { getSupabaseClient } from "@/lib/supabase";
import { trackedStores, storeDomain } from "@/lib/stores";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Mağazalar",
  description:
    "OltaFiyat'ın fiyatlarını otomatik topladığı Türk balıkçılık mağazalarının tam listesi."
};

type StoreRow = {
  name: string;
  url: string | null;
  productCount: number;
  lowestPrice: number | null;
  highestPrice: number | null;
  lastUpdated: string | null;
};

async function getStores(): Promise<StoreRow[]> {
  const byName = new Map<string, StoreRow>(
    trackedStores.map((s) => [
      s.name,
      { name: s.name, url: s.url, productCount: 0, lowestPrice: null, highestPrice: null, lastUpdated: null }
    ])
  );

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("store_listings")
      .select("store_name, product_id, price, updated_at");

    if (error) {
      console.error("[magazalar] store_listings query failed:", error.message);
    } else {
      const productIdsByStore = new Map<string, Set<number>>();
      for (const row of data ?? []) {
        const existing = byName.get(row.store_name) ?? {
          name: row.store_name,
          url: null,
          productCount: 0,
          lowestPrice: null,
          highestPrice: null,
          lastUpdated: null
        };

        const ids = productIdsByStore.get(row.store_name) ?? new Set<number>();
        ids.add(row.product_id);
        productIdsByStore.set(row.store_name, ids);

        existing.lowestPrice = existing.lowestPrice === null ? row.price : Math.min(existing.lowestPrice, row.price);
        existing.highestPrice = existing.highestPrice === null ? row.price : Math.max(existing.highestPrice, row.price);
        if (!existing.lastUpdated || new Date(row.updated_at) > new Date(existing.lastUpdated)) {
          existing.lastUpdated = row.updated_at;
        }
        byName.set(row.store_name, existing);
      }
      for (const [name, ids] of Array.from(productIdsByStore.entries())) {
        const row = byName.get(name);
        if (row) row.productCount = ids.size;
      }
    }
  }

  return Array.from(byName.values()).sort((a, b) => {
    if (a.productCount !== b.productCount) return b.productCount - a.productCount;
    return a.name.localeCompare(b.name, "tr");
  });
}

export default async function StoresPage() {
  const stores = await getStores();
  const totalTracked = stores.length;
  const liveCount = stores.filter((s) => s.productCount > 0).length;

  return (
    <section className="container-shell py-8">
      <div className="mb-8">
        <span className="badge-label mb-3 inline-block">Mağaza Dizini</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1c2128]">Takip Ettiğimiz Mağazalar</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#57606a]">
          OltaFiyat, aşağıdaki {totalTracked} Türk balıkçılık mağazasını otomatik olarak tarar ve
          fiyatlarını karşılaştırır. {liveCount > 0
            ? `Şu anda ${liveCount} mağazadan canlı fiyat verisi geliyor.`
            : "Veri toplama hattı yeniden çalışmaya başladığında fiyatlar burada otomatik görünecek."}{" "}
          Güncelleme sıklığı ~12 saattir.
        </p>
      </div>

      <div className="panel overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1.2fr_1fr_auto] gap-4 border-b border-[#e8ecf0] bg-[#f6f8fa] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#57606a]">
          <span>Mağaza</span>
          <span>Takip Edilen Ürün</span>
          <span>Fiyat Aralığı</span>
          <span>Son Güncelleme</span>
          <span className="text-right">Bağlantı</span>
        </div>

        <div className="divide-y divide-[#e8ecf0]">
          {stores.map((store) => {
            const hasData = store.productCount > 0;
            return (
              <div
                key={store.name}
                className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1.2fr_1fr_auto] gap-2 sm:gap-4 px-5 py-4 items-center"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#f6f8fa] border border-[#e8ecf0] text-[#57606a]">
                    <Store size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1c2128] truncate">{store.name}</p>
                    {store.url && (
                      <p className="text-xs text-[#57606a] truncate">{storeDomain(store.url)}</p>
                    )}
                  </div>
                </div>

                <div className="text-sm text-[#1c2128]">
                  {hasData ? (
                    <>
                      <span className="font-semibold">{store.productCount.toLocaleString("tr-TR")}</span>{" "}
                      <span className="text-[#57606a]">ürün</span>
                    </>
                  ) : (
                    <span className="badge">Veri bekleniyor</span>
                  )}
                </div>

                <div className="text-sm">
                  {hasData && store.lowestPrice !== null ? (
                    <span className="text-[#1c2128]">
                      {formatTRY(store.lowestPrice)}
                      {store.highestPrice !== null && store.highestPrice !== store.lowestPrice && (
                        <span className="text-[#57606a]"> – {formatTRY(store.highestPrice)}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[#57606a]">—</span>
                  )}
                </div>

                <p className="text-xs text-[#57606a]">
                  {hasData ? formatDateTime(store.lastUpdated) : "Henüz taranmadı"}
                </p>

                <div className="sm:text-right">
                  {store.url ? (
                    <a
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="btn btn-sm gap-1 inline-flex"
                      aria-label={`${store.name} sitesine git`}
                    >
                      <ExternalLink size={11} />
                      Siteye git
                    </a>
                  ) : (
                    <span className="text-xs text-[#57606a]">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-5 text-xs text-[#57606a]">
        Bir mağaza mı işletiyorsun ve listeye eklenmek mi istiyorsun?{" "}
        <Link href="/" className="text-[#0969da] hover:underline">
          Ana sayfadan bize ulaş.
        </Link>
      </p>
    </section>
  );
}
