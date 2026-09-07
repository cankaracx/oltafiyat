import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Search } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const isProduction = process.env.VERCEL_ENV === "production";

const defaultTitle = "OltaFiyat | Türkiye Balık Avı Fiyat Karşılaştırma";
const defaultDescription =
  "Türkiye'deki 16+ balık avı mağazasında kamış, makine, sahte yem, misina ve aksesuar fiyatlarını karşılaştırın.";

export const metadata: Metadata = {
  title: { default: defaultTitle, template: "%s | OltaFiyat" },
  description: defaultDescription,
  metadataBase: new URL("https://oltafiyat.com"),
  robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://oltafiyat.com",
    siteName: "OltaFiyat",
    title: defaultTitle,
    description: defaultDescription
  },
  twitter: { card: "summary", title: defaultTitle, description: defaultDescription }
};

const navLinks = [
  { href: "/categories", label: "Kategoriler" },
  { href: "/search?q=lrf", label: "LRF" },
  { href: "/search?q=spin", label: "Spin" },
  { href: "/search?q=surf", label: "Surf" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={inter.className}>
      <body className="antialiased">

        {/* ── HEADER ── */}
        <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#161b22]">
          <div className="container-shell flex min-h-[56px] items-center gap-3">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0"
              aria-label="OltaFiyat ana sayfa"
            >
              <span className="grid h-8 w-8 place-items-center rounded-md bg-[#0969da] text-[11px] font-black text-white tracking-tight">
                OF
              </span>
              <span className="hidden sm:block text-sm font-semibold text-white">OltaFiyat</span>
            </Link>

            {/* Search bar */}
            <form
              action="/search"
              className="flex flex-1 items-center rounded-md border border-[#30363d] bg-[#0d1117] focus-within:border-[#58a6ff] focus-within:ring-1 focus-within:ring-[#58a6ff]/40 transition-all"
            >
              <label htmlFor="header-search" className="sr-only">Ürün ara</label>
              <Search size={14} className="ml-3 text-[#8b949e] shrink-0" aria-hidden />
              <input
                id="header-search"
                name="q"
                type="search"
                placeholder="Ürün, marka veya kategori ara..."
                className="flex-1 bg-transparent px-2.5 py-2 text-sm text-white placeholder:text-[#8b949e] outline-none"
              />
              <button
                type="submit"
                className="mr-1 rounded px-2.5 py-1 text-xs font-semibold text-[#8b949e] hover:bg-white/10 hover:text-white transition-colors"
              >
                Ara
              </button>
            </form>

            {/* Nav links */}
            <nav className="hidden lg:flex items-center gap-0.5 shrink-0" aria-label="Ana menü">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 text-sm font-medium text-[#8b949e] hover:text-white hover:bg-white/8 rounded-md transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <nav className="container-shell flex gap-1 overflow-x-auto pb-2 lg:hidden" aria-label="Hızlı aramalar">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-md border border-[#30363d] px-3 py-1 text-xs font-medium text-[#8b949e] hover:border-[#58a6ff] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* ── MAIN ── */}
        <main className="min-h-[calc(100vh-56px-200px)]">{children}</main>

        {/* ── FOOTER ── */}
        <footer className="mt-16 border-t border-[#d0d7de] bg-white">
          <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-[#0969da] text-[10px] font-black text-white">OF</span>
                <span className="font-semibold text-[#1c2128]">OltaFiyat</span>
              </div>
              <p className="text-sm leading-6 text-[#57606a]">
                Türkiye balık avı mağazalarının fiyatlarını takip eden bağımsız karşılaştırma platformu.
                En düşük fiyatı bul, mağazaya git, doğrudan satın al.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-[#1c2128]">Kategoriler</h2>
              <div className="grid gap-1.5 text-sm text-[#57606a]">
                {[
                  { href: "/categories/lrf", label: "LRF" },
                  { href: "/categories/spin", label: "Spin" },
                  { href: "/categories/surf", label: "Surf Casting" },
                  { href: "/categories/jigging", label: "Jigging" },
                  { href: "/categories/suni-yemler", label: "Suni Yemler" }
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="hover:text-[#0969da] transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-[#1c2128]">Hızlı Aramalar</h2>
              <div className="grid gap-1.5 text-sm text-[#57606a]">
                {[
                  { href: "/search?q=surf+kam%C4%B1%C5%9F", label: "Surf Kamış" },
                  { href: "/search?q=spin+makine", label: "Spin Makine" },
                  { href: "/search?q=rapala", label: "Rapala" },
                  { href: "/search?q=ip+misina", label: "İp Misina" },
                  { href: "/search?q=jighead", label: "Jighead" }
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="hover:text-[#0969da] transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-[#1c2128]">Hakkında</h2>
              <div className="text-sm leading-6 text-[#57606a]">
                <p>Veri hattı: GitHub Actions scraper → Supabase PostgreSQL → Vercel Next.js</p>
                <p className="mt-2">Fiyatlar yaklaşık 12 saatte bir güncellenir.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#d0d7de] py-5">
            <div className="container-shell flex flex-col gap-2 text-xs text-[#57606a] md:flex-row md:items-center md:justify-between">
              <span>© {new Date().getFullYear()} OltaFiyat. Fiyatlar mağaza sitelerinden otomatik toplanmaktadır.</span>
              <span>Tüm satın alma işlemleri ilgili mağazanın sitesinde gerçekleşir.</span>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
