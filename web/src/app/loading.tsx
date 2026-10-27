import { mainCategories } from "@/lib/categories";

export default function HomeLoading() {
  const quickCategories = mainCategories.slice(0, 8);

  return (
    <div>
      {/* ── HERO (static copy — no data dependency, so it renders immediately) ── */}
      <section className="border-b border-[#d0d7de] bg-white">
        <div className="container-shell py-14">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge mb-5">Türkiye Balık Avı Fiyat İndeksi</span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#1c2128] sm:text-5xl leading-tight">
              En düşük balıkçılık fiyatlarını<br className="hidden sm:block" /> tek panelde bul.
            </h1>
            <p className="mt-5 text-base leading-7 text-[#57606a] max-w-xl mx-auto">
              OltaFiyat; kamış, makine, sahte yem, misina ve aksesuar fiyatlarını 16+ Türk mağazasından
              toplar, karşılaştırır ve en ucuz teklifi gösterir.
            </p>

            <form action="/search" className="mt-8 flex gap-2 max-w-lg mx-auto">
              <label htmlFor="hero-search" className="sr-only">Ürün ara</label>
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder="Ürün, marka veya model ara…"
                className="input flex-1 text-[15px] py-3"
              />
              <button type="submit" className="btn btn-primary px-6 py-3 text-[15px]">
                Ara
              </button>
            </form>
          </div>

          {/* Stats — depend on live counts, so skeleton until resolved */}
          <div className="mt-10 flex flex-wrap justify-center gap-6" role="status" aria-label="İstatistikler yükleniyor">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center px-5">
                <div className="skeleton h-7 w-14 mx-auto mb-1.5" />
                <div className="skeleton h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES (static list — no data dependency) ── */}
      <section className="container-shell py-10">
        <div className="section-header">
          <h2 className="text-lg font-bold text-[#1c2128]">Kategoriler</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {quickCategories.map((cat) => (
            <div
              key={cat.slug}
              className="panel-flat flex items-center justify-center p-3 text-center min-h-[52px]"
            >
              <span className="text-xs font-semibold text-[#1c2128] leading-tight">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED — depends on live listings, so skeleton until resolved ── */}
      <section className="container-shell pb-14">
        <div className="section-header">
          <h2 className="text-lg font-bold text-[#1c2128]">En Çok Karşılaştırılan Ürünler</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Ürünler yükleniyor">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="panel flex flex-col overflow-hidden">
              <div className="skeleton h-44 rounded-none" />
              <div className="flex flex-col flex-1 justify-between p-4 gap-3">
                <div className="space-y-1.5">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-3/5" />
                </div>
                <div className="flex items-end justify-between border-t border-[#e8ecf0] pt-3">
                  <div className="space-y-1.5">
                    <div className="skeleton h-2.5 w-20" />
                    <div className="skeleton h-6 w-24" />
                  </div>
                  <div className="skeleton h-3 w-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
