import Link from "next/link";
import { formatTRY } from "@/lib/format";

const featuredDrops = [
  {
    title: "Savage Gear Sandeel V2 12.5 cm",
    category: "LRF Sahteleri",
    store: "Olta Mühendisi",
    oldPrice: 410,
    newPrice: 329.9,
    href: "/search?q=Savage+Gear+Sandeel"
  },
  {
    title: "Rapala X-Rap Saltwater 10 cm",
    category: "Maket Balıklar",
    store: "Avmar",
    oldPrice: 720,
    newPrice: 619.5,
    href: "/search?q=Rapala+X-Rap"
  },
  {
    title: "Daiwa J-Braid 8X 150 m",
    category: "İp Misinalar",
    store: "Spot Balık",
    oldPrice: 890,
    newPrice: 769,
    href: "/search?q=Daiwa+J-Braid"
  }
];

const stats = [
  { label: "Hedef mağaza", value: "16+" },
  { label: "Kategori", value: "39" },
  { label: "Güncelleme", value: "12 saat" }
];

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-[#d0d7de] bg-white">
        <div className="container-shell py-12">
          <div className="mb-4 inline-flex border border-[#d0d7de] bg-[#f6f8fa] px-2 py-1 text-xs font-semibold text-[#57606a]">
            Türkiye balık avı fiyat indexi
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-[#24292f] sm:text-6xl">
              Kamış, makine, yem ve aksesuar fiyatlarını tek panelde karşılaştır.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#57606a]">
              OltaFiyat; LRF, spin, surf, jigging ve tekne avı ürünlerini Türk balık avı mağazalarından takip eder. En düşük fiyatı ve mağaza linkini hızlıca gösterir.
            </p>

            <form action="/search" className="mt-8 gh-panel p-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="home-search" className="sr-only">Ürün ara</label>
                <input id="home-search" name="q" type="search" placeholder="Örn: surf kamış, spin makine, rapala, jighead" className="gh-input" />
                <button type="submit" className="gh-button gh-button-primary whitespace-nowrap">
                  Fiyatları Bul
                </button>
              </div>
            </form>
          </div>

          <div className="gh-panel overflow-hidden">
            <div className="border-b border-[#d0d7de] bg-[#f6f8fa] px-4 py-3 text-sm font-semibold">Canlı veri hattı</div>
            <div className="divide-y divide-[#d8dee4]">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between px-4 py-4">
                  <span className="text-sm text-[#57606a]">{stat.label}</span>
                  <span className="font-semibold text-[#24292f]">{stat.value}</span>
                  </div>
              ))}
            </div>
            <div className="border-t border-[#d0d7de] bg-[#f6f8fa] px-4 py-3 text-xs text-[#57606a]">Scraper ürünleri master kayıt altında birleştirir ve fiyatları düşükten yükseğe sıralar.</div>
          </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-10">
        <div className="mb-4 flex items-center justify-between border-b border-[#d0d7de] pb-3">
          <h2 className="text-xl font-semibold text-[#24292f]">Öne çıkan fiyat düşüşleri</h2>
          <Link href="/categories" className="text-sm font-semibold text-[#0969da] hover:underline">
            Tüm kategorilere bak
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredDrops.map((item) => (
            <Link key={item.title} href={item.href} className="gh-panel block p-4 hover:border-[#0969da]">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#57606a]">{item.category}</div>
              <h3 className="min-h-12 text-base font-semibold text-[#0969da]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#57606a]">En düşük mağaza: {item.store}</p>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <div className="text-sm text-[#57606a] line-through">{formatTRY(item.oldPrice)}</div>
                  <div className="text-2xl font-semibold text-[#1a7f37]">{formatTRY(item.newPrice)}</div>
                </div>
                <span className="border border-[#a40e26]/20 bg-[#ffebe9] px-2 py-1 text-xs font-semibold text-[#cf222e]">-%{Math.round(((item.oldPrice - item.newPrice) / item.oldPrice) * 100)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}