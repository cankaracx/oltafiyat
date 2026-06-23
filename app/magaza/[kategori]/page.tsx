import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { getCategoryBySlug } from "@/lib/data";

export default async function CategoryPage({ params }: { params: { kategori: string } }) {
  const { data, category } = await getCategoryBySlug(params.kategori);
  if (!category) return notFound();
  const products = data.products.filter((product) => product.categoryId === category.id);

  return (
    <section className="section-pad bg-white">
      <div className="container-padded">
        <Link href="/magaza" className="text-sm font-black text-gold-700">← Tüm kategoriler</Link>
        <div className="mt-8">
          <SectionHeading eyebrow="Kategori" title={category.name} description={category.description} />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => <ProductCard key={product.id} product={product} category={category} />)}
        </div>
        {!products.length ? <p className="mt-10 rounded-2xl bg-neutral-50 p-8 text-center text-neutral-600">Bu kategoride henüz ürün yok.</p> : null}
      </div>
    </section>
  );
}