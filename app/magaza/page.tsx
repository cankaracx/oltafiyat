import { CategoryCard } from "@/components/CategoryCard";
import { SectionHeading } from "@/components/SectionHeading";
import { getSiteData } from "@/lib/data";

export default async function ShopPage() {
  const data = await getSiteData();

  return (
    <section className="section-pad bg-white">
      <div className="container-padded">
        <SectionHeading eyebrow={data.pages.shop.eyebrow} title={data.pages.shop.title} description={data.pages.shop.description} />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {data.categories.sort((a, b) => a.order - b.order).map((category) => (
            <CategoryCard key={category.id} category={category} count={data.products.filter((product) => product.categoryId === category.id).length} />
          ))}
        </div>
      </div>
    </section>
  );
}