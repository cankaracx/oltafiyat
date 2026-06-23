import type { Metadata } from "next";
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

  return {
    ...productResponse.data,
    listings: (listingsResponse.data ?? []) as StoreListingRow[]
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) {
    return { title: "Ürün bulunamadı" };
  }
  return {
    title: product.title,
    description: `${product.title} için mağaza fiyatlarını düşükten yükseğe karşılaştırın.`
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);
  if (!product) {
    notFound();
  }

  const lowestListing = product.listings[0];

  return (
    <section className="container-shell py-10">
      <Link href="/search" className="mb-5 inline-flex text-sm font-semibold text-[#0969da] hover:underline">
        Aramaya dön
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="gh-panel p-5 sm:p-6">
          <div className="gh-label mb-3">
            Birleştirilmiş master ürün
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#24292f] sm:text-4xl">{product.title}</h1>
          <p className="mt-3 text-sm text-[#57606a]">
            Marka: <span className="font-semibold text-[#24292f]">{product.brand || "Belirlenmedi"}</span>
          </p>
        </div>

        <aside className="gh-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#57606a]">En iyi teklif</p>
          <p className="mt-2 text-4xl font-semibold text-[#1a7f37]">{formatTRY(lowestListing?.price)}</p>
          <p className="mt-2 text-sm text-[#57606a]">{lowestListing ? `${lowestListing.store_name} mağazasında bulundu` : "Henüz aktif mağaza teklifi yok"}</p>
          {lowestListing ? (
            <a href={lowestListing.product_url} target="_blank" rel="noopener noreferrer nofollow" className="gh-button gh-button-primary mt-5 w-full">
              Mağazaya Git
            </a>
          ) : null}
        </aside>
      </div>

      <div className="mt-6 overflow-hidden gh-panel">
        <div className="border-b border-[#d0d7de] bg-[#f6f8fa] p-4">
          <h2 className="text-lg font-semibold text-[#24292f]">
            Mağaza fiyat karşılaştırması
          </h2>
          <p className="mt-1 text-sm text-[#57606a]">Fiyatlar düşükten yükseğe sıralanmıştır.</p>
        </div>

        {product.listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#f6f8fa] text-xs font-semibold uppercase tracking-wide text-[#57606a]">
                <tr>
                  <th className="px-6 py-4">Mağaza</th>
                  <th className="px-6 py-4">Mağazadaki ürün adı</th>
                  <th className="px-6 py-4">Son güncelleme</th>
                  <th className="px-6 py-4 text-right">Fiyat</th>
                  <th className="px-6 py-4 text-right">Satın alma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8dee4]">
                {product.listings.map((listing, index) => (
                  <tr key={listing.id} className={index === 0 ? "bg-[#dafbe1]" : "bg-white"}>
                    <td className="px-6 py-4 font-semibold text-[#24292f]">
                      <div className="flex items-center gap-3">
                        <span className="border border-[#d0d7de] bg-[#f6f8fa] px-2 py-1 text-xs text-[#57606a]">#{index + 1}</span>
                        {listing.store_name}
                      </div>
                    </td>
                    <td className="max-w-sm px-6 py-4 text-sm leading-6 text-[#57606a]">{listing.raw_title}</td>
                    <td className="px-6 py-4 text-sm text-[#57606a]">{formatDateTime(listing.updated_at)}</td>
                    <td className="px-6 py-4 text-right text-xl font-semibold text-[#1a7f37]">{formatTRY(listing.price)}</td>
                    <td className="px-6 py-4 text-right">
                      <a href={listing.product_url} target="_blank" rel="noopener noreferrer nofollow" className="gh-button">
                        Git
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold text-[#24292f]">Bu ürün için mağaza kaydı bekleniyor.</h2>
            <p className="mt-2 text-sm text-[#57606a]">Scraper yeni fiyatları topladığında liste otomatik oluşacaktır.</p>
          </div>
        )}
      </div>
    </section>
  );
}