export default function SearchLoading() {
  return (
    <section className="container-shell py-8">
      {/* Search bar shell — static, matches the real form so it doesn't visibly "pop in" */}
      <div className="panel p-5 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="input flex-1 h-[38px]" aria-hidden />
          <div className="btn btn-primary px-7 opacity-60" aria-hidden>
            Ara
          </div>
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-7 w-56" />
      </div>

      {/* Result cards */}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        role="status"
        aria-label="Sonuçlar yükleniyor"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="panel flex flex-col overflow-hidden">
            <div className="skeleton h-40 rounded-none" />
            <div className="flex flex-col flex-1 justify-between p-3.5 gap-3">
              <div className="space-y-1.5">
                <div className="skeleton h-3.5 w-full" />
                <div className="skeleton h-3.5 w-4/5" />
              </div>
              <div className="flex items-end justify-between border-t border-[#e8ecf0] pt-3">
                <div className="space-y-1.5">
                  <div className="skeleton h-2.5 w-16" />
                  <div className="skeleton h-6 w-20" />
                </div>
                <div className="skeleton h-3 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
