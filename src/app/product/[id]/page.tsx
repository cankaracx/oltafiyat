import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ChevronLeft, Store, TrendingDown } from "lucide-react";
import { formatDateTime, formatTRY } from "@/lib/format";
import { getSupabaseClient, type ProductRow, type StoreListingRow } from "@/lib/supabase";

export const revalidate = 43200;

type ProductPageProps = { params: { id: string } };
type ProductDetail = ProductRow & { listings: StoreListingRow[] };

async function getProduct(id: string): Promise<ProductDetail | null> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: product } = await supabase
    .from("products")
    .select("id, title, brand, category_id, slug, created_at")
    .eq("id", numericId)
    .single();
  if (!product) return null;

  const { data: rawListings } = await supabase
    .from("store_listings")
    .select("id, product_id, store_name, raw_title, price, product_url, image_url, updated_at")
    .eq("product_id", numericId)
    .order("price", { ascending: true });

  const allListings = (rawListings ?? []) as StoreListingRow[];

  // Filter out category/listing page URLs (must have ≥2 path segments)
  const productListings = allListings.filter((l) => {
    try { return new URL(l.product_url).pathname.split("/").filter(Boolean).length >= 2; }
    catch { return true; }
  });

  // Per-store dedup: keep cheapest
  const seen = new Set<string>();
  const listings = productListings.filter((l) => {
    if (seen.has(l.store_name)) return false;
    seen.add(l.store_name);
    return true;
  });

  return { ...product, listings };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return { title: "Ürün bulunamadı" };
  const lowest = product.listings[0];
  const image = product.listings.find((l) => l.image_url)?.image_url;
  const description = lowest
    ? `${product.title} — en düşük ${formatTRY(lowest.price)} (${lowest.store_name}). ${product.listings.length} mağaza fiyatını karşılaştırın.`
    : `${product.title} için mağaza fiyatlarını düşükten yükseğe karşılaştırın.`;
  return {
    title: product.title,
    description,
    openGraph: { title: `${product.title} | OltaFiyat`, description, url: `https://oltafiyat.com/product/${product.id}`, images: image ? [{ url: image, alt: product.title }] : [] },
    twitter: { card: "summary_large_image", title: `${product.title} | OltaFiyat`, description, images: image ? [image] : [] }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const lowest = product.listings[0];
  const highest = product.listings[product.listings.length - 1];
  const mainImage = product.listings.find((l) => l.image_url)?.image_url ?? null;
  const hasMultiple = product.listings.length > 1;
  const priceDiff = hasMultiple ? ((highest.price - lowest.price) / lowest.price) * 100 : 0;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(mainImage ? { image: mainImage } : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "TRY",
      lowPrice: lowest?.price ?? 0,
      highPrice: highest?.price ?? 0,
      offerCount: product.listings.length,
      availability: "https://schema.org/InStock",
      offers: product.listings.map((l) => ({
        "@type": "Offer",
        price: l.price,
        priceCurrency: "TRY",
        url: l.product_url,
        seller: { "@type": "Organization", name: l.store_name },
        availability: "https://schema.org/InStock"
      }))
    }
  };

  return (
    <section className="container-shell py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      {/* Breadcrumb */}
      <Link href="/search" className="mb-6 inline-flex items-center gap-1 text-sm text-[#57606a] hover:text-[#0969da] transition-colors">
        <ChevronLeft size={14} />
        Aramaya dön
      </Link>

      {/* Top grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* Left: image + title */}
        <div className="panel p-6 flex flex-col sm:flex-row gap-6">
          <div className="relative shrink-0 w-full sm:w-52 h-52 rounded-lg overflow-hidden border border-[#e8ecf0] bg-[#f6f8fa] flex items-center justify-center">
            {mainImage ? (
              <Image src={mainImage} alt={product.title} fill sizes="208px" className="object-contain p-3" priority />
            ) : (
              <span className="text-5xl opacity-20">🎣</span>
            )}
            {product.brand && (
              <span className="absolute top-2 left-2 badge">{product.brand}</span>
            )}
          </div>

          <div className="flex flex-col justify-between flex-1">
            <div>
              <span className="badge-label text-[10px] mb-3 inline-block">Birleştirilmiş Ürün Kaydı</span>
              <h1 className="text-2xl font-bold tracking-tight text-[#1c2128] leading-snug">
                {product.title}
              </h1>
              {product.brand && (
                <p className="mt-2 text-sm text-[#57606a]">Marka: <span className="font-semibold text-[#1c2128]">{product.brand}</span></p>
              )}
            </div>

            {hasMultiple && priceDiff > 1 && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#fff8c5] border border-[#d4a72c]/30 px-3 py-2 text-sm">
                <TrendingDown size={14} className="text-[#7d4e00] shrink-0" />
                <span className="text-[#7d4e00]">
                  Mağazalar arası fiyat farkı: <strong>%{Math.round(priceDiff)}</strong> — karşılaştırarak tasarruf et.
                </span>
              </div>
            )}

            <p className="mt-4 text-xs text-[#57606a]">
              Farklı mağazalardaki benzer ürünler bu başlık altında birleştirilmiştir. Fiyatlar ~12 saatte bir güncellenir.
            </p>
          </div>
        </div>

        {/* Right: best offer CTA */}
        <aside className="panel p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#57606a]">En Düşük Fiyat</p>
            <p className="price-lg mt-1">{formatTRY(lowest?.price)}</p>
            {lowest && (
              <p className="mt-1 text-sm text-[#57606a] flex items-center gap-1.5">
                <Store size={13} />
                {lowest.store_name}
              </p>
            )}
            {hasMultiple && (
              <p className="mt-2 text-xs text-[#57606a]">
                {product.listings.length} mağazadan <span className="font-semibold text-[#1c2128]">{product.listings.length}</span> teklif
              </p>
            )}
          </div>

          {lowest && (
            <a
              href={lowest.product_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn btn-primary mt-5 w-full justify-center gap-2 py-2.5 text-[15px]"
              aria-label={`${lowest.store_name} mağazasında satın al`}
            >
              <ExternalLink size={15} />
              Mağazaya Git
            </a>
          )}

          <p className="mt-3 text-center text-[10px] text-[#57606a]">
            Satın alma işlemi mağazanın kendi sitesinde gerçekleşir.
          </p>
        </aside>
      </div>

      {/* Store comparison */}
      <div className="panel mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#e8ecf0] bg-[#f6f8fa] px-5 py-4">
          <div>
            <h2 className="font-bold text-[#1c2128]">Mağaza Fiyat Karşılaştırması</h2>
            <p className="text-xs text-[#57606a] mt-0.5">{product.listings.length} mağaza — düşükten yükseğe sıralı</p>
          </div>
          {hasMultiple && (
            <span className="badge badge-green">
              <TrendingDown size={10} className="mr-1" />
              %{Math.round(priceDiff)} tasarruf
            </span>
          )}
        </div>

        {product.listings.length > 0 ? (
          <div className="divide-y divide-[#e8ecf0]">
            {product.listings.map((listing, index) => {
              const diffFromLowest = index > 0 ? ((listing.price - lowest.price) / lowest.price) * 100 : 0;
              return (
                <div
                  key={listing.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 transition-colors ${
                    index === 0 ? "bg-[#dafbe1]/50" : "bg-white hover:bg-[#f6f8fa]"
                  }`}
                >
                  {/* Rank + store */}
                  <div className="flex items-center gap-3 sm:w-48 shrink-0">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      index === 0 ? "bg-[#1a7f37] text-white" : "bg-[#f6f8fa] border border-[#d0d7de] text-[#57606a]"
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1c2128]">{listing.store_name}</p>
                      {index === 0 && <span className="badge badge-green text-[10px] mt-0.5">En ucuz</span>}
                    </div>
                  </div>

                  {/* Thumbnail + raw title */}
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    {listing.image_url && (
                      <Image
                        src={listing.image_url}
                        alt={listing.raw_title}
                        width={40}
                        height={40}
                        className="shrink-0 rounded border border-[#e8ecf0] bg-white object-contain p-0.5"
                      />
                    )}
                    <p className="text-sm text-[#57606a] line-clamp-2 min-w-0">{listing.raw_title}</p>
                  </div>

                  {/* Date */}
                  <p className="hidden lg:block text-xs text-[#57606a] shrink-0 w-32 text-right">
                    {formatDateTime(listing.updated_at)}
                  </p>

                  {/* Price + diff + CTA */}
                  <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${index === 0 ? "text-[#1a7f37]" : "text-[#1c2128]"}`}>
                        {formatTRY(listing.price)}
                      </p>
                      {diffFromLowest > 0 && (
                        <p className="text-[10px] text-[#cf222e] font-semibold">+%{Math.round(diffFromLowest)} pahalı</p>
                      )}
                    </div>
                    <a
                      href={listing.product_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className={`btn btn-sm gap-1 ${index === 0 ? "btn-primary" : ""}`}
                      aria-label={`${listing.store_name} mağazasına git`}
                    >
                      <ExternalLink size={11} />
                      Git
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-[#57606a]">Bu ürün için henüz mağaza kaydı yok.</p>
            <p className="mt-1 text-sm text-[#57606a]">Scraper yeni fiyatları topladığında otomatik görünecektir.</p>
          </div>
        )}
      </div>
    </section>
  );
}
