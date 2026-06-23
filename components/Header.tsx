import Link from "next/link";
import type { SiteData } from "@/lib/types";
import { formatWhatsAppVisible, telUrl, whatsappUrl } from "@/lib/utils";
import { Logo } from "./Logo";

export function Header({ data }: { data: SiteData }) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="container-padded flex min-h-20 items-center justify-between gap-4 py-3">
        <Link href="/" aria-label="Ana sayfa">
          <Logo logoUrl={data.settings.logoUrl} siteName={data.settings.siteName} />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {data.navigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-neutral-700 transition hover:text-gold-700">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={telUrl(data.settings.phone)} className="hidden rounded-full border border-black/10 px-4 py-2 text-sm font-bold text-ink transition hover:border-gold-500 sm:inline-flex">
            Ara
          </a>
          <a href={whatsappUrl(data.settings.whatsapp)} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-gold-700">
            WhatsApp <span className="hidden sm:inline">{formatWhatsAppVisible(data.settings.whatsapp)}</span>
          </a>
        </div>
      </div>
      <div className="container-padded flex gap-4 overflow-x-auto pb-3 lg:hidden">
        {data.navigation.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap text-sm font-semibold text-neutral-700">
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}