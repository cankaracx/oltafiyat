import { getSupabaseClient } from "./supabase";

/**
 * Cheap, catalog-wide check used to tell "no products exist anywhere yet"
 * (scraper hasn't written any rows) apart from "this specific search/category
 * just has no matches". Only meant to be called after a query already came
 * back empty — a head-only count request, not a full row fetch.
 */
export async function isCatalogEmpty(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return true;

  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("[catalog-status] failed to read product count:", error.message);
    return true;
  }

  return !count;
}
