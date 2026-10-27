export default function CategoryLoading() {
  return (
    <section className="container-shell py-8">
      {/* Breadcrumb */}
      <div className="skeleton h-4 w-28 mb-6" />

      {/* Category header */}
      <div className="panel p-5 mb-6">
        <div className="skeleton h-4 w-28 mb-3" />
        <div className="skeleton h-7 w-64 mb-2" />
        <div className="skeleton h-4 w-full max-w-xl" />
      </div>

      {/* Sub-category tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-7 w-24" />
        ))}
      </div>

      {/* Sort + count bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-7 w-48" />
      </div>

      {/* Product grid */}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        role="status"
        aria-label="Ürünler yükleniyor"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="panel flex flex-col overflow-hidden">
            <div className="skeleton h-40 rounded-none" />
            <div className="flex flex-col flex-1 justify-between p-3.5 gap-3">
              <div className="space-y-1.5">
                <div className="skeleton h-3.5 w-full" />
                <div className="skeleton h-3.5 w-3/5" />
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
