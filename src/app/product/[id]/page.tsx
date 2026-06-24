import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDateTime, formatTRY } from "@/lib/format";
import { getSupabaseClient, type ProductRow, type StoreListingRow } from "@/lib/supabase";

type ProductPageProps = {
  params: {
    id: string;
  };
};

type ProductDetail = ProductRow & {
  listings: StoreListingRow[];
};

async function getProduct(id: string): Promise<ProductDetail | null> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const productResponse = await supabase
    .from("products")
    .select("id, title, brand, category_id, slug, created_at")
    .eq("id", numericId)
    .single();

  if (!productResponse.data) {
    return null;
  }

  const listingsResponse = await supabase
    .from("store_listings")
    .select("id, product_id, store_name, raw_title, price, product_url, image_url, updated_at")
    .eq("product_id", numericId)
    .order("price", { ascending: true });

  const allListings = (listingsResponse.data ?? []) as StoreListingRow[];

  // Filter out listings whose URL points to a generic category/listing page
  // rather than a specific product page. Product URLs typically have 2+ path segments.
  const productListings = allListings.filter((l) => {
    try {
      const pathname = new URL(l.product_url).pathname;
      const segments = pathname.split("/").filter(Boolean);
      return segments.length >= 2;
    } catch {
      return true; // keep malformed URLs as-is; better than hiding valid data
    }
  });

  // Deduplicate by store: keep only the cheapest listing per store.
  // The .order("price", ascending) above means the first occurrence per store is cheapest.
  const seenStores = new Set<string>();
  const dedupedListings = productListings.filter((l) => {
    if (seenStores.has(l.store_name)) return false;
    seenStores.add(l.store_name);
    return true;
  });

  return {
    ...productResponse.data,
    listings: dedupedListings
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) {
    return { title: "Ürün bulunamadı" };
  }
  const lowestListing = product.listings[0];
  const image = product.listings.find((l) => l.image_url)?.image_url;
  const description = lowestListing
    ? `${product.title} — en ucuz ${formatTRY(lowestListing.price)}, ${lowestListing.store_name}. ${product.listings.length} mağaza fiyatını karşılaştırın.`
    : `${product.title} için mağaza fiyatlarını düşükten yükseğe karşılaştırın.`;

  return {
    title: product.title,
    description,
    openGraph: {
      title: `${product.title} | OltaFiyat`,
      description,
      url: `https://oltafiyat.com/product/${product.id}`,
      images: image ? [{ url: image, alt: product.title }] : []
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | OltaFiyat`,
      description,
      images: image ? [image] : []
    }
  };
}

export const revalidate = 43200; // 12 saat — scraper frekansıyla uyumlu

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);
  if (!product) {
    notFound();
  }

  const lowestListing = product.listings[0];
  const highestListing = product.listings[product.listings.length - 1];
  const mainImage = product.listings.find((l) => l.image_url)?.image_url ?? null;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(mainImage ? { image: mainImage } : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "TRY",
      lowPrice: lowestListing?.price ?? 0,
      highPrice: highestListing?.price ?? 0,
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
    <section className="container-shell py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Link href="/search" className="mb-5 inline-flex text-sm font-semibold text-[#0969da] hover:underline">
        &larr; Aramaya dön
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Product main info card with image */}
        <div className="gh-panel p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
          <div className="w-full sm:w-48 h-48 bg-white border border-[#e1e4e8] rounded-md overflow-hidden flex items-center justify-center p-3 flex-shrink-0 relative">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.title}
                fill
                sizes="192px"
                className="object-contain p-3"
                priority
              />
            ) : (
              <span className="text-xs text-[#57606a] italic">Görsel Yok</span>
            )}
            {product.brand ? (
              <span className="absolute top-2 left-2 bg-[#f6f8fa] border border-[#d0d7de] text-[#24292f] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded">
                {product.brand}
              </span>
            ) : null}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="gh-label mb-3">
                Birleştirilmiş Ürün Kaydı
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#24292f] sm:text-3xl leading-snug">{product.title}</h1>
              <p className="mt-3 text-sm text-[#57606a]">
                Marka: <span className="font-semibold text-[#24292f]">{product.brand || "Belirlenmedi"}</span>
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-xs text-[#57606a]">
              Farklı mağazalardaki benzer ürünler bu başlık altında birleştirilmiştir. Fiyatlar yaklaşık 12 saatte bir güncellenir.
            </div>
          </div>
        </div>

        {/* Call to action side card */}
        <aside className="gh-panel p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#57606a]">En Düşük Fiyat</p>
            <p className="mt-2 text-4xl font-semibold text-[#1a7f37]">{formatTRY(lowestListing?.price)}</p>
            <p className="mt-2 text-sm text-[#57606a]">
              {lowestListing ? `${lowestListing.store_name} mağazasında bulundu` : "Henüz aktif mağaza teklifi yok"}
            </p>
          </div>
          {lowestListing ? (
            <a
              href={lowestListing.product_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="gh-button gh-button-primary mt-5 w-full text-center py-2 text-sm font-semibold block"
              aria-label={`${lowestListing.store_name} mağazasında satın al`}
            >
              Mağazaya Git →
            </a>
          ) : null}
        </aside>
      </div>

      <div className="mt-6 overflow-hidden gh-panel">
        <div className="border-b border-[#d0d7de] bg-[#f6f8fa] p-4">
          <h2 className="text-lg font-semibold text-[#24292f]">
            Tüm Mağaza Fiyat Karşılaştırması
          </h2>
          <p className="mt-1 text-sm text-[#57606a]">Fiyatlar düşükten yükseğe (en ucuzdan en pahalıya) sıralanmıştır.</p>
        </div>

        {product.listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#f6f8fa] text-xs font-semibold uppercase tracking-wide text-[#57606a]">
                <tr>
                  <th className="px-6 py-4">Mağaza</th>
                  <th className="px-6 py-4">Mağazadaki Ürün Adı</th>
                  <th className="px-6 py-4">Son Güncelleme</th>
                  <th className="px-6 py-4 text-right">Fiyat</th>
                  <th className="px-6 py-4 text-right">Mağaza Sayfası</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8dee4]">
                {product.listings.map((listing, index) => (
                  <tr key={listing.id} className={index === 0 ? "bg-[#dafbe1]" : "bg-white hover:bg-[#fafbfc]"}>
                    <td className="px-6 py-4 font-semibold text-[#24292f]">
                      <div className="flex items-center gap-3">
                        <span className="border border-[#d0d7de] bg-[#f6f8fa] px-2 py-0.5 text-[10px] text-[#57606a] rounded-sm font-mono font-bold">
                          #{index + 1}
                        </span>
                        {listing.store_name}
                      </div>
                    </td>
                    <td className="max-w-sm px-6 py-4 text-sm leading-6 text-[#57606a]">
                      <div className="flex items-center gap-3">
                        {listing.image_url ? (
                          <Image
                            src={listing.image_url}
                            alt={listing.raw_title}
                            width={40}
                            height={40}
                            className="object-contain bg-white border border-[#d0d7de] rounded p-0.5 flex-shrink-0"
                          />
                        ) : null}
                        <span className="line-clamp-2">{listing.raw_title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#57606a]">{formatDateTime(listing.updated_at)}</td>
                    <td className="px-6 py-4 text-right text-xl font-bold text-[#1a7f37]">{formatTRY(listing.price)}</td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={listing.product_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="gh-button text-xs py-1.5 px-3 font-semibold hover:border-[#0969da] hover:text-[#0969da]"
                      >
                        Mağazaya Git
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#fafbfc]">
            <h2 className="text-xl font-semibold text-[#24292f]">Bu ürün için mağaza kaydı bekleniyor.</h2>
            <p className="mt-2 text-sm text-[#57606a]">Scraper yeni fiyatları topladığında liste otomatik oluşacaktır.</p>
          </div>
        )}
      </div>
    </section>
  );
}
