import { SectionHeading } from "@/components/SectionHeading";
import { getSiteData } from "@/lib/data";
import { telUrl, whatsappUrl } from "@/lib/utils";

export default async function ContactPage() {
  const data = await getSiteData();
  const page = data.pages.contact;

  return (
    <section className="section-pad bg-white">
      <div className="container-padded">
        <SectionHeading eyebrow={page.eyebrow} title={page.title} description={page.description} />
        <div className="mt-12 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-[2rem] bg-ink p-8 text-white shadow-premium">
            <h2 className="text-2xl font-black">İletişim Bilgileri</h2>
            <div className="mt-6 space-y-5 text-white/75">
              <p>{data.settings.address}</p>
              <p>{data.settings.hours}<br />{data.settings.closedText}</p>
              <a className="block font-black text-white" href={telUrl(data.settings.phone)}>{data.settings.phone}</a>
              <a className="block font-black text-gold-300" href={whatsappUrl(data.settings.whatsapp)} target="_blank" rel="noreferrer">WhatsApp: {data.settings.whatsapp}</a>
              <a className="block text-white" href={`mailto:${data.settings.email}`}>{data.settings.email}</a>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-black/10 shadow-premium">
            <iframe src={data.settings.mapEmbedUrl} title="Ahşap Bisiklet harita" className="h-[520px] w-full" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}