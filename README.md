# OltaFiyat

Türkiye’deki online balık avı mağazalarından ürün ve fiyat verisi toplayıp kategorilere göre sınıflandıran, Akakçe tarzı balıkçılık odaklı fiyat karşılaştırma platformu.

## Yapı

- `database/`: Supabase PostgreSQL şeması ve kategori seed verisi.
- `scraper/`: GitHub Actions ile çalışan Python scraper.
- `src/`: Root’tan deploy edilebilir Next.js 14 arayüzü.
- `web/`: Aynı frontend’in Vercel root-directory alternatifi olarak korunmuş kopyası.

## Deploy

Vercel’de root directory boş bırakılarak repo kökünden deploy edilebilir. Supabase için `database/schema.sql` dosyasını SQL Editor’da çalıştırın.
