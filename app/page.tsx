import Image from "next/image";
import Link from "next/link";
import { BrandGrid } from "@/components/BrandGrid";
import { CategoryCard } from "@/components/CategoryCard";
import { ContactCta } from "@/components/ContactCta";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { getSiteData } from "@/lib/data";

export default async function HomePage() {
  const data = await getSiteData();
  const featured = data.products.filter((product) => product.featured).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white dark-grid">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(246,205,85,.28),transparent_35%),linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.6))]" />
        <div className="container-padded relative grid min-h-[720px] items-center gap-10 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-gold-300">{data.home.heroEyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">{data.home.heroTitle}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">{data.home.heroDescription}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/magaza" className="rounded-full gold-gradient px-7 py-4 text-center font-black text-ink">{data.home.primaryCta}</Link>
              <Link href="#bize-ulasin" className="rounded-full border border-white/20 px-7 py-4 text-center font-black text-white hover:bg-white/10">{data.home.secondaryCta}</Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] gold-gradient opacity-40 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-premium backdrop-blur">
              <Image src={data.categories[0]?.imageUrl || "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=80"} alt="Premium bisiklet" width={900} height={720} className="h-[520px] w-full rounded-[1.5rem] object-cover" priority />
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-padded">
          <SectionHeading title={data.home.servicesTitle} description={data.home.servicesDescription} />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {data.pages.services.items.map((item) => (
              <div key={item.title} className="rounded-3xl border border-black/10 p-6 shadow-sm">
                <div className="mb-5 h-2 w-16 rounded-full gold-gradient" />
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-neutral-50">
        <div className="container-padded">
          <SectionHeading title={data.home.featuredTitle} description={data.home.featuredDescription} />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => {
              const category = data.categories.find((item) => item.id === product.categoryId)!;
              return <ProductCard key={product.id} product={product} category={category} />;
            })}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-padded">
          <SectionHeading title={data.home.categoriesTitle} description={data.home.categoriesDescription} />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {data.categories.sort((a, b) => a.order - b.order).map((category) => (
              <CategoryCard key={category.id} category={category} count={data.products.filter((product) => product.categoryId === category.id).length} />
            ))}
          </div>
        </div>
      </section>

      <BrandGrid brands={data.brands} shimano={data.pages.shimano} />
      <ContactCta data={data} />
    </>
  );
}