import Link from "next/link";
import { Fish } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-shell py-20 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-cyan-50 text-deepsea-900">
        <Fish className="h-10 w-10" />
      </div>
      <h1 className="mt-8 text-4xl font-black text-slate-950">Aradığınız sayfa bulunamadı.</h1>
      <p className="mt-4 text-slate-600">Bu bağlantı kaldırılmış ya da henüz oluşturulmamış olabilir.</p>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-deepsea-900 px-6 py-3 font-black text-white hover:bg-deepsea-700">
        Ana sayfaya dön
      </Link>
    </section>
  );
}