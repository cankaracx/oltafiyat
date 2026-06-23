# Ahşap Bisiklet Web Sitesi

Antalya Konyaaltı’ndaki **Ahşap Bisiklet** için hazırlanmış Türkçe, mobil uyumlu, premium görünümlü katalog web sitesi ve basit yönetim paneli.

## Özellikler

- Next.js 14 + TypeScript + Tailwind CSS
- Vercel deploy uyumlu
- Supabase Postgres + Storage desteği
- Supabase ayarı yokken local JSON ile geliştirme modu
- Sepet/online ödeme olmadan Shopier tarzı katalog akışı:
  - `/magaza` kategoriler
  - `/magaza/[kategori]` ürün listesi
  - `/magaza/[kategori]/[urun]` ürün detayı, fiyat, stok, Ara / WhatsApp CTA
- Admin paneli:
  - `/admin` şifreli giriş
  - `/admin/dashboard` tüm içerik yönetimi
  - Logo yükleme
  - Telefon, WhatsApp, e-posta, adres, çalışma saatleri
  - Ana sayfa, hakkımızda, hizmetler, iletişim, footer, menü metinleri
  - Shimano yetkili satıcı metinleri
  - Taşınan markalar CRUD + logo yükleme
  - Kategoriler CRUD
  - Ürünler CRUD: kategori, isim, açıklama, fiyat, görseller, stok durumu, öne çıkan

## Kurulum

```bash
npm install
npm run dev
```

PowerShell execution policy `npm` komutunu engellerse Windows’ta şu şekilde çalıştırabilirsiniz:

```bash
npm.cmd install
npm.cmd run dev
```

Site: `http://localhost:3000`

Admin: `http://localhost:3000/admin`

Varsayılan geliştirme şifresi: `admin123`

## Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın:

```bash
copy .env.example .env.local
```

Önerilen değerler:

```env
ADMIN_PASSWORD=guclu-bir-sifre
ADMIN_SESSION_SECRET=uzun-rastgele-bir-secret

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=site-assets
NEXT_PUBLIC_SITE_URL=https://ahsapbisiklet.com
```

Supabase alanları boş bırakılırsa proje `data/site-data.json` dosyasına yazar. Bu dosya ilk admin kaydında otomatik oluşur.

## Supabase kurulumu

1. Supabase projesi oluşturun.
2. SQL Editor içinde `supabase/schema.sql` dosyasını çalıştırın.
3. Storage bölümünde `site-assets` adlı public bucket oluşturun.
4. Vercel ortam değişkenlerine şunları ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET=site-assets`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`

RLS açıktır. Public site sadece okuma yapar. Yazma işlemleri Next.js API route üzerinden service role key ile yapılır.

## Build doğrulama

```bash
npm run build
```

Windows PowerShell kısıtı varsa:

```bash
npm.cmd run build
```

## Vercel deploy

1. Projeyi GitHub’a gönderin.
2. Vercel’de import edin.
3. Ortam değişkenlerini ekleyin.
4. Deploy alın.
5. Domain hazır olduğunda `ahsapbisiklet.com` Vercel project domain ayarlarına bağlanabilir.

## Notlar

- Online ödeme ve sepet bilerek yoktur.
- Ürün fiyatları ve stok durumları admin panelinden düzenlenir.
- WhatsApp butonlarında admin’deki WhatsApp numarası kullanılır.
- Placeholder logo admin’den yüklenen yatay logo ile değiştirilebilir.