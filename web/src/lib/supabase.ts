import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type ProductRow = {
  id: number;
  title: string;
  brand: string | null;
  category_id: number | null;
  slug: string;
  created_at: string;
};

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
};

export type StoreListingRow = {
  id: number;
  product_id: number;
  store_name: string;
  raw_title: string;
  price: number;
  product_url: string;
  image_url: string | null;
  updated_at: string;
};

type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: Omit<CategoryRow, "id">;
        Update: Partial<Omit<CategoryRow, "id">>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: Omit<ProductRow, "id" | "created_at"> & { created_at?: string };
        Update: Partial<Omit<ProductRow, "id">>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      store_listings: {
        Row: StoreListingRow;
        Insert: Omit<StoreListingRow, "id" | "updated_at"> & { updated_at?: string };
        Update: Partial<Omit<StoreListingRow, "id">>;
        Relationships: [
          {
            foreignKeyName: "store_listings_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type SupabaseAppClient = SupabaseClient<Database>;

let cachedClient: SupabaseAppClient | null = null;

export function getSupabaseClient(): SupabaseAppClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return cachedClient;
}