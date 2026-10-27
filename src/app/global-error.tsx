"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[oltafiyat] global error boundary:", error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="antialiased">
        <section className="container-shell py-24">
          <div className="panel mx-auto max-w-lg p-10 text-center">
            <p className="text-5xl mb-5 opacity-30">⚓</p>
            <span className="badge-label mb-4 inline-block">Site şu an açılamıyor</span>
            <h1 className="text-2xl font-bold text-[#1c2128]">Beklenmeyen bir hata oluştu</h1>
            <p className="mt-2 text-sm leading-6 text-[#57606a]">
              OltaFiyat yüklenirken bir sorun çıktı. Bu genellikle geçicidir — sayfayı
              yeniden yüklemeyi dene.
            </p>
            <div className="mt-6 flex justify-center">
              <button type="button" onClick={reset} className="btn btn-primary">
                Tekrar dene
              </button>
            </div>
            {error.digest && (
              <p className="mt-5 text-[11px] text-[#8b949e]">Hata kodu: {error.digest}</p>
            )}
          </div>
        </section>
      </body>
    </html>
  );
}
