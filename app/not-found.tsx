import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-pad bg-white">
      <div className="container-padded text-center">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-gold-700">404</p>
        <h1 className="mt-4 text-5xl font-black">Sayfa bulunamadı</h1>
        <p className="mt-4 text-neutral-600">Aradığınız içerik kaldırılmış veya adres değişmiş olabilir.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 font-black text-white">Ana sayfaya dön</Link>
      </div>
    </section>
  );
}