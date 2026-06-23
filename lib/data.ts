import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { defaultSiteData } from "./default-data";
import { getSupabaseAdmin, hasSupabaseConfig } from "./supabase";
import type { SiteData } from "./types";
import { slugify } from "./utils";

const localDataPath = path.join(process.cwd(), "data", "site-data.json");

function normalizeData(data: SiteData): SiteData {
  return {
    ...defaultSiteData,
    ...data,
    settings: { ...defaultSiteData.settings, ...data.settings },
    footer: { ...defaultSiteData.footer, ...data.footer },
    home: { ...defaultSiteData.home, ...data.home },
    pages: { ...defaultSiteData.pages, ...data.pages },
    navigation: data.navigation?.length ? data.navigation : defaultSiteData.navigation,
    brands: data.brands?.length ? data.brands : defaultSiteData.brands,
    categories: (data.categories?.length ? data.categories : defaultSiteData.categories).map((category, index) => ({ ...category, slug: category.slug || slugify(category.name), order: category.order || index + 1 })),
    products: (data.products?.length ? data.products : defaultSiteData.products).map((product) => ({ ...product, slug: product.slug || slugify(product.name), images: product.images || [] }))
  };
}

export async function getSiteData(): Promise<SiteData> {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase!.from("site_data").select("data").eq("id", "main").single();
    if (!error && data?.data) return normalizeData(data.data as SiteData);
  }

  try {
    const file = await fs.readFile(localDataPath, "utf8");
    return normalizeData(JSON.parse(file) as SiteData);
  } catch {
    return defaultSiteData;
  }
}

export async function saveSiteData(data: SiteData) {
  const normalized = normalizeData(data);

  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase!.from("site_data").upsert({ id: "main", data: normalized, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return normalized;
  }

  await fs.mkdir(path.dirname(localDataPath), { recursive: true });
  await fs.writeFile(localDataPath, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
}

export async function getCategoryBySlug(slug: string) {
  const data = await getSiteData();
  return { data, category: data.categories.find((category) => category.slug === slug) };
}

export async function getProductBySlugs(categorySlug: string, productSlug: string) {
  const { data, category } = await getCategoryBySlug(categorySlug);
  const product = category ? data.products.find((item) => item.categoryId === category.id && item.slug === productSlug) : undefined;
  return { data, category, product };
}