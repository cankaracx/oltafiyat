import type { Metadata } from "next";
import Link from "next/link";
import { mainCategories, categories, categoryIconMap } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Balıkçılık Kategorileri",
  description: "LRF, Spin, Surf, Jigging, Tekne avı malzemeleri, suni yemler ve aksesuarlarda fiyat karşılaştırın."
};

export default function CategoriesPage() {
  return (
    <section className="container-shell py-10">
      <div className="mb-8 border-b border-[#d0d7de] pb-5">
        <div className="gh-label mb-3">Kategori Dizini</div>
        <h1 className="text-4xl font-semibold tracking-tight text-[#24292f]">Balıkçılık Kategorileri</h1>
        <p className="mt-2 max-w-3xl text-base leading-6 text-[#57606a]">
          Aradığınız balık avı ekipmanlarını ana kategorilere göre filtreleyip kıyaslayın. Spin, LRF, Surf veya Jigging gibi özel av stillerine uygun alt kategoriler sizi bekliyor.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {mainCategories.map((mainCategory) => {
          // Find subcategories belonging to this main category
          const subCats = categories.filter((c) => c.parentSlug === mainCategory.slug);
          const IconComponent = categoryIconMap[mainCategory.iconName as keyof typeof categoryIconMap] || categoryIconMap.Search;

          return (
            <div key={mainCategory.slug} className="gh-panel p-6 flex flex-col justify-between hover:border-[#0969da] transition-colors duration-200">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#f0f3f6] p-2.5 rounded-md border border-[#d0d7de]">
                    <IconComponent className="h-6 w-6 text-[#24292f]" />
                  </div>
                  <div>
                    <Link href={`/categories/${mainCategory.slug}`} className="text-xl font-semibold text-[#0969da] hover:underline">
                      {mainCategory.name}
                    </Link>
                    <p className="text-xs text-[#57606a] mt-0.5">{subCats.length} Alt Kategori</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[#57606a] mb-5">{mainCategory.description}</p>
              </div>

              <div>
                <div className="border-t border-[#d8dee4] pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#24292f] mb-2">Alt Kategoriler:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {subCats.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/categories/${mainCategory.slug}?sub=${sub.slug}`}
                        className="inline-flex items-center rounded-full border border-[#d0d7de] bg-[#f6f8fa] px-2.5 py-0.5 text-xs font-medium text-[#57606a] hover:bg-[#f3f4f6] hover:text-[#0969da] transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="mt-5 text-right">
                  <Link
                    href={`/categories/${mainCategory.slug}`}
                    className="gh-button gh-button-primary inline-flex items-center gap-1 text-sm font-semibold"
                  >
                    Tüm {mainCategory.name} Ürünlerini Gör &rarr;
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
