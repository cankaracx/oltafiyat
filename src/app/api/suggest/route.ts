import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SUGGESTION_LIMIT = 6;
const CANDIDATE_LIMIT = 20;
const MIN_QUERY_LENGTH = 2;

export type SuggestItem = {
  id: number;
  title: string;
  brand: string | null;
  image_url: string | null;
  lowestPrice: number | null;
  listingCount: number;
};

type ListingLite = {
  product_id: number;
  store_name: string;
  price: number;
  image_url: string | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("q") ?? "").trim().replace(/\s+/g, " ");
  const clean = raw.replace(/[%_]/g, "");

  if (clean.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ items: [] });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ items: [] });
  }

  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id, title, brand")
    .or(`title.ilike.%${clean}%,brand.ilike.%${clean}%`)
    .limit(CANDIDATE_LIMIT);

  if (productsError) {
    console.error("GET /api/suggest: products query failed", productsError);
    return NextResponse.json({ items: [] });
  }

  const products = productsData ?? [];
  if (!products.length) {
    return NextResponse.json({ items: [] });
  }

  const lowerQuery = clean.toLowerCase();
  const ranked = [...products]
    .sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
      const bStarts = b.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.title.length - b.title.length;
    })
    .slice(0, SUGGESTION_LIMIT);

  const ids = ranked.map((p) => p.id);
  const { data: listingsData, error: listingsError } = await supabase
    .from("store_listings")
    .select("product_id, store_name, price, image_url")
    .in("product_id", ids)
    .order("price", { ascending: true });

  if (listingsError) {
    console.error("GET /api/suggest: listings query failed", listingsError);
  }

  const listings = (listingsData ?? []) as ListingLite[];

  const items: SuggestItem[] = ranked.map((product) => {
    const productListings = listings.filter((l) => l.product_id === product.id);
    return {
      id: product.id,
      title: product.title,
      brand: product.brand ?? null,
      image_url: productListings.find((l) => l.image_url)?.image_url ?? null,
      lowestPrice: productListings[0]?.price ?? null,
      listingCount: productListings.length
    };
  });

  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } }
  );
}
