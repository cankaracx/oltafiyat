import type { Metadata } from "next";
import Link from "next/link";
import { Anchor, Fish, Github, Search, Waves } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OltaFiyat | Balık Avı Ürünlerinde Fiyat Karşılaştırma",
    template: "%s | OltaFiyat"
  },
  description: "Türkiye'deki balık avı mağazalarında LRF, spin, rapala, jighead ve balıkçı ekipmanları için fiyat karşılaştırma platformu.",
  metadataBase: new URL("https://oltafiyat.com")
};

const navItems = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/categories", label: "Kategoriler" },
  { href: "/search?q=lrf", label: "LRF Ara" },
  { href: "/search?q=rapala", label: "Rapala Ara" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        <header className="sticky top-0 z-50 border-b border-cyan-900/10 bg-white/85 backdrop-blur-xl">
          <div className="container-shell flex min-h-20 items-center justify-between gap-4 py-3">
            <Link href="/" className="group flex items-center gap-3" aria-label="OltaFiyat ana sayfa">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-deepsea-900 text-white shadow-soft transition group-hover:rotate-3">
                <Fish className="h-7 w-7" />
              </span>
              <span>
                <span className="block text-xl font-black tracking-tight text-slate-950">OltaFiyat</span>
                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-deepsea-700">Türkiye av pazarı</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm md:flex" aria-label="Ana menü">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-deepsea-900">
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-lure px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600">
              <Search className="h-4 w-4" />
              Fiyat Bul
            </Link>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-20 border-t border-cyan-900/10 bg-slate-950 text-slate-200">
          <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-200">
                  <Waves className="h-6 w-6" />
                </span>
                <span className="text-2xl font-black text-white">OltaFiyat</span>
              </div>
              <p className="max-w-md text-sm leading-7 text-slate-400">
                OltaFiyat, Türkiye’deki balık avı mağazalarından fiyat verilerini toplayarak aynı ürünü en uygun nereden alabileceğinizi göstermeyi hedefleyen bağımsız bir karşılaştırma sitesidir.
              </p>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">Hızlı Bağlantılar</h2>
              <div className="grid gap-3 text-sm">
                <Link href="/categories" className="hover:text-white">Kategoriler</Link>
                <Link href="/search?q=spin+kamış" className="hover:text-white">Spin Kamışı Fiyatları</Link>
                <Link href="/search?q=jighead" className="hover:text-white">Jighead Fiyatları</Link>
                <Link href="/search?q=ip+misina" className="hover:text-white">İp Misina Fiyatları</Link>
              </div>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">Veri Notu</h2>
              <p className="text-sm leading-7 text-slate-400">
                Fiyatlar mağaza sayfalarından periyodik olarak güncellenir. Satın almadan önce mağazadaki son fiyat ve stok bilgisini mutlaka kontrol edin.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-slate-300">
                <Anchor className="h-4 w-4" />
                GitHub Actions + Supabase + Vercel
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 py-5">
            <div className="container-shell flex flex-col gap-3 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
              <span>© {new Date().getFullYear()} OltaFiyat. Tüm hakları saklıdır.</span>
              <span className="inline-flex items-center gap-2"><Github className="h-4 w-4" /> Balık avı tutkunları için geliştirildi.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}