create extension if not exists pg_trgm;

create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique
);

create table if not exists public.products (
  id bigint generated always as identity primary key,
  title text not null,
  brand text,
  category_id bigint references public.categories(id) on delete set null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.store_listings (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  store_name text not null,
  raw_title text not null,
  price numeric(12, 2) not null check (price >= 0),
  product_url text not null,
  image_url text,
  updated_at timestamptz not null default now(),
  constraint store_listings_unique_store_url unique (store_name, product_url)
);

insert into public.categories (name, slug) values
  ('LRF Sahteleri', 'lrf-sahteleri'),
  ('LRF Kamışları', 'lrf-kamislari'),
  ('LRF Makineleri', 'lrf-makineleri'),
  ('Ultra Light / Ajing Ekipmanları', 'ultra-light-ajing-ekipmanlari'),
  ('Spin Kamışları', 'spin-kamislari'),
  ('Spin Makineleri', 'spin-makineleri'),
  ('Surf Kamışları', 'surf-kamislari'),
  ('Surf Makineleri', 'surf-makineleri'),
  ('Tekne Kamışları', 'tekne-kamislari'),
  ('Tekne Makineleri', 'tekne-makineleri'),
  ('Jigging Kamışları', 'jigging-kamislari'),
  ('Jigging Makineleri', 'jigging-makineleri'),
  ('Trolling Ekipmanları', 'trolling-ekipmanlari'),
  ('Olta Makineleri Genel', 'olta-makineleri-genel'),
  ('Maket Balıklar / Sahte Yemler', 'maket-baliklar-sahte-yemler'),
  ('Silikon Yemler', 'silikon-yemler'),
  ('Jig Yemler / Metal Jigler', 'jig-yemler-metal-jigler'),
  ('Shore Jigging Kaşıkları', 'shore-jigging-kasiklari'),
  ('Kaşıklar', 'kasiklar'),
  ('Spinner Yemler', 'spinner-yemler'),
  ('LRF Takımları', 'lrf-takimlari'),
  ('Hazır Olta Takımları', 'hazir-olta-takimlari'),
  ('Monofilament Misinalar', 'monofilament-misinalar'),
  ('Fluorocarbon Misinalar', 'fluorocarbon-misinalar'),
  ('İp Misinalar', 'ip-misinalar'),
  ('Kurşun Arkası Sahteleri', 'kursun-arkasi-sahteleri'),
  ('Gece Avı Sahteleri', 'gece-avi-sahteleri'),
  ('İğneler', 'igneler'),
  ('Klipsler ve Fırdöndüler', 'klipsler-ve-firdonduler'),
  ('Kurşunlar ve Şamandıralar', 'kursunlar-ve-samandiralar'),
  ('Kamış Ayakları', 'kamis-ayaklari'),
  ('Balıkçı Çantaları', 'balikci-cantalari'),
  ('Takım Kutuları', 'takim-kutulari'),
  ('Jig Kafaları (Jighead)', 'jig-kafalari-jighead'),
  ('Rapala Klipsleri', 'rapala-klipsleri'),
  ('Kepçeler ve Balık Tutucular', 'kepceler-ve-balik-tutucular'),
  ('Balıkçı Giyim', 'balikci-giyim'),
  ('Elektronik ve Aksesuarlar', 'elektronik-ve-aksesuarlar'),
  ('Bakım ve Yedek Parçalar', 'bakim-ve-yedek-parcalar')
on conflict (slug) do update set name = excluded.name;

create index if not exists products_title_fts_idx
  on public.products using gin (to_tsvector('simple', coalesce(title, '')));

create index if not exists products_brand_fts_idx
  on public.products using gin (to_tsvector('simple', coalesce(brand, '')));

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists store_listings_product_id_idx on public.store_listings(product_id);
create index if not exists store_listings_price_idx on public.store_listings(price);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.store_listings enable row level security;

drop policy if exists "Public categories are readable" on public.categories;
create policy "Public categories are readable"
  on public.categories for select
  using (true);

drop policy if exists "Public products are readable" on public.products;
create policy "Public products are readable"
  on public.products for select
  using (true);

drop policy if exists "Public listings are readable" on public.store_listings;
create policy "Public listings are readable"
  on public.store_listings for select
  using (true);