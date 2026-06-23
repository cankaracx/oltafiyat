import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories, categoryIconMap } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Kategoriler",
  description: "LRF sahteleri, spin kamışları, ip misinalar ve diğer balık avı kategorilerinde fiyat karşılaştırın."
};

export default function CategoriesPage() {
  return (
    <section className="container-shell py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-deepsea-700">Av kategorileri</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">Balık avı ekipmanlarını kategori kategori keşfedin.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Türkiye’deki mağazalardan toplanan fiyatları, ihtiyacınız olan av stiline göre filtreleyin.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = categoryIconMap[category.iconName];
          return (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-deepsea-900 transition group-hover:bg-deepsea-900 group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </span>
                <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-lure" />
              </div>
              <h2 className="mt-6 text-xl font-black text-slate-950">{category.name}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{category.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}