import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Kategoriler",
  description: "LRF sahteleri, spin kamışları, ip misinalar ve diğer balık avı kategorilerinde fiyat karşılaştırın."
};

export default function CategoriesPage() {
  return (
    <section className="container-shell py-10">
      <div className="mb-6 border-b border-[#d0d7de] pb-4">
        <div className="gh-label mb-3">Kategori indexi</div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#24292f]">Balık avı kategorileri</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#57606a]">
          Mağaza menülerine yakın kategori yapısı: kamışlar, makineler, yemler, misinalar ve aksesuarlar ayrı tutulur.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="gh-panel block p-4 hover:border-[#0969da]">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#57606a]">/{category.slug}</div>
            <h2 className="text-base font-semibold text-[#0969da]">{category.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[#57606a]">{category.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}