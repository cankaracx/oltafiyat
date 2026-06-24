import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-shell py-24">
      <div className="panel mx-auto max-w-lg p-10 text-center">
        <p className="text-5xl mb-5 opacity-30">🎣</p>
        <span className="badge-label mb-4 inline-block">404</span>
        <h1 className="text-2xl font-bold text-[#1c2128]">Sayfa bulunamadı</h1>
        <p className="mt-2 text-sm text-[#57606a]">
          Bu bağlantı kaldırılmış ya da henüz oluşturulmamış olabilir.
        </p>
        <Link href="/" className="btn btn-primary mt-6 inline-flex">
          Ana sayfaya dön
        </Link>
      </div>
    </section>
  );
}
