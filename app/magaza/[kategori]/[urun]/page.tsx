import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlugs } from "@/lib/data";
import { stockClass, stockLabel, telUrl, whatsappUrl } from "@/lib/utils";

export default async function ProductPage({ params }: { params: { kategori: string; urun: string } }) {
  const { data, category, product } = await getProductBySlugs(params.kategori, params.urun);
  if (!category || !product) return notFound();
  const image = product.images[0] || category.imageUrl || "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=80";
  const message = `Merhaba, ${product.name} ürünü hakkında bilgi almak istiyorum.`;

  return (
    <section className="section-pad bg-white">
      <div className="container-padded">
        <Link href={`/magaza/${category.slug}`} className="text-sm font-black text-gold-700">← {category.name}</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] bg-neutral-100 shadow-premium">
            <Image src={image} alt={product.name} width={1000} height={800} className="h-[560px] w-full object-cover" priority />
          </div>
          <div className="rounded-[2rem] border border-black/10 p-8 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-gold-700">{category.name}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{product.name}</h1>
            <p className="mt-5 text-lg leading-8 text-neutral-600">{product.shortDescription}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-black">{product.price}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${stockClass(product.stockStatus)}`}>{stockLabel(product.stockStatus)}</span>
            </div>
            <p className="mt-8 whitespace-pre-line leading-8 text-neutral-700">{product.description}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <a href={telUrl(data.settings.phone)} className="rounded-full bg-ink px-6 py-4 text-center font-black text-white">Ara</a>
              <a href={whatsappUrl(data.settings.whatsapp, message)} target="_blank" rel="noreferrer" className="rounded-full gold-gradient px-6 py-4 text-center font-black text-ink">WhatsApp ile Sor</a>
            </div>
            <p className="mt-4 text-sm text-neutral-500">Sepet ve online ödeme yoktur. Stok ve satın alma için mağazayla iletişime geçin.</p>
          </div>
        </div>
      </div>
    </section>
  );
}