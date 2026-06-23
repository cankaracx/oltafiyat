import Link from "next/link";
import type { SiteData } from "@/lib/types";
import { telUrl, whatsappUrl } from "@/lib/utils";
import { Logo } from "./Logo";

export function Footer({ data }: { data: SiteData }) {
  return (
    <footer className="bg-ink text-white">
      <div className="container-padded grid gap-10 py-12 md:grid-cols-[1.2fr_.8fr_.8fr]">
        <div>
          <div className="rounded-2xl bg-white p-4 inline-block">
            <Logo logoUrl={data.settings.logoUrl} siteName={data.settings.siteName} />
          </div>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">{data.footer.tagline}</p>
        </div>
        <div>
          <h3 className="font-bold text-gold-300">Menü</h3>
          <div className="mt-4 grid gap-2">
            {data.navigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-white/70 hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gold-300">İletişim</h3>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <p>{data.settings.address}</p>
            <p>{data.settings.hours}</p>
            <p>{data.settings.closedText}</p>
            <a className="block text-white" href={telUrl(data.settings.phone)}>{data.settings.phone}</a>
            <a className="block text-white" href={whatsappUrl(data.settings.whatsapp)} target="_blank" rel="noreferrer">WhatsApp: {data.settings.whatsapp}</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">{data.footer.copyright}</div>
    </footer>
  );
}