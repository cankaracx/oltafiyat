import Image from "next/image";
import type { Brand, TextPage } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";

export function BrandGrid({ brands, shimano }: { brands: Brand[]; shimano: TextPage }) {
  return (
    <section className="section-pad bg-neutral-50">
      <div className="container-padded">
        <SectionHeading eyebrow={shimano.eyebrow} title={shimano.title} description={shimano.description} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand) => (
            <div key={brand.id} className="rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-full items-center justify-center rounded-2xl bg-neutral-50">
                {brand.logoUrl ? <Image src={brand.logoUrl} alt={brand.name} width={160} height={72} className="max-h-16 w-auto object-contain" /> : <span className="text-2xl font-black text-ink">{brand.name}</span>}
              </div>
              <p className="mt-4 font-black text-ink">{brand.name}</p>
              <p className="mt-1 text-sm text-neutral-600">{brand.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}