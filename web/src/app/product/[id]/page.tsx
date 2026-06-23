import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Store, Tag } from "lucide-react";
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
    <section className="container-shell py-14">
      <Link href="/search" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-deepsea-900 hover:text-lure">
        <ArrowLeft className="h-4 w-4" />
        Aramaya dön
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-black text-deepsea-900">
            <Tag className="h-4 w-4" />
            Birleştirilmiş master ürün
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">{product.title}</h1>
          <p className="mt-5 text-lg font-semibold text-slate-600">
            Marka: <span className="text-deepsea-900">{product.brand || "Belirlenmedi"}</span>
          </p>
        </div>

        <aside className="rounded-[2.5rem] bg-deepsea-900 p-8 text-white shadow-soft">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">En iyi teklif</p>
          <p className="mt-4 text-5xl font-black">{formatTRY(lowestListing?.price)}</p>
          <p className="mt-3 text-cyan-50">{lowestListing ? `${lowestListing.store_name} mağazasında bulundu` : "Henüz aktif mağaza teklifi yok"}</p>
          {lowestListing ? (
            <a href={lowestListing.product_url} target="_blank" rel="noopener noreferrer nofollow" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-lure px-5 py-4 font-black text-white transition hover:bg-orange-600">
              Mağazaya Git
              <ExternalLink className="h-5 w-5" />
            </a>
          ) : null}
        </aside>
      </div>

      <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
            <Store className="h-6 w-6 text-deepsea-900" />
            Mağaza fiyat karşılaştırması
          </h2>
          <p className="mt-2 text-sm text-slate-500">Fiyatlar kesin olarak düşükten yükseğe sıralanmıştır.</p>
        </div>

        {product.listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Mağaza</th>
                  <th className="px-6 py-4">Mağazadaki ürün adı</th>
                  <th className="px-6 py-4">Son güncelleme</th>
                  <th className="px-6 py-4 text-right">Fiyat</th>
                  <th className="px-6 py-4 text-right">Satın alma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {product.listings.map((listing, index) => (
                  <tr key={listing.id} className={index === 0 ? "bg-cyan-50/50" : "bg-white"}>
                    <td className="px-6 py-5 font-black text-slate-950">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-deepsea-900 text-white">{index + 1}</span>
                        {listing.store_name}
                      </div>
                    </td>
                    <td className="max-w-sm px-6 py-5 text-sm font-medium leading-6 text-slate-700">{listing.raw_title}</td>
                    <td className="px-6 py-5 text-sm text-slate-500">{formatDateTime(listing.updated_at)}</td>
                    <td className="px-6 py-5 text-right text-2xl font-black text-deepsea-900">{formatTRY(listing.price)}</td>
                    <td className="px-6 py-5 text-right">
                      <a href={listing.product_url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center justify-center gap-2 rounded-full bg-lure px-4 py-2 text-sm font-black text-white transition hover:bg-orange-600">
                        Git
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <Store className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-2xl font-black text-slate-950">Bu ürün için mağaza kaydı bekleniyor.</h2>
            <p className="mt-2 text-slate-600">Scraper yeni fiyatları topladığında liste otomatik oluşacaktır.</p>
          </div>
        )}
      </div>
    </section>
  );
}