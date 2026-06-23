import { BrandGrid } from "@/components/BrandGrid";
import { ContactCta } from "@/components/ContactCta";
import { SectionHeading } from "@/components/SectionHeading";
import { getSiteData } from "@/lib/data";

export default async function AboutPage() {
  const data = await getSiteData();
  const page = data.pages.about;

  return (
    <>
      <section className="section-pad bg-white">
        <div className="container-padded">
          <SectionHeading eyebrow={page.eyebrow} title={page.title} description={page.description} />
          <div className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-black/10 bg-neutral-50 p-8 text-lg leading-9 text-neutral-700 shadow-sm">
            {page.body}
          </div>
        </div>
      </section>
      <BrandGrid brands={data.brands} shimano={data.pages.shimano} />
      <ContactCta data={data} />
    </>
  );
}