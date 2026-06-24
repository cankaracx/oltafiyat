import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { formatTRY } from "@/lib/format";
import { getSupabaseClient } from "@/lib/supabase";
import { mainCategories } from "@/lib/categories";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "OltaFiyat | Türkiye Balık Avı Fiyat Karşılaştırma",
  description:
    "Kamış, makine, sahte yem, misina ve aksesuar fiyatlarını 16+ Türk balıkçılık mağazasında karşılaştırın.",
  openGraph: {
    title: "OltaFiyat | Türkiye Balık Avı Fiyat Karşılaştırma",
    description:
      "Kamış, makine, sahte yem, misina ve aksesuar fiyatlarını 16+ Türk balıkçılık mağazasında karşılaştırın.",
    url: "https://oltafiyat.com"
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "OltaFiyat",
  url: "https://oltafiyat.com",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "https://oltafiyat.com/search?q={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
};

type FeaturedProduct = {
  id: number;
  title: string;
  brand: string | null;
  image_url: string | null;
  lowestPrice: number;
  storeName: string;
  listingCount: number;
};

type SiteStats = { productCount: number; storeCount: number; listingCount: number };

async function getHomepageData(): Promise<{ featured: FeaturedProduct[]; stats: SiteStats }> {
  const supabase = getSupabaseClient();
  const fallback = { featured: [], stats: { productCount: 0, storeCount: 0, listingCount: 0 } };
  if (!supabase) return fallback;

  // Fetch all listings first — no limit, so we get the full picture
  const listingsRes = await supabase
    .from("store_listings")
    .select("id, product_id, store_name, price, image_url, updated_at");

  const listings = listingsRes.data ?? [];
  if (listings.length === 0) return fallback;

  const storeNames = new Set(listings.map((l) => l.store_name));

  // Group listings by product_id
  const listingsByProduct = new Map<number, typeof listings>();
  for (const l of listings) {
    if (!listingsByProduct.has(l.product_id)) listingsByProduct.set(l.product_id, []);
    listingsByProduct.get(l.product_id)!.push(l);
  }

  // Top 12 product IDs sorted by how many stores carry them
  const topProductIds = Array.from(listingsByProduct.entries())
    .filter(([, ls]) => ls.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 12)
    .map(([id]) => id);

  const stats: SiteStats = {
    productCount: listingsByProduct.size,
    storeCount: storeNames.size,
    listingCount: listings.length
  };

  if (topProductIds.length === 0) return { featured: [], stats };

  // Fetch ONLY the products we need by their exact IDs — no limit, no offset ordering issues
  const productsRes = await supabase
    .from("products")
    .select("id, title, brand")
    .in("id", topProductIds);

  const productMap = new Map((productsRes.data ?? []).map((p) => [p.id, p]));

  const featured: FeaturedProduct[] = topProductIds.slice(0, 6).flatMap((productId) => {
    const prod = productMap.get(productId);
    if (!prod) return []; // skip if product not found
    const ls = listingsByProduct.get(productId)!;
    const lowest = [...ls].sort((a, b) => a.price - b.price)[0];
    const img = ls.find((l) => l.image_url)?.image_url ?? null;
    return [{
      id: productId,
      title: prod.title,
      brand: prod.brand ?? null,
      image_url: img,
      lowestPrice: lowest.price,
      storeName: lowest.store_name,
      listingCount: ls.length
    }];
  });

  return { featured, stats };
}

export default async function HomePage() {
  const { featured, stats } = await getHomepageData();

  const quickCategories = mainCategories.slice(0, 8);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* ── HERO ── */}
      <section className="border-b border-[#d0d7de] bg-white">
        <div className="container-shell py-14">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge mb-5">Türkiye Balık Avı Fiyat İndeksi</span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#1c2128] sm:text-5xl leading-tight">
              En düşük balıkçılık fiyatlarını<br className="hidden sm:block" /> tek panelde bul.
            </h1>
            <p className="mt-5 text-base leading-7 text-[#57606a] max-w-xl mx-auto">
              OltaFiyat; kamış, makine, sahte yem, misina ve aksesuar fiyatlarını 16+ Türk mağazasından
              toplar, karşılaştırır ve en ucuz teklifi gösterir.
            </p>

            <form action="/search" className="mt-8 flex gap-2 max-w-lg mx-auto">
              <label htmlFor="hero-search" className="sr-only">Ürün ara</label>
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder="Ürün, marka veya model ara…"
                className="input flex-1 text-[15px] py-3"
              />
              <button type="submit" className="btn btn-primary px-6 py-3 text-[15px]">
                Ara
              </button>
            </form>
          </div>

          {/* Stats */}
          {stats.productCount > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              {[
                { value: stats.productCount.toLocaleString("tr-TR"), label: "Ürün" },
                { value: stats.storeCount.toString() + "+", label: "Mağaza" },
                { value: stats.listingCount.toLocaleString("tr-TR"), label: "Fiyat kaydı" },
                { value: "12 saat", label: "Güncelleme sıklığı" }
              ].map((s) => (
                <div key={s.label} className="text-center px-5">
                  <div className="text-2xl font-bold text-[#1c2128]">{s.value}</div>
                  <div className="mt-0.5 text-xs text-[#57606a] font-medium uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="container-shell py-10">
        <div className="section-header">
          <h2 className="text-lg font-bold text-[#1c2128]">Kategoriler</h2>
          <Link href="/categories" className="text-sm font-semibold text-[#0969da] hover:underline">
            Tümünü gör →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {quickCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="panel-flat flex items-center justify-center p-3 text-center hover:border-[#0969da] hover:shadow-md transition-all min-h-[52px]"
            >
              <span className="text-xs font-semibold text-[#1c2128] leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED ── */}
      {featured.length > 0 && (
        <section className="container-shell pb-14">
          <div className="section-header">
            <h2 className="text-lg font-bold text-[#1c2128]">En Çok Karşılaştırılan Ürünler</h2>
            <Link href="/search?q=makine" className="text-sm font-semibold text-[#0969da] hover:underline">
              Tüm ürünleri ara →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="panel group flex flex-col hover:shadow-md hover:border-[#0969da]/40 transition-all"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden rounded-t-[10px] bg-[#f6f8fa] border-b border-[#e8ecf0] flex items-center justify-center">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      unoptimized={product.image_url.startsWith("http://")}
                    />
                  ) : (
                    <div className="text-3xl opacity-20">🎣</div>
                  )}
                  <span className="absolute top-2 right-2 badge badge-blue">
                    {product.listingCount} mağaza
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 justify-between p-4">
                  <div>
                    {product.brand && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#57606a] mb-1">
                        {product.brand}
                      </p>
                    )}
                    <h3 className="text-sm font-semibold text-[#1c2128] leading-snug line-clamp-2 group-hover:text-[#0969da] transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  <div className="mt-3 flex items-end justify-between border-t border-[#e8ecf0] pt-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#57606a]">En düşük fiyat</p>
                      <p className="price mt-0.5">{formatTRY(product.lowestPrice)}</p>
                      <p className="text-xs text-[#57606a] mt-0.5 truncate max-w-[160px]">
                        {product.storeName}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#0969da]">İncele →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
