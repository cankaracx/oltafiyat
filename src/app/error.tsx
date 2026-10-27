"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[oltafiyat] route error boundary:", error);
  }, [error]);

  return (
    <section className="container-shell py-24">
      <div className="panel mx-auto max-w-lg p-10 text-center">
        <p className="text-5xl mb-5 opacity-30">⚓</p>
        <span className="badge-label mb-4 inline-block">Bir şeyler ters gitti</span>
        <h1 className="text-2xl font-bold text-[#1c2128]">Sayfa yüklenemedi</h1>
        <p className="mt-2 text-sm leading-6 text-[#57606a]">
          Fiyat verisine ulaşırken beklenmeyen bir hata oluştu. Bu genellikle geçicidir —
          tekrar deneyebilir ya da ana sayfaya dönebilirsin.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <button type="button" onClick={reset} className="btn btn-primary">
            Tekrar dene
          </button>
          <Link href="/" className="btn">
            Ana sayfaya dön
          </Link>
        </div>
        {error.digest && (
          <p className="mt-5 text-[11px] text-[#8b949e]">Hata kodu: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
