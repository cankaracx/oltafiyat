import Image from "next/image";
import Link from "next/link";
import type { Category, Product } from "@/lib/types";
import { stockClass, stockLabel } from "@/lib/utils";

const fallbackImage = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=80";

export function ProductCard({ product, category }: { product: Product; category: Category }) {
  const image = product.images[0] || category.imageUrl || fallbackImage;

  return (
    <Link href={`/magaza/${category.slug}/${product.slug}`} className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-premium">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <Image src={image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-black ring-1 ${stockClass(product.stockStatus)}`}>{stockLabel(product.stockStatus)}</span>
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">{category.name}</p>
        <h3 className="mt-2 text-xl font-black text-ink">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{product.shortDescription}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-lg font-black text-ink">{product.price}</span>
          <span className="text-sm font-bold text-gold-700">Detay →</span>
        </div>
      </div>
    </Link>
  );
}