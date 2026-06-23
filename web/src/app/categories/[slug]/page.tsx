import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, PackageSearch } from "lucide-react";
import { categories } from "@/lib/categories";
import { formatTRY } from "@/lib/format";
import { getSupabaseClient, type ProductRow, type StoreListingRow } from "@/lib/supabase";

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

type ProductWithLowest = ProductRow & {
  lowestPrice: number | null;
  listingCount: number;
};

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) {
    return { title: "Kategori bulunamadı" };
  }
  return {
    title: category.name,
    description: category.description
  };
}

async function getCategoryProducts(slug: string): Promise<ProductWithLowest[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const categoryResponse = await supabase.from("categories").select("id").eq("slug", slug).single();
  const categoryId = categoryResponse.data?.id;
  if (!categoryId) {
    return [];
  }

  const productsResponse = await supabase
    .from("products")
    .select("id, title, brand, category_id, slug, created_at")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })
    .limit(36);

  const products = productsResponse.data ?? [];
  const productIds = products.map((product) => product.id);
  if (productIds.length === 0) {
    return products.map((product) => ({ ...product, lowestPrice: null, listingCount: 0 }));
  }

  const listingsResponse = await supabase
    .from("store_listings")
    .select("id, product_id, store_name, raw_title, price, product_url, image_url, updated_at")
    .in("product_id", productIds)
    .order("price", { ascending: true });

  const listings = (listingsResponse.data ?? []) as StoreListingRow[];

  return products.map((product) => {
    const productListings = listings.filter((listing) => listing.product_id === product.id);
    return {
      ...product,
      lowestPrice: productListings[0]?.price ?? null,
      listingCount: productListings.length
    };
  });
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) {
    notFound();
  }

  const products = await getCategoryProducts(category.slug);

  return (
    <section className="container-shell py-14">
      <Link href="/categories" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-deepsea-900 hover:text-lure">
        <ArrowLeft className="h-4 w-4" />
        Kategorilere dön
      </Link>
      <div className="rounded-[2.5rem] bg-deepsea-900 p-8 text-white shadow-soft sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-200">Kategori</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">{category.name}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-cyan-50">{category.description}</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-deepsea-900 group-hover:bg-lure group-hover:text-white">
              <PackageSearch className="h-6 w-6" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{product.brand || "Marka bilgisi bekleniyor"}</p>
            <h2 className="mt-3 line-clamp-2 min-h-14 text-lg font-black text-slate-950">{product.title}</h2>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">En düşük fiyat</p>
                <p className="text-2xl font-black text-deepsea-900">{formatTRY(product.lowestPrice)}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                {product.listingCount} teklif
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
          <PackageSearch className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-2xl font-black text-slate-950">Bu kategoride henüz ürün yok.</h2>
          <p className="mt-2 text-slate-600">Scraper ilk çalıştığında bu alan otomatik dolacaktır.</p>
        </div>
      ) : null}
    </section>
  );
}