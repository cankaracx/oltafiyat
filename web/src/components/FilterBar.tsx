import Link from "next/link";

type FilterBarProps = {
  action: string;
  hidden: Record<string, string | undefined>;
  brands: string[];
  selectedBrand?: string;
  minPrice?: string;
  maxPrice?: string;
  clearHref: string;
};

export function FilterBar({ action, hidden, brands, selectedBrand, minPrice, maxPrice, clearHref }: FilterBarProps) {
  const hasActiveFilter = Boolean(selectedBrand || minPrice || maxPrice);

  return (
    <form action={action} method="GET" className="panel p-4 mb-5 flex flex-wrap items-end gap-4">
      {Object.entries(hidden).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null
      )}

      {brands.length > 0 && (
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-brand" className="text-xs font-semibold text-[#57606a]">
            Marka
          </label>
          <select id="filter-brand" name="brand" defaultValue={selectedBrand ?? ""} className="input w-40">
            <option value="">Tüm markalar</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-min" className="text-xs font-semibold text-[#57606a]">
          Min. fiyat (₺)
        </label>
        <input
          id="filter-min"
          name="min"
          type="number"
          min={0}
          inputMode="numeric"
          defaultValue={minPrice ?? ""}
          placeholder="0"
          className="input w-28"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-max" className="text-xs font-semibold text-[#57606a]">
          Maks. fiyat (₺)
        </label>
        <input
          id="filter-max"
          name="max"
          type="number"
          min={0}
          inputMode="numeric"
          defaultValue={maxPrice ?? ""}
          placeholder="Sınırsız"
          className="input w-28"
        />
      </div>

      <button type="submit" className="btn btn-blue">
        Filtrele
      </button>

      {hasActiveFilter && (
        <Link href={clearHref} className="text-sm font-semibold text-[#57606a] hover:text-[#0969da] transition-colors">
          Filtreleri temizle
        </Link>
      )}
    </form>
  );
}
