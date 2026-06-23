import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-shell py-20">
      <div className="gh-panel mx-auto max-w-2xl p-8 text-center">
      <div className="gh-label mx-auto mb-4">404</div>
      <h1 className="text-3xl font-semibold text-[#24292f]">Aradığınız sayfa bulunamadı.</h1>
      <p className="mt-3 text-sm text-[#57606a]">Bu bağlantı kaldırılmış ya da henüz oluşturulmamış olabilir.</p>
      <Link href="/" className="gh-button gh-button-primary mt-6">
        Ana sayfaya dön
      </Link>
      </div>
    </section>
  );
}