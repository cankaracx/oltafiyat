# OltaFiyat

Türkiye'deki online balık avı mağazalarından ürün ve fiyat verisi toplayıp kategorilere göre sınıflandıran, Akakçe tarzı balıkçılık odaklı fiyat karşılaştırma platformu.

## Yapı

- `database/`: Supabase PostgreSQL şeması ve kategori seed verisi.
- `scraper/`: GitHub Actions ile çalışan Python scraper (23 mağaza, JSON-LD öncelikli parsing).
- `web/`: Next.js 14 arayüzü — **Vercel bu klasörden deploy ediyor (Root Directory = `web`)**.
- `src/`: `web/src`'in bire bir kopyası. Vercel projesi Root Directory boş ayarlanırsa devreye giren yedek.
  `scripts/check-frontend-sync.sh` ve `.github/workflows/frontend-sync.yml` bu iki klasörün
  birbirinden asla sapmamasını sağlar — biri güncellenip diğeri unutulursa CI kırmızı yanar.

Bu tekrar geçmişte gerçek bug'lara yol açtı (bir düzeltme yalnızca `web/`'e uygulanıp `src/`'e
taşınmadı). Uzun vadede tek klasöre indirilmesi gerekiyor; o güne kadar ikisi de senkron tutuluyor.

## Özellikler

- Ana sayfa: gerçek zamanlı ürün/mağaza/fiyat istatistikleri, en çok karşılaştırılan ürünler.
- Kategori ve arama sayfalarında **marka ve fiyat aralığı filtresi** (mevcut sonuç kümesinden
  türetilir, ekstra sorgu maliyeti çıkarmaz).
- Ürün detayında mağazalar arası fiyat sıralaması, en ucuz teklif rozeti ve tasarruf yüzdesi.
- JSON-LD (`Product`, `WebSite`) yapılandırılmış veri, dinamik sitemap/robots/manifest.

## Deploy

Vercel projesinde **Root Directory `web` olarak ayarlı**. Supabase için `database/schema.sql`
dosyasını SQL Editor'da çalıştırın; şema değişikliği gerekmeyen özellikler doğrudan mevcut
`products` / `store_listings` tablolarını kullanır.

## Geliştirme

```bash
cd web
npm install
npm run dev
```

`web/.env.local` içine `.env.local.template`'teki değişkenleri doldurun.

Bir sayfa/komponent değiştirdiğinizde aynı değişikliği `src/` tarafına da uygulayın (veya
`cp -r web/src/app src/app && cp -r web/src/lib src/lib && cp -r web/src/components src/components`
çalıştırın) ve `./scripts/check-frontend-sync.sh` ile doğrulayın.
