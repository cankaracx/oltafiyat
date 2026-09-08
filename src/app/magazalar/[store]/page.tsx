import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, Store } from "lucide-react";
import { formatDateTime, formatTRY } from "@/lib/format";
import { slugify } from "@/lib/slug";
import { getSupabaseClient } from "@/lib/supabase";

export const revalidate = 21600;

const PAGE_SIZE = 24;

type StorePageProps = {
  params: { store: string };
  searchParams: { sort?: string; page?: string };
};

type StoreListingItem = {
  id: number;
  product_id: number;
  title: string;
  brand: string | null;
  price: number;
  product_url: string;
  image_url: string | null;
  updated_at: string;
};

function homepageOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

async function resolveStoreName(slug: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.from("store_listings").select("store_name");
  const names = Array.from(new Set((data ?? []).map((r) => r.store_name)));
  return names.find((name) => slugify(name) === slug) ?? null;
}

async function getStoreCatalog(storeName: string, sort: string, page: number) {
  const supabase = getSupabaseClient();
  const empty = { items: [] as StoreListingItem[], totalCount: 0, homepage: null as string | null };
  if (!supabase) return empty;

  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("store_listings")
    .select("id, product_id, raw_title, price, product_url, image_url, updated_at", { count: "exact" })
    .eq("store_name", storeName);

  if (sort === "price_desc") query = query.order("price", { ascending: false });
  else if (sort === "newest") query = query.order("updated_at", { ascending: false });
  else query = query.order("price", { ascending: true });

  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
  const listings = data ?? [];
  const totalCount = count ?? 0;

  const productIds = listings.map((l) => l.product_id);
  const { data: productsData } = productIds.length
    ? await supabase.from("products").select("id, title, brand").in("id", productIds)
    : { data: [] };
  const productMap = new Map((productsData ?? []).map((p) => [p.id, p]));

  const items: StoreListingItem[] = listings.map((l) => ({
    id: l.id,
    product_id: l.product_id,
    title: productMap.get(l.product_id)?.title ?? l.raw_title,
    brand: productMap.get(l.product_id)?.brand ?? null,
    price: l.price,
    product_url: l.product_url,
    image_url: l.image_url,
    updated_at: l.updated_at
  }));

  const homepage = listings.length > 0 ? homepageOf(listings[0].product_url) : null;

  return { items, totalCount, homepage };
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const storeName = await resolveStoreName(params.store);
  if (!storeName) return { title: "Mağaza bulunamadı" };
  return {
    title: storeName,
    description: `${storeName} mağazasının balıkçılık ürünleri fiyat listesi. OltaFiyat ile diğer mağazalarla karşılaştırın.`
  };
}

const SORT_OPTIONS = [
  { value: "price_asc", label: "En Ucuz" },
  { value: "price_desc", label: "En Pahalı" },
  { value: "newest", label: "En Yeni" }
];

export default async function StoreDetailPage({ params, searchParams }: StorePageProps) {
  const storeName = await resolveStoreName(params.store);
  if (!storeName) notFound();

  const sort = searchParams.sort || "price_asc";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const { items, totalCount, homepage } = await getStoreCatalog(storeName, sort, page);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <section className="container-shell py-8">
      <Link href="/magazalar" className="mb-6 inline-flex items-center gap-1 text-sm text-[#57606a] hover:text-[#0969da] transition-colors">
        <ChevronLeft size={14} /> Mağazalar
      </Link>

      <div className="panel p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="badge-label mb-2 inline-flex items-center gap-1">
            <Store size={11} /> Mağaza
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1c2128]">{storeName}</h1>
          <p className="mt-1 text-sm text-[#57606a]">
            <strong className="text-[#1c2128]">{totalCount.toLocaleString("tr-TR")}</strong> ürün karşılaştırmaya dahil
          </p>
        </div>
        {homepage && (
          <a
            href={homepage}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="btn shrink-0 gap-2"
          >
            <ExternalLink size={14} />
            Mağaza Sitesi
          </a>
        )}
      </div>

      {totalCount > 0 && (
        <div className="flex items-center justify-end gap-2 mb-5">
          <span className="text-sm text-[#57606a]">Sıralama:</span>
          <div className="flex rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-0.5 gap-0.5">
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={`/magazalar/${params.store}?sort=${opt.value}`}
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

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.product_id}`}
              className="panel group flex flex-col hover:shadow-md hover:border-[#0969da]/40 transition-all"
            >
              <div className="relative h-40 overflow-hidden rounded-t-[10px] bg-[#f6f8fa] border-b border-[#e8ecf0] flex items-center justify-center">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-4xl opacity-15">🎣</span>
                )}
                {item.brand && <span className="absolute top-2 left-2 badge">{item.brand}</span>}
              </div>

              <div className="flex flex-col flex-1 justify-between p-3.5">
                <h2 className="text-sm font-semibold text-[#1c2128] line-clamp-2 leading-snug min-h-10 group-hover:text-[#0969da] transition-colors">
                  {item.title}
                </h2>
                <div className="mt-3 flex items-end justify-between border-t border-[#e8ecf0] pt-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#57606a]">{storeName} fiyatı</p>
                    <p className="price mt-0.5 text-xl">{formatTRY(item.price)}</p>
                    <p className="text-[10px] text-[#57606a] mt-0.5">{formatDateTime(item.updated_at)}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#0969da]">Karşılaştır</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="panel border-dashed p-12 text-center">
          <p className="text-4xl mb-4 opacity-30">📦</p>
          <h2 className="text-lg font-bold text-[#1c2128]">Bu mağaza için henüz ürün yok</h2>
          <p className="mt-2 text-sm text-[#57606a]">Scraper yeni veriler topladığında otomatik görünecektir.</p>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Sayfalama" className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/magazalar/${params.store}?sort=${sort}&page=${page - 1}`} className="btn">
              Önceki
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-[#57606a]">Sayfa {page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/magazalar/${params.store}?sort=${sort}&page=${page + 1}`} className="btn">
              Sonraki
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
