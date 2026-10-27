export default function ProductLoading() {
  return (
    <section className="container-shell py-8" role="status" aria-label="Ürün yükleniyor">
      {/* Breadcrumb */}
      <div className="skeleton h-4 w-28 mb-6" />

      {/* Top grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: image + title */}
        <div className="panel p-6 flex flex-col sm:flex-row gap-6">
          <div className="skeleton shrink-0 w-full sm:w-52 h-52 rounded-lg" />
          <div className="flex flex-col justify-between flex-1 gap-4">
            <div>
              <div className="skeleton h-4 w-40 mb-3" />
              <div className="skeleton h-7 w-full mb-2" />
              <div className="skeleton h-7 w-2/3 mb-3" />
              <div className="skeleton h-4 w-32" />
            </div>
          </div>
        </div>

        {/* Right: best offer CTA */}
        <aside className="panel p-5 flex flex-col justify-between gap-5">
          <div>
            <div className="skeleton h-3 w-28 mb-2" />
            <div className="skeleton h-9 w-36 mb-2" />
            <div className="skeleton h-4 w-24" />
          </div>
          <div className="skeleton h-10 w-full rounded-md" />
        </aside>
      </div>

      {/* Store comparison */}
      <div className="panel mt-6 overflow-hidden">
        <div className="border-b border-[#e8ecf0] bg-[#f6f8fa] px-5 py-4">
          <div className="skeleton h-4 w-56 mb-2" />
          <div className="skeleton h-3 w-40" />
        </div>
        <div className="divide-y divide-[#e8ecf0]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="skeleton h-7 w-7 rounded-full shrink-0" />
              <div className="skeleton h-4 w-32 shrink-0" />
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-6 w-20 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
