import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    <section className="container-shell py-10">
      <Link href="/categories" className="mb-5 inline-flex text-sm font-semibold text-[#0969da] hover:underline">
        Kategorilere dön
      </Link>
      <div className="gh-panel p-5">
        <div className="gh-label mb-3">Kategori</div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#24292f]">{category.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#57606a]">{category.description}</p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="gh-panel block p-4 hover:border-[#0969da]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#57606a]">{product.brand || "Marka bilgisi bekleniyor"}</p>
            <h2 className="mt-2 line-clamp-2 min-h-12 text-base font-semibold text-[#0969da]">{product.title}</h2>
            <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#d8dee4] pt-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#57606a]">En düşük fiyat</p>
                <p className="text-2xl font-semibold text-[#1a7f37]">{formatTRY(product.lowestPrice)}</p>
              </div>
              <span className="border border-[#d0d7de] bg-[#f6f8fa] px-2 py-1 text-xs font-semibold text-[#57606a]">
                {product.listingCount} teklif
              </span>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-6 gh-panel border-dashed p-8 text-center">
          <h2 className="text-xl font-semibold text-[#24292f]">Bu kategoride henüz ürün yok.</h2>
          <p className="mt-2 text-sm text-[#57606a]">Scraper ilk çalıştığında bu alan otomatik dolacaktır.</p>
        </div>
      ) : null}
    </section>
  );
}