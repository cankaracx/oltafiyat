import type { MetadataRoute } from "next";
import { getSupabaseClient } from "@/lib/supabase";
import { mainCategories } from "@/lib/categories";
import { slugify } from "@/lib/slug";

const BASE_URL = "https://oltafiyat.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/magazalar`, lastModified: now, changeFrequency: "weekly", priority: 0.6 }
  ];

  const categoryRoutes: MetadataRoute.Sitemap = mainCategories.map((c) => ({
    url: `${BASE_URL}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7
  }));

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [...staticRoutes, ...categoryRoutes];
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, created_at")
    .order("created_at", { ascending: false })
    .limit(50000);

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "daily" as const,
    priority: 0.6
  }));

  const { data: storeRows } = await supabase.from("store_listings").select("store_name");
  const storeNames = new Set((storeRows ?? []).map((r) => r.store_name));
  const storeRoutes: MetadataRoute.Sitemap = Array.from(storeNames).map((name) => ({
    url: `${BASE_URL}/magazalar/${slugify(name)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.5
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...storeRoutes];
}
