import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OltaFiyat | Türkiye Balık Avı Fiyat Karşılaştırma",
    template: "%s | OltaFiyat"
  },
  description: "Türkiye'deki balık avı mağazalarında kamış, makine, sahte yem, misina ve aksesuar fiyatlarını karşılaştırın.",
  metadataBase: new URL("https://oltafiyat.com")
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/categories", label: "Kategoriler" },
  { href: "/search?q=spin", label: "Spin" },
  { href: "/search?q=surf", label: "Surf" },
  { href: "/search?q=lrf", label: "LRF" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        <header className="sticky top-0 z-50 border-b border-[#d0d7de] bg-[#24292f] text-white">
          <div className="container-shell flex min-h-14 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3" aria-label="OltaFiyat ana sayfa">
              <span className="grid h-8 w-8 place-items-center rounded bg-[#0969da] text-sm font-black">OF</span>
              <span className="font-semibold tracking-tight">OltaFiyat</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Ana menü">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="rounded px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link href="/search" className="rounded border border-white/20 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10">
              Ürün ara
            </Link>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-16 border-t border-[#d0d7de] bg-white">
          <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="mb-3 text-base font-semibold text-[#24292f]">OltaFiyat</div>
              <p className="max-w-md text-sm leading-6 text-[#57606a]">
                Balık avı ürünleri için mağaza fiyatlarını izleyen bağımsız karşılaştırma paneli. Fiyatı gör, mağazayı aç, satın almadan önce son stok ve fiyatı kontrol et.
              </p>
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold text-[#24292f]">Hızlı aramalar</h2>
              <div className="grid gap-2 text-sm text-[#57606a]">
                <Link href="/search?q=surf+kamış" className="hover:text-[#0969da]">Surf kamış</Link>
                <Link href="/search?q=spin+makine" className="hover:text-[#0969da]">Spin makine</Link>
                <Link href="/search?q=rapala" className="hover:text-[#0969da]">Rapala</Link>
                <Link href="/search?q=ip+misina" className="hover:text-[#0969da]">İp misina</Link>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold text-[#24292f]">Veri hattı</h2>
              <p className="text-sm leading-6 text-[#57606a]">GitHub Actions scraper → Supabase PostgreSQL → Vercel Next.js arayüzü.</p>
            </div>
          </div>
          <div className="border-t border-[#d0d7de] py-5">
            <div className="container-shell flex flex-col gap-3 text-xs text-[#57606a] md:flex-row md:items-center md:justify-between">
              <span>© {new Date().getFullYear()} OltaFiyat. Tüm hakları saklıdır.</span>
              <span>Balık avı tutkunları için fiyat takip paneli.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}