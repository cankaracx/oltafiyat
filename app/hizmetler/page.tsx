import { ContactCta } from "@/components/ContactCta";
import { SectionHeading } from "@/components/SectionHeading";
import { getSiteData } from "@/lib/data";

export default async function ServicesPage() {
  const data = await getSiteData();
  const page = data.pages.services;

  return (
    <>
      <section className="section-pad bg-white">
        <div className="container-padded">
          <SectionHeading eyebrow={page.eyebrow} title={page.title} description={page.description} />
          <p className="mx-auto mt-8 max-w-3xl text-center leading-8 text-neutral-700">{page.body}</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {page.items.map((item) => (
              <div key={item.title} className="rounded-3xl border border-black/10 bg-neutral-50 p-8">
                <h2 className="text-2xl font-black">{item.title}</h2>
                <p className="mt-3 leading-7 text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ContactCta data={data} />
    </>
  );
}