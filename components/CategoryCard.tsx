import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

const fallbackImage = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=80";

export function CategoryCard({ category, count }: { category: Category; count: number }) {
  const image = category.imageUrl || fallbackImage;

  return (
    <Link href={`/magaza/${category.slug}`} className="group relative min-h-72 overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-premium">
      <Image src={image} alt={category.name} fill className="object-cover opacity-55 transition duration-500 group-hover:scale-105 group-hover:opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-end">
        <p className="mb-3 text-sm font-black text-gold-300">{count} ürün</p>
        <h3 className="text-2xl font-black">{category.name}</h3>
        <p className="mt-2 text-sm leading-6 text-white/75">{category.description}</p>
      </div>
    </Link>
  );
}