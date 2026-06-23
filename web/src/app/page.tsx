import Link from "next/link";
import { ArrowRight, BadgePercent, Fish, Search, ShieldCheck, TrendingDown, Waves } from "lucide-react";
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
  { label: "Hedef mağaza", value: "8+" },
  { label: "Av kategorisi", value: "12" },
  { label: "Güncelleme", value: "12 saatte" }
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-x-0 top-10 -z-10 mx-auto h-80 max-w-5xl rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-sm font-bold text-deepsea-900 shadow-sm">
              <Waves className="h-4 w-4" />
              Türkiye’nin balık avı fiyat radarı
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-7xl">
              Aynı olta ürünü için daha fazla ödeme yapmayın.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              OltaFiyat; LRF sahteleri, spin kamışları, jighead, rapala ve ip misina gibi ürünleri Türk balık avı mağazalarından takip eder, size en düşük fiyatı tek ekranda gösterir.
            </p>

            <form action="/search" className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="home-search" className="sr-only">Ürün ara</label>
                <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:ring-2 focus-within:ring-cyan-500">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    id="home-search"
                    name="q"
                    type="search"
                    placeholder="Örn: Daiwa J-Braid, jighead 3 gr, rapala"
                    className="w-full bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-deepsea-900 px-6 py-4 font-black text-white transition hover:bg-deepsea-700">
                  Fiyatları Bul
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white bg-white/75 p-4 text-center shadow-sm">
                  <div className="text-2xl font-black text-deepsea-900">{stat.value}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white bg-white/70 p-6 shadow-soft backdrop-blur">
            <div className="rounded-[2rem] bg-gradient-to-br from-deepsea-900 via-cyan-800 to-teal-600 p-6 text-white">
              <div className="mb-10 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-bold">
                  <Fish className="h-4 w-4" />
                  Canlı fiyat takibi
                </div>
                <ShieldCheck className="h-7 w-7 text-cyan-100" />
              </div>
              <h2 className="text-3xl font-black">Mağazaları tek tek gezmeden karşılaştırın.</h2>
              <p className="mt-4 text-sm leading-7 text-cyan-50">
                Scraper motoru ürün adlarını normalleştirir, benzer kayıtları tek master ürün altında toplar ve mağaza fiyatlarını düşükten yükseğe sıralar.
              </p>
              <div className="mt-8 space-y-3">
                {["Olta Mühendisi", "Sihirli Olta", "Avmar", "Spot Balık"].map((store, index) => (
                  <div key={store} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                    <span className="font-semibold">{store}</span>
                    <span className="text-sm text-cyan-100">#{index + 1} tarandı</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
              <TrendingDown className="h-4 w-4" />
              Featured Price Drops
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Öne çıkan fiyat düşüşleri</h2>
          </div>
          <Link href="/categories" className="inline-flex items-center gap-2 font-bold text-deepsea-900 hover:text-lure">
            Tüm kategorilere bak
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {featuredDrops.map((item) => (
            <Link key={item.title} href={item.href} className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-deepsea-900 group-hover:bg-lure group-hover:text-white">
                <BadgePercent className="h-7 w-7" />
              </div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{item.category}</div>
              <h3 className="mt-3 min-h-16 text-xl font-black text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">En düşük mağaza: {item.store}</p>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-400 line-through">{formatTRY(item.oldPrice)}</div>
                  <div className="text-2xl font-black text-deepsea-900">{formatTRY(item.newPrice)}</div>
                </div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-700">%{Math.round(((item.oldPrice - item.newPrice) / item.oldPrice) * 100)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}