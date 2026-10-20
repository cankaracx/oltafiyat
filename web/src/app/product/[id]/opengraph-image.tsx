import { ImageResponse } from "next/og";
import { DefaultOgContent, ProductOgContent, OG_SIZE, type ProductOgListing } from "@/lib/og-assets";
import { getSupabaseClient } from "@/lib/supabase";

export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 43200;

type ProductOgData = {
  title: string;
  brand: string | null;
  listings: ProductOgListing[];
  totalStoreCount: number;
};

async function getProductOgData(id: string): Promise<ProductOgData | null> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: product } = await supabase
    .from("products")
    .select("title, brand")
    .eq("id", numericId)
    .single();
  if (!product) return null;

  const { data: rawListings } = await supabase
    .from("store_listings")
    .select("store_name, product_url, price")
    .eq("product_id", numericId)
    .order("price", { ascending: true });

  const allListings = rawListings ?? [];

  // Mirror the product page's filtering: drop category/listing-page URLs.
  const productListings = allListings.filter((l) => {
    try {
      return new URL(l.product_url).pathname.split("/").filter(Boolean).length >= 2;
    } catch {
      return true;
    }
  });

  const seen = new Set<string>();
  const listings: ProductOgListing[] = [];
  for (const l of productListings) {
    if (seen.has(l.store_name)) continue;
    seen.add(l.store_name);
    listings.push({ storeName: l.store_name, price: l.price });
  }

  return { title: product.title, brand: product.brand ?? null, listings, totalStoreCount: listings.length };
}

export default async function Image({ params }: { params: { id: string } }) {
  const data = await getProductOgData(params.id);

  if (!data) {
    return new ImageResponse(<DefaultOgContent />, { ...size });
  }

  return new ImageResponse(
    <ProductOgContent
      title={data.title}
      brand={data.brand}
      listings={data.listings}
      totalStoreCount={data.totalStoreCount}
    />,
    { ...size }
  );
}
