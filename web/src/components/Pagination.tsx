import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Sayfalama" className="mt-8 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className="btn inline-flex items-center gap-1">
          <ChevronLeft size={14} />
          Önceki
        </Link>
      )}
      <span className="px-4 py-2 text-sm text-[#57606a]">
        Sayfa {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Link href={buildHref(page + 1)} className="btn inline-flex items-center gap-1">
          Sonraki
          <ChevronRight size={14} />
        </Link>
      )}
    </nav>
  );
}
