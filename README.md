# OltaFiyat

Türkiye’deki online balık avı mağazalarından ürün ve fiyat verisi toplayıp kategorilere göre sınıflandıran, Akakçe tarzı balıkçılık odaklı fiyat karşılaştırma platformu.

Canlı site: [oltafiyat.com](https://oltafiyat.com)

## Ne yapar

Scraper 20+ mağazayı periyodik tarar, ürün adlarını normalize eder, aynı ürünü tek katalog kaydında birleştirir ve fiyatları Supabase PostgreSQL’e yazar. Next.js arayüzü kategorilere göre gezer, marka/model arar ve ürün sayfasında mağaza fiyatlarını düşükten yükseğe listeler.

## Yapı

- `database/`: Supabase PostgreSQL şeması ve kategori seed verisi.
- `scraper/`: GitHub Actions ile çalışan Python scraper.
- `src/`: **Deploy kaynağı** — repo kökünden çalışan Next.js 14 arayüzü.
- `web/`: Aynı frontend’in Vercel `root directory: web` alternatifi. Yeni iş `src/` altına yazılmalı.

## Yerelde çalıştırma

Node 18+ gerekir.

```bash
cp .env.local.template .env.local
# .env.local içine Supabase URL ve anon key yazın
npm install
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000).

`.env.local.template` içindeki değişkenler:

| Değişken | Kim kullanır |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend (okuma) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend (RLS ile public okuma) |
| `SUPABASE_SERVICE_ROLE_KEY` | Scraper / admin yazma |
| `SUPABASE_URL` / `SUPABASE_KEY` | GitHub Actions scraper |

## Veritabanı

Supabase SQL Editor’da `database/schema.sql` dosyasını çalıştırın. Public RLS yalnızca okumaya açıktır; yazma service-role anahtarıyla yapılır.

## Scraper

- `scraper/` klasöründe mağaza adaptörleri ve eşleştirme mantığı durur.
- GitHub Actions 12 saatte bir çalışır; `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` (veya `SUPABASE_KEY`) secret’larını ekleyin.
- İş akışı `workflow_dispatch` ile elle de tetiklenebilir.

## Sıralama ve ana sayfa

- Kategori sayfasında **En Yeni** veritabanı tarihine göre sayfalar; **En Ucuz / En Pahalı** kategorideki tüm ürünlerin en düşük fiyatına göre sıralanır (yalnızca o sayfadaki 24 ürün değil).
- Ana sayfa istatistikleri (`Ürün`, `Fiyat kaydı`) tam sayım sorgularından gelir; öne çıkan ürünler birden fazla mağazada geçen kayıtlardır.

## Deploy

Vercel’de root directory boş bırakılarak repo kökünden deploy edilebilir. Production URL ve `VERCEL_ENV` robots davranışını etkiler.
