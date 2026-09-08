import type { Metadata } from "next";
import Link from "next/link";
import { mainCategories, categories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Balıkçılık Kategorileri",
  description: "LRF, Spin, Surf, Jigging, Tekne avı malzemeleri, suni yemler ve aksesuarlarda fiyat karşılaştırın."
};

export default function CategoriesPage() {
  return (
    <section className="container-shell py-8">
      <div className="mb-8">
        <span className="badge-label mb-3 inline-block">Kategori Dizini</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1c2128]">Balıkçılık Kategorileri</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#57606a]">
          Ana av stillerine göre filtrele. Spin, LRF, Surf veya Jigging için özelleşmiş kamış,
          makine, yem ve aksesuar kategorilerinden karşılaştır.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {mainCategories.map((main) => {
          const subs = categories.filter((c) => c.parentSlug === main.slug);

          return (
            <div
              key={main.slug}
              className="panel flex flex-col justify-between hover:shadow-md hover:border-[#0969da]/40 transition-all"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#e8ecf0]">
                <Link
                  href={`/categories/${main.slug}`}
                  className="text-lg font-bold text-[#0969da] hover:underline"
                >
                  {main.name}
                </Link>
                <p className="mt-0.5 text-xs text-[#57606a] leading-relaxed">{main.description}</p>
              </div>

              {/* Sub-categories */}
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#57606a] mb-2.5">
                  Alt Kategoriler ({subs.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {subs.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/categories/${main.slug}?sub=${sub.slug}`}
                      className="badge hover:badge-blue transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-4 pb-4">
                <Link
                  href={`/categories/${main.slug}`}
                  className="btn btn-primary w-full justify-center"
                >
                  Tüm {main.name} Ürünleri
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
