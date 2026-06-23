import type { SiteData } from "@/lib/types";
import { telUrl, whatsappUrl } from "@/lib/utils";

export function ContactCta({ data }: { data: SiteData }) {
  return (
    <section id="bize-ulasin" className="section-pad bg-white">
      <div className="container-padded">
        <div className="overflow-hidden rounded-[2rem] bg-ink p-8 text-white shadow-premium md:p-12 dark-grid">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-gold-300">Bize Ulaşın</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{data.home.contactTitle}</h2>
              <p className="mt-4 max-w-2xl text-white/70">{data.home.contactDescription}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a href={telUrl(data.settings.phone)} className="rounded-full bg-white px-6 py-4 text-center font-black text-ink">Ara: {data.settings.phone}</a>
              <a href={whatsappUrl(data.settings.whatsapp)} target="_blank" rel="noreferrer" className="rounded-full gold-gradient px-6 py-4 text-center font-black text-ink">WhatsApp: {data.settings.whatsapp}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}